-- Utvidet adressemodell (matcher ny adresse-velger à la Tise): navn + land + oppdelt
-- gate/postnummer. full_address og poststed beholdes som sammensatt visningsverdi.
alter table user_addresses add column if not exists navn        text;
alter table user_addresses add column if not exists land        text not null default 'Norge';
alter table user_addresses add column if not exists gateadresse text;
alter table user_addresses add column if not exists gatenummer  text;
alter table user_addresses add column if not exists postnummer  text;

-- Beliggenhetspresisjon per annonse: 'generell' (omtrentlig) eller 'noyaktig' (eksakt).
alter table annonser add column if not exists beliggenhet_presisjon text not null default 'generell';
