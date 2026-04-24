import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const ItineraryLoading = () => {
  const { t } = useTranslation();
  const SUBTITLES = [
    t("loading.s1"),
    t("loading.s2"),
    t("loading.s3"),
    t("loading.s4"),
    t("loading.s5"),
  ];
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % 5), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
      style={{ backgroundColor: BRAND_BLUE }}
      data-testid="itinerary-loading-overlay"
    >
      {/* Halo de fondo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full opacity-[0.08] blur-3xl"
        style={{ backgroundColor: BRAND_GREEN }}
      />

      {/* Texto superior */}
      <div className="relative z-10 mb-16 text-center px-6">
        <p
          className="text-xs md:text-sm font-bold uppercase tracking-[0.35em] animate-[neonFlicker_3.2s_ease-in-out_infinite]"
          style={{
            color: BRAND_GREEN,
            textShadow: `0 0 6px ${BRAND_GREEN}88, 0 0 18px ${BRAND_GREEN}55, 0 0 36px ${BRAND_GREEN}33`,
            fontFamily: '"Montserrat", system-ui, sans-serif',
          }}
        >
          {t("loading.eyebrow")}
        </p>
      </div>

      {/* Icono central: globo monolinear con brújula + estrella */}
      <div className="relative z-10 flex items-center justify-center">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: `drop-shadow(0 0 10px ${BRAND_GREEN}aa) drop-shadow(0 0 28px ${BRAND_GREEN}55)`,
          }}
          className="animate-[softPulse_3s_ease-in-out_infinite]"
          data-testid="loading-icon"
        >
          {/* Círculo exterior */}
          <circle
            cx="110"
            cy="110"
            r="100"
            stroke={BRAND_GREEN}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Globo: silueta */}
          <circle
            cx="110"
            cy="110"
            r="64"
            stroke={BRAND_GREEN}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Meridianos */}
          <ellipse
            cx="110"
            cy="110"
            rx="26"
            ry="64"
            stroke={BRAND_GREEN}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Ecuador */}
          <line
            x1="46"
            y1="110"
            x2="174"
            y2="110"
            stroke={BRAND_GREEN}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Paralelos sutiles */}
          <ellipse
            cx="110"
            cy="110"
            rx="64"
            ry="26"
            stroke={BRAND_GREEN}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Aguja de brújula (rombo vertical) */}
          <g
            style={{ transformOrigin: "110px 110px" }}
            className="animate-[slowSpin_8s_linear_infinite]"
          >
            <path
              d="M110 54 L120 110 L110 120 L100 110 Z"
              fill={BRAND_GREEN}
              opacity="0.95"
            />
            <path
              d="M110 166 L120 110 L110 100 L100 110 Z"
              fill="none"
              stroke={BRAND_GREEN}
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.5"
            />
            <circle cx="110" cy="110" r="4" fill={BRAND_GREEN} />
          </g>

          {/* Estrella de destino (arriba-derecha) */}
          <g
            className="animate-[twinkle_2s_ease-in-out_infinite]"
            style={{ transformOrigin: "168px 52px" }}
          >
            <path
              d="M168 40 L171 50 L181 52 L171 54 L168 64 L165 54 L155 52 L165 50 Z"
              fill={BRAND_GREEN}
              opacity="0.95"
            />
          </g>

          {/* Marcas cardinales */}
          <g opacity="0.6">
            <line x1="110" y1="18" x2="110" y2="28" stroke={BRAND_GREEN} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="110" y1="192" x2="110" y2="202" stroke={BRAND_GREEN} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="18" y1="110" x2="28" y2="110" stroke={BRAND_GREEN} strokeWidth="2.2" strokeLinecap="round" />
            <line x1="192" y1="110" x2="202" y2="110" stroke={BRAND_GREEN} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Subtítulo rotativo */}
      <p
        key={i}
        className="relative z-10 mt-12 text-white/70 text-sm md:text-base animate-[fadeSwap_0.55s_ease-out]"
        data-testid="loading-subtitle"
      >
        {SUBTITLES[i]}
      </p>

      {/* Logotipo sutil abajo */}
      <div
        className="absolute bottom-8 text-[10px] font-bold uppercase tracking-[0.4em]"
        style={{ color: BRAND_GREEN, opacity: 0.5 }}
      >
        Visítalo.es
      </div>

      <style>{`
        @keyframes softPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes neonFlicker {
          0%, 100% { opacity: 1; }
          45% { opacity: 0.72; }
          50% { opacity: 1; }
          55% { opacity: 0.88; }
        }
        @keyframes fadeSwap {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
