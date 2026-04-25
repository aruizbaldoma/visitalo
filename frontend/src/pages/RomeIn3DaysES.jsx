import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Bus, Bed, Sun, MapPin } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const PAGE_URL = "https://visitalo.es/roma-en-3-dias";
const ALT_URL = "https://visitalo.es/rome-in-3-days";
const TITLE = "Roma en 3 días: itinerario completo día a día | Visítalo";
const DESCRIPTION =
  "Itinerario de Roma en 3 días con qué ver mañana, tarde y noche. Coliseo, Vaticano, Trastevere y más. Plan claro, sin liarte y listo para usar.";

const DayBlock = ({ dayNumber, title, periods }) => (
  <article className="mb-10">
    <h2
      className="text-2xl md:text-3xl font-bold mb-2 font-heading"
      style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
    >
      Día {dayNumber} en Roma
    </h2>
    <p className="text-base text-gray-600 mb-6" style={{ lineHeight: "1.6" }}>
      {title}
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {periods.map((p) => (
        <div
          key={p.label}
          className="bg-white rounded-2xl p-5 border border-gray-200"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: BRAND_GREEN, letterSpacing: "0.16em" }}
          >
            {p.label}
          </span>
          <p
            className="text-sm text-gray-700"
            style={{ lineHeight: "1.6" }}
          >
            {p.text}
          </p>
        </div>
      ))}
    </div>
  </article>
);

export default function RomeIn3DaysES() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang="es" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <link rel="alternate" hrefLang="es" href={PAGE_URL} />
        <link rel="alternate" hrefLang="en" href={ALT_URL} />
        <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:site_name" content="Visítalo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Roma en 3 días: itinerario completo día a día",
            description: DESCRIPTION,
            inLanguage: "es",
            author: { "@type": "Organization", name: "Visítalo" },
            publisher: {
              "@type": "Organization",
              name: "Visítalo",
              url: "https://visitalo.es",
            },
            mainEntityOfPage: PAGE_URL,
          })}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1 w-full">
        {/* HERO */}
        <section className="bg-gray-50 py-12 md:py-20 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
            >
              Itinerario de Roma
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold font-heading mb-6"
              style={{
                color: BRAND_BLUE,
                letterSpacing: "-0.02em",
                lineHeight: "1.1",
              }}
            >
              Roma en 3 días:
              <br />
              <span style={{ color: BRAND_GREEN }}>
                itinerario completo día a día.
              </span>
            </h1>
            <div
              className="space-y-4 text-base md:text-lg text-gray-700"
              style={{ lineHeight: "1.7" }}
            >
              <p>
                Roma es una ciudad que se vive con calma. En tres días no la
                ves entera (nadie lo hace), pero sí puedes salir con la
                sensación de haber comido bien, paseado mucho y visto lo
                imprescindible. Lo difícil no es elegir: es ordenar.
              </p>
              <p>
                Planificar un viaje cansa. Pestañas abiertas, foros de hace seis
                años, mapas que no encajan… Por eso hicimos este itinerario de{" "}
                <strong>Roma en 3 días</strong>: un plan que respira, con tres
                días repartidos en mañana, tarde y noche y los sitios que sí
                merecen la pena.
              </p>
              <p>
                Si quieres saltarte el lío, al final tienes la versión rápida:
                te montamos uno como este en segundos, adaptado a tu rollo.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENIDO DÍA A DÍA */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            <DayBlock
              dayNumber={1}
              title="Centro histórico, Coliseo y primer paseo por Trastevere."
              periods={[
                {
                  label: "Mañana",
                  text:
                    "Empieza fuerte: Coliseo, Foro Romano y Palatino. Reserva la entrada con horario para no hacer cola. Después, baja andando hasta Piazza Venezia y respira un poco antes de seguir.",
                },
                {
                  label: "Tarde",
                  text:
                    "Comida ligera por el centro y deja que la ciudad te lleve: Fontana di Trevi, Panteón, Piazza Navona. Es la parte más turística pero también la más cinematográfica. Para algo en una trattoria pequeña, no en la primera con menú en seis idiomas.",
                },
                {
                  label: "Noche",
                  text:
                    "Cruza al otro lado del Tíber y cena en Trastevere. Calles empedradas, hiedra, terrazas. Es donde Roma deja de parecer postal y empieza a ser barrio. Termina con un paseo sin rumbo.",
                },
              ]}
            />

            <DayBlock
              dayNumber={2}
              title="Día Vaticano y atardecer en uno de los miradores de la ciudad."
              periods={[
                {
                  label: "Mañana",
                  text:
                    "Vaticano. Reserva con antelación, llega pronto y olvida el móvil un rato dentro de la Capilla Sixtina. Después, San Pedro: la cúpula, si subes, te regala una de las mejores vistas de Roma.",
                },
                {
                  label: "Tarde",
                  text:
                    "Tras el Vaticano, cambia de ritmo. Castel Sant'Angelo y un paseo lento por Via dei Coronari hasta el Tíber. Aquí lo importante es no llenar la agenda: deja huecos para sentarte.",
                },
                {
                  label: "Noche",
                  text:
                    "Atardecer en el Pincio o en el Giardino degli Aranci. Roma a contraluz, los pinos, las cúpulas. Cena por el barrio del Panteón y, si te queda cuerda, un último helado por Sant'Eustachio.",
                },
              ]}
            />

            <DayBlock
              dayNumber={3}
              title="Día más libre: cafés, miradores y un último paseo sin prisas."
              periods={[
                {
                  label: "Mañana",
                  text:
                    "Mercado de Campo de' Fiori para desayunar tranquilo y barrio judío (Ghetto Ebraico) después. Es uno de los rincones más bonitos y con mejor comida de la ciudad. Pide alcachofas a la judía, no te arrepientes.",
                },
                {
                  label: "Tarde",
                  text:
                    "Villa Borghese para descansar entre árboles. Si te quedan ganas de museos, la Galleria Borghese tiene Berninis y Caravaggios que no se ven en libros. Reserva sí o sí.",
                },
                {
                  label: "Noche",
                  text:
                    "Cierra el viaje en Monti, el barrio bohemio. Tiendas pequeñas, vinerías, gente local. Cena, brindis y plaza con escalinata. Roma despide bien.",
                },
              ]}
            />
          </div>
        </section>

        {/* CONSEJOS */}
        <section className="bg-gray-50 py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
            >
              Consejos para tu viaje a Roma
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <Bus
                  className="w-6 h-6 mb-3"
                  style={{ color: BRAND_GREEN }}
                  strokeWidth={1.8}
                />
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: BRAND_BLUE }}
                >
                  Transporte
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  Lo de Roma se camina. Mucho. Lleva calzado cómodo y olvida el
                  metro para los puntos del centro. Para distancias largas, el
                  bus o un Uber te salvan. La tarjeta semanal de transporte
                  compensa si vas a moverte fuera del centro.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <Bed
                  className="w-6 h-6 mb-3"
                  style={{ color: BRAND_GREEN }}
                  strokeWidth={1.8}
                />
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: BRAND_BLUE }}
                >
                  Dónde alojarse
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  Trastevere si quieres ambiente y vida en la calle. Monti si
                  buscas algo más bohemio y tranquilo. El centro histórico
                  (Panteón / Navona) es caro pero te ahorra metros cada día. Si
                  vas justo de presupuesto, San Lorenzo o Termini funcionan.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <Sun
                  className="w-6 h-6 mb-3"
                  style={{ color: BRAND_GREEN }}
                  strokeWidth={1.8}
                />
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: BRAND_BLUE }}
                >
                  Mejores momentos del día
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  Las primeras horas son mágicas: el Coliseo y el Vaticano
                  abren con menos gente. Reserva el atardecer para los
                  miradores (Pincio, Giardino degli Aranci, Gianicolo). Y la
                  noche, para perderte por callejones — Roma por la noche es
                  otra ciudad.
                </p>
              </div>
            </div>

            <p
              className="text-sm text-gray-600 mt-8"
              style={{ lineHeight: "1.7" }}
            >
              Con este plan tienes lo básico para que tu viaje a Roma fluya: un{" "}
              <strong>itinerario Roma 3 días</strong> realista, sin
              maratones imposibles ni listas infinitas de qué ver en Roma. Si
              vas en pareja, con amigos o solo, ajústalo a tu ritmo: la idea es
              vivirla, no completarla.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-3xl mx-auto px-2 md:px-6">
            <div
              className="rounded-3xl p-8 md:p-12 text-center"
              style={{
                background:
                  "linear-gradient(135deg, #031834 0%, #0a2a52 100%)",
              }}
            >
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
              >
                Atajo
              </span>
              <h2
                className="text-2xl md:text-4xl font-bold mb-4 font-heading text-white"
                style={{ letterSpacing: "-0.02em", lineHeight: "1.15" }}
              >
                ¿Prefieres que te lo organicemos automáticamente?
              </h2>
              <p
                className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto"
                style={{ lineHeight: "1.6" }}
              >
                Dinos dónde vas y en segundos te montamos un plan como este,
                adaptado a ti.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="cta-plan-trip-es"
              >
                Planificar mi viaje
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Hreflang link in body for users */}
            <p className="text-center text-sm text-gray-500 mt-6">
              <MapPin
                className="inline w-3.5 h-3.5 mr-1 -mt-0.5"
                style={{ color: BRAND_GREEN }}
              />
              <Link
                to="/rome-in-3-days"
                className="hover:underline"
                style={{ color: BRAND_BLUE }}
              >
                Read this guide in English
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
