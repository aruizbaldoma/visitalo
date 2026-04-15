import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-2 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_barato-planner/artifacts/3rlb1w7q_Logo_fondoblanco.png"
              alt="Rutaperfecta.com"
              className="h-11 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('inicio')}
              className={`font-medium transition-colors text-sm ${
                activeSection === 'inicio' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'inicio' ? '#3ccca4' : '#052c4e' }}
            >
              Inicio
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className={`font-medium transition-colors text-sm ${
                activeSection === 'como-funciona' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'como-funciona' ? '#3ccca4' : '#052c4e' }}
            >
              Cómo funciona
            </button>
            <button 
              onClick={() => scrollToSection('viajes')}
              className={`font-medium transition-colors text-sm ${
                activeSection === 'viajes' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'viajes' ? '#3ccca4' : '#052c4e' }}
            >
              Viajes
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className={`font-medium transition-colors text-sm ${
                activeSection === 'contacto' 
                  ? 'font-semibold' 
                  : 'hover:opacity-80'
              }`}
              style={{ color: activeSection === 'contacto' ? '#3ccca4' : '#052c4e' }}
            >
              Contacto
            </button>
          </nav>

          {/* User Icon Button */}
          <div className="hidden md:block">
            <Button 
              onClick={() => setIsAuthDialogOpen(true)}
              variant="ghost"
              className="transition-all duration-300 hover:bg-gray-100 rounded-full p-2"
              style={{ color: '#052c4e' }}
            >
              <User className="w-6 h-6" />
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

      {/* Auth Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: '#052c4e' }}>
              Te damos la bienvenida a Rutaperfecta
            </DialogTitle>
            <p className="text-base font-normal mt-2" style={{ color: '#052c4e' }}>
              Vamos a ponerte en marcha.
            </p>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-6">
              Inicia sesión o regístrate para guardar las búsquedas, crear alertas de precios y ver las ofertas privadas, entre otras opciones.
            </p>

            <div className="space-y-3">
              {/* Google Button */}
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3 text-base font-normal hover:bg-gray-50"
                onClick={() => {/* TODO: Google auth */}}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>

              {/* Apple Button */}
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3 text-base font-normal hover:bg-gray-50"
                onClick={() => {/* TODO: Apple auth */}}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>

              {/* Email Button */}
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3 text-base font-normal hover:bg-gray-50"
                onClick={() => {/* TODO: Email auth */}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Continuar con email
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
              Al añadir tu correo electrónico aceptas nuestros{' '}
              <a href="#" className="underline" style={{ color: '#3ccca4' }}>Términos y condiciones</a>{' '}
              y nuestra{' '}
              <a href="#" className="underline" style={{ color: '#3ccca4' }}>Política de privacidad</a>.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
