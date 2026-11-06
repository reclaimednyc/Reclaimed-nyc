-- Reclaimed NYC: paste this whole file into Supabase > SQL Editor > New query, then Run.

create table if not exists public.items (
  id text primary key,
  name text not null,
  price numeric,
  brand text default 'Unbranded',
  cat text default 'Misc',
  description text default '',
  img jsonb default '[]'::jsonb,
  status text not null default 'available' check (status in ('available','sold','hidden')),
  sort bigint default 0,
  condition text check (condition in ('New','Open Box','Like New','Excellent','Good')),
  restored boolean not null default false,
  specs jsonb not null default '{}'::jsonb,
  video text,
  updated_at timestamptz default now()
);

alter table public.items enable row level security;

-- Anyone can see available and sold pieces. Only you (signed in) can see hidden ones or change anything.
drop policy if exists "public read" on public.items;
create policy "public read" on public.items for select using (status <> 'hidden' or auth.role() = 'authenticated');
drop policy if exists "owner write" on public.items;
create policy "owner write" on public.items for all to authenticated using (true) with check (true);

-- Photo storage
insert into storage.buckets (id, name, public) values ('photos','photos', true) on conflict (id) do nothing;
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'photos');
drop policy if exists "photos owner upload" on storage.objects;
create policy "photos owner upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
drop policy if exists "photos owner delete" on storage.objects;
create policy "photos owner delete" on storage.objects for delete to authenticated using (bucket_id = 'photos');

