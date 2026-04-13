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
                src="https://customer-assets.emergentagent.com/job_dbdb8aee-0eaf-4856-9f23-61350fa97147/artifacts/hky0r2mi_ChatGPT%20Image%2013%20abr%202026%2C%2022_23_17.png"
                alt="RutaBarata"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu asistente inteligente para encontrar los mejores viajes desde España. 
              Ahorra tiempo y dinero en cada escapada.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="hover:text-orange-400 transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#como-funciona" className="hover:text-orange-400 transition-colors">Cómo funciona</a>
              </li>
              <li>
                <a href="#viajes" className="hover:text-orange-400 transition-colors">Viajes</a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-orange-400 transition-colors">Contacto</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-orange-400 mt-0.5" />
                <a href="mailto:hola@rutabarata.com" className="hover:text-orange-400 transition-colors">
                  hola@rutabarata.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-orange-400 mt-0.5" />
                <span>Barcelona, España</span>
              </li>
              <li className="flex items-start gap-2">
                <Plane className="w-5 h-5 text-orange-400 mt-0.5" />
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
              <a href="#" className="text-gray-500 hover:text-orange-400 transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-400 transition-colors">
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
