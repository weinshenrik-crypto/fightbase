-- Real, Creative-Commons-licensed photos for a few well-known fighters, self-hosted
-- under /public/fighters/ with required attribution stored alongside.
-- Run migration-photo-credit.sql first.

-- Source: commons.wikimedia.org/wiki/File:Saúl_Álvarez.png (CC BY 3.0, via Box Azteca / YouTube)
update fighters set
  photo_url = '/fighters/canelo.jpg',
  photo_credit = 'Photo: Box Azteca (YouTube), CC BY 3.0, via Wikimedia Commons'
where name = 'Canelo';

-- Source: commons.wikimedia.org/wiki/File:Alex_Volkanovski.jpg (CC BY-SA 4.0, Paokara777)
update fighters set
  photo_url = '/fighters/volkanovski.jpg',
  photo_credit = 'Photo: Paokara777, CC BY-SA 4.0, via Wikimedia Commons'
where name = 'Volkanovski';

-- Source: commons.wikimedia.org/wiki/File:Pantoja_2025.jpg (CC BY 3.0, via Sexto Round / YouTube)
update fighters set
  photo_url = '/fighters/pantoja.jpg',
  photo_credit = 'Photo: Sexto Round (YouTube), CC BY 3.0, via Wikimedia Commons'
where name = 'Pantoja';
