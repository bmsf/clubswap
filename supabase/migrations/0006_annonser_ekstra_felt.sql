-- Ekstra felt for annonser: jernsett-køller, putter/sko-detaljer, møtested.
-- Normaliserer også eldre verdier for skaft_materiale og haandighet slik at
-- Skaft-filteret på /utforsk og etikettene på detaljsiden faktisk matcher.

alter table annonser
  add column if not exists koller        text[],   -- jernsett: hvilke køller, f.eks. {'4','5','6','7','8','9','P'}
  add column if not exists putter_lengde text,
  add column if not exists hosel_type    text,
  add column if not exists sko_storrelse text,
  add column if not exists pigg_type     text,      -- 'soft' | 'fast'
  add column if not exists kan_motes     boolean;

-- Normaliser eldre verdier til kodene koden bruker ('graphite'/'steel', 'right'/'left')
update annonser set skaft_materiale = 'steel'    where skaft_materiale = 'Stål';
update annonser set skaft_materiale = 'graphite' where skaft_materiale = 'Grafitt';
update annonser set haandighet = 'right' where haandighet = 'Høyre';
update annonser set haandighet = 'left'  where haandighet = 'Venstre';
