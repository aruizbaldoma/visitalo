import { X, Plane, Hotel } from "lucide-react";
import { useState, useEffect } from "react";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays }) => {
  const [hasFlights, setHasFlights] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [hasHotel, setHasHotel] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [needsHotelRecommendation, setNeedsHotelRecommendation] = useState(false);

  useEffect(() => {
    if (!hasFlights) {
      setArrivalTime("");
      setDepartureTime("");
    }
    if (hasHotel) {
      setNeedsHotelRecommendation(false);
    } else {
      setHotelName("");
    }
  }, [hasFlights, hasHotel]);

  const handleSave = () => {
    const details = {
      hasFlights,
      arrivalTime: hasFlights ? arrivalTime : null,
      departureTime: hasFlights ? departureTime : null,
      hasHotel,
      hotelName: hasHotel ? hotelName : null,
      needsHotelRecommendation: !hasHotel ? needsHotelRecommendation : false
    };
    onSave(details);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: '8px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h3 className="text-2xl font-bold" style={{ color: '#052c4e' }}>
            Contexto del Viaje
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vuelos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6" style={{ color: '#3ccca4' }} />
              <h4 className="text-lg font-bold" style={{ color: '#052c4e' }}>
                Vuelos
              </h4>
            </div>

            {/* Toggle Vuelos Reservados */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 font-medium">¿Ya tienes tus vuelos reservados?</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasFlights}
                  onChange={(e) => setHasFlights(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-14 h-7 rounded-full transition-colors ${
                    hasFlights ? 'bg-[#3ccca4]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      hasFlights ? 'transform translate-x-7' : ''
                    }`}
                  />
                </div>
              </div>
            </label>

            {/* Campos de Vuelos */}
            {hasFlights && (
              <div className="space-y-3 pl-9">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de llegada (Ida)
                  </label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4] focus:border-transparent"
                    style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de salida (Vuelta)
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4] focus:border-transparent"
                    style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hoteles */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Hotel className="w-6 h-6" style={{ color: '#3ccca4' }} />
              <h4 className="text-lg font-bold" style={{ color: '#052c4e' }}>
                Alojamiento
              </h4>
            </div>

            {/* Toggle Hotel Reservado */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 font-medium">¿Ya tienes reserva de hotel?</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasHotel}
                  onChange={(e) => setHasHotel(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-14 h-7 rounded-full transition-colors ${
                    hasHotel ? 'bg-[#3ccca4]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      hasHotel ? 'transform translate-x-7' : ''
                    }`}
                  />
                </div>
              </div>
            </label>

            {/* Opciones según estado */}
            <div className="space-y-4 pl-9">
              {hasHotel ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Hotel (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Hotel Riu Plaza España"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4] focus:border-transparent"
                    style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Si proporcionas el nombre, priorizaremos actividades cerca del hotel
                  </p>
                </div>
              ) : (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsHotelRecommendation}
                    onChange={(e) => setNeedsHotelRecommendation(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded"
                    style={{ accentColor: '#3ccca4' }}
                  />
                  <div>
                    <span className="text-sm text-gray-700 font-medium">
                      Solicitar recomendación de alojamiento a la IA
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      La IA te sugerirá el hotel más estratégico para tu itinerario
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 font-medium text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#3ccca4', borderRadius: '8px' }}
          >
            Guardar Contexto
          </button>
        </div>
      </div>
    </div>
  );
};
