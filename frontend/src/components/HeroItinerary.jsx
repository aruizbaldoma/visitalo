import { Sparkles, Target, PiggyBank } from "lucide-react";
import { ItinerarySearchBar } from "./ItinerarySearchBar";

export const HeroItinerary = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const features = [
    {
      Icon: Sparkles,
      title: "Itinerarios profesionales",
      text: "Planificación experta con actividades seleccionadas cuidadosamente para maximizar tu experiencia",
    },
    {
      Icon: Target,
      title: "Actividades verificadas",
      text: "Todas nuestras recomendaciones están verificadas y cuentan con valoraciones reales de viajeros",
    },
    {
      Icon: PiggyBank,
      title: "Ahorra tiempo y dinero",
      text: "Olvídate de horas de planificación. Obtén tu itinerario perfecto en minutos y al mejor precio",
    },
  ];

  return (
    <div className="relative bg-white py-8 px-4">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-20">
        <div className="text-left mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 font-heading"
            style={{ color: "#052c4e", letterSpacing: "-0.02em" }}
          >
            Tu viaje perfecto, en segundos.
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl" style={{ lineHeight: "1.6" }}>
            Encuentra itinerarios personalizados en destinos increíbles y mucho más
          </p>
        </div>

        <ItinerarySearchBar
          onSearch={onSearch}
          onOpenDetails={onOpenDetails}
          onSearchDataChange={onSearchDataChange}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-20 mt-16">
        <h2
          className="text-3xl font-bold mb-8 font-heading"
          style={{ color: "#052c4e", letterSpacing: "-0.02em" }}
        >
          ¿Por qué Visitalo.es?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
              data-testid={`feature-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(60, 204, 164, 0.12)" }}
              >
                <Icon className="w-7 h-7" style={{ color: "#3ccca4" }} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-3 font-heading" style={{ color: "#052c4e" }}>
                {title}
              </h3>
              <p className="text-gray-600 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 20% 50%, #3ccca4 0%, transparent 50%),
                       radial-gradient(circle at 80% 50%, #052c4e 0%, transparent 50%)`,
        }}
      />
    </div>
  );
};
