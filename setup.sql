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

-- Current inventory
insert into public.items (id, name, price, brand, cat, description, img, status, sort) values
('austin-swivel-chair-west-elm', 'Austin Swivel Chair by West Elm', 650, 'West Elm', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999988),
('bernhardt-sofa-set', 'Bernhardt Sofa Set', 2850, 'Bernhardt', 'Sofas & Sectionals', '', '[]'::jsonb, 'available', 999992),
('bucket-chairs', 'Bucket Chairs', 100, 'Unbranded', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999982),
('cassina-dining-chair', 'Cassina Dining Chair', 300, 'Cassina', 'Dining Sets', '', '["img/cassina.jpg"]'::jsonb, 'available', 999999),
('ekornes-bentwood-tables', 'Ekornes Bentwood Tables', 400, 'Ekornes', 'Misc', '', '["img/ekornes.jpg","img/ekornes2.jpg","img/ekornes3.jpg"]'::jsonb, 'available', 1000000),
('ekornes-olso-loveseat', 'Ekornes “Olso” Loveseat', 1000, 'Ekornes', 'Sofas & Sectionals', '', '[]'::jsonb, 'available', 999993),
('ekornes-olso-paradise-reclining-sofa-set', 'Ekornes “Olso” + Paradise Reclining Sofa Set', 2150, 'Ekornes', 'Sofas & Sectionals', '', '[]'::jsonb, 'available', 999995),
('ethan-allen-cromwell-recliner', 'Ethan Allen “Cromwell” Recliner', 1250, 'Ethan Allen', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999998),
('geiger-crosshatch-lounge-chairs', 'Geiger “Crosshatch” Lounge Chairs', 600, 'Geiger', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999996),
('herman-miller-eames', 'Herman Miller Eames Lounge Chair & Ottoman', null, 'Herman Miller', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999987),
('keilhauer-bar-stool', 'Keilhauer Bar Stool', 200, 'Keilhauer', 'Office', '', '[]'::jsonb, 'available', 999981),
('muuto-cover-armchair', 'Muuto “Cover” Armchair', 200, 'Muuto', 'Dining Sets', '', '[]'::jsonb, 'available', 999997),
('rainbow-chairs', 'Rainbow Chairs by Grand Rapids Chair Company', 125, 'Grand Rapids Chair Co.', 'Dining Sets', '', '[]'::jsonb, 'available', 999983),
('ralph-lauren-wentworth', 'Ralph Lauren “Wentworth” Sofa', null, 'Ralph Lauren', 'Sofas & Sectionals', '', '["img/g2.jpg"]'::jsonb, 'sold', 999976),
('red-and-blue-chair', 'Red and Blue Chair', null, 'Unbranded', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999986),
('rh-maxwell-sofa', 'RH Maxwell 6’ Sofa', null, 'RH', 'Sofas & Sectionals', '', '["img/g3.jpg"]'::jsonb, 'sold', 999975),
('rh-maxwell-velvet-chairs', 'RH “Maxwell” Velvet Chairs', null, 'RH', 'Lounge & Accent Chairs', '', '["img/g4.jpg"]'::jsonb, 'sold', 999974),
('rustic-wood-metal-dining-chairs', 'Rustic Wood + Metal Dining Chairs', 125, 'Unbranded', 'Dining Sets', '', '[]'::jsonb, 'available', 999984),
('steelcase-coffee-table', 'Steelcase Coffee Table', 500, 'Steelcase', 'Misc', '', '["img/steelcase.jpg"]'::jsonb, 'available', 999980),
('stellarworks-dining-chairs', 'Stellarworks Dining Chairs', 200, 'Stellarworks', 'Dining Sets', '', '[]'::jsonb, 'available', 999985),
('stellarworks-utility-sofa', 'Stellarworks “Utility Sofa 3-sides”', null, 'Stellarworks', 'Sofas & Sectionals', '', '["img/g1.jpg"]'::jsonb, 'sold', 999977),
('stickley-sofa-set', 'Stickley Sofa Set', 4000, 'Stickley', 'Sofas & Sectionals', '', '[]'::jsonb, 'available', 999994),
('strange-metal-chair', 'Strange Metal Chair', 200, 'Unbranded', 'Misc', '', '["img/strange.jpg"]'::jsonb, 'available', 999979),
('stressless-paradise-set', 'Ekornes / Stressless Paradise Sofa + Loveseat Set', null, 'Ekornes', 'Sofas & Sectionals', '', '[]'::jsonb, 'available', 999990),
('stressless-wave-sofa', 'Ekornes / Stressless “Wave” 3-Seat Reclining Sofa', 2000, 'Ekornes', 'Sofas & Sectionals', '', '[]'::jsonb, 'available', 999991),
('thomasville-chair', 'Thomasville Chair', 100, 'Thomasville', 'Lounge & Accent Chairs', '', '[]'::jsonb, 'available', 999989),
('walnut-end-tables', 'Walnut End Tables', 350, 'Unbranded', 'Misc', '', '["img/walnut.jpg"]'::jsonb, 'available', 999978)
on conflict (id) do nothing;
