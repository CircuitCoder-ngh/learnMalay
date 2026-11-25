// Routing and screens for the active course. All visible text comes from the course (S).

import { h, svg, dayNumber, dayLabel, norm } from './util.js';
import { COURSE_ID, COURSES, C, S, switchCourse } from './course.js';
import { get, save, settings, setSetting, onSetting, today, streak, exportData, importData, reset } from './store.js';
import { statusOf } from './srs.js';
import { speak, onVoices, availableVoices, currentVoice, hasVoice, voiceIsOnline, selectVoice } from './speech.js';
import { WORDS, TOTAL, UNITS, UNIT_SIZE, posLabel, counts, coverage, readableSentences } from './vocab.js';
import { runSession, plan } from './session.js';
import { audioButton, rich, openWord, icon } from './ui.js';

const { LESSONS } = await import(`./data/${COURSE_ID}/grammar.js`);

const app = document.getElementById('app');
const T = C.targetLang;
const STAGE_SIZE = 250;
const pct = (x) => `${x.toFixed(x < 10 ? 1 : 0)}%`;

const ICONS = {
  home: 'M12 3 3 10.5V21h6v-6h6v6h6V10.5L12 3z',
  words: 'M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h10v2H4v-2z',
  grammar: 'M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V3zm3 15a1 1 0 0 0 0 2h9v-2H8zm0-11v2h8V7H8z',
  progress: 'M4 20V10h3v10H4zm6.5 0V4h3v16h-3zM17 20v-7h3v7h-3z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
};

const NAV = [['', 'home'], ['words', 'words'], ['grammar', 'grammar'], ['progress', 'progress'], ['settings', 'settings']];

// ---------- shell ----------

function applyTheme() {
  const t = settings().theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function buildShell() {
  const root = document.documentElement;
  root.lang = C.uiLang;
  root.dataset.course = C.id;
  document.title = C.title;
  document.querySelector('.brand-name').textContent = C.brand;
  document.querySelector('.brand-tag').textContent = C.tag;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(root).getPropertyValue('--hero-base').trim() || '#0e5a5a');
  for (const nav of document.querySelectorAll('[data-nav]')) {
    nav.setAttribute('aria-label', S.nav.label);
    nav.replaceChildren(...NAV.map(([route, key]) => h('a', { href: `#/${route}`, dataset: { route } }, icon(ICONS[key], 22), h('span', null, S.nav[key]))));
  }
  // The switch between the two courses. Each label is written in its own audience's language.
  document.querySelector('[data-course-toggle]').replaceChildren(...COURSES.map((c) => h('button', {
    type: 'button', lang: c.lang, class: c.id === COURSE_ID ? 'on' : '', 'aria-pressed': String(c.id === COURSE_ID),
    onclick: () => switchCourse(c.id),
  }, c.label)));
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

const methodGrid = () => h('section', { class: 'method-grid' }, S.methodPoints(TOTAL).map(([t, d], i) =>
  h('div', { class: 'card method' }, h('div', { class: 'method-n' }, String(i + 1)), h('h3', null, t), h('p', { class: 'muted' }, d))));

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
  const greeting = c.started ? C.greeting.back : C.greeting.first;

  const todayCard = h('section', { class: 'card today' },
    h('div', { class: 'kicker' }, S.today),
    hasWork
      ? [
        h('h2', null, todayStats.t ? S.continueToday : S.ready),
        h('div', { class: 'today-counts' },
          h('div', null, h('b', null, String(reviewsDue)), S.reviewsDue(reviewsDue)),
          h('div', null, h('b', null, String(p.fresh.length)), S.newWords(p.fresh.length)),
          h('div', null, h('b', null, `~${minutes}`), S.minutes),
        ),
        h('a', { class: 'btn primary big', href: '#/learn' }, todayStats.t ? S.continueBtn : S.startSession),
      ]
      : [
        h('h2', null, S.doneToday),
        h('p', { class: 'muted' }, c.started < TOTAL ? S.doneBody : S.allMetBody),
        h('div', { class: 'actions wrap start' },
          p.remainingNew ? h('a', { class: 'btn primary', href: '#/learn?mode=more&n=5' }, S.learnMore) : null,
          sentenceCount >= 4 ? h('a', { class: 'btn', href: '#/learn?mode=sentences' }, S.practiseSentences) : null,
          c.learned >= 4 ? h('a', { class: 'btn', href: '#/learn?mode=dictation' }, S.dictationBtn) : null,
        ),
      ],
  );

  const milestone = [50, 100, 250, 500, 750, 1000, 1250].find((m) => m > c.learned && m < TOTAL) || TOTAL;
  const progressCard = h('section', { class: 'card progress-card' },
    ring(c.learned / TOTAL, S.num(c.learned), S.ringOf(TOTAL)),
    h('div', null,
      h('div', { class: 'kicker' }, S.understand),
      h('div', { class: 'cov' }, h('b', null, pct(cov)), S.covText),
      h('p', { class: 'muted small' }, c.learned < TOTAL ? S.nextMilestone(milestone, WORDS[milestone - 1].cov.toFixed(0)) : S.allLearned),
    ),
  );

  const side = h('div', { class: 'grid-3' },
    h('a', { class: 'card link-card', href: sentenceCount >= 4 ? '#/learn?mode=sentences' : '#/words' },
      h('div', { class: 'kicker' }, S.sentences),
      h('h3', null, sentenceCount ? S.canRead(sentenceCount) : S.sentencesLocked),
      h('p', { class: 'muted small' }, S.sentencesBody),
    ),
    nextLesson
      ? h('a', { class: 'card link-card', href: `#/grammar/${nextLesson.id}` },
        h('div', { class: 'kicker' }, S.grammarOf(LESSONS.indexOf(nextLesson) + 1, LESSONS.length)),
        h('h3', null, rich(nextLesson.title)),
        h('p', { class: 'muted small' }, rich(nextLesson.blurb)))
      : h('a', { class: 'card link-card', href: '#/grammar' }, h('div', { class: 'kicker' }, S.grammar), h('h3', null, S.allLessonsDone), h('p', { class: 'muted small' }, S.revisit)),
    h('a', { class: 'card link-card', href: c.learned >= 4 ? '#/learn?mode=dictation' : '#/learn' },
      h('div', { class: 'kicker' }, S.dictation),
      h('h3', null, c.learned >= 4 ? S.listenType : S.dictationLocked),
      h('p', { class: 'muted small' }, S.dictationBody),
    ),
  );

  app.replaceChildren(h('div', { class: 'page home' },
    h('header', { class: 'hero' },
      h('div', null, h('h1', { lang: T }, greeting[0]), h('p', { class: 'hero-sub' }, greeting[1])),
      h('div', { class: `streak ${sk.doneToday ? 'lit' : ''}`, title: sk.doneToday ? S.streakLit : S.streakUnlit },
        h('span', { class: 'streak-n' }, String(sk.count)), h('span', { class: 'streak-l' }, S.dayStreak)),
    ),
    todayCard, progressCard, side, pathSection(),
    h('p', { class: 'foot muted small' }, h('a', { href: '#/method' }, S.howItWorks)),
  ));
}

function pathSection() {
  const st = get();
  const stages = [];
  for (let s = 0; s * STAGE_SIZE < TOTAL; s++) {
    const from = s * STAGE_SIZE;
    const to = Math.min(TOTAL, from + STAGE_SIZE);
    const learned = WORDS.slice(from, to).filter((w) => st.words[w.word]?.i > 0).length;
    const cells = [];
    for (let u = from / UNIT_SIZE; u * UNIT_SIZE < to; u++) {
      const ws = WORDS.slice(u * UNIT_SIZE, (u + 1) * UNIT_SIZE);
      const done = ws.filter((w) => st.words[w.word]?.i > 0).length;
      const frac = done / ws.length;
      cells.push(h('a', {
        class: `unit ${frac === 1 ? 'full' : frac > 0 ? 'part' : ''}`, href: `#/words?unit=${u + 1}`,
        style: { '--fill': `${Math.round(frac * 100)}%` },
        title: S.unitTitle(u + 1, u * UNIT_SIZE + 1, u * UNIT_SIZE + ws.length, done),
        'aria-label': S.unitAria(u + 1, done, ws.length),
      }, String(u + 1)));
    }
    const [name, meaning] = C.stages[s] || [S.stage(s + 1), ''];
    stages.push(h('div', { class: 'stage-block' },
      h('div', { class: 'stage-head' },
        h('div', null, h('span', { class: 'stage-n' }, S.stage(s + 1)), h('strong', { lang: T }, name), h('span', { class: 'muted' }, ` · ${meaning}`)),
        h('div', { class: 'muted small' }, `${learned}/${to - from} · ${S.reaches(WORDS[to - 1].cov.toFixed(0))}`),
      ),
      h('div', { class: 'units' }, cells),
    ));
  }
  return h('section', { class: 'card path' }, h('div', { class: 'kicker' }, S.path), h('h2', null, S.pathTitle(TOTAL, UNITS)), stages);
}

function welcomeView() {
  let goal = settings().newPerDay;
  const picker = h('div', { class: 'goal-picker', role: 'radiogroup', 'aria-label': S.newPerDay });
  const paint = () => picker.replaceChildren(...S.goals.map(([n, name, time]) => h('button', {
    class: `goal ${goal === n ? 'on' : ''}`, role: 'radio', 'aria-checked': String(goal === n), onclick: () => { goal = n; paint(); },
  }, h('b', null, S.goalWords(n)), h('span', null, name), h('span', { class: 'muted small' }, time))));
  paint();
  const eta = h('p', { class: 'muted small' });
  const paintEta = () => { eta.textContent = S.eta(goal, TOTAL, Math.ceil(TOTAL / goal / 30)); };
  picker.addEventListener('click', paintEta);
  paintEta();
  app.replaceChildren(h('div', { class: 'page welcome' },
    h('header', { class: 'hero tall' },
      h('div', null,
        h('p', { class: 'hero-sub' }, S.heroSub),
        h('h1', null, S.welcomeTitle(TOTAL)),
        h('p', { class: 'lead' }, S.welcomeLead(TOTAL, WORDS[TOTAL - 1].cov.toFixed(0))),
      ),
    ),
    methodGrid(),
    h('section', { class: 'card' },
      h('div', { class: 'kicker' }, S.pace),
      h('h2', null, S.howMany),
      picker, eta,
      h('div', { class: 'actions start' }, h('button', { class: 'btn primary big', onclick: () => { setSetting('newPerDay', goal); get().onboarded = true; save(); go('learn'); } }, S.startLearning)),
      h('p', { class: 'muted small' }, S.noAccount),
    ),
  ));
}

function methodView() {
  const m = S.method;
  app.replaceChildren(h('div', { class: 'page narrow' },
    h('header', { class: 'page-head' }, h('h1', null, m.title), h('p', { class: 'muted' }, m.sub)),
    methodGrid(),
    h('section', { class: 'card prose' }, m.sections.map((sec) => [
      h('h2', null, sec.h),
      (sec.p || []).map((p) => h('p', null, p)),
      sec.ul ? h('ul', null, sec.ul.map((li) => h('li', null, li))) : null,
    ])),
    h('div', { class: 'actions start' }, h('a', { class: 'btn primary', href: '#/' }, S.backHome)),
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
  const countEl = h('div', { class: 'muted small' });

  const matches = (w) => {
    if (unit && w.unit !== unit - 1) return false;
    const s = statusOf(st.words[w.word]);
    if (filter === 'new' && s !== 'new') return false;
    if (filter === 'learning' && !(s === 'learning' || s === 'young')) return false;
    if (filter === 'known' && !(s === 'familiar' || s === 'mastered')) return false;
    if (!query) return true;
    const q = norm(query);
    return norm(w.word).includes(q) || w.gloss.some((g) => norm(g).includes(q)) || [...w.forms, ...w.alt, w.root].some((f) => f && norm(f) === q);
  };

  const paint = () => {
    const found = WORDS.filter(matches);
    countEl.textContent = S.countWords(found.length);
    list.replaceChildren(...found.slice(0, limit).map((w) => {
      const s = statusOf(st.words[w.word]);
      return h('button', { class: 'word-row', onclick: () => openWord(w, paint) },
        h('span', { class: 'rank' }, String(w.rank)),
        h('span', { class: 'w-target', lang: T }, w.word),
        h('span', { class: 'w-tr' }, w.gloss.join('; ')),
        h('span', { class: 'w-pos' }, posLabel(w)),
        h('span', { class: `dot ${s}`, title: S.status[s] }),
      );
    }));
    if (!found.length) list.append(h('p', { class: 'muted empty' }, S.noMatch));
    if (found.length > limit) list.append(h('button', { class: 'btn ghost more', onclick: () => { limit += 200; paint(); } }, S.showMore(found.length - limit)));
  };

  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': S.filterAria });
  const paintChips = () => chips.replaceChildren(...['all', 'new', 'learning', 'known'].map((k) =>
    h('button', { class: `chip-btn ${filter === k ? 'on' : ''}`, 'aria-pressed': String(filter === k), onclick: () => { filter = k; limit = 100; paintChips(); paint(); } }, S.filters[k])));
  paintChips();

  const unitSel = h('select', { 'aria-label': S.unit, onchange: (e) => { unit = Number(e.target.value); limit = 100; paint(); } },
    h('option', { value: '0' }, S.allUnits),
    Array.from({ length: UNITS }, (_, i) => h('option', { value: String(i + 1), selected: unit === i + 1 }, S.unitOption(i + 1, i * UNIT_SIZE + 1, Math.min(TOTAL, (i + 1) * UNIT_SIZE)))),
  );
  const search = h('input', { type: 'search', placeholder: S.searchPlaceholder, 'aria-label': S.searchAria, oninput: (e) => { query = e.target.value; limit = 100; paint(); } });

  app.replaceChildren(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', null, S.wordList), h('p', { class: 'muted' }, S.wordListSub(TOTAL))),
    h('div', { class: 'toolbar' }, search, unitSel),
    h('div', { class: 'toolbar' }, chips, countEl),
    h('div', { class: 'legend' }, ['new', 'learning', 'young', 'familiar', 'mastered'].map((s) => h('span', null, h('span', { class: `dot ${s}` }), S.status[s]))),
    list,
  ));
  paint();
}

// ---------- grammar ----------

function grammarView() {
  const st = get();
  app.replaceChildren(h('div', { class: 'page narrow' },
    h('header', { class: 'page-head' }, h('h1', null, S.grammar), h('p', { class: 'muted' }, S.grammarSub(LESSONS.length))),
    h('div', { class: 'lesson-list' }, LESSONS.map((l, i) => {
      const done = st.grammar[l.id];
      return h('a', { class: `card lesson-card ${done ? 'done' : ''}`, href: `#/grammar/${l.id}` },
        h('div', { class: 'lesson-n' }, done ? '✓' : String(i + 1)),
        h('div', null, h('h3', null, rich(l.title)), h('p', { class: 'muted small' }, rich(l.blurb)),
          done ? h('p', { class: 'small done-note' }, S.lessonCompleted(done.score, l.quiz.length)) : null),
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
    s.h ? h('h2', null, rich(s.h)) : null,
    (s.p || []).map((p) => h('p', null, rich(p))),
    s.table ? table(s.table) : null,
    s.ex ? h('div', { class: 'examples' }, s.ex.map(([target, meaning]) => h('div', { class: 'ex-row' },
      h('div', { class: 'ex-target', lang: T }, target, audioButton(target.replace(/[→/]/g, ','))), h('div', { class: 'ex-tr' }, meaning)))) : null,
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
          h('h3', null, score === lesson.quiz.length ? S.perfect : S.scored(score, lesson.quiz.length)),
          h('p', { class: 'muted' }, S.lessonDone),
          h('div', { class: 'actions start wrap' },
            nextL ? h('a', { class: 'btn primary', href: `#/grammar/${nextL.id}` }, S.nextLesson(nextL.title.replace(/\*/g, ''))) : null,
            h('a', { class: 'btn ghost', href: '#/grammar' }, S.allLessons))));
        result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    } }, h('span', { class: 'choice-text' }, rich(o))));
    return h('div', { class: 'quiz-q' }, h('p', { class: 'q' }, h('span', { class: 'q-n' }, `${qi + 1}.`), ' ', rich(q.q)), h('div', { class: 'choices' }, buttons), why);
  });

  app.replaceChildren(h('div', { class: 'page narrow lesson' },
    h('a', { class: 'back', href: '#/grammar' }, S.backLessons),
    h('header', { class: 'page-head' }, h('div', { class: 'kicker' }, S.lessonOf(idx + 1, LESSONS.length)), h('h1', null, rich(lesson.title)), h('p', { class: 'lead' }, rich(lesson.blurb))),
    h('div', { class: 'card prose' }, sections),
    h('section', { class: 'card' }, h('div', { class: 'kicker' }, S.checkYourself), h('h2', null, S.quickQuiz), quiz),
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
  for (const w of WORDS) by[statusOf(st.words[w.word])]++;

  let t7 = 0, ok7 = 0;
  for (let d = day - 6; d <= day; d++) { const x = st.days[d]; if (x) { t7 += x.t; ok7 += x.ok; } }

  const longDay = (d) => dayLabel(d, { weekday: 'long', day: 'numeric', month: 'short' });
  const activity = [];
  for (let d = day - 13; d <= day; d++) {
    const x = st.days[d] || { t: 0, s: 0 };
    activity.push({ value: x.t + x.s, unit: S.answers, name: longDay(d), tick: dayLabel(d, { weekday: 'narrow' }), strong: d === day });
  }
  const forecast = [];
  for (let d = day; d < day + 7; d++) {
    let n = 0;
    for (const w of WORDS) { const s = st.words[w.word]; if (s && s.i > 0 && (d === day ? s.d <= d : s.d === d)) n++; }
    forecast.push({ value: n, unit: S.reviewsUnit, name: d === day ? S.today : longDay(d), tick: d === day ? S.today : dayLabel(d, { weekday: 'short' }), strong: d === day });
  }

  const order = ['mastered', 'familiar', 'young', 'learning', 'new'];
  const grammarDone = LESSONS.filter((l) => st.grammar[l.id]).length;

  app.replaceChildren(h('div', { class: 'page' },
    h('header', { class: 'page-head' }, h('h1', null, S.progress)),
    h('div', { class: 'stat-tiles' },
      [[sk.count, S.dayStreak], [S.num(c.learned), S.pLearned], [pct(coverage()), S.pSpeech], [t7 ? `${Math.round((ok7 / t7) * 100)}%` : '–', S.pAccuracy], [`${grammarDone}/${LESSONS.length}`, S.pLessons]]
        .map(([n, l]) => h('div', { class: 'card stat-tile' }, h('div', { class: 'stat-n' }, String(n)), h('div', { class: 'stat-l' }, l))),
    ),
    h('section', { class: 'card' },
      h('h2', null, S.memory),
      h('p', { class: 'muted small' }, S.memorySub(TOTAL)),
      h('div', { class: 'stack', role: 'img', 'aria-label': order.map((k) => `${S.status[k]} ${by[k]}`).join(', ') },
        order.filter((k) => by[k]).map((k) => h('div', { class: `seg ${k}`, style: { flexGrow: String(by[k]) }, title: `${S.status[k]}: ${by[k]}` }))),
      h('div', { class: 'legend' }, order.map((k) => h('span', null, h('span', { class: `dot ${k}` }), `${S.status[k]} `, h('b', null, String(by[k]))))),
    ),
    h('div', { class: 'grid-2' },
      h('section', { class: 'card' }, h('h2', null, S.activity), h('p', { class: 'muted small' }, S.activitySub), bars(activity, { label: S.answersLabel })),
      h('section', { class: 'card' }, h('h2', null, S.upcoming), h('p', { class: 'muted small' }, S.upcomingSub), bars(forecast, { label: S.reviewsLabel })),
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
    const msg = S.voiceMessage({ has: hasVoice(), lang: (currentVoice()?.lang || '').toLowerCase(), online: voiceIsOnline() });
    voiceRow.replaceChildren(
      row(S.voice, msg, voices.length
        ? h('select', { 'aria-label': S.voice, onchange: (e) => setSetting('voiceURI', e.target.value) },
          voices.map((v) => h('option', { value: v.voiceURI, selected: currentVoice() === v }, `${v.name} (${v.lang}) · ${v.localService ? S.onDevice : S.needsInternet}`)))
        : h('span', { class: 'muted small' }, S.notAvailable)),
      hasVoice() ? row(S.test, null, h('button', { class: 'btn', onclick: () => speak(C.sample) }, S.playSample)) : null,
    );
  };
  paintVoice();
  onVoices(() => { if (voiceRow.isConnected) paintVoice(); });

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      if (!confirm(S.confirmImport)) return;
      importData(text);
      applyTheme();
      alert(S.restored);
      settingsView();
    } catch (err) { alert(err.message || S.cantRead); }
  } });

  app.replaceChildren(h('div', { class: 'page narrow' },
    h('header', { class: 'page-head' }, h('h1', null, S.settings)),
    h('section', { class: 'card' }, h('h2', null, S.study),
      row(S.newPerDay, S.newPerDayHelp, select('newPerDay', S.paces, S.newPerDay, Number)),
      row(S.typing, S.typingHelp, toggle('typing', S.typing)),
    ),
    h('section', { class: 'card' }, h('h2', null, S.sound),
      row(S.audio, S.audioHelp, toggle('audio', S.audio)),
      row(S.autoplay, S.autoplayHelp, toggle('autoplay', S.autoplay)),
      row(S.speed, null, select('rate', S.speeds, S.speed, Number)),
      voiceRow,
    ),
    h('section', { class: 'card' }, h('h2', null, S.appearance),
      row(S.theme, null, select('theme', S.themes, S.theme)),
    ),
    h('section', { class: 'card' }, h('h2', null, S.yourData),
      h('p', { class: 'muted small' }, S.dataHelp),
      h('div', { class: 'actions start wrap' },
        h('button', { class: 'btn', onclick: () => {
          const a = h('a', { href: URL.createObjectURL(new Blob([exportData()], { type: 'application/json' })), download: `${S.exportFile}-${new Date().toISOString().slice(0, 10)}.json` });
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        } }, S.exportBtn),
        h('button', { class: 'btn', onclick: () => fileInput.click() }, S.importBtn),
        fileInput,
        h('button', { class: 'btn danger', onclick: () => { if (confirm(S.confirmReset)) { reset(); applyTheme(); go(''); render(); } } }, S.resetAll),
      ),
    ),
    h('p', { class: 'muted small foot' }, h('a', { href: '#/method' }, S.howItWorks)),
  ));
}

// ---------- boot ----------

applyTheme();
onSetting((k) => { if (k === 'theme') applyTheme(); if (k === 'voiceURI') selectVoice(); });
buildShell();
window.addEventListener('hashchange', render);
render();
