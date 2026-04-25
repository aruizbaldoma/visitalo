import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

// Loading messages rotate continuously while Gemini builds the trip.
const MESSAGE_KEYS = [
  "loading.m1",
  "loading.m2",
  "loading.m3",
  "loading.m4",
  "loading.m5",
  "loading.m6",
  "loading.m7",
  "loading.m8",
  "loading.m9",
  "loading.m10",
  "loading.m11",
  "loading.m12",
  "loading.m13",
  "loading.m14",
  "loading.m15",
  "loading.m16",
  "loading.m17",
  "loading.m18",
  "loading.m19",
  "loading.m20",
];

export const ItineraryLoading = () => {
  const { t } = useTranslation();
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(4);

  // Rotate phrases every 1.6s
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((x) => (x + 1) % MESSAGE_KEYS.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  // Simulated progress (caps at 94%)
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 94) return 94;
        const remaining = 94 - p;
        const step = Math.max(0.4, remaining * 0.045);
        return Math.min(94, p + step);
      });
    }, 380);
    return () => clearInterval(id);
  }, []);

  const currentPhrase = t(MESSAGE_KEYS[msgIdx]);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(3, 24, 52, 0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "visitaloLoadingFade 260ms ease-out both",
      }}
      role="dialog"
      aria-live="polite"
      aria-busy="true"
      data-testid="itinerary-loading-modal"
    >
      <div
        className="relative w-full max-w-md rounded-3xl px-8 py-10 text-center"
        style={{
          backgroundColor: "#ffffff",
          boxShadow:
            "0 26px 70px -22px rgba(3,24,52,0.45), 0 2px 10px rgba(3,24,52,0.08)",
          animation: "visitaloLoadingPop 280ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Spinning brand favicon as compass — persistent across phrases */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 96,
              height: 96,
              backgroundColor: "#eafaf4",
            }}
          >
            {/* Outer subtle dashed ring acting as compass dial */}
            <div
              className="absolute inset-1 rounded-full"
              style={{
                border: `1.5px dashed ${BRAND_GREEN}55`,
              }}
              aria-hidden="true"
            />
            {/* Brand favicon spinning like a compass needle */}
            <img
              src="/favicon.png"
              alt="Visitalo"
              width="56"
              height="56"
              className="rounded-full"
              style={{
                width: 56,
                height: 56,
                animation: "visitaloLoadingCompassSpin 4s linear infinite",
                transformOrigin: "center center",
              }}
              data-testid="loading-brand-spinner"
            />
          </div>
        </div>

        {/* Rotating phrase: slide-in from the right with fade */}
        <div className="overflow-hidden" style={{ minHeight: 28 }}>
          <p
            key={msgIdx}
            className="font-semibold leading-snug px-2"
            style={{
              color: BRAND_BLUE,
              fontSize: 17,
              animation:
                "visitaloLoadingSlideIn 420ms cubic-bezier(0.22,1,0.36,1) both",
            }}
            data-testid="loading-step-text"
          >
            {currentPhrase}
          </p>
        </div>

        {/* Simulated progress bar */}
        <div
          className="relative w-full rounded-full overflow-hidden mt-6"
          style={{ height: 6, backgroundColor: "#eef3f7" }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #3ccca4 0%, #5ee0b9 60%, #8aeccf 100%)",
              transition: "width 480ms ease-out",
            }}
          />
        </div>

        {/* Helper line */}
        <p
          className="mt-4"
          style={{ color: "#6b7a8a", fontSize: 13 }}
          data-testid="loading-helper"
        >
          {t("loading.helper")}
        </p>
      </div>

      <style>{`
        @keyframes visitaloLoadingFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes visitaloLoadingPop {
          0% { opacity: 0; transform: translateY(8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes visitaloLoadingCompassSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes visitaloLoadingSlideIn {
          0% {
            opacity: 0;
            transform: translateX(28px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
