import { Clock, MapPin, Sun, Sunset, Moon } from "lucide-react";
import { useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { ActivityInfoModal } from "./ActivityInfoModal";
import { AlternativesModal } from "./AlternativesModal";
import { ItinerarySidebar } from "./ItinerarySidebar";
import { ConfirmationModal } from "./ConfirmationModal";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";

export const ItineraryTimeline = ({ itinerary, isAuthenticated, travelDetails }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itineraryData, setItineraryData] = useState(itinerary);
  const [hotelDeleted, setHotelDeleted] = useState(false);

  // Actualizar cuando cambie el itinerario
  if (itinerary && itinerary !== itineraryData) {
    setItineraryData(itinerary);
  }

  const handleInfo = (activity) => {
    setSelectedActivity(activity);
    setShowInfoModal(true);
  };

  const handleAlternative = (activity) => {
    setSelectedActivity(activity);
    setShowAlternativesModal(true);
  };

  const handleSelectAlternative = (newActivity) => {
    // Reemplazar actividad en el itinerario
    const updatedDays = itineraryData.days.map(day => {
      const updateActivities = (activities) =>
        activities.map(act =>
          act.activityId === selectedActivity.activityId ? newActivity : act
        );

      return {
        ...day,
        morning: { activities: updateActivities(day.morning.activities) },
        afternoon: { activities: updateActivities(day.afternoon.activities) },
        night: { activities: updateActivities(day.night.activities) }
      };
    });

    setItineraryData({ ...itineraryData, days: updatedDays });
  };

  const handleDelete = (activityId) => {
    // Soft-delete: marcar como 'deleted' para poder restaurar
    const updatedDays = itineraryData.days.map(day => {
      const markActivities = (activities) =>
        activities.map(act =>
          act.activityId === activityId ? { ...act, deleted: true } : act
        );

      return {
        ...day,
        morning: { activities: markActivities(day.morning.activities) },
        afternoon: { activities: markActivities(day.afternoon.activities) },
        night: { activities: markActivities(day.night.activities) }
      };
    });

    setItineraryData({ ...itineraryData, days: updatedDays });
  };

  const handleRestore = (activityId) => {
    const updatedDays = itineraryData.days.map(day => {
      const restoreActivities = (activities) =>
        activities.map(act =>
          act.activityId === activityId ? { ...act, deleted: false } : act
        );

      return {
        ...day,
        morning: { activities: restoreActivities(day.morning.activities) },
        afternoon: { activities: restoreActivities(day.afternoon.activities) },
        night: { activities: restoreActivities(day.night.activities) }
      };
    });

    setItineraryData({ ...itineraryData, days: updatedDays });
  };

  const handleConfirm = () => {
    if (!isAuthenticated) {
      alert('Por favor, inicia sesión para confirmar tu itinerario');
      return;
    }
    setShowConfirmationModal(true);
  };

  const handleConfirmPayment = () => {
    // Aquí se integrará la pasarela de pago en el futuro
    alert('🎉 ¡Itinerario confirmado! En el futuro aquí se procesará el pago.');
    setShowConfirmationModal(false);
  };

  // Helper para detectar tipo de actividad
  const getActivityType = (activity) => {
    const title = activity.title?.toLowerCase() || '';
    const provider = activity.provider?.toLowerCase() || '';
    
    // Detectar vuelos
    if (title.includes('llegada') || title.includes('salida') || 
        title.includes('vuelo') || title.includes('aeropuerto') ||
        title.includes('flight') || title.includes('arrival') || title.includes('departure')) {
      return 'flight';
    }
    
    // Detectar hoteles (por ahora solo por provider, pero se puede extender)
    if (provider === 'booking.com' && !title.includes('vuelo') && !title.includes('aeropuerto')) {
      return 'hotel';
    }
    
    // Por defecto es actividad turística
    return 'activity';
  };

  // Calcular precio total
  const calculateTotalPrice = () => {
    if (!itineraryData || !itineraryData.days) return 0;
    
    let total = 0;
    itineraryData.days.forEach(day => {
      day.morning.activities.forEach(activity => {
        if (activity.price) total += activity.price;
      });
      day.afternoon.activities.forEach(activity => {
        if (activity.price) total += activity.price;
      });
      day.night.activities.forEach(activity => {
        if (activity.price) total += activity.price;
      });
    });
    
    return total;
  };
  
  if (!itineraryData) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          Tu itinerario aparecerá aquí
        </h3>
        <p className="text-gray-500">
          Completa el buscador para generar tu plan de viaje personalizado
        </p>
      </div>
    );
  }

  const { destination, totalDays, hotelRecommendation, days } = itineraryData;

  // Normalizar hotel para el timeline: aceptar objeto, texto plano, o null → fallback.
  const hotelForCards = (() => {
    const raw = itineraryData.hotelInfo || hotelRecommendation;
    let base;
    if (raw && typeof raw === "object") {
      base = raw;
    } else if (raw && typeof raw === "string") {
      const firstLine = String(raw).split("\n")[0].trim();
      const match = firstLine.match(/^([^.–\-—()]{4,60})/);
      const name = (match ? match[1] : firstLine).trim() || `Alojamiento en ${destination}`;
      base = { name, zone: destination, website: null };
    } else {
      base = {
        name: `Tu alojamiento en ${destination}`,
        zone: `Centro de ${destination}`,
        website: null,
      };
    }
    return { id: "hotel_main", ...base, deleted: hotelDeleted };
  })();

  const handleHotelDelete = () => setHotelDeleted(true);
  const handleHotelRestore = () => setHotelDeleted(false);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
      {/* Modales */}
      <ActivityInfoModal
        activity={selectedActivity}
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      <AlternativesModal
        activity={selectedActivity}
        isOpen={showAlternativesModal}
        onClose={() => setShowAlternativesModal(false)}
        onSelectAlternative={handleSelectAlternative}
        isAuthenticated={isAuthenticated}
      />

      <ConfirmationModal
        itinerary={itineraryData}
        totalPrice={calculateTotalPrice()}
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirmPayment={handleConfirmPayment}
      />
      
      {/* Header del Itinerario */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#031834' }}>
          {destination}
        </h2>
        <p className="text-xl text-gray-600">
          Itinerario completo · {totalDays} {totalDays === 1 ? 'día' : 'días'}
        </p>
      </div>

      {/* Layout 3/4 + 1/4 en desktop, apilado en móvil/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Itinerario - 3/4 en desktop */}
        <div className="lg:col-span-3 space-y-8">
          {/* Banner de vuelo de llegada (si el usuario lo indicó) */}
          {travelDetails?.transportReady && travelDetails?.arrivalDateTime && (
            <FlightInfoBanner
              type="arrival"
              dateTime={travelDetails.arrivalDateTime}
              destination={destination}
            />
          )}

          {days.map((day, dayIndex) => (
            <DayCard
              key={day.day}
              day={day}
              isLast={dayIndex === days.length - 1}
              isAuthenticated={isAuthenticated}
              onInfo={handleInfo}
              onAlternative={handleAlternative}
              onDelete={handleDelete}
              onRestore={handleRestore}
              destination={destination}
              getActivityType={getActivityType}
              hotelInfo={hotelForCards}
              onHotelDelete={handleHotelDelete}
              onHotelRestore={handleHotelRestore}
              onHotelAlternative={handleAlternative}
            />
          ))}

          {/* Banner de vuelo de salida (si el usuario lo indicó) */}
          {travelDetails?.departureReady && travelDetails?.departureDateTime && (
            <FlightInfoBanner
              type="departure"
              dateTime={travelDetails.departureDateTime}
              destination={destination}
            />
          )}
        </div>

        {/* Sidebar - 1/4 en desktop, debajo en móvil/tablet */}
        <div className="lg:col-span-1">
          <ItinerarySidebar
            itinerary={itineraryData}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
};

const DayCard = ({ day, isLast, isAuthenticated, onInfo, onAlternative, onDelete, onRestore, destination, getActivityType, hotelInfo, onHotelDelete, onHotelRestore, onHotelAlternative }) => {
  return (
    <div className="relative">
      {/* Línea de Conexión Mejorada */}
      {!isLast && (
        <div 
          className="absolute left-8 top-20 bottom-0 w-1 -mb-8"
          style={{ 
            background: 'linear-gradient(180deg, #3ccca4 0%, #2ab88a 50%, #3ccca4 100%)',
            boxShadow: '0 0 10px rgba(60, 204, 164, 0.3)'
          }}
        />
      )}

      <div className="bg-white shadow-lg overflow-hidden relative" style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
        {/* Header del Día */}
        <div className="p-6" style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #E5E7EB' }}>
          <div className="flex items-center gap-4">
            {/* Círculo del día mejorado */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl relative"
              style={{ 
                background: 'linear-gradient(135deg, #3ccca4 0%, #2ab88a 100%)',
                boxShadow: '0 4px 15px rgba(60, 204, 164, 0.4), inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)'
              }}
            >
              <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {day.day}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold" style={{ color: '#031834' }}>
                Día {day.day}
              </h3>
              <p className="text-gray-600">{formatDate(day.date)}</p>
            </div>
          </div>
        </div>

        {/* Momentos del Día */}
        <div className="p-6 space-y-6">
          {/* Mañana */}
          <MomentSection
            icon={<Sun className="w-6 h-6" />}
            title="Mañana"
            activities={day.morning.activities}
            color="#FFA500"
            isAuthenticated={isAuthenticated}
            onInfo={onInfo}
            onAlternative={onAlternative}
            onDelete={onDelete}
            onRestore={onRestore}
            destination={destination}
            getActivityType={getActivityType}
          />

          {/* Tarde */}
          <MomentSection
            icon={<Sunset className="w-6 h-6" />}
            title="Tarde"
            activities={day.afternoon.activities}
            color="#FF6347"
            isAuthenticated={isAuthenticated}
            onInfo={onInfo}
            onAlternative={onAlternative}
            onDelete={onDelete}
            onRestore={onRestore}
            destination={destination}
            getActivityType={getActivityType}
          />

          {/* Noche */}
          <MomentSection
            icon={<Moon className="w-6 h-6" />}
            title="Noche"
            activities={day.night.activities}
            color="#4169E1"
            isAuthenticated={isAuthenticated}
            onInfo={onInfo}
            onAlternative={onAlternative}
            onDelete={onDelete}
            onRestore={onRestore}
            destination={destination}
            getActivityType={getActivityType}
            showHotel={true}
            hotelInfo={hotelInfo}
            onHotelDelete={onHotelDelete}
            onHotelRestore={onHotelRestore}
            onHotelAlternative={onHotelAlternative}
          />
        </div>
      </div>
    </div>
  );
};

const MomentSection = ({ icon, title, activities, color, isAuthenticated, onInfo, onAlternative, onDelete, onRestore, destination, getActivityType, showHotel, hotelInfo, onHotelDelete, onHotelRestore, onHotelAlternative }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm italic">
        No hay actividades planificadas para este momento
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {icon}
        </div>
        <h4 className="text-xl font-bold" style={{ color: '#031834' }}>
          {title}
        </h4>
      </div>

      <div className="space-y-3 ml-2">
        {activities.map((activity, index) => {
          const activityType = getActivityType(activity);
          const isDeleted = !!activity.deleted;

          const renderCard = () => {
            if (activityType === 'flight') {
              return (
                <FlightCard
                  flight={{
                    type: activity.title?.toLowerCase().includes('llegada') || activity.title?.toLowerCase().includes('arrival') ? 'arrival' : 'departure',
                    time: activity.time,
                    details: activity.description
                  }}
                  destination={destination}
                  showButton={false}
                />
              );
            }
            if (activityType === 'hotel') {
              return (
                <HotelCard
                  hotel={{
                    id: activity.activityId,
                    name: activity.title,
                    zone: activity.location,
                    website: activity.website || activity.hotel_url,
                  }}
                  destination={destination}
                  isUserHotel={false}
                  onInfo={onInfo}
                  onAlternative={onAlternative}
                  onDelete={onDelete}
                />
              );
            }
            return (
              <ActivityCard
                activity={activity}
                isAuthenticated={isAuthenticated}
                onInfo={onInfo}
                onAlternative={onAlternative}
                onDelete={onDelete}
              />
            );
          };

          return (
            <div
              key={activity.activityId || index}
              className="relative"
              data-testid={`timeline-item-${activity.activityId || index}`}
            >
              <div
                className={`transition-all duration-300 ${
                  isDeleted ? "opacity-40 grayscale pointer-events-none select-none" : ""
                }`}
              >
                {renderCard()}
              </div>

              {isDeleted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onRestore && onRestore(activity.activityId)}
                    className="pointer-events-auto px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-105"
                    style={{ backgroundColor: "#3ccca4", color: "#031834" }}
                    data-testid={`restore-${activity.activityId}`}
                  >
                    Reactivar actividad
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Mostrar hotel al final de la noche (soft-delete con overlay) */}
        {showHotel && hotelInfo && (
          <div className="relative" data-testid="hotel-block">
            <div
              className={`transition-all duration-300 ${
                hotelInfo.deleted ? "opacity-40 grayscale pointer-events-none select-none" : ""
              }`}
            >
              <HotelCard
                hotel={hotelInfo}
                destination={destination}
                isUserHotel={hotelInfo.isUserHotel || false}
                onInfo={!hotelInfo.isUserHotel ? onInfo : undefined}
                onAlternative={!hotelInfo.isUserHotel ? onHotelAlternative : undefined}
                onDelete={!hotelInfo.isUserHotel ? onHotelDelete : undefined}
              />
            </div>
            {hotelInfo.deleted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onHotelRestore}
                  className="pointer-events-auto px-4 py-2 rounded-full font-bold text-sm shadow-lg transition-all hover:scale-105"
                  style={{ backgroundColor: "#3ccca4", color: "#031834" }}
                  data-testid="restore-hotel"
                >
                  Reactivar alojamiento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Eliminar el componente ActivityCard viejo del final del archivo

const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Banner de vuelo de llegada / salida — se inserta al inicio/final del itinerario
const FlightInfoBanner = ({ type, dateTime, destination }) => {
  if (!dateTime) return null;

  const d = new Date(dateTime);
  if (Number.isNaN(d.getTime())) return null;

  const dateLabel = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isArrival = type === "arrival";
  const title = isArrival ? "Llegada a destino" : "Salida del destino";
  const subtitle = isArrival
    ? `Aterrizas en ${destination || "tu destino"}. Contamos el tiempo de desplazamiento del aeropuerto al centro.`
    : `Sales desde ${destination || "tu destino"}. El último día lo ajustamos sin prisas para que no se te cruce con el viaje.`;

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 shadow-sm"
      style={{ background: "linear-gradient(135deg, #031834 0%, #0a2a4e 100%)" }}
      data-testid={`flight-banner-${type}`}
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: "rgba(60, 204, 164, 0.2)" }}
      >
        <span className="text-2xl">{isArrival ? "🛬" : "🛫"}</span>
      </div>
      <div className="flex-1 min-w-0 text-white">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#3ccca4", letterSpacing: "0.16em" }}
          >
            {isArrival ? "Inicio del viaje" : "Fin del viaje"}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(60, 204, 164, 0.18)", color: "#3ccca4" }}
          >
            {timeLabel}
          </span>
        </div>
        <h4 className="font-bold text-base mt-1">{title}</h4>
        <p className="text-white/70 text-xs capitalize">{dateLabel}</p>
        <p className="text-white/60 text-xs mt-1 leading-snug">{subtitle}</p>
      </div>
    </div>
  );
};
