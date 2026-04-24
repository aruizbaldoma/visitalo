import {
  Zap,
  Eye,
  SlidersHorizontal,
  Crown,
  ArrowRight,
  Landmark,
  Wine,
  Waves,
  UtensilsCrossed,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { ItinerarySearchBar } from "./ItinerarySearchBar";
import { useAuth } from "../contexts/AuthContext";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const HeroItinerary = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const { user, isAuthenticated } = useAuth();
  const isPaidPlus = !!user?.subscription_active;

  const handlePlusClick = () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event("visitalo:open-auth"));
      return;
    }
    // Autenticado pero sin suscripción pagada → placeholder hasta integrar Stripe
    toast.info("Pasarela de pago próximamente", {
      description: "Estamos ultimando los detalles del checkout. Te avisaremos en cuanto esté listo.",
    });
  };
  const benefits = [
    {
      Icon: Zap,
      eyebrow: "Rapidez",
      title: "Despídete del FOMO en segundos.",
      text: "Olvídate de perder 3 noches entre pestañas, foros y Excels. Tu ruta está lista antes de que termines el café.",
    },
    {
      Icon: Eye,
      eyebrow: "Descubrimiento",
      title: "Rutas sin puntos ciegos.",
      text: "Cruzamos los spots virales con los rincones que solo conocen los locales. Visitas lo imprescindible y descubres lo que casi nadie encuentra.",
    },
    {
      Icon: SlidersHorizontal,
      eyebrow: "Personalización",
      title: "Tu viaje, tu vibra.",
      text: "¿Más de brunch lento o ruta sin parar? ¿Playa chill o museos hasta cerrar? Lo montamos a tu medida, sin clichés turísticos.",
    },
  ];

  const handleScrollToSearch = () => {
    document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* HERO */}
      <div className="relative bg-white py-10 md:py-14 px-4" id="hero-search">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="text-left mb-8 md:mb-10">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.03em", lineHeight: "1.05" }}
              data-testid="hero-title"
            >
              Visítalo todo.
              <br />
              <span style={{ color: BRAND_GREEN }}>No te dejes nada atrás.</span>
            </h1>
            <p
              className="text-base md:text-lg text-gray-600 max-w-2xl"
              style={{ lineHeight: "1.6" }}
              data-testid="hero-subtitle"
            >
              Tu próximo viaje, montado en segundos. Sin foros, sin Excel, sin dramas.
              Solo hacer la maleta.
            </p>
          </div>

          <ItinerarySearchBar
            onSearch={onSearch}
            onOpenDetails={onOpenDetails}
            onSearchDataChange={onSearchDataChange}
          />
        </div>

        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${BRAND_GREEN} 0%, transparent 50%),
                         radial-gradient(circle at 80% 50%, ${BRAND_BLUE} 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* 3 BENEFICIOS */}
      <section className="bg-white py-12 md:py-20 px-4" data-testid="benefits-section">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="mb-10 md:mb-14 max-w-2xl">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
            >
              ¿Por qué Visítalo?
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em", lineHeight: "1.1" }}
            >
              Planificar viajes era un rollo.
              <br />
              <span style={{ color: BRAND_GREEN }}>Lo hemos arreglado.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {benefits.map(({ Icon, eyebrow, title, text }) => (
              <div
                key={eyebrow}
                className="bg-gray-50 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-[#3ccca4]/30"
                data-testid={`benefit-card-${eyebrow.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: "rgba(60, 204, 164, 0.14)" }}
                >
                  <Icon className="w-7 h-7" style={{ color: BRAND_GREEN }} strokeWidth={2.2} />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: BRAND_GREEN, letterSpacing: "0.16em" }}
                >
                  {eyebrow}
                </span>
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

      {/* SECCIÓN PLUS — solo visible para visitantes, usuarios Basic y PLUS gratuito.
          Oculta para suscriptores de pago activos (subscription_active === true). */}
      {!isPaidPlus && (
      <section
        className="relative py-14 md:py-20 px-4 overflow-hidden"
        style={{ backgroundColor: BRAND_BLUE }}
        data-testid="plus-upsell-section"
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: BRAND_GREEN }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: BRAND_GREEN }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{ backgroundColor: "rgba(60, 204, 164, 0.18)" }}
              >
                <Crown className="w-4 h-4" style={{ color: BRAND_GREEN }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: BRAND_GREEN, letterSpacing: "0.16em" }}
                >
                  Visítalo PLUS
                </span>
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold font-heading text-white mb-5"
                style={{ letterSpacing: "-0.02em", lineHeight: "1.05" }}
                data-testid="plus-title"
              >
                Desbloquea el
                <br />
                <span style={{ color: BRAND_GREEN }}>Modo Dios.</span>
              </h2>
              <p
                className="text-base md:text-lg mb-7"
                style={{ color: "rgba(255,255,255,0.78)", lineHeight: "1.65" }}
              >
                Hoteles boutique que no encuentras en las webs de siempre. Casas rurales mágicas.
                Restaurantes con alma. Actividades secretas. Todo lo bueno, solo para los que van en serio.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Alojamientos únicos (boutique, rural, premium)",
                  "Actividades curadas que nadie más te va a enseñar",
                  "Itinerarios sin límites, personalización al 100%",
                  "Sin ads. Sin ruido. Solo tu viaje.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/85 text-sm md:text-base">
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      <Check className="w-3 h-3" style={{ color: BRAND_BLUE }} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={handlePlusClick}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all hover:scale-[1.03] hover:shadow-xl"
                  style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                  data-testid="plus-cta-button"
                >
                  Unirme a PLUS
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="text-white/70 text-sm">
                  <span className="text-white font-bold text-lg">1€ / mes</span>
                  <span className="mx-2 opacity-60">·</span>
                  cancela cuando quieras
                </div>
              </div>
            </div>

            {/* Preview card */}
            <div className="relative hidden lg:block">
              <div
                className="rounded-3xl p-8 backdrop-blur-xl border border-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
                  >
                    PLUS · Preview
                  </span>
                  <Crown className="w-5 h-5" style={{ color: BRAND_GREEN }} />
                </div>
                {[
                  { title: "Casa rural en la Alpujarra", meta: "Única · Sin masificación" },
                  { title: "Cena privada en Lisboa", meta: "Solo PLUS" },
                  { title: "Hotel boutique · Cinque Terre", meta: "Selección única" },
                ].map((row) => (
                  <div
                    key={row.title}
                    className="flex items-center justify-between py-4 border-b border-white/10 last:border-0"
                  >
                    <div>
                      <div className="text-white font-semibold text-sm md:text-base">{row.title}</div>
                      <div className="text-white/50 text-xs mt-0.5">{row.meta}</div>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "rgba(60, 204, 164, 0.18)", color: BRAND_GREEN }}
                    >
                      PLUS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ACTIVIDADES */}
      <section className="bg-white py-14 md:py-20 px-4" data-testid="activities-hook-section">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
              >
                Actividades
              </span>
              <h2
                className="text-3xl md:text-5xl font-bold font-heading mb-5"
                style={{ color: BRAND_BLUE, letterSpacing: "-0.02em", lineHeight: "1.05" }}
                data-testid="activities-title"
              >
                Más que ver.
                <br />
                <span style={{ color: BRAND_GREEN }}>Para vivir.</span>
              </h2>
              <p
                className="text-base md:text-lg text-gray-600 max-w-xl mb-8"
                style={{ lineHeight: "1.65" }}
              >
                Reserva actividades brutales directamente desde tu itinerario. Sin saltar
                entre 15 webs, sin precios inflados, sin letra pequeña. Todo en un scroll.
              </p>
              <button
                onClick={handleScrollToSearch}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-base transition-all hover:scale-[1.03] hover:shadow-lg"
                style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
                data-testid="activities-cta-button"
              >
                Montar mi plan
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { Icon: Landmark, tag: "Top 1%", title: "Tour secreto por la Alhambra" },
                  { Icon: Wine, tag: "Solo PLUS", title: "Cena maridada en La Rioja" },
                  { Icon: Waves, tag: "Solo aquí", title: "Kayak al atardecer · Ibiza" },
                  { Icon: UtensilsCrossed, tag: "Tendencia", title: "Street food tour · Nápoles" },
                ].map((act, idx) => {
                  const { Icon } = act;
                  return (
                    <div
                      key={act.title}
                      className={`rounded-2xl p-5 border border-gray-100 bg-gray-50 hover:shadow-lg transition-all ${
                        idx % 2 === 1 ? "md:translate-y-6" : ""
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                        style={{ backgroundColor: "rgba(60, 204, 164, 0.14)" }}
                      >
                        <Icon className="w-5 h-5" style={{ color: BRAND_GREEN }} />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest mb-2 block"
                        style={{ color: BRAND_GREEN, letterSpacing: "0.14em" }}
                      >
                        {act.tag}
                      </span>
                      <div className="text-sm font-semibold" style={{ color: BRAND_BLUE }}>
                        {act.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
