// The active course's word list as objects, plus lookups used by exercises.
// `word` is in the language being learned; `gloss` is its meaning in the learner's language.

import { COURSE_ID, C, S } from './course.js';
import { get } from './store.js';
import { norm, shuffle } from './util.js';

const { WORD_ROWS, SENTENCE_ROWS } = await import(`./data/${COURSE_ID}/words.js`);

export const UNIT_SIZE = 25;

export const WORDS = WORD_ROWS.map((r, i) => {
  const w = C.row(r);
  w.idx = i;
  w.rank = i + 1;
  w.pos = w.posAll[0];
  w.unit = Math.floor(i / UNIT_SIZE);
  w.glossKeys = w.gloss.map((g) => norm(g.replace(/\([^)]*\)/g, '')));
  return w;
});

export const TOTAL = WORDS.length;
export const UNITS = Math.ceil(TOTAL / UNIT_SIZE);
export const byWord = new Map(WORDS.map((w) => [norm(w.word), w]));
export const posLabel = (w) => w.posAll.map((p) => S.pos[p] || p).join(' / ');

export function sharesGloss(a, b) {
  return a.glossKeys.some((g) => g && b.glossKeys.includes(g));
}

// Words built on the same root, e.g. ajar: belajar, mengajar, pelajar.
const families = new Map();
for (const w of WORDS) {
  const key = norm(w.root || w.word);
  if (!families.has(key)) families.set(key, []);
  families.get(key).push(w);
}
export function familyOf(w) {
  return (families.get(norm(w.root || w.word)) || []).filter((x) => x !== w);
}

export function counts() {
  const words = get().words;
  let started = 0, learned = 0, strong = 0;
  for (const w of WORDS) {
    const s = words[w.word];
    if (!s) continue;
    started++;
    if (s.i > 0) learned++;
    if (s.i >= 21) strong++;
  }
  return { started, learned, strong };
}

// Share of everyday speech covered by the words learned so far.
export function coverage() {
  const words = get().words;
  let cov = 0;
  for (const w of WORDS) {
    if (words[w.word]?.i > 0) cov += w.cov - (w.idx ? WORDS[w.idx - 1].cov : 0);
  }
  return cov;
}

export function nextNewWords(n) {
  const words = get().words;
  const out = [];
  for (const w of WORDS) {
    if (out.length >= n) break;
    if (!words[w.word]) out.push(w);
  }
  return out;
}

const isKnown = (w) => !!get().words[w.word];

// Wrong options for a multiple-choice question about `w`: same kind of word, similar
// frequency, never a synonym, and preferably words the learner has already met.
export function distractors(w, n = 3) {
  const ok = (x) => x !== w && !sharesGloss(x, w) && norm(x.gloss[0]) !== norm(w.gloss[0]);
  const near = (span) => WORDS.slice(Math.max(0, w.idx - span), w.idx + span).filter(ok);
  let pool = near(120).filter((x) => x.pos === w.pos);
  if (pool.length < n * 3) pool = near(400).filter((x) => x.pos === w.pos);
  if (pool.length < n) pool = near(200);
  const known = shuffle(pool.filter(isKnown));
  const unknown = shuffle(pool.filter((x) => !isKnown(x)));
  const picked = [];
  const seenGloss = new Set();
  for (const x of [...known, ...unknown]) {
    if (picked.length >= n) break;
    const g = norm(x.gloss[0]);
    if (seenGloss.has(g) || picked.some((p) => sharesGloss(p, x))) continue;
    seenGloss.add(g);
    picked.push(x);
  }
  return picked;
}

// ---- sentences as practice material ----

// Every example sentence plus the starter sentences. `deps` lists the list words used.
export const SENTENCES = [...new Map([
  ...WORDS.map((w) => ({ text: w.ex, tr: w.exTr, deps: [...w.deps, w.idx], unk: w.unk })),
  ...SENTENCE_ROWS.map((r) => ({ text: r[0], tr: r[1], deps: r[2], unk: r[3] })),
].map((x) => [x.text, x])).values()];

// A sentence is readable when the learner has met every list word in it (maxGap 0), or
// all but one (maxGap 1, "i+1": mostly familiar, one thing new).
export function readableSentences({ maxGap = 0 } = {}) {
  const words = get().words;
  return SENTENCES.filter((s) => {
    if (s.unk > 1 || s.deps.length < 2) return false;
    let missing = 0;
    for (const i of s.deps) if (!words[WORDS[i].word] && ++missing > maxGap) return false;
    return true;
  });
}

const PUNCT = /[.,!?;:"“”()…]/g;
export function tokens(sentence) {
  return sentence.replace(/[’‘]/g, "'").replace(PUNCT, ' ').split(/\s+/).filter(Boolean);
}

// Words that keep their capital letter anywhere in a sentence (names, days, places):
// seen capitalised in the middle of a sentence and never seen in lower case.
function properNouns(sentences, seed = []) {
  const capitalised = new Set(seed);
  const lower = new Set();
  for (const s of sentences) {
    s.split(/[.!?]+\s*/).forEach((part) => tokens(part).forEach((t, i) => {
      if (/^\p{Ll}/u.test(t)) lower.add(t);
      else if (i > 0 && /^\p{Lu}/u.test(t)) capitalised.add(t);
    }));
  }
  for (const t of [...capitalised]) if (lower.has(t.toLowerCase()) && !seed.includes(t)) capitalised.delete(t);
  return capitalised;
}
// English always capitalises "I", whichever side of the course it is on.
const properTarget = properNouns(SENTENCES.map((x) => x.text), C.targetLang === 'en' ? ['I'] : []);
const properGloss = properNouns(SENTENCES.map((x) => x.tr), C.uiLang === 'en' ? ['I'] : []);

// Tiles for a build-the-sentence exercise: the first word loses its capital unless it is
// a proper noun, so capitalisation does not give the order away.
function tiles(sentence, proper) {
  const t = tokens(sentence);
  if (t.length && !proper.has(t[0]) && !/^I['’]/.test(t[0])) t[0] = t[0].toLowerCase();
  return t;
}
export const targetTiles = (sentence) => tiles(sentence, properTarget);
export const glossTiles = (sentence) => tiles(sentence, properGloss);
