create table user_addresses (
  id           uuid default gen_random_uuid() primary key,
  bruker_id    uuid references auth.users(id) on delete cascade not null,
  full_address text not null,
  poststed     text not null,
  er_standard  boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table user_addresses enable row level security;

create policy "Users can manage own addresses"
  on user_addresses for all
  using (bruker_id = auth.uid())
  with check (bruker_id = auth.uid());
