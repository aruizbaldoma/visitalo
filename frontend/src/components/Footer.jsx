import { Mail, MapPin, Plane, Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_barato-planner/artifacts/hb6f0otz_Logolargo.png"
                alt="RutasViaje"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu asistente inteligente para encontrar los mejores viajes desde España. 
              Ahorra tiempo y dinero en cada escapada.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-colors hover:opacity-80" style={{ backgroundColor: '#0A2540' }}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-colors hover:opacity-80" style={{ backgroundColor: '#0A2540' }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center transition-colors hover:opacity-80" style={{ backgroundColor: '#0A2540' }}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Inicio</a>
              </li>
              <li>
                <a href="#como-funciona" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Cómo funciona</a>
              </li>
              <li>
                <a href="#viajes" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Viajes</a>
              </li>
              <li>
                <a href="#contacto" className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>Contacto</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5" style={{ color: '#2ED3B7' }} />
                <a href="mailto:hola@rutabarata.com" className="transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                  hola@rutabarata.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#2ED3B7' }} />
                <span>Barcelona, España</span>
              </li>
              <li className="flex items-start gap-2">
                <Plane className="w-5 h-5 mt-0.5" style={{ color: '#2ED3B7' }} />
                <span>Viajes desde toda España</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} RutaBarata. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(107, 114, 128)'}>
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-500 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = '#2ED3B7'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(107, 114, 128)'}>
                Política de Privacidad
              </a>
            </div>
          </div>
          
          {/* Affiliate disclaimer */}
          <p className="text-xs text-gray-600 mt-4 text-center md:text-left">
            * RutaBarata puede recibir comisiones por reservas realizadas a través de enlaces de afiliados. 
            Esto no afecta el precio que pagas y nos ayuda a mantener el servicio gratuito.
          </p>
        </div>
      </div>
    </footer>
  );
};
