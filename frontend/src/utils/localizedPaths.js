/**
 * Bidirectional path mapping for ES <-> EN routes.
 * Used by the Language Switcher so that switching language on a localized
 * route (e.g. /destinos, or any SEO itinerary page) keeps the user on the
 * equivalent page in the other language instead of breaking the URL.
 */
import { seoItineraries } from "../data/seoItineraries";

// Static, hand-curated mappings (hub pages and any other localized routes
// that are not driven by seoItineraries data).
const STATIC_PAIRS = [
  { es: "/destinos", en: "/destinations" },
  { es: "/sobre", en: "/about" },
];

// Build dynamic SEO itinerary slug pairs from the data file.
const buildDynamicPairs = () => {
  const pairs = [];
  for (const id of Object.keys(seoItineraries)) {
    const entry = seoItineraries[id];
    if (entry?.es?.slug && entry?.en?.slug) {
      pairs.push({
        es: `/${entry.es.slug}`,
        en: `/${entry.en.slug}`,
      });
    }
  }
  return pairs;
};

const ALL_PAIRS = [...STATIC_PAIRS, ...buildDynamicPairs()];

// Pre-build O(1) lookup tables.
const ES_TO_EN = new Map();
const EN_TO_ES = new Map();
for (const { es, en } of ALL_PAIRS) {
  ES_TO_EN.set(es, en);
  EN_TO_ES.set(en, es);
}

/**
 * Returns the equivalent path in the target language.
 * Falls back to the original path when no mapping is registered.
 *
 * @param {string} currentPath - Current pathname (e.g. window.location.pathname)
 * @param {"es" | "en"} targetLang - The language to switch to
 * @returns {string} Localized pathname for the target language
 */
export const getLocalizedPath = (currentPath, targetLang) => {
  if (!currentPath) return "/";

  // Normalize: strip trailing slash (except for root).
  const path = currentPath.length > 1 && currentPath.endsWith("/")
    ? currentPath.slice(0, -1)
    : currentPath;

  if (targetLang === "en" && ES_TO_EN.has(path)) {
    return ES_TO_EN.get(path);
  }
  if (targetLang === "es" && EN_TO_ES.has(path)) {
    return EN_TO_ES.get(path);
  }

  // No mapping registered — keep the user on the same path.
  return path;
};
