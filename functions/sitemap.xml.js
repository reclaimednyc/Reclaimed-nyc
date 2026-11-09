// reclaimdeco.com/sitemap.xml — home, about, and a page for every available or sold piece.
import { SITE, getItems, esc, itemUrl } from "./_lib/shop.js";

export async function onRequestGet({ env }) {
  let rows = [];
  try { rows = await getItems(env, "status=in.(available,sold)"); } catch (e) {}
  const urls = [`${SITE}/`, `${SITE}/about`, ...rows.map(itemUrl)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=600" } });
}
