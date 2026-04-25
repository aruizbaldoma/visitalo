import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const TripExamples = () => {
  const { t, i18n } = useTranslation();
  const isEN = (i18n.language || "es").toLowerCase().startsWith("en");
  const destinosPath = isEN ? "/destinations" : "/destinos";

  // The daily breakdown items come from i18n (arrays), one per trip.
  const trips = [
    {
      id: "barcelona",
      destination: t("examples.trips.barcelona.destination"),
      duration: t("examples.trips.barcelona.duration"),
      days: t("examples.trips.barcelona.days", { returnObjects: true }),
    },
    {
      id: "rome",
      destination: t("examples.trips.rome.destination"),
      duration: t("examples.trips.rome.duration"),
      days: t("examples.trips.rome.days", { returnObjects: true }),
    },
    {
      id: "japan",
      destination: t("examples.trips.japan.destination"),
      duration: t("examples.trips.japan.duration"),
      days: t("examples.trips.japan.days", { returnObjects: true }),
    },
  ];

  return (
    <section
      className="bg-gray-50 py-12 md:py-20 px-4"
      data-testid="examples-section"
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
        <div className="mb-10 md:mb-14 max-w-2xl">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
          >
            {t("examples.eyebrow")}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold font-heading"
            style={{
              color: BRAND_BLUE,
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            {t("examples.titleLine1")}
            <br />
            <span style={{ color: BRAND_GREEN }}>
              {t("examples.titleLine2")}
            </span>
          </h2>
          <p
            className="mt-4 text-base md:text-lg text-gray-600 max-w-xl"
            style={{ lineHeight: "1.6" }}
          >
            {t("examples.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {trips.map((trip) => (
            <article
              key={trip.id}
              className="bg-white rounded-2xl p-6 md:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#3ccca4]/30 flex flex-col"
              data-testid={`example-trip-${trip.id}`}
            >
              {/* Destination + duration pill on the same line */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <h3
                  className="text-2xl md:text-[26px] font-bold font-heading flex items-center gap-2 min-w-0"
                  style={{ color: BRAND_BLUE, letterSpacing: "-0.01em" }}
                >
                  <MapPin
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: BRAND_GREEN }}
                    strokeWidth={2.2}
                  />
                  <span className="truncate">{trip.destination}</span>
                </h3>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(60, 204, 164, 0.14)",
                    color: BRAND_GREEN,
                  }}
                >
                  <Calendar className="w-3 h-3" strokeWidth={2.2} />
                  {trip.duration}
                </span>
              </div>

              {/* Days breakdown */}
              <ul className="space-y-3 flex-1">
                {Array.isArray(trip.days) &&
                  trip.days.map((dayItem, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 text-[11px] font-bold uppercase tracking-widest mt-0.5 min-w-[70px]"
                        style={{
                          color: BRAND_GREEN,
                          letterSpacing: "0.12em",
                        }}
                      >
                        {dayItem.label}
                      </span>
                      <span
                        className="text-sm text-gray-600"
                        style={{ lineHeight: "1.55" }}
                      >
                        {dayItem.plan}
                      </span>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>

        {/* CTA: Ver más destinos */}
        <div className="mt-10 md:mt-14 flex justify-center">
          <Link
            to={destinosPath}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
            data-testid="examples-view-more-button"
          >
            {t("examples.viewMoreCta")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
