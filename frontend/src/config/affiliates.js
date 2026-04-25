/**
 * Configuración de IDs de Afiliado
 * Reemplazar con los IDs reales cuando estén disponibles
 */

export const AFFILIATE_CONFIG = {
  // ID de afiliado de Booking.com
  // URL: https://www.booking.com/affiliate-program/
  BOOKING_AID: 'PLACEHOLDER_BOOKING_AID',

  // ID de afiliado de Civitatis
  // URL: https://www.civitatis.com/es/programa-afiliados/
  CIVITATIS_AID: 'PLACEHOLDER_CIVITATIS_AID',
};

/**
 * Genera URL de Booking.com con afiliado
 * @param {string} hotelName - Nombre del hotel
 * @param {string} cityName - Nombre de la ciudad
 * @returns {string} URL completa con afiliado
 */
export const getBookingUrl = (hotelName, cityName) => {
  const searchQuery = `${hotelName} ${cityName}`;
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.booking.com/searchresults.html?ss=${encodedQuery}&aid=${AFFILIATE_CONFIG.BOOKING_AID}`;
};

/**
 * Genera URL de Civitatis: lleva al buscador con la actividad + destino
 * (URL específica del producto sin API real no es posible; el buscador
 * de Civitatis es el deep-link más cercano que devuelve resultados reales).
 */
export const getCivitatisUrl = (activityName, destination = "") => {
  const q = `${destination} ${activityName}`.trim();
  const encodedQuery = encodeURIComponent(q);
  return `https://www.civitatis.com/es/buscador/?q=${encodedQuery}&aid=${AFFILIATE_CONFIG.CIVITATIS_AID}`;
};

/**
 * Genera URL del buscador de Viator para esa actividad+destino.
 */
export const getViatorUrl = (activityName, destination = "") => {
  const q = `${destination} ${activityName}`.trim();
  const encodedQuery = encodeURIComponent(q);
  return `https://www.viator.com/search/${encodedQuery}`;
};

/**
 * Genera URL del buscador de GetYourGuide.
 */
export const getGetYourGuideUrl = (activityName, destination = "") => {
  const q = `${destination} ${activityName}`.trim();
  const encodedQuery = encodeURIComponent(q);
  return `https://www.getyourguide.com/s/?q=${encodedQuery}`;
};

/**
 * Devuelve el deep-link más cercano para reservar la actividad,
 * usando el proveedor que la propia actividad indique.
 * Si no se reconoce el proveedor, cae en Civitatis (default afiliado).
 */
export const getActivityBookingUrl = (activity, destination = "") => {
  const provider = (activity?.provider || "").toLowerCase();
  const title = activity?.title || "";

  if (provider.includes("viator")) {
    return getViatorUrl(title, destination);
  }
  if (provider.includes("getyourguide") || provider.includes("get your guide")) {
    return getGetYourGuideUrl(title, destination);
  }
  // Civitatis (default — y donde tenemos afiliado)
  return getCivitatisUrl(title, destination);
};

