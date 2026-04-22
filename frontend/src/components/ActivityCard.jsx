import { Info, RefreshCw, Trash2, Clock, MapPin, Euro, ExternalLink } from "lucide-react";
import { useState } from "react";
import { getCivitatisUrl } from "../config/affiliates";

export const ActivityCard = ({ activity, isAuthenticated, onInfo, onAlternative, onDelete }) => {
  const [showTooltip, setShowTooltip] = useState(null);

  const handleAlternative = () => {
    onAlternative(activity);
  };

  const handleDelete = () => {
    if (window.confirm("¿Eliminar esta actividad del itinerario?")) {
      onDelete(activity.activityId);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white hover:shadow-lg transition-all group" style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      {/* Hora */}
      <div className="flex-shrink-0 sm:w-20 flex sm:block items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#3ccca4' }}>
          <Clock className="w-4 h-4" />
          {activity.time}
        </div>
        {activity.duration && (
          <div className="text-xs text-gray-500 sm:mt-1 sm:ml-6">
            {activity.duration}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-gray-900 mb-1 text-base">
              {activity.title}
            </h5>
            <p className="text-sm text-gray-600 mb-2">
              {activity.description}
            </p>
            {activity.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{activity.location}</span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-start gap-2 flex-shrink-0 self-end sm:self-start">
            {/* Botón Info */}
            <button
              onClick={() => onInfo(activity)}
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

            {/* Botón Alternativa */}
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
                  Cambiar plan
                </div>
              )}
            </button>

            {/* Botón Eliminar */}
            <button
              onClick={handleDelete}
              onMouseEnter={() => setShowTooltip('delete')}
              onMouseLeave={() => setShowTooltip(null)}
              className="relative p-2 hover:bg-red-50 transition-colors"
              style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
              title="Eliminar actividad"
            >
              <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
              {showTooltip === 'delete' && (
                <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Eliminar
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Precio y Provider */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          <span className="text-xs text-gray-500">Por {activity.provider}</span>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Precio SIEMPRE visible */}
            <div className="flex items-center gap-1 font-bold text-lg" style={{ color: '#031834' }}>
              <Euro className="w-4 h-4" />
              {activity.price?.toFixed(2)}
            </div>

            {/* Botón Reservar Actividad */}
            <a
              href={getCivitatisUrl(activity.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all"
              style={{ backgroundColor: '#3ccca4', borderRadius: '8px' }}
            >
              Reservar
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
