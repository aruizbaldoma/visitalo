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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md py-3 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_barato-planner/artifacts/6ka0wty1_Logo_fondoblanco.png"
              alt="Rutaperfecta.com"
              className="h-20 w-auto"
              style={{
                mixBlendMode: 'multiply',
                filter: 'contrast(1.3) brightness(1.15)',
                isolation: 'isolate'
              }}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('inicio')}
              className={`font-medium transition-colors ${
                activeSection === 'inicio' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'inicio' ? '#2ED3B7' : '#0A2540' }}
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className={`font-medium transition-colors ${
                activeSection === 'como-funciona' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'como-funciona' ? '#2ED3B7' : '#0A2540' }}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className={`font-medium transition-colors ${
                activeSection === 'viajes' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'viajes' ? '#2ED3B7' : '#0A2540' }}
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className={`font-medium transition-colors ${
                activeSection === 'contacto' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'contacto' ? '#2ED3B7' : '#0A2540' }}
            >
              Contacto
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #2ED3B7, #1AB89D)' }}
            >
              <Plane className="w-4 h-4 mr-2" />
              Buscar viaje
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: '#0A2540' }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: activeSection === 'inicio' ? '#E6F9F5' : '#F0F4F8',
                color: activeSection === 'inicio' ? '#2ED3B7' : '#0A2540'
              }}
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className="block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: activeSection === 'como-funciona' ? '#E6F9F5' : '#F0F4F8',
                color: activeSection === 'como-funciona' ? '#2ED3B7' : '#0A2540'
              }}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className="block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: activeSection === 'viajes' ? '#E6F9F5' : '#F0F4F8',
                color: activeSection === 'viajes' ? '#2ED3B7' : '#0A2540'
              }}
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className="block w-full text-left py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: activeSection === 'contacto' ? '#E6F9F5' : '#F0F4F8',
                color: activeSection === 'contacto' ? '#2ED3B7' : '#0A2540'
              }}
            >
              Contacto
            </button>
            <Button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-white hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #2ED3B7, #1AB89D)' }}
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
