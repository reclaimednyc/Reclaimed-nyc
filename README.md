# Reclaimed NYC

Storefront for reclaimed.nyc. Plain HTML, hosted on Cloudflare Pages, inventory in Supabase.

- `index.html` — the whole site (Shop, Reels, Gallery, About, Contact, product pages, admin at `/#admin`)
- `img/` — logo and starter photos
- `_redirects` — keeps old links (e.g. `/gallery`, `/inventory/<item>`) working
- `setup.sql` — Supabase table, storage and policies (already run)

Inventory, prices, photos and sold status are edited in the admin, not in this repo.
