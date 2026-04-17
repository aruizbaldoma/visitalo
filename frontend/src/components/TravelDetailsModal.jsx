import { X, Plane, Hotel, Compass, Crown, Lock } from "lucide-react";
import { useState, useEffect } from "react";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays, startDate, userPlan = 'basic' }) => {
  // Estado de Vuelos
  const [hasFlights, setHasFlights] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(startDate || "");
  const [arrivalTime, setArrivalTime] = useState("00:00");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("00:00");
  
  // Estado de Alojamiento
  const [hasHotel, setHasHotel] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [hotelCategory, setHotelCategory] = useState("standard");
  
  // Estado de Explorar (Solo Plus)
  const [activityPreferences, setActivityPreferences] = useState({
    adventure: false,
    culture: false,
    gastronomy: false,
    relax: false
  });
  const [pace, setPace] = useState("balanced"); // balanced, intense, relaxed

  const isPlusUser = userPlan === 'plus';

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
    if (!hasHotel) {
      setHotelName("");
    }
  }, [hasFlights, hasHotel, startDate]);

  const handleActivityPreferenceToggle = (key) => {
    if (!isPlusUser) return;
    setActivityPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    const details = {
      hasFlights,
      arrivalTime: hasFlights ? arrivalTime : null,
      departureTime: hasFlights ? departureTime : null,
      hasHotel,
      hotelName: hasHotel ? hotelName : null,
      hotelCategory: !hasHotel ? hotelCategory : null,
      needsHotelRecommendation: !hasHotel,
      // Plus preferences
      userPlan,
      preferences: isPlusUser ? {
        activities: activityPreferences,
        pace
      } : null
    };
    onSave(details);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: '8px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold" style={{ color: '#052c4e' }}>
              Personaliza
            </h3>
            {isPlusUser && (
              <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ 
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000'
              }}>
                PLUS
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* BLOQUE 1: VUELOS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e8f7f2' }}>
                <Plane className="w-6 h-6" style={{ color: '#3ccca4' }} />
              </div>
              <h4 className="text-xl font-bold" style={{ color: '#052c4e' }}>
                Vuelos
              </h4>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
              <span className="text-gray-700 font-medium">¿Ya tienes vuelos reservados?</span>
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

            {hasFlights && (
              <div className="space-y-4 pl-4">
                {/* Llegada */}
                <div className="p-4" style={{ backgroundColor: '#e0f2fe', border: '2px solid #3ccca4', borderRadius: '8px' }}>
                  <h5 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#052c4e' }}>
                    <span>✈️ Llegada</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                      <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-3 py-2 focus:ring-2 focus:ring-[#3ccca4]"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                      <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full px-3 py-2 focus:ring-2 focus:ring-[#3ccca4]"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Salida */}
                <div className="p-4" style={{ backgroundColor: '#ffe4e6', border: '2px solid #f87171', borderRadius: '8px' }}>
                  <h5 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#052c4e' }}>
                    <span>🛫 Salida</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full px-3 py-2 focus:ring-2 focus:ring-[#3ccca4]"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '6px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full px-3 py-2 focus:ring-2 focus:ring-[#3ccca4]"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 2: ALOJAMIENTO */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#e8f7f2' }}>
                <Hotel className="w-6 h-6" style={{ color: '#3ccca4' }} />
              </div>
              <h4 className="text-xl font-bold" style={{ color: '#052c4e' }}>
                Alojamiento
              </h4>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
              <span className="text-gray-700 font-medium">¿Ya tienes hotel?</span>
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

            {hasHotel && (
              <div className="pl-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Hotel (opcional)
                </label>
                <input
                  type="text"
                  placeholder="ej: Hotel Riu Plaza España"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-2 focus:ring-2 focus:ring-[#3ccca4]"
                  style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Si proporcionas el nombre, priorizaremos actividades cerca del hotel
                </p>
              </div>
            )}

            {!hasHotel && (
              <div className="pl-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Categoría de Hotel
                </label>
                
                {/* Opción Standard (Basic y Plus) */}
                <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                  <input
                    type="radio"
                    name="hotelCategory"
                    value="standard"
                    checked={hotelCategory === 'standard'}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    className="w-4 h-4 accent-[#3ccca4]"
                  />
                  <span className="text-gray-700">Estándar (3-4 estrellas)</span>
                </label>

                {/* Opciones Plus */}
                <label className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isPlusUser ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`} style={{ border: '1px solid #E5E7EB' }}>
                  <input
                    type="radio"
                    name="hotelCategory"
                    value="boutique"
                    checked={hotelCategory === 'boutique'}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    disabled={!isPlusUser}
                    className="w-4 h-4 accent-[#3ccca4]"
                  />
                  <span className="text-gray-700 flex-1">Boutique</span>
                  {!isPlusUser && (
                    <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}>
                      PLUS
                    </span>
                  )}
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isPlusUser ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`} style={{ border: '1px solid #E5E7EB' }}>
                  <input
                    type="radio"
                    name="hotelCategory"
                    value="luxury"
                    checked={hotelCategory === 'luxury'}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    disabled={!isPlusUser}
                    className="w-4 h-4 accent-[#3ccca4]"
                  />
                  <span className="text-gray-700 flex-1">Lujo 5★</span>
                  {!isPlusUser && (
                    <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}>
                      PLUS
                    </span>
                  )}
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isPlusUser ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`} style={{ border: '1px solid #E5E7EB' }}>
                  <input
                    type="radio"
                    name="hotelCategory"
                    value="hostel"
                    checked={hotelCategory === 'hostel'}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    disabled={!isPlusUser}
                    className="w-4 h-4 accent-[#3ccca4]"
                  />
                  <span className="text-gray-700 flex-1">Hostal con encanto</span>
                  {!isPlusUser && (
                    <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}>
                      PLUS
                    </span>
                  )}
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isPlusUser ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`} style={{ border: '1px solid #E5E7EB' }}>
                  <input
                    type="radio"
                    name="hotelCategory"
                    value="apartment"
                    checked={hotelCategory === 'apartment'}
                    onChange={(e) => setHotelCategory(e.target.value)}
                    disabled={!isPlusUser}
                    className="w-4 h-4 accent-[#3ccca4]"
                  />
                  <span className="text-gray-700 flex-1">Apartamento</span>
                  {!isPlusUser && (
                    <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}>
                      PLUS
                    </span>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 3: EXPLORAR (Solo Plus) */}
          <div className={`space-y-4 ${!isPlusUser ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPlusUser ? '' : 'bg-gray-200'}`} style={isPlusUser ? { backgroundColor: '#e8f7f2' } : {}}>
                <Compass className="w-6 h-6" style={{ color: isPlusUser ? '#3ccca4' : '#9ca3af' }} />
              </div>
              <h4 className="text-xl font-bold flex items-center gap-2" style={{ color: isPlusUser ? '#052c4e' : '#9ca3af' }}>
                Explorar
                {isPlusUser && (
                  <span className="px-2 py-1 text-xs font-bold rounded-full" style={{ 
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#000'
                  }}>
                    PLUS
                  </span>
                )}
              </h4>
            </div>

            {!isPlusUser ? (
              <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#f9fafb', border: '2px dashed #d1d5db' }}>
                <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-700 font-semibold mb-2">Mejora a PLUS para personalizar tus actividades</p>
                <p className="text-sm text-gray-500 mb-4">
                  Obtén PLUS con tu primer viaje, invitando a un amigo, o por solo 1€/mes
                </p>
                <button
                  className="px-6 py-2 font-bold text-white rounded-lg hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                  onClick={() => alert('🚀 Próximamente: Sistema de suscripción PLUS')}
                >
                  Desbloquear PLUS
                </button>
              </div>
            ) : (
              <div className="space-y-6 pl-4">
                {/* Actividades */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tipo de Actividades (marca las que te interesan)
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="checkbox"
                      checked={activityPreferences.adventure}
                      onChange={() => handleActivityPreferenceToggle('adventure')}
                      className="w-5 h-5 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">🏔️ Aventura (Rafting, Buceo, Kayak, Escalada)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="checkbox"
                      checked={activityPreferences.culture}
                      onChange={() => handleActivityPreferenceToggle('culture')}
                      className="w-5 h-5 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">🏛️ Cultura (Museos, Historia, Arte, Monumentos)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="checkbox"
                      checked={activityPreferences.gastronomy}
                      onChange={() => handleActivityPreferenceToggle('gastronomy')}
                      className="w-5 h-5 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">🍷 Gastronomía (Catas, Tours Culinarios, Restaurantes Michelin)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="checkbox"
                      checked={activityPreferences.relax}
                      onChange={() => handleActivityPreferenceToggle('relax')}
                      className="w-5 h-5 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">🧘 Relax (Spa, Playas, Wellness, Yoga)</span>
                  </label>
                </div>

                {/* Ritmo */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Ritmo del Viaje
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="radio"
                      name="pace"
                      value="intense"
                      checked={pace === 'intense'}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">⚡ Intenso (Ver todo, actividades encadenadas)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="radio"
                      name="pace"
                      value="balanced"
                      checked={pace === 'balanced'}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">⚖️ Equilibrado (Mezcla de actividades y descanso)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="radio"
                      name="pace"
                      value="relaxed"
                      checked={pace === 'relaxed'}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">🌴 Relajado (Pocas prisas, 2-3h entre actividades)</span>
                  </label>
                </div>
              </div>
            )}
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
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
