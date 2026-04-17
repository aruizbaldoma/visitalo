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
  CIVITATIS_AID: 'PLACEHOLDER_CIVITATIS_AID'
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
 * Genera URL de Civitatis con afiliado
 * @param {string} activityName - Nombre de la actividad
 * @returns {string} URL completa con afiliado
 */
export const getCivitatisUrl = (activityName) => {
  const encodedQuery = encodeURIComponent(activityName);
  return `https://www.civitatis.com/es/search?q=${encodedQuery}&aid=${AFFILIATE_CONFIG.CIVITATIS_AID}`;
};
