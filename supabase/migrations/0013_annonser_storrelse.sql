-- Generisk størrelse-felt for klær (sko bruker fortsatt sko_storrelse).
alter table annonser add column if not exists storrelse text;
