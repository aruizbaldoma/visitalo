import { ItinerarySearchBar } from "./ItinerarySearchBar";

export const HeroItinerary = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  return (
    <div className="relative bg-white py-8 px-4">
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
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

        {/* Info adicional */}
        <div className="mt-6 text-left text-sm text-gray-500">
          <p>
            ✨ Itinerarios profesionales • 🎯 Actividades verificadas • 💰 Ahorra tiempo y dinero
          </p>
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
