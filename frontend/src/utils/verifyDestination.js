/**
 * Verifica que un destino escrito por el usuario corresponda a un lugar real
 * (país, ciudad, pueblo o región) usando Google Places Autocomplete (New).
 *
 * Devuelve:
 *  - true  → existe al menos una predicción tipo country/locality/admin_*
 *  - false → no hay coincidencias relevantes
 *
 * Si la API key no está configurada o la red falla, devuelve `true` para no
 * bloquear al usuario (fallback permisivo).
 */
const PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

const VALID_PRIMARY_TYPES = [
  "country",
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
];

export const verifyDestinationExists = async (text, lang = "es") => {
  const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
  const input = String(text || "").trim();
  if (!apiKey || input.length < 2) return true;

  try {
    const res = await fetch(PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input,
        languageCode: lang,
        includedPrimaryTypes: VALID_PRIMARY_TYPES,
      }),
    });
    if (!res.ok) return true; // no bloquear al usuario por errores de red/cuota
    const data = await res.json();
    const list = (data?.suggestions || []).map((s) => s.placePrediction).filter(Boolean);
    return list.length > 0;
  } catch {
    return true;
  }
};
