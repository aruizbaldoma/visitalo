import { X, Plane, Hotel } from "lucide-react";
import { useState, useEffect } from "react";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays, startDate }) => {
  const [hasFlights, setHasFlights] = useState(false);
  
  // Llegada: fecha + hora
  const [arrivalDate, setArrivalDate] = useState(startDate || "");
  const [arrivalTime, setArrivalTime] = useState("00:00");
  
  // Salida: fecha + hora
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("00:00");
  
  const [hasHotel, setHasHotel] = useState(false);
  const [hotelName, setHotelName] = useState("");

  // Actualizar fecha de llegada cuando cambia startDate
  useEffect(() => {
    if (startDate) {
      setArrivalDate(startDate);
    }
  }, [startDate]);

  useEffect(() => {
    if (!hasFlights) {
      setArrivalDate(startDate || "");
      setArrivalTime("00:00");
      setDepartureDate("");
      setDepartureTime("00:00");
    }
    if (hasHotel) {
      // No hacemos nada adicional
    } else {
      setHotelName("");
    }
  }, [hasFlights, hasHotel, startDate]);

  const handleSave = () => {
    const details = {
      hasFlights,
      arrivalTime: hasFlights ? arrivalTime : null,
      departureTime: hasFlights ? departureTime : null,
      hasHotel,
      hotelName: hasHotel ? hotelName : null,
      // Si NO tiene hotel, automáticamente activar recomendación sin mostrarlo
      needsHotelRecommendation: !hasHotel
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

            {/* Toggle Vuelos */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700 font-medium">¿Ya conoces los horarios de tus vuelos?</span>
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

            {/* Bloques de Llegada y Salida */}
            {hasFlights && (
              <div className="space-y-4 pl-9">
                {/* BLOQUE LLEGADA */}
                <div className="p-4 bg-blue-50" style={{ border: '2px solid #3ccca4', borderRadius: '8px' }}>
                  <h5 className="font-bold mb-3" style={{ color: '#052c4e' }}>Llegada</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4] focus:border-transparent"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                      </label>
                      <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4] focus:border-transparent"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* BLOQUE SALIDA */}
                <div className="p-4 bg-orange-50" style={{ border: '2px solid #FF6347', borderRadius: '8px' }}>
                  <h5 className="font-bold mb-3" style={{ color: '#052c4e' }}>Salida</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4] focus:border-transparent"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
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

            {/* Toggle Hotel */}
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

            {/* Input de Hotel (solo si tiene) */}
            {hasHotel && (
              <div className="pl-9">
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
            )}
            
            {/* Nota: Si NO tiene hotel, automáticamente se activa needsHotelRecommendation sin mostrarlo */}
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
