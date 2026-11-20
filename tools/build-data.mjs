#!/usr/bin/env node
// Merges content/words-*.tsv, ranks the entries by real-world frequency, keeps the
// top TARGET words and writes js/data/words.js.
//
//   node tools/build-data.mjs            build
//   node tools/build-data.mjs --report   build and print diagnostics
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = 1500;
const REPORT = process.argv.includes('--report');

// ---- frequency corpus (OpenSubtitles 2018, via hermitdave/FrequencyWords) ----
const freq = new Map();
let corpusTotal = 0;
for (const line of readFileSync(join(ROOT, 'content/frequency/ms_50k.txt'), 'utf8').split('\n')) {
  const [w, c] = line.trim().split(' ');
  if (!w || !c) continue;
  freq.set(w, Number(c));
  corpusTotal += Number(c);
}

// ---- read entries ----
const files = readdirSync(join(ROOT, 'content')).filter((f) => /^words-.*\.tsv$/.test(f)).sort();
const byMs = new Map();
const merged = [];
for (const f of files) {
  const lines = readFileSync(join(ROOT, 'content', f), 'utf8').split('\n').filter((l) => l.trim());
  for (const line of lines) {
    const c = line.split('\t').map((x) => x.trim());
    if (c.length !== 8) throw new Error(`${f}: bad column count: ${line}`);
    const e = { ms: c[0], en: c[1].split(/\s*;\s*/).filter(Boolean), pos: c[2], tier: Number(c[3]), root: c[4], exMs: c[5], exEn: c[6], note: c[7], src: f };
    const key = e.ms.toLowerCase();
    const prev = byMs.get(key);
    if (prev) {
      // Same headword from two slices: keep the more frequent reading first, merge the glosses.
      // The ordinary word outranks its use as a counting word (orang: person, not classifier).
      const [a, b] = prev.pos === 'clf' && e.pos !== 'clf' ? [e, prev] : e.pos === 'clf' && prev.pos !== 'clf' ? [prev, e] : prev.tier <= e.tier ? [prev, e] : [e, prev];
      const bare = (g) => g.toLowerCase().replace(/\([^)]*\)/g, '').trim();
      const seen = new Set(a.en.map(bare));
      const extra = b.en.filter((g) => bare(g) && !seen.has(bare(g)) && seen.add(bare(g)));
      const m = { ...a, en: [...a.en, ...extra].slice(0, 4), tier: Math.min(a.tier, b.tier), note: a.note || b.note };
      byMs.set(key, m);
      merged.push(`${e.ms}: [${prev.src}] ${prev.en.join('; ')}  +  [${e.src}] ${e.en.join('; ')}`);
    } else byMs.set(key, e);
  }
}
let entries = [...byMs.values()];

// ---- rank: blend corpus frequency with the editors' tier estimate ----
const corpusCount = (ms) => {
  const k = ms.toLowerCase();
  if (freq.has(k)) return freq.get(k);
  if (k.includes(' ')) return null; // multiword: no usable corpus figure
  if (k.includes('-')) return freq.get(k.replace(/-/g, '')) ?? null;
  return null;
};
for (const e of entries) e.count = corpusCount(e.ms);
const N = entries.length;
const withCount = entries.filter((e) => e.count != null).sort((a, b) => b.count - a.count);
withCount.forEach((e, i) => { e.pc = i + 1; });
for (const e of entries) {
  const pt = (e.tier - 0.5) * (N / 6);
  e.score = e.pc != null ? 0.6 * e.pc + 0.4 * pt : pt;
}
entries.sort((a, b) => a.score - b.score || a.ms.localeCompare(b.ms));
// Closed sets are kept whole: a learner should not get eight months out of twelve.
const PINNED = new Set(['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']);
const pinnedOut = entries.slice(TARGET).filter((e) => PINNED.has(e.ms));
const kept = entries.slice(0, TARGET);
for (let i = kept.length - 1, n = pinnedOut.length; i >= 0 && n > 0; i--) {
  if (!PINNED.has(kept[i].ms)) { kept.splice(i, 1); n--; }
}
const keptSet = new Set([...kept, ...pinnedOut]);
const dropped = entries.filter((e) => !keptSet.has(e));
entries = entries.filter((e) => keptSet.has(e));

// ---- map example-sentence tokens back to headwords (for "sentences you can read") ----
const index = new Map(entries.map((e, i) => [e.ms.toLowerCase(), i]));
const tokenize = (s) => s.toLowerCase().replace(/[.,!?;:"“”()…]/g, ' ').split(/\s+/).filter(Boolean);

function candidates(tok) {
  const out = [tok];
  let t = tok;
  const clitic = t.match(/^(.{2,})(nya|lah|kah|ku|mu)$/);
  if (clitic) { t = clitic[1]; out.push(t); }
  const stems = new Set();
  const addSuffixForms = (s) => {
    stems.add(s);
    for (const suf of ['kan', 'an', 'i']) if (s.length > suf.length + 2 && s.endsWith(suf)) stems.add(s.slice(0, -suf.length));
  };
  addSuffixForms(t);
  const pre = [
    [/^menge(.{3,})$/, ['']], [/^meng(.{3,})$/, ['', 'k']], [/^meny(.{3,})$/, ['s']], [/^mem(.{3,})$/, ['', 'p']],
    [/^men(.{3,})$/, ['', 't']], [/^me(.{3,})$/, ['']], [/^ber(.{3,})$/, ['']], [/^bel(.{3,})$/, ['']], [/^be(.{3,})$/, ['']],
    [/^di(.{3,})$/, ['']], [/^ter(.{3,})$/, ['']], [/^se(.{3,})$/, ['']], [/^ke(.{3,})$/, ['']],
    [/^penge(.{3,})$/, ['']], [/^peng(.{3,})$/, ['', 'k']], [/^peny(.{3,})$/, ['s']], [/^pem(.{3,})$/, ['', 'p']],
    [/^pen(.{3,})$/, ['', 't']], [/^per(.{3,})$/, ['']], [/^pe(.{3,})$/, ['']],
  ];
  for (const [re, restores] of pre) {
    const m = t.match(re);
    if (m) for (const r of restores) addSuffixForms(r + m[1]);
  }
  for (const s of stems) out.push(s);
  if (t.includes('-')) { const [a, b] = t.split('-'); if (a === b) out.push(a); }
  return out;
}

const phraseHeads = entries.filter((e) => e.ms.includes(' ')).map((e) => e.ms.toLowerCase());
const unmappedCounts = new Map();
const STRIP = /[.,!?;:"“”()…]/g;

// Which list words does a sentence use, and how many of its words are not on the list?
// Names (capitalised in mid-sentence) are not counted as unknown.
function analyse(sentence, self) {
  const names = new Set();
  sentence.split(/[.!?]+\s*/).forEach((part) => part.replace(STRIP, ' ').split(/\s+/).filter(Boolean)
    .forEach((t, i) => { if (i > 0 && /^\p{Lu}/u.test(t)) names.add(t.toLowerCase()); }));
  let text = ' ' + tokenize(sentence).join(' ') + ' ';
  const deps = new Set();
  for (const p of phraseHeads) if (text.includes(` ${p} `)) { deps.add(index.get(p)); text = text.replaceAll(` ${p} `, ' '); }
  let unknown = 0;
  for (const tok of text.trim().split(' ').filter(Boolean)) {
    const hit = candidates(tok).find((c) => index.has(c));
    if (hit != null) deps.add(index.get(hit));
    else if (!names.has(tok)) { unknown++; unmappedCounts.set(tok, (unmappedCounts.get(tok) || 0) + 1); }
  }
  return { deps: [...deps].filter((i) => i !== self).sort((a, b) => a - b), unk: unknown };
}

entries.forEach((e, i) => Object.assign(e, analyse(e.exMs, i)));

// Extra starter sentences built from the most frequent words only.
const seenSentences = new Set(entries.map((e) => e.exMs));
const extra = readFileSync(join(ROOT, 'content/sentences.tsv'), 'utf8').split('\n').filter((l) => l.trim()).map((l) => {
  const [ms, en] = l.split('\t').map((x) => x.trim());
  if (!ms || !en) throw new Error(`sentences.tsv: bad line: ${l}`);
  return { ms, en, ...analyse(ms, -1) };
}).filter((s) => !seenSentences.has(s.ms));

// ---- coverage of everyday speech reached at each rank (exact word + clitic forms) ----
const credit = new Array(entries.length).fill(0);
for (const [tok, c] of freq) {
  let hit = index.get(tok);
  if (hit == null) { const m = tok.match(/^(.{2,})(nya|lah|kah|ku|mu)$/); if (m) hit = index.get(m[1]); }
  if (hit != null) credit[hit] += c;
}
let cum = 0;
const coverage = credit.map((c) => { cum += c; return Math.round((cum / corpusTotal) * 1000) / 10; });

// ---- write ----
const rows = entries.map((e, i) => [e.ms, e.en, e.pos, e.root || '', e.exMs, e.exEn, e.note || '', e.deps, e.unk, coverage[i]]);
const out = `// GENERATED by tools/build-data.mjs from content/words-*.tsv. Do not edit by hand.
// Row: [malay, [english glosses], part of speech, root, example (ms), example (en), note, example word indexes, unknown tokens in example, cumulative coverage %]
export const WORD_ROWS = ${JSON.stringify(rows).replace(/\],\[/g, '],\n[')};
`;
writeFileSync(join(ROOT, 'js/data/words.js'), out + `
// Starter sentences. Row: [malay, english, word indexes used, unknown tokens]
export const SENTENCE_ROWS = ${JSON.stringify(extra.map((x) => [x.ms, x.en, x.deps, x.unk])).replace(/\],\[/g, '],\n[')};
`);
console.log(`words.js: ${entries.length} words (from ${N} candidates in ${files.length} files), coverage at end: ${coverage.at(-1)}%`);

if (REPORT) {
  console.log(`\nMerged duplicate headwords (${merged.length}):`);
  merged.forEach((m) => console.log('  ' + m));
  console.log(`\nDropped (${dropped.length}): ${dropped.map((e) => e.ms).join(', ')}`);
  console.log(`\nNo corpus frequency (${entries.filter((e) => e.count == null).length}): ${entries.filter((e) => e.count == null).map((e) => e.ms).join(', ')}`);
  const un = [...unmappedCounts].sort((a, b) => b[1] - a[1]);
  console.log(`\nExample tokens not in the word list (${un.length} distinct): ${un.slice(0, 150).map(([t, c]) => `${t}×${c}`).join(' ')}`);
  console.log(`\nStarter sentences: ${extra.length}; with unknown words: ${extra.filter((x) => x.unk).map((x) => x.ms).join(' | ') || 'none'}`);
  console.log('Starter sentences by hardest word: ' + [50, 100, 150, 200, 250, 400].map((r) => `≤${r}: ${extra.filter((x) => Math.max(...x.deps) < r).length}`).join(' | '));
  console.log('\nCoverage by rank: ' + [50, 100, 250, 500, 750, 1000, 1250, 1500].map((r) => `${r}: ${coverage[Math.min(r, coverage.length) - 1]}%`).join(' | '));
  console.log('\nFirst 60: ' + entries.slice(0, 60).map((e) => e.ms).join(', '));
  // High-frequency corpus words missing from the list (candidates to add)
  const missing = [];
  for (const [tok, c] of freq) { if (missing.length >= 120) break; if (!byMs.has(tok)) missing.push(tok); }
  console.log('\nMost frequent corpus tokens not among candidates: ' + missing.join(' '));
}
