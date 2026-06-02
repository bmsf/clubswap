-- Posisjonsdata for nærhetssøk («finn annonser i nærheten»).
-- Geokoding skjer på postnummer-nivå (sentroide) — vi lagrer aldri gatenøyaktige koordinater.
-- Alt er idempotent (kjøres manuelt i Supabase-dashboardet).

create extension if not exists postgis;

-- ── Oppslagstabell: postnummer → poststed + sentroide ──────────────────────────
create table if not exists postnummer_steder (
  postnummer text primary key,
  poststed   text not null,
  lat        double precision not null,
  lng        double precision not null,
  geog       geography(Point, 4326)
    generated always as (st_setsrid(st_makepoint(lng, lat), 4326)::geography) stored
);

alter table postnummer_steder enable row level security;

-- Offentlig referansedata: alle kan lese.
drop policy if exists "Alle kan lese postnummer" on postnummer_steder;
create policy "Alle kan lese postnummer"
  on postnummer_steder for select
  using (true);

-- ── geog-trigger for muterbare tabeller (lat/lng settes av server-action) ──────
create or replace function set_geog_from_latlng()
returns trigger
language plpgsql
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.geog := st_setsrid(st_makepoint(new.lng, new.lat), 4326)::geography;
  else
    new.geog := null;
  end if;
  return new;
end;
$$;

-- ── Koordinater på lagrede adresser ────────────────────────────────────────────
alter table user_addresses add column if not exists lat  double precision;
alter table user_addresses add column if not exists lng  double precision;
alter table user_addresses add column if not exists geog geography(Point, 4326);

drop trigger if exists user_addresses_geog on user_addresses;
create trigger user_addresses_geog
  before insert or update of lat, lng on user_addresses
  for each row execute function set_geog_from_latlng();

-- ── Koordinater på annonser (denormalisert for enkelt, indeksert nærhetssøk) ────
alter table annonser add column if not exists lat  double precision;
alter table annonser add column if not exists lng  double precision;
alter table annonser add column if not exists geog geography(Point, 4326);

create index if not exists annonser_geog_gix on annonser using gist (geog);

drop trigger if exists annonser_geog on annonser;
create trigger annonser_geog
  before insert or update of lat, lng on annonser
  for each row execute function set_geog_from_latlng();

-- ── Best-effort backfill av eksisterende annonser (matcher poststed-tekst) ─────
-- Annonser uten treff forblir uten koordinater og vises ikke i nærhetssøk før de redigeres.
update annonser a
set lat = p.lat, lng = p.lng
from postnummer_steder p
where a.lat is null
  and a.selges_fra is not null
  and lower(a.selges_fra) = lower(p.poststed);
