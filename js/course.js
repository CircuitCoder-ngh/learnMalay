// Which course is active. The site holds two: Malay for English speakers ("ms") and
// English for Malay speakers ("en"). The choice is remembered in the browser, and
// "?course=en" in a link selects one directly.

export const COURSES = [
  { id: 'ms', label: 'Learn Malay', lang: 'en' },
  { id: 'en', label: 'Belajar Inggeris', lang: 'ms' },
];
const IDS = COURSES.map((c) => c.id);
const KEY = 'course';

function stored(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function saveCourse(id) {
  try { localStorage.setItem(KEY, id); } catch { /* storage blocked: the choice lasts for this visit only */ }
}

function detect() {
  const fromUrl = new URLSearchParams(location.search).get('course');
  if (IDS.includes(fromUrl)) {
    saveCourse(fromUrl);
    history.replaceState(null, '', location.pathname + location.hash);
    return fromUrl;
  }
  const saved = stored(KEY);
  if (IDS.includes(saved)) return saved;
  // Someone who used one of the two earlier, separate sites goes straight back to their course.
  const ms = !!stored('lancar.v1');
  const en = !!stored('fasih.v1');
  if (ms !== en) return ms ? 'ms' : 'en';
  return null;
}

export const COURSE_ID = detect();

export function switchCourse(id) {
  if (!IDS.includes(id) || id === COURSE_ID) return;
  saveCourse(id);
  location.href = `${location.pathname}?course=${id}#/`;
}

// The active course's settings and interface text (see js/courses/).
export const C = COURSE_ID ? (await import(`./courses/${COURSE_ID}.js`)).default : null;
export const S = C ? C.S : null;
