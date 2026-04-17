import { Euro, Check } from "lucide-react";

export const TotalPricePanel = ({ itinerary, isAuthenticated, onConfirm }) => {
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
      day.morning.activities.length + 
      day.afternoon.activities.length + 
      day.night.activities.length;
  }, 0) || 0;

  if (!itinerary || totalActivities === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 shadow-2xl z-50" style={{ borderTopColor: '#3ccca4' }}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Información del Itinerario */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Total de actividades</p>
              <p className="text-lg font-bold" style={{ color: '#052c4e' }}>
                {totalActivities} {totalActivities === 1 ? 'actividad' : 'actividades'}
              </p>
            </div>
            
            <div className="h-12 w-px bg-gray-300"></div>
            
            <div>
              <p className="text-sm text-gray-500">Precio total estimado</p>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5" style={{ color: '#052c4e' }} />
                  <p className="text-2xl font-bold" style={{ color: '#052c4e' }}>
                    {totalPrice.toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="blur-md select-none text-2xl font-bold" style={{ color: '#052c4e' }}>
                    €{totalPrice.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 ml-2">
                    Inicia sesión para ver precios
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Confirmación */}
          <button
            onClick={onConfirm}
            disabled={!isAuthenticated}
            className={`
              flex items-center gap-3 px-8 py-4 font-bold text-lg transition-all
              ${isAuthenticated 
                ? 'text-white shadow-lg hover:shadow-xl hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            style={isAuthenticated ? { backgroundColor: '#3ccca4', borderRadius: '8px' } : { borderRadius: '8px' }}
          >
            <Check className="w-5 h-5" />
            Confirmar Itinerario
          </button>
        </div>

        {/* Mensaje para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Inicia sesión</span> para ver los precios actualizados y confirmar tu itinerario
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
