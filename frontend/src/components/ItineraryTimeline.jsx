import { Clock, MapPin, Sun, Sunset, Moon } from "lucide-react";
import { useState } from "react";
import { ActivityCard } from "./ActivityCard";
import { ActivityInfoModal } from "./ActivityInfoModal";
import { AlternativesModal } from "./AlternativesModal";
import { TotalPricePanel } from "./TotalPricePanel";
import { ConfirmationModal } from "./ConfirmationModal";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";

export const ItineraryTimeline = ({ itinerary, isAuthenticated }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [itineraryData, setItineraryData] = useState(itinerary);

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
    // Eliminar actividad del itinerario
    const updatedDays = itineraryData.days.map(day => {
      const filterActivities = (activities) =>
        activities.filter(act => act.activityId !== activityId);

      return {
        ...day,
        morning: { activities: filterActivities(day.morning.activities) },
        afternoon: { activities: filterActivities(day.afternoon.activities) },
        night: { activities: filterActivities(day.night.activities) }
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

  return (
    <div className="max-w-6xl mx-auto pb-32">
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
        <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#052c4e' }}>
          {destination}
        </h2>
        <p className="text-xl text-gray-600">
          Itinerario completo · {totalDays} {totalDays === 1 ? 'día' : 'días'}
        </p>
        
        {hotelRecommendation && (
          <div 
            className="mt-6 max-w-2xl mx-auto bg-blue-50 p-4"
            style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: '#3ccca4' }} />
              <div className="text-left">
                <p className="font-semibold mb-1" style={{ color: '#052c4e' }}>
                  Recomendación de Alojamiento
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{hotelRecommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline de Días */}
      <div className="space-y-8">
        {days.map((day, dayIndex) => (
          <DayCard
            key={day.day}
            day={day}
            isLast={dayIndex === days.length - 1}
            isAuthenticated={isAuthenticated}
            onInfo={handleInfo}
            onAlternative={handleAlternative}
            onDelete={handleDelete}
            destination={destination}
            getActivityType={getActivityType}
          />
        ))}
      </div>

      {/* Panel de Precio Total */}
      <TotalPricePanel
        itinerary={itineraryData}
        isAuthenticated={isAuthenticated}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

const DayCard = ({ day, isLast, isAuthenticated, onInfo, onAlternative, onDelete, destination, getActivityType }) => {
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
              <h3 className="text-2xl font-bold" style={{ color: '#052c4e' }}>
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
            destination={destination}
            getActivityType={getActivityType}
          />
        </div>
      </div>
    </div>
  );
};

const MomentSection = ({ icon, title, activities, color, isAuthenticated, onInfo, onAlternative, onDelete, destination, getActivityType }) => {
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
        <h4 className="text-xl font-bold" style={{ color: '#052c4e' }}>
          {title}
        </h4>
      </div>

      <div className="space-y-3 ml-2">
        {activities.map((activity, index) => {
          const activityType = getActivityType(activity);
          
          // Renderizar FlightCard para vuelos
          if (activityType === 'flight') {
            return (
              <FlightCard
                key={activity.activityId || index}
                flight={{
                  type: activity.title?.toLowerCase().includes('llegada') || activity.title?.toLowerCase().includes('arrival') ? 'arrival' : 'departure',
                  time: activity.time,
                  details: activity.description
                }}
                destination={destination}
              />
            );
          }
          
          // Renderizar HotelCard para hoteles
          if (activityType === 'hotel') {
            return (
              <HotelCard
                key={activity.activityId || index}
                hotel={{
                  name: activity.title,
                  zone: activity.location,
                  recommendation: activity.description
                }}
                destination={destination}
              />
            );
          }
          
          // Renderizar ActivityCard para actividades turísticas
          return (
            <ActivityCard
              key={activity.activityId || index}
              activity={activity}
              isAuthenticated={isAuthenticated}
              onInfo={onInfo}
              onAlternative={onAlternative}
              onDelete={onDelete}
            />
          );
        })}
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
