# Backend plan (Supabase)

The pilot needs a server for three things: friends and their feed, invite codes, and one shared venue list. Supabase's free tier covers 300 pilot users.

## Steps

1. Create a free project at supabase.com (region: São Paulo is closest to Lima).
2. Run the SQL below in the SQL editor.
3. Turn on phone (SMS) or Google sign-in under Authentication.
4. Put the project URL and anon key in `.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Swap the AsyncStorage calls in `src/lib/store.tsx` for Supabase queries, and replace `DEMO_ACTIVITY` with the `friend_feed` view.

## Schema

```sql
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
  category text not null,
  lat double precision not null,
  lng double precision not null,
  is_new boolean default false,
  verified boolean default false,
  added_by uuid references profiles
);

-- One row per user per place. position orders places within a sentiment bucket.
create table rankings (
  user_id uuid references profiles on delete cascade,
  place_id text references places,
  sentiment text not null check (sentiment in ('loved', 'fine', 'disliked')),
  position int not null,
  score numeric(3, 1) not null,
  note text check (char_length(note) <= 120),
  photo_path text,
  created_at timestamptz default now(),
  primary key (user_id, place_id)
);

create table follows (
  follower uuid references profiles on delete cascade,
  followee uuid references profiles on delete cascade,
  primary key (follower, followee)
);

create table invites (
  code text primary key,
  owner uuid references profiles on delete cascade,
  uses int default 0,
  max_uses int default 5
);

create view friend_feed as
  select r.*, p.name as friend_name, p.handle
  from rankings r
  join follows f on f.followee = r.user_id
  join profiles p on p.id = r.user_id
  where f.follower = auth.uid();

alter table profiles enable row level security;
alter table rankings enable row level security;
alter table follows enable row level security;
alter table places enable row level security;
alter table invites enable row level security;

create policy "profiles readable" on profiles for select using (true);
create policy "own profile" on profiles for all using (id = auth.uid());
create policy "rankings readable" on rankings for select using (true);
create policy "own rankings" on rankings for all using (user_id = auth.uid());
create policy "follows readable" on follows for select using (true);
create policy "own follows" on follows for all using (follower = auth.uid());
create policy "places readable" on places for select using (true);
create policy "add places" on places for insert with check (added_by = auth.uid());
create policy "own invites" on invites for all using (owner = auth.uid());
```

Rankings are public to signed-in users in this sketch, which fits a "see what your friends rank" app. Tighten it to followers only if pilot users ask for privacy.
