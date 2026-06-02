-- RPC for nærhetssøk: returnerer aktive annonser innenfor radius, sortert på avstand.
-- Returnerer kun id + avstand — øvrige filtre (kategori, merke, tilstand, pris …) kjøres
-- videre klientside i utforsk, så vi slipper å duplisere filterlogikken i SQL.
create or replace function annonser_i_naerheten(
  inn_lng  double precision,
  inn_lat  double precision,
  radius_m integer default 25000,
  maks     integer default 200
)
returns table (id uuid, distance_m double precision)
language sql
stable
as $$
  select
    a.id,
    st_distance(a.geog, st_setsrid(st_makepoint(inn_lng, inn_lat), 4326)::geography) as distance_m
  from annonser a
  where a.status = 'aktiv'
    and a.geog is not null
    and st_dwithin(a.geog, st_setsrid(st_makepoint(inn_lng, inn_lat), 4326)::geography, radius_m)
  order by distance_m asc
  limit maks;
$$;

grant execute on function annonser_i_naerheten(double precision, double precision, integer, integer)
  to anon, authenticated;
