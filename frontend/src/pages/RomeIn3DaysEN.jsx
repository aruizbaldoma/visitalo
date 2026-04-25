import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Bus, Bed, Sun, MapPin } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const PAGE_URL = "https://visitalo.es/rome-in-3-days";
const ALT_URL = "https://visitalo.es/roma-en-3-dias";
const TITLE = "Rome in 3 days: complete day-by-day itinerary | Visítalo";
const DESCRIPTION =
  "Rome in 3 days itinerary with morning, afternoon and evening picks. Colosseum, Vatican, Trastevere and more. A clear plan, no fluff, ready to use.";

const DayBlock = ({ dayNumber, title, periods }) => (
  <article className="mb-10">
    <h2
      className="text-2xl md:text-3xl font-bold mb-2 font-heading"
      style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
    >
      Day {dayNumber} in Rome
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

export default function RomeIn3DaysEN() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang="en" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <link rel="alternate" hrefLang="en" href={PAGE_URL} />
        <link rel="alternate" hrefLang="es" href={ALT_URL} />
        <link rel="alternate" hrefLang="x-default" href={ALT_URL} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="es_ES" />
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
            headline: "Rome in 3 days: complete day-by-day itinerary",
            description: DESCRIPTION,
            inLanguage: "en",
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
              Rome itinerary
            </span>
            <h1
              className="text-3xl md:text-5xl font-bold font-heading mb-6"
              style={{
                color: BRAND_BLUE,
                letterSpacing: "-0.02em",
                lineHeight: "1.1",
              }}
            >
              Rome in 3 days:
              <br />
              <span style={{ color: BRAND_GREEN }}>
                a complete day-by-day itinerary.
              </span>
            </h1>
            <div
              className="space-y-4 text-base md:text-lg text-gray-700"
              style={{ lineHeight: "1.7" }}
            >
              <p>
                Rome doesn't reward rushing. In three days you won't see all of
                it — nobody really does — but you can absolutely leave the city
                feeling like you ate well, walked a lot and caught the spots
                that matter. The hard part isn't choosing. It's pacing.
              </p>
              <p>
                Planning a trip is exhausting. Tabs everywhere, six-year-old
                forum threads, maps that don't add up. So we put together this{" "}
                <strong>Rome in 3 days</strong> guide: a relaxed plan split
                into morning, afternoon and evening, with the things to do in
                Rome that are actually worth your time.
              </p>
              <p>
                And if you'd rather skip the work entirely, scroll to the
                bottom — we'll build you something like this in seconds, made
                for you.
              </p>
            </div>
          </div>
        </section>

        {/* DAYS */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            <DayBlock
              dayNumber={1}
              title="Historic center, Colosseum and a first walk through Trastevere."
              periods={[
                {
                  label: "Morning",
                  text:
                    "Open strong: Colosseum, Roman Forum and Palatine Hill. Book a timed-entry ticket so you skip the queue. Walk down to Piazza Venezia after and let the city settle in before the next stop.",
                },
                {
                  label: "Afternoon",
                  text:
                    "Light lunch around the center, then drift: Trevi Fountain, Pantheon, Piazza Navona. Yes, it's the touristy bit, but also the most cinematic. Eat at a small trattoria — not the first one with menus in six languages.",
                },
                {
                  label: "Evening",
                  text:
                    "Cross the Tiber and have dinner in Trastevere. Cobblestones, ivy, terraces. This is where Rome stops looking like a postcard and starts feeling like a neighborhood. Finish with a slow walk back.",
                },
              ]}
            />

            <DayBlock
              dayNumber={2}
              title="Vatican day with a sunset at one of the city's classic viewpoints."
              periods={[
                {
                  label: "Morning",
                  text:
                    "Vatican Museums. Book in advance, arrive early and put the phone away inside the Sistine Chapel. Then St. Peter's Basilica — if you climb the dome, you get one of the best views in town.",
                },
                {
                  label: "Afternoon",
                  text:
                    "Switch the tempo after the Vatican. Castel Sant'Angelo, then a slow stroll along Via dei Coronari toward the river. The trick this afternoon: don't fill the agenda. Leave room to sit.",
                },
                {
                  label: "Evening",
                  text:
                    "Catch sunset at the Pincio or the Giardino degli Aranci. Rome backlit, pines, domes. Dinner around the Pantheon and, if you've got the energy, one last gelato at Sant'Eustachio.",
                },
              ]}
            />

            <DayBlock
              dayNumber={3}
              title="Looser day: cafés, viewpoints and one last unhurried walk."
              periods={[
                {
                  label: "Morning",
                  text:
                    "Breakfast around Campo de' Fiori, then the Jewish Ghetto. It's one of the prettiest pockets in the city and the food is exceptional. Order the Roman-Jewish artichokes — you'll thank yourself.",
                },
                {
                  label: "Afternoon",
                  text:
                    "Villa Borghese for a slow recharge under the trees. Still want a museum? The Galleria Borghese has Berninis and Caravaggios you won't see in books. Reservation is non-negotiable.",
                },
                {
                  label: "Evening",
                  text:
                    "Close out in Monti, the bohemian quarter. Tiny shops, wine bars, locals. Dinner, a toast and the small staircase square. Rome knows how to say goodbye.",
                },
              ]}
            />
          </div>
        </section>

        {/* TIPS */}
        <section className="bg-gray-50 py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto px-2 md:px-6">
            <h2
              className="text-2xl md:text-3xl font-bold mb-8 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
            >
              Travel tips for Rome
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
                  Transport
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  Rome is a walking city. A lot. Bring proper shoes and forget
                  the metro for the historic center — most things sit close
                  together. For longer hops, buses or an Uber save you. A
                  weekly transport pass pays off if you stay outside the
                  center.
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
                  Where to stay
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  Trastevere if you want street life and atmosphere. Monti for
                  something more bohemian and quieter. The historic center
                  (Pantheon / Navona) is pricier but saves your feet daily.
                  Tighter budget? San Lorenzo or near Termini work well.
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
                  Best times of day
                </h3>
                <p
                  className="text-sm text-gray-700"
                  style={{ lineHeight: "1.6" }}
                >
                  Early hours hit different — the Colosseum and Vatican open
                  with fewer people. Save sunset for the viewpoints (Pincio,
                  Giardino degli Aranci, Gianicolo). And keep the night for
                  wandering. Rome after dark is a different city.
                </p>
              </div>
            </div>

            <p
              className="text-sm text-gray-600 mt-8"
              style={{ lineHeight: "1.7" }}
            >
              That's the spine of a solid <strong>Rome itinerary</strong>: a
              real <strong>3 days in Rome</strong>, no impossible marathons and
              no endless lists of things to do in Rome. Couple, friends or
              solo — set the rhythm yourself. The point is to live it, not to
              tick it off.
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
                Shortcut
              </span>
              <h2
                className="text-2xl md:text-4xl font-bold mb-4 font-heading text-white"
                style={{ letterSpacing: "-0.02em", lineHeight: "1.15" }}
              >
                Want us to plan it for you?
              </h2>
              <p
                className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto"
                style={{ lineHeight: "1.6" }}
              >
                Tell us where you're going and we'll build a trip like this in
                seconds, tailored to you.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="cta-plan-trip-en"
              >
                Plan my trip
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              <MapPin
                className="inline w-3.5 h-3.5 mr-1 -mt-0.5"
                style={{ color: BRAND_GREEN }}
              />
              <Link
                to="/roma-en-3-dias"
                className="hover:underline"
                style={{ color: BRAND_BLUE }}
              >
                Léelo en español
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
