import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "visitalo_cookie_consent_v1";
const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3bc8a1";

const DEFAULT_CONSENT = {
  necessary: true, // Siempre true, no se puede deshabilitar
  analytics: false,
  marketing: false,
  date: null,
};

/**
 * Lee el consentimiento guardado (null si no se ha decidido aún)
 */
export const getCookieConsent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const CookieBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const saveConsent = (values) => {
    const data = { ...values, date: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setVisible(false);
    setShowPrefs(false);
    // Emit event so rest of the app can react if needed
    window.dispatchEvent(new CustomEvent("visitalo:cookie-consent", { detail: data }));
  };

  const acceptAll = () =>
    saveConsent({ necessary: true, analytics: true, marketing: true });

  const rejectAll = () =>
    saveConsent({ necessary: true, analytics: false, marketing: false });

  const savePrefs = () => saveConsent(prefs);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] p-4 md:p-6"
      data-testid="cookie-banner"
    >
      <div
        className="max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white"
        style={{ border: `2px solid ${BRAND_BLUE}` }}
      >
        {!showPrefs ? (
          <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="flex items-start gap-4 flex-1">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_GREEN}20` }}
              >
                <Cookie className="w-6 h-6" style={{ color: BRAND_BLUE }} />
              </div>
              <div>
                <h3
                  className="font-bold mb-1 font-heading text-base md:text-lg"
                  style={{ color: BRAND_BLUE }}
                >
                  {t("cookies.title")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("cookies.description")}{" "}
                  <a
                    href="/legal/cookies"
                    className="underline font-medium"
                    style={{ color: BRAND_BLUE }}
                  >
                    {t("cookies.moreInfo")}
                  </a>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={rejectAll}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }}
                data-testid="cookie-reject-button"
              >
                {t("cookies.reject")}
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }}
                data-testid="cookie-prefs-button"
              >
                {t("cookies.configure")}
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="cookie-accept-button"
              >
                {t("cookies.accept")}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <h3
                className="font-bold font-heading text-lg"
                style={{ color: BRAND_BLUE }}
              >
                {t("cookies.prefsTitle")}
              </h3>
              <button
                onClick={() => setShowPrefs(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 mb-5 max-h-96 overflow-y-auto">
              <CookieCategory
                title={t("cookies.catNecessaryTitle")}
                description={t("cookies.catNecessaryDesc")}
                enabled={true}
                disabled
              />
              <CookieCategory
                title={t("cookies.catAnalyticsTitle")}
                description={t("cookies.catAnalyticsDesc")}
                enabled={prefs.analytics}
                onChange={(v) => setPrefs({ ...prefs, analytics: v })}
              />
              <CookieCategory
                title={t("cookies.catMarketingTitle")}
                description={t("cookies.catMarketingDesc")}
                enabled={prefs.marketing}
                onChange={(v) => setPrefs({ ...prefs, marketing: v })}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={rejectAll}
                className="px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: BRAND_BLUE, color: BRAND_BLUE }}
              >
                {t("cookies.reject")}
              </button>
              <button
                onClick={savePrefs}
                className="px-5 py-2.5 text-sm font-bold rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="cookie-save-prefs"
              >
                {t("cookies.savePrefs")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CookieCategory = ({ title, description, enabled, onChange, disabled }) => (
  <div
    className="p-4 rounded-lg"
    style={{ border: "1px solid #E5E7EB" }}
  >
    <div className="flex items-start justify-between gap-4 mb-1">
      <h4 className="font-semibold text-sm" style={{ color: BRAND_BLUE }}>
        {title}
      </h4>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
        />
        <div
          className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${
            disabled ? "opacity-60" : ""
          }`}
          style={{
            backgroundColor: enabled ? BRAND_GREEN : "#D1D5DB",
          }}
        ></div>
      </label>
    </div>
    <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
  </div>
);
