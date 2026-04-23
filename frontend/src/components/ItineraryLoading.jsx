import { useEffect, useState } from "react";
import { Zap, Sparkles, MapPin, Compass, Hotel, Plane } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const STEPS = [
  { Icon: MapPin, text: "Explorando tu destino..." },
  { Icon: Compass, text: "Seleccionando los mejores spots..." },
  { Icon: Sparkles, text: "Añadiendo rincones secretos..." },
  { Icon: Hotel, text: "Buscando el alojamiento perfecto..." },
  { Icon: Plane, text: "Ajustando horarios y traslados..." },
  { Icon: Zap, text: "Últimos detalles, casi listo..." },
];

export const ItineraryLoading = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const { Icon, text } = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #0a2a4e 60%, ${BRAND_BLUE} 100%)`,
      }}
      data-testid="itinerary-loading-overlay"
    >
      {/* Glow verde de fondo */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ backgroundColor: BRAND_GREEN }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ backgroundColor: BRAND_GREEN, animationDelay: "1s" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl">
        {/* Icono rotativo */}
        <div
          className="relative w-28 h-28 rounded-full flex items-center justify-center mb-8"
          style={{ backgroundColor: "rgba(60, 204, 164, 0.15)" }}
        >
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{
              borderTopColor: BRAND_GREEN,
              borderRightColor: `${BRAND_GREEN}66`,
              animationDuration: "1.4s",
            }}
          />
          <Icon
            key={step}
            className="w-12 h-12 animate-[popIn_0.45s_ease-out]"
            style={{ color: BRAND_GREEN }}
            strokeWidth={2.2}
          />
        </div>

        <span
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: BRAND_GREEN, letterSpacing: "0.2em" }}
        >
          Montando tu viaje
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold font-heading text-white mb-4"
          style={{ letterSpacing: "-0.02em", lineHeight: "1.1" }}
        >
          Visítalo todo.
          <br />
          <span style={{ color: BRAND_GREEN }}>No te dejes nada atrás.</span>
        </h2>
        <p
          key={`t-${step}`}
          className="text-white/80 text-base md:text-lg animate-[fadeIn_0.5s_ease-out]"
        >
          {text}
        </p>

        {/* Barra de progreso indefinida */}
        <div className="mt-8 w-64 h-1.5 rounded-full overflow-hidden bg-white/10">
          <div
            className="h-full rounded-full animate-[progressSweep_2s_ease-in-out_infinite]"
            style={{
              width: "40%",
              background: `linear-gradient(90deg, transparent, ${BRAND_GREEN}, transparent)`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressSweep {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
