/**
 * Convierte un string a slug SEO-friendly:
 * - minúsculas
 * - elimina tildes
 * - reemplaza espacios/símbolos por guiones
 * - quita caracteres especiales
 *
 * Ejemplos:
 *   "Madrid" → "madrid"
 *   "¿Qué ver en El Retiro?" → "que-ver-en-el-retiro"
 *   "Roma 5 días - Cultural" → "roma-5-dias-cultural"
 */
export const slugify = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Genera una URL SEO para un itinerario.
 * visitalo.es/:ciudad/:resumen
 *
 * Ejemplos:
 *   buildItineraryUrl("Madrid", "qué ver 5 días")
 *     → "/madrid/que-ver-5-dias"
 */
export const buildItineraryUrl = (destination, summary = "itinerario") =>
  `/${slugify(destination)}/${slugify(summary)}`;

/**
 * Extrae destino y slug-resumen desde la URL actual.
 * Devuelve null si no sigue el patrón /:ciudad/:slug
 */
export const parseItineraryUrl = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  // Evita colisiones con rutas conocidas (blog, auth, etc.)
  const reserved = ["blog", "api", "auth", "login", "register", "admin"];
  if (reserved.includes(parts[0])) return null;
  return { citySlug: parts[0], summarySlug: parts[1] };
};
