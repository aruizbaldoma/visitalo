import { X, Plane, Hotel, Sparkles, Plus, Trash2, Crown } from "lucide-react";
import { useState, useEffect } from "react";

export const TravelDetailsModal = ({ isOpen, onClose, onSave, totalDays, startDate, endDate, userPlan = 'basic' }) => {
  // Estado de Vuelos
  const [hasFlights, setHasFlights] = useState(false);
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("09:00");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("18:00");
  
  // Estado de Alojamiento - ARRAY para múltiples hoteles
  const [hasHotel, setHasHotel] = useState(false);
  const [hotels, setHotels] = useState([{ name: "", checkIn: "", checkOut: "" }]);
  const [hotelCategory, setHotelCategory] = useState("standard");
  
  // Estado de "Hazlo a tu gusto" (Solo Plus)
  const [activityPreferences, setActivityPreferences] = useState({
    adventure: false,
    culture: false,
    gastronomy: false,
    relax: false
  });
  const [pace, setPace] = useState("balanced");

  const isPlusUser = userPlan === 'plus';

  // Sincronizar fechas del buscador cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (startDate) setArrivalDate(startDate);
      if (endDate) setDepartureDate(endDate);
    }
  }, [isOpen, startDate, endDate]);

  // Resetear estados cuando cambia hasFlights o hasHotel
  useEffect(() => {
    if (!hasFlights) {
      setArrivalTime("09:00");
      setDepartureTime("18:00");
    }
    if (!hasHotel) {
      setHotels([{ name: "", checkIn: "", checkOut: "" }]);
    }
  }, [hasFlights, hasHotel]);

  const handleActivityPreferenceToggle = (key) => {
    if (!isPlusUser) return;
    setActivityPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Funciones para múltiples hoteles
  const handleAddHotel = () => {
    if (!isPlusUser) return;
    setHotels([...hotels, { name: "", checkIn: "", checkOut: "" }]);
  };

  const handleRemoveHotel = (index) => {
    if (hotels.length > 1) {
      setHotels(hotels.filter((_, i) => i !== index));
    }
  };

  const handleHotelChange = (index, field, value) => {
    const newHotels = [...hotels];
    newHotels[index][field] = value;
    setHotels(newHotels);
  };

  const handleSave = () => {
    const details = {
      hasFlights,
      arrivalDate: hasFlights ? arrivalDate : null,
      arrivalTime: hasFlights ? arrivalTime : null,
      departureDate: hasFlights ? departureDate : null,
      departureTime: hasFlights ? departureTime : null,
      hasHotel,
      hotels: hasHotel ? hotels : null,
      hotelCategory: !hasHotel ? hotelCategory : null,
      needsHotelRecommendation: !hasHotel,
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
      <div className="bg-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold" style={{ color: '#031834' }}>
              Personaliza tu viaje
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
        <div className="px-8 py-6 space-y-8">
          
          {/* BLOQUE 1: VUELOS - Estilo Profesional Mejorado */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#e8f7f2' }}>
                <Plane className="w-5 h-5" style={{ color: '#3ccca4' }} />
              </div>
              <h4 className="text-lg font-bold" style={{ color: '#031834' }}>
                Vuelos
              </h4>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
              <span className="text-gray-700 font-medium text-sm">¿Ya tienes vuelos reservados?</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasFlights}
                  onChange={(e) => setHasFlights(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${hasFlights ? 'bg-[#3ccca4]' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${hasFlights ? 'transform translate-x-6' : ''}`} />
                </div>
              </div>
            </label>

            {hasFlights && (
              <div className="space-y-4 mt-4">
                {/* Llegada */}
                <div className="p-5 rounded-xl" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">✈️</span>
                    <p className="text-sm font-bold text-gray-800">Llegada</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">¿Cuándo vas?</label>
                      <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Hora</label>
                      <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Salida */}
                <div className="p-5 rounded-xl" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🛫</span>
                    <p className="text-sm font-bold text-gray-800">Salida</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">¿Cuándo vuelves?</label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        min={arrivalDate}
                        className="w-full px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Hora</label>
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 2: ALOJAMIENTO - Con múltiples hoteles */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#e8f7f2' }}>
                <Hotel className="w-5 h-5" style={{ color: '#3ccca4' }} />
              </div>
              <h4 className="text-lg font-bold" style={{ color: '#031834' }}>
                Alojamiento
              </h4>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
              <span className="text-gray-700 font-medium text-sm">¿Ya tienes hotel?</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={hasHotel}
                  onChange={(e) => setHasHotel(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${hasHotel ? 'bg-[#3ccca4]' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${hasHotel ? 'transform translate-x-6' : ''}`} />
                </div>
              </div>
            </label>

            {hasHotel && (
              <div className="space-y-3">
                {hotels.map((hotel, index) => (
                  <div key={index} className="p-4 rounded-lg" style={{ border: '1px solid #E5E7EB', backgroundColor: '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-600">Hotel {index + 1}</span>
                      {hotels.length > 1 && (
                        <button
                          onClick={() => handleRemoveHotel(index)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar hotel"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nombre del hotel (opcional)"
                        value={hotel.name}
                        onChange={(e) => handleHotelChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                        style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
                          <input
                            type="date"
                            value={hotel.checkIn}
                            onChange={(e) => handleHotelChange(index, 'checkIn', e.target.value)}
                            className="w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                            style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
                          <input
                            type="date"
                            value={hotel.checkOut}
                            onChange={(e) => handleHotelChange(index, 'checkOut', e.target.value)}
                            min={hotel.checkIn}
                            className="w-full px-3 py-2 text-sm focus:ring-2 focus:ring-[#3ccca4] focus:outline-none"
                            style={{ border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Botón Añadir Hotel */}
                <div className="relative group">
                  <button
                    onClick={handleAddHotel}
                    disabled={!isPlusUser}
                    className={`w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      isPlusUser 
                        ? 'border-2 border-dashed border-[#3ccca4] text-[#3ccca4] hover:bg-[#e8f7f2] cursor-pointer' 
                        : 'border-2 border-dashed border-gray-300 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Añadir otro hotel</span>
                    {!isPlusUser && (
                      <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' }}>
                        PLUS
                      </span>
                    )}
                  </button>
                  {!isPlusUser && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Función exclusiva de Plan PLUS
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!hasHotel && (
              <div className="space-y-2 mt-3">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Categoría de Hotel
                </label>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="hotelCategory"
                        value="standard"
                        checked={hotelCategory === 'standard'}
                        onChange={(e) => setHotelCategory(e.target.value)}
                        className="w-4 h-4 accent-[#3ccca4]"
                      />
                      <span className="text-sm text-gray-700">Estándar (3-4 estrellas)</span>
                    </div>
                  </label>

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
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${isPlusUser ? 'cursor-pointer hover:bg-gray-50' : 'opacity-50 cursor-not-allowed bg-gray-50'}`} 
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
                          <span className="text-sm text-gray-700">{labels[category]}</span>
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
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E5E7EB' }} />

          {/* BLOQUE 3: HAZLO A TU GUSTO - Rediseño Compacto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isPlusUser ? '' : 'bg-gray-100'}`} style={isPlusUser ? { backgroundColor: '#e8f7f2' } : {}}>
                  <Sparkles className="w-5 h-5" style={{ color: isPlusUser ? '#3ccca4' : '#9ca3af' }} />
                </div>
                <div>
                  <h4 className="text-lg font-bold" style={{ color: isPlusUser ? '#031834' : '#6b7280' }}>
                    Hazlo a tu gusto
                  </h4>
                  <p className="text-xs text-gray-500">Actividades y ritmo personalizados</p>
                </div>
              </div>
              {isPlusUser && (
                <span className="px-2 py-1 text-[10px] font-bold rounded-full" style={{ 
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000'
                }}>
                  PLUS
                </span>
              )}
            </div>

            {!isPlusUser ? (
              // Banner Compacto para Basic
              <div className="p-4 rounded-xl flex items-center justify-between gap-4" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde047' }}>
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#fef3c7' }}>
                    <Crown className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Personalización Completa</p>
                    <p className="text-xs text-gray-600">Primer viaje gratis • Solo 1€/mes</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 font-bold text-sm text-white rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
                  style={{ backgroundColor: '#3ccca4' }}
                  onClick={() => alert('🚀 Próximamente: Activar Plan PLUS')}
                >
                  Activar PLUS
                </button>
              </div>
            ) : (
              // Contenido Plus Compacto
              <div className="space-y-5">
                {/* Actividades */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600">
                    Tipo de Actividades
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'adventure', emoji: '🏔️', label: 'Aventura' },
                      { key: 'culture', emoji: '🏛️', label: 'Cultura' },
                      { key: 'gastronomy', emoji: '🍷', label: 'Gastronomía' },
                      { key: 'relax', emoji: '🧘', label: 'Relax' }
                    ].map(({ key, emoji, label }) => (
                      <label 
                        key={key}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          activityPreferences[key] 
                            ? 'bg-[#e8f7f2] border-2 border-[#3ccca4]' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={activityPreferences[key]}
                            onChange={() => handleActivityPreferenceToggle(key)}
                            className="w-4 h-4 accent-[#3ccca4]"
                          />
                          <span className="text-base">{emoji}</span>
                          <span className="text-xs font-semibold text-gray-700">{label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ritmo */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600">
                    Ritmo del Viaje
                  </label>
                  
                  <div className="space-y-2">
                    {[
                      { value: 'intense', emoji: '⚡', label: 'Intenso' },
                      { value: 'balanced', emoji: '⚖️', label: 'Equilibrado' },
                      { value: 'relaxed', emoji: '🌴', label: 'Relajado' }
                    ].map(({ value, emoji, label }) => (
                      <label 
                        key={value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          pace === value 
                            ? 'bg-[#e8f7f2] border-2 border-[#3ccca4]' 
                            : 'bg-white hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pace"
                          value={value}
                          checked={pace === value}
                          onChange={(e) => setPace(e.target.value)}
                          className="w-4 h-4 accent-[#3ccca4]"
                        />
                        <span className="text-base">{emoji}</span>
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-8 py-4 flex justify-end gap-3" style={{ borderTop: '1px solid #E5E7EB' }}>
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
