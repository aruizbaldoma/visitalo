import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Compass, Sparkles } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const ItineraryLoading = () => {
  const { t } = useTranslation();

  const MESSAGES = [
    t("loading.m1"),
    t("loading.m2"),
    t("loading.m3"),
    t("loading.m4"),
    t("loading.m5"),
    t("loading.m6"),
    t("loading.m7"),
    t("loading.m8"),
    t("loading.m9"),
    t("loading.m10"),
  ];

  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(4);

  // Rotating messages every 1.8s
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx((x) => (x + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [MESSAGES.length]);

  // Simulated progress: quick start, slows near 94% so it never visually "finishes"
  // before the real response arrives.
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
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#eafaf4",
            }}
          >
            <Compass
              size={38}
              strokeWidth={1.8}
              color={BRAND_GREEN}
              style={{
                animation: "visitaloLoadingSpin 7s linear infinite",
              }}
              data-testid="loading-compass-icon"
            />
            <Sparkles
              size={16}
              strokeWidth={2}
              color={BRAND_GREEN}
              className="absolute"
              style={{
                top: -2,
                right: -2,
                animation: "visitaloLoadingTwinkle 1.8s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Rotating message (fades on change thanks to key + animation) */}
        <p
          key={msgIdx}
          className="font-semibold leading-snug flex items-center justify-center"
          style={{
            color: BRAND_BLUE,
            fontSize: 17,
            minHeight: 52,
            animation: "visitaloLoadingSwap 420ms ease-out both",
          }}
          data-testid="loading-rotating-message"
        >
          {MESSAGES[msgIdx]}
        </p>

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
        @keyframes visitaloLoadingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes visitaloLoadingTwinkle {
          0%, 100% { opacity: 0.45; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.18); }
        }
        @keyframes visitaloLoadingSwap {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
