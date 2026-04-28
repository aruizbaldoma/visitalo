import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  ShieldCheck,
  Users,
  Compass,
  Mail,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const COPY = {
  es: {
    htmlLang: "es",
    canonical: "https://visitalo.es/sobre",
    altUrl: "https://visitalo.es/about",
    title: "Sobre nosotros · Visitalo.es",
    description:
      "Visítalo nació para que planificar viajes deje de ser un rollo. Somos un equipo joven que viaja mucho y diseña itinerarios rápidos, claros y a tu medida.",
    eyebrow: "Sobre nosotros",
    h1Line1: "Detrás de Visítalo,",
    h1Line2: "un equipo que viaja (mucho).",
    intro:
      "Llevamos años perdiendo fines de semana enteros entre pestañas, foros y hojas de Excel. Cada viaje empezaba con la misma frase: \"a ver, ¿por dónde se empieza?\". Y siempre acabábamos igual: cansados antes de salir de casa.",
    introSecond:
      "Visítalo es nuestra forma de arreglarlo. Un planificador que entiende tu ritmo, te monta los días en segundos y te lleva directo a reservar lo que merece la pena. Sin foros eternos. Sin clichés turísticos. Sin dramas.",
    valuesEyebrow: "Lo que nos mueve",
    valuesTitle: "Lo que nos importa,",
    valuesTitleAlt: "y lo que no.",
    values: [
      {
        Icon: Compass,
        title: "Itinerarios con criterio",
        text: "No metemos planes de relleno. Cada parada está pensada para que el día fluya, mañana, tarde y noche.",
      },
      {
        Icon: Sparkles,
        title: "Tu rollo, no el de otro",
        text: "Más de brunch lento o de ruta sin parar; playa chill o museo hasta cerrar. Lo montamos a tu medida, sin clichés.",
      },
      {
        Icon: ShieldCheck,
        title: "Transparentes con la pasta",
        text: "Visítalo es gratis. Cuando reservas una actividad por nuestros enlaces, recibimos una pequeña comisión del proveedor. Tú no pagas más. Así se mantiene el servicio.",
      },
      {
        Icon: Users,
        title: "Equipo joven, manías de viajero",
        text: "Somos un grupo pequeño de gente que ha hecho muchos viajes y se ha equivocado en bastantes. Cada lección está dentro del producto.",
      },
    ],
    howEyebrow: "Cómo lo hacemos",
    howTitle: "Tecnología propia,",
    howTitleAlt: "experiencias verificadas.",
    howText:
      "Combinamos tecnología propia con partners de confianza (GetYourGuide, Booking y similares) para que cada plan tenga sentido. Tú nos dices a dónde y cuándo. Nosotros, el resto.",
    howBullets: [
      "Recomendaciones que cruzan lo imprescindible con lo que solo conocen los locales.",
      "Reservas centralizadas a través de operadores con licencia y soporte real.",
      "Soporte directo: si algo no encaja, escríbenos y lo arreglamos.",
    ],
    contactEyebrow: "Hablemos",
    contactTitle: "¿Una idea, una duda,",
    contactTitleAlt: "una colaboración?",
    contactText:
      "Estamos al otro lado del email. Tardamos poco en responder y nos encanta hablar de viajes.",
    contactCta: "info@visitalo.es",
    finalEyebrow: "Empieza tu próximo viaje",
    finalTitle: "¿Listo para",
    finalTitleAlt: "que te lo montemos?",
    finalText:
      "Dinos a dónde vas y en segundos te dejamos un plan a tu medida.",
    finalCta: "Crear mi viaje",
  },
  en: {
    htmlLang: "en",
    canonical: "https://visitalo.es/about",
    altUrl: "https://visitalo.es/sobre",
    title: "About us · Visitalo.es",
    description:
      "Visítalo was born to make trip planning suck less. We're a young team that travels a lot and builds fast, clear, tailor-made itineraries.",
    eyebrow: "About us",
    h1Line1: "Behind Visítalo,",
    h1Line2: "a team that travels (a lot).",
    intro:
      "We've spent years burning entire weekends between tabs, forums and spreadsheets. Every trip started with the same line: \"so… where do we even begin?\" And we always ended up the same way: tired before we'd even left home.",
    introSecond:
      "Visítalo is our way of fixing that. A planner that gets your pace, builds the days in seconds and takes you straight to book the stuff that's actually worth it. No endless forums. No tourist clichés. No drama.",
    valuesEyebrow: "What drives us",
    valuesTitle: "What we care about,",
    valuesTitleAlt: "and what we don't.",
    values: [
      {
        Icon: Compass,
        title: "Itineraries with taste",
        text: "No filler stops. Every spot is picked so the day flows — morning, afternoon and night.",
      },
      {
        Icon: Sparkles,
        title: "Your vibe, not someone else's",
        text: "Slow brunch or non-stop sightseeing; chill beach or museum till closing. We tailor it to you, no clichés.",
      },
      {
        Icon: ShieldCheck,
        title: "Honest about the money",
        text: "Visítalo is free. When you book an activity through our links, we earn a small commission from the partner. You don't pay more. That's how we keep the service running.",
      },
      {
        Icon: Users,
        title: "Young team, traveler quirks",
        text: "We're a small crew of people who've taken plenty of trips and made plenty of mistakes. Every lesson is built into the product.",
      },
    ],
    howEyebrow: "How we do it",
    howTitle: "Our own tech,",
    howTitleAlt: "verified experiences.",
    howText:
      "We combine our own technology with trusted partners (GetYourGuide, Booking and the like) so every plan makes sense. You tell us where and when. We handle the rest.",
    howBullets: [
      "Recommendations that mix the must-sees with the spots only locals know.",
      "Bookings handled through licensed operators with real customer support.",
      "Direct support: if something feels off, write to us and we'll fix it.",
    ],
    contactEyebrow: "Let's talk",
    contactTitle: "An idea, a question,",
    contactTitleAlt: "a collab?",
    contactText:
      "We're a quick email away. We reply fast and we love talking about travel.",
    contactCta: "info@visitalo.es",
    finalEyebrow: "Start your next trip",
    finalTitle: "Ready for us to",
    finalTitleAlt: "build it for you?",
    finalText:
      "Tell us where you're going and in seconds we'll drop a plan tailor-made for you.",
    finalCta: "Create my trip",
  },
};

export default function About({ lang = "es" }) {
  const c = COPY[lang] || COPY.es;
  const homePath = lang === "en" ? "/" : "/";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <html lang={c.htmlLang} />
        <title>{c.title}</title>
        <meta name="description" content={c.description} />
        <link rel="canonical" href={c.canonical} />
        <link rel="alternate" hrefLang="es" href="https://visitalo.es/sobre" />
        <link rel="alternate" hrefLang="en" href="https://visitalo.es/about" />
        <link rel="alternate" hrefLang="x-default" href="https://visitalo.es/sobre" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.description} />
        <meta property="og:url" content={c.canonical} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header />

      {/* HERO */}
      <section
        className="px-4 py-14 md:py-20"
        style={{ backgroundColor: BRAND_BLUE }}
        data-testid="about-hero"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-10">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
            data-testid="about-eyebrow"
          >
            {c.eyebrow}
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-heading text-white"
            style={{ letterSpacing: "-0.02em", lineHeight: "1.05" }}
            data-testid="about-h1"
          >
            {c.h1Line1}
            <br />
            <span style={{ color: BRAND_GREEN }}>{c.h1Line2}</span>
          </h1>
          <p
            className="text-base md:text-lg max-w-2xl mb-4"
            style={{ color: "rgba(255,255,255,0.82)", lineHeight: "1.65" }}
          >
            {c.intro}
          </p>
          <p
            className="text-base md:text-lg max-w-2xl"
            style={{ color: "rgba(255,255,255,0.82)", lineHeight: "1.65" }}
          >
            {c.introSecond}
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-white py-14 md:py-20 px-4" data-testid="about-values">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="mb-10 md:mb-14 max-w-2xl">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
            >
              {c.valuesEyebrow}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em", lineHeight: "1.1" }}
            >
              {c.valuesTitle}
              <br />
              <span style={{ color: BRAND_GREEN }}>{c.valuesTitleAlt}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {c.values.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="bg-gray-50 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#3ccca4]/30"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(60, 204, 164, 0.14)" }}
                >
                  <Icon className="w-6 h-6" style={{ color: BRAND_GREEN }} strokeWidth={2.2} />
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold mb-3 font-heading"
                  style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
                >
                  {title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base" style={{ lineHeight: "1.6" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE DO IT */}
      <section
        className="py-14 md:py-20 px-4"
        style={{ backgroundColor: "#f7faf9" }}
        data-testid="about-how"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
              >
                {c.howEyebrow}
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold font-heading mb-5"
                style={{ color: BRAND_BLUE, letterSpacing: "-0.02em", lineHeight: "1.1" }}
              >
                {c.howTitle}
                <br />
                <span style={{ color: BRAND_GREEN }}>{c.howTitleAlt}</span>
              </h2>
              <p className="text-gray-600 text-base md:text-lg" style={{ lineHeight: "1.65" }}>
                {c.howText}
              </p>
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-4">
                {c.howBullets.map((b) => (
                  <li
                    key={b}
                    className="bg-white rounded-2xl p-5 md:p-6 flex items-start gap-4 border border-gray-100"
                  >
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: "rgba(60, 204, 164, 0.14)" }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: BRAND_GREEN }} strokeWidth={2.4} />
                    </span>
                    <span className="text-gray-700 text-sm md:text-base" style={{ lineHeight: "1.6" }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-white py-14 md:py-20 px-4" data-testid="about-contact">
        <div className="max-w-4xl mx-auto px-4 md:px-10 text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
          >
            {c.contactEyebrow}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold font-heading mb-4"
            style={{ color: BRAND_BLUE, letterSpacing: "-0.02em", lineHeight: "1.1" }}
          >
            {c.contactTitle}
            <br />
            <span style={{ color: BRAND_GREEN }}>{c.contactTitleAlt}</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-7 max-w-xl mx-auto" style={{ lineHeight: "1.65" }}>
            {c.contactText}
          </p>
          <a
            href="mailto:info@visitalo.es"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            data-testid="about-contact-cta"
          >
            <Mail className="w-5 h-5" />
            {c.contactCta}
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="py-14 md:py-20 px-4"
        style={{ backgroundColor: BRAND_BLUE }}
        data-testid="about-final-cta"
      >
        <div className="max-w-4xl mx-auto px-4 md:px-10 text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
          >
            {c.finalEyebrow}
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold font-heading mb-4 text-white"
            style={{ letterSpacing: "-0.02em", lineHeight: "1.05" }}
          >
            {c.finalTitle}
            <br />
            <span style={{ color: BRAND_GREEN }}>{c.finalTitleAlt}</span>
          </h2>
          <p
            className="text-base md:text-lg mb-7 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.82)", lineHeight: "1.65" }}
          >
            {c.finalText}
          </p>
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all hover:scale-[1.03] hover:shadow-xl"
            style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            data-testid="about-final-button"
          >
            {c.finalCta}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
