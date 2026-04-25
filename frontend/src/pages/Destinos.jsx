import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Calendar, Check } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getAllDestinations } from "../data/seoItineraries";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const COPY = {
  es: {
    htmlLang: "es",
    canonical: "https://visitalo.es/destinos",
    altUrl: "https://visitalo.es/destinations",
    title: "Itinerarios y guías de viaje día a día | Visítalo",
    description:
      "Itinerarios de viaje organizados día a día: Roma, París, Tokio, Bali y más. Guías reales para que no pierdas tiempo planificando.",
    eyebrow: "Itinerarios listos",
    h1Line1: "Encuentra tu",
    h1Line2: "itinerario perfecto.",
    subtitle:
      "Guías de viaje reales, organizadas día a día y listas para usar.",
    ctaTop: "Planificar mi viaje",
    filterAll: "Todos",
    filterShort: "Escapadas (2–3 días)",
    filterMedium: "Viajes medios (4–7 días)",
    filterLong: "Viajes largos (10–14 días)",
    cardCta: "Ver itinerario",
    seoTitle: "Guías de viaje listas para usar",
    seoText: [
      "Planificar un viaje puede llevar horas. Aquí tienes itinerarios organizados día a día para que no pierdas tiempo y no te dejes nada importante.",
      "Cada guía está pensada para aprovechar al máximo cada destino, combinando lo imprescindible con planes que realmente merecen la pena.",
    ],
    finalEyebrow: "Atajo",
    finalTitle: "¿Prefieres que te lo organicemos automáticamente?",
    finalText:
      "Dinos dónde vas y en segundos te montamos un plan como este, adaptado a ti.",
    finalCta: "Crear mi viaje",
    altLink: "Read this in English",
    altLinkPath: "/destinations",
  },
  en: {
    htmlLang: "en",
    canonical: "https://visitalo.es/destinations",
    altUrl: "https://visitalo.es/destinos",
    title: "Travel itineraries and day-by-day guides | Visítalo",
    description:
      "Day-by-day travel itineraries: Rome, Paris, Tokyo, Bali and more. Real guides so you don't waste hours planning.",
    eyebrow: "Ready-to-use guides",
    h1Line1: "Find your",
    h1Line2: "perfect itinerary.",
    subtitle:
      "Real travel guides, organized day by day and ready to use.",
    ctaTop: "Plan my trip",
    filterAll: "All",
    filterShort: "Short trips (2–3 days)",
    filterMedium: "Mid trips (4–7 days)",
    filterLong: "Long trips (10–14 days)",
    cardCta: "See itinerary",
    seoTitle: "Travel guides ready to use",
    seoText: [
      "Planning a trip can eat hours. Here you'll find day-by-day itineraries so you don't waste time and don't miss anything that matters.",
      "Each guide is built to make the most of every destination, mixing the essentials with plans actually worth your time.",
    ],
    finalEyebrow: "Shortcut",
    finalTitle: "Want us to plan it for you?",
    finalText:
      "Tell us where you're going and we'll build a trip like this in seconds, tailored to you.",
    finalCta: "Build my trip",
    altLink: "Léelo en español",
    altLinkPath: "/destinos",
  },
};

const FILTER_OPTIONS = [
  { id: "all", lengthMatch: null },
  { id: "short", lengthMatch: "short" },
  { id: "medium", lengthMatch: "medium" },
  { id: "long", lengthMatch: "long" },
];

function DestinationCard({ d, lang, ctaLabel }) {
  return (
    <article
      className="bg-white rounded-2xl p-6 md:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#3ccca4]/30 flex flex-col"
      data-testid={`destino-card-${d.id}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3
          className="text-2xl font-bold font-heading flex items-center gap-2 min-w-0"
          style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
        >
          <MapPin
            className="w-5 h-5 flex-shrink-0"
            style={{ color: BRAND_GREEN }}
            strokeWidth={2.2}
          />
          <span className="truncate">{d.destinationName}</span>
        </h3>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 flex-shrink-0"
          style={{
            backgroundColor: "rgba(60, 204, 164, 0.14)",
            color: BRAND_GREEN,
          }}
        >
          <Calendar className="w-3 h-3" strokeWidth={2.2} />
          {d.durationLabel}
        </span>
      </div>

      <ul className="space-y-2 flex-1 mb-5">
        {d.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <Check
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: BRAND_GREEN }}
              strokeWidth={2.2}
            />
            <span style={{ lineHeight: "1.5" }}>{h}</span>
          </li>
        ))}
      </ul>

      <Link
        to={`/${d.slug}`}
        className="inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-md transition-all border-2"
        style={{
          color: BRAND_BLUE,
          borderColor: "rgba(60,204,164,0.4)",
          backgroundColor: "white",
        }}
        data-testid={`destino-cta-${d.id}-${lang}`}
      >
        <span>{ctaLabel}</span>
        <ArrowRight className="w-4 h-4" style={{ color: BRAND_GREEN }} />
      </Link>
    </article>
  );
}

export default function Destinos({ lang = "es" }) {
  const C = COPY[lang];
  const allDestinations = useMemo(() => getAllDestinations(lang), [lang]);
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    const target = FILTER_OPTIONS.find((o) => o.id === filter)?.lengthMatch;
    if (!target) return allDestinations;
    return allDestinations.filter((d) => d.tripLength === target);
  }, [filter, allDestinations]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang={C.htmlLang} />
        <title>{C.title}</title>
        <meta name="description" content={C.description} />
        <link rel="canonical" href={C.canonical} />
        <link rel="alternate" hrefLang="es" href="https://visitalo.es/destinos" />
        <link rel="alternate" hrefLang="en" href="https://visitalo.es/destinations" />
        <link rel="alternate" hrefLang="x-default" href="https://visitalo.es/destinos" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={C.title} />
        <meta property="og:description" content={C.description} />
        <meta property="og:url" content={C.canonical} />
        <meta property="og:site_name" content="Visítalo" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: C.title,
            description: C.description,
            url: C.canonical,
            inLanguage: lang,
            hasPart: allDestinations.map((d) => ({
              "@type": "Article",
              headline: d.destinationName,
              url: `https://visitalo.es/${d.slug}`,
            })),
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
              {C.eyebrow}
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold font-heading mb-5"
              style={{
                color: BRAND_BLUE,
                letterSpacing: "-0.02em",
                lineHeight: "1.1",
              }}
            >
              {C.h1Line1}{" "}
              <span style={{ color: BRAND_GREEN }}>{C.h1Line2}</span>
            </h1>
            <p
              className="text-base md:text-lg text-gray-600 max-w-2xl mb-8"
              style={{ lineHeight: "1.6" }}
            >
              {C.subtitle}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all"
              style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
              data-testid={`destinos-hero-cta-${lang}`}
            >
              {C.ctaTop}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FILTERS */}
        <section className="py-8 md:py-10 px-4 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-2 md:px-6">
            <div className="flex flex-wrap gap-2 md:gap-3" data-testid="destinos-filters">
              {[
                { id: "all", label: C.filterAll },
                { id: "short", label: C.filterShort },
                { id: "medium", label: C.filterMedium },
                { id: "long", label: C.filterLong },
              ].map((opt) => {
                const active = filter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFilter(opt.id)}
                    className="px-4 py-2 text-sm font-semibold rounded-full transition-all border-2"
                    style={{
                      backgroundColor: active ? BRAND_GREEN : "white",
                      color: active ? BRAND_BLUE : "#475569",
                      borderColor: active ? BRAND_GREEN : "#e5e7eb",
                    }}
                    data-testid={`filter-${opt.id}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CARDS */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto px-2 md:px-6">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              style={{
                transition: "opacity 220ms ease-out",
              }}
              data-testid="destinos-grid"
            >
              {visible.map((d) => (
                <DestinationCard
                  key={d.id}
                  d={d}
                  lang={lang}
                  ctaLabel={C.cardCta}
                />
              ))}
            </div>
          </div>
        </section>

        {/* SEO TEXT */}
        <section className="bg-gray-50 py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto px-2 md:px-6">
            <h2
              className="text-2xl md:text-3xl font-bold mb-6 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
            >
              {C.seoTitle}
            </h2>
            <div className="space-y-4 text-base text-gray-700" style={{ lineHeight: "1.7" }}>
              {C.seoText.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
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
                {C.finalEyebrow}
              </span>
              <h2
                className="text-2xl md:text-4xl font-bold mb-4 font-heading text-white"
                style={{ letterSpacing: "-0.02em", lineHeight: "1.15" }}
              >
                {C.finalTitle}
              </h2>
              <p
                className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto"
                style={{ lineHeight: "1.6" }}
              >
                {C.finalText}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid={`destinos-final-cta-${lang}`}
              >
                {C.finalCta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              <MapPin
                className="inline w-3.5 h-3.5 mr-1 -mt-0.5"
                style={{ color: BRAND_GREEN }}
              />
              <Link
                to={C.altLinkPath}
                className="hover:underline"
                style={{ color: BRAND_BLUE }}
              >
                {C.altLink}
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
