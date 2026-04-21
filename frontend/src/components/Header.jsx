import { User, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('ES');

  const languages = [
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'EN', name: 'English', flag: '🇬🇧' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' }
  ];

  const handleLangChange = (code) => {
    setCurrentLang(code);
    setShowLangMenu(false);
    // TODO: Implementar cambio de idioma real
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-20 py-4 flex items-center justify-between">
        {/* Logo - Visitalo.es */}
        <div className="flex items-center">
          <a href="/" className="flex items-center" data-testid="header-logo-link">
            <img
              src="/visitalo-logo.png"
              alt="Visitalo.es"
              className="h-10 w-auto"
              data-testid="header-logo-img"
            />
          </a>
        </div>

        {/* Selector de Idioma + Perfil de Usuario */}
        <div className="flex items-center gap-4">
          {/* Selector de Idioma */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #E5E7EB' }}
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{currentLang}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showLangMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                style={{ zIndex: 100 }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      currentLang === lang.code ? 'bg-green-50' : ''
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-800">{lang.code}</p>
                      <p className="text-xs text-gray-500">{lang.name}</p>
                    </div>
                    {currentLang === lang.code && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3ccca4' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Icono de Perfil de Usuario */}
          <button
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
            style={{ border: '1px solid #E5E7EB' }}
            title="Mi cuenta"
          >
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
