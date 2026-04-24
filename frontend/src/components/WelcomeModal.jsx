import { Crown, Sparkles, X } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const WelcomeModal = ({ isOpen, userName, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const firstName = userName ? userName.split(" ")[0] : "";
  const nameSuffix = firstName ? `, ${firstName}` : "";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      data-testid="welcome-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        data-testid="welcome-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/30 transition-colors z-10"
          aria-label={t("welcomeGift.closeAria")}
          data-testid="welcome-modal-close"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div
          className="px-8 pt-10 pb-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/30 mb-4 backdrop-blur-sm">
            <Crown className="w-12 h-12" style={{ color: BRAND_BLUE }} />
          </div>
          <h2
            className="text-3xl font-bold mb-2 font-heading"
            style={{ color: BRAND_BLUE }}
          >
            {t("welcomeGift.title", { nameSuffix })}
          </h2>
          <p
            className="text-base font-medium"
            style={{ color: BRAND_BLUE }}
          >
            {t("welcomeGift.subtitle")}
          </p>
        </div>

        <div className="p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: BRAND_GREEN }} />
            <p className="font-bold text-lg font-heading" style={{ color: BRAND_BLUE }}>
              {t("welcomeGift.headline")}
            </p>
            <Sparkles className="w-5 h-5" style={{ color: BRAND_GREEN }} />
          </div>
          <p className="text-gray-600 text-sm mb-5 leading-relaxed">
            <Trans i18nKey="welcomeGift.description" components={{ strong: <strong /> }} />
          </p>
          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: "#f9fafb", border: "1px solid #E5E7EB" }}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
              {t("welcomeGift.afterPrefix")}
            </p>
            <p className="text-3xl font-bold font-heading" style={{ color: BRAND_BLUE }}>
              1€ <span className="text-sm font-medium text-gray-500">{t("welcomeGift.perMonth")}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            data-testid="welcome-modal-cta"
          >
            {t("welcomeGift.cta")}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            {t("welcomeGift.noAutoCharges")}
          </p>
        </div>
      </div>
    </div>
  );
};
