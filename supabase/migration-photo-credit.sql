-- Adds a column to store required attribution text for Creative-Commons-licensed
-- fighter photos (photographer/source + license), shown next to the photo on-site.
alter table fighters add column if not exists photo_credit text;
