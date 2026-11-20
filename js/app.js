// Routing and screens.

import { h, svg, dayNumber, dayLabel, plural, norm } from './util.js';
import { get, save, settings, setSetting, onSetting, today, streak, exportData, importData, reset } from './store.js';
import { statusOf, STATUS_LABEL } from './srs.js';
import { speak, onVoices, availableVoices, currentVoice, hasVoice, voiceIsFallback, selectVoice } from './speech.js';
import { WORDS, TOTAL, UNITS, UNIT_SIZE, POS_LABEL, counts, coverage, readableSentences } from './vocab.js';
import { LESSONS } from './data/grammar.js';
import { runSession, plan } from './session.js';
import { audioButton, rich, openWord, icon } from './ui.js';

const app = document.getElementById('app');
const STAGE_SIZE = 250;
const STAGES = [
  ['Asas', 'Foundations'], ['Harian', 'Everyday life'], ['Perbualan', 'Conversation'],
  ['Cerita', 'Stories'], ['Dunia', 'The wider world'], ['Lancar', 'Fluency'],
];

const ICONS = {
  home: 'M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3z',
  words: 'M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h10v2H4v-2z',
  grammar: 'M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V3zm3 15a1 1 0 0 0 0 2h9v-2H8zm0-11v2h8V7H8z',
  progress: 'M4 20V10h3v10H4zm6.5 0V4h3v16h-3zM17 20v-7h3v7h-3z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
};

const NAV = [
  ['', 'Home', 'home'], ['words', 'Words', 'words'], ['grammar', 'Grammar', 'grammar'], ['progress', 'Progress', 'progress'], ['settings', 'Settings', 'settings'],
];

// ---------- shell ----------

function applyTheme() {
  const t = settings().theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
applyTheme();
onSetting((k) => { if (k === 'theme') applyTheme(); if (k === 'voiceURI') selectVoice(); });

function buildNav() {
  for (const nav of document.querySelectorAll('[data-nav]')) {
    nav.replaceChildren(...NAV.map(([route, label, ic]) => h('a', { href: `#/${route}`, dataset: { route } }, icon(ICONS[ic], 22), h('span', null, label))));
  }
}

function markNav(route) {
  const top = route.split('/')[0];
  document.querySelectorAll('[data-nav] a').forEach((a) => {
    const on = a.dataset.route === top || (top === 'method' && a.dataset.route === '');
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  return { path, params: new URLSearchParams(query) };
}

const go = (path) => { location.hash = `#/${path}`; };

function render() {
  const { path, params } = parseHash();
  document.body.classList.toggle('in-session', path === 'learn');
  markNav(path);
  window.scrollTo(0, 0);
  const [head, arg] = path.split('/');
  if (head === 'learn') return runSession(app, params.get('mode') || 'daily', { count: Number(params.get('n')) || undefined }, () => go(''));
  if (head === 'words') return wordsView(params);
  if (head === 'grammar') return arg ? lessonView(arg) : grammarView();
  if (head === 'progress') return progressView();
  if (head === 'settings') return settingsView();
  if (head === 'method') return methodView();
  return homeView();
}

// ---------- home ----------

function ring(fraction, big, small) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return h('div', { class: 'ring' },
    svg('svg', { viewBox: '0 0 120 120', role: 'img', 'aria-label': `${big} ${small}` },
      svg('circle', { cx: 60, cy: 60, r, class: 'ring-track' }),
      svg('circle', { cx: 60, cy: 60, r, class: 'ring-value', 'stroke-dasharray': c, 'stroke-dashoffset': c * (1 - Math.min(1, fraction)), transform: 'rotate(-90 60 60)' }),
    ),
    h('div', { class: 'ring-label' }, h('div', { class: 'ring-big' }, big), h('div', { class: 'ring-small' }, small)),
  );
}

function methodPoints() {
  return [
    ['Most-used words first', `The ${TOTAL.toLocaleString()} words here are ranked by how often they are really used. The first few hundred already make up most of everyday speech.`],
    ['Recall, not re-reading', 'Every word is practised by pulling it out of memory: choosing, typing, listening and filling gaps. Effortful recall is what makes memories last.'],
    ['Reviews timed to forgetting', 'Each word returns just before you would forget it: after a day, then three, a week, and further apart each time you get it right.'],
    ['Words inside sentences', 'Every word comes with a real sentence, and you build sentences from the words you know, so vocabulary turns into language you can use.'],
  ];
}

function homeView() {
  const st = get();
  if (!st.onboarded) return welcomeView();
  const p = plan();
  const c = counts();
  const sk = streak();
  const cov = coverage();
  const todayStats = today();
  const reviewsDue = p.due.length + p.learning.length;
  const hasWork = reviewsDue + p.fresh.length > 0;
  const sentenceCount = readableSentences({ maxGap: 0 }).length;
  const nextLesson = LESSONS.find((l) => !st.grammar[l.id]);
  const minutes = Math.max(1, Math.round(reviewsDue * 0.2 + p.fresh.length * 0.9));

  const todayCard = h('section', { class: 'card today' },
    h('div', { class: 'kicker' }, 'Today'),
    hasWork
      ? [
        h('h2', null, todayStats.t ? 'Continue today’s session' : 'Your session is ready'),
        h('div', { class: 'today-counts' },
          h('div', null, h('b', null, String(reviewsDue)), plural(reviewsDue, 'review').replace(/^\d+ /, ' ') + ' due'),
          h('div', null, h('b', null, String(p.fresh.length)), ' new ' + (p.fresh.length === 1 ? 'word' : 'words')),
          h('div', null, h('b', null, `~${minutes}`), ' min'),
        ),
        h('a', { class: 'btn primary big', href: '#/learn' }, todayStats.t ? 'Continue' : 'Start session'),
      ]
      : [
        h('h2', null, 'Done for today'),
        h('p', { class: 'muted' }, c.started < TOTAL
          ? 'Nothing is due. Your next reviews arrive tomorrow. Short daily sessions beat long occasional ones.'
          : 'You have met every word. Keep reviewing and they will stay with you.'),
        h('div', { class: 'actions wrap start' },
          p.remainingNew ? h('a', { class: 'btn primary', href: '#/learn?mode=more&n=5' }, 'Learn 5 more words') : null,
          sentenceCount >= 4 ? h('a', { class: 'btn', href: '#/learn?mode=sentences' }, 'Practise sentences') : null,
        ),
      ],
  );

  const milestone = [50, 100, 250, 500, 750, 1000, 1250, TOTAL].find((m) => m > c.learned) || TOTAL;
  const progressCard = h('section', { class: 'card progress-card' },
    ring(c.learned / TOTAL, c.learned.toLocaleString(), `of ${TOTAL.toLocaleString()} words`),
    h('div', null,
      h('div', { class: 'kicker' }, 'What you can understand'),
      h('div', { class: 'cov' }, h('b', null, `${cov.toFixed(cov < 10 ? 1 : 0)}%`), ' of the words in everyday Malay speech'),
      h('p', { class: 'muted small' }, c.learned < TOTAL
        ? `Next milestone: ${milestone.toLocaleString()} words, which covers about ${WORDS[milestone - 1].cov.toFixed(0)}%.`
        : 'Every word on the list learned.'),
    ),
  );

  const side = h('div', { class: 'grid-2' },
    h('a', { class: 'card link-card', href: sentenceCount >= 4 ? '#/learn?mode=sentences' : '#/words' },
      h('div', { class: 'kicker' }, 'Sentences'),
      h('h3', null, sentenceCount ? `${plural(sentenceCount, 'sentence')} you can read` : 'Sentences unlock as you learn'),
      h('p', { class: 'muted small' }, 'Build and listen to sentences made only of words you know.'),
    ),
    nextLesson
      ? h('a', { class: 'card link-card', href: `#/grammar/${nextLesson.id}` },
        h('div', { class: 'kicker' }, `Grammar · ${LESSONS.indexOf(nextLesson) + 1} of ${LESSONS.length}`),
        h('h3', null, nextLesson.title),
        h('p', { class: 'muted small' }, nextLesson.blurb))
      : h('a', { class: 'card link-card', href: '#/grammar' }, h('div', { class: 'kicker' }, 'Grammar'), h('h3', null, 'All lessons complete'), h('p', { class: 'muted small' }, 'Revisit any lesson whenever you like.')),
  );

  app.replaceChildren(h('div', { class: 'page home' },
    h('header', { class: 'hero' },
      h('div', null,
        h('h1', null, c.started ? 'Selamat kembali' : 'Selamat datang'),
        h('p', { class: 'hero-sub' }, c.started ? 'Welcome back' : 'Welcome'),
      ),
      h('div', { class: `streak ${sk.doneToday ? 'lit' : ''}`, title: sk.doneToday ? 'You have studied today' : 'Study today to extend your streak' },
        h('span', { class: 'streak-n' }, String(sk.count)), h('span', { class: 'streak-l' }, sk.count === 1 ? 'day streak' : 'day streak')),
    ),
    todayCard, progressCard, side, pathSection(),
    h('p', { class: 'foot muted small' }, h('a', { href: '#/method' }, 'How this course works')),
  ));
}

function pathSection() {
  const st = get();
  const stages = [];
  for (let s = 0; s * STAGE_SIZE < TOTAL; s++) {
    const from = s * STAGE_SIZE;
    const to = Math.min(TOTAL, from + STAGE_SIZE);
    const learned = WORDS.slice(from, to).filter((w) => st.words[w.ms]?.i > 0).length;
    const cells = [];
    for (let u = from / UNIT_SIZE; u * UNIT_SIZE < to; u++) {
      const ws = WORDS.slice(u * UNIT_SIZE, (u + 1) * UNIT_SIZE);
      const done = ws.filter((w) => st.words[w.ms]?.i > 0).length;
      const frac = done / ws.length;
      cells.push(h('a', {
        class: `unit ${frac === 1 ? 'full' : frac > 0 ? 'part' : ''}`, href: `#/words?unit=${u + 1}`,
        style: { '--fill': `${Math.round(frac * 100)}%` },
        title: `Unit ${u + 1}: words ${u * UNIT_SIZE + 1}–${u * UNIT_SIZE + ws.length}, ${done} learned`,
        'aria-label': `Unit ${u + 1}, ${done} of ${ws.length} learned`,
      }, String(u + 1)));
    }
    const [ms, en] = STAGES[s] || [`Tahap ${s + 1}`, `Stage ${s + 1}`];
    stages.push(h('div', { class: 'stage-block' },
      h('div', { class: 'stage-head' },
        h('div', null, h('span', { class: 'stage-n' }, `Stage ${s + 1}`), h('strong', { lang: 'ms' }, ms), h('span', { class: 'muted' }, ` · ${en}`)),
        h('div', { class: 'muted small' }, `${learned}/${to - from} · reaches ${WORDS[to - 1].cov.toFixed(0)}% coverage`),
      ),
      h('div', { class: 'units' }, cells),
    ));
  }
  return h('section', { class: 'card path' }, h('div', { class: 'kicker' }, 'Your path'), h('h2', null, `${TOTAL.toLocaleString()} words in ${UNITS} units`), stages);
}

function welcomeView() {
  let goal = settings().newPerDay;
  const goals = [[5, 'Relaxed', '5 min a day'], [10, 'Steady', '10 min a day'], [15, 'Serious', '15 min a day'], [20, 'Intense', '20+ min a day']];
  const picker = h('div', { class: 'goal-picker', role: 'radiogroup', 'aria-label': 'New words per day' });
  const paint = () => picker.replaceChildren(...goals.map(([n, name, time]) => h('button', {
    class: `goal ${goal === n ? 'on' : ''}`, role: 'radio', 'aria-checked': String(goal === n), onclick: () => { goal = n; paint(); },
  }, h('b', null, `${n} words`), h('span', null, name), h('span', { class: 'muted small' }, time))));
  paint();
  const finishIn = (n) => `${Math.ceil(TOTAL / n / 30)} months`;
  const eta = h('p', { class: 'muted small' });
  const paintEta = () => { eta.textContent = `At ${goal} new words a day you will have met all ${TOTAL.toLocaleString()} words in about ${finishIn(goal)}.`; };
  picker.addEventListener('click', paintEta);
  paintEta();
  app.replaceChildren(h('div', { class: 'page welcome' },
    h('header', { class: 'hero tall' },
      h('div', null,
        h('p', { class: 'hero-sub' }, 'Selamat datang · Welcome'),
        h('h1', null, `Learn Malay through its ${TOTAL.toLocaleString()} most-used words`),
        h('p', { class: 'lead' }, `A small core of words does most of the work in any language. In Malay, the ${TOTAL.toLocaleString()} words in this course account for about ${WORDS[TOTAL - 1].cov.toFixed(0)}% of all the words spoken in everyday conversation. Learn them in order of usefulness and the rest of the language opens up.`),
      ),
    ),
    h('section', { class: 'method-grid' }, methodPoints().map(([t, d], i) => h('div', { class: 'card method' }, h('div', { class: 'method-n' }, String(i + 1)), h('h3', null, t), h('p', { class: 'muted' }, d)))),
    h('section', { class: 'card' },
      h('div', { class: 'kicker' }, 'Choose your pace'),
      h('h2', null, 'How many new words a day?'),
      picker, eta,
      h('div', { class: 'actions start' }, h('button', { class: 'btn primary big', onclick: () => { setSetting('newPerDay', goal); get().onboarded = true; save(); go('learn'); } }, 'Start learning')),
      h('p', { class: 'muted small' }, 'No account needed. Your progress is saved in this browser, and you can change the pace at any time.'),
    ),
  ));
}

function methodView() {
  app.replaceChildren(h('div', { class: 'page narrow' },
    h('header', { class: 'page-head' }, h('h1', null, 'How this course works'), h('p', { class: 'muted' }, 'Four ideas from memory research, applied to Malay.')),
    h('section', { class: 'method-grid' }, methodPoints().map(([t, d], i) => h('div', { class: 'card method' }, h('div', { class: 'method-n' }, String(i + 1)), h('h3', null, t), h('p', { class: 'muted' }, d)))),
    h('section', { class: 'card prose' },
      h('h2', null, 'A day of study'),
      h('p', null, 'Open the app and press Start. The session mixes the reviews that are due with a few new words. A new word is first shown with its sound, meaning and an example; a little later you pick its meaning, then pick the word from its meaning, then type it from memory. After that it is scheduled: tomorrow, then three days, a week, and onward.'),
      h('p', null, 'If you forget a word, it simply comes back sooner. That is the system working, not a failure.'),
      h('h2', null, 'Where the word list comes from'),
      h('p', null, 'The words are ordered using frequency counts from a large collection of Malay film and television subtitles, which reflect how people actually talk, combined with editorial judgement to keep the list clean and useful. The coverage percentages shown in the app are measured against that same collection.'),
      h('h2', null, 'Why grammar is short'),
      h('p', null, 'Malay has no verb tenses, no genders, no plural endings and no cases. The grammar lessons are brief on purpose: read one whenever you like, and spend most of your time on words and sentences.'),
      h('h2', null, 'Getting the most out of it'),
      h('ul', null,
        h('li', null, 'Study a little every day. Ten minutes daily beats an hour once a week.'),
        h('li', null, 'Say each word and sentence out loud.'),
        h('li', null, 'Keep typing turned on. Producing a word is harder than recognising it, and that difficulty is what builds memory.'),
        h('li', null, 'Do your reviews before adding new words. The session does this for you.'),
      ),
    ),
    h('div', { class: 'actions start' }, h('a', { class: 'btn primary', href: '#/' }, 'Back to home')),
  ));
}

// ---------- words ----------

function wordsView(params) {
  const st = get();
  let query = '';
  let filter = 'all';
  let unit = Number(params.get('unit')) || 0;
  let limit = 100;
  const list = h('div', { class: 'word-list' });
  const count = h('div', { class: 'muted small' });

  const matches = (w) => {
    if (unit && w.unit !== unit - 1) return false;
    const s = statusOf(st.words[w.ms]);
    if (filter === 'new' && s !== 'new') return false;
    if (filter === 'learning' && !(s === 'learning' || s === 'young')) return false;
    if (filter === 'known' && !(s === 'familiar' || s === 'mastered')) return false;
    if (!query) return true;
    const q = norm(query);
    return norm(w.ms).includes(q) || w.en.some((g) => norm(g).includes(q)) || norm(w.root || '') === q;
  };

  const paint = () => {
    const found = WORDS.filter(matches);
    count.textContent = `${found.length.toLocaleString()} ${found.length === 1 ? 'word' : 'words'}`;
    list.replaceChildren(...found.slice(0, limit).map((w) => {
      const s = statusOf(st.words[w.ms]);
      return h('button', { class: 'word-row', onclick: () => openWord(w, paint) },
        h('span', { class: 'rank' }, String(w.rank)),
        h('span', { class: 'w-ms', lang: 'ms' }, w.ms),
        h('span', { class: 'w-en' }, w.en.join('; ')),
        h('span', { class: 'w-pos' }, POS_LABEL[w.pos] || w.pos),
        h('span', { class: `dot ${s}`, title: STATUS_LABEL[s] }),
      );
    }));
    if (!found.length) list.append(h('p', { class: 'muted empty' }, 'No words match.'));
    if (found.length > limit) list.append(h('button', { class: 'btn ghost more', onclick: () => { limit += 200; paint(); } }, `Show more (${found.length - limit} left)`));
  };

  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by progress' });
  const paintChips = () => chips.replaceChildren(...[['all', 'All'], ['new', 'Not started'], ['learning', 'Learning'], ['known', 'Known well']].map(([k, label]) =>
    h('button', { class: `chip-btn ${filter === k ? 'on' : ''}`, 'aria-pressed': String(filter === k), onclick: () => { filter = k; limit = 100; paintChips(); paint(); } }, label)));
  paintChips();

  const unitSel = h('select', { 'aria-label': 'Unit', onchange: (e) => { unit = Number(e.target.value); limit = 100; paint(); } },
    h('option', { value: '0' }, 'All units'),
    Array.from({ length: UNITS }, (_, i) => h('option', { value: String(i + 1), selected: unit === i + 1 }, `Unit ${i + 1} (${i * UNIT_SIZE + 1}–${Math.min(TOTAL, (i + 1) * UNIT_SIZE)})`)),
  );
  const search = h('input', { type: 'search', placeholder: 'Search Malay or English', 'aria-label': 'Search words', oninput: (e) => { query = e.target.value; limit = 100; paint(); } });

  app.replaceChildren(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', null, 'Word list'), h('p', { class: 'muted' }, `All ${TOTAL.toLocaleString()} words, most frequent first. Tap a word for its example, family and schedule.`)),
    h('div', { class: 'toolbar' }, search, unitSel),
    h('div', { class: 'toolbar' }, chips, count),
    h('div', { class: 'legend' }, ['new', 'learning', 'young', 'familiar', 'mastered'].map((s) => h('span', null, h('span', { class: `dot ${s}` }), STATUS_LABEL[s]))),
    list,
  ));
  paint();
}

// ---------- grammar ----------

function grammarView() {
  const st = get();
  app.replaceChildren(h('div', { class: 'page narrow' },
    h('header', { class: 'page-head' }, h('h1', null, 'Grammar'), h('p', { class: 'muted' }, `${LESSONS.length} short lessons. Malay grammar is simple and regular: each lesson takes about five minutes.`)),
    h('div', { class: 'lesson-list' }, LESSONS.map((l, i) => {
      const done = st.grammar[l.id];
      return h('a', { class: `card lesson-card ${done ? 'done' : ''}`, href: `#/grammar/${l.id}` },
        h('div', { class: 'lesson-n' }, done ? '✓' : String(i + 1)),
        h('div', null, h('h3', null, l.title), h('p', { class: 'muted small' }, l.blurb),
          done ? h('p', { class: 'small done-note' }, `Completed · quiz ${done.score}/${l.quiz.length}`) : null),
      );
    })),
  ));
}

function lessonView(id) {
  const st = get();
  const idx = LESSONS.findIndex((l) => l.id === id);
  const lesson = LESSONS[idx];
  if (!lesson) return grammarView();
  const nextL = LESSONS[idx + 1];
  let answered = 0;
  let score = 0;
  const result = h('div', { class: 'quiz-result', 'aria-live': 'polite' });

  const table = (t) => h('div', { class: 'table-wrap' }, h('table', null,
    h('thead', null, h('tr', null, t.head.map((c) => h('th', null, rich(c))))),
    h('tbody', null, t.rows.map((r) => h('tr', null, r.map((c) => h('td', null, rich(c))))))));
  const sections = lesson.sections.map((s) => h('section', { class: 'lesson-section' },
    s.h ? h('h2', null, s.h) : null,
    (s.p || []).map((p) => h('p', null, rich(p))),
    s.table ? table(s.table) : null,
    s.ex ? h('div', { class: 'examples' }, s.ex.map(([ms, en]) => h('div', { class: 'ex-row' },
      h('div', { class: 'ex-ms', lang: 'ms' }, ms, audioButton(ms.replace(/→/g, ','))), h('div', { class: 'ex-en' }, en)))) : null,
    (s.after || []).map((p) => h('p', null, rich(p))),
    s.tip ? h('div', { class: 'tip' }, rich(s.tip)) : null,
  ));

  const quiz = lesson.quiz.map((q, qi) => {
    const why = h('div', { class: 'why', hidden: true }, rich(q.why));
    const buttons = q.opts.map((o, oi) => h('button', { class: 'choice', onclick: () => {
      if (buttons[0].disabled) return;
      buttons.forEach((b, bi) => { b.disabled = true; if (bi === q.a) b.classList.add('right'); else if (bi === oi) b.classList.add('wrong'); });
      why.hidden = false;
      answered++;
      if (oi === q.a) score++;
      if (answered === lesson.quiz.length) {
        st.grammar[lesson.id] = { done: dayNumber(), score };
        save();
        result.replaceChildren(h('div', { class: 'card quiz-done' },
          h('h3', null, score === lesson.quiz.length ? 'Sempurna! Perfect score.' : `You scored ${score} of ${lesson.quiz.length}`),
          h('p', { class: 'muted' }, 'Lesson marked as complete. The patterns will sink in as you meet them in the example sentences.'),
          h('div', { class: 'actions start wrap' },
            nextL ? h('a', { class: 'btn primary', href: `#/grammar/${nextL.id}` }, `Next: ${nextL.title}`) : null,
            h('a', { class: 'btn ghost', href: '#/grammar' }, 'All lessons'))));
        result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    } }, h('span', { class: 'choice-text' }, o)));
    return h('div', { class: 'quiz-q' }, h('p', { class: 'q' }, h('span', { class: 'q-n' }, `${qi + 1}.`), ' ', rich(q.q)), h('div', { class: 'choices' }, buttons), why);
  });

  app.replaceChildren(h('div', { class: 'page narrow lesson' },
    h('a', { class: 'back', href: '#/grammar' }, '← All lessons'),
    h('header', { class: 'page-head' }, h('div', { class: 'kicker' }, `Lesson ${idx + 1} of ${LESSONS.length}`), h('h1', null, lesson.title), h('p', { class: 'lead' }, lesson.blurb)),
    h('div', { class: 'card prose' }, sections),
    h('section', { class: 'card' }, h('div', { class: 'kicker' }, 'Check yourself'), h('h2', null, 'Quick quiz'), quiz),
    result,
  ));
}

// ---------- progress ----------

function bars(data, { label }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return h('div', { class: 'bars', role: 'img', 'aria-label': `${label}: ${data.map((d) => `${d.name} ${d.value}`).join(', ')}` },
    data.map((d) => h('div', { class: `bar-col ${d.strong ? 'strong' : ''}`, tabindex: '0' },
      h('div', { class: 'bar-tip' }, h('b', null, String(d.value)), ` ${d.unit}`, h('br'), d.name),
      h('div', { class: 'bar-track' }, h('div', { class: `bar ${d.value ? '' : 'zero'}`, style: { height: `${d.value ? Math.max(3, (d.value / max) * 100) : 0}%` } })),
      h('div', { class: 'bar-x' }, d.tick),
    )),
  );
}

function progressView() {
  const st = get();
  const c = counts();
  const sk = streak();
  const day = dayNumber();
  const by = { new: 0, learning: 0, young: 0, familiar: 0, mastered: 0 };
  for (const w of WORDS) by[statusOf(st.words[w.ms])]++;

  let t7 = 0, ok7 = 0;
  for (let d = day - 6; d <= day; d++) { const x = st.days[d]; if (x) { t7 += x.t; ok7 += x.ok; } }

  const activity = [];
  for (let d = day - 13; d <= day; d++) {
    const x = st.days[d] || { t: 0, s: 0 };
    activity.push({ value: x.t + x.s, unit: 'answers', name: dayLabel(d, { weekday: 'long', day: 'numeric', month: 'short' }), tick: dayLabel(d, { weekday: 'narrow' }), strong: d === day });
  }
  const forecast = [];
  for (let d = day; d < day + 7; d++) {
    let n = 0;
    for (const w of WORDS) { const s = st.words[w.ms]; if (s && s.i > 0 && (d === day ? s.d <= d : s.d === d)) n++; }
    forecast.push({ value: n, unit: 'reviews due', name: d === day ? 'Today' : dayLabel(d, { weekday: 'long', day: 'numeric', month: 'short' }), tick: d === day ? 'Today' : dayLabel(d, { weekday: 'short' }), strong: d === day });
  }

  const order = ['mastered', 'familiar', 'young', 'learning', 'new'];
  const grammarDone = LESSONS.filter((l) => st.grammar[l.id]).length;
  const cov = coverage();

  app.replaceChildren(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', null, 'Progress')),
    h('div', { class: 'stat-tiles' },
      [[sk.count, sk.count === 1 ? 'day streak' : 'day streak'], [c.learned.toLocaleString(), 'words learned'], [`${cov.toFixed(cov < 10 ? 1 : 0)}%`, 'of everyday speech'], [t7 ? `${Math.round((ok7 / t7) * 100)}%` : '–', 'accuracy, last 7 days'], [`${grammarDone}/${LESSONS.length}`, 'grammar lessons']]
        .map(([n, l]) => h('div', { class: 'card stat-tile' }, h('div', { class: 'stat-n' }, String(n)), h('div', { class: 'stat-l' }, l))),
    ),
    h('section', { class: 'card' },
      h('h2', null, 'Memory strength'),
      h('p', { class: 'muted small' }, `How firmly each of the ${TOTAL.toLocaleString()} words is held, from untouched to long-term.`),
      h('div', { class: 'stack', role: 'img', 'aria-label': order.map((k) => `${STATUS_LABEL[k]} ${by[k]}`).join(', ') },
        order.filter((k) => by[k]).map((k) => h('div', { class: `seg ${k}`, style: { flexGrow: String(by[k]) }, title: `${STATUS_LABEL[k]}: ${by[k]}` }))),
      h('div', { class: 'legend' }, order.map((k) => h('span', null, h('span', { class: `dot ${k}` }), `${STATUS_LABEL[k]} `, h('b', null, String(by[k]))))),
    ),
    h('div', { class: 'grid-2' },
      h('section', { class: 'card' }, h('h2', null, 'Activity'), h('p', { class: 'muted small' }, 'Questions answered per day, last 14 days'), bars(activity, { label: 'Answers per day' })),
      h('section', { class: 'card' }, h('h2', null, 'Upcoming reviews'), h('p', { class: 'muted small' }, 'Words scheduled to come back, next 7 days'), bars(forecast, { label: 'Reviews due per day' })),
    ),
  ));
}

// ---------- settings ----------

function settingsView() {
  const s = settings();
  const row = (label, help, control) => h('div', { class: 'set-row' }, h('div', null, h('div', { class: 'set-label' }, label), help ? h('div', { class: 'muted small' }, help) : null), control);
  const toggle = (key, label) => h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: s[key], 'aria-label': label, onchange: (e) => setSetting(key, e.target.checked) }), h('span', { class: 'track' }));
  const select = (key, options, label, parse = String) => h('select', { 'aria-label': label, onchange: (e) => setSetting(key, parse(e.target.value)) },
    options.map(([v, l]) => h('option', { value: String(v), selected: String(s[key]) === String(v) }, l)));

  const voiceRow = h('div');
  const paintVoice = () => {
    const voices = availableVoices();
    const msg = !hasVoice()
      ? 'This browser has no Malay voice, so audio and listening exercises are hidden. Chrome on Android, Safari on iPhone and Mac, and Microsoft Edge usually include one; you may need to add Malay in your device’s text-to-speech settings.'
      : voiceIsFallback()
        ? 'No Malay voice found, so an Indonesian voice is used. The pronunciation is very close.'
        : 'Using your device’s Malay voice.';
    voiceRow.replaceChildren(
      row('Voice', msg, voices.length
        ? h('select', { 'aria-label': 'Voice', onchange: (e) => setSetting('voiceURI', e.target.value) }, voices.map((v) => h('option', { value: v.voiceURI, selected: currentVoice() === v }, `${v.name} (${v.lang})`)))
        : h('span', { class: 'muted small' }, 'Not available')),
      hasVoice() ? row('Test', null, h('button', { class: 'btn', onclick: () => speak('Selamat datang. Apa khabar?') }, 'Play sample')) : null,
    );
  };
  paintVoice();
  onVoices(() => { if (voiceRow.isConnected) paintVoice(); });

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      if (!confirm('Replace the progress in this browser with the contents of this file?')) return;
      importData(text);
      applyTheme();
      alert('Progress restored.');
      settingsView();
    } catch (err) { alert(err.message || 'Could not read that file.'); }
  } });

  app.replaceChildren(h('div', { class: 'page narrow' },
    h('header', { class: 'page-head' }, h('h1', null, 'Settings')),
    h('section', { class: 'card' }, h('h2', null, 'Study'),
      row('New words per day', 'Reviews are never capped; only new words are.', select('newPerDay', [[5, '5 · relaxed'], [10, '10 · steady'], [15, '15 · serious'], [20, '20 · intense'], [30, '30 · sprint']], 'New words per day', Number)),
      row('Typing exercises', 'Type words from memory. Harder than choosing, and much more effective.', toggle('typing', 'Typing exercises')),
    ),
    h('section', { class: 'card' }, h('h2', null, 'Sound'),
      row('Audio', 'Speaker buttons and listening exercises.', toggle('audio', 'Audio')),
      row('Play automatically', 'Say each word aloud as it appears.', toggle('autoplay', 'Play automatically')),
      row('Speaking speed', null, select('rate', [[0.7, 'Slow'], [0.9, 'Normal'], [1.05, 'Fast']], 'Speaking speed', Number)),
      voiceRow,
    ),
    h('section', { class: 'card' }, h('h2', null, 'Appearance'),
      row('Theme', null, select('theme', [['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']], 'Theme')),
    ),
    h('section', { class: 'card' }, h('h2', null, 'Your data'),
      h('p', { class: 'muted small' }, 'Progress is stored only in this browser. Export a backup to move it to another device or to keep it safe.'),
      h('div', { class: 'actions start wrap' },
        h('button', { class: 'btn', onclick: () => {
          const a = h('a', { href: URL.createObjectURL(new Blob([exportData()], { type: 'application/json' })), download: `lancar-progress-${new Date().toISOString().slice(0, 10)}.json` });
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        } }, 'Export progress'),
        h('button', { class: 'btn', onclick: () => fileInput.click() }, 'Import progress'),
        fileInput,
        h('button', { class: 'btn danger', onclick: () => { if (confirm('Delete all progress in this browser? This cannot be undone.')) { reset(); applyTheme(); go(''); } } }, 'Reset everything'),
      ),
    ),
    h('p', { class: 'muted small foot' }, h('a', { href: '#/method' }, 'How this course works')),
  ));
}

// ---------- boot ----------

buildNav();
window.addEventListener('hashchange', render);
render();
