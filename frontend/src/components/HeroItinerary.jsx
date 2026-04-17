import { ItinerarySearchBar } from "./ItinerarySearchBar";

export const HeroItinerary = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  return (
    <div className="relative bg-white py-16 px-4">
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Textos */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ 
            color: '#052c4e',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            letterSpacing: '-0.02em'
          }}>
            Viaja más gastando menos
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto" style={{ lineHeight: '1.6' }}>
            Descubre itinerarios personalizados con IA que maximizan tu experiencia mientras cuidan tu presupuesto
          </p>
        </div>

        {/* Buscador Compacto Estilo Booking */}
        <ItinerarySearchBar 
          onSearch={onSearch} 
          onOpenDetails={onOpenDetails}
          onSearchDataChange={onSearchDataChange}
        />

        {/* Info adicional */}
        <div className="mt-6 text-center text-sm text-gray-500">
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
