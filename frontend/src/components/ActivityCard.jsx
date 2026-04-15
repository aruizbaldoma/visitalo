import { Info, RefreshCw, Trash2, Clock, MapPin, Euro } from "lucide-react";
import { useState } from "react";

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
    <div className="flex gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#3ccca4] hover:shadow-lg transition-all group">
      {/* Hora */}
      <div className="flex-shrink-0 w-20">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#3ccca4' }}>
          <Clock className="w-4 h-4" />
          {activity.time}
        </div>
        {activity.duration && (
          <div className="text-xs text-gray-500 mt-1 ml-6">
            {activity.duration}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-1 text-base">
              {activity.title}
            </h5>
            <p className="text-sm text-gray-600 mb-2">
              {activity.description}
            </p>
            {activity.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3" />
                {activity.location}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-start gap-2 flex-shrink-0">
            {/* Botón Info */}
            <button
              onClick={() => onInfo(activity)}
              onMouseEnter={() => setShowTooltip('info')}
              onMouseLeave={() => setShowTooltip(null)}
              className="relative p-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
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
              className="relative p-2 rounded-lg border border-gray-300 hover:border-[#3ccca4] hover:bg-green-50 transition-colors"
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
              className="relative p-2 rounded-lg border border-gray-300 hover:border-red-500 hover:bg-red-50 transition-colors"
              title="Eliminar actividad"
            >
              <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
              {showTooltip === 'delete' && (
                <div className="absolute bottom-full mb-2 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Eliminar o intercambiar
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Precio y Provider */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Por {activity.provider}</span>
          </div>
          
          {/* Precio con Blur */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-1 font-bold text-lg" style={{ color: '#052c4e' }}>
                <Euro className="w-4 h-4" />
                {activity.price?.toFixed(2)}
              </div>
            ) : (
              <div className="relative">
                <div 
                  className="blur-sm select-none font-bold text-lg"
                  style={{ color: '#052c4e' }}
                >
                  €{activity.price?.toFixed(2) || '00.00'}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="text-xs px-3 py-1 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: '#3ccca4' }}
                    onClick={() => alert('Redirigir a login/registro')}
                  >
                    Inicia sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
