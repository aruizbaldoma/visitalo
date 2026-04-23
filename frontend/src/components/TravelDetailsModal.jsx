import {
  X,
  PlaneLanding,
  Hotel,
  Crown,
  Compass,
  Users,
  Wallet,
  Package as PackageIcon,
  MapPin,
  Waves,
  Anchor,
  Plane,
  Wind,
  PartyPopper,
  Landmark,
  Check,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const HOTEL_CATEGORIES = [
  { value: "standard", label: "Estándar", sub: "3-4 estrellas", plus: false },
  { value: "luxury", label: "Lujo", sub: "5 estrellas", plus: true },
  { value: "boutique", label: "Boutique", sub: "Pequeño y con encanto", plus: true },
  { value: "villa", label: "Villa privada", sub: "Para el grupo al completo", plus: true },
  { value: "apartment", label: "Apartamento de diseño", sub: "Como en casa, con estilo", plus: true },
  { value: "hostel", label: "Hostal con rollazo", sub: "Ambiente joven y social", plus: true },
];

const GROUP_OPTIONS = [
  { value: "solo", label: "Viaje solo" },
  { value: "pareja", label: "Pareja" },
  { value: "amigos", label: "Amigos" },
  { value: "familia", label: "Familia" },
];

const BUDGET_OPTIONS = [
  { value: "saver", label: "Modo ahorro" },
  { value: "balanced", label: "Equilibrado" },
  { value: "luxury", label: "Sin límite, modo lujo" },
];

const PACKAGE_OPTIONS = [
  { value: "basic", label: "Solo vuelos + hotel" },
  { value: "full", label: "Todo cerrado con actividades" },
];

const ACTIVITIES = [
  { id: "rafting", label: "Rafting", Icon: Waves },
  { id: "diving", label: "Buceo", Icon: Anchor },
  { id: "skydiving", label: "Salto en paracaídas", Icon: Plane },
  { id: "balloon", label: "Paseo en globo", Icon: Wind },
  { id: "nightlife", label: "Fiesta y vida nocturna", Icon: PartyPopper },
  { id: "culture", label: "Cultura secreta", Icon: Landmark },
];

export const TravelDetailsModal = ({
  isOpen,
  onClose,
  onSave,
  totalDays,
  startDate,
  endDate,
  userPlan = "basic",
  isAuthenticated = false,
  onOpenAuth,
}) => {
  const isPlusUser = userPlan === "plus";

  // Bloque 1: llegada
  const [transportReady, setTransportReady] = useState(false);
  const [arrivalDateTime, setArrivalDateTime] = useState("");

  // Bloque 2: alojamiento
  const [hotelCategory, setHotelCategory] = useState("standard");

  // Bloque 3: ¿Qué te pide el cuerpo? (PLUS)
  const [groupType, setGroupType] = useState("pareja");
  const [budget, setBudget] = useState("balanced");
  const [budgetAmount, setBudgetAmount] = useState(1000);
  const [packageType, setPackageType] = useState("basic");
  const [activities, setActivities] = useState([]);
  const [mustVisit, setMustVisit] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setHotelCategory("standard");
    if (startDate && !arrivalDateTime) {
      setArrivalDateTime(`${startDate}T12:00`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, startDate]);

  if (!isOpen) return null;

  const toggleActivity = (id) =>
    setActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const goToAuth = () => {
    onClose();
    onOpenAuth && onOpenAuth();
  };

  const handleSubmit = () => {
    const details = {
      transportReady,
      arrivalDateTime: transportReady ? arrivalDateTime : null,
      hotelCategory: isPlusUser ? hotelCategory : "standard",
      ...(isPlusUser
        ? {
            groupType,
            budget,
            budgetAmount,
            packageType,
            activities,
            mustVisit,
          }
        : {}),
    };
    onSave(details);
    onClose();
  };

  // Banner superior PLUS: solo si NO es PLUS
  const showTopBanner = !isPlusUser;
  const bannerCopy = isAuthenticated
    ? {
        title: "Lleva tu viaje al siguiente nivel",
        sub: "Pásate a PLUS y desbloquea todas las opciones de personalización.",
        cta: "Pasar a PLUS",
      }
    : {
        title: "Regístrate y prueba PLUS gratis",
        sub: "Ajusta cada detalle de tu viaje sin coste durante tus primeras búsquedas.",
        cta: "Registrarme gratis",
      };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      onClick={onClose}
      data-testid="travel-details-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        data-testid="travel-details-modal"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold font-heading" style={{ color: BRAND_BLUE }}>
              Personaliza tu viaje
            </h2>
            <p className="text-sm text-gray-500">
              {totalDays > 0
                ? `${totalDays} días · ${startDate} — ${endDate}`
                : "Ajustemos cada detalle"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Banner superior (oculto para PLUS) */}
        {showTopBanner && (
          <div
            className="mx-6 mt-5 rounded-xl p-4 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
            data-testid="plus-promo-banner"
          >
            <div className="p-2 bg-white/30 rounded-lg flex-shrink-0">
              <Crown className="w-5 h-5" style={{ color: BRAND_BLUE }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: BRAND_BLUE }}>
                {bannerCopy.title}
              </p>
              <p className="text-xs" style={{ color: BRAND_BLUE, opacity: 0.85 }}>
                {bannerCopy.sub}
              </p>
            </div>
            <button
              type="button"
              onClick={goToAuth}
              className="px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
              data-testid="plus-promo-cta"
            >
              {bannerCopy.cta}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Bloque 1: Tu llegada */}
          <Section
            Icon={PlaneLanding}
            title="Tu llegada"
            subtitle="¿Tienes ya cerrado el vuelo o el transporte?"
          >
            <p className="text-xs text-gray-500 mb-4">
              Si nos indicas la fecha y hora exacta a la que aterrizas, nuestro sistema ajusta el
              itinerario para aprovechar el viaje desde el minuto uno.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <ChoiceButton
                active={transportReady}
                onClick={() => setTransportReady(true)}
                label="Sí, ya lo tengo"
                data-testid="transport-yes"
              />
              <ChoiceButton
                active={!transportReady}
                onClick={() => setTransportReady(false)}
                label="Todavía no"
                data-testid="transport-no"
              />
            </div>

            {transportReady && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: BRAND_BLUE }}>
                  Fecha y hora de llegada al destino
                </label>
                <input
                  type="datetime-local"
                  value={arrivalDateTime}
                  onChange={(e) => setArrivalDateTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ccca4]"
                  data-testid="arrival-datetime"
                />
              </div>
            )}
          </Section>

          {/* Bloque 2: Alojamiento */}
          <Section
            Icon={Hotel}
            title="Alojamiento"
            subtitle="¿En qué tipo de alojamiento estás pensando?"
          >
            {!isPlusUser ? (
              <>
                <DefaultPill label="Estándar — calidad/precio en 3-4 estrellas" />
                <PlusUpsell
                  onCta={goToAuth}
                  message="Pásate a PLUS para dormir en sitios únicos: hoteles boutique, villas privadas, apartamentos de diseño y hostales con rollazo."
                  small
                />
              </>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {HOTEL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setHotelCategory(cat.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      hotelCategory === cat.value ? "shadow-sm" : "hover:bg-gray-50"
                    }`}
                    style={{
                      border: `2px solid ${hotelCategory === cat.value ? BRAND_GREEN : "#E5E7EB"}`,
                    }}
                    data-testid={`hotel-cat-${cat.value}`}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{
                        border: `2px solid ${
                          hotelCategory === cat.value ? BRAND_GREEN : "#D1D5DB"
                        }`,
                      }}
                    >
                      {hotelCategory === cat.value && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: BRAND_GREEN }}
                        />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: BRAND_BLUE }}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-gray-500">{cat.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Bloque 3: ¿Qué te pide el cuerpo? */}
          <Section
            Icon={Compass}
            title="¿Qué te pide el cuerpo?"
            subtitle="No seas un turista más, visítalo todo."
          >
            {!isPlusUser ? (
              <PlusUpsell
                onCta={goToAuth}
                message="Con PLUS ajustas cada detalle de tu viaje: con quién vas, presupuesto, ritmo, experiencias y tus sitios imprescindibles."
              />
            ) : (
              <PlusCustomizer
                groupType={groupType}
                setGroupType={setGroupType}
                budget={budget}
                setBudget={setBudget}
                budgetAmount={budgetAmount}
                setBudgetAmount={setBudgetAmount}
                packageType={packageType}
                setPackageType={setPackageType}
                activities={activities}
                toggleActivity={toggleActivity}
                mustVisit={mustVisit}
                setMustVisit={setMustVisit}
              />
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
            data-testid="travel-details-cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-bold rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            data-testid="travel-details-save"
          >
            Todo listo, vamos
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Subcomponentes ---------- */

const Section = ({ Icon, title, subtitle, children }) => (
  <section className="rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
    <div className="flex items-start gap-3 mb-4">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${BRAND_GREEN}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: BRAND_GREEN }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold font-heading" style={{ color: BRAND_BLUE }}>
          {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const ChoiceButton = ({ active, onClick, label, ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className="py-2.5 px-3 rounded-lg text-sm font-semibold transition-all"
    style={{
      border: `2px solid ${active ? BRAND_GREEN : "#E5E7EB"}`,
      backgroundColor: active ? `${BRAND_GREEN}15` : "#fff",
      color: BRAND_BLUE,
    }}
    {...rest}
  >
    {label}
  </button>
);

const DefaultPill = ({ label }) => (
  <div
    className="p-3 rounded-lg mb-3 flex items-center gap-3"
    style={{ backgroundColor: `${BRAND_GREEN}15` }}
  >
    <span
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: BRAND_GREEN }}
    >
      <Check className="w-3 h-3" style={{ color: BRAND_BLUE }} strokeWidth={3} />
    </span>
    <p className="text-sm font-semibold" style={{ color: BRAND_BLUE }}>
      {label}{" "}
      <span className="text-xs font-normal text-gray-500">(por defecto)</span>
    </p>
  </div>
);

const PlusUpsell = ({ onCta, message }) => (
  <div
    className="rounded-xl p-5 overflow-hidden relative"
    style={{
      background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #0a2a4e 100%)`,
    }}
  >
    <div
      className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
      style={{ backgroundColor: BRAND_GREEN }}
    />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "rgba(60, 204, 164, 0.18)" }}
        >
          <Crown className="w-3.5 h-3.5" style={{ color: BRAND_GREEN }} />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: BRAND_GREEN, letterSpacing: "0.14em" }}
          >
            Visítalo PLUS
          </span>
        </span>
        <span className="text-xs text-white/60">Desde 1€/mes</span>
      </div>
      <p className="text-sm text-white/90 mb-4" style={{ lineHeight: "1.55" }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onCta}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-[1.02]"
        style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
        data-testid="plus-gate-cta"
      >
        Desbloquear mi viaje PLUS
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const PlusCustomizer = ({
  groupType,
  setGroupType,
  budget,
  setBudget,
  budgetAmount,
  setBudgetAmount,
  packageType,
  setPackageType,
  activities,
  toggleActivity,
  mustVisit,
  setMustVisit,
}) => (
  <div className="space-y-6">
    {/* Con quién vas */}
    <div>
      <p className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Users className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        ¿Con quién vas?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GROUP_OPTIONS.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => setGroupType(g.value)}
            className="py-2 px-3 rounded-lg text-xs font-medium transition-all"
            style={{
              border: `2px solid ${groupType === g.value ? BRAND_GREEN : "#E5E7EB"}`,
              color: BRAND_BLUE,
              backgroundColor: groupType === g.value ? `${BRAND_GREEN}15` : "#fff",
            }}
            data-testid={`group-${g.value}`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>

    {/* Presupuesto */}
    <div>
      <p className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Wallet className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Presupuesto
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {BUDGET_OPTIONS.map((b) => (
          <button
            key={b.value}
            type="button"
            onClick={() => setBudget(b.value)}
            className="p-3 rounded-lg text-sm font-medium transition-all text-left"
            style={{
              border: `2px solid ${budget === b.value ? BRAND_GREEN : "#E5E7EB"}`,
              backgroundColor: budget === b.value ? `${BRAND_GREEN}15` : "#fff",
              color: BRAND_BLUE,
            }}
            data-testid={`budget-${b.value}`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <label className="text-sm text-gray-700 flex items-center justify-between mb-1">
        <span>Presupuesto máximo por persona</span>
        <span className="font-bold text-base" style={{ color: BRAND_BLUE }}>
          {budgetAmount.toLocaleString("es-ES")}€
        </span>
      </label>
      <input
        type="range"
        min="200"
        max="5000"
        step="50"
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(Number(e.target.value))}
        className="w-full accent-[#3ccca4]"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>200€</span>
        <span>5.000€</span>
      </div>
    </div>

    {/* Qué quieres incluir */}
    <div>
      <p className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <PackageIcon className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        ¿Qué quieres incluir?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PACKAGE_OPTIONS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPackageType(p.value)}
            className="p-3 rounded-lg text-sm font-medium transition-all text-left"
            style={{
              border: `2px solid ${packageType === p.value ? BRAND_GREEN : "#E5E7EB"}`,
              backgroundColor: packageType === p.value ? `${BRAND_GREEN}15` : "#fff",
              color: BRAND_BLUE,
            }}
            data-testid={`package-${p.value}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>

    {/* Actividades */}
    <div>
      <p className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Compass className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Experiencias que te molan
      </p>
      <p className="text-xs text-gray-500 mb-3">Elige todas las que quieras, sin límite.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACTIVITIES.map((a) => {
          const active = activities.includes(a.id);
          const { Icon } = a;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleActivity(a.id)}
              className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                border: `2px solid ${active ? BRAND_GREEN : "#E5E7EB"}`,
                backgroundColor: active ? `${BRAND_GREEN}15` : "#fff",
                color: BRAND_BLUE,
              }}
              data-testid={`activity-${a.id}`}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: active ? BRAND_GREEN : "#6B7280" }}
              />
              <span className="flex-1">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Tus sitios Sí o Sí */}
    <div>
      <p className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <MapPin className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Tus sitios &quot;Sí o Sí&quot;
      </p>
      <p className="text-xs text-gray-500 mb-2">
        Pega aquí los sitios que has visto en TikTok o Instagram, o cualquier lugar que quieras
        visitar obligatoriamente. Si lo tienes en el radar, lo encajamos en el plan.
      </p>
      <textarea
        value={mustVisit}
        onChange={(e) => setMustVisit(e.target.value)}
        placeholder="Ej: cenar en La Terraza del Casino, atardecer en el Templo de Debod, café en @spot_de_tiktok…"
        rows={3}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ccca4] resize-none"
        data-testid="must-visit-textarea"
      />
    </div>
  </div>
);
