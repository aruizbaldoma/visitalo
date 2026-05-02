import { Euro, Info, Heart, ShieldCheck, Wifi, Car, Plane, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatedNumber } from "./AnimatedNumber";
import { wrapTrackedUrl } from "../config/affiliates";

// Servicios extra ofrecidos en la sidebar. Los `from` son precios "desde"
// que se suman al total cuando el usuario los activa.
const EXTRA_SERVICES = [
  {
    id: "insurance",
    Icon: ShieldCheck,
    from: 3,
    href: "https://www.iatiseguros.com?r=85219359720989",
    enabled: true,
  },
  {
    id: "esim",
    Icon: Wifi,
    from: 4.5,
    href: "https://esim.holafly.com/",
    enabled: true,
  },
  {
    id: "transport",
    Icon: Car,
    from: null,
    href: null,
    enabled: false,
    visible: false,
  },
  {
    id: "flights",
    Icon: Plane,
    from: null,
    href: null,
    enabled: false,
    visible: false,
  },
];

export const ItinerarySidebar = ({ itinerary, isAuthenticated, onInterested, isInterestedLoading }) => {
  const { t, i18n } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState({});
  const isEN = (i18n.language || "es").toLowerCase().startsWith("en");

  const toggleExtra = (id) => {
    setSelectedExtras((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Suma los precios "desde" de los extras seleccionados.
  const extrasTotal = EXTRA_SERVICES.reduce(
    (sum, s) =>
      s.enabled && selectedExtras[s.id] && typeof s.from === "number"
        ? sum + s.from
        : sum,
    0,
  );

  // Recuento y suma excluyendo actividades eliminadas (soft-delete).
  const computeSummary = () => {
    if (!itinerary || !itinerary.days) return { totalPrice: 0, totalActivities: 0 };
    let totalPrice = 0;
    let totalActivities = 0;
    itinerary.days.forEach((day) => {
      ["morning", "afternoon", "night"].forEach((slot) => {
        const acts = (day[slot] && day[slot].activities) || [];
        acts.forEach((a) => {
          if (a.deleted) return;
          if (a.price) {
            totalPrice += a.price;
            totalActivities += 1;
          }
        });
      });
    });
    return { totalPrice, totalActivities };
  };

  const { totalPrice, totalActivities } = computeSummary();
  const grandTotal = totalPrice + extrasTotal;

  if (!itinerary) return null;

  return (
    <div className="lg:sticky lg:top-24 self-start">
      <div 
        className="bg-white shadow-lg p-6"
        style={{ border: '2px solid #3ccca4', borderRadius: '12px' }}
      >
        {/* Header */}
        <h3 className="text-xl font-bold mb-6" style={{ color: '#031834' }}>
          {t("sidebar.title")}
        </h3>

        {/* Total de actividades */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">{t("sidebar.totalActivities")}</p>
          <AnimatedNumber
            value={totalActivities}
            decimals={0}
            className="text-2xl font-bold"
            style={{ color: "#031834" }}
            testId="summary-activities-count"
          />
        </div>

        {/* Separador */}
        <div className="h-px bg-gray-200 my-6"></div>

        {/* Precio total - SIEMPRE visible */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-gray-500">{t("sidebar.estimatedPrice")}</p>
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              
              {/* Tooltip */}
              {showTooltip && (
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 z-50 leading-relaxed"
                  style={{ whiteSpace: 'normal' }}
                >
                  {t("sidebar.priceTooltip")}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                    style={{
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #1f2937'
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <Euro className="w-6 h-6" style={{ color: '#3ccca4' }} />
            <AnimatedNumber
              value={grandTotal}
              decimals={2}
              className="text-3xl font-bold"
              style={{ color: "#031834" }}
              testId="summary-total-price"
            />
          </div>
        </div>

        {/* Servicios extra */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#3ccca4", letterSpacing: "0.14em" }}
          >
            {t("extras.title")}
          </p>
          <div className="space-y-2.5" data-testid="extras-list">
            {EXTRA_SERVICES.filter((s) => s.visible !== false).map(
              ({ id, Icon, from, href, enabled }) => {
              const isSelected = !!selectedExtras[id];
              const label = t(`extras.${id}.label`);
              const formattedAmount = enabled
                ? Number.isInteger(from)
                  ? String(from)
                  : from.toLocaleString(isEN ? "en-US" : "es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                : "";

              return (
                <div
                  key={id}
                  data-testid={`extra-${id}`}
                  className={`p-3 rounded-xl border transition-all ${
                    !enabled
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : isSelected
                      ? "border-[#3ccca4] bg-[rgba(60,204,164,0.08)] shadow-sm"
                      : "border-gray-200 bg-white hover:border-[#3ccca4]/50"
                  }`}
                >
                  {/* Fila 1: icono + label (clic para toggle si está activo) */}
                  <button
                    type="button"
                    onClick={enabled ? () => toggleExtra(id) : undefined}
                    disabled={!enabled}
                    aria-pressed={isSelected}
                    data-testid={`extra-toggle-${id}`}
                    className={`w-full flex items-center gap-2.5 mb-2.5 text-left ${
                      enabled ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected
                          ? "#3ccca4"
                          : "rgba(60, 204, 164, 0.14)",
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: isSelected ? "#031834" : "#3ccca4" }}
                        strokeWidth={2.2}
                      />
                    </span>
                    <span
                      className="text-sm font-bold leading-tight flex-1"
                      style={{ color: "#031834" }}
                    >
                      {label}
                    </span>
                    {enabled && isSelected && (
                      <Check
                        className="w-4 h-4"
                        style={{ color: "#3ccca4" }}
                        strokeWidth={3}
                      />
                    )}
                  </button>

                  {/* Fila 2: un único botón */}
                  <div className="flex justify-end">
                    {enabled ? (
                      isSelected && href ? (
                        <a
                          href={wrapTrackedUrl(href, id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`extra-link-${id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all"
                          style={{
                            backgroundColor: "#3ccca4",
                            borderRadius: "8px",
                          }}
                        >
                          {t("extras.bookCta")}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleExtra(id)}
                          data-testid={`extra-price-${id}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg leading-none transition-all hover:scale-[1.03]"
                          style={{
                            backgroundColor: "#3ccca4",
                            color: "#031834",
                            minHeight: "34px",
                          }}
                        >
                          <span className="inline-flex items-baseline gap-1">
                            <span
                              className="text-[9px] font-semibold opacity-70 uppercase"
                              style={{ letterSpacing: "0.1em" }}
                            >
                              {t("extras.fromLabel")}
                            </span>
                            <span className="text-[14px] font-bold">
                              {isEN
                                ? `€${formattedAmount}`
                                : `${formattedAmount}€`}
                            </span>
                          </span>
                        </button>
                      )
                    ) : (
                      <span
                        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-gray-200 text-gray-500"
                        style={{
                          minHeight: "34px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        data-testid={`extra-disabled-${id}`}
                      >
                        {t("extras.comingSoon")}
                      </span>
                    )}
                  </div>
                </div>
              );
            },
            )}
          </div>
        </div>

        {/* Nota adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("sidebar.priceDisclaimer")}
          </p>
        </div>

        {/* CTA ¡Me interesa! */}
        {onInterested && (
          <button
            type="button"
            onClick={onInterested}
            disabled={isInterestedLoading}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#3ccca4", color: "#031834" }}
            data-testid="interested-button"
          >
            <Heart className="w-4 h-4" strokeWidth={2.5} />
            {isInterestedLoading ? t("sidebar.interestedSaving") : t("sidebar.interested")}
          </button>
        )}
      </div>
    </div>
  );
};
