import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Bus, Bed, Sun, MapPin } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

// Render plain text with **bold** markers (single light formatting helper)
const renderRich = (text) => {
  const parts = String(text).split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i}>{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
};

const labels = {
  es: {
    tipsTitle: (dest) => `Consejos para tu viaje a ${dest}`,
    transport: "Transporte",
    whereToStay: "Dónde alojarse",
    bestTimes: "Mejores momentos del día",
    ctaEyebrow: "Atajo",
    ctaTitle: "¿Prefieres que te lo organicemos automáticamente?",
    ctaText: "Dinos dónde vas y en segundos te montamos un plan como este, adaptado a ti.",
    ctaButton: "Planificar mi viaje",
    altLink: "Read this guide in English",
    dayPrefix: (n) => `Día ${n}`,
  },
  en: {
    tipsTitle: (dest) => `Travel tips for ${dest}`,
    transport: "Transport",
    whereToStay: "Where to stay",
    bestTimes: "Best times of day",
    ctaEyebrow: "Shortcut",
    ctaTitle: "Want us to plan it for you?",
    ctaText: "Tell us where you're going and we'll build a trip like this in seconds, tailored to you.",
    ctaButton: "Plan my trip",
    altLink: "Léelo en español",
    dayPrefix: (n) => `Day ${n}`,
  },
};

const DayBlock = ({ index, title, periods, lang }) => (
  <article className="mb-10">
    <h2
      className="text-2xl md:text-3xl font-bold mb-2 font-heading"
      style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
    >
      {labels[lang].dayPrefix(index + 1)}
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

export default function DestinationItinerary({ data }) {
  const lang = data.lang;
  const L = labels[lang];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang={lang} />
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <link rel="canonical" href={lang === "es" ? data.esUrl : data.enUrl} />
        <link rel="alternate" hrefLang="es" href={data.esUrl} />
        <link rel="alternate" hrefLang="en" href={data.enUrl} />
        <link rel="alternate" hrefLang="x-default" href={data.esUrl} />
        <meta
          property="og:locale"
          content={lang === "es" ? "es_ES" : "en_US"}
        />
        <meta
          property="og:locale:alternate"
          content={lang === "es" ? "en_US" : "es_ES"}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.description} />
        <meta
          property="og:url"
          content={lang === "es" ? data.esUrl : data.enUrl}
        />
        <meta property="og:site_name" content="Visítalo" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={data.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: data.title.replace(" | Visítalo", ""),
            description: data.description,
            inLanguage: lang,
            author: { "@type": "Organization", name: "Visítalo" },
            publisher: {
              "@type": "Organization",
              name: "Visítalo",
              url: "https://visitalo.es",
            },
            mainEntityOfPage: lang === "es" ? data.esUrl : data.enUrl,
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
              {data.eyebrow}
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold font-heading mb-6"
              style={{
                color: BRAND_BLUE,
                letterSpacing: "-0.02em",
                lineHeight: "1.1",
              }}
            >
              {data.h1Line1}
              <br />
              <span style={{ color: BRAND_GREEN }}>{data.h1Line2}</span>
            </h1>
            <div
              className="space-y-4 text-base md:text-lg text-gray-700"
              style={{ lineHeight: "1.7" }}
            >
              {data.intro.map((para, i) => (
                <p key={i}>{renderRich(para)}</p>
              ))}
            </div>
          </div>
        </section>

        {/* DAYS */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            {data.days.map((d, i) => (
              <DayBlock
                key={i}
                index={i}
                title={d.title}
                periods={d.periods}
                lang={lang}
              />
            ))}
          </div>
        </section>

        {/* TIPS */}
        <section className="bg-gray-50 py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
            >
              {L.tipsTitle(data.eyebrow.replace(/^Itinerario de |^.* itinerary$/i, "").trim() || "")}
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
                  {L.transport}
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  {data.tips.transport}
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
                  {L.whereToStay}
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  {data.tips.whereToStay}
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
                  {L.bestTimes}
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  {data.tips.bestTimes}
                </p>
              </div>
            </div>

            {data.closingPara ? (
              <p
                className="text-sm text-gray-600 mt-8"
                style={{ lineHeight: "1.7" }}
              >
                {renderRich(data.closingPara)}
              </p>
            ) : null}
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
                {L.ctaEyebrow}
              </span>
              <h2
                className="text-2xl md:text-4xl font-bold mb-4 font-heading text-white"
                style={{ letterSpacing: "-0.02em", lineHeight: "1.15" }}
              >
                {L.ctaTitle}
              </h2>
              <p
                className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto"
                style={{ lineHeight: "1.6" }}
              >
                {L.ctaText}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid={`cta-plan-trip-${lang}`}
              >
                {L.ctaButton}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              <MapPin
                className="inline w-3.5 h-3.5 mr-1 -mt-0.5"
                style={{ color: BRAND_GREEN }}
              />
              <Link
                to={lang === "es" ? `/${seoSlugFromUrl(data.enUrl)}` : `/${seoSlugFromUrl(data.esUrl)}`}
                className="hover:underline"
                style={{ color: BRAND_BLUE }}
              >
                {L.altLink}
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function seoSlugFromUrl(url) {
  return url.replace(/^https?:\/\/[^/]+\//, "");
}
