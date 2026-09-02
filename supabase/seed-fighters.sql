-- Seed fighter profiles with researched, sourced bios.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Sources are listed as SQL comments above each fighter for reference.

-- Sources: oktagonmma.com/en/fighters/kaik-brito, middleeasy.com (vacate + DWCS knockout)
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Brito', null, 'MMA', '20-6-0',
  'Kaik Brito is a Brazilian mixed martial artist who competes at welterweight, known for heavy knockout power. He built his career in the European promotion OKTAGON MMA before signing with the UFC in August 2026.',
  'Brito won the OKTAGON welterweight title at OKTAGON 37 and reclaimed it with a third-round knockout of Ronaldo Paradeiser at OKTAGON 84 in February 2026. He vacated the belt in July 2026 to chase a UFC opportunity, then earned a UFC contract by knocking out Namo Fazil in the third round of the Dana White''s Contender Series main event in August 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: cagesidepress.com, mymmanews.com (OKTAGON 96 title fight announcement)
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Gogoladze', 'The Sniper', 'MMA', '18-3-0',
  'Amiran Gogoladze is a Georgian mixed martial artist competing at welterweight for OKTAGON MMA. He has won four straight fights under the OKTAGON banner, including a first-round knockout of former champion Ion Surdu at OKTAGON 86 in April 2026.',
  'Gogoladze is set to face unbeaten German prospect Felix Klinkhammer for the vacant OKTAGON welterweight title at OKTAGON 96 in Munich on October 31, 2026, after the belt was vacated by Kaik Brito.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: oktagonmma.com/en/fighters/felix-klinkhammer, cagesidepress.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Klinkhammer', null, 'MMA', '11-0-0',
  'Felix Klinkhammer is an undefeated German mixed martial artist competing at welterweight, trained for a decade at London Shootfighters and known for a submission-heavy grappling game.',
  'Klinkhammer is a former ARES FC welterweight champion, having submitted former title challenger Máté Kertész in the first round. He now fights for OKTAGON MMA and challenges Amiran Gogoladze for the vacant OKTAGON welterweight title at OKTAGON 96 in Munich on October 31, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: cagesidepress.com (Kincl vs Humburger announcement), tapology.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Kincl', 'The Inspector', 'MMA', '30-12-0 (1 NC)',
  'Patrik Kincl is a Czech mixed martial artist from Hradec Králové, widely regarded as one of the most experienced and technical fighters to come out of the Czech Republic. He now competes at middleweight for OKTAGON MMA.',
  'Kincl won the OKTAGON middleweight title in 2022 and defended it three times before losing it via unanimous decision to Kerim Engizek in October 2024. He has since won back-to-back fights, earning a Performance of the Night bonus for a July 2026 submission win, and faces Dominik Humburger at OKTAGON 95 in Karlovy Vary on October 17, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: sofascore.com, cagesidepress.com, blogs.rdxsports.com
-- Note: Humburger is Czech (from Liberec), not German as our event copy previously said.
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Humburger', null, 'MMA', '12-3-0',
  'Dominik Humburger is a Czech mixed martial artist from Liberec and a former Czech national middleweight champion who now competes for OKTAGON MMA.',
  'Humburger''s tough decision loss to Kerim Engizek won OKTAGON''s 2025 Fight of the Year, and he later defeated former ONE welterweight champion Zebaztian Kadestam to move into title contention. He faces Patrik Kincl at OKTAGON 95 in Karlovy Vary on October 17, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Igor_Severino, lowkickmma.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Severino', 'The Hannibal', 'MMA', '10-1-1',
  'Igor Severino is a Brazilian mixed martial artist born in Juruti, Pará, competing at bantamweight. He previously fought in the UFC before signing with OKTAGON MMA in 2024.',
  'Severino won the vacant OKTAGON bantamweight title with a second-round TKO of Khurshed Kakhorov at OKTAGON 85 in March 2026, earning a Performance of the Night bonus. He retained the belt through a no-contest against Zhalgas Zhumagulov in June 2026 and defends it against Max Holzer at OKTAGON 97 in Hannover on November 7, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: tapology.com, fightbookmma.com, oktagonmma.com/en/fighters/max-holzer
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Holzer', null, 'MMA', '12-0-0',
  'Max Holzer is an undefeated German mixed martial artist born in Hannover, competing at bantamweight for OKTAGON MMA and regarded as one of Europe''s top grappling-based prospects.',
  'Holzer has won all 12 of his professional fights, including a submission victory over Deniz Ilbay at OKTAGON 69 in Dortmund. He challenges Igor Severino for the OKTAGON bantamweight title at OKTAGON 97 in his hometown of Hannover on November 7, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: cbssports.com (UFC 323 recap), monsterenergy.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Van', null, 'MMA', '17-2-0',
  'Joshua Van is a Burmese-born UFC flyweight fighting out of Houston, and was the first fighter from Myanmar to sign with the UFC.',
  'Van won the UFC flyweight championship with a first-round TKO of Alexandre Pantoja at UFC 323 in December 2025, becoming the second-youngest champion in UFC history. He made his first successful title defense with a fifth-round TKO of Tatsuro Taira at UFC 328.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: ufc.com/news/alexandre-pantoja-all-time-great-ufc-317, en.wikipedia.org/wiki/Alexandre_Pantoja
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Pantoja', 'The Cannibal', 'MMA', '30-6-0',
  'Alexandre Pantoja is a Brazilian UFC flyweight born in Rio de Janeiro, and a former UFC Flyweight Champion regarded as one of the greatest fighters in the division''s history.',
  'Pantoja won the UFC flyweight title over Brandon Moreno at UFC 290 in July 2023 and defended it four consecutive times. He lost the title via TKO (injury stoppage) to Joshua Van at UFC 323 in December 2025.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Alexander_Volkanovski, ufc.com/athlete/alexander-volkanovski, aljazeera.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Volkanovski', 'The Great', 'MMA', '28-4-0',
  'Alexander Volkanovski is an Australian UFC featherweight and the first Australian-born fighter to win a UFC title, widely considered one of the greatest 145-pound fighters ever.',
  'A two-time UFC Featherweight Champion, Volkanovski''s eight title-fight wins are tied with José Aldo for most in featherweight history. He defended his title against Diego Lopes at UFC 325 in Sydney in February 2026 and is scheduled to defend it against Movsar Evloev at UFC 333 on October 24, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Movsar_Evloev, aljazeera.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Evloev', null, 'MMA', '20-0-0',
  'Movsar Evloev is an undefeated UFC featherweight of Ingush ethnicity, born in Sunzha, Ingushetia, Russia, known as one of the most dominant wrestlers in the division.',
  'A former M-1 Global bantamweight champion, Evloev became the first fighter in UFC history to open his promotional run with ten straight decision wins. Ranked the UFC''s #1 featherweight contender, he challenges champion Alexander Volkanovski for the title at UFC 333 on October 24, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Daniel_Dubois, queensberry.co.uk/pages/daniel-dubois
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Dubois', 'Dynamite', 'Boxing', '23-3-0',
  'Daniel Dubois is a British professional heavyweight boxer, born September 6, 1997, known for heavy knockout power.',
  'A two-time heavyweight world champion, Dubois has held the WBO title since May 2026, previously held the IBF title (2024-2025), and earlier the WBA (Regular) title (2022-2023). His signature win came via fifth-round knockout of Anthony Joshua at Wembley Stadium in September 2024.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Fabio_Wardley, boxing-social.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Wardley', null, 'Boxing', '20-1-1',
  'Fabio Wardley is a British professional heavyweight boxer from Ipswich, born December 18, 1994.',
  'Wardley held the WBO heavyweight title from 2025 until losing it to Daniel Dubois via 11th-round TKO in May 2026, and previously held the interim WBA heavyweight title plus British and Commonwealth titles (2022-2025). He swept British Fighter of the Year honors from ESPN, Boxing News, and British Boxing News in 2025.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Canelo_Álvarez, bigfightweekend.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Canelo', 'Canelo', 'Boxing', '63-3-2',
  'Saúl "Canelo" Álvarez is a Mexican professional boxer and one of the sport''s biggest global stars, a multi-weight world champion across four divisions.',
  'Álvarez became the first-ever undisputed super middleweight champion in 2021 and a two-time undisputed champion in 2025, before losing his undisputed super middleweight crown to Terence Crawford by decision in September 2025. He is scheduled to challenge Christian Mbilli for the WBC super middleweight title in Riyadh in 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Christian_M'billi
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Mbilli', 'Solide', 'Boxing', '29-0-1',
  'Christian M''billi is a Cameroonian-born French professional boxer, born April 26, 1995, and remains undefeated as a professional.',
  'Mbilli was elevated to WBC super middleweight champion in January 2026 after Terence Crawford vacated the title. He is set to make his first title defense against Canelo Álvarez in Riyadh, Saudi Arabia, in an October 2026 bout.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: en.wikipedia.org/wiki/Miguel_Trindade, middleeasy.com
-- Note: record is reported inconsistently across sources (21-5, 19-4, 9-3) — flagged in bio rather than guessed.
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Trindade', 'El Unico', 'Kickboxing', '21-5-0 (varies by source)',
  'Miguel Trindade is a Portuguese kickboxer and Muay Thai fighter, born January 5, 2001, in Lisbon, competing at featherweight for GLORY Kickboxing.',
  'Trindade signed with GLORY in October 2023 and reached the final of the GLORY RISE Featherweight Grand Prix in December 2024. He challenged Petpanomrung Kiatmuu9 for the GLORY Featherweight Championship at GLORY 100 in June 2025 (lost by unanimous decision), and faces Deniz Demirkapu for the vacant GLORY featherweight title at GLORY 110 in Antwerp on October 17, 2026.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();

-- Sources: glorykickboxing.com/fighters/deniz-demirkapu, middleeasy.com
insert into fighters (name, nickname, sport, record, bio, career)
values (
  'Demirkapu', 'Bad Boy', 'Kickboxing', '18-5-0',
  'Deniz Demirkapu is a kickboxer of Turkish and Moroccan nationality, competing at featherweight (65kg) for GLORY Kickboxing, ranked #4 in the division.',
  'Demirkapu has competed under ONE Championship, GLORY, and Siam Warriors Super Fights. He challenges Miguel Trindade for the vacant GLORY featherweight world title at GLORY 110 in Antwerp on October 17, 2026 — his first shot at GLORY gold.'
)
on conflict (name) do update set
  nickname = excluded.nickname, sport = excluded.sport, record = excluded.record,
  bio = excluded.bio, career = excluded.career, updated_at = now();
