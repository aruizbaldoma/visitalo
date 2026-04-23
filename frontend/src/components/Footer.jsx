import { Mail, Instagram, Twitter } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3bc8a1";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contacto"
      className="bg-white border-t border-gray-100"
      style={{ color: BRAND_BLUE }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/visitalo-logo.png"
                alt="Visitalo.es"
                className="h-10 w-auto"
                data-testid="footer-logo-img"
              />
            </div>
            <p className="text-sm mb-6 max-w-md opacity-80">
              Tu asistente inteligente para encontrar los mejores viajes desde España.
              Ahorra tiempo y dinero en cada escapada.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/visitalo.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: BRAND_GREEN }}
                aria-label="Instagram"
                data-testid="footer-social-instagram"
              >
                <Instagram className="w-5 h-5" style={{ color: BRAND_BLUE }} />
              </a>
              <a
                href="https://x.com/visitalo_es"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: BRAND_GREEN }}
                aria-label="X (Twitter)"
                data-testid="footer-social-x"
              >
                <Twitter className="w-5 h-5" style={{ color: BRAND_BLUE }} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4 font-heading" style={{ color: BRAND_BLUE }}>
              Enlaces
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="opacity-80 hover:opacity-100 transition-opacity">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/blog" className="opacity-80 hover:opacity-100 transition-opacity">
                  Blog
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="opacity-80 hover:opacity-100 transition-opacity">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#contacto" className="opacity-80 hover:opacity-100 transition-opacity">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 font-heading" style={{ color: BRAND_BLUE }}>
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: BRAND_GREEN }}
                />
                <a
                  href="mailto:info@visitalo.es"
                  className="opacity-80 hover:opacity-100 transition-opacity break-all"
                  data-testid="footer-contact-email"
                >
                  info@visitalo.es
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs opacity-70">
              © {currentYear} Visitalo.es. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-xs">
              <a
                href="/legal/terminos"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                Términos y Condiciones
              </a>
              <a
                href="/legal/privacidad"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                Política de Privacidad
              </a>
              <a
                href="/legal/cookies"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                Política de Cookies
              </a>
            </div>
          </div>

          <p className="text-xs opacity-60 mt-4 text-center md:text-left">
            * Visitalo.es puede recibir comisiones por reservas realizadas a través de
            enlaces de afiliados. Esto no afecta al precio que pagas y nos ayuda a
            mantener el servicio gratuito.
          </p>
        </div>
      </div>
    </footer>
  );
};
