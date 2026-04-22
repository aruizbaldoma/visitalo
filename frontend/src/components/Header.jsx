import { User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

const LANGUAGES = [
  { code: "ES", name: "Español", cc: "es" },
  { code: "EN", name: "English", cc: "gb" },
  { code: "FR", name: "Français", cc: "fr" },
  { code: "IT", name: "Italiano", cc: "it" },
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
  const { user, isAuthenticated, logout } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentLang, setCurrentLang] = useState("ES");

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

  const handleLangChange = (code) => {
    setCurrentLang(code);
    setShowLangMenu(false);
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
                aria-label={`Idioma actual: ${current.name}`}
                title={`Idioma: ${current.name}`}
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
                      onClick={() => handleLangChange(lang.code)}
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
                title={isAuthenticated ? user?.name || "Mi cuenta" : "Iniciar sesión"}
                data-testid="header-user-button"
              >
                {isAuthenticated && user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || "Usuario"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {isAuthenticated && showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  style={{ zIndex: 100 }}
                  data-testid="user-menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.name || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    data-testid="user-logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
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
    </>
  );
};
