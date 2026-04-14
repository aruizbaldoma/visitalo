import { useState, useEffect } from "react";
import { Menu, X, Plane } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Detect active section
      const sections = ['inicio', 'como-funciona', 'viajes', 'contacto'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-4 transition-all duration-300">
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
                activeSection === 'inicio' 
                  ? 'text-orange-600 font-semibold' 
                  : 'text-green-700 hover:text-orange-500'
              }`}
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className={`font-medium transition-colors ${
                activeSection === 'como-funciona' 
                  ? 'text-orange-600 font-semibold' 
                  : 'text-green-700 hover:text-orange-500'
              }`}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className={`font-medium transition-colors ${
                activeSection === 'viajes' 
                  ? 'text-orange-600 font-semibold' 
                  : 'text-green-700 hover:text-orange-500'
              }`}
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className={`font-medium transition-colors ${
                activeSection === 'contacto' 
                  ? 'text-orange-600 font-semibold' 
                  : 'text-green-700 hover:text-orange-500'
              }`}
            >
              Contacto
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
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
              <X className="w-6 h-6 text-green-700" />
            ) : (
              <Menu className="w-6 h-6 text-green-700" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            <button 
              onClick={() => scrollToSection('inicio')}
              className={`block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                activeSection === 'inicio'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className={`block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                activeSection === 'como-funciona'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className={`block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                activeSection === 'viajes'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className={`block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors ${
                activeSection === 'contacto'
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
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
