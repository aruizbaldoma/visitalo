import { Clock, MapPin, Sun, Sunset, Moon } from "lucide-react";

export const ItineraryTimeline = ({ itinerary }) => {
  if (!itinerary) {
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

  const { destination, totalDays, hotelRecommendation, days } = itinerary;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header del Itinerario */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#052c4e' }}>
          {destination}
        </h2>
        <p className="text-xl text-gray-600">
          Itinerario completo · {totalDays} {totalDays === 1 ? 'día' : 'días'}
        </p>
        
        {hotelRecommendation && (
          <div className="mt-6 max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-blue-900 mb-1">Recomendación de Zona</p>
                <p className="text-sm text-blue-700">{hotelRecommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline de Días */}
      <div className="space-y-8">
        {days.map((day, dayIndex) => (
          <DayCard key={day.day} day={day} isLast={dayIndex === days.length - 1} />
        ))}
      </div>
    </div>
  );
};

const DayCard = ({ day, isLast }) => {
  return (
    <div className="relative">
      {/* Línea de conexión */}
      {!isLast && (
        <div
          className="absolute left-8 top-20 bottom-0 w-0.5 -mb-8"
          style={{ backgroundColor: '#3ccca4', opacity: 0.3 }}
        />
      )}

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header del Día */}
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: '#052c4e' }}
            >
              {day.day}
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
          />

          {/* Tarde */}
          <MomentSection
            icon={<Sunset className="w-6 h-6" />}
            title="Tarde"
            activities={day.afternoon.activities}
            color="#FF6347"
          />

          {/* Noche */}
          <MomentSection
            icon={<Moon className="w-6 h-6" />}
            title="Noche"
            activities={day.night.activities}
            color="#4169E1"
          />
        </div>
      </div>
    </div>
  );
};

const MomentSection = ({ icon, title, activities, color }) => {
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
        {activities.map((activity, index) => (
          <ActivityCard key={index} activity={activity} />
        ))}
      </div>
    </div>
  );
};

const ActivityCard = ({ activity }) => {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Hora */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#3ccca4' }}>
          <Clock className="w-4 h-4" />
          {activity.time}
        </div>
        {activity.duration && (
          <div className="text-xs text-gray-500 mt-1 ml-6">
            {activity.duration}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900 mb-1">
          {activity.title}
        </h5>
        <p className="text-sm text-gray-600 mb-2">
          {activity.description}
        </p>
        {activity.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            {activity.location}
          </div>
        )}
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
