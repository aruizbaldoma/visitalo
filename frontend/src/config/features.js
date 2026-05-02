/**
 * Feature flags globales del frontend.
 *
 * Cambia un valor a `true` para reactivar la funcionalidad correspondiente
 * sin tener que tocar componentes individuales.
 */
export const FEATURES = {
  // Habilita/oculta TODA la marca PLUS de la web:
  //  - Sección de upsell en la home
  //  - Bloques bloqueados en el modal "Personaliza tu viaje"
  //  - Toasts de "te quedan N búsquedas PLUS"
  //  - Badge "PLUS activo" y botón "Gestionar suscripción" en /mis-viajes
  // Cuando está en `false`, los usuarios disfrutan de todas las funciones
  // (multi-ciudad, categorías de hotel, preferencias) sin ningún
  // recordatorio de PLUS.
  PLUS_ENABLED: false,
};
