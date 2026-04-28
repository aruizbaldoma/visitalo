/**
 * Affiliate / Booking URL configuration
 *
 * Strategy:
 *  - Until we have signed affiliate agreements with providers,
 *    every "Reservar" link goes to the PROVIDER HOME (with our affiliate
 *    ID query param scaffolded in). This guarantees the user always lands
 *    on a working page.
 *  - When the affiliate program returns product-level deep-links
 *    (e.g. /es/roma/visita-guiada-vaticano/?aid=XXXX), wire them in
 *    `buildProductUrl(...)` below — `getActivityBookingUrl` will pick them
 *    up automatically.
 *
 * To go live with affiliate tracking:
 *  1. Replace placeholders in AFFILIATE_CONFIG with real IDs.
 *  2. When the provider gives you a slug per activity, store it on the
 *     activity object (e.g. `activity.providerSlug = 'roma/visita-...'`)
 *     and that URL will be used automatically.
 */

export const AFFILIATE_CONFIG = {
  // https://www.booking.com/affiliate-program/
  BOOKING_AID: "PLACEHOLDER_BOOKING_AID",
  // https://www.civitatis.com/es/programa-afiliados/
  CIVITATIS_AID: "PLACEHOLDER_CIVITATIS_AID",
  // https://www.viator.com/affiliates/
  VIATOR_AID: "PLACEHOLDER_VIATOR_AID",
  // https://partner.getyourguide.com/  (live partner ID)
  GYG_PARTNER_ID: "NZOXWEV",
};

const PROVIDER_HOME = {
  civitatis: "https://www.civitatis.com/es/",
  viator: "https://www.viator.com/",
  getyourguide: "https://www.getyourguide.com/",
};

const normalizeProvider = (provider) => {
  const p = (provider || "").toLowerCase();
  if (p.includes("viator")) return "viator";
  if (p.includes("getyourguide") || p.includes("get your guide"))
    return "getyourguide";
  return "civitatis"; // default — where we have the strongest affiliate
};

const appendAffiliate = (url, providerKey) => {
  const aidByProvider = {
    civitatis: { key: "aid", val: AFFILIATE_CONFIG.CIVITATIS_AID },
    viator: { key: "pid", val: AFFILIATE_CONFIG.VIATOR_AID },
    getyourguide: { key: "partner_id", val: AFFILIATE_CONFIG.GYG_PARTNER_ID },
  };
  const cfg = aidByProvider[providerKey];
  if (!cfg || !cfg.val || cfg.val.startsWith("PLACEHOLDER")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${cfg.key}=${encodeURIComponent(cfg.val)}`;
};

/**
 * Booking.com search URL (hotels) — kept for hotel cards.
 */
export const getBookingUrl = (hotelName, cityName) => {
  const encodedQuery = encodeURIComponent(`${hotelName} ${cityName}`);
  const base = `https://www.booking.com/searchresults.html?ss=${encodedQuery}`;
  if (
    AFFILIATE_CONFIG.BOOKING_AID &&
    !AFFILIATE_CONFIG.BOOKING_AID.startsWith("PLACEHOLDER")
  ) {
    return `${base}&aid=${AFFILIATE_CONFIG.BOOKING_AID}`;
  }
  return base;
};

/**
 * Provider HOME URL (with affiliate id when configured).
 * This is the GUARANTEED-WORKING fallback used by every activity link
 * until product-level deep-links are wired through the affiliate API.
 */
export const getProviderHomeUrl = (provider) => {
  const key = normalizeProvider(provider);
  return appendAffiliate(PROVIDER_HOME[key], key);
};

/**
 * READY-FOR-AFFILIATE-API: returns a product URL when the activity
 * carries the provider slug (e.g. `activity.providerSlug = 'roma/visita-vaticano'`).
 * Returns `null` when no slug is present.
 *
 *   activity.providerSlug → "roma/visita-guiada-vaticano"
 *   final url            → "https://www.civitatis.com/es/roma/visita-guiada-vaticano/?aid=XXXX"
 */
export const buildProductUrl = (activity) => {
  if (!activity?.providerSlug) return null;
  const provider = normalizeProvider(activity.provider);
  const base = PROVIDER_HOME[provider].replace(/\/$/, "");
  const slug = activity.providerSlug.replace(/^\/+/, "");
  return appendAffiliate(`${base}/${slug}/`, provider);
};

/**
 * Normalize any date value to YYYY-MM-DD (ISO date).
 * Accepts: 'YYYY-MM-DD', ISO datetime strings, Date objects.
 * Returns '' when the value can't be parsed.
 */
const toYMD = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Build a GetYourGuide search URL with our affiliate partner_id and optional
 * travel dates so the user lands on availability for their trip.
 *
 * Format:
 *   https://www.getyourguide.com/s/?q=<NAME>&partner_id=NZOXWEV
 *     &date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
 */
export const buildGetYourGuideSearchUrl = (
  query,
  { startDate, endDate } = {},
) => {
  const url = new URL("https://www.getyourguide.com/s/");
  const q = String(query || "").trim();
  if (q) url.searchParams.set("q", q);
  if (AFFILIATE_CONFIG.GYG_PARTNER_ID) {
    url.searchParams.set("partner_id", AFFILIATE_CONFIG.GYG_PARTNER_ID);
  }
  const from = toYMD(startDate);
  const to = toYMD(endDate);
  if (from) url.searchParams.set("date_from", from);
  if (to) url.searchParams.set("date_to", to);
  return url.toString();
};

/**
 * Main helper used by ActivityCard and AlternativesModal.
 *
 * Order of preference:
 *  1) `activity.bookingUrl` — explicit URL coming from the API/affiliate feed.
 *  2) GetYourGuide search URL pre-filtered by activity name + travel dates.
 *
 * Second arg supports both legacy call (string `destination`) and the new
 * options object `{ destination, startDate, endDate }`.
 */
export const getActivityBookingUrl = (activity, opts = {}) => {
  if (activity?.bookingUrl) return activity.bookingUrl;
  const options = typeof opts === "string" ? { destination: opts } : (opts || {});
  const query =
    activity?.title ||
    activity?.name ||
    options.destination ||
    "";
  return buildGetYourGuideSearchUrl(query, {
    startDate: options.startDate,
    endDate: options.endDate,
  });
};

// Legacy named exports (kept so older imports keep working).
export const getCivitatisUrl = (_title = "", _destination = "") =>
  getProviderHomeUrl("civitatis");
export const getViatorUrl = (_title = "", _destination = "") =>
  getProviderHomeUrl("viator");
export const getGetYourGuideUrl = (_title = "", _destination = "") =>
  getProviderHomeUrl("getyourguide");
