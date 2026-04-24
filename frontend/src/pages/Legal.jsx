import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArrowLeft, FileText, Lock, Cookie } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const COMPANY = "Visitalo.es";
const CONTACT_EMAIL = "info@visitalo.es";
const LAST_UPDATE = "Febrero 2026";

const PAGES = {
  terminos: {
    Icon: FileText,
    title: "Términos y Condiciones",
    description: "Condiciones de uso de la plataforma Visitalo.es.",
    sections: [
      {
        heading: "1. Objeto",
        body: `Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma ${COMPANY} (en adelante, "la Plataforma"), un servicio de planificación de viajes asistido por inteligencia artificial y marketplace de actividades turísticas. El uso de la Plataforma implica la aceptación plena de estos Términos.`,
      },
      {
        heading: "2. Titularidad",
        body: `La Plataforma es titularidad de ${COMPANY}. Para cualquier cuestión, puedes contactarnos en ${CONTACT_EMAIL}.`,
      },
      {
        heading: "3. Registro y Cuenta de Usuario",
        body: `El usuario puede registrarse mediante email y contraseña o a través de Google. El usuario se compromete a proporcionar información veraz y a mantener la confidencialidad de sus credenciales. Cualquier actividad realizada desde su cuenta será responsabilidad del usuario.`,
      },
      {
        heading: "4. Planes Basic y PLUS",
        body: `La Plataforma ofrece dos planes: (i) Basic, gratuito, con funcionalidad limitada; (ii) PLUS, de pago, que desbloquea personalización avanzada, actividades premium y alojamientos boutique. Los usuarios registrados disponen de 5 búsquedas PLUS gratuitas iniciales. La suscripción PLUS es de pago recurrente mensual, con renovación automática, cancelable en cualquier momento desde el panel del usuario.`,
      },
      {
        heading: "5. Uso Correcto",
        body: `El usuario se compromete a utilizar la Plataforma conforme a la ley, la buena fe y estos Términos. Queda prohibido el uso automatizado masivo (scraping), la suplantación de identidad o cualquier acción que perjudique el funcionamiento del servicio.`,
      },
      {
        heading: "6. Contenido Generado por IA",
        body: `Los itinerarios y recomendaciones se generan mediante modelos de inteligencia artificial. Aunque hacemos todo lo posible por ofrecer información precisa y útil, el usuario debe verificar datos críticos (horarios, precios, disponibilidad) antes de realizar reservas o desplazamientos. ${COMPANY} no se responsabiliza de errores, omisiones o cambios posteriores en la información proporcionada por terceros.`,
      },
      {
        heading: "7. Reservas y Marketplace de Actividades",
        body: `La Plataforma puede incluir enlaces o integraciones con proveedores externos (hoteles, actividades, transporte). Cualquier contratación con estos proveedores se rige por las condiciones de cada uno. ${COMPANY} actúa como intermediario y no es parte del contrato entre el usuario y el proveedor.`,
      },
      {
        heading: "8. Propiedad Intelectual",
        body: `Todos los contenidos, marcas, diseños y software de la Plataforma son propiedad de ${COMPANY} o de sus licenciantes. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.`,
      },
      {
        heading: "9. Responsabilidad",
        body: `${COMPANY} no se hace responsable de daños indirectos, lucro cesante o perjuicios derivados del uso del servicio. La responsabilidad total, en cualquier caso, se limita al importe efectivamente pagado por el usuario en los últimos 12 meses.`,
      },
      {
        heading: "10. Modificaciones",
        body: `${COMPANY} se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios sustanciales se notificarán a los usuarios registrados por email o en la Plataforma.`,
      },
      {
        heading: "11. Legislación y Jurisdicción",
        body: `Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales del domicilio del consumidor dentro del territorio español.`,
      },
    ],
  },
  privacidad: {
    Icon: Lock,
    title: "Política de Privacidad",
    description: "Cómo tratamos tus datos personales en Visitalo.es (RGPD).",
    sections: [
      {
        heading: "1. Responsable del Tratamiento",
        body: `${COMPANY}. Contacto: ${CONTACT_EMAIL}.`,
      },
      {
        heading: "2. Datos que Recogemos",
        body: `Recogemos: (i) datos de registro (email, nombre, contraseña cifrada o identificador de Google); (ii) preferencias de viaje proporcionadas por el usuario; (iii) itinerarios generados y guardados; (iv) datos técnicos (IP, navegador, dispositivo) por razones de seguridad; (v) datos de uso y cookies conforme a nuestra Política de Cookies.`,
      },
      {
        heading: "3. Finalidad del Tratamiento",
        body: `Tratamos tus datos para: (i) prestar el servicio de planificación y gestión de viajes; (ii) gestionar tu cuenta y suscripción PLUS; (iii) mejorar la Plataforma mediante análisis agregados; (iv) atender consultas; (v) enviar comunicaciones sobre el servicio y, si nos das tu consentimiento, comunicaciones comerciales.`,
      },
      {
        heading: "4. Base Legal",
        body: `La base legal es: (i) la ejecución del contrato (prestación del servicio); (ii) el consentimiento del usuario (marketing, cookies no esenciales); (iii) el interés legítimo (seguridad, mejora del producto); (iv) el cumplimiento de obligaciones legales.`,
      },
      {
        heading: "5. Conservación",
        body: `Conservamos tus datos mientras mantengas una cuenta activa y, posteriormente, durante los plazos legales aplicables (fiscales, contables). Puedes solicitar la supresión en cualquier momento.`,
      },
      {
        heading: "6. Destinatarios",
        body: `Compartimos datos únicamente con proveedores necesarios para prestar el servicio (hosting, pasarela de pago, analítica) bajo contratos de encargo de tratamiento. No vendemos tus datos a terceros. Podemos utilizar proveedores fuera del EEE con garantías adecuadas (cláusulas contractuales tipo).`,
      },
      {
        heading: "7. Tus Derechos",
        body: `Tienes derecho a acceder, rectificar, suprimir, oponerte, limitar el tratamiento y a la portabilidad de tus datos. Puedes ejercerlos escribiendo a ${CONTACT_EMAIL}. También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).`,
      },
      {
        heading: "8. Seguridad",
        body: `Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos: cifrado en tránsito (HTTPS), hashing de contraseñas, control de accesos y auditorías periódicas.`,
      },
      {
        heading: "9. Menores de Edad",
        body: `La Plataforma está dirigida a mayores de 16 años. No recogemos conscientemente datos de menores sin el consentimiento de sus padres o tutores.`,
      },
    ],
  },
  cookies: {
    Icon: Cookie,
    title: "Política de Cookies",
    description: "Qué cookies utilizamos y cómo puedes gestionarlas.",
    sections: [
      {
        heading: "1. ¿Qué son las cookies?",
        body: `Las cookies son pequeños archivos que se almacenan en tu dispositivo cuando visitas una web. Permiten que la web recuerde información sobre tu visita, como tu idioma preferido o tus preferencias de navegación.`,
      },
      {
        heading: "2. Tipos de cookies que utilizamos",
        body: `En ${COMPANY} utilizamos las siguientes categorías:\n\n• Cookies técnicas (esenciales): necesarias para el funcionamiento de la Plataforma (sesión, autenticación, carrito).\n• Cookies de preferencias: recuerdan tus elecciones (idioma, consentimiento de cookies).\n• Cookies analíticas: nos ayudan a entender cómo se usa la Plataforma (solo con tu consentimiento).\n• Cookies de marketing: usadas, solo con tu consentimiento, para mostrar publicidad relevante.`,
      },
      {
        heading: "3. Cookies de terceros",
        body: `Podemos utilizar servicios de terceros que establecen sus propias cookies (por ejemplo, Google Analytics, Google Sign-In). Estos servicios se rigen por sus propias políticas de privacidad.`,
      },
      {
        heading: "4. ¿Cómo gestionar las cookies?",
        body: `Puedes aceptar o rechazar las cookies no esenciales desde nuestro banner de consentimiento al entrar en la Plataforma. También puedes configurar tu navegador para bloquearlas o eliminarlas. Ten en cuenta que bloquear las cookies técnicas puede impedir el funcionamiento correcto del servicio.`,
      },
      {
        heading: "5. Cambios en esta política",
        body: `Esta Política puede actualizarse. Te recomendamos revisarla periódicamente. La última versión estará siempre disponible en esta página.`,
      },
    ],
  },
};

const NAV = [
  { slug: "terminos", label: "Términos", Icon: FileText },
  { slug: "privacidad", label: "Privacidad", Icon: Lock },
  { slug: "cookies", label: "Cookies", Icon: Cookie },
];

export default function Legal() {
  const { slug } = useParams();
  const page = PAGES[slug] || PAGES.terminos;
  const { Icon } = page;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{`${page.title} · Visitalo.es`}</title>
        <meta name="description" content={page.description} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <Header />

      {/* Hero */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ backgroundColor: BRAND_BLUE }}
        data-testid="legal-hero"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            data-testid="legal-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: "rgba(60, 204, 164, 0.18)" }}
          >
            <Icon className="w-4 h-4" style={{ color: BRAND_GREEN }} />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: BRAND_GREEN, letterSpacing: "0.16em" }}
            >
              Legal
            </span>
          </div>
          <h1
            className="text-3xl md:text-5xl font-bold font-heading text-white mb-3"
            style={{ letterSpacing: "-0.02em", lineHeight: "1.1" }}
            data-testid="legal-title"
          >
            {page.title}
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl">{page.description}</p>
          <p className="text-white/50 text-xs mt-4">Última actualización: {LAST_UPDATE}</p>
        </div>
      </section>

      {/* Nav tabs */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <nav className="flex gap-1 overflow-x-auto" data-testid="legal-tabs">
            {NAV.map(({ slug: s, label, Icon: TabIcon }) => {
              const active = slug === s || (!slug && s === "terminos");
              return (
                <Link
                  key={s}
                  to={`/legal/${s}`}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    active
                      ? "border-[#3ccca4] text-[#031834]"
                      : "border-transparent text-gray-500 hover:text-[#031834]"
                  }`}
                  data-testid={`legal-tab-${s}`}
                >
                  <TabIcon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-10 md:py-16" data-testid="legal-content">
        <article className="max-w-3xl mx-auto px-4 md:px-8 space-y-8">
          {page.sections.map((section) => (
            <div key={section.heading}>
              <h2
                className="text-xl md:text-2xl font-bold mb-3 font-heading"
                style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
              >
                {section.heading}
              </h2>
              <p
                className="text-gray-700 text-base whitespace-pre-line"
                style={{ lineHeight: "1.75" }}
              >
                {section.body}
              </p>
            </div>
          ))}

          <div
            className="rounded-2xl p-6 mt-10"
            style={{ backgroundColor: "rgba(60, 204, 164, 0.08)" }}
          >
            <p className="text-sm text-gray-700">
              ¿Dudas sobre este documento? Escríbenos a{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold"
                style={{ color: BRAND_BLUE }}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
