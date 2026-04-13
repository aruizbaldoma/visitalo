import { useState, useEffect } from "react";
import { Menu, X, Plane } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src="https://customer-assets.emergentagent.com/job_dbdb8aee-0eaf-4856-9f23-61350fa97147/artifacts/hky0r2mi_ChatGPT%20Image%2013%20abr%202026%2C%2022_23_17.png"
              alt="RutaBarata"
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('inicio')}
              className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-white hover:text-orange-200'
              }`}
            >
              Contacto
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`font-semibold transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                  : 'bg-white text-orange-600 hover:bg-gray-100'
              }`}
            >
              <Plane className="w-4 h-4 mr-2" />
              Buscar viaje
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="block w-full text-left py-2 px-4 rounded-lg bg-orange-50 text-gray-900 hover:bg-orange-100 font-medium"
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className="block w-full text-left py-2 px-4 rounded-lg bg-orange-50 text-gray-900 hover:bg-orange-100 font-medium"
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className="block w-full text-left py-2 px-4 rounded-lg bg-orange-50 text-gray-900 hover:bg-orange-100 font-medium"
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className="block w-full text-left py-2 px-4 rounded-lg bg-orange-50 text-gray-900 hover:bg-orange-100 font-medium"
            >
              Contacto
            </button>
            <Button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plane className="w-4 h-4 mr-2" />
              Buscar viaje
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
