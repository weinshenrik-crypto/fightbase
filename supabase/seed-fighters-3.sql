-- Fighter bios for names introduced in the Sept 2026 event-expansion batch.
-- Sources listed above each insert.

-- Sources: onefc.com/athletes/shamil-erdogan, onefc.com features "Undeniable Perfection", tapology.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Erdogan', null, 'MMA', '13-0-0',
  'Shamil Erdogan is an undefeated mixed martial artist competing at heavyweight for ONE Championship, boasting a 100% finishing rate across three different weight classes.',
  'Erdogan holds stoppage wins over Aung La N Sang and Gilberto Galvao, and made a successful heavyweight debut by finishing Ryugo Takeuchi at ONE 173 in Tokyo. He headlines ONE Fight Night 48 against Paul Elliott, with vacant ONE heavyweight MMA title implications on the line.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: onefc.com/athletes/paul-elliott, skysports.com, onefc.com features "How A Dying Man's Words..."
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Elliott', 'King of the North', 'MMA', '8-2-0',
  'Paul "King of the North" Elliott is a British heavyweight mixed martial artist from Middlesbrough, England, competing for ONE Championship, with every one of his wins coming by knockout.',
  'Elliott tied the fastest knockout in ONE Championship history with a six-second stoppage of Regan Upshaw. He faces unbeaten Shamil Erdogan at ONE Fight Night 48, looking to become the first-ever British ONE Heavyweight MMA World Champion.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: onefc.com/athletes/jonathan-haggerty, en.wikipedia.org/wiki/Jonathan_Haggerty, onefc.com news (Haggerty vs Akimoto announcement)
-- Photo: commons.wikimedia.org/wiki/File:Jonathan_Haggerty_(53557533838)_(cropped).jpg (CC BY 2.0, Stephen McCarthy/Web Summit Qatar via Sportsfile)
insert into fighters (name, nickname, sport, record, bio, career, photo_url, photo_credit)
values (
  'Haggerty', 'The General', 'Kickboxing', null,
  'Jonathan "The General" Haggerty is an English kickboxer from London and the reigning ONE Bantamweight Kickboxing World Champion, widely regarded as one of the best pound-for-pound strikers in the sport.',
  'A former ONE Flyweight and Bantamweight Muay Thai World Champion, Haggerty became a rare three-sport ONE champion by knocking out Fabricio Andrade for the vacant bantamweight kickboxing title. He puts the belt on the line against former champion Hiroki Akimoto at ONE SAMURAI 4 in Tokyo.',
  '/fighters/haggerty.jpg',
  'Photo: Stephen McCarthy / Web Summit Qatar via Sportsfile, CC BY 2.0, via Wikimedia Commons'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, photo_url = excluded.photo_url,
  photo_credit = excluded.photo_credit, updated_at = now();

-- Sources: onefc.com/athletes/hiroki-akimoto, en.wikipedia.org/wiki/Hiroki_Akimoto, onefc.com news (Haggerty vs Akimoto announcement)
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Akimoto', null, 'Kickboxing', '28-4-0',
  'Hiroki Akimoto is a Japanese kickboxer and a former ONE Bantamweight Kickboxing World Champion, having gone 19-0 in his native Japan before joining ONE Championship in 2019.',
  'Akimoto won the ONE bantamweight kickboxing title in March 2022 with a decision over Capitan Petchyindee, and later returned to winning ways with a split-decision win over MMA legend John Lineker in Lineker''s kickboxing debut. He challenges current champion Jonathan Haggerty for the title at ONE SAMURAI 4.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: glorykickboxing.com/fighters/mory-kromah, en.wikipedia.org/wiki/Mory_Kromah
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Kromah', 'The Black Ghost', 'Kickboxing', null,
  'Mory "The Black Ghost" Kromah is a Dutch-born Guinean kickboxer and the reigning GLORY Heavyweight World Champion, known for elaborate ring entrances and a signature flying knee.',
  'Kromah joined GLORY in 2024 and quickly became one of the promotion''s biggest draws, winning the Last Heavyweight Standing tournament and the vacant heavyweight title in Arnhem in February 2026 over rivals including Michael Boapeah and Tariq Osaro. He defends the belt against Antonio Plazibat at GLORY Collision 10.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: glorykickboxing.com/fighters/antonio-plazibat, en.wikipedia.org/wiki/Antonio_Plazibat, tapology.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Plazibat', null, 'Kickboxing', '22-5-0',
  'Antonio Plazibat is a Croatian kickboxer competing in GLORY''s heavyweight division and a former K-1 Heavyweight Champion.',
  'Plazibat joined the GLORY roster in 2019 and was named the promotion''s Newcomer of the Year while also earning Fight of the Year honors that same year. He challenges Mory Kromah for the GLORY heavyweight title at GLORY Collision 10 in December 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();
