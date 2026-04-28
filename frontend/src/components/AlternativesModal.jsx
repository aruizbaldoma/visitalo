import { X, Star, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { getActivityBookingUrl } from "../config/affiliates";
import { useItinerary } from "../contexts/ItineraryContext";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const DIFF_GREEN = "#0f9d6e"; // cheaper than original
const DIFF_RED = "#d04141"; // pricier than original

// Random helper inclusive of both bounds, rounded to 2 decimals.
const randInRange = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

// Lightweight client-side mock that returns 2 alternatives with a wide
// price range (0€ free → 100€). Replace with real provider API once available.
const buildAlternatives = (activity) => {
  if (!activity) return [];

  // "Best value": tends to be cheaper. 0 € (free) up to ~60 €.
  const valueAlt = {
    ...activity,
    activityId: `${activity.activityId}_alt_value`,
    title: activity.title,
    altKind: "value",
    rating: 4.6,
    reviews: 1240,
    provider: activity.provider || "Civitatis",
    price: randInRange(0, 60),
  };

  // "Top rated": pricier on average. 20 € up to 100 €.
  const ratedAlt = {
    ...activity,
    activityId: `${activity.activityId}_alt_rated`,
    title: activity.title,
    altKind: "rated",
    rating: 4.9,
    reviews: 2150,
    provider:
      activity.provider && activity.provider.toLowerCase().includes("viator")
        ? "GetYourGuide"
        : "Viator",
    price: randInRange(20, 100),
  };

  return [valueAlt, ratedAlt];
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} de 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className="w-3.5 h-3.5"
        style={{
          color: BRAND_GREEN,
          fill: i < Math.round(rating) ? BRAND_GREEN : "transparent",
        }}
        strokeWidth={1.6}
      />
    ))}
  </div>
);

/**
 * Renders the alternative price + the diff vs the original activity:
 *  - free  → "Gratis" (green)
 *  - cheaper → green color  ("−12,00 € más barato")
 *  - pricier → red color    ("+8,50 € más caro")
 */
const PriceDiff = ({ altPrice, basePrice, t }) => {
  const isFree = !altPrice || altPrice <= 0;
  const validBase = typeof basePrice === "number" && basePrice > 0;
  const diff = validBase ? altPrice - basePrice : 0;
  const isCheaper = diff < 0;
  const diffAbs = Math.abs(diff).toFixed(2);

  let priceColor = BRAND_BLUE;
  if (validBase) priceColor = isCheaper ? DIFF_GREEN : DIFF_RED;
  if (isFree) priceColor = DIFF_GREEN;

  return (
    <div className="flex flex-col items-end flex-shrink-0">
      <div className="font-bold text-xl" style={{ color: priceColor }}>
        {isFree ? t("alternatives.free") : `€${altPrice.toFixed(2)}`}
      </div>
      {validBase && !isFree && Math.abs(diff) >= 0.01 && (
        <div
          className="text-[11px] font-semibold mt-0.5"
          style={{ color: priceColor }}
          data-testid="alt-price-diff"
        >
          {isCheaper
            ? t("alternatives.cheaperBy", { amount: diffAbs })
            : t("alternatives.pricierBy", { amount: diffAbs })}
        </div>
      )}
      {isFree && validBase && (
        <div
          className="text-[11px] font-semibold mt-0.5"
          style={{ color: DIFF_GREEN }}
          data-testid="alt-price-diff"
        >
          {t("alternatives.savingsFree", { amount: basePrice.toFixed(2) })}
        </div>
      )}
    </div>
  );
};

export const AlternativesModal = ({
  activity,
  destination = "",
  isOpen,
  onClose,
  onSelectAlternative,
  // eslint-disable-next-line no-unused-vars
  isAuthenticated,
}) => {
  const { t } = useTranslation();
  const { searchParams } = useItinerary();
  const [alternatives, setAlternatives] = useState([]);

  useEffect(() => {
    if (isOpen && activity) {
      setAlternatives(buildAlternatives(activity));
    } else if (!isOpen) {
      setAlternatives([]);
    }
  }, [isOpen, activity]);

  if (!isOpen || !activity) return null;

  const hasAlternatives = alternatives.length > 0;
  const basePrice =
    typeof activity.price === "number" && activity.price > 0
      ? activity.price
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      data-testid="alternatives-overlay"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: BRAND_BLUE }}>
              {t("alternatives.title")}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t("alternatives.subtitlePrefix")}{" "}
              <span className="font-semibold">{activity.title}</span>
              {basePrice ? (
                <span className="text-gray-500">
                  {" "}
                  ·{" "}
                  {t("alternatives.originalPrice", {
                    amount: basePrice.toFixed(2),
                  })}
                </span>
              ) : null}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t("alternatives.cancel")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {hasAlternatives ? (
            <div className="space-y-3" data-testid="alternatives-list">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: BRAND_GREEN, letterSpacing: "0.16em" }}
              >
                {t("alternatives.foundLabel")}
              </p>

              {alternatives.map((alt) => (
                <article
                  key={alt.activityId}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#3ccca4] hover:shadow-md transition-all"
                  data-testid={`alternative-${alt.altKind}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(60,204,164,0.14)",
                          color: BRAND_GREEN,
                          letterSpacing: "0.14em",
                        }}
                      >
                        {alt.altKind === "value"
                          ? t("alternatives.tagValue")
                          : t("alternatives.tagRated")}
                      </span>
                      <h4 className="font-semibold text-gray-900 leading-snug">
                        {alt.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
                        <StarRating rating={alt.rating} />
                        <span className="font-medium" style={{ color: BRAND_BLUE }}>
                          {alt.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span>
                          {t("alternatives.reviewsCount", {
                            count: alt.reviews,
                          })}
                        </span>
                        <span>·</span>
                        <span className="truncate">
                          {t("alternatives.byProvider", { provider: alt.provider })}
                        </span>
                      </div>
                    </div>
                    <PriceDiff altPrice={alt.price} basePrice={basePrice} t={t} />
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectAlternative(alt);
                        onClose();
                      }}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: BRAND_BLUE }}
                      data-testid={`select-alt-${alt.altKind}`}
                    >
                      {t("alternatives.swap")}
                    </button>
                    <a
                      href={getActivityBookingUrl(alt, {
                        destination,
                        startDate: searchParams?.startDate,
                        endDate: searchParams?.endDate,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white rounded-lg hover:shadow-md transition-all"
                      style={{ backgroundColor: BRAND_GREEN }}
                      data-testid={`book-alt-${alt.altKind}`}
                    >
                      {t("card.book")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-2" data-testid="alternatives-empty">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(60,204,164,0.14)" }}
              >
                <Sparkles className="w-6 h-6" style={{ color: BRAND_GREEN }} />
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: BRAND_BLUE }}
              >
                {t("alternatives.emptyTitle")}
              </h3>
              <p
                className="text-sm text-gray-600 max-w-sm mx-auto"
                style={{ lineHeight: "1.6" }}
              >
                {t("alternatives.emptyDescription")}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end rounded-b-2xl">
          <Button onClick={onClose} variant="outline" className="border-gray-300">
            {t("alternatives.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
};
