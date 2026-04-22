import { X, MapPin, Clock, CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "./ui/button";

export const ActivityInfoModal = ({ activity, isOpen, onClose }) => {
  if (!isOpen || !activity) return null;

  // Mock de información detallada
  const detailedInfo = {
    fullDescription: activity.description + ". Esta es una experiencia completa que incluye todo lo necesario para disfrutar al máximo de tu visita.",
    highlights: [
      "Guía experto en español",
      "Grupo reducido (máximo 15 personas)",
      "Auriculares incluidos",
      "Acceso prioritario sin colas"
    ],
    includes: [
      "Entradas a todos los puntos del tour",
      "Guía profesional certificado",
      "Seguro de responsabilidad civil"
    ],
    notIncludes: [
      "Comidas y bebidas",
      "Transporte hasta punto de encuentro",
      "Propinas (opcionales)"
    ],
    meetingPoint: activity.location || "Por confirmar",
    cancellation: "Cancelación gratuita hasta 24 horas antes"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#031834] to-[#064a7a] text-white p-6 flex items-start justify-between rounded-t-xl">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold mb-2">
              {activity.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-200">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {activity.time} · {activity.duration}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {activity.location}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#031834' }}>
              Descripción Completa
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {detailedInfo.fullDescription}
            </p>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#031834' }}>
              <Info className="w-5 h-5" style={{ color: '#3ccca4' }} />
              Puntos Destacados
            </h3>
            <ul className="space-y-2">
              {detailedInfo.highlights.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#3ccca4' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Incluye / No Incluye */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#031834' }}>
                ✓ Incluye
              </h3>
              <ul className="space-y-2">
                {detailedInfo.includes.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3" style={{ color: '#031834' }}>
                ✗ No Incluye
              </h3>
              <ul className="space-y-2">
                {detailedInfo.notIncludes.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Punto de Encuentro */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold mb-2" style={{ color: '#031834' }}>
              Punto de Encuentro
            </h3>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#3ccca4' }} />
              {detailedInfo.meetingPoint}
            </div>
          </div>

          {/* Política de Cancelación */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800">
              {detailedInfo.cancellation}
            </p>
          </div>

          {/* Provider */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            Actividad proporcionada por <span className="font-semibold">{activity.provider}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end rounded-b-xl">
          <Button
            onClick={onClose}
            className="text-white font-semibold px-6"
            style={{ backgroundColor: '#031834' }}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
