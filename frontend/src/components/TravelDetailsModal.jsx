import { X, Plane, Hotel, Sparkles, Lock } from "lucide-react";
import { useState, useEffect } from "react";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays, startDate, endDate, userPlan = 'basic' }) => {
  // Estado de Vuelos
  const [hasFlights, setHasFlights] = useState(false);
  const [arrivalTime, setArrivalTime] = useState("09:00");
  const [departureTime, setDepartureTime] = useState("18:00");
  
  // Estado de Alojamiento
  const [hasHotel, setHasHotel] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [hotelCategory, setHotelCategory] = useState("standard");
  
  // Estado de "Hazlo a tu gusto" (Solo Plus)
  const [activityPreferences, setActivityPreferences] = useState({
    adventure: false,
    culture: false,
    gastronomy: false,
    relax: false
  });
  const [pace, setPace] = useState("balanced"); // balanced, intense, relaxed

  const isPlusUser = userPlan === 'plus';

  // Formatear fechas heredadas del buscador
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
  };

  // Resetear estados cuando se abra/cierre el modal
  useEffect(() => {
    if (!hasFlights) {
      setArrivalTime("09:00");
      setDepartureTime("18:00");
    }
    if (!hasHotel) {
      setHotelName("");
    }
  }, [hasFlights, hasHotel]);

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
      <div className="bg-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: '8px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
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

        {/* Content - Mayor padding entre bloques */}
        <div className="px-8 py-8 space-y-10">
          
          {/* BLOQUE 1: VUELOS - Rediseñado */}
          <div className="space-y-5">
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
              <div className="space-y-6 pl-4">
                {/* Llegada - Diseño Timeline minimalista */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✈️</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">¿Cuándo aterrizas?</p>
                      {startDate && (
                        <p className="text-xs text-gray-500 capitalize">{formatDate(startDate)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pl-10">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora de llegada</label>
                    <input
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                      style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}
                    />
                  </div>
                </div>

                {/* Línea de tiempo visual */}
                <div className="pl-6 border-l-2 border-dashed border-gray-300 h-8"></div>

                {/* Salida - Diseño Timeline minimalista */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛫</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">¿Cuándo despega tu vuelo de vuelta?</p>
                      {endDate && (
                        <p className="text-xs text-gray-500 capitalize">{formatDate(endDate)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pl-10">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hora de salida</label>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                      style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider con más espacio */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 2: ALOJAMIENTO - Simplificado */}
          <div className="space-y-5">
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
                  Nombre del Hotel <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="ej: Hotel Riu Plaza España"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full px-4 py-3 focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                  style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                />
              </div>
            )}

            {!hasHotel && (
              <div className="pl-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categoría de Hotel
                </label>
                
                {/* Opción Standard (Basic y Plus) */}
                <label className="flex items-center justify-between gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="hotelCategory"
                      value="standard"
                      checked={hotelCategory === 'standard'}
                      onChange={(e) => setHotelCategory(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700">Estándar (3-4 estrellas)</span>
                  </div>
                </label>

                {/* Opciones Plus - Más sutiles */}
                {['boutique', 'luxury', 'hostel', 'apartment'].map((category) => {
                  const labels = {
                    boutique: 'Boutique',
                    luxury: 'Lujo 5★',
                    hostel: 'Hostal con encanto',
                    apartment: 'Apartamento'
                  };
                  
                  return (
                    <label 
                      key={category}
                      className={`flex items-center justify-between gap-3 p-4 rounded-lg transition-colors ${isPlusUser ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-50'}`} 
                      style={{ border: '1px solid #E5E7EB' }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="hotelCategory"
                          value={category}
                          checked={hotelCategory === category}
                          onChange={(e) => setHotelCategory(e.target.value)}
                          disabled={!isPlusUser}
                          className="w-4 h-4 accent-[#3ccca4]"
                        />
                        <span className="text-gray-700">{labels[category]}</span>
                      </div>
                      {!isPlusUser && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}>
                          PLUS
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider con más espacio */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 3: HAZLO A TU GUSTO (El Factor WOW) */}
          <div className={`space-y-5 ${!isPlusUser ? 'relative' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPlusUser ? '' : 'bg-gray-200'}`} style={isPlusUser ? { backgroundColor: '#e8f7f2' } : {}}>
                <Sparkles className="w-6 h-6" style={{ color: isPlusUser ? '#3ccca4' : '#9ca3af' }} />
              </div>
              <h4 className="text-xl font-bold flex items-center gap-2" style={{ color: isPlusUser ? '#052c4e' : '#9ca3af' }}>
                Hazlo a tu gusto
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
              // Overlay elegante para usuarios Basic
              <div className="relative p-8 rounded-xl" style={{ border: '2px dashed #d1d5db', backgroundColor: '#f9fafb' }}>
                <div className="text-center space-y-4">
                  <Lock className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-base font-semibold text-gray-700">
                    Personaliza tus hobbies e intereses para un itinerario único
                  </p>
                  <p className="text-sm text-gray-500">
                    Obtén PLUS con tu primer viaje, invitando a un amigo, o por solo 1€/mes
                  </p>
                  <button
                    className="px-8 py-3 font-bold text-black rounded-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}
                    onClick={() => alert('🚀 Próximamente: Sistema de suscripción PLUS')}
                  >
                    Desbloquear PLUS
                  </button>
                </div>
              </div>
            ) : (
              // Contenido Plus - Rejilla de 2 columnas
              <div className="space-y-6 pl-4">
                <p className="text-sm text-gray-600 italic">
                  Personaliza tus hobbies e intereses para un itinerario único
                </p>
                
                {/* Actividades - Grid 2 columnas */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tipo de Actividades
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                      <input
                        type="checkbox"
                        checked={activityPreferences.adventure}
                        onChange={() => handleActivityPreferenceToggle('adventure')}
                        className="w-5 h-5 accent-[#3ccca4]"
                      />
                      <span className="text-gray-700 text-sm">🏔️ Aventura</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                      <input
                        type="checkbox"
                        checked={activityPreferences.culture}
                        onChange={() => handleActivityPreferenceToggle('culture')}
                        className="w-5 h-5 accent-[#3ccca4]"
                      />
                      <span className="text-gray-700 text-sm">🏛️ Cultura</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                      <input
                        type="checkbox"
                        checked={activityPreferences.gastronomy}
                        onChange={() => handleActivityPreferenceToggle('gastronomy')}
                        className="w-5 h-5 accent-[#3ccca4]"
                      />
                      <span className="text-gray-700 text-sm">🍷 Gastronomía</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                      <input
                        type="checkbox"
                        checked={activityPreferences.relax}
                        onChange={() => handleActivityPreferenceToggle('relax')}
                        className="w-5 h-5 accent-[#3ccca4]"
                      />
                      <span className="text-gray-700 text-sm">🧘 Relax</span>
                    </label>
                  </div>
                </div>

                {/* Ritmo - Lista vertical */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ritmo del Viaje
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="radio"
                      name="pace"
                      value="intense"
                      checked={pace === 'intense'}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700 text-sm">⚡ Intenso (Ver todo)</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="radio"
                      name="pace"
                      value="balanced"
                      checked={pace === 'balanced'}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700 text-sm">⚖️ Equilibrado</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <input
                      type="radio"
                      name="pace"
                      value="relaxed"
                      checked={pace === 'relaxed'}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-4 h-4 accent-[#3ccca4]"
                    />
                    <span className="text-gray-700 text-sm">🌴 Relajado (Sin prisas)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Botones alineados a la derecha */}
        <div className="sticky bottom-0 bg-white px-8 py-5 flex justify-end gap-3" style={{ borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 font-semibold text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: '#3ccca4', borderRadius: '8px' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
