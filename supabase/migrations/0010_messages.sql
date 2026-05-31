-- Meldinger (buyer<->seller chat) knyttet til annonser.
-- Idempotent: håndterer både manglende tabell og en eksisterende tabell der
-- listing_id feilaktig peker på den utgåtte `listings`-tabellen.

create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null,
  sender_id    uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- Sørg for at listing_id-FK peker på annonser (dropp ev. gammel listings-FK).
do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.messages'::regclass and contype = 'f'
      and conname like '%listing_id%'
  loop
    execute format('alter table messages drop constraint %I', c);
  end loop;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.messages'::regclass and contype = 'f'
      and conname = 'messages_listing_id_annonser_fkey'
  ) then
    alter table messages
      add constraint messages_listing_id_annonser_fkey
      foreign key (listing_id) references annonser(id) on delete cascade;
  end if;
end $$;

create index if not exists messages_listing_id_idx   on messages(listing_id);
create index if not exists messages_sender_id_idx     on messages(sender_id);
create index if not exists messages_recipient_id_idx  on messages(recipient_id);
create index if not exists messages_created_at_idx    on messages(created_at);

alter table messages enable row level security;

drop policy if exists "Users can view their own messages" on messages;
create policy "Users can view their own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Authenticated users can send messages" on messages;
create policy "Authenticated users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Recipients can mark messages as read" on messages;
create policy "Recipients can mark messages as read"
  on messages for update
  using (auth.uid() = recipient_id);

-- Realtime: legg messages til i supabase_realtime-publiseringen (hvis ikke allerede der).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end $$;
