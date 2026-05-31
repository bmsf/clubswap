-- «Original headcover»-feltet for køller (driver/fairway/hybrid/putter).
-- Manglet i annonser-tabellen, så publiser/oppdater feilet (PostgREST: ukjent kolonne).
-- Nullbar: null = ikke relevant / ukjent.
alter table annonser add column if not exists includes_headcover boolean;
