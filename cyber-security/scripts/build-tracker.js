#!/usr/bin/env node
/*
 * build-tracker.js - generic, project-agnostic generator for
 * <ProjectName>_Security_Remediation_Tracker.xlsx (cyber-security skill).
 *
 * Content and presentation are separate: the review writes a JSON data file,
 * this script only renders it. It never edits, rewrites or drops finding data.
 *
 * Usage:   node build-tracker.js <data.json> <output.xlsx>
 * Setup:   cd scripts && npm install        (installs exceljs, once)
 *
 * data.json (see references/excel-presentation-standard.md for the full schema):
 * {
 *   "project": "Name", "reviewDate": "YYYY-MM-DD", "branch": "...", "inputMode": "...",
 *   "skillVersion": "x.y.z", "scope": "...", "observed": "...",
 *   "banner": "optional override of the confidential banner",
 *   "summaryNotes": [["Label","Text"], ...],            // optional extra rows on the summary
 *   "findings": [ { "Finding ID": "F-001", "Severity": "Critical", ... } ],  // keys = column headers
 *   "columns": ["Finding ID", ...],                     // optional: column order (default = key order of first finding)
 *   "sheets": [ { "name": "Chains and Root Causes", "headers": [...], "rows": [[...]], "widths": [..optional..] } ]
 * }
 * Extra sheets are rendered in the given order after "Issues Tracker".
 */
const fs = require('fs');
const path = require('path');
let ExcelJS;
try { ExcelJS = require('exceljs'); } catch (e) {
  console.error('exceljs not installed. Run: cd "' + __dirname + '" && npm install'); process.exit(2);
}

// ---------- design tokens ----------
const FONT = 'Calibri';
const C = {
  navy: 'FF1F2A44', navy2: 'FF2D3B5E', white: 'FFFFFFFF', ink: 'FF1F2937', muted: 'FF6B7280',
  line: 'FFD9DEE7', band: 'FFF3F5F9', banner: 'FFFDECEC', bannerInk: 'FF9B1C1C',
};
const SEV = { // fill, font
  Critical: ['FF9B1C1C', 'FFFFFFFF'], High: ['FFE0701A', 'FFFFFFFF'], Medium: ['FFF2C94C', 'FF3D2F00'],
  Low: ['FF4C9A5F', 'FFFFFFFF'], Informational: ['FF3B7DD8', 'FFFFFFFF'],
};
const STAT = { // verification status (begins-with match): fill, font
  'OPEN': ['FFF8D7DA', 'FF9B1C1C'], 'PARTIALLY FIXED': ['FFFDE3CC', 'FF9C4A0B'],
  'NEEDS VERIFICATION': ['FFFFF3C4', 'FF7A5C00'], 'FIXED': ['FFD4EDDA', 'FF1E6B34'],
  'NOT APPLICABLE': ['FFE5E7EB', 'FF4B5563'], 'ACCEPTED RISK': ['FFE5E7EB', 'FF4B5563'],
  'FALSE POSITIVE': ['FFE5E7EB', 'FF4B5563'],
};
const REM = { // remediation status: fill, font
  'Not Started': ['FFE5E7EB', 'FF374151'], 'Planned': ['FFDBEAFE', 'FF1E40AF'],
  'In Progress': ['FFFFF3C4', 'FF7A5C00'], 'Implemented': ['FFD4EDDA', 'FF1E6B34'], 'Blocked': ['FFF8D7DA', 'FF9B1C1C'],
};
const PRI = { P0: ['FF9B1C1C', 'FFFFFFFF'], P1: ['FFE0701A', 'FFFFFFFF'], P2: ['FFF2C94C', 'FF3D2F00'], P3: ['FFE5E7EB', 'FF374151'] };
const SEV_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
const STAT_ORDER = ['OPEN', 'NEEDS VERIFICATION', 'PARTIALLY FIXED', 'FIXED']; // then everything else
const LONG_COLS = /^(description|evidence|security impact|attack scenario|recommendations?|remediation|verification method|verification required|notes|task|end impact|single fix|attack scenario)/i;
const thin = { style: 'thin', color: { argb: C.line } };
const border = { top: thin, left: thin, bottom: thin, right: thin };

// ---------- helpers ----------
const solid = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const cfFill = (argb) => ({ type: 'pattern', pattern: 'solid', bgColor: { argb } });
const colL = (n) => { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
const txt = (v) => (v === null || v === undefined) ? '' : (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
const sevBase = (s) => { const t = txt(s); return SEV_ORDER.find((x) => t.toLowerCase().startsWith(x.toLowerCase())) || (/^info/i.test(t) ? 'Informational' : ''); };
const statBase = (s) => { const t = txt(s).toUpperCase(); return Object.keys(STAT).find((k) => t.startsWith(k)) || ''; };
const sevRank = (s) => { const i = SEV_ORDER.indexOf(sevBase(s)); return i < 0 ? 9 : i; };
const statRank = (s) => { const i = STAT_ORDER.indexOf(statBase(s)); return i < 0 ? 8 : i; };
const idKey = (id) => { const m = txt(id).match(/(\d+)\s*$/); return m ? parseInt(m[1], 10) : 0; };
const isLong = (h) => LONG_COLS.test(h);
const estLines = (s, width) => { // wrapped line estimate at given column width
  const w = Math.max(4, Math.floor(width * (/\S{30,}/.test(txt(s)) ? 0.95 : 1.2))); let n = 0;
  for (const part of txt(s).split('\n')) n += Math.max(1, Math.ceil(part.length / w));
  return n;
};
function colWidth(h, rows, idx) {
  const lens = rows.map((r) => txt(r[idx]).length).sort((a, b) => a - b);
  const p = lens.length ? lens[Math.floor(lens.length * 0.85)] : 0; // 85th percentile: outliers wrap instead of widening
  const long = isLong(h);
  const min = long ? 28 : 10, max = long ? 62 : 36;
  return Math.max(min, Math.min(max, Math.max(txt(h).length + 4, long ? p * 0.5 : p + 2)));
}
function addCF(ws, ref, formula, [fill, font], extra = {}) {
  ws.addConditionalFormatting({ ref, rules: [{ type: 'expression', formulae: [formula], style: { fill: cfFill(fill), font: { color: { argb: font }, bold: true }, ...extra }, priority: 1 }] });
}
function pageSetup(ws, { orientation = 'landscape', paper = 9, titleRows, area, project }) {
  ws.pageSetup = { orientation, paperSize: paper, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
    margins: { left: 0.4, right: 0.4, top: 0.75, bottom: 0.7, header: 0.3, footer: 0.3 } };
  if (titleRows) ws.pageSetup.printTitlesRow = titleRows;
  if (area) ws.pageSetup.printArea = area;
  ws.headerFooter.oddHeader = `&L&"${FONT},Bold"&9${project} - Security Remediation&R&"${FONT},Bold"&9CONFIDENTIAL`;
  ws.headerFooter.oddFooter = `&L&8&A&C&8Contains exploit paths - do not share outside the engagement&R&8Page &P of &N`;
}

// ---------- generic data sheet ----------
function dataSheet(wb, name, headers, rows, o) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1, xSplit: o.freezeCols || 0, showGridLines: false, zoomScale: 100 }], properties: { tabColor: { argb: o.tab || C.navy2 } } });
  const widths = headers.map((h, i) => (o.widths && o.widths[i]) || colWidth(h, rows, i));
  ws.columns = headers.map((h, i) => ({ width: widths[i] }));
  const hr = ws.addRow(headers);
  hr.height = 34;
  hr.eachCell((c) => { c.font = { name: FONT, bold: true, color: { argb: C.white }, size: 11 }; c.fill = solid(C.navy);
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; c.border = { ...border, bottom: { style: 'medium', color: { argb: C.navy2 } } }; });
  rows.forEach((r) => {
    const row = ws.addRow(headers.map((h, i) => (r[i] === undefined ? null : r[i])));
    let lines = 1;
    headers.forEach((h, i) => {
      const c = row.getCell(i + 1);
      const long = isLong(h);
      c.font = { name: FONT, size: 10, color: { argb: C.ink }, bold: /^(finding id|id|chain|root cause|control)$/i.test(h) };
      c.alignment = { vertical: 'top', wrapText: true, horizontal: /severity|priority|^status$|status$|date|id$/i.test(h) && !long ? 'center' : 'left' };
      c.border = border;
      if (/date$/i.test(h)) c.numFmt = 'yyyy-mm-dd';
      lines = Math.max(lines, estLines(r[i], widths[i]));
    });
    row.height = Math.min(300, Math.max(18, lines * 13 + 6));
  });
  const last = rows.length + 1;
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  // conditional formatting by column meaning (works when users edit values later)
  headers.forEach((h, i) => {
    const L = colL(i + 1), ref = `${L}2:${L}${Math.max(last, 2)}`, a = `${L}2`;
    if (/severity$/i.test(h)) SEV_ORDER.forEach((s) => addCF(ws, ref, `LEFT(${a},${s.length})="${s}"`, SEV[s]));
    else if (/^(verification status|current status|status)$/i.test(h) || /^verified:/i.test(h) || /^status$/i.test(h)) {
      if (h === 'Status' && rows.some((r) => REM[txt(r[i])])) Object.keys(REM).forEach((k) => addCF(ws, ref, `${a}="${k}"`, REM[k]));
      else Object.keys(STAT).forEach((k) => addCF(ws, ref, `LEFT(UPPER(${a}),${k.length})="${k}"`, STAT[k]));
    } else if (/^priority$/i.test(h)) Object.keys(PRI).forEach((k) => addCF(ws, ref, `${a}="${k}"`, PRI[k]));
  });
  pageSetup(ws, { titleRows: '1:1', project: o.project, paper: o.paper || 9, area: o.printArea });
  return { ws, widths };
}

// ---------- main ----------
async function build(data, out) {
  const project = data.project || 'Project';
  const f0 = data.findings || [];
  const cols = data.columns || (f0[0] ? Object.keys(f0[0]) : []);
  const need = ['Finding ID', 'Severity', 'Verification Status'];
  need.forEach((n) => { if (!cols.includes(n)) throw new Error('findings must contain column: ' + n); });
  const ix = (n) => cols.indexOf(n);

  // sort: severity -> status -> original Finding ID order. Data itself is untouched.
  const sorted = f0.map((f, i) => ({ f, i })).sort((a, b) =>
    sevRank(a.f.Severity) - sevRank(b.f.Severity) || statRank(a.f['Verification Status']) - statRank(b.f['Verification Status']) || idKey(a.f['Finding ID']) - idKey(b.f['Finding ID']) || a.i - b.i).map((x) => x.f);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Cyber Security skill'; wb.title = project + ' Security Remediation Tracker'; wb.created = new Date();
  const sum = wb.addWorksheet('Report Summary', { views: [{ showGridLines: false }], properties: { tabColor: { argb: C.bannerInk } } });
  const T = 'Issues Tracker';

  // tracker sheet first (to know ranges), reorder after
  const rows = sorted.map((f, k) => [...cols.map((c) => f[c] === undefined ? null : f[c]), sevRank(f.Severity) * 100000 + statRank(f["Verification Status"]) * 10000 + idKey(f["Finding ID"]) + 0 * k]);
  const headers = [...cols, '_SortKey'];
  const lastCol = cols.length;
  const ownerIdx = ix('Owner');
  const { ws: tr } = dataSheet(wb, T, headers, rows, {
    project, freezeCols: Math.max(1, Math.min(3, ix('Task') >= 0 ? ix('Task') + 1 : 1)), tab: C.navy,
    printArea: `A:${colL(ownerIdx >= 0 ? ownerIdx + 1 : Math.min(lastCol, 17))}`,
    paper: 8, // A3
  });
  tr.getColumn(lastCol + 1).hidden = true; // internal numeric sort helper, not exposed
  tr.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: lastCol } };
  const n = rows.length, last = Math.max(n + 1, 2);
  // remediation status validation + overdue highlighting
  const iSt = ix('Status'), iEnd = ix('EndDate'), iOw = ix('Owner'), iDesc = ix('Recommendations');
  if (iSt >= 0) tr.dataValidations.add(`${colL(iSt + 1)}2:${colL(iSt + 1)}${last + 200}`, { type: 'list', allowBlank: true, formulae: ['"Not Started,Planned,In Progress,Implemented,Blocked"'] });
  if (iEnd >= 0 && iSt >= 0) addCF(tr, `${colL(iEnd + 1)}2:${colL(iEnd + 1)}${last + 200}`, `AND(ISNUMBER(${colL(iEnd + 1)}2),${colL(iEnd + 1)}2<TODAY(),${colL(iSt + 1)}2<>"Implemented")`, ['FFF8D7DA', 'FF9B1C1C']);
  void iOw; void iDesc;
  // Critical/High finding-ID accent
  addCF(tr, `A2:A${last}`, `OR(LEFT($${colL(ix('Severity') + 1)}2,8)="Critical",LEFT($${colL(ix('Severity') + 1)}2,4)="High")`, ['FFF3F5F9', 'FF9B1C1C']);

  // ----- Executive summary -----
  const SC = colL(ix('Severity') + 1), VC = colL(ix('Verification Status') + 1), RC = iSt >= 0 ? colL(iSt + 1) : null;
  const rng = (L) => `'${T}'!$${L}$2:$${L}$${last}`;
  const cnt = (L, pat) => ({ formula: `COUNTIF(${rng(L)},"${pat}*")` });
  const sevCount = (s) => f0.filter((f) => sevBase(f.Severity) === s).length;
  const statCount = (k) => f0.filter((f) => statBase(f['Verification Status']) === k).length;
  const open = f0.filter((f) => !['FIXED', 'NOT APPLICABLE', 'ACCEPTED RISK', 'FALSE POSITIVE'].includes(statBase(f['Verification Status'])));
  const critHighOpen = open.filter((f) => ['Critical', 'High'].includes(sevBase(f.Severity)));
  const nCrit = sevCount('Critical'), nHigh = sevCount('High');
  const posture = (() => {
    const oc = open.filter((f) => sevBase(f.Severity) === 'Critical').length, oh = open.filter((f) => sevBase(f.Severity) === 'High').length;
    if (oc) return ['CRITICAL RISK', ...SEV.Critical]; if (oh) return ['HIGH RISK', ...SEV.High];
    if (open.some((f) => sevBase(f.Severity) === 'Medium')) return ['MODERATE RISK', ...SEV.Medium];
    return ['LOW RISK', ...SEV.Low];
  })();
  const W = 12; sum.columns = Array.from({ length: W }, () => ({ width: 15 }));
  const merge = (r1, c1, r2, c2) => sum.mergeCells(r1, c1, r2, c2);
  const put = (r, c, v, st = {}) => { const cell = sum.getCell(r, c); cell.value = v; Object.assign(cell, {}); if (st.font) cell.font = { name: FONT, ...st.font }; if (st.fill) cell.fill = solid(st.fill); if (st.align) cell.alignment = st.align; if (st.border) cell.border = st.border; if (st.numFmt) cell.numFmt = st.numFmt; return cell; };
  const paintRange = (r1, c1, r2, c2, fill) => { for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) sum.getCell(r, c).fill = solid(fill); };

  paintRange(1, 1, 3, W, C.navy); merge(1, 1, 1, W); merge(2, 1, 2, W);
  put(1, 1, txt(project).toUpperCase(), { font: { size: 12, bold: true, color: { argb: 'FFB8C2DB' } }, align: { vertical: 'middle', indent: 1 } });
  put(2, 1, 'SECURITY REMEDIATION OVERVIEW', { font: { size: 22, bold: true, color: { argb: C.white } }, align: { vertical: 'middle', indent: 1 } });
  merge(3, 1, 3, W);
  put(3, 1, `Review date ${txt(data.reviewDate)}   |   ${txt(data.branch).split(/[(+]/)[0].trim()}   |   ${txt(data.inputMode).split(/[:(]/)[0].trim()}   |   Cyber Security skill v${txt(data.skillVersion)}`, { font: { size: 10, color: { argb: 'FFB8C2DB' } }, align: { vertical: 'middle', indent: 1 } });
  sum.getRow(1).height = 22; sum.getRow(2).height = 36; sum.getRow(3).height = 20;
  merge(4, 1, 4, W);
  put(4, 1, data.banner || 'CONFIDENTIAL: contains exploit paths and secret locations. Do not share outside the engagement. No secret values are reproduced; see file:line.', { font: { size: 9, bold: true, color: { argb: C.bannerInk } }, fill: C.banner, align: { vertical: 'middle', indent: 1 } });
  sum.getRow(4).height = 20;

  let r = 6;
  const sectionTitle = (row, c1, c2, label) => { merge(row, c1, row, c2); put(row, c1, label.toUpperCase(), { font: { size: 11, bold: true, color: { argb: C.navy } }, align: { vertical: 'middle' }, border: { bottom: { style: 'medium', color: { argb: C.navy } } } }); for (let c = c1; c <= c2; c++) sum.getCell(row, c).border = { bottom: { style: 'medium', color: { argb: C.navy } } }; sum.getRow(row).height = 22; };

  // posture + KPI cards
  sectionTitle(r, 1, W, 'Overall security posture'); r++;
  merge(r, 1, r, 3); put(r, 1, posture[0], { font: { size: 16, bold: true, color: { argb: posture[2] } }, fill: posture[1], align: { horizontal: 'center', vertical: 'middle' } });
  merge(r, 4, r, W);
  put(r, 4, `${open.length} of ${f0.length} findings not yet fixed; ${critHighOpen.length} Critical/High still open or unverified. Posture is derived from the highest unfixed severity.`, { font: { size: 10, color: { argb: C.ink } }, align: { vertical: 'middle', wrapText: true, indent: 1 } });
  sum.getRow(r).height = 34; r += 2;

  const card = (row, col, label, value, [fill, font], result) => {
    merge(row, col, row, col + 1); merge(row + 1, col, row + 1, col + 1);
    put(row, col, label.toUpperCase(), { font: { size: 9, bold: true, color: { argb: font } }, fill, align: { horizontal: 'center', vertical: 'middle' } });
    sum.getCell(row, col + 1).fill = solid(fill);
    put(row + 1, col, typeof value === 'object' ? { ...value, result } : value, { font: { size: 26, bold: true, color: { argb: fill === 'FFF2C94C' ? 'FF7A5C00' : fill } }, fill: C.band, align: { horizontal: 'center', vertical: 'middle' } });
    sum.getCell(row + 1, col + 1).fill = solid(C.band);
  };
  sectionTitle(r, 1, W, 'Findings by severity'); r++;
  card(r, 1, 'Total findings', { formula: `COUNTA(${rng('A')})` }, [C.navy, C.white], f0.length);
  [['Critical'], ['High'], ['Medium'], ['Low'], ['Informational']].forEach(([s], i) => card(r, 3 + i * 2, s === 'Informational' ? 'Info' : s, cnt(SC, s), SEV[s], sevCount(s)));
  sum.getRow(r).height = 20; sum.getRow(r + 1).height = 46; r += 3;
  sectionTitle(r, 1, W, 'Findings by verification status'); r++;
  const kpi = [['Open', 'OPEN', STAT.OPEN, ['FF9B1C1C', 'FFFFFFFF']], ['Partially fixed', 'PARTIALLY FIXED', STAT['PARTIALLY FIXED'], ['FFE0701A', 'FFFFFFFF']], ['Needs verification', 'NEEDS VERIFICATION', STAT['NEEDS VERIFICATION'], ['FFB7791F', 'FFFFFFFF']], ['Fixed', 'FIXED', STAT.FIXED, ['FF1E7B3A', 'FFFFFFFF']]];
  kpi.forEach(([lab, key, , col], i) => card(r, 1 + i * 2, lab, cnt(VC, key), col, statCount(key)));
  const other = f0.length - kpi.reduce((a, k) => a + statCount(k[1]), 0);
  card(r, 9, 'Other / N/A', { formula: `COUNTA(${rng('A')})-SUM(${[...kpi.map((k) => `COUNTIF(${rng(VC)},"${k[1]}*")`)].join(',')})` }, ['FF6B7280', C.white], other);
  card(r, 11, 'Open Critical+High', null, ['FF9B1C1C', C.white], critHighOpen.length);
  sum.getCell(r + 1, 11).value = critHighOpen.length; // static (depends on two columns jointly)
  sum.getRow(r).height = 20; sum.getRow(r + 1).height = 46; r += 3;

  // distributions with in-cell data bars
  const distTable = (row, c0, title, items, colRef, pats) => {
    sectionTitle(row, c0, c0 + 5, title);
    ['Label', 'Count', '% of total'].forEach((h, i) => { const col = i === 0 ? c0 : i === 1 ? c0 + 3 : c0 + 4; if (i === 0) merge(row + 1, c0, row + 1, c0 + 2); put(row + 1, col, h, { font: { size: 10, bold: true, color: { argb: C.white } }, fill: C.navy, align: { horizontal: i ? 'center' : 'left', vertical: 'middle', indent: i ? 0 : 1 } }); });
    merge(row + 1, c0 + 4, row + 1, c0 + 5); sum.getCell(row + 1, c0 + 5).fill = solid(C.navy);
    items.forEach((it, i) => {
      const rr = row + 2 + i; merge(rr, c0, rr, c0 + 2); merge(rr, c0 + 4, rr, c0 + 5);
      put(rr, c0, it.label, { font: { size: 10, bold: true, color: { argb: it.font } }, fill: it.fill, align: { vertical: 'middle', indent: 1 }, border });
      sum.getCell(rr, c0 + 1).fill = solid(it.fill); sum.getCell(rr, c0 + 2).fill = solid(it.fill);
      put(rr, c0 + 3, { formula: `COUNTIF(${colRef},"${pats[i]}*")`, result: it.n }, { font: { size: 11, bold: true, color: { argb: C.ink } }, align: { horizontal: 'center', vertical: 'middle' }, border });
      put(rr, c0 + 4, { formula: `IF(COUNTA(${rng('A')})=0,0,${colL(c0 + 3)}${rr}/COUNTA(${rng('A')}))`, result: f0.length ? it.n / f0.length : 0 }, { font: { size: 10, color: { argb: C.muted } }, align: { horizontal: 'center', vertical: 'middle' }, border, numFmt: '0%' });
      sum.getRow(rr).height = 21;
    });
    const a = `${colL(c0 + 3)}${row + 2}:${colL(c0 + 3)}${row + 1 + items.length}`;
    sum.addConditionalFormatting({ ref: a, rules: [{ type: 'dataBar', priority: 1, cfvo: [{ type: 'num', value: 0 }, { type: 'max' }], color: { argb: 'FF8FA3C7' }, gradient: false }] });
  };
  const sevItems = SEV_ORDER.map((s) => ({ label: s, fill: SEV[s][0], font: SEV[s][1], n: sevCount(s) }));
  const stItems = [['OPEN', 'Open'], ['NEEDS VERIFICATION', 'Needs verification'], ['PARTIALLY FIXED', 'Partially fixed'], ['FIXED', 'Fixed'], ['NOT APPLICABLE', 'Not applicable']].map(([k, l]) => ({ label: l, fill: STAT[k][0], font: STAT[k][1], n: statCount(k) }));
  distTable(r, 1, 'Severity distribution', sevItems, rng(SC), SEV_ORDER);
  distTable(r, 7, 'Status distribution', stItems, rng(VC), ['OPEN', 'NEEDS VERIFICATION', 'PARTIALLY FIXED', 'FIXED', 'NOT APPLICABLE']);
  r += 2 + Math.max(sevItems.length, stItems.length) + 1;

  // Mode 2 source breakdown (only when the data has it)
  const iSrc = ix('Discovery Source');
  if (iSrc >= 0) {
    sectionTitle(r, 1, W, 'Findings by discovery source'); r++;
    const srcs = [...new Set(f0.map((f) => txt(f['Discovery Source'])))];
    const hdr = ['Source', 'Total', ...SEV_ORDER.map((s) => (s === 'Informational' ? 'Info' : s))];
    let c = 1; hdr.forEach((h, i) => { const w = i === 0 ? 4 : 1; if (w > 1) merge(r, c, r, c + w - 1); put(r, c, h, { font: { size: 10, bold: true, color: { argb: C.white } }, fill: C.navy, align: { horizontal: 'center', vertical: 'middle' } }); for (let k = c; k < c + w; k++) sum.getCell(r, k).fill = solid(C.navy); c += w; });
    srcs.forEach((s, j) => { const rr = r + 1 + j; c = 1; merge(rr, 1, rr, 4); put(rr, 1, s, { font: { size: 10, bold: true }, align: { indent: 1 }, border }); c = 5; const sub = f0.filter((f) => txt(f['Discovery Source']) === s);
      [sub.length, ...SEV_ORDER.map((x) => sub.filter((f) => sevBase(f.Severity) === x).length)].forEach((v, k) => put(rr, c + k, v, { font: { size: 10 }, align: { horizontal: 'center' }, border })); });
    r += srcs.length + 2;
  }

  // Priority findings
  sectionTitle(r, 1, W, 'Priority findings (Critical / High not yet fixed)'); r++;
  const ph = [['Finding', 1, 1], ['Task', 2, 6], ['Severity', 7, 7], ['Verification status', 8, 10], ['Priority', 11, 11], ['Owner', 12, 12]];
  ph.forEach(([h, a, b]) => { if (b > a) merge(r, a, r, b); for (let k = a; k <= b; k++) sum.getCell(r, k).fill = solid(C.navy); put(r, a, h, { font: { size: 10, bold: true, color: { argb: C.white } }, align: { horizontal: 'center', vertical: 'middle' } }); });
  sum.getRow(r).height = 22; r++;
  const top = sorted.filter((f) => critHighOpen.includes(f)).slice(0, 12);
  const taskCol = f0[0] && 'Task' in f0[0] ? 'Task' : (cols.find((c) => /task|title/i.test(c)) || cols[1]);
  const pr0 = r;
  top.forEach((f) => {
    ph.forEach(([h, a, b]) => { if (b > a) merge(r, a, r, b); for (let k = a; k <= b; k++) sum.getCell(r, k).border = border; });
    const vals = [f['Finding ID'], f[taskCol], f.Severity, f['Verification Status'], f.Priority || '', f.Owner || ''];
    ph.forEach(([h, a], k) => put(r, a, vals[k], { font: { size: 10, bold: k === 0 }, align: { vertical: 'middle', wrapText: true, horizontal: k === 1 || k === 3 ? 'left' : 'center', indent: k === 1 || k === 3 ? 1 : 0 }, border }));
    sum.getRow(r).height = Math.max(20, estLines(vals[1], 6 * 15) * 13.5 + 6, estLines(vals[3], 3 * 15) * 13.5 + 6); r++;
  });
  if (top.length) {
    const sRef = `G${pr0}:G${r - 1}`; SEV_ORDER.forEach((s) => addCF(sum, sRef, `LEFT(G${pr0},${s.length})="${s}"`, SEV[s]));
    const vRef = `H${pr0}:H${r - 1}`; Object.keys(STAT).forEach((k) => addCF(sum, vRef, `LEFT(UPPER(H${pr0}),${k.length})="${k}"`, STAT[k]));
    sum.addConditionalFormatting({ ref: `K${pr0}:K${r - 1}`, rules: Object.keys(PRI).map((k, i) => ({ type: 'expression', formulae: [`K${pr0}="${k}"`], style: { fill: cfFill(PRI[k][0]), font: { color: { argb: PRI[k][1] }, bold: true } }, priority: i + 1 })) });
  } else { merge(r, 1, r, W); put(r, 1, 'No open Critical/High findings.', { font: { italic: true, color: { argb: C.muted } }, align: { indent: 1 } }); r++; }
  r++;

  // scope / meta + notes (verbatim from input)
  const notes = [['Project', data.project], ['Review date', data.reviewDate], ['Branch / commit', data.branch], ['Input mode', data.inputMode], ['Skill version', data.skillVersion], ['Scope', data.scope], ['What was observed', data.observed], ...(data.summaryNotes || [])].filter(([, v]) => v !== undefined && v !== null && v !== '');
  sectionTitle(r, 1, W, 'Scope and notes'); r++;
  notes.forEach(([k, v], i) => {
    merge(r, 1, r, 2); merge(r, 3, r, W);
    put(r, 1, k, { font: { size: 10, bold: true, color: { argb: C.navy } }, fill: C.band, align: { vertical: 'top', wrapText: true, indent: 1 }, border });
    sum.getCell(r, 2).fill = solid(C.band);
    put(r, 3, v, { font: { size: 10, color: { argb: C.ink } }, align: { vertical: 'top', wrapText: true, indent: 1 }, border });
    sum.getRow(r).height = Math.max(20, estLines(v, 10 * 15) * 13.5 + 6); r++;
  });
  sum.pageSetup = { orientation: 'portrait', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.4, right: 0.4, top: 0.75, bottom: 0.7, header: 0.3, footer: 0.3 } };
  sum.headerFooter.oddHeader = `&L&"${FONT},Bold"&9${project} - Security Remediation&R&"${FONT},Bold"&9CONFIDENTIAL`;
  sum.headerFooter.oddFooter = '&L&8&A&C&8Contains exploit paths - do not share outside the engagement&R&8Page &P of &N';
  wb.views = [{ activeTab: 0 }];

  // extra sheets, verbatim
  for (const s of data.sheets || []) {
    const isKV = s.headers.length === 2 && /^item$/i.test(s.headers[0]);
    dataSheet(wb, s.name, s.headers, s.rows, { project, widths: s.widths, tab: C.muted, freezeCols: 0, paper: 9, ...(isKV ? { widths: [26, 90] } : {}) });
  }
  // sheet order: summary, tracker, extras (already in creation order apart from summary first)
  wb.worksheets.sort ? null : null;
  await wb.xlsx.writeFile(out);
}

if (require.main === module) {
  const [, , inp, out] = process.argv;
  if (!inp || !out) { console.error('Usage: node build-tracker.js <data.json> <output.xlsx>'); process.exit(1); }
  build(JSON.parse(fs.readFileSync(inp, 'utf8')), out).then(() => console.log('Wrote ' + path.resolve(out)), (e) => { console.error(e); process.exit(1); });
}
module.exports = { build };
