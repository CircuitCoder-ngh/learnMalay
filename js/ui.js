// Shared interface pieces: audio buttons, word facts, the word detail dialog, text markup.

import { h, dayNumber } from './util.js';
import { C, S } from './course.js';
import { get, save } from './store.js';
import { speak } from './speech.js';
import { statusOf, newState, markKnown } from './srs.js';
import { posLabel, familyOf, UNIT_SIZE } from './vocab.js';

const SPEAKER = 'M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z';
const T = C.targetLang;

export function icon(path, size = 20) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', size);
  s.setAttribute('height', size);
  s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', path);
  p.setAttribute('fill', 'currentColor');
  s.append(p);
  return s;
}

// Hidden by CSS when the browser has no voice for the language being learned.
export function audioButton(text, size = '') {
  const btn = h('button', {
    class: `audio-btn ${size}`, type: 'button', 'aria-label': `${S.listen}: ${text}`, title: S.listen,
    onclick: (e) => {
      e.stopPropagation();
      speak(text, { onState: (s) => { btn.classList.toggle('busy', s === 'loading'); btn.classList.toggle('playing', s === 'playing'); } });
    },
  }, icon(SPEAKER, size === 'xl' ? 34 : size === 'lg' ? 24 : 18));
  return btn;
}

// "*word*" marks the language being learned (tap to hear), "**text**" marks emphasis.
export function rich(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] != null) out.push(h('strong', null, m[1]));
    else {
      const t = m[2];
      out.push(h('span', { class: 'target', lang: T, role: 'button', tabindex: '0', title: S.tapToHear, onclick: () => speak(t.replace(/[→/]/g, ',')) }, t));
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const listed = (label, items) => h('div', { class: 'forms' }, h('span', { class: 'muted' }, label),
  items.map((f, i) => h('span', null, i ? ', ' : '', h('b', { lang: T }, f))));

export function wordFacts(w) {
  const family = w.root || !w.forms.length ? familyOf(w) : [];
  return h('div', { class: 'facts' },
    h('div', { class: 'tags' },
      h('span', { class: 'tag' }, posLabel(w)),
      w.root ? h('span', { class: 'tag' }, S.root, h('b', { lang: T }, w.root)) : null,
    ),
    w.forms.length ? listed(S.otherForms, w.forms) : null,
    w.alt.length ? listed(S.altSpelling, w.alt) : null,
    h('div', { class: 'example' },
      h('div', { class: 'example-target', lang: T }, w.ex, audioButton(w.ex)),
      h('div', { class: 'example-tr' }, w.exTr),
    ),
    w.note ? h('div', { class: 'note' }, w.note) : null,
    family.length ? h('div', { class: 'forms' }, h('span', { class: 'muted' }, S.family),
      family.slice(0, 6).map((f, i) => h('span', null, i ? ', ' : '', h('b', { lang: T }, f.word), ` (${f.gloss[0]})`))) : null,
  );
}

export function openWord(w, onChange) {
  const st = get();
  const dlg = h('dialog', { class: 'sheet' });
  const close = () => { dlg.close(); dlg.remove(); };
  const paint = () => {
    const ws = st.words[w.word];
    const status = statusOf(ws);
    dlg.replaceChildren(
      h('div', { class: 'sheet-top' },
        h('span', { class: 'kicker' }, S.cardKicker(w.rank, Math.floor(w.idx / UNIT_SIZE) + 1)),
        h('button', { class: 'icon-btn', 'aria-label': S.close, onclick: close }, '✕'),
      ),
      h('div', { class: 'headword-row' }, h('div', { class: 'headword', lang: T }, w.word), audioButton(w.word, 'lg')),
      h('div', { class: 'gloss' }, w.gloss.join('; ')),
      wordFacts(w),
      h('div', { class: 'srs-line' },
        h('span', { class: `dot ${status}` }), S.status[status],
        ws && ws.i > 0 ? h('span', { class: 'muted' }, S.nextReview(S.interval(Math.max(0, ws.d - dayNumber())))) : null,
        ws && ws.l ? h('span', { class: 'muted' }, S.forgotten(ws.l)) : null,
      ),
      h('div', { class: 'actions wrap' },
        status === 'new' || status === 'learning'
          ? h('button', { class: 'btn', onclick: () => { st.words[w.word] = markKnown(ws || newState()); save(); onChange?.(); paint(); } }, S.iKnow)
          : null,
        ws ? h('button', { class: 'btn ghost', onclick: () => { delete st.words[w.word]; save(); onChange?.(); paint(); } }, S.resetWord) : null,
      ),
    );
  };
  paint();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener('close', () => dlg.remove());
  document.body.append(dlg);
  dlg.showModal();
  speak(w.word);
}
