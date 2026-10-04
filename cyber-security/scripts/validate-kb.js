#!/usr/bin/env node
// Knowledge-base validator for the Cyber Security skill (layer A: KB integrity).
// Usage: node scripts/validate-kb.js [--write-index]
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rulesDir = path.join(root, 'rules');
const indexPath = path.join(rulesDir, 'INDEX.md');
const WRITE_INDEX = process.argv.includes('--write-index');

// Prefix -> rule file. One table, one source of truth.
const PREFIX_FILE = {
  AUTHN: 'authn.md', AUTHZ: 'authz-idor.md', API: 'api-mass-assignment.md', INPUT: 'input-validation.md',
  FILE: 'files-storage.md', SECRET: 'secrets-config.md', DATA: 'data-protection.md', DB: 'database.md',
  FE: 'frontend.md', BIZ: 'business-logic.md', LOG: 'logging-monitoring.md', PLAT: 'platform-deployment.md'
};
const PREFIXES = Object.keys(PREFIX_FILE);
const ID_RE = '(?:' + PREFIXES.join('|') + ')-\\d{3}';

const REQUIRED = ['Domain', 'Severity', 'CWE', 'OWASP', 'Why it matters', 'Detect', 'Evidence', 'Remediation',
  'Regression test', 'False-fix traps', 'False positives', 'Provenance', 'Version'];
const OPTIONAL = ['Chains with', 'Status', 'Keywords'];

const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);
const read = p => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// ---------- collect files ----------
const allFiles = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) { if (f !== '.git' && f !== 'node_modules') walk(p); }
    else if (/\.(md|js|json|example)$/.test(f) || f === '.gitignore') allFiles.push(p);
  }
})(root);
const rel = p => path.relative(root, p).split(path.sep).join('/');

// ---------- parse rules ----------
const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
const rules = [];
for (const file of ruleFiles) {
  if (!Object.values(PREFIX_FILE).includes(file)) err(`Rule file not in prefix map: rules/${file}`);
  const text = read(path.join(rulesDir, file));
  for (const h of text.matchAll(/^##\s+([A-Z]+-\d+)\b.*$/gm)) {
    if (!/^##\s+[A-Z]+-\d{3}\s+—\s+\S/.test(h[0])) err(`${file}: malformed rule heading "${h[0]}"`);
  }
  const ms = [...text.matchAll(/^##\s+([A-Z]+-\d{3})\s+—\s+(.+)$/gm)];
  ms.forEach((m, i) => {
    const block = text.slice(m.index, ms[i + 1] ? ms[i + 1].index : text.length);
    const fields = {};
    for (const fm of block.matchAll(/^\*\*([A-Za-z][A-Za-z -]*?):\*\*[ \t]*(.*?)[ \t]*$/gm)) {
      if (fields[fm[1]] !== undefined) err(`${m[1]}: duplicate field ${fm[1]}`);
      fields[fm[1]] = fm[2];
    }
    const id = m[1];
    const prefix = id.split('-')[0];
    if (!PREFIX_FILE[prefix]) err(`${id}: unknown prefix ${prefix}`);
    else if (PREFIX_FILE[prefix] !== file) err(`${id}: prefix ${prefix} must live in rules/${PREFIX_FILE[prefix]}, found in rules/${file}`);
    for (const f of REQUIRED) if (!fields[f]) err(`${id}: missing or empty field **${f}:**`);
    for (const f of Object.keys(fields)) if (!REQUIRED.includes(f) && !OPTIONAL.includes(f)) warn(`${id}: unknown field **${f}:**`);
    rules.push({ id, title: m[2].trim(), file, fields, block });
  });
}
if (!rules.length) err('No rules found.');
const byId = new Map();
for (const r of rules) {
  if (byId.has(r.id)) err(`Duplicate rule ID: ${r.id}`);
  byId.set(r.id, r);
}
const isDeprecated = id => /deprecated/i.test((byId.get(id) || { fields: {} }).fields.Status || '');

// ---------- SOURCES / provenance ----------
const sourcesText = read(path.join(root, 'knowledge', 'SOURCES.md'));
const sourceIds = [...sourcesText.matchAll(/^\|\s*(SRC-\d{3})\s*\|/gm)].map(m => m[1]);
if (new Set(sourceIds).size !== sourceIds.length) err('SOURCES.md contains duplicate source IDs.');
const changelog = read(path.join(root, 'knowledge', 'CHANGELOG.md'));
const citedSources = new Set();
for (const r of rules) {
  const prov = r.fields.Provenance || '';
  const ids = prov.match(/SRC-\d{3}/g) || [];
  if (!ids.length) err(`${r.id}: Provenance cites no source ID`);
  if (prov.replace(/SRC-\d{3}/g, '').replace(/[,;\s]/g, '')) err(`${r.id}: Provenance must contain only SRC IDs, got "${prov}"`);
  for (const s of ids) { citedSources.add(s); if (!sourceIds.includes(s)) err(`${r.id}: Provenance cites unknown source ${s}`); }
}
for (const m of changelog.matchAll(/SRC-\d{3}/g)) citedSources.add(m[0]);
for (const s of sourceIds) if (!citedSources.has(s)) warn(`Source ${s} is not cited by any rule or changelog entry`);

// ---------- Chains with and rule cross-references ----------
for (const r of rules) {
  const chains = (r.fields['Chains with'] || '').split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
  for (const c of chains) {
    if (!new RegExp(`^${ID_RE}$`).test(c)) err(`${r.id}: Chains with has malformed ID "${c}"`);
    else if (!byId.has(c)) err(`${r.id}: Chains with references missing rule ${c}`);
    else if (isDeprecated(c)) err(`${r.id}: Chains with references deprecated rule ${c}`);
    else if (c === r.id) err(`${r.id}: Chains with references itself`);
  }
  const body = r.block.split('\n').slice(1).join('\n');
  for (const m of body.matchAll(new RegExp(`\\b(${ID_RE})\\b`, 'g'))) {
    if (m[1] === r.id) continue;
    if (!byId.has(m[1])) err(`${r.id}: text references missing rule ${m[1]}`);
  }
}

// ---------- INDEX ----------
const ROW_RE = /^\|\s*([A-Z]+-\d{3})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|$/gm;
const oldIndex = fs.existsSync(indexPath) ? read(indexPath) : '';
const oldRows = {};
for (const m of oldIndex.matchAll(ROW_RE)) oldRows[m[1]] = { keywords: m[5] };
const sorted = [...rules].sort((a, b) => PREFIXES.indexOf(a.id.split('-')[0]) - PREFIXES.indexOf(b.id.split('-')[0]) || a.id.localeCompare(b.id));
const kwOf = r => r.fields.Keywords || (oldRows[r.id] && oldRows[r.id].keywords) || '';
if (WRITE_INDEX) {
  const lines = ['# Rule Index', '', '| ID | Title | Domain | Severity | Keywords |', '|---|---|---|---|---|'];
  for (const r of sorted) {
    if (!kwOf(r)) warn(`${r.id}: no keywords for INDEX (add **Keywords:** to the rule)`);
    lines.push(`| ${r.id} | ${r.title} | ${r.fields.Domain} | ${r.fields.Severity} | ${kwOf(r)} |`);
  }
  fs.writeFileSync(indexPath, lines.join('\n') + '\n', 'utf8');
  console.log(`INDEX.md regenerated with ${sorted.length} rows.`);
}
const idxRows = [...read(indexPath).matchAll(ROW_RE)].map(m => ({ id: m[1], title: m[2], domain: m[3], severity: m[4] }));
const idxIds = idxRows.map(r => r.id);
if (idxIds.length !== new Set(idxIds).size) err('INDEX.md contains duplicate rule IDs.');
for (const r of rules) {
  const row = idxRows.find(x => x.id === r.id);
  if (!row) { err(`Rule missing from INDEX.md: ${r.id}`); continue; }
  if (row.title !== r.title) err(`${r.id}: INDEX title differs from rule title`);
  if (row.domain !== r.fields.Domain) err(`${r.id}: INDEX domain "${row.domain}" differs from rule domain "${r.fields.Domain}"`);
  if (row.severity !== r.fields.Severity) err(`${r.id}: INDEX severity "${row.severity}" differs from rule severity "${r.fields.Severity}"`);
}
for (const id of idxIds) if (!byId.has(id)) err(`INDEX.md references missing rule: ${id}`);

// ---------- documentation references ----------
// Lines that are illustrative (e.g. "e.g.", "example", or an explicit marker) are exempt from rule-ID resolution.
const ILLUSTRATIVE = /\be\.g\.|\bexamples?\b|\billustrat|<!--\s*illustrative\s*-->/i;
const exists = ref => {
  if (!ref.includes('*')) return fs.existsSync(path.join(root, ref));
  const dir = path.dirname(ref), base = path.basename(ref);
  const rx = new RegExp('^' + base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return fs.existsSync(path.join(root, dir)) && fs.readdirSync(path.join(root, dir)).some(f => rx.test(f));
};
const PATH_RE = /(?<![\w/.-])((?:rules|references|scripts|knowledge)\/[A-Za-z0-9_./*<>{},-]+\.(?:md|js|json))/g;
for (const p of allFiles.filter(f => /\.(md|js)$/.test(f))) {
  const isRule = rel(p).startsWith('rules/') && rel(p) !== 'rules/INDEX.md';
  read(p).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(PATH_RE)) {
      const ref = m[1].replace(/[.,]$/, '');
      if (/[<>{}]/.test(ref)) continue; // placeholders such as references/stacks/<stack>.md
      if (!exists(ref)) err(`${rel(p)}:${i + 1}: broken file reference "${ref}"`);
    }
    if (!isRule && /\.md$/.test(p) && !ILLUSTRATIVE.test(line)) {
      for (const m of line.matchAll(new RegExp(`\\b(${ID_RE})\\b`, 'g'))) {
        if (!byId.has(m[1])) err(`${rel(p)}:${i + 1}: references missing rule ${m[1]}`);
      }
    }
  });
}

// ---------- version consistency ----------
const skillMd = read(path.join(root, 'SKILL.md'));
const vm = skillMd.match(/Skill version:\s*\**\s*([0-9]+\.[0-9]+\.[0-9]+)/);
const topChange = changelog.match(/^##\s+([0-9]+\.[0-9]+\.[0-9]+)/m);
const cmp = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i]; return 0; };
if (!vm) err('SKILL.md has no semantic "Skill version: X.Y.Z".');
else {
  if (!topChange) err('CHANGELOG.md has no version entry.');
  else if (topChange[1] !== vm[1]) err(`SKILL.md version ${vm[1]} differs from top CHANGELOG entry ${topChange[1]}.`);
  for (const r of rules) {
    const v = r.fields.Version;
    if (!/^\d+\.\d+\.\d+$/.test(v || '')) err(`${r.id}: Version "${v}" is not semantic`);
    else {
      if (cmp(v, vm[1]) > 0) err(`${r.id}: Version ${v} is newer than the skill version ${vm[1]}`);
      if (!changelog.includes(`## ${v}`)) err(`${r.id}: Version ${v} has no CHANGELOG entry`);
    }
  }
}
const readmeV = read(path.join(root, 'README.md')).match(/Skill version:\s*\**\s*([0-9.]+)/);
if (readmeV && vm && readmeV[1] !== vm[1]) err(`README.md version ${readmeV[1]} differs from SKILL.md ${vm[1]}.`);

// ---------- VT-NN uniqueness ----------
const verifyPath = path.join(root, 'references', 'workflow-verify.md');
if (fs.existsSync(verifyPath)) {
  const vts = [...read(verifyPath).matchAll(/^\s*-\s+\*\*(VT-\d{2})\b/gm)].map(m => m[1]);
  const seen = new Set();
  for (const v of vts) { if (seen.has(v)) err(`Duplicate verification trap ID ${v} in workflow-verify.md`); seen.add(v); }
  if (!vts.length) err('workflow-verify.md defines no VT-NN traps.');
} else err('references/workflow-verify.md is missing.');

// ---------- near-duplicate warnings ----------
const tok = s => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2));
const jac = (a, b) => { const i = [...a].filter(x => b.has(x)).length; return i / (a.size + b.size - i || 1); };
for (let i = 0; i < rules.length; i++) for (let j = i + 1; j < rules.length; j++) {
  const a = rules[i], b = rules[j];
  const t = jac(tok(a.title), tok(b.title));
  if (t >= 0.75) warn(`Near-duplicate titles (${t.toFixed(2)}): ${a.id} / ${b.id}`);
  const cwa = new Set(a.fields.CWE.match(/CWE-\d+/g) || []), cwb = new Set(b.fields.CWE.match(/CWE-\d+/g) || []);
  if ([...cwa].some(c => cwb.has(c)) && a.fields.Domain === b.fields.Domain) {
    const ka = tok(kwOf(a)), kb = tok(kwOf(b));
    if (ka.size && kb.size && jac(ka, kb) >= 0.6) warn(`Same CWE + domain + keyword overlap ${jac(ka, kb).toFixed(2)}: ${a.id} / ${b.id}`);
  }
}

// ---------- confidentiality scan ----------
const SECRET_SHAPES = [
  [/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, 'private key block', true],
  [/\bAKIA[0-9A-Z]{16}\b/, 'cloud access key shape', true],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/, 'JWT-shaped string', true],
  [/\bAIza[0-9A-Za-z_-]{20,}/, 'API key shape', true],
  [/(?:Server|Data Source|Host)=[^;\s]+;[^\n]*(?:Password|Pwd)=[^;\s]+/i, 'connection-string shape', true],
  [/(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{6,}["']/i, 'hard-coded password', true],
  [/(?:api[_-]?key|secret|token)\s*[:=]\s*["'][^"']{12,}["']/i, 'hard-coded secret/token', true],
  [/\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/, 'private IPv4 address', true],
  [/\b(?!0\.0\.0\.0\b)(?:\d{1,3}\.){3}\d{1,3}\b/, 'IPv4-like string', false]
];
const URL_ALLOW = /^(?:[a-z0-9-]+\.)*(?:owasp\.org|cwe\.mitre\.org|nist\.gov|example\.com|example\.org|localhost|claude\.com|anthropic\.com)$|\.test$|\.example$/i;
const denyPath = path.join(root, '.kb-denylist');
const deny = fs.existsSync(denyPath) ? read(denyPath).split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')) : [];
for (const p of allFiles) {
  if (rel(p) === 'scripts/validate-kb.js') continue;
  read(p).split('\n').forEach((line, i) => {
    for (const [rx, what, isError] of SECRET_SHAPES) {
      if (rx.test(line)) { (isError ? err : warn)(`${rel(p)}:${i + 1}: possible ${what}`); break; }
    }
    for (const m of line.matchAll(/https?:\/\/([^\s/)"'>`]+)/gi)) {
      const host = m[1].replace(/:\d+$/, '');
      if (!URL_ALLOW.test(host)) warn(`${rel(p)}:${i + 1}: URL host outside allowlist (${host})`);
    }
    for (const term of deny) if (line.toLowerCase().includes(term.toLowerCase())) err(`${rel(p)}:${i + 1}: contains a denylisted term`);
  });
}
if (!deny.length) warn('No .kb-denylist found: the local project-term scan was skipped (copy .kb-denylist.example to .kb-denylist and fill it on your machine).');

// ---------- report ----------
console.log(`Rules found: ${rules.length}`);
console.log(`Rule files: ${ruleFiles.length}`);
console.log(`INDEX entries: ${idxRows.length}`);
console.log(`Sources: ${sourceIds.length}`);
if (warnings.length) { console.log('\nWarnings:'); warnings.forEach(x => console.log(`- ${x}`)); }
if (errors.length) { console.error('\nValidation FAILED:'); errors.forEach(x => console.error(`- ${x}`)); process.exit(1); }
console.log('\nValidation PASSED.');
