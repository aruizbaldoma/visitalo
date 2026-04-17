import { X, Plane, Hotel, Sparkles, Lock, Check } from "lucide-react";
import { useState, useEffect } from "react";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays, startDate, endDate, userPlan = 'basic' }) => {
  // Estado de Vuelos
  const [hasFlights, setHasFlights] = useState(false);
  const [arrivalDate, setArrivalDate] = useState(startDate || "");
  const [arrivalTime, setArrivalTime] = useState("09:00");
  const [departureDate, setDepartureDate] = useState(endDate || "");
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

  // Sincronizar fechas del buscador cuando cambian
  useEffect(() => {
    if (startDate) setArrivalDate(startDate);
    if (endDate) setDepartureDate(endDate);
  }, [startDate, endDate]);

  // Resetear estados cuando se abra/cierre el modal
  useEffect(() => {
    if (!hasFlights) {
      setArrivalDate(startDate || "");
      setArrivalTime("09:00");
      setDepartureDate(endDate || "");
      setDepartureTime("18:00");
    }
    if (!hasHotel) {
      setHotelName("");
    }
  }, [hasFlights, hasHotel, startDate, endDate]);

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
      arrivalDate: hasFlights ? arrivalDate : null,
      arrivalTime: hasFlights ? arrivalTime : null,
      departureDate: hasFlights ? departureDate : null,
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
          
          {/* BLOQUE 1: VUELOS - Con Fechas y Horas */}
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
                {/* Llegada */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✈️</span>
                    <p className="text-sm font-semibold text-gray-700">¿Cuándo aterrizas?</p>
                  </div>
                  
                  <div className="pl-10 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de llegada</label>
                      <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-4 py-3 text-base focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}
                      />
                    </div>
                    <div>
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
                  {arrivalDate && (
                    <p className="text-xs text-gray-500 pl-10 italic capitalize">{formatDate(arrivalDate)}</p>
                  )}
                </div>

                {/* Línea de tiempo visual */}
                <div className="pl-6 border-l-2 border-dashed border-gray-300 h-8"></div>

                {/* Salida */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛫</span>
                    <p className="text-sm font-semibold text-gray-700">¿Cuándo despega tu vuelo de vuelta?</p>
                  </div>
                  
                  <div className="pl-10 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de salida</label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        min={arrivalDate}
                        className="w-full px-4 py-3 text-base focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}
                      />
                    </div>
                    <div>
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
                  {departureDate && (
                    <p className="text-xs text-gray-500 pl-10 italic capitalize">{formatDate(departureDate)}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider con más espacio */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 2: ALOJAMIENTO */}
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

                {/* Opciones Plus */}
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

          {/* BLOQUE 3: HAZLO A TU GUSTO - REDISEÑADO PROFESIONAL */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isPlusUser ? '' : 'bg-gray-100'}`} style={isPlusUser ? { backgroundColor: '#e8f7f2' } : {}}>
                  <Sparkles className="w-6 h-6" style={{ color: isPlusUser ? '#3ccca4' : '#9ca3af' }} />
                </div>
                <div>
                  <h4 className="text-xl font-bold" style={{ color: isPlusUser ? '#052c4e' : '#6b7280' }}>
                    Hazlo a tu gusto
                  </h4>
                  <p className="text-sm text-gray-500">Personaliza actividades y ritmo del viaje</p>
                </div>
              </div>
              {isPlusUser && (
                <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ 
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000'
                }}>
                  PLUS
                </span>
              )}
            </div>

            {!isPlusUser ? (
              // VERSIÓN BASIC - Diseño Premium Bloqueado
              <div className="relative overflow-hidden rounded-xl" style={{ border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
                {/* Contenido simulado borroso */}
                <div className="p-6 space-y-6 filter blur-sm pointer-events-none">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-gray-300"></div>
                        <span className="text-sm text-gray-600">🏔️ Aventura</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-gray-300"></div>
                        <span className="text-sm text-gray-600">🏛️ Cultura</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-gray-300"></div>
                        <span className="text-sm text-gray-600">🍷 Gastronomía</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-gray-300"></div>
                        <span className="text-sm text-gray-600">🧘 Relax</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlay Central */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
                  <div className="text-center px-6 py-8 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                      <Lock className="w-8 h-8" style={{ color: '#F59E0B' }} />
                    </div>
                    <h5 className="text-lg font-bold mb-2" style={{ color: '#052c4e' }}>
                      Desbloquea la Personalización Completa
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Elige tus actividades favoritas y ajusta el ritmo del viaje según tus preferencias
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Check className="w-4 h-4 text-[#3ccca4]" />
                        <span>Primer viaje gratis</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Check className="w-4 h-4 text-[#3ccca4]" />
                        <span>Solo 1€/mes</span>
                      </div>
                    </div>
                    <button
                      className="w-full px-6 py-3 font-bold text-white rounded-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: '#3ccca4' }}
                      onClick={() => alert('🚀 Próximamente: Activar Plan PLUS')}
                    >
                      Activar Plan PLUS
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // VERSIÓN PLUS - Contenido Desbloqueado Profesional
              <div className="space-y-6 pl-4">
                {/* Tipo de Actividades */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tipo de Actividades
                  </label>
                  <p className="text-xs text-gray-500 mb-3">Selecciona tus intereses y adaptaremos el itinerario</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'adventure', emoji: '🏔️', label: 'Aventura', desc: 'Rafting, Buceo, Kayak' },
                      { key: 'culture', emoji: '🏛️', label: 'Cultura', desc: 'Museos, Historia, Arte' },
                      { key: 'gastronomy', emoji: '🍷', label: 'Gastronomía', desc: 'Catas, Tours Culinarios' },
                      { key: 'relax', emoji: '🧘', label: 'Relax', desc: 'Spa, Playas, Wellness' }
                    ].map(({ key, emoji, label, desc }) => (
                      <label 
                        key={key}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          activityPreferences[key] 
                            ? 'bg-[#e8f7f2] border-2 border-[#3ccca4] shadow-sm' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={activityPreferences[key]}
                            onChange={() => handleActivityPreferenceToggle(key)}
                            className="mt-1 w-5 h-5 accent-[#3ccca4]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{emoji}</span>
                              <span className="text-sm font-semibold text-gray-800">{label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ritmo del Viaje */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ritmo del Viaje
                  </label>
                  <p className="text-xs text-gray-500 mb-3">¿Cómo prefieres disfrutar tu viaje?</p>
                  
                  <div className="space-y-2">
                    {[
                      { value: 'intense', emoji: '⚡', label: 'Intenso', desc: 'Ver todo, actividades encadenadas' },
                      { value: 'balanced', emoji: '⚖️', label: 'Equilibrado', desc: 'Mezcla de actividades y descanso' },
                      { value: 'relaxed', emoji: '🌴', label: 'Relajado', desc: 'Sin prisas, tiempo para disfrutar' }
                    ].map(({ value, emoji, label, desc }) => (
                      <label 
                        key={value}
                        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                          pace === value 
                            ? 'bg-[#e8f7f2] border-2 border-[#3ccca4] shadow-sm' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pace"
                          value={value}
                          checked={pace === value}
                          onChange={(e) => setPace(e.target.value)}
                          className="w-5 h-5 accent-[#3ccca4]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{emoji}</span>
                            <span className="text-sm font-semibold text-gray-800">{label}</span>
                          </div>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
