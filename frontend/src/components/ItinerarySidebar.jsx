import { Euro, Info } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";

export const ItinerarySidebar = ({ itinerary, isAuthenticated }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Recuento y suma excluyendo actividades eliminadas (soft-delete).
  const computeSummary = () => {
    if (!itinerary || !itinerary.days) return { totalPrice: 0, totalActivities: 0 };
    let totalPrice = 0;
    let totalActivities = 0;
    itinerary.days.forEach((day) => {
      ["morning", "afternoon", "night"].forEach((slot) => {
        const acts = (day[slot] && day[slot].activities) || [];
        acts.forEach((a) => {
          if (a.deleted) return;
          if (a.price) {
            totalPrice += a.price;
            totalActivities += 1;
          }
        });
      });
    });
    return { totalPrice, totalActivities };
  };

  const { totalPrice, totalActivities } = computeSummary();

  if (!itinerary) return null;

  return (
    <div className="lg:sticky lg:top-24 self-start">
      <div 
        className="bg-white shadow-lg p-6"
        style={{ border: '2px solid #3ccca4', borderRadius: '12px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >
        {/* Header */}
        <h3 className="text-xl font-bold mb-6" style={{ color: '#031834' }}>
          Resumen del viaje
        </h3>

        {/* Total de actividades */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Total de actividades</p>
          <AnimatedNumber
            value={totalActivities}
            decimals={0}
            className="text-2xl font-bold"
            style={{ color: "#031834" }}
            testId="summary-activities-count"
          />
        </div>

        {/* Separador */}
        <div className="h-px bg-gray-200 my-6"></div>

        {/* Precio total - SIEMPRE visible */}
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

          <div className="flex items-baseline gap-2">
            <Euro className="w-6 h-6" style={{ color: '#3ccca4' }} />
            <AnimatedNumber
              value={totalPrice}
              decimals={2}
              className="text-3xl font-bold"
              style={{ color: "#031834" }}
              testId="summary-total-price"
            />
          </div>
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
