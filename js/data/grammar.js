// Grammar lessons. Text markup: *word* = Malay term, **text** = emphasis.
// Each section, rendered in this order: { h: heading, p: [paragraphs], table: { head, rows }, ex: [[malay, english], ...], after: [paragraphs], tip }
// Quiz item: { q, opts, a: index of the right option, why }

export const LESSONS = [
  {
    id: 'sounds',
    title: 'Sounds & spelling',
    blurb: 'Malay is written the way it is spoken. Ten minutes here and you can read any word aloud.',
    sections: [
      {
        h: 'Good news first',
        p: [
          'Malay uses the Latin alphabet, has no tones, and every letter is pronounced the same way almost every time. Once you know the rules below you can pronounce any word you see, and spell any word you hear.',
        ],
      },
      {
        h: 'Vowels',
        table: {
          head: ['Letter', 'Sounds like', 'Examples'],
          rows: [
            ['a', '"a" in father', '*makan*, *apa*'],
            ['i', '"ee" in see', '*ini*, *pagi*'],
            ['u', '"oo" in food', '*buku*, *susu*'],
            ['o', '"o" in more', '*orang*, *tolong*'],
            ['e (most words)', 'the weak "a" in about', '*besar*, *kereta*, *enam*'],
            ['e (some words)', '"e" in bed', '*meja*, *merah*, *esok*'],
          ],
        },
        after: [
          'The two *e* sounds are spelled the same, so learn each word by listening. The weak one is far more common.',
          'In much of Malaysia a final *a* is relaxed to the same weak sound: *saya* is often heard as "sa-yuh". Saying a clear "a" is also fine and understood everywhere.',
        ],
      },
      {
        h: 'Consonants worth noticing',
        table: {
          head: ['Spelling', 'Sounds like', 'Examples'],
          rows: [
            ['c', 'always "ch" in chair', '*cari*, *cuci*, *kecil*'],
            ['g', 'always hard, as in go', '*pergi*, *gigi*'],
            ['ng', '"ng" in singer (no hard g)', '*dengan*, *orang*'],
            ['ngg', '"ng" + g, as in finger', '*tunggu*, *tinggal*'],
            ['ny', '"ny" in canyon', '*banyak*, *tanya*'],
            ['sy', '"sh" in shop', '*syarikat*, *isyarat*'],
            ['kh', 'a soft, throaty k/h', '*khabar*, *akhir*'],
            ['r', 'lightly tapped or rolled', '*rumah*, *baru*'],
            ['final k', 'cut off in the throat, not released', '*tidak*, *banyak*, *baik*'],
            ['final h', 'a soft breath, always audible', '*rumah*, *sudah*, *boleh*'],
          ],
        },
      },
      {
        h: 'Vowel pairs and rhythm',
        p: [
          'At the end of a word, *ai* sounds like "eye" (*pandai*, *sampai*) and *au* like "ow" (*pulau*, *kalau*). Elsewhere, two vowels side by side are usually pronounced separately: *ba-ik*, *la-ut*, *ma-in*.',
          'Stress is light and even. If anything, lean gently on the second-last syllable: *ma-KAN-an*, *se-KO-lah*. Never swallow syllables the way English does.',
        ],
        tip: 'Tap the speaker button on any word in this app and repeat it out loud. Saying words aloud strengthens memory far more than reading silently.',
      },
    ],
    quiz: [
      { q: 'How is the "c" in *cari* (to look for) pronounced?', opts: ['like "k"', 'like "s"', 'like "ch"', 'like "ts"'], a: 2, why: 'c is always "ch": cha-ri.' },
      { q: 'Which word has a hard "g" sound after the "ng", as in "finger"?', opts: ['dengan', 'tunggu', 'orang', 'bunga'], a: 1, why: 'Double g (ngg) adds the hard g: tung-gu. A single ng never has it.' },
      { q: 'What happens to the final "k" in *tidak*?', opts: ['It is strongly released', 'It is silent with a long vowel', 'It is cut off in the throat', 'It becomes "g"'], a: 2, why: 'A final k is a glottal stop: the sound is stopped in the throat.' },
      { q: 'How is "sy" in *syarikat* (company) pronounced?', opts: ['"s" + "y"', '"sh"', '"z"', '"ch"'], a: 1, why: 'sy is the English "sh" sound.' },
      { q: 'Which syllable gets the light stress in *sekolah*?', opts: ['se', 'ko', 'lah', 'none: Malay has tones'], a: 1, why: 'Stress falls gently on the second-last syllable: se-KO-lah.' },
    ],
  },
  {
    id: 'sentences',
    title: 'Building a sentence',
    blurb: 'Subject, verb, object. No "is", no "the", no verb endings.',
    sections: [
      {
        h: 'Same order as English',
        p: ['The basic order is subject, verb, object, exactly as in English.'],
        ex: [
          ['Saya makan nasi.', 'I eat rice.'],
          ['Dia suka kopi.', 'She likes coffee.'],
          ['Mereka belajar bahasa Melayu.', 'They study Malay.'],
        ],
      },
      {
        h: 'No "am / is / are"',
        p: ['To say what something is or what it is like, just put the two parts next to each other.'],
        ex: [
          ['Saya guru.', 'I am a teacher.'],
          ['Dia penat.', 'He is tired.'],
          ['Rumah itu besar.', 'That house is big.'],
        ],
        tip: 'In formal writing you will see *ialah* and *adalah* linking two parts ("Kuala Lumpur ialah ibu negara Malaysia"). You can understand them as "is" and leave them out when you speak.',
      },
      {
        h: 'No "a" or "the", and verbs never change',
        p: [
          '*Saya beli buku* can mean "I buy a book", "I bought the book" or "I am buying books". There are no articles, no plural endings and no verb forms for person or tense. Context does the work, and when it matters you add a small word (see the lessons on time and on counting).',
        ],
      },
      {
        h: 'Describing words come after the noun',
        p: ['This is the one big difference from English. Anything that describes a noun follows it: adjectives, owners, and *ini* (this) / *itu* (that).'],
        ex: [
          ['rumah besar', 'a big house'],
          ['rumah saya', 'my house'],
          ['rumah ini', 'this house'],
          ['kedai kopi', 'coffee shop (literally "shop coffee")'],
          ['kereta baru saya', 'my new car'],
        ],
      },
      {
        h: 'Word order changes the meaning',
        ex: [
          ['Rumah itu besar.', 'That house is big. (a full sentence)'],
          ['rumah besar itu', 'that big house (just a phrase)'],
        ],
        after: ['When *itu* or *ini* comes straight after the noun, it closes the noun phrase and what follows is a statement about it.'],
      },
    ],
    quiz: [
      { q: 'How do you say "my friend"?', opts: ['saya kawan', 'kawan saya', 'kawan ke saya', 'saya punya kawan itu'], a: 1, why: 'The owner follows the noun: kawan saya.' },
      { q: 'What does *Dia doktor* mean?', opts: ['His doctor', 'She has a doctor', 'He/She is a doctor', 'The doctor is there'], a: 2, why: 'No word for "is" is needed. "His doctor" would be doktor dia.' },
      { q: 'Choose the correct phrase for "a red car".', opts: ['merah kereta', 'kereta merah', 'kereta yang merah itu', 'sebuah merah kereta'], a: 1, why: 'Adjectives follow the noun: kereta merah.' },
      { q: '*Buku ini mahal.* means:', opts: ['this expensive book', 'This book is expensive.', 'Books are expensive here.', 'an expensive book'], a: 1, why: 'ini closes the noun phrase "buku ini", so "mahal" is a statement about it.' },
      { q: 'Which is the natural order for "that new shop"?', opts: ['itu baru kedai', 'kedai itu baru', 'baru kedai itu', 'kedai baru itu'], a: 3, why: 'Noun, then adjective, then itu: kedai baru itu. ("Kedai itu baru" is a sentence: That shop is new.)' },
    ],
  },
  {
    id: 'pronouns',
    title: 'Pronouns & politeness',
    blurb: 'One word for he and she, two words for we, and several ways to say you.',
    sections: [
      {
        h: 'The core set',
        table: {
          head: ['Malay', 'English', 'When'],
          rows: [
            ['*saya*', 'I, me', 'polite and neutral: safe with everyone'],
            ['*aku*', 'I, me', 'close friends, family, songs, prayer'],
            ['*awak*', 'you', 'friendly, between equals'],
            ['*kamu*', 'you', 'to someone younger; common in writing'],
            ['*anda*', 'you', 'formal and impersonal: adverts, forms, speeches'],
            ['*kau / engkau*', 'you', 'very close friends; rude with strangers'],
            ['*dia*', 'he, she, him, her', 'no gender distinction'],
            ['*beliau*', 'he, she', 'for respected people'],
            ['*kita*', 'we, us (including you)', '"you and I"'],
            ['*kami*', 'we, us (not you)', '"my group, without you"'],
            ['*mereka*', 'they, them', ''],
          ],
        },
        p: ['Pronouns never change form: *saya* is I, me and (after a noun) my.'],
      },
      {
        h: 'Kita or kami?',
        ex: [
          ['Kita pergi sekarang.', "We're going now. (you are coming too)"],
          ['Kami pergi sekarang.', "We're going now. (you are staying)"],
        ],
      },
      {
        h: 'Titles instead of "you"',
        p: [
          'Malaysians often avoid a direct "you" with people they do not know well. They use a title or a family word instead, even with strangers: *encik* (sir, Mr), *puan* (madam, Mrs), *cik* (Miss), *abang* (older brother: a slightly older man), *kakak* (older sister), *adik* (younger sibling: a child or younger person), *pak cik* and *mak cik* (uncle, auntie: older people).',
        ],
        ex: [
          ['Encik nak minum apa?', 'What would you like to drink, sir?'],
          ['Kakak tinggal di mana?', 'Where do you live? (to a slightly older woman)'],
        ],
      },
      {
        h: 'Possession and the endings -ku, -mu, -nya',
        p: ['Put the owner after the thing owned. Three pronouns also have short forms that attach to the noun.'],
        ex: [
          ['nama saya', 'my name'],
          ['rumah mereka', 'their house'],
          ['bukuku / bukumu', 'my book / your book (from aku, kamu)'],
          ['namanya', 'his name, her name, its name'],
          ['Harganya mahal.', 'The price (of it) is high.'],
        ],
        tip: 'You will see *-nya* constantly. Besides "his/her/its" it often just means "the": *Makanannya sedap* = "The food is tasty".',
      },
    ],
    quiz: [
      { q: 'You tell a friend "We (my family, not you) are going to Penang." Which word for "we"?', opts: ['kita', 'kami', 'mereka', 'kamu'], a: 1, why: 'kami leaves out the person you are talking to.' },
      { q: 'Which "I" is safe in every situation?', opts: ['aku', 'kau', 'saya', 'beliau'], a: 2, why: 'saya is polite and neutral.' },
      { q: '*Keretanya baru.* means:', opts: ['I have a new car.', 'His/Her car is new.', 'The new car is theirs.', 'Your car is new.'], a: 1, why: '-nya = his / her / its (or "the").' },
      { q: 'How would you politely ask an older shopkeeper "Do you have water?"', opts: ['Kau ada air?', 'Aku ada air?', 'Pak cik ada air?', 'Mereka ada air?'], a: 2, why: 'A title like pak cik replaces "you" politely. kau would be rude here.' },
      { q: '*dia* can mean:', opts: ['only "he"', 'only "she"', '"he" or "she"', '"they"'], a: 2, why: 'Malay pronouns have no gender.' },
    ],
  },
  {
    id: 'negation',
    title: 'Saying no: tidak, bukan, jangan, belum',
    blurb: 'Four small words cover every kind of "not".',
    sections: [
      {
        h: 'tidak: with verbs and adjectives',
        p: ['Put *tidak* in front of what you are negating. In speech it is almost always shortened to *tak*.'],
        ex: [
          ['Saya tidak tahu.', "I don't know."],
          ['Dia tak lapar.', "He isn't hungry."],
          ['Kami tidak tinggal di sini.', "We don't live here."],
        ],
      },
      {
        h: 'bukan: with nouns and pronouns',
        p: ['Use *bukan* to say that something is not a certain thing or person. It also corrects a wrong assumption ("not X, but Y").'],
        ex: [
          ['Dia bukan doktor.', 'She is not a doctor.'],
          ['Ini bukan kereta saya.', 'This is not my car.'],
          ['Bukan esok, lusa.', 'Not tomorrow, the day after.'],
        ],
        tip: 'At the end of a sentence, *bukan?* (spoken: *kan?*) is a tag question: *Sedap, kan?* = "Tasty, isn\'t it?"',
      },
      {
        h: "jangan: don't!",
        ex: [
          ['Jangan lupa.', "Don't forget."],
          ['Jangan risau.', "Don't worry."],
          ['Jangan masuk.', 'Do not enter.'],
        ],
      },
      {
        h: 'belum: not yet',
        p: ['If something has not happened but still might, Malay prefers *belum* to *tidak*. The natural answer to a "have you...?" question is *sudah* (already) or *belum* (not yet).'],
        ex: [
          ['Saya belum makan.', "I haven't eaten yet."],
          ['Sudah siap? Belum.', 'Ready? Not yet.'],
        ],
      },
      {
        h: 'tiada / tak ada: there is none',
        ex: [
          ['Tiada masalah.', 'No problem.'],
          ['Saya tak ada duit.', "I don't have any money."],
        ],
      },
      {
        h: 'Answering yes and no',
        p: ['*Ya* means yes and *tidak / tak* means no, but the most natural answer simply repeats the key word of the question.'],
        ex: [
          ['Awak lapar? Lapar.', 'Are you hungry? Yes. (literally "Hungry.")'],
          ['Boleh masuk? Boleh.', 'May I come in? Yes, you may.'],
          ['Awak guru? Bukan.', 'Are you a teacher? No.'],
        ],
      },
    ],
    quiz: [
      { q: 'Saya ___ faham. (I don\'t understand.)', opts: ['bukan', 'tidak', 'jangan', 'tiada'], a: 1, why: 'faham is a verb, so tidak.' },
      { q: 'Itu ___ rumah saya. (That is not my house.)', opts: ['tidak', 'belum', 'bukan', 'jangan'], a: 2, why: 'rumah is a noun, so bukan.' },
      { q: '___ bising! (Don\'t be noisy!)', opts: ['Bukan', 'Tidak', 'Belum', 'Jangan'], a: 3, why: 'Negative commands use jangan.' },
      { q: '"Sudah mandi?" A natural "no" answer is:', opts: ['Bukan.', 'Belum.', 'Jangan.', 'Tiada.'], a: 1, why: 'Not yet: belum.' },
      { q: '*Mahal, kan?* means:', opts: ['Is it not expensive?', "Expensive, isn't it?", "Don't be expensive.", "It can't be expensive."], a: 1, why: 'kan (from bukan) is a tag question.' },
    ],
  },
  {
    id: 'time',
    title: 'Past, present and future without tenses',
    blurb: 'Verbs never change. A handful of marker words tell you when.',
    sections: [
      {
        h: 'Let time words do the work',
        p: ['*Saya makan* can be "I eat", "I ate" or "I will eat". Usually a time word makes it clear.'],
        ex: [
          ['Semalam saya pergi ke pasar.', 'Yesterday I went to the market.'],
          ['Sekarang saya pergi ke pasar.', "Now I'm going to the market."],
          ['Esok saya pergi ke pasar.', "Tomorrow I'll go to the market."],
        ],
      },
      {
        h: 'Markers that go before the verb',
        table: {
          head: ['Marker', 'Meaning', 'Example'],
          rows: [
            ['*sudah* (spoken: *dah*), *telah*', 'already; done', '*Saya sudah makan.* I have eaten.'],
            ['*sedang* (spoken: *tengah*)', 'in the middle of', '*Dia sedang tidur.* He is sleeping.'],
            ['*akan*', 'will', '*Mereka akan datang.* They will come.'],
            ['*belum*', 'not yet', '*Dia belum sampai.* She has not arrived yet.'],
            ['*pernah*', 'ever; once before', '*Saya pernah ke Melaka.* I have been to Melaka.'],
            ['*baru*', 'just (now)', '*Dia baru sampai.* He has just arrived.'],
            ['*masih*', 'still', '*Adik masih belajar.* My little brother is still studying.'],
          ],
        },
      },
      {
        h: 'Useful combinations',
        ex: [
          ['Saya tak pernah makan durian.', 'I have never eaten durian.'],
          ['Dia masih belum bangun.', 'He still has not got up.'],
          ['Awak dah makan?', 'Have you eaten? (also a friendly greeting)'],
        ],
        tip: 'Do not add a marker to every sentence. If the time is obvious from context, Malay speakers simply leave it out.',
      },
    ],
    quiz: [
      { q: 'Which sentence means "I have already paid"?', opts: ['Saya akan bayar.', 'Saya sudah bayar.', 'Saya sedang bayar.', 'Saya belum bayar.'], a: 1, why: 'sudah marks a completed action.' },
      { q: '*Dia sedang mandi.* means:', opts: ['He will take a bath.', 'He has taken a bath.', 'He is taking a bath.', 'He never takes a bath.'], a: 2, why: 'sedang = in the middle of doing.' },
      { q: 'Saya ___ pergi ke Jepun. (I have been to Japan before.)', opts: ['akan', 'masih', 'pernah', 'belum'], a: 2, why: 'pernah marks an experience at some time in the past.' },
      { q: 'How does the verb *makan* change for the past tense?', opts: ['makan-ed', 'memakan', 'dimakan', 'It does not change'], a: 3, why: 'Malay verbs never change for tense.' },
      { q: '*Mereka akan datang esok.* means:', opts: ['They came yesterday.', 'They will come tomorrow.', 'They are coming now.', 'They have not come yet.'], a: 1, why: 'akan = will; esok = tomorrow.' },
    ],
  },
  {
    id: 'questions',
    title: 'Asking questions',
    blurb: 'Raise your voice at the end, or drop in one of eight question words.',
    sections: [
      {
        h: 'Yes / no questions',
        p: ['The simplest way: say the statement with a rising voice. Speech often adds *ke* at the end; formal writing puts *Adakah* at the front.'],
        ex: [
          ['Awak sudah makan?', 'Have you eaten?'],
          ['Awak nak pergi ke?', 'Do you want to go? (casual)'],
          ['Adakah anda setuju?', 'Do you agree? (formal)'],
        ],
      },
      {
        h: 'Question words',
        table: {
          head: ['Malay', 'English', 'Example'],
          rows: [
            ['*apa*', 'what', '*Ini apa?* What is this?'],
            ['*siapa*', 'who', '*Siapa nama awak?* What is your name? (literally "who")'],
            ['*di mana / ke mana / dari mana*', 'where / where to / where from', '*Tandas di mana?* Where is the toilet?'],
            ['*bila*', 'when', '*Bila awak balik?* When are you going home?'],
            ['*kenapa* (formal: *mengapa*)', 'why', '*Kenapa dia marah?* Why is he angry?'],
            ['*bagaimana* (spoken: *macam mana*)', 'how', '*Macam mana nak ke sana?* How do I get there?'],
            ['*berapa*', 'how much, how many', '*Berapa harga ini?* How much is this?'],
            ['*yang mana*', 'which (one)', '*Yang mana satu?* Which one?'],
          ],
        },
      },
      {
        h: 'The question word can stay in place',
        p: ['English moves the question word to the front. Malay often leaves it exactly where the answer would be.'],
        ex: [
          ['Awak nak makan apa?', 'What do you want to eat? ("You want to eat what?")'],
          ['Awak tinggal di mana?', 'Where do you live?'],
          ['Ini berapa?', 'How much is this?'],
        ],
      },
      {
        h: 'Handy "berapa" questions',
        ex: [
          ['Pukul berapa sekarang?', 'What time is it now?'],
          ['Berapa lama?', 'How long?'],
          ['Berapa umur awak?', 'How old are you?'],
        ],
      },
    ],
    quiz: [
      { q: 'Which word asks "how much"?', opts: ['bila', 'berapa', 'siapa', 'kenapa'], a: 1, why: 'berapa = how much / how many.' },
      { q: '*Awak nak pergi ke mana?* means:', opts: ['When do you want to go?', 'Why do you want to go?', 'Where do you want to go?', 'Who do you want to go with?'], a: 2, why: 'ke mana = where to.' },
      { q: 'To ask someone\'s name, Malay literally asks:', opts: ['"What is your name?"', '"Who is your name?"', '"How is your name?"', '"Which is your name?"'], a: 1, why: 'Siapa nama awak? Names are asked with siapa (who).' },
      { q: 'The casual spoken form of *bagaimana* is:', opts: ['macam mana', 'yang mana', 'di mana', 'apa-apa'], a: 0, why: 'macam mana = how, in everyday speech.' },
      { q: '*Pukul berapa?* asks about:', opts: ['the price', 'the time', 'the quantity', 'the reason'], a: 1, why: 'Pukul berapa? = What time?' },
    ],
  },
  {
    id: 'numbers',
    title: 'Numbers & counting words',
    blurb: 'Ten digits and four building blocks give you every number.',
    sections: [
      {
        h: 'Zero to ten',
        table: {
          head: ['0', '1', '2', '3', '4', '5'],
          rows: [
            ['*kosong*', '*satu*', '*dua*', '*tiga*', '*empat*', '*lima*'],
            ['**6**', '**7**', '**8**', '**9**', '**10**', ''],
            ['*enam*', '*tujuh*', '*lapan*', '*sembilan*', '*sepuluh*', ''],
          ],
        },
      },
      {
        h: 'Building bigger numbers',
        p: ['Four blocks: *belas* (-teen), *puluh* (tens), *ratus* (hundreds), *ribu* (thousands). "One" in front of a block shrinks to the prefix *se-*.'],
        ex: [
          ['sebelas, dua belas, lima belas', '11, 12, 15'],
          ['dua puluh, tiga puluh lima', '20, 35'],
          ['seratus, empat ratus', '100, 400'],
          ['seribu, sepuluh ribu', '1,000, 10,000'],
          ['seribu dua ratus lima puluh', '1,250'],
          ['satu juta', '1,000,000'],
        ],
      },
      {
        h: 'First, second, third',
        p: ['Add *ke-* to the number. "First" is the exception: *pertama*.'],
        ex: [['pertama, kedua, ketiga, kesepuluh', 'first, second, third, tenth']],
      },
      {
        h: 'Counting words (classifiers)',
        p: ['When counting, Malay places a small counting word between the number and the noun, a little like "two **sheets** of paper". Three of them cover most situations.'],
        table: {
          head: ['Counter', 'For', 'Example'],
          rows: [
            ['*orang*', 'people', '*dua orang guru* two teachers'],
            ['*ekor*', 'animals', '*tiga ekor kucing* three cats'],
            ['*buah*', 'large objects, buildings, vehicles', '*sebuah rumah* a house'],
            ['*biji*', 'small round things', '*lima biji telur* five eggs'],
            ['*batang*', 'long thin things', '*sebatang pen* a pen'],
            ['*helai*', 'thin flat things: cloth, paper', '*dua helai baju* two shirts'],
          ],
        },
        tip: '*se-* + counter means "a / one": *seorang kawan* (a friend), *seekor anjing* (a dog). In casual speech people often skip the less common counters, so do not let them slow you down.',
      },
      {
        h: 'Prices and clock time',
        ex: [
          ['lima ringgit', 'five ringgit (RM5)'],
          ['pukul tiga', "three o'clock"],
          ['pukul tiga setengah', 'half past three'],
          ['tiga jam', 'three hours'],
        ],
      },
    ],
    quiz: [
      { q: 'What is *lima belas*?', opts: ['50', '15', '51', '500'], a: 1, why: 'belas = -teen: 15. (50 is lima puluh.)' },
      { q: 'How do you say 300?', opts: ['tiga puluh', 'tiga belas', 'tiga ratus', 'tiga ribu'], a: 2, why: 'ratus = hundred.' },
      { q: 'Dua ___ kucing (two cats). Which counting word?', opts: ['orang', 'buah', 'ekor', 'helai'], a: 2, why: 'ekor (literally "tail") counts animals.' },
      { q: '*seribu* is:', opts: ['100', '1,000', '10', '11'], a: 1, why: 'se- (one) + ribu (thousand).' },
      { q: 'Which means "two hours" (not "two o\'clock")?', opts: ['pukul dua', 'dua jam', 'jam kedua', 'dua kali'], a: 1, why: 'pukul + number is clock time; number + jam is a duration.' },
    ],
  },
  {
    id: 'plurals',
    title: 'Plurals & doubled words',
    blurb: 'No plural endings. Doubling a word does something more interesting.',
    sections: [
      {
        h: 'One form for one or many',
        p: ['*Saya ada kucing* can mean "I have a cat" or "I have cats". A number or quantity word makes it plural when you need to be clear.'],
        ex: [
          ['dua buku', 'two books'],
          ['banyak buku', 'many books'],
          ['semua orang', 'everyone, all the people'],
        ],
      },
      {
        h: 'Doubling for "various" or "all the"',
        p: ['Repeating a noun stresses that there are several, often of different kinds. Never combine it with a number.'],
        ex: [
          ['Buku-buku itu mahal.', 'Those books are expensive.'],
          ['kanak-kanak', 'children (always doubled)'],
        ],
      },
      {
        h: 'Doubling that changes the meaning',
        p: ['Many everyday words are doubled forms with their own meaning. Learn them as single items.'],
        table: {
          head: ['Base', 'Doubled', 'Meaning'],
          rows: [
            ['*jalan* (walk; road)', '*jalan-jalan*', 'go for a stroll, travel around'],
            ['*hati* (heart)', '*hati-hati*', 'careful, take care'],
            ['*kadang*', '*kadang-kadang*', 'sometimes'],
            ['*tiba* (arrive)', '*tiba-tiba*', 'suddenly'],
            ['*kira* (count)', '*kira-kira*', 'approximately'],
            ['*sama* (same)', '*sama-sama*', "together; you're welcome"],
            ['*pagi* (morning)', '*pagi-pagi*', 'very early in the morning'],
            ['*masing*', '*masing-masing*', 'each, respectively'],
          ],
        },
      },
      {
        h: 'Doubled verbs: relaxed or repeated',
        ex: [
          ['Kami duduk-duduk di taman.', 'We sat around in the park.'],
          ['Saya tengok-tengok saja.', "I'm just browsing."],
        ],
      },
    ],
    quiz: [
      { q: 'Which is correct for "three children"?', opts: ['tiga kanak', 'tiga orang kanak-kanak', 'tiga-tiga kanak', 'kanak-kanak-kanak'], a: 1, why: 'kanak-kanak is a fixed doubled word, counted with orang.' },
      { q: '*hati-hati* means:', opts: ['two hearts', 'careful', 'very happy', 'sometimes'], a: 1, why: 'Hati-hati! = Be careful!' },
      { q: 'Why is *dua buku-buku* wrong?', opts: ['buku cannot be doubled', 'Numbers and doubling are not used together', 'It needs -s', 'dua must come last'], a: 1, why: 'A number already shows the plural: dua buku.' },
      { q: '*jalan-jalan* means:', opts: ['many roads', 'to walk quickly', 'to stroll or travel around for fun', 'a junction'], a: 2, why: 'A very common doubled verb: go out and about.' },
      { q: '*Saya ada adik.* can mean:', opts: ['only "I have one younger sibling"', '"I have a younger sibling" or "younger siblings"', 'only "I have many younger siblings"', '"I am a younger sibling"'], a: 1, why: 'Without a number, the noun is neutral for singular or plural.' },
    ],
  },
  {
    id: 'prepositions',
    title: 'Where, to and from',
    blurb: 'di, ke, dari for places; pada, kepada, daripada for people and time.',
    sections: [
      {
        h: 'The three place words',
        table: {
          head: ['Word', 'Meaning', 'Example'],
          rows: [
            ['*di*', 'at, in, on (staying put)', '*Saya di rumah.* I am at home.'],
            ['*ke*', 'to (moving towards)', '*Saya pergi ke pejabat.* I go to the office.'],
            ['*dari*', 'from (a place or time)', '*Dia datang dari Jepun.* He comes from Japan.'],
          ],
        },
      },
      {
        h: 'Their partners for people and time',
        table: {
          head: ['Word', 'Meaning', 'Example'],
          rows: [
            ['*pada*', 'at, on (a time)', '*pada hari Isnin* on Monday'],
            ['*kepada*', 'to (a person)', '*Beri ini kepada dia.* Give this to her.'],
            ['*daripada*', 'from (a person); than', '*hadiah daripada ibu* a present from mother'],
          ],
        },
      },
      {
        h: 'Position words',
        p: ['Combine *di / ke / dari* with a position word.'],
        ex: [
          ['di atas meja', 'on the table'],
          ['di bawah kerusi', 'under the chair'],
          ['di dalam beg', 'inside the bag'],
          ['di luar rumah', 'outside the house'],
          ['di depan / di belakang kedai', 'in front of / behind the shop'],
          ['di sebelah bank', 'next to the bank'],
          ['di sini, di situ, di sana', 'here, there, over there'],
        ],
      },
      {
        h: 'ada: there is, to have, to be somewhere',
        ex: [
          ['Ada kedai di sana.', 'There is a shop over there.'],
          ['Saya ada dua orang adik.', 'I have two younger siblings.'],
          ['Dia ada di rumah.', 'She is at home.'],
        ],
      },
      {
        h: 'Other everyday prepositions',
        ex: [
          ['untuk awak', 'for you'],
          ['dengan kawan', 'with a friend'],
          ['tentang kerja', 'about work'],
          ['sampai esok', 'until tomorrow'],
          ['sejak semalam', 'since yesterday'],
        ],
        tip: 'Spelling clue: the preposition *di* is a separate word (*di rumah*). The passive prefix *di-* is attached to a verb (*dibeli*, bought).',
      },
    ],
    quiz: [
      { q: 'Saya pergi ___ sekolah. (I go to school.)', opts: ['di', 'ke', 'dari', 'pada'], a: 1, why: 'Movement towards a place: ke.' },
      { q: 'Dia tinggal ___ Kuala Lumpur. (He lives in KL.)', opts: ['ke', 'kepada', 'di', 'daripada'], a: 2, why: 'Location: di.' },
      { q: 'Saya beri buku itu ___ guru. (I gave the book to the teacher.)', opts: ['ke', 'di', 'kepada', 'dari'], a: 2, why: 'To a person: kepada.' },
      { q: '*di bawah meja* means:', opts: ['on the table', 'under the table', 'beside the table', 'behind the table'], a: 1, why: 'bawah = under, below.' },
      { q: '*Ada tandas di sini?* means:', opts: ['Where is the toilet?', 'Is there a toilet here?', 'The toilet is here.', 'I have a toilet.'], a: 1, why: 'ada = there is; with question intonation: Is there...?' },
    ],
  },
  {
    id: 'verb-affixes',
    title: 'Verb prefixes: ber-, me-, di-, ter-',
    blurb: 'Learn to spot the root inside a long word and your vocabulary multiplies.',
    sections: [
      {
        h: 'Roots and families',
        p: [
          'Most long Malay words are a short root plus prefixes and suffixes. If you know the root *ajar* (teach), you can recognise *belajar* (to study), *mengajar* (to teach), *pelajar* (student) and *pelajaran* (lesson). This is why learning the common roots pays off so quickly.',
          'In casual speech the *me-* prefix is often dropped altogether: people say *Saya beli roti* rather than *Saya membeli roti*. You mainly need to recognise it when reading and listening.',
        ],
      },
      {
        h: 'ber-: doing or having, with no object',
        ex: [
          ['jalan → berjalan', 'road, walk → to walk'],
          ['cakap → bercakap', 'speech → to speak'],
          ['kerja → bekerja', 'work → to work'],
          ['main → bermain', 'play → to play'],
          ['kahwin → berkahwin', 'marry → to be / get married'],
          ['baju merah → berbaju merah', 'red shirt → wearing a red shirt'],
        ],
      },
      {
        h: 'me-: an action done to something',
        p: ['The prefix changes shape to fit the first sound of the root. Four root letters (p, t, k, s) disappear when it is added.'],
        table: {
          head: ['Form', 'Before roots starting with', 'Examples'],
          rows: [
            ['*me-*', 'l, m, n, r, w, y', '*lihat → melihat*, *masak → memasak*'],
            ['*mem-*', 'b, and p (p drops)', '*beli → membeli*, *pakai → memakai*'],
            ['*men-*', 'c, d, j, and t (t drops)', '*cari → mencari*, *tulis → menulis*'],
            ['*meng-*', 'vowels, g, h, and k (k drops)', '*ambil → mengambil*, *kira → mengira*'],
            ['*meny-*', 's (s drops)', '*sapu → menyapu*, *simpan → menyimpan*'],
          ],
        },
        tip: 'Decoding trick when you meet an unknown *me-* word: after *meny-* try a root starting with s; after *mem-* + vowel try p; after *men-* + vowel try t; after *meng-* + vowel try k.',
      },
      {
        h: 'di-: the passive',
        p: ['*di-* attached to a verb turns it around: the thing affected comes first. You will see it on signs everywhere.'],
        ex: [
          ['Buku itu dibeli oleh Ali.', 'The book was bought by Ali.'],
          ['Dilarang merokok.', 'Smoking is prohibited.'],
          ['Rumah untuk dijual.', 'House for sale ("to be sold").'],
        ],
      },
      {
        h: 'ter-: by accident, in a state, or "the most"',
        ex: [
          ['tidur → tertidur', 'sleep → to fall asleep (without meaning to)'],
          ['lupa → terlupa', 'forget → to forget by accident'],
          ['buka → terbuka', 'open → (standing) open'],
          ['letak → terletak', 'put → located'],
          ['besar → terbesar', 'big → biggest'],
        ],
      },
    ],
    quiz: [
      { q: 'What is the root of *menulis* (to write)?', opts: ['nulis', 'tulis', 'ulis', 'menu'], a: 1, why: 'men- + tulis: the t drops.' },
      { q: 'What is the root of *menyapu* (to sweep)?', opts: ['nyapu', 'apu', 'sapu', 'yapu'], a: 2, why: 'meny- signals a root beginning with s.' },
      { q: '*tertidur* means:', opts: ['to put to sleep', 'to fall asleep unintentionally', 'the sleepiest', 'to be asleep on purpose'], a: 1, why: 'ter- often marks something unintended.' },
      { q: 'A sign says *Dilarang masuk*. It means:', opts: ['Please come in', 'Entrance', 'No entry', 'Exit only'], a: 2, why: 'dilarang = (it is) forbidden; masuk = enter.' },
      { q: 'Which form does *beli* (buy) take with the me- prefix?', opts: ['mebeli', 'menbeli', 'mengbeli', 'membeli'], a: 3, why: 'Before b the prefix is mem-.' },
    ],
  },
  {
    id: 'word-building',
    title: 'Word building: -kan, -i and noun makers',
    blurb: 'The suffixes and noun patterns that turn 1,500 roots into many thousands of words.',
    sections: [
      {
        h: '-kan: make it happen, or do it for someone',
        ex: [
          ['bersih → membersihkan', 'clean → to clean (make clean)'],
          ['masuk → memasukkan', 'enter → to put in'],
          ['guna → menggunakan', 'use → to use, make use of'],
          ['Tolong bukakan pintu.', 'Please open the door (for me).'],
        ],
      },
      {
        h: '-i: the action is aimed at a place or person',
        ex: [
          ['teman → menemani', 'companion → to accompany'],
          ['milik → memiliki', 'possession → to own'],
          ['suka → menyukai', 'like → to be fond of'],
        ],
      },
      {
        h: 'pe-: the person or tool that does it',
        p: ['*pe-* changes shape exactly like *me-*.'],
        ex: [
          ['pandu → pemandu', 'drive → driver'],
          ['jual → penjual', 'sell → seller'],
          ['tulis → penulis', 'write → writer'],
          ['kerja → pekerja', 'work → worker'],
          ['sapu → penyapu', 'sweep → broom'],
        ],
      },
      {
        h: '-an: the result or the thing',
        ex: [
          ['makan → makanan', 'eat → food'],
          ['minum → minuman', 'drink → a drink'],
          ['pakai → pakaian', 'wear → clothing'],
          ['jawab → jawapan', 'answer → an answer'],
          ['main → mainan', 'play → toy'],
        ],
      },
      {
        h: 'ke-...-an: abstract nouns',
        ex: [
          ['sihat → kesihatan', 'healthy → health'],
          ['selamat → keselamatan', 'safe → safety'],
          ['bersih → kebersihan', 'clean → cleanliness'],
          ['raja → kerajaan', 'king → government'],
        ],
      },
      {
        h: 'pe-...-an and per-...-an: activities and processes',
        ex: [
          ['jalan → perjalanan', 'walk → journey'],
          ['kerja → pekerjaan', 'work → occupation'],
          ['niaga → perniagaan', 'trade → business'],
          ['bangun → pembangunan', 'rise, build → development'],
        ],
      },
      {
        h: 'One root, a whole family',
        table: {
          head: ['Word', 'Meaning'],
          rows: [
            ['*ajar*', 'teach (root)'],
            ['*belajar*', 'to study, to learn'],
            ['*mengajar*', 'to teach'],
            ['*pelajar*', 'student'],
            ['*pengajar*', 'instructor'],
            ['*pelajaran*', 'lesson'],
          ],
        },
        tip: 'In the word list, open any word to see the other members of its family that are among the 1,500.',
      },
    ],
    quiz: [
      { q: '*makanan* (from makan, eat) means:', opts: ['eater', 'food', 'to feed', 'restaurant'], a: 1, why: '-an names the result or thing: what is eaten.' },
      { q: '*penjual* (from jual, sell) means:', opts: ['a sale', 'for sale', 'seller', 'to sell for someone'], a: 2, why: 'pe- names the person who does it.' },
      { q: '*kesihatan* (from sihat, healthy) means:', opts: ['health', 'healthier', 'to heal', 'hospital'], a: 0, why: 'ke-...-an makes an abstract noun.' },
      { q: 'Which word most likely means "journey"?', opts: ['berjalan', 'pejalan', 'perjalanan', 'jalankan'], a: 2, why: 'per-...-an names an activity or process: perjalanan.' },
      { q: '*membersihkan* (from bersih, clean) means:', opts: ['cleanliness', 'cleaner (person)', 'to make something clean', 'very clean'], a: 2, why: '-kan is causative: to cause to be clean.' },
    ],
  },
  {
    id: 'comparing',
    title: 'Comparing & linking: lebih, paling, yang',
    blurb: 'Say bigger, biggest and "the one that...", then join your sentences together.',
    sections: [
      {
        h: 'More and most',
        ex: [
          ['Kereta ini lebih mahal.', 'This car is more expensive.'],
          ['Dia lebih tinggi daripada saya.', 'He is taller than me.'],
          ['Ini yang paling murah.', 'This is the cheapest one.'],
          ['bangunan tertinggi', 'the tallest building (ter- = paling)'],
        ],
      },
      {
        h: 'The same, less, too, very',
        ex: [
          ['Dia sama tinggi dengan saya.', 'She is as tall as me.'],
          ['kurang manis', 'less sweet'],
          ['terlalu mahal', 'too expensive'],
          ['sangat sedap / sedap sekali', 'very tasty'],
        ],
      },
      {
        h: 'yang: "that / who / which" and "the ... one"',
        p: ['*yang* links a noun to a longer description. On its own before an adjective it means "the ... one".'],
        ex: [
          ['orang yang tinggal di sini', 'the person who lives here'],
          ['buku yang saya beli', 'the book that I bought'],
          ['Saya nak yang merah.', 'I want the red one.'],
          ['Yang mana? Yang ini.', 'Which one? This one.'],
        ],
        tip: '*yang* is the second most frequent word in Malay. Whenever you see it, read it as "that / who / which" or "the one that is" and the sentence will usually fall into place.',
      },
      {
        h: 'Joining words',
        table: {
          head: ['Malay', 'English', 'Malay', 'English'],
          rows: [
            ['*dan*', 'and', '*kalau*', 'if'],
            ['*atau*', 'or', '*bila / apabila*', 'when'],
            ['*tetapi / tapi*', 'but', '*sebelum / selepas*', 'before / after'],
            ['*kerana / sebab*', 'because', '*walaupun*', 'although'],
            ['*jadi*', 'so', '*supaya*', 'so that'],
          ],
        },
        ex: [
          ['Saya tak pergi sebab hujan.', "I'm not going because it's raining."],
          ['Kalau lapar, makanlah.', "If you're hungry, eat."],
        ],
      },
    ],
    quiz: [
      { q: 'Rumah ini ___ besar daripada rumah itu. (bigger than)', opts: ['paling', 'lebih', 'sangat', 'sama'], a: 1, why: 'lebih ... daripada = more ... than.' },
      { q: '*paling murah* means:', opts: ['cheaper', 'too cheap', 'cheapest', 'not cheap'], a: 2, why: 'paling = most.' },
      { q: '*Saya nak yang besar.* means:', opts: ['I want to be big.', 'I want the big one.', 'I am the big one.', 'I want it bigger.'], a: 1, why: 'yang + adjective = "the ... one".' },
      { q: '*kawan yang tinggal di Melaka* means:', opts: ['the friend who lives in Melaka', 'a friend lives in Melaka', 'my friend and Melaka', 'which friend in Melaka?'], a: 0, why: 'yang introduces the description: who lives in Melaka.' },
      { q: 'Dia tak datang ___ dia sakit. (because)', opts: ['kalau', 'tetapi', 'kerana', 'supaya'], a: 2, why: 'kerana (or sebab) = because.' },
    ],
  },
  {
    id: 'requests',
    title: 'Requests, offers & being polite',
    blurb: 'tolong, sila, boleh, jom: the small words that make you sound friendly.',
    sections: [
      {
        h: 'Commands and how to soften them',
        p: ['A bare verb is a command. Adding *-lah* makes it gentler and friendlier.'],
        ex: [
          ['Duduk.', 'Sit.'],
          ['Duduklah.', 'Do sit down.'],
          ['Jangan bimbang.', "Don't worry."],
        ],
      },
      {
        h: 'Three kinds of "please"',
        table: {
          head: ['Word', 'Use it when', 'Example'],
          rows: [
            ['*tolong*', 'asking for a favour (literally "help")', '*Tolong tutup pintu.* Please close the door.'],
            ['*sila*', 'inviting someone to do something for their own benefit', '*Sila masuk.* Please come in.'],
            ['*minta*', 'asking for a thing', '*Minta air satu.* One water, please.'],
          ],
        },
      },
      {
        h: 'Asking permission and ordering',
        ex: [
          ['Boleh saya tanya?', 'May I ask something?'],
          ['Boleh tolong saya?', 'Could you help me?'],
          ['Saya nak nasi goreng satu.', "I'd like one fried rice."],
          ['Boleh kurang sikit?', 'Can you lower the price a little?'],
        ],
      },
      {
        h: "Let's...",
        ex: [
          ['Jom makan!', "Let's eat! (casual)"],
          ['Mari kita mula.', "Let's begin."],
        ],
      },
      {
        h: 'The courtesy kit',
        table: {
          head: ['Malay', 'English'],
          rows: [
            ['*Terima kasih.* / *Sama-sama.*', "Thank you. / You're welcome."],
            ['*Maaf.* / *Minta maaf.*', 'Sorry. / I apologise.'],
            ['*Tumpang tanya...*', 'Excuse me, may I ask...'],
            ['*Tak apa.*', "It's all right. Never mind."],
            ['*Apa khabar?* / *Khabar baik.*', "How are you? / I'm fine."],
            ['*Jumpa lagi.*', 'See you again.'],
          ],
        },
      },
    ],
    quiz: [
      { q: 'A host welcoming you at the door would say:', opts: ['Tolong masuk.', 'Sila masuk.', 'Jangan masuk.', 'Minta masuk.'], a: 1, why: 'sila invites someone to do something for their own benefit.' },
      { q: 'You want a stranger to take your photo. Start with:', opts: ['Sila...', 'Jom...', 'Tolong...', 'Jangan...'], a: 2, why: 'tolong asks for a favour.' },
      { q: '*Jom balik!* means:', opts: ["Don't go home!", "Let's go home!", 'Please go home.', 'May I go home?'], a: 1, why: "jom = let's (casual)." },
      { q: 'The reply to *Terima kasih* is:', opts: ['Tak apa khabar.', 'Sama-sama.', 'Jumpa lagi.', 'Minta maaf.'], a: 1, why: "Sama-sama = you're welcome." },
      { q: '*Boleh saya duduk di sini?* means:', opts: ['Please sit here.', 'May I sit here?', 'I can sit here.', "Don't sit here."], a: 1, why: 'Boleh saya...? asks permission.' },
    ],
  },
  {
    id: 'spoken',
    title: 'Everyday spoken Malay',
    blurb: 'The short forms you will hear in every conversation, film and text message.',
    sections: [
      {
        h: 'Standard word, everyday shortcut',
        p: ['Spoken Malay shortens many of the most frequent words. Use the standard forms when you write; learn to recognise the short ones so real speech does not catch you out.'],
        table: {
          head: ['Standard', 'Spoken', 'Meaning'],
          rows: [
            ['*tidak*', '*tak*', 'not'],
            ['*hendak / mahu*', '*nak*', 'want'],
            ['*sudah*', '*dah*', 'already'],
            ['*di / dekat*', '*kat*', 'at, in'],
            ['*ini / itu*', '*ni / tu*', 'this / that'],
            ['*sahaja*', '*saja / je*', 'only, just'],
            ['*bagaimana*', '*macam mana*', 'how'],
            ['*seperti*', '*macam*', 'like, as'],
            ['*sedikit*', '*sikit*', 'a little'],
            ['*emak / bapa*', '*mak / ayah*', 'mum / dad'],
            ['*kamu semua*', '*korang*', 'you all'],
            ['*mereka*', '*dia orang (diorang)*', 'they'],
          ],
        },
      },
      {
        h: 'Little particles with big jobs',
        table: {
          head: ['Particle', 'What it does', 'Example'],
          rows: [
            ['*lah*', 'softens or adds warmth and emphasis', '*Jomlah!* Come on, let\'s go!'],
            ['*kan*', '"right?", "isn\'t it?"', '*Panas, kan?* Hot, isn\'t it?'],
            ['*ke*', 'turns a statement into a question', '*Ya ke?* Really?'],
            ['*pun*', 'also, even', '*Saya pun.* Me too.'],
            ['*je*', 'just, only', '*Sikit je.* Just a little.'],
          ],
        },
      },
      {
        h: 'A short conversation',
        ex: [
          ['Dah makan?', 'Have you eaten?'],
          ['Belum. Jom makan sama-sama.', "Not yet. Let's eat together."],
          ['Nak makan kat mana?', 'Where do you want to eat?'],
          ['Kat kedai tu je. Dekat.', "Just at that shop. It's close."],
          ['Okey, jom.', "OK, let's go."],
        ],
        tip: '*Dah makan?* ("Eaten yet?") is as much a greeting as a question, the way English speakers ask "How are you?".',
      },
    ],
    quiz: [
      { q: 'The spoken form of *tidak mahu* (don\'t want) is:', opts: ['tak nak', 'dah nak', 'tak je', 'nak tak'], a: 0, why: 'tidak → tak, mahu → nak.' },
      { q: '*Dia kat mana?* means:', opts: ['Who is he?', 'Where is he?', 'What does he want?', 'How is he?'], a: 1, why: 'kat = di (at): Where is he?' },
      { q: '*Saya pun nak.* means:', opts: ["I don't want it.", 'I want it too.', 'I only want it.', 'Do I want it?'], a: 1, why: 'pun = also.' },
      { q: 'In *Mahal je*, what does *je* add?', opts: ['"very"', '"not"', '"just / only"', '"already"'], a: 2, why: 'je (from sahaja) = just, only.' },
      { q: '*Dah sampai?* means:', opts: ['Have you arrived?', 'Will you arrive?', 'Why did you arrive?', "Don't arrive."], a: 0, why: 'dah = sudah (already).' },
    ],
  },
];
