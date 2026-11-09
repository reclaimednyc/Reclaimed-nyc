// reclaimdeco.com/feed.xml — product feed for Google Merchant Center.
// reclaimdeco.com/feed.xml?for=meta — same feed for Meta Commerce Manager (always includes a brand).
// Built live from the inventory: only available pieces with a price and at least one photo; replicas and
// pieces marked "keep out of ads" in the admin are left out.
import { SITE, STORE, getItems, esc, itemUrl, photos, specs, cleanDesc, feedCondition, feedEligible } from "./_lib/shop.js";

export async function onRequestGet({ request, env }) {
  const meta = new URL(request.url).searchParams.get("for") === "meta";
  let rows;
  try { rows = await getItems(env, "status=eq.available"); }
  catch (e) { return new Response("Inventory unavailable, try again shortly.", { status: 503 }); }

  const items = rows.filter(feedEligible).map((it) => {
    const pics = photos(it);
    const brand = it.brand && it.brand !== "Unbranded" ? it.brand : null;
    const desc = (cleanDesc(it) || `${it.name}. ${it.condition ? it.condition + " condition." : ""}`).slice(0, 4900);
    const s = specs(it);
    const f = [
      `<g:id>${esc(it.id)}</g:id>`,
      `<g:title>${esc(String(it.name).slice(0, 150))}</g:title>`,
      `<g:description>${esc(desc)}</g:description>`,
      `<g:link>${esc(itemUrl(it))}</g:link>`,
      `<g:image_link>${esc(pics[0])}</g:image_link>`,
      ...pics.slice(1, 11).map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`),
      `<g:availability>in_stock</g:availability>`,
      `<g:price>${Number(it.price).toFixed(2)} USD</g:price>`,
      `<g:condition>${feedCondition(it)}</g:condition>`,
      brand ? `<g:brand>${esc(brand)}</g:brand>` : meta ? `<g:brand>${esc(STORE)}</g:brand>` : "",
      `<g:identifier_exists>no</g:identifier_exists>`,
      `<g:product_type>${esc("Furniture > " + (it.cat || "Misc"))}</g:product_type>`,
      s.qty > 1 && meta ? `<g:quantity_to_sell_on_facebook>${Number(s.qty)}</g:quantity_to_sell_on_facebook>` : "",
    ].filter(Boolean).join("\n      ");
    return `    <item>\n      ${f}\n    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${STORE}</title>
    <link>${SITE}</link>
    <description>Designer furniture below retail from ${STORE}.</description>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
}
