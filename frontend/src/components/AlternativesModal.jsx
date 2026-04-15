import { X, RefreshCw, Euro, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export const AlternativesModal = ({ activity, isOpen, onClose, onSelectAlternative, isAuthenticated }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 5;

  // Generar alternativas mock
  const generateAlternatives = () => {
    if (attemptCount >= maxAttempts) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newAlternatives = [
        {
          ...activity,
          activityId: `${activity.activityId}_alt_${attemptCount + 1}`,
          title: activity.title + ` - Opción ${attemptCount + 2}`,
          description: `Alternativa similar con diferente proveedor o horario`,
          price: activity.price + (Math.random() * 20 - 10),
          provider: attemptCount % 2 === 0 ? "Viator" : "GetYourGuide"
        },
        {
          ...activity,
          activityId: `${activity.activityId}_alt2_${attemptCount + 1}`,
          title: activity.title.replace(/Tour|Visita/, "Experiencia"),
          description: `Versión premium de la actividad con extras incluidos`,
          price: activity.price + 15,
          provider: "Civitatis"
        }
      ];
      setAlternatives(newAlternatives);
      setAttemptCount(attemptCount + 1);
      setLoading(false);
    }, 800);
  };

  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#052c4e' }}>
              Buscar Alternativa
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Encuentra opciones similares para: <span className="font-semibold">{activity.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Actividad Original */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Actividad Original</h3>
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time} · {activity.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </span>
                  </div>
                </div>
                {isAuthenticated && (
                  <div className="font-bold text-lg" style={{ color: '#052c4e' }}>
                    €{activity.price?.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buscar Nuevas Alternativas */}
          {alternatives.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Busca opciones similares
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Te mostramos hasta {maxAttempts} alternativas para esta actividad
              </p>
              <Button
                onClick={generateAlternatives}
                className="text-white font-semibold"
                style={{ backgroundColor: '#3ccca4' }}
                disabled={attemptCount >= maxAttempts}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Buscar Alternativas
              </Button>
            </div>
          ) : (
            <>
              {/* Lista de Alternativas */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                  Alternativas Encontradas ({alternatives.length})
                </h3>
                <div className="space-y-3">
                  {alternatives.map((alt, index) => (
                    <div
                      key={alt.activityId}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#3ccca4] hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        onSelectAlternative(alt);
                        onClose();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: '#3ccca420', color: '#3ccca4' }}>
                              Opción {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">por {alt.provider}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{alt.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{alt.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alt.time} · {alt.duration}
                            </span>
                          </div>
                        </div>
                        {isAuthenticated ? (
                          <div className="font-bold text-xl" style={{ color: '#052c4e' }}>
                            €{alt.price?.toFixed(2)}
                          </div>
                        ) : (
                          <div className="blur-sm font-bold text-xl" style={{ color: '#052c4e' }}>
                            €{alt.price?.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buscar Más */}
              <div className="mt-6 text-center">
                {attemptCount < maxAttempts ? (
                  <Button
                    onClick={generateAlternatives}
                    variant="outline"
                    className="border-gray-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>Buscando...</>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Buscar Más Alternativas ({maxAttempts - attemptCount} restantes)
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No hay más planes disponibles para ti
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end rounded-b-xl">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
