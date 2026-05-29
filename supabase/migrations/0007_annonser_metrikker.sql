-- Skaftlengde + normalisering av tilstandsverdier til faste koder
-- (ny | utmerket | god | akseptabel) slik at create/edit, detaljside og
-- /utforsk-filteret bruker samme verdier.

alter table annonser add column if not exists skaft_lengde text;

update annonser set tilstand = 'ny'         where tilstand in ('Ny', 'mint', 'ny');
update annonser set tilstand = 'utmerket'   where tilstand in ('Som ny', 'Meget god', 'very_good');
update annonser set tilstand = 'god'        where tilstand in ('God', 'Bra', 'good', 'bra');
update annonser set tilstand = 'akseptabel' where tilstand in ('Akseptabel', 'OK', 'Slitt', 'fair', 'ok', 'slitt');
