// The study session: builds a queue of exercises and runs them one at a time.

import { h, shuffle, pick, norm, levenshtein, dayNumber, plural } from './util.js';
import { get, save, flush, settings, today } from './store.js';
import { newState, graduate, markKnown, review, LEARN_STEPS } from './srs.js';
import { speak, canListen } from './speech.js';
import {
  WORDS, POS_LABEL, byMs, sharesGloss, distractors, nextNewWords, readableSentences, malayTiles, englishTiles,
} from './vocab.js';
import { audioButton, wordFacts } from './ui.js';

const MAX_REVIEWS = 60;
const SENTENCES_IN_DAILY = 4;

// ---------- planning ----------

export function plan() {
  const st = get();
  const day = dayNumber();
  const learning = [];
  const due = [];
  for (const w of WORDS) {
    const s = st.words[w.ms];
    if (!s) continue;
    if (s.i === 0) learning.push(w);
    else if (s.d <= day) due.push(w);
  }
  const newLeft = Math.max(0, settings().newPerDay - today().n);
  const fresh = nextNewWords(newLeft);
  return { learning, due, fresh, remainingNew: nextNewWords(1).length > 0 };
}

function buildQueue(kind, opts) {
  const st = get();
  if (kind === 'sentences') return sentenceItems(opts.count || 8, new Set(), true);

  const p = plan();
  const fresh = kind === 'more' ? nextNewWords(opts.count || 5) : p.fresh;
  const due = shuffle(p.due).sort((a, b) => st.words[a.ms].d - st.words[b.ms].d).slice(0, MAX_REVIEWS);
  const queue = p.learning.map((w) => ({ type: 'learn', w, step: st.words[w.ms].st || 1 }));
  const intros = fresh.map((w) => ({ type: 'intro', w }));
  const reviews = shuffle(due.slice(0, 12)).concat(due.slice(12)).map((w) => ({ type: 'review', w }));
  // Interleave: a new word after every few reviews keeps the session varied.
  const gap = intros.length ? Math.max(2, Math.min(4, Math.floor(reviews.length / intros.length))) : 0;
  let ri = 0;
  while (intros.length || ri < reviews.length) {
    for (let k = 0; k < gap && ri < reviews.length; k++) queue.push(reviews[ri++]);
    if (intros.length) queue.push(intros.shift());
    else while (ri < reviews.length) queue.push(reviews[ri++]);
  }
  return queue;
}

function sentenceItems(count, focus, allowStretch) {
  const st = get();
  let pool = readableSentences({ maxGap: 0 });
  if (pool.length < count && allowStretch) pool = readableSentences({ maxGap: 1 });
  const seen = (s) => st.sentences[s.ms]?.n || 0;
  const fresh = (s) => Number(s.deps.some((i) => focus.has(WORDS[i])));
  const scored = shuffle(pool).sort((a, b) => (seen(a) - seen(b)) || (fresh(b) - fresh(a)));
  return scored.slice(0, count).map((s, i) => {
    const modes = ['build-en', 'build-ms'];
    if (canListen()) modes.push('listen');
    return { type: 'sentence', s, mode: seen(s) > 0 ? pick(modes) : modes[i % 2] };
  });
}

const unitsOf = (item, st) => {
  if (item.type === 'intro') return 1 + LEARN_STEPS;
  if (item.type === 'learn') return LEARN_STEPS - item.step + 1;
  return 1;
};

// ---------- answer checking ----------

function checkTyped(input, w) {
  const a = norm(input);
  const t = norm(w.ms);
  if (!a) return 'empty';
  if (a === t || a === t.replace(/-/g, ' ') || a.replace(/-/g, ' ') === t) return 'exact';
  const other = byMs.get(a);
  if (other) return sharesGloss(other, w) ? 'synonym' : 'wrong';
  const tolerance = t.length >= 8 ? 2 : t.length >= 5 ? 1 : 0;
  if (levenshtein(a, t) <= tolerance) return 'close';
  return 'wrong';
}

function clozeParts(w) {
  const esc = w.ms.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|[^\\p{L}-])(${esc})(?![\\p{L}-])`, 'iu').exec(w.exMs);
  if (!m) return null;
  const start = m.index + m[1].length;
  return { before: w.exMs.slice(0, start), after: w.exMs.slice(start + m[2].length), found: m[2] };
}

// ---------- the session ----------

export function runSession(root, kind = 'daily', opts = {}, onExit) {
  const st = get();
  const queue = buildQueue(kind, opts);
  const stats = { answers: 0, correct: 0, learned: [], reviewed: 0, sentences: 0, sentencesOk: 0, started: Date.now() };
  const touched = new Set();
  let total = queue.reduce((n, it) => n + unitsOf(it, st), 0);
  let done = 0;
  let sentencePhase = kind !== 'daily' && kind !== 'more';
  let keyHandler = null;

  const bar = h('div', { class: 'progress-fill' });
  const stage = h('div', { class: 'stage' });
  const shell = h('div', { class: 'session' },
    h('div', { class: 'session-top' },
      h('button', { class: 'icon-btn', 'aria-label': 'End session', title: 'End session', onclick: () => finish(true) }, '✕'),
      h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Session progress' }, bar),
    ),
    stage,
  );
  root.replaceChildren(shell);

  const onKey = (e) => { if (keyHandler) keyHandler(e); };
  document.addEventListener('keydown', onKey);

  function cleanup() {
    document.removeEventListener('keydown', onKey);
    keyHandler = null;
    flush();
  }

  // After an answer, Enter moves on. The short delay stops the same key press that
  // submitted the answer from also skipping the feedback.
  function continueOnEnter() {
    const since = Date.now();
    keyHandler = (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (!e.repeat && Date.now() - since > 150) next();
    };
  }

  function requeue(item, offset) {
    queue.splice(Math.min(queue.length, offset), 0, item);
  }

  function setProgress() {
    bar.style.width = `${total ? Math.min(100, Math.round((done / total) * 100)) : 0}%`;
  }

  function show(label, ...content) {
    stage.replaceChildren(h('div', { class: 'card exercise' }, label ? h('div', { class: 'kicker' }, label) : null, ...content));
    stage.scrollIntoView({ block: 'nearest' });
    setProgress();
  }

  function next() {
    save();
    if (!queue.length && !sentencePhase) {
      sentencePhase = true;
      const items = sentenceItems(SENTENCES_IN_DAILY, touched, false);
      if (items.length >= 2 && (stats.learned.length || stats.reviewed)) {
        queue.push(...items);
        total += items.length;
      }
    }
    if (!queue.length) return finish(false);
    keyHandler = null; // each exercise installs its own keyboard shortcuts
    const item = queue.shift();
    if (item.type === 'intro') return intro(item);
    if (item.type === 'sentence') return sentence(item);
    return quiz(item);
  }

  // ----- new word -----
  function intro(item) {
    const { w } = item;
    const go = (known) => {
      const ws = (st.words[w.ms] = newState());
      today().n += 1;
      touched.add(w);
      if (known) {
        markKnown(ws);
        done += 1 + LEARN_STEPS;
      } else {
        done += 1;
        requeue({ type: 'learn', w, step: 1 }, 2);
      }
      next();
    };
    const cont = h('button', { class: 'btn primary', onclick: () => go(false) }, 'Got it');
    show(`New word · #${w.rank}`,
      h('div', { class: 'intro' },
        h('div', { class: 'headword-row' }, h('div', { class: 'headword', lang: 'ms' }, w.ms), audioButton(w.ms, 'lg')),
        h('div', { class: 'gloss' }, w.en.join('; ')),
        wordFacts(w),
      ),
      h('div', { class: 'actions' },
        h('button', { class: 'btn ghost', onclick: () => go(true) }, 'I already know this'),
        cont,
      ),
    );
    if (settings().autoplay) speak(w.ms);
    cont.focus({ preventScroll: true });
    keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); go(false); } };
  }

  // ----- word questions -----
  function chooseKind(item) {
    const ws = st.words[item.w.ms];
    const typing = settings().typing;
    const listen = canListen();
    const cloze = !!clozeParts(item.w);
    if (item.type === 'relearn') return 'mcq-en-ms';
    if (item.type === 'learn') {
      if (item.step === 1) return 'mcq-ms-en';
      if (item.step === 2) return 'mcq-en-ms';
      return typing ? 'type' : cloze ? 'cloze-mcq' : 'mcq-en-ms';
    }
    const opts = [];
    if (ws.i < 3) opts.push('mcq-ms-en', 'mcq-en-ms');
    else if (ws.i < 7) {
      opts.push('mcq-en-ms');
      if (cloze) opts.push('cloze-mcq');
      if (listen) opts.push('listen-mcq');
    } else if (typing) {
      opts.push('type', 'type');
      if (cloze) opts.push('cloze-type');
      if (listen) opts.push('listen-mcq');
    } else {
      opts.push('mcq-en-ms');
      if (cloze) opts.push('cloze-mcq');
      if (listen) opts.push('listen-mcq');
    }
    return pick(opts);
  }

  function quiz(item) {
    const { w } = item;
    const kind = chooseKind(item);
    const label = item.type === 'review' ? 'Review' : item.type === 'relearn' ? 'Once more' : 'Learning';
    let answered = false;

    const resolve = (correct, note) => {
      if (answered) return;
      answered = true;
      touched.add(w);
      const ws = st.words[w.ms];
      if (item.type !== 'relearn') {
        stats.answers++;
        if (correct) stats.correct++;
        const d = today();
        d.t++;
        if (correct) d.ok++;
      }
      if (item.type === 'learn') {
        if (correct) {
          done++;
          if (item.step >= LEARN_STEPS) { graduate(ws); stats.learned.push(w); }
          else { ws.st = item.step + 1; requeue({ type: 'learn', w, step: item.step + 1 }, item.step === 1 ? 3 : 5); }
        } else {
          requeue({ type: 'learn', w, step: item.step }, 3);
        }
      } else if (item.type === 'review') {
        done++;
        stats.reviewed++;
        today().r++;
        review(ws, correct);
        if (!correct) requeue({ type: 'relearn', w }, 4);
      } else if (!correct) {
        requeue({ type: 'relearn', w }, 3);
      }
      feedback(correct, w, note);
    };

    if (kind === 'mcq-ms-en' || kind === 'listen-mcq') {
      const listenOnly = kind === 'listen-mcq';
      const options = shuffle([w, ...distractors(w)]);
      show(label,
        h('div', { class: 'prompt' },
          h('div', { class: 'ask' }, listenOnly ? 'Listen. What does it mean?' : 'What does this mean?'),
          listenOnly
            ? h('div', { class: 'headword-row' }, audioButton(w.ms, 'xl'))
            : h('div', { class: 'headword-row' }, h('div', { class: 'headword', lang: 'ms' }, w.ms), audioButton(w.ms, 'lg')),
        ),
        choiceList(options.map((o) => ({ text: o.en.slice(0, 2).join('; '), right: o === w })), resolve),
      );
      if (listenOnly || settings().autoplay) speak(w.ms);
    } else if (kind === 'mcq-en-ms') {
      const options = shuffle([w, ...distractors(w)]);
      show(label,
        h('div', { class: 'prompt' },
          h('div', { class: 'ask' }, 'How do you say this in Malay?'),
          h('div', { class: 'headword en' }, w.en.join('; ')),
          h('div', { class: 'pos-hint' }, POS_LABEL[w.pos] || ''),
        ),
        choiceList(options.map((o) => ({ text: o.ms, lang: 'ms', right: o === w })), resolve),
      );
    } else if (kind === 'cloze-mcq' || kind === 'cloze-type') {
      const parts = clozeParts(w);
      const blank = h('span', { class: 'blank' }, ' ');
      const head = h('div', { class: 'prompt' },
        h('div', { class: 'ask' }, 'Complete the sentence'),
        h('div', { class: 'cloze', lang: 'ms' }, parts.before, blank, parts.after),
        h('div', { class: 'cloze-en' }, w.exEn),
      );
      const reveal = () => { blank.textContent = parts.found; blank.classList.add('filled'); };
      if (kind === 'cloze-mcq') {
        const options = shuffle([w, ...distractors(w)]);
        show(label, head, choiceList(options.map((o) => ({ text: o.ms.toLowerCase(), lang: 'ms', right: o === w })), (ok) => { reveal(); resolve(ok); }));
      } else {
        show(label, head, typeBox(w, (ok, note) => { reveal(); resolve(ok, note); }));
      }
    } else {
      show(label,
        h('div', { class: 'prompt' },
          h('div', { class: 'ask' }, 'Type this in Malay'),
          h('div', { class: 'headword en' }, w.en.join('; ')),
          h('div', { class: 'pos-hint' }, POS_LABEL[w.pos] || ''),
        ),
        typeBox(w, resolve),
      );
    }
  }

  function choiceList(options, resolve) {
    const buttons = options.map((o, i) => h('button', {
      class: 'choice', lang: o.lang || null,
      onclick: () => choose(i),
    }, h('span', { class: 'key' }, String(i + 1)), h('span', { class: 'choice-text' }, o.text)));
    let locked = false;
    function choose(i) {
      if (locked || !options[i]) return;
      locked = true;
      buttons.forEach((b, j) => {
        b.disabled = true;
        if (options[j].right) b.classList.add('right');
        else if (j === i) b.classList.add('wrong');
      });
      resolve(options[i].right);
    }
    keyHandler = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) { e.preventDefault(); choose(n - 1); }
    };
    return h('div', { class: 'choices' }, buttons);
  }

  function typeBox(w, resolve) {
    const input = h('input', {
      class: 'type-input', type: 'text', lang: 'ms', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false',
      placeholder: 'Type the Malay word', 'aria-label': 'Your answer in Malay', enterkeyhint: 'done',
    });
    const msg = h('div', { class: 'type-msg', 'aria-live': 'polite' });
    let locked = false;
    const submit = () => {
      if (locked) return;
      const res = checkTyped(input.value, w);
      if (res === 'empty') { input.focus(); return; }
      if (res === 'synonym') {
        msg.textContent = `“${input.value.trim()}” has a similar meaning, but another word is wanted here. It starts with “${w.ms[0]}”.`;
        input.select();
        return;
      }
      locked = true;
      input.disabled = true;
      input.classList.add(res === 'wrong' ? 'wrong' : 'right');
      resolve(res !== 'wrong', res === 'close' ? `Nearly: watch the spelling. You typed “${input.value.trim()}”.` : null);
    };
    const hint = h('button', { class: 'btn text', onclick: () => {
      const letters = w.ms.replace(/[^\p{L}]/gu, '').length;
      msg.textContent = `Starts with “${w.ms[0]}”, ${plural(letters, 'letter')}.`;
      input.focus();
    } }, 'Hint');
    const giveUp = h('button', { class: 'btn text', onclick: () => { if (!locked) { locked = true; input.disabled = true; resolve(false); } } }, "Don't know");
    const check = h('button', { class: 'btn primary', onclick: submit }, 'Check');
    const box = h('div', { class: 'typebox' }, input, msg, h('div', { class: 'actions' }, hint, giveUp, check));
    setTimeout(() => input.focus({ preventScroll: true }), 30);
    keyHandler = (e) => { if (e.key === 'Enter' && !locked) { e.preventDefault(); submit(); } };
    return box;
  }

  function feedback(correct, w, note) {
    const cont = h('button', { class: 'btn primary', onclick: next }, 'Continue');
    const panel = h('div', { class: `feedback ${correct ? 'good' : 'bad'}`, role: 'status' },
      h('div', { class: 'feedback-head' },
        h('span', { class: 'mark', 'aria-hidden': 'true' }, correct ? '✓' : '✕'),
        h('strong', null, correct ? pick(['Betul!', 'Bagus!', 'Tepat!', 'Betul!']) : 'Not quite'),
        h('span', { class: 'feedback-sub' }, correct ? 'Correct' : 'Here is the answer'),
      ),
      note ? h('div', { class: 'feedback-note' }, note) : null,
      h('div', { class: 'answer-row' },
        h('span', { class: 'answer-ms', lang: 'ms' }, w.ms), audioButton(w.ms),
        h('span', { class: 'answer-en' }, w.en.join('; ')),
      ),
      h('div', { class: 'answer-ex' }, h('span', { lang: 'ms' }, w.exMs), h('span', { class: 'muted' }, ' — ' + w.exEn)),
      h('div', { class: 'actions' }, cont),
    );
    stage.querySelector('.exercise').append(panel);
    if (settings().autoplay) speak(w.ms);
    setProgress();
    setTimeout(() => { cont.focus({ preventScroll: true }); panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 20);
    continueOnEnter();
  }

  // ----- sentences -----
  function sentence(item) {
    const { s, mode } = item;
    const toMalay = mode !== 'build-en';
    const target = toMalay ? malayTiles(s.ms) : englishTiles(s.en);
    const extraPool = toMalay
      ? WORDS.filter((x) => st.words[x.ms] && !x.ms.includes(' ')).map((x) => x.ms)
      : readableSentences({ maxGap: 1 }).flatMap((x) => englishTiles(x.en));
    const targetSet = new Set(target.map((t) => norm(t)));
    const extras = [...new Set(shuffle(extraPool).filter((t) => !targetSet.has(norm(t))))].slice(0, target.length <= 3 ? 2 : 3);
    const bank = shuffle([...target, ...extras]).map((text, id) => ({ id, text, used: false }));
    const answer = [];
    let locked = false;

    const line = h('div', { class: 'answer-line', lang: toMalay ? 'ms' : null, 'aria-label': 'Your sentence' });
    const tray = h('div', { class: 'tile-bank', lang: toMalay ? 'ms' : null });
    const check = h('button', { class: 'btn primary', disabled: true, onclick: submit }, 'Check');

    function paint() {
      line.replaceChildren(...answer.map((t) => h('button', { class: 'tile', disabled: locked, onclick: () => { if (locked) return; t.used = false; answer.splice(answer.indexOf(t), 1); paint(); } }, t.text)));
      if (!answer.length) line.append(h('span', { class: 'placeholder' }, 'Tap the words in order'));
      tray.replaceChildren(...bank.map((t) => h('button', { class: `tile ${t.used ? 'used' : ''}`, disabled: t.used || locked, onclick: () => { t.used = true; answer.push(t); paint(); if (toMalay && settings().autoplay && mode !== 'listen') speak(t.text); } }, t.text)));
      check.disabled = !answer.length || locked;
    }

    function submit() {
      if (locked || !answer.length) return;
      locked = true;
      const correct = norm(answer.map((t) => t.text).join(' ')) === norm(target.join(' '));
      const rec = (st.sentences[s.ms] ||= { n: 0, ok: 0 });
      rec.n++;
      if (correct) rec.ok++;
      today().s++;
      stats.sentences++;
      if (correct) stats.sentencesOk++;
      done++;
      if (!correct && !item.retry) { requeue({ ...item, retry: true }, 3); total++; }
      line.classList.add(correct ? 'right' : 'wrong');
      paint();
      check.parentElement.hidden = true;
      const cont = h('button', { class: 'btn primary', onclick: next }, 'Continue');
      const panel = h('div', { class: `feedback ${correct ? 'good' : 'bad'}`, role: 'status' },
        h('div', { class: 'feedback-head' },
          h('span', { class: 'mark', 'aria-hidden': 'true' }, correct ? '✓' : '✕'),
          h('strong', null, correct ? pick(['Betul!', 'Bagus!', 'Syabas!']) : 'Not quite'),
          h('span', { class: 'feedback-sub' }, correct ? 'Correct' : 'Here is the sentence'),
        ),
        h('div', { class: 'answer-row' }, h('span', { class: 'answer-ms', lang: 'ms' }, s.ms), audioButton(s.ms)),
        h('div', { class: 'answer-ex muted' }, s.en),
        h('div', { class: 'actions' }, cont),
      );
      stage.querySelector('.exercise').append(panel);
      if (settings().autoplay) speak(s.ms);
      setProgress();
      setTimeout(() => { cont.focus({ preventScroll: true }); panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 20);
      continueOnEnter();
    }

    const prompt = mode === 'listen'
      ? h('div', { class: 'prompt' }, h('div', { class: 'ask' }, 'Listen and build the sentence'),
          h('div', { class: 'headword-row' }, audioButton(s.ms, 'xl'), h('button', { class: 'btn text', onclick: () => speak(s.ms, { slow: true }) }, 'Slower')))
      : toMalay
        ? h('div', { class: 'prompt' }, h('div', { class: 'ask' }, 'Say it in Malay'), h('div', { class: 'sentence-prompt' }, s.en))
        : h('div', { class: 'prompt' }, h('div', { class: 'ask' }, 'What does this mean?'),
            h('div', { class: 'headword-row' }, h('div', { class: 'sentence-prompt', lang: 'ms' }, s.ms), audioButton(s.ms, 'lg')));

    const newWords = s.deps.map((i) => WORDS[i]).filter((x) => !st.words[x.ms]);
    show('Sentence practice', prompt,
      newWords.length && mode !== 'listen' ? h('div', { class: 'new-word-hint' }, 'New here: ', newWords.map((x) => h('span', null, h('b', { lang: 'ms' }, x.ms), ` = ${x.en[0]}`))) : null,
      line, tray,
      h('div', { class: 'actions' }, check),
    );
    paint();
    if (mode === 'listen' || (mode === 'build-en' && settings().autoplay)) speak(s.ms);
    keyHandler = (e) => {
      if (locked) return;
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
      else if (e.key === 'Backspace' && answer.length) { e.preventDefault(); const t = answer.pop(); t.used = false; paint(); }
    };
  }

  // ----- summary -----
  function finish(early) {
    cleanup();
    const nothingDone = !stats.answers && !stats.sentences && !touched.size;
    if (early && nothingDone) return onExit();
    const mins = Math.max(1, Math.round((Date.now() - stats.started) / 60000));
    const acc = stats.answers ? Math.round((stats.correct / stats.answers) * 100) : null;
    const p = plan();
    const moreToday = p.learning.length + p.due.length + p.fresh.length;
    const tiles = [
      [stats.learned.length, 'new words learned'],
      [stats.reviewed, 'words reviewed'],
      stats.sentences ? [`${stats.sentencesOk}/${stats.sentences}`, 'sentences right'] : null,
      acc != null ? [`${acc}%`, 'accuracy'] : null,
      [mins, mins === 1 ? 'minute' : 'minutes'],
    ].filter(Boolean);
    bar.style.width = early ? bar.style.width : '100%';
    stage.replaceChildren(h('div', { class: 'card summary' },
      h('div', { class: 'kicker' }, early ? 'Session paused' : 'Session complete'),
      h('h1', null, early ? 'Progress saved' : pick(['Syabas!', 'Bagus sekali!', 'Tahniah!'])),
      h('p', { class: 'muted' }, early
        ? 'Everything you answered is saved. Words you were still learning will come back first next time.'
        : stats.learned.length
          ? `You will see ${stats.learned.length === 1 ? 'this word' : 'these words'} again tomorrow, then at growing intervals, just before you would forget.`
          : 'Each word now waits until just before you would forget it.'),
      h('div', { class: 'stat-row' }, tiles.map(([n, l]) => h('div', { class: 'stat' }, h('div', { class: 'stat-n' }, String(n)), h('div', { class: 'stat-l' }, l)))),
      stats.learned.length ? h('div', { class: 'learned-list' }, stats.learned.map((w) => h('span', { class: 'chip' }, h('b', { lang: 'ms' }, w.ms), ` ${w.en[0]}`))) : null,
      h('div', { class: 'actions wrap' },
        h('button', { class: 'btn ghost', onclick: onExit }, 'Back to home'),
        moreToday ? h('button', { class: 'btn primary', onclick: () => runSession(root, 'daily', {}, onExit) }, early ? 'Resume' : 'Keep going') : null,
        !moreToday && p.remainingNew ? h('button', { class: 'btn', onclick: () => runSession(root, 'more', { count: 5 }, onExit) }, 'Learn 5 more words') : null,
        !moreToday && readableSentences({ maxGap: 1 }).length >= 4 ? h('button', { class: 'btn', onclick: () => runSession(root, 'sentences', {}, onExit) }, 'Practise sentences') : null,
      ),
    ));
  }

  if (!queue.length) {
    cleanup();
    stage.replaceChildren(h('div', { class: 'card summary' },
      h('h1', null, kind === 'sentences' ? 'No sentences yet' : 'All caught up'),
      h('p', { class: 'muted' }, kind === 'sentences'
        ? 'Learn a few more words first. Sentences unlock as soon as you know every word in them.'
        : 'Nothing is due right now. Come back tomorrow, or learn a few extra words.'),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: onExit }, 'Back to home')),
    ));
    return;
  }
  next();
}
