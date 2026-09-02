-- Additional fighters added after the OKTAGON 93 card correction.

-- Sources: sofascore.com/mma/fighter/radek-rousal, oktagonmma.com/en/fighters/radek-rousal, tapology.com
insert into fighters (name, slug, nickname, sport, record, bio, career)
values (
  'Roušal', 'rousal', 'Ruchy', 'MMA', null,
  'Radek "Ruchy" Roušal is a Czech mixed martial artist competing at featherweight for OKTAGON MMA, fighting professionally since 2019.',
  'Roušal is currently on a finishing streak, most recently winning by first-round knockout over Samuel Bark. He headlines OKTAGON 93 in his home country against former champion Jonas Mågård on September 12, 2026.'
)
on conflict (name) do update set
  slug = excluded.slug, nickname = excluded.nickname, sport = excluded.sport,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: tapology.com/fightcenter/fighters/63700-jonas-magard, oktagonmma.com/en/fighters/jonas-magard, theallstar.io
insert into fighters (name, slug, nickname, sport, record, bio, career)
values (
  'Mågård', 'magard', 'Shark', 'MMA', null,
  'Jonas "Shark" Mågård is a Danish mixed martial artist and a former OKTAGON MMA bantamweight champion, known for a well-rounded finishing game (submissions, knockouts and decisions).',
  'Mågård previously held bantamweight gold in both FEN and OKTAGON before moving up in weight. He headlines OKTAGON 93 in Brno against Czech featherweight Radek Roušal on September 12, 2026.'
)
on conflict (name) do update set
  slug = excluded.slug, nickname = excluded.nickname, sport = excluded.sport,
  bio = excluded.bio, career = excluded.career, updated_at = now();
