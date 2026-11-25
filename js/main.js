// Entry point: start the chosen course, or ask which one on a first visit.

import { COURSE_ID, COURSES, saveCourse } from './course.js';

function chooser() {
  document.title = 'Lancar · Fasih';
  const app = document.getElementById('app');
  const card = (id, lang, kicker, title, body, button) => `
    <a class="card choose-card" href="?course=${id}" data-id="${id}" lang="${lang}">
      <div class="kicker">${kicker}</div>
      <h2>${title}</h2>
      <p class="muted">${body}</p>
      <span class="btn primary">${button}</span>
    </a>`;
  app.innerHTML = `
    <div class="page chooser">
      <header class="page-head">
        <h1>What would you like to learn?</h1>
        <p class="lead" lang="ms">Apakah yang anda mahu pelajari?</p>
      </header>
      <div class="grid-2">
        ${card('ms', 'en', 'Lancar · for English speakers', 'Learn Malay', 'The 1,500 most-used Malay words, with short grammar lessons. Explained in English.', 'Start')}
        ${card('en', 'ms', 'Fasih · untuk penutur bahasa Melayu', 'Belajar Bahasa Inggeris', '1,500 perkataan Inggeris yang paling kerap digunakan, dengan pelajaran tatabahasa ringkas. Diterangkan dalam bahasa Melayu.', 'Mula')}
      </div>
      <p class="muted small foot">You can switch at any time with the toggle at the top. <span lang="ms">Anda boleh bertukar pada bila-bila masa.</span></p>
    </div>`;
  app.querySelectorAll('.choose-card').forEach((a) => a.addEventListener('click', () => saveCourse(a.dataset.id)));
  document.querySelector('.brand-name').textContent = 'Lancar · Fasih';
}

if (COURSE_ID && COURSES.some((c) => c.id === COURSE_ID)) import('./app.js');
else chooser();
