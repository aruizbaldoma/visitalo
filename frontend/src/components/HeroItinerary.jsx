import { ItinerarySearchBar } from "./ItinerarySearchBar";

export const HeroItinerary = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  return (
    <div className="relative bg-white py-8 px-4">
      {/* Contenido con márgenes más grandes */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-16">
        {/* Textos alineados a la izquierda */}
        <div className="text-left mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ 
            color: '#052c4e',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            letterSpacing: '-0.02em'
          }}>
            Viaja más pensando menos
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl" style={{ lineHeight: '1.6' }}>
            Encuentra itinerarios personalizados en destinos increíbles y mucho más
          </p>
        </div>

        {/* Buscador Compacto Estilo Booking */}
        <ItinerarySearchBar 
          onSearch={onSearch} 
          onOpenDetails={onOpenDetails}
          onSearchDataChange={onSearchDataChange}
        />
      </div>

      {/* Sección: ¿Por qué Rutaperfecta.com? */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-16 mt-16">
        <h2 className="text-3xl font-bold mb-8" style={{ color: '#052c4e' }}>
          ¿Por qué Rutaperfecta.com?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Itinerarios profesionales */}
          <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#052c4e' }}>
              Itinerarios profesionales
            </h3>
            <p className="text-gray-600 text-sm">
              Planificación experta con actividades seleccionadas cuidadosamente para maximizar tu experiencia
            </p>
          </div>

          {/* Card 2: Actividades verificadas */}
          <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#052c4e' }}>
              Actividades verificadas
            </h3>
            <p className="text-gray-600 text-sm">
              Todas nuestras recomendaciones están verificadas y cuentan con valoraciones reales de viajeros
            </p>
          </div>

          {/* Card 3: Ahorra tiempo y dinero */}
          <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-3" style={{ color: '#052c4e' }}>
              Ahorra tiempo y dinero
            </h3>
            <p className="text-gray-600 text-sm">
              Olvídate de horas de planificación. Obtén tu itinerario perfecto en minutos y al mejor precio
            </p>
          </div>
        </div>
      </div>

      {/* Decoración sutil de fondo */}
      <div className="absolute inset-0 opacity-5" style={{ 
        background: `radial-gradient(circle at 20% 50%, #3ccca4 0%, transparent 50%), 
                     radial-gradient(circle at 80% 50%, #052c4e 0%, transparent 50%)`
      }} />
    </div>
  );
};
