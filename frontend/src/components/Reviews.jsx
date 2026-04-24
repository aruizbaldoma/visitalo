import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const Reviews = () => {
  const { t } = useTranslation();

  const reviews = [
    {
      id: "r1",
      quote: t("reviews.items.r1.quote"),
      author: t("reviews.items.r1.author"),
      meta: t("reviews.items.r1.meta"),
    },
    {
      id: "r2",
      quote: t("reviews.items.r2.quote"),
      author: t("reviews.items.r2.author"),
      meta: t("reviews.items.r2.meta"),
    },
    {
      id: "r3",
      quote: t("reviews.items.r3.quote"),
      author: t("reviews.items.r3.author"),
      meta: t("reviews.items.r3.meta"),
    },
  ];

  return (
    <section
      className="bg-white py-12 md:py-20 px-4"
      data-testid="reviews-section"
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
        <div className="mb-10 md:mb-14 max-w-2xl">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
          >
            {t("reviews.eyebrow")}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold font-heading"
            style={{
              color: BRAND_BLUE,
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
            }}
          >
            {t("reviews.titleLine1")}
            <br />
            <span style={{ color: BRAND_GREEN }}>
              {t("reviews.titleLine2")}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="bg-gray-50 rounded-2xl p-6 md:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#3ccca4]/30 flex flex-col"
              data-testid={`review-${review.id}`}
            >
              {/* Stars */}
              <div
                className="flex items-center gap-0.5 mb-4"
                aria-label="5 stars"
                data-testid={`review-${review.id}-stars`}
              >
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4"
                    style={{
                      color: BRAND_GREEN,
                      fill: BRAND_GREEN,
                    }}
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-[15px] md:text-base text-gray-700 flex-1"
                style={{ lineHeight: "1.6" }}
              >
                {`“${review.quote}”`}
              </p>

              {/* Author + meta */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p
                  className="text-sm font-semibold"
                  style={{ color: BRAND_BLUE }}
                >
                  {review.author}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{review.meta}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
