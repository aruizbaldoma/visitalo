import { ItinerarySearchBar } from "./ItinerarySearchBar";

export const HeroItinerary = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center px-4 py-20"
      style={{
        background: 'linear-gradient(135deg, #052c4e 0%, #064a7a 100%)'
      }}
    >
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Planifica tu Viaje Perfecto
          </h1>
          <p className="text-xl md:text-2xl text-gray-200">
            Itinerarios personalizados generados con IA
          </p>
        </div>

        {/* Buscador */}
        <ItinerarySearchBar 
          onSearch={onSearch} 
          onOpenDetails={onOpenDetails}
          onSearchDataChange={onSearchDataChange}
        />

        {/* Info */}
        <div className="mt-8 text-center text-gray-300 text-sm">
          <p>
            Genera itinerarios profesionales organizados por días y momentos del día
          </p>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3ccca4] rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};
