import { User, LogOut, Luggage } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { WelcomeModal } from "./WelcomeModal";
import { getLocalizedPath } from "../utils/localizedPaths";

const LANGUAGES = [
  { code: "ES", lng: "es", name: "Español", cc: "es" },
  { code: "EN", lng: "en", name: "English", cc: "gb" },
];

const FlagRound = ({ cc, size = 28 }) => (
  <img
    src={`https://flagcdn.com/w80/${cc}.png`}
    srcSet={`https://flagcdn.com/w160/${cc}.png 2x`}
    alt=""
    aria-hidden="true"
    className="rounded-full object-cover"
    style={{ width: `${size}px`, height: `${size}px` }}
  />
);

const FlagRect = ({ cc }) => (
  <img
    src={`https://flagcdn.com/w40/${cc}.png`}
    srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
    alt=""
    aria-hidden="true"
    className="inline-block object-cover rounded-sm"
    style={{ width: "1.25rem", height: "0.9rem" }}
  />
);

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const currentLang = (i18n.language || "es").toLowerCase().startsWith("en") ? "EN" : "ES";

  const langRef = useRef(null);
  const userRef = useRef(null);

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escuchar eventos globales para abrir el modal desde otros componentes
  useEffect(() => {
    const openHandler = () => setShowAuthModal(true);
    const welcomeHandler = () => setShowWelcome(true);
    window.addEventListener("visitalo:open-auth", openHandler);
    window.addEventListener("visitalo:welcome", welcomeHandler);
    return () => {
      window.removeEventListener("visitalo:open-auth", openHandler);
      window.removeEventListener("visitalo:welcome", welcomeHandler);
    };
  }, []);

  const handleLangChange = (lng) => {
    i18n.changeLanguage(lng);
    setShowLangMenu(false);

    // If we're on a localized route (e.g. /destinos, /roma-en-3-dias),
    // navigate to the equivalent slug in the target language. Use a hard
    // navigation so SEO components (Helmet, hreflang, canonical) are
    // re-rendered with the correct lang from the start.
    if (typeof window !== "undefined") {
      const current = window.location.pathname;
      const target = getLocalizedPath(current, lng);
      if (target && target !== current) {
        window.location.assign(target + window.location.search + window.location.hash);
      }
    }
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      setShowUserMenu((prev) => !prev);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center" data-testid="header-logo-link">
              <img
                src="/visitalo-logo.png"
                alt="Visitalo.es"
                className="h-14 w-auto"
                data-testid="header-logo-img"
              />
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Idioma */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors overflow-hidden flex items-center justify-center"
                style={{ border: "1px solid #E5E7EB", width: "42px", height: "42px" }}
                data-testid="lang-selector-button"
                aria-label={t("header.langAriaLabel", { name: current.name })}
                title={t("header.langTitle", { name: current.name })}
              >
                <FlagRound cc={current.cc} size={32} />
              </button>

              {showLangMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  style={{ zIndex: 100 }}
                  data-testid="lang-menu"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.lng)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        currentLang === lang.code ? "bg-green-50" : ""
                      }`}
                      data-testid={`lang-option-${lang.code.toLowerCase()}`}
                    >
                      <FlagRect cc={lang.cc} />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">{lang.name}</p>
                      </div>
                      {currentLang === lang.code && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#3ccca4" }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Usuario / Login */}
            <div className="relative" ref={userRef}>
              <button
                onClick={handleUserClick}
                className="rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center overflow-hidden"
                style={{ border: "1px solid #E5E7EB", width: "42px", height: "42px" }}
                title={isAuthenticated ? user?.name || t("header.myAccount") : t("header.signIn")}
                data-testid="header-user-button"
              >
                {isAuthenticated && user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || t("header.user")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {isAuthenticated && showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  style={{ zIndex: 100 }}
                  data-testid="user-menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.name || t("header.user")}
                    </p>
                  </div>
                  <a
                    href="/misviajes"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    data-testid="user-mytrips-link"
                  >
                    <Luggage className="w-4 h-4" style={{ color: "#031834" }} />
                    {t("header.myTrips")}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    data-testid="user-logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("header.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <WelcomeModal
        isOpen={showWelcome}
        userName={user?.name}
        onClose={() => setShowWelcome(false)}
      />
    </>
  );
};
