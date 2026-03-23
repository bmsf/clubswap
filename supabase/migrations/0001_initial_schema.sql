-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type listing_category as enum (
  'driver',
  'fairway_wood',
  'hybrid',
  'irons',
  'wedge',
  'putter',
  'bag',
  'shoes',
  'clothing',
  'accessories',
  'other'
);

create type listing_condition as enum (
  'mint',
  'very_good',
  'good',
  'fair'
);

create type listing_status as enum (
  'active',
  'sold',
  'archived'
);

create type currency_code as enum (
  'NOK',
  'SEK',
  'DKK',
  'EUR'
);

create type shaft_flex as enum (
  'ladies',
  'senior',
  'regular',
  'stiff',
  'x_stiff'
);

create type shaft_material as enum (
  'graphite',
  'steel'
);

create type grip_size as enum (
  'undersize',
  'standard',
  'midsize',
  'jumbo'
);

create type hand_preference as enum (
  'right',
  'left'
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  full_name      text,
  username       text unique not null,
  avatar_url     text,
  location_city  text,
  location_country text not null default 'NO',
  handicap_index numeric(4,1),
  ngf_member_number text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- RLS for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- LISTINGS
-- ============================================================

create table listings (
  id          uuid primary key default uuid_generate_v4(),
  seller_id   uuid not null references profiles(id) on delete cascade,
  title       text not null,
  description text not null,
  category    listing_category not null,
  condition   listing_condition not null,
  price       integer not null check (price > 0),
  currency    currency_code not null default 'NOK',
  status      listing_status not null default 'active',
  location_city    text,
  location_country text not null default 'NO',
  images      text[] not null default '{}',
  specs       jsonb not null default '{}',
  views_count integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger listings_updated_at
  before update on listings
  for each row execute function update_updated_at();

-- Indexes for common filters
create index listings_category_idx on listings(category);
create index listings_condition_idx on listings(condition);
create index listings_status_idx on listings(status);
create index listings_seller_id_idx on listings(seller_id);
create index listings_price_idx on listings(price);
create index listings_created_at_idx on listings(created_at desc);

-- RLS for listings
alter table listings enable row level security;

create policy "Active listings are viewable by everyone"
  on listings for select
  using (status = 'active' or auth.uid() = seller_id);

create policy "Authenticated users can create listings"
  on listings for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update their own listings"
  on listings for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete their own listings"
  on listings for delete
  using (auth.uid() = seller_id);

-- ============================================================
-- MESSAGES
-- ============================================================

create table messages (
  id           uuid primary key default uuid_generate_v4(),
  listing_id   uuid not null references listings(id) on delete cascade,
  sender_id    uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index messages_listing_id_idx on messages(listing_id);
create index messages_sender_id_idx on messages(sender_id);
create index messages_recipient_id_idx on messages(recipient_id);
create index messages_created_at_idx on messages(created_at);

-- RLS for messages
alter table messages enable row level security;

create policy "Users can view their own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Authenticated users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipients can mark messages as read"
  on messages for update
  using (auth.uid() = recipient_id);

-- ============================================================
-- REVIEWS
-- ============================================================

create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  reviewer_id uuid not null references profiles(id) on delete cascade,
  seller_id   uuid not null references profiles(id) on delete cascade,
  listing_id  uuid not null references listings(id) on delete cascade,
  rating      smallint not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  -- One review per listing per reviewer
  unique(reviewer_id, listing_id)
);

create index reviews_seller_id_idx on reviews(seller_id);
create index reviews_listing_id_idx on reviews(listing_id);

-- RLS for reviews
alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select using (true);

create policy "Authenticated users can create reviews"
  on reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Reviewers can update their own reviews"
  on reviews for update
  using (auth.uid() = reviewer_id);

-- ============================================================
-- HANDLE NEW USER (auto-create profile on signup)
-- ============================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
