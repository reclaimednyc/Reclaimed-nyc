// Shared helpers for the server-side pages (product pages, feed, sitemap).
export const SITE = "https://reclaimdeco.com";
export const SUPABASE_URL = "https://yqyrbrsnbppazlwtoqos.supabase.co";
export const SUPABASE_KEY = "sb_publishable_6-eEoGjrQuM87AwWML7Gqw_fdXCURea";
export const STORE = "Reclaim Deco";

export async function getItems(env, query = "status=eq.available") {
  const base = (env && env.SUPABASE_URL) || SUPABASE_URL;
  const r = await fetch(`${base}/rest/v1/items?select=*&${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    cf: { cacheTtl: 60, cacheEverything: true },
  });
  if (!r.ok) throw new Error(`inventory ${r.status}`);
  return r.json();
}

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const money = (p) => "$" + Number(p).toLocaleString("en-US", { maximumFractionDigits: 0 });
export const itemUrl = (it) => `${SITE}/item/${encodeURIComponent(it.id)}`;
export const photos = (it) => (Array.isArray(it.img) ? it.img.filter((u) => /^https?:\/\//.test(u)) : []);
export const specs = (it) => (it.specs && typeof it.specs === "object" ? it.specs : {});

// Written description, minus the "Retail: $X" line (shown separately on the site).
export const cleanDesc = (it) =>
  String(it.description || "").replace(/^\s*Retail:\s*\$[\d,.]+\s*$/gim, "").replace(/\n{3,}/g, "\n\n").trim();

// Google/Meta condition values: new | refurbished | used
export function feedCondition(it) {
  if (it.condition === "New") return "new";
  if (it.restored) return "refurbished";
  return "used";
}
export const schemaCondition = (it) =>
  ({ new: "https://schema.org/NewCondition", refurbished: "https://schema.org/RefurbishedCondition", used: "https://schema.org/UsedCondition" }[feedCondition(it)]);

// What goes into Google Shopping / Meta catalogs
export function feedEligible(it) {
  const s = specs(it);
  return (
    it.status === "available" &&
    Number(it.price) > 0 &&
    photos(it).length > 0 &&
    !/replica/i.test(it.name || "") &&
    !s.no_feed
  );
}
