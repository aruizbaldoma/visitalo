import { Plane, ExternalLink } from "lucide-react";
import { getBookingUrl } from "../config/affiliates";

export const FlightCard = ({ flight, destination, showButton = true }) => {
  if (!flight) return null;

  const bookingUrl = getBookingUrl("Vuelos", destination);

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
          style={{ backgroundColor: '#f0f9ff' }}
        >
          <Plane className="w-6 h-6" style={{ color: '#031834' }} />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-gray-900 mb-1">
          {flight.type === 'arrival' ? 'Vuelo de Llegada' : 'Vuelo de Salida'}
        </h5>
        <p className="text-sm text-gray-600 mb-2">
          {flight.time}
        </p>
        {flight.details && (
          <p className="text-xs text-gray-500">
            {flight.details}
          </p>
        )}
      </div>

      {/* Botón de Acción - Solo si showButton es true */}
      {showButton && (
        <div className="flex items-center">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 font-medium text-white hover:shadow-lg transition-all"
            style={{ backgroundColor: '#3ccca4', borderRadius: '8px' }}
          >
            Ver Disponibilidad
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
