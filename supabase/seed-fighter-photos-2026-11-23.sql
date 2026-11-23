-- Frei lizenzierte Fotos von Wikimedia Commons, gefunden mit
-- scripts/find-fighter-photos.ts. Vor dem Ausfuehren jedes Bild unter
-- public/fighters/ ansehen: Ist es die richtige Person?

-- Source: commons.wikimedia.org/wiki/File:Daniel_Dubois_walkout_(cropped).jpg (CC BY 4.0, Editor083)
update fighters set
  photo_url = '/fighters/dubois.jpg',
  photo_credit = 'Photo: Editor083, CC BY 4.0, via Wikimedia Commons'
where name = 'Dubois';

-- Source: commons.wikimedia.org/wiki/File:Christian_Mbilli_Assomo_Rio2016.jpg (CC BY-SA 2.0, Boxing AIBA)
update fighters set
  photo_url = '/fighters/mbilli.jpg',
  photo_credit = 'Photo: Boxing AIBA, CC BY-SA 2.0, via Wikimedia Commons'
where name = 'Mbilli';

-- Source: commons.wikimedia.org/wiki/File:Joshua_Van_1.png (CC BY 4.0, AlfredoMMA)
update fighters set
  photo_url = '/fighters/van.png',
  photo_credit = 'Photo: AlfredoMMA, CC BY 4.0, via Wikimedia Commons'
where name = 'Van';
