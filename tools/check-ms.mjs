#!/usr/bin/env node
// Validates the content/ms/words-*.tsv files. Usage: node tools/check-ms.mjs content/ms/words-*.tsv
import { readFileSync } from 'node:fs';

const POS = new Set(['n', 'v', 'adj', 'adv', 'pron', 'prep', 'conj', 'num', 'part', 'intj', 'phrase', 'clf', 'det']);
let failed = false;
for (const file of process.argv.slice(2)) {
  const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim() !== '');
  const seen = new Map();
  const errors = [];
  lines.forEach((line, i) => {
    const n = i + 1;
    const cols = line.split('\t');
    if (cols.length !== 8) { errors.push(`${n}: expected 8 tab-separated columns, got ${cols.length}: ${line.slice(0, 60)}`); return; }
    const [ms, en, pos, tier, root, exMs, exEn, note] = cols.map((c) => c.trim());
    if (!ms) errors.push(`${n}: empty headword`);
    if (!en) errors.push(`${n}: ${ms}: empty english`);
    if (/^to /i.test(en)) errors.push(`${n}: ${ms}: english gloss should not start with "to "`);
    if (!POS.has(pos)) errors.push(`${n}: ${ms}: bad pos "${pos}"`);
    if (!/^[1-6]$/.test(tier)) errors.push(`${n}: ${ms}: tier must be 1-6, got "${tier}"`);
    if (root && root === ms) errors.push(`${n}: ${ms}: root equals headword (leave empty)`);
    if (!exMs || !exEn) errors.push(`${n}: ${ms}: missing example sentence or translation`);
    const norm = (s) => ` ${s.toLowerCase().replace(/[.,!?;:"“”()]/g, ' ').replace(/\s+/g, ' ').trim()} `;
    if (exMs && !norm(exMs).includes(norm(ms))) errors.push(`${n}: ${ms}: example does not contain the headword as a standalone word: "${exMs}"`);
    const words = exMs.split(/\s+/).filter(Boolean).length;
    if (exMs && (words < 2 || words > 9)) errors.push(`${n}: ${ms}: example should be 2-9 words, has ${words}`);
    if (exMs && !/[.!?]$/.test(exMs)) errors.push(`${n}: ${ms}: example needs end punctuation`);
    if (note && note.length > 90) errors.push(`${n}: ${ms}: note too long (${note.length})`);
    const key = ms.toLowerCase();
    if (seen.has(key)) errors.push(`${n}: ${ms}: duplicate headword (first at line ${seen.get(key)})`);
    else seen.set(key, n);
  });
  console.log(`${file}: ${lines.length} entries, ${errors.length} problems`);
  errors.slice(0, 80).forEach((e) => console.log('  ' + e));
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
