# Lancar: learn Malay through its 1,500 most-used words

An interactive, free, no-login web course for English speakers learning Malay
(Bahasa Melayu as used in Malaysia). It runs entirely in the browser and is
hosted on GitHub Pages.

## How it teaches

| Idea | What the app does |
|---|---|
| **Frequency first** | 1,500 words ranked by real-world usage. Measured against a large subtitle corpus, the first 100 words account for about 48% of everyday speech, the first 500 for about 70%, and all 1,500 for about 77% (exact word forms only; affixed forms of the same roots add more). |
| **Active recall** | Every exercise makes you retrieve the word: choose the meaning, choose the word, type it from memory, fill a gap in a sentence, or recognise it by ear. |
| **Spaced repetition** | An SM-2 style scheduler brings each word back after 1 day, 3 days, a week, and then at growing intervals. Forgotten words return sooner. |
| **Words in context** | Every word has an example sentence with translation. Sentence-building exercises use only sentences made of words you already know. |
| **Roots and families** | Malay builds words from roots plus affixes. Each entry shows its root and the related words on the list (ajar → belajar, mengajar, pelajar, pelajaran). |
| **Short grammar** | 14 five-minute lessons with tap-to-hear examples and a quiz: sounds, word order, pronouns, negation, time markers, questions, numbers, affixes, spoken short forms. |
| **Listening** | Uses the device's built-in Malay voice (falls back to Indonesian). Audio features hide themselves when no suitable voice is installed. |

Progress (schedule, streak, statistics) is stored in the browser's
`localStorage` and can be exported or imported from Settings.

## Run locally

No build step and no dependencies. Serve the folder with any static server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Project layout

```
index.html, css/, js/      the app (plain ES modules)
js/data/words.js           GENERATED word list and starter sentences
js/data/grammar.js         grammar lessons
content/words-*.tsv        source vocabulary (edit these)
content/sentences.tsv      starter sentences built from the top ~200 words
content/frequency/         corpus frequency list used for ranking
tools/check-words.mjs      validates the TSV files
tools/build-data.mjs       ranks, trims to 1,500 and writes js/data/words.js
```

### Editing vocabulary

Each line of `content/words-*.tsv` has eight tab-separated columns:

```
malay  english glosses (; separated)  pos  tier 1-6  root  example (ms)  example (en)  note
```

After editing:

```sh
node tools/check-words.mjs content/words-*.tsv
node tools/build-data.mjs --report
```

The build blends each word's corpus frequency (60%) with the editorial tier
(40%), keeps the top 1,500, works out which list words each example sentence
uses, and computes cumulative coverage. Commit the regenerated
`js/data/words.js`; the deploy workflow fails if it is out of date.

## Deployment

`.github/workflows/pages.yml` validates the content, rebuilds the word list and
publishes the site to GitHub Pages on every push. In the repository settings,
**Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## Sources and credits

- Word frequencies: [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
  (`content/2018/ms/ms_50k.txt`, CC-BY-SA-4.0), derived from the OpenSubtitles
  2018 corpus. Subtitles reflect spoken language, which suits a course aimed at
  conversation; they also skew towards film dialogue, which is why the ranking
  is blended with editorial judgement.
- Vocabulary entries, example sentences and grammar lessons were written for
  this project with AI assistance and have not yet been reviewed by a native
  speaker. Corrections are welcome.
