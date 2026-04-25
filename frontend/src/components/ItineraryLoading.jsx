import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Route,
  Filter,
  CheckCircle2,
  Share2,
  CalendarDays,
  Ban,
  Puzzle,
  ListChecks,
  Star,
  Flame,
  Compass,
  TrendingUp,
  Heart,
  SlidersHorizontal,
  Lock,
  Layers,
  Wand2,
  ThumbsUp,
  Check,
} from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

// Each step pairs a phrase key with a matching icon component.
// Icons are stroke-based, minimal and consistent with lucide-react set.
const STEPS = [
  { key: "loading.m1", Icon: Camera },
  { key: "loading.m2", Icon: Route },
  { key: "loading.m3", Icon: Filter },
  { key: "loading.m4", Icon: CheckCircle2 },
  { key: "loading.m5", Icon: Share2 },
  { key: "loading.m6", Icon: CalendarDays },
  { key: "loading.m7", Icon: Ban },
  { key: "loading.m8", Icon: Puzzle },
  { key: "loading.m9", Icon: ListChecks },
  { key: "loading.m10", Icon: Star },
  { key: "loading.m11", Icon: Flame },
  { key: "loading.m12", Icon: Compass },
  { key: "loading.m13", Icon: TrendingUp },
  { key: "loading.m14", Icon: Heart },
  { key: "loading.m15", Icon: SlidersHorizontal },
  { key: "loading.m16", Icon: Lock },
  { key: "loading.m17", Icon: Layers },
  { key: "loading.m18", Icon: Wand2 },
  { key: "loading.m19", Icon: ThumbsUp },
  { key: "loading.m20", Icon: Check },
];

export const ItineraryLoading = () => {
  const { t } = useTranslation();
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(4);

  // Rotate phrases (and icons) every 1.6s
  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((x) => (x + 1) % STEPS.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  // Simulated progress (caps at 94% so it never visually finishes early)
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

  const { Icon: CurrentIcon } = STEPS[stepIdx];
  const currentPhrase = t(STEPS[stepIdx].key);

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
        {/* Icon + phrase block: re-mounts on stepIdx change to replay slide-in */}
        <div
          className="overflow-hidden mx-auto"
          style={{ minHeight: 96 }}
          aria-hidden={false}
        >
          <div
            key={stepIdx}
            className="flex flex-col items-center justify-center gap-4"
            style={{
              animation:
                "visitaloLoadingSlideIn 420ms cubic-bezier(0.22,1,0.36,1) both",
            }}
            data-testid="loading-step"
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 64,
                height: 64,
                backgroundColor: "#eafaf4",
              }}
            >
              <CurrentIcon
                size={30}
                strokeWidth={1.9}
                color={BRAND_GREEN}
                data-testid="loading-step-icon"
              />
            </div>
            <p
              className="font-semibold leading-snug px-2"
              style={{
                color: BRAND_BLUE,
                fontSize: 17,
                minHeight: 24,
              }}
              data-testid="loading-step-text"
            >
              {currentPhrase}
            </p>
          </div>
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
