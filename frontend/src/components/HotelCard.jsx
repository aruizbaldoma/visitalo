import { Hotel, MapPin, Info, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

export const HotelCard = ({ hotel, destination, isUserHotel = false, onInfo, onAlternative, onDelete }) => {
  const [showTooltip, setShowTooltip] = useState(null);

  if (!hotel) return null;

  const hotelName = hotel.name || "";
  // URL de reserva: preferir `website` o `hotel_url` del hotel; si no hay, Google Search como fallback.
  const bookingUrl =
    hotel.website ||
    hotel.hotel_url ||
    `https://www.google.com/search?q=${encodeURIComponent(`${hotelName} ${destination || ""} reservar`)}`;

  const handleAlternative = () => {
    if (onAlternative) onAlternative(hotel);
  };

  const handleDelete = () => {
    if (window.confirm("¿Eliminar este hotel del itinerario?")) {
      if (onDelete) onDelete(hotel.id);
    }
  };

  // Si es hotel del usuario, mostrarlo como informativo (estilo FlightCard)
  if (isUserHotel) {
    return (
      <div 
        className="flex gap-4 p-4 bg-white hover:shadow-lg transition-all"
        style={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: '8px'
        }}
      >
        {/* Icono */}
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#f0fdf4' }}
          >
            <Hotel className="w-6 h-6" style={{ color: '#031834' }} />
          </div>
        </div>

        {/* Contenido - Solo informativo */}
        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-gray-900 mb-1">
            {hotel.name}
          </h5>
          {hotel.zone && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              {hotel.zone}
            </div>
          )}
          {hotel.address && (
            <p className="text-xs text-gray-500 mt-1">
              {hotel.address}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si NO es hotel del usuario, mostrar con botones (sin Reservar - pendiente)
  return (
    <div 
      className="flex flex-col sm:flex-row gap-4 p-4 bg-white hover:shadow-lg transition-all group"
      style={{ 
        border: '1px solid #E5E7EB', 
        borderRadius: '8px'
      }}
    >
      {/* Icono */}
      <div className="flex-shrink-0">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <Hotel className="w-6 h-6" style={{ color: '#031834' }} />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900 mb-1">
              {hotel.name}
            </h5>
            {hotel.zone && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{hotel.zone}</span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-start gap-2 flex-shrink-0 self-end sm:self-start">
            {/* Botón Reservar */}
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors"
              style={{ backgroundColor: "#3ccca4", color: "#031834" }}
              data-testid="hotel-booking-link"
            >
              Reservar
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Botón Info */}
            {onInfo && (
              <button
                onClick={() => onInfo(hotel)}
                onMouseEnter={() => setShowTooltip('info')}
                onMouseLeave={() => setShowTooltip(null)}
                className="relative p-2 hover:bg-blue-50 transition-colors"
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                title="Ver información completa"
              >
                <Info className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                {showTooltip === 'info' && (
                  <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Ver información
                  </div>
                )}
              </button>
            )}

            {/* Botón Alternativa */}
            {onAlternative && (
              <button
                onClick={handleAlternative}
                onMouseEnter={() => setShowTooltip('alt')}
                onMouseLeave={() => setShowTooltip(null)}
                className="relative p-2 hover:bg-green-50 transition-colors"
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                title="Buscar alternativa"
              >
                <RefreshCw className="w-4 h-4 text-gray-600 hover:text-[#3ccca4]" />
                {showTooltip === 'alt' && (
                  <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Cambiar hotel
                  </div>
                )}
              </button>
            )}

            {/* Botón Eliminar */}
            {onDelete && (
              <button
                onClick={handleDelete}
                onMouseEnter={() => setShowTooltip('delete')}
                onMouseLeave={() => setShowTooltip(null)}
                className="relative p-2 hover:bg-red-50 transition-colors"
                style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                title="Eliminar hotel"
              >
                <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                {showTooltip === 'delete' && (
                  <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Eliminar
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
