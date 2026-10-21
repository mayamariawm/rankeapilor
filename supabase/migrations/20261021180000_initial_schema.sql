-- Rankea pilot schema. Applied to the rankea-pilot project (sa-east-1).

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  handle text unique not null check (handle ~ '^[a-z0-9._]{3,24}$'),
  invited_by uuid references profiles,
  created_at timestamptz default now()
);

create table places (
  id text primary key,
  name text not null,
  district text not null check (district in ('Miraflores', 'Barranco')),
  category text not null check (category in ('cafe', 'brunch', 'panaderia', 'restaurante', 'bar')),
  lat double precision not null,
  lng double precision not null,
  is_new boolean default false,
  verified boolean default false,
  added_by uuid references profiles on delete set null,
  created_at timestamptz default now()
);

-- One row per user per place. position orders places within a sentiment bucket.
create table rankings (
  user_id uuid references profiles on delete cascade,
  place_id text references places on delete cascade,
  sentiment text not null check (sentiment in ('loved', 'fine', 'disliked')),
  position int not null,
  score numeric(3, 1) not null,
  note text check (char_length(note) <= 120),
  photo_path text,
  created_at timestamptz default now(),
  primary key (user_id, place_id)
);

-- "Quiero ir" list.
create table saved (
  user_id uuid references profiles on delete cascade,
  place_id text references places on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, place_id)
);

create table follows (
  follower uuid references profiles on delete cascade,
  followee uuid references profiles on delete cascade,
  created_at timestamptz default now(),
  primary key (follower, followee),
  check (follower <> followee)
);

create table invites (
  code text primary key,
  owner uuid references profiles on delete cascade,
  uses int default 0,
  max_uses int default 5
);

create index rankings_place_idx on rankings (place_id);
create index follows_followee_idx on follows (followee);
create index saved_place_idx on saved (place_id);
create index places_added_by_idx on places (added_by);
create index profiles_invited_by_idx on profiles (invited_by);
create index invites_owner_idx on invites (owner);

-- security_invoker makes the view obey the caller's RLS.
create view friend_feed with (security_invoker = true) as
  select r.*, p.name as friend_name, p.handle
  from rankings r
  join follows f on f.followee = r.user_id
  join profiles p on p.id = r.user_id
  where f.follower = auth.uid();

alter table profiles enable row level security;
alter table places enable row level security;
alter table rankings enable row level security;
alter table saved enable row level security;
alter table follows enable row level security;
alter table invites enable row level security;

create policy "profiles readable" on profiles for select to authenticated using (true);
create policy "insert own profile" on profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "update own profile" on profiles for update to authenticated using (id = (select auth.uid()));

create policy "places readable" on places for select to anon, authenticated using (true);
create policy "add places" on places for insert to authenticated with check (added_by = (select auth.uid()) and verified = false);

create policy "rankings readable" on rankings for select to authenticated using (true);
create policy "insert own rankings" on rankings for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own rankings" on rankings for update to authenticated using (user_id = (select auth.uid()));
create policy "delete own rankings" on rankings for delete to authenticated using (user_id = (select auth.uid()));

create policy "own saved" on saved for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "follows readable" on follows for select to authenticated using (true);
create policy "insert own follows" on follows for insert to authenticated with check (follower = (select auth.uid()));
create policy "delete own follows" on follows for delete to authenticated using (follower = (select auth.uid()));

create policy "own invites" on invites for all to authenticated
  using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

-- Starter venues from src/lib/venues.ts. Pins are approximate and unverified.
insert into places (id, name, district, category, lat, lng) values
  ('isolina', 'Isolina Taberna Peruana', 'Barranco', 'restaurante', -12.1497, -77.0213),
  ('central', 'Central', 'Barranco', 'restaurante', -12.1458, -77.0225),
  ('kjolle', 'Kjolle', 'Barranco', 'restaurante', -12.1459, -77.0227),
  ('juanito', 'Juanito de Barranco', 'Barranco', 'bar', -12.1492, -77.0219),
  ('ayahuasca', 'Ayahuasca Restobar', 'Barranco', 'bar', -12.1479, -77.0213),
  ('bisetti', 'Tostaduría Bisetti', 'Barranco', 'cafe', -12.1491, -77.0210),
  ('origen', 'Origen Tostadores de Café', 'Barranco', 'cafe', -12.1484, -77.0199),
  ('panetteria', 'La Panetteria', 'Barranco', 'panaderia', -12.1442, -77.0204),
  ('puku-barranco', 'Puku Puku Café', 'Barranco', 'cafe', -12.1473, -77.0207),
  ('cala', 'Cala Restaurante', 'Barranco', 'restaurante', -12.1530, -77.0245),
  ('maido', 'Maido', 'Miraflores', 'restaurante', -12.1243, -77.0290),
  ('la-mar', 'La Mar Cebichería', 'Miraflores', 'restaurante', -12.1079, -77.0366),
  ('pan-chola', 'El Pan de la Chola', 'Miraflores', 'panaderia', -12.1137, -77.0398),
  ('neira', 'Neira Café Lab', 'Miraflores', 'cafe', -12.1246, -77.0258),
  ('arabica', 'Arábica Espresso Bar', 'Miraflores', 'cafe', -12.1197, -77.0360),
  ('puku-miraflores', 'Puku Puku Café Miraflores', 'Miraflores', 'cafe', -12.1215, -77.0306),
  ('mayta', 'Mayta', 'Miraflores', 'restaurante', -12.1188, -77.0345),
  ('rafael', 'Rafael', 'Miraflores', 'restaurante', -12.1131, -77.0397),
  ('manolo', 'Manolo', 'Miraflores', 'brunch', -12.1215, -77.0289),
  ('bao', 'Bao?', 'Miraflores', 'restaurante', -12.1203, -77.0322);
