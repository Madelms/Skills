#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rulesDir = path.join(root, 'rules');
const indexPath = path.join(rulesDir, 'INDEX.md');
const required = ['Domain:', '**Severity:**', '**CWE:**', '**OWASP:**', '**Why it matters:**', '**Detect:**', '**Evidence:**', '**Remediation:**', '**Regression test:**', '**False-fix traps:**', '**Version:**'];
const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
const errors = [], warnings = [], rules = [];

for (const file of ruleFiles) {
  const full = path.join(rulesDir, file);
  const text = fs.readFileSync(full, 'utf8');
  const matches = [...text.matchAll(/^##\s+([A-Z]+-\d{3})\s+—\s+(.+)$/gm)];
  for (const m of matches) {
    const start = m.index;
    const next = matches[matches.indexOf(m)+1]?.index ?? text.length;
    const block = text.slice(start, next);
    const id = m[1];
    if (rules.some(r => r.id === id)) errors.push(`Duplicate rule ID: ${id}`);
    for (const field of required) if (!block.includes(field)) errors.push(`${id}: missing ${field}`);
    rules.push({ id, title: m[2], file });
  }
}

if (!rules.length) errors.push('No rules found.');

const index = fs.readFileSync(indexPath, 'utf8');
const indexIds = [...index.matchAll(/^\|\s*([A-Z]+-\d{3})\s*\|/gm)].map(m => m[1]);
const ruleIds = rules.map(r => r.id).sort();
const idxSorted = [...new Set(indexIds)].sort();
for (const id of ruleIds) if (!idxSorted.includes(id)) errors.push(`Rule missing from INDEX.md: ${id}`);
for (const id of idxSorted) if (!ruleIds.includes(id)) errors.push(`INDEX.md references missing rule: ${id}`);
if (indexIds.length !== idxSorted.length) errors.push('INDEX.md contains duplicate rule IDs.');

const allFiles = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory() && f !== '.git') walk(p); else if (/\.(md|js)$/.test(f)) allFiles.push(p);
  }
}
walk(root);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /AKIA[0-9A-Z]{16}/,
  /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{6,}["']/i,
  /(?:api[_-]?key|secret|token)\s*[:=]\s*["'][^"']{12,}["']/i
];
for (const p of allFiles) {
  const t = fs.readFileSync(p, 'utf8');
  for (const rx of secretPatterns) if (rx.test(t)) warnings.push(`Possible secret pattern in ${path.relative(root,p)}`);
}

const versionLine = fs.readFileSync(path.join(root,'SKILL.md'),'utf8').match(/Skill version:\s*([0-9]+\.[0-9]+\.[0-9]+)/);
const changelog = fs.readFileSync(path.join(root,'knowledge','CHANGELOG.md'),'utf8');
if (!versionLine) errors.push('SKILL.md has no semantic Skill version.');
else if (!changelog.includes(`## ${versionLine[1]}`)) errors.push(`CHANGELOG.md does not contain version ${versionLine[1]}.`);

console.log(`Rules found: ${rules.length}`);
console.log(`Rule files: ${ruleFiles.length}`);
console.log(`INDEX entries: ${indexIds.length}`);
if (warnings.length) { console.log('\nWarnings:'); warnings.forEach(x => console.log(`- ${x}`)); }
if (errors.length) { console.error('\nValidation FAILED:'); errors.forEach(x => console.error(`- ${x}`)); process.exit(1); }
console.log('\nValidation PASSED.');
