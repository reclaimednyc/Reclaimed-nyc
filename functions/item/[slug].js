// reclaimdeco.com/item/<slug> — a real, crawlable page for each product.
// Serves the normal site with the product's title, price, photo and structured data filled in,
// so Google, Meta and link previews can read it. The site's own script then shows the full product view.
import { SITE, STORE, getItems, esc, money, itemUrl, photos, specs, cleanDesc, schemaCondition } from "../_lib/shop.js";

export async function onRequestGet({ params, request, env }) {
  const slug = decodeURIComponent(params.slug || "");
  let it = null;
  try {
    const rows = await getItems(env, `id=eq.${encodeURIComponent(slug)}&status=in.(available,sold)`);
    it = rows[0] || null;
  } catch (e) {
    return Response.redirect(`${SITE}/#item-${encodeURIComponent(slug)}`, 302);
  }
  if (!it) return Response.redirect(`${SITE}/#shop`, 302);

  const shell = await env.ASSETS.fetch(new URL("/", request.url));
  let html = await shell.text();

  const pics = photos(it);
  const desc = cleanDesc(it);
  const sold = it.status === "sold";
  const url = itemUrl(it);
  const brand = it.brand && it.brand !== "Unbranded" ? it.brand : null;
  const summary = (desc || it.name).replace(/\s+/g, " ").slice(0, 155);
  const title = `${it.name}${it.price && !sold ? " · " + money(it.price) : ""} · ${STORE}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: it.name,
    sku: it.id,
    url,
    ...(pics.length ? { image: pics.slice(0, 10) } : {}),
    ...(desc ? { description: desc } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(it.cat ? { category: it.cat } : {}),
    ...(Number(it.price) > 0
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: Number(it.price).toFixed(2),
            priceCurrency: "USD",
            availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            itemCondition: schemaCondition(it),
            seller: { "@type": "Organization", name: STORE },
          },
        }
      : {}),
  };

  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(summary)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="product">`,
    `<meta property="og:title" content="${esc(it.name)}">`,
    `<meta property="og:description" content="${esc(summary)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    pics[0] ? `<meta property="og:image" content="${esc(pics[0])}">` : "",
    Number(it.price) > 0 ? `<meta property="product:price:amount" content="${Number(it.price).toFixed(2)}"><meta property="product:price:currency" content="USD">` : "",
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
  ].join("\n");

  // Drop the home page's own title/description/canonical/og tags, then add the product's.
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/, "")
    .replace(/<link rel="canonical"[^>]*>/, "")
    .replace(/<meta property="og:(type|title|description|url|image)"[^>]*>\n?/g, "")
    .replace("</head>", head + "\n</head>");

  // Readable product content for anything that doesn't run the site's script.
  const body = `<article class="product"><h2>${esc(it.name)}</h2>
${sold ? `<p class="soldtag">Sold</p>` : `<p class="price">${it.price ? money(it.price) : "Ask for price"}</p>`}
${pics[0] ? `<img src="${esc(pics[0])}" alt="${esc(it.name)}" style="max-width:100%">` : ""}
${brand ? `<p>Brand: ${esc(brand)}</p>` : ""}${it.condition ? `<p>Condition: ${esc(it.condition)}</p>` : ""}
${specs(it).dimensions ? `<p>Dimensions: ${esc(specs(it).dimensions)}</p>` : ""}
${desc ? `<p class="desc">${esc(desc)}</p>` : ""}</article>`;
  html = html.replace('<div class="wrap" id="view" aria-live="polite"></div>', `<div class="wrap" id="view" aria-live="polite">${body}</div>`);

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" } });
}
