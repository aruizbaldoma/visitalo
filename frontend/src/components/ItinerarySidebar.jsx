import { Euro, Info } from "lucide-react";
import { useState } from "react";

export const ItinerarySidebar = ({ itinerary, isAuthenticated }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calcular precio total de todas las actividades
  const calculateTotalPrice = () => {
    if (!itinerary || !itinerary.days) return 0;
    
    let total = 0;
    itinerary.days.forEach(day => {
      // Sumar actividades de mañana
      day.morning.activities.forEach(activity => {
        if (activity.price) total += activity.price;
      });
      // Sumar actividades de tarde
      day.afternoon.activities.forEach(activity => {
        if (activity.price) total += activity.price;
      });
      // Sumar actividades de noche
      day.night.activities.forEach(activity => {
        if (activity.price) total += activity.price;
      });
    });
    
    return total;
  };

  const totalPrice = calculateTotalPrice();
  const totalActivities = itinerary?.days?.reduce((acc, day) => {
    return acc + 
      day.morning.activities.filter(a => a.price).length + 
      day.afternoon.activities.filter(a => a.price).length + 
      day.night.activities.filter(a => a.price).length;
  }, 0) || 0;

  if (!itinerary || totalActivities === 0) return null;

  return (
    <div className="sticky top-24 h-fit">
      <div 
        className="bg-white shadow-lg p-6"
        style={{ border: '2px solid #3ccca4', borderRadius: '12px' }}
      >
        {/* Header */}
        <h3 className="text-xl font-bold mb-6" style={{ color: '#052c4e' }}>
          Resumen del viaje
        </h3>

        {/* Total de actividades */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Total de actividades</p>
          <p className="text-2xl font-bold" style={{ color: '#052c4e' }}>
            {totalActivities}
          </p>
        </div>

        {/* Separador */}
        <div className="h-px bg-gray-200 my-6"></div>

        {/* Precio total */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-gray-500">Precio total estimado</p>
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              
              {/* Tooltip */}
              {showTooltip && (
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-2 px-3 z-50"
                  style={{ whiteSpace: 'normal' }}
                >
                  Estos precios pueden variar ligeramente en las webs
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #1f2937'
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-baseline gap-2">
              <Euro className="w-6 h-6" style={{ color: '#3ccca4' }} />
              <p className="text-3xl font-bold" style={{ color: '#052c4e' }}>
                {totalPrice.toFixed(2)}
              </p>
            </div>
          ) : (
            <div>
              <div className="blur-md select-none text-3xl font-bold mb-2" style={{ color: '#052c4e' }}>
                €{totalPrice.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">
                Inicia sesión para ver precios
              </p>
            </div>
          )}
        </div>

        {/* Nota adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            Los precios mostrados son estimados. Confirma los precios finales en las webs de reserva.
          </p>
        </div>
      </div>
    </div>
  );
};
