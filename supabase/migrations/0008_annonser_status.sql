-- Status for annonser: aktiv (publisert), solgt (ferdig), paabegynt (utkast)
-- Eksisterende rader får 'aktiv' via default.
alter table annonser add column if not exists status text not null default 'aktiv';
create index if not exists annonser_status_idx on annonser(status);
