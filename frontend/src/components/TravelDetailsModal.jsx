import { useState } from "react";
import { X, Clock, MapPin, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays }) => {
  const [details, setDetails] = useState({
    arrivalTime: "",
    departureTime: "",
    hotelZones: {},
    needsHotelRecommendation: false
  });

  const handleSave = () => {
    onSave(details);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#052c4e' }}>
              Detalles de mi viaje
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Información opcional para personalizar tu itinerario
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bloque Vuelos */}
          <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" style={{ color: '#3ccca4' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#052c4e' }}>
                Horarios de Vuelo
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrivalTime" className="text-sm font-medium text-gray-700 mb-2">
                  Hora de llegada (Ida)
                </Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={details.arrivalTime}
                  onChange={(e) => setDetails({...details, arrivalTime: e.target.value})}
                  className="border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
                  placeholder="14:30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El primer día comenzará a partir de esta hora
                </p>
              </div>

              <div>
                <Label htmlFor="departureTime" className="text-sm font-medium text-gray-700 mb-2">
                  Hora de salida (Vuelta)
                </Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={details.departureTime}
                  onChange={(e) => setDetails({...details, departureTime: e.target.value})}
                  className="border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
                  placeholder="18:00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El último día terminará antes de esta hora
                </p>
              </div>
            </div>
          </div>

          {/* Bloque Hoteles */}
          <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#3ccca4' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#052c4e' }}>
                Zonas de Alojamiento
              </h3>
            </div>

            {/* Checkbox para recomendación */}
            <div className="mb-4 flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="needsRecommendation"
                checked={details.needsHotelRecommendation}
                onChange={(e) => setDetails({...details, needsHotelRecommendation: e.target.checked})}
                className="mt-1 w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: '#3ccca4' }}
              />
              <div className="flex-1">
                <Label htmlFor="needsRecommendation" className="text-sm font-medium text-gray-700 cursor-pointer">
                  No tengo hotel, recomendarme zona ideal
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Te sugeriremos la mejor ubicación según el itinerario
                </p>
              </div>
            </div>

            {/* Input por días (si no necesita recomendación) */}
            {!details.needsHotelRecommendation && totalDays > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-2">
                  Si ya tienes reserva, indica la zona para optimizar las rutas:
                </p>
                {[...Array(totalDays)].map((_, index) => (
                  <div key={index}>
                    <Label className="text-sm font-medium text-gray-700 mb-1">
                      Día {index + 1}
                    </Label>
                    <Input
                      type="text"
                      placeholder="Ej: Centro histórico, Barrio Gótico..."
                      value={details.hotelZones[`day${index + 1}`] || ""}
                      onChange={(e) => setDetails({
                        ...details,
                        hotelZones: {
                          ...details.hotelZones,
                          [`day${index + 1}`]: e.target.value
                        }
                      })}
                      className="border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="text-white font-semibold"
            style={{ backgroundColor: '#3ccca4' }}
          >
            <Check className="w-4 h-4 mr-2" />
            Guardar Detalles
          </Button>
        </div>
      </div>
    </div>
  );
};
