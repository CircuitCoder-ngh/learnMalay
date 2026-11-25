# Lancar · Fasih: Malay and English through their 1,500 most-used words

One site, two courses, and a toggle at the top to switch between them:

| | Course | For | Interface |
|---|---|---|---|
| **Lancar** | Learn Malay | English speakers | English |
| **Fasih** | Belajar Bahasa Inggeris | Malay speakers | Bahasa Melayu |

Free, no login, runs entirely in the browser, hosted on GitHub Pages. Each course
keeps its own progress in the browser, so switching never loses anything. A link
can open a course directly: `?course=ms` or `?course=en`.

## How it teaches

| Idea | What the app does |
|---|---|
| **Frequency first** | 1,500 words per language, ranked by real-world usage in film and television subtitles. Measured against that corpus, the Malay list covers about 77% of everyday speech (exact word forms) and the English list about 88% (counting go, goes, went together). |
| **Active recall** | Every exercise makes the learner retrieve the word: choose the meaning, choose the word, type it from memory, fill a gap in a sentence, recognise it by ear, or write it from dictation. |
| **Spaced repetition** | An SM-2 style scheduler brings each word back after 1 day, 3 days, a week, and then at growing intervals. Forgotten words return sooner. |
| **Words in context** | Every word has an example sentence with translation. Sentence-building exercises use only sentences made of words the learner already knows. |
| **Word structure** | Malay cards show the root and its family (ajar → belajar, mengajar, pelajar). English cards show irregular forms (went, children, better) and accept American spellings. |
| **Short grammar** | Five-minute lessons with tap-to-hear examples and a quiz: 14 for Malay, 15 for English, the latter written in Malay and focused on what differs from Malay. |
| **Listening** | Uses the device's built-in voices, preferring ones installed on the device over ones streamed from the internet. |

## Run locally

No build step and no dependencies. Serve the folder with any static server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## How it is put together

There is one engine. A course is a language pack plus data:

```
index.html, css/style.css     page shell and styles (one colour theme per course)
js/main.js                    entry: start the chosen course, or ask which one
js/course.js                  which course is active; the toggle's switchCourse()
js/courses/ms.js, en.js       language packs: every piece of interface text, voice
                              preferences, praise words, how to read a data row
js/app.js, session.js, ...    the engine; reads all text from the active language pack
js/data/<course>/words.js     GENERATED word list and starter sentences
js/data/<course>/grammar.js   grammar lessons
content/<course>/words-*.tsv  source vocabulary (edit these)
content/<course>/sentences.tsv  starter sentences from the most frequent words
content/<course>/frequency/   corpus frequency list used for ranking
tools/check-<course>.mjs      validates the TSV files
tools/build-<course>.mjs      ranks, trims to 1,500 and writes words.js
```

`<course>` is `ms` (the Malay course) or `en` (the English course). Progress is
stored under `lancar.v1` and `fasih.v1` in `localStorage`, the keys the two
courses used when they were separate sites, so earlier progress carries over.

### Editing vocabulary

Each line of a `words-*.tsv` file has eight tab-separated columns.

Malay course (`content/ms`):

```
malay  english glosses (; separated)  pos  tier 1-6  root  example (ms)  example (en)  note
```

English course (`content/en`):

```
english  malay glosses (; separated)  pos  tier 1-6  forms  example (en)  example (ms)  note (ms)
```

`forms` lists inflected forms not made by simply adding -s, -es, -d, -ed or -ing
(went, gone; children; bigger, biggest); a form prefixed with `~` is an
alternative spelling (`~color`). After editing:

```sh
node tools/check-ms.mjs content/ms/words-*.tsv && node tools/build-ms.mjs --report
node tools/check-en.mjs content/en/words-*.tsv && node tools/build-en.mjs --report
```

Each build blends corpus frequency (60%) with the editorial tier (40%), keeps the
top 1,500, works out which list words each example sentence uses, and computes
cumulative coverage. Commit the regenerated `words.js`; the deploy workflow fails
if either is out of date.

## Deployment

`.github/workflows/pages.yml` validates the content, rebuilds both word lists and
publishes the site to GitHub Pages on every push. In the repository settings,
**Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## Sources and credits

- Word frequencies: [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
  (`content/2018/ms/ms_50k.txt` and `content/2018/en/en_50k.txt`, CC-BY-SA-4.0),
  derived from the OpenSubtitles 2018 corpus. Subtitles reflect spoken language,
  which suits courses aimed at conversation; they also skew towards film dialogue,
  which is why the ranking is blended with editorial judgement.
- Vocabulary entries, translations, example sentences and grammar lessons were
  written for this project with AI assistance and have not yet been reviewed by a
  native Malay speaker or an English teacher. Corrections are welcome.
