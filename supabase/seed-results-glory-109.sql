-- Ergebnisse GLORY 109, 5. September 2026, RTM Stage Rotterdam.
--
-- Quelle: GLORY selbst ("GLORY 109 Results: Chico Kwasi Defends Title" auf
-- glorykickboxing.com), nicht ein Sammel-Kalender. position 1 ist das Main
-- Event, die Zahlen laufen die Karte hinunter.

insert into event_results
  (event_slug, position, bout, winner, method, round, end_time, note)
values
  ('glory-109',  1, 'Chico Kwasi vs. Teodor Hristov',        'Chico Kwasi',        'Unanimous decision (50-45 x5)',            5, null,   'Welterweight title, trilogy bout'),
  ('glory-109',  2, 'Tariq Osaro vs. Errol Zimmerman',       'Tariq Osaro',        'TKO (punches)',                            2, '1:54', 'Heavyweight'),
  ('glory-109',  3, 'Mohammed Boutasaa vs. Figuereido Landman', 'Mohammed Boutasaa', 'Unanimous decision (30-27 x3, 29-28 x2)', 3, null,   'Welterweight Proving Grounds'),
  ('glory-109',  4, 'Jay Overmeer vs. Don Sno',              'Jay Overmeer',       'Unanimous decision (30-27 x5)',            3, null,   'Welterweight Proving Grounds'),
  ('glory-109',  5, 'Dmitry Menshikov vs. Diaguely Camara',  'Dmitry Menshikov',   'Unanimous decision (30-25 x5)',            3, null,   'Welterweight Proving Grounds'),
  ('glory-109',  6, 'Antonio Krajinovic vs. Michael Samperi','Antonio Krajinovic', 'TKO (maximum knockdowns)',                 3, '1:51', 'Welterweight Proving Grounds'),
  ('glory-109',  7, 'Imad Hadar vs. Ulrich Tiebe',           'Imad Hadar',         'TKO (maximum knockdowns)',                 2, '1:49', 'Middleweight'),
  ('glory-109',  8, 'Anwar Ouled-Chaib vs. Christian Baya',  'Anwar Ouled-Chaib',  'Unanimous decision (30-26 x5)',            3, null,   'Superfight Series'),
  ('glory-109',  9, 'Mohammed Hamdi vs. Valentin Knau',      'Mohammed Hamdi',     'TKO (maximum knockdowns)',                 2, '1:13', 'Superfight Series'),
  ('glory-109', 10, 'Nikola Todorovic vs. Vedat Hoduc',      'Nikola Todorovic',   'Unanimous decision (30-26 x4, 29-27)',     3, null,   'Superfight Series'),
  ('glory-109', 11, 'Fikri Sabri vs. Artiom Livadari',       'Fikri Sabri',        'KO (punches)',                             2, '0:36', 'Superfight Series'),
  ('glory-109', 12, 'Imran Ben Slama vs. Abdo Chahidi',      'Imran Ben Slama',    'Unanimous decision (30-26 x5)',            3, null,   'Catchweight 147 lb')
on conflict (event_slug, position) do nothing;
