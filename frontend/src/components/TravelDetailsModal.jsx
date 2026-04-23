import {
  X,
  PlaneLanding,
  PlaneTakeoff,
  Hotel,
  Crown,
  Compass,
  Users,
  Wallet,
  MapPin,
  Waves,
  Anchor,
  Zap,
  Wind,
  PartyPopper,
  Landmark,
  Check,
  ArrowRight,
  Building2,
  Camera,
  Mountain,
  Sun,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Coffee,
  Plus,
  Trash2,
  Route,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { RangeDatePicker } from "./RangeDatePicker";

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

const ACTIVITY_GROUPS = [
  {
    group: "Cultura y must-see",
    items: [
      { id: "museums", label: "Museos y galerías", sub: "Lo imprescindible", Icon: Building2 },
      { id: "monuments", label: "Historia y monumentos", sub: "Los clásicos", Icon: Landmark },
      { id: "instagram", label: "Sitios para stories de IG", sub: "Los mejores spots", Icon: Camera },
    ],
  },
  {
    group: "Adrenalina y acción",
    items: [
      { id: "diving", label: "Buceo y snorkel", sub: "Explora el fondo", Icon: Anchor },
      { id: "extreme", label: "Rafting o salto al vacío", sub: "Solo para valientes", Icon: Zap },
      { id: "balloon", label: "Paseo en globo", sub: "Vistas de otro planeta", Icon: Wind },
    ],
  },
  {
    group: "Naturaleza y relax",
    items: [
      { id: "hiking", label: "Senderismo y naturaleza", sub: "Desconexión total", Icon: Mountain },
      { id: "beach", label: "Playas y calas", sub: "Relax al sol", Icon: Sun },
      { id: "zen", label: "Modo Zen", sub: "Balnearios y planes relax", Icon: Sparkles },
    ],
  },
  {
    group: "Comida y fiesta",
    items: [
      { id: "foodie", label: "Ruta foodie", sub: "Comer donde los locales", Icon: UtensilsCrossed },
      { id: "nightlife", label: "Fiesta y noche", sub: "Vida nocturna y clubs", Icon: Wine },
      { id: "cafes", label: "Cafeterías con encanto", sub: "Planes tranquilos", Icon: Coffee },
    ],
  },
];

export const TravelDetailsModal = ({
  isOpen,
  onClose,
  onSave,
  onAutoSearch,
  totalDays,
  startDate,
  endDate,
  destination,
  userPlan = "basic",
  isAuthenticated = false,
  onOpenAuth,
}) => {
  const isPlusUser = userPlan === "plus";

  // Bloque 1: llegada
  const [transportReady, setTransportReady] = useState(false);
  const [arrivalDateTime, setArrivalDateTime] = useState("");

  // Bloque 2: salida (vuelta)
  const [departureReady, setDepartureReady] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState("");

  // Bloque 3: multi-ciudad
  const [multiCity, setMultiCity] = useState(false);
  const [cities, setCities] = useState([{ name: "", startDate: "", endDate: "" }]);

  // Bloque 4: alojamiento (selección múltiple)
  const [hotelCategories, setHotelCategories] = useState(["standard"]);

  // Bloque 5: ¿Qué te pide el cuerpo? (PLUS)
  const [groupType, setGroupType] = useState("pareja");
  const [budget, setBudget] = useState("balanced");
  const [budgetAmount, setBudgetAmount] = useState(1000);
  const [activities, setActivities] = useState([]);
  const [mustVisit, setMustVisit] = useState("");

  // Auth modal anidado (sin cerrar el modal de personalización)
  const [showNestedAuth, setShowNestedAuth] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setHotelCategories(["standard"]);
    if (startDate && !arrivalDateTime) {
      setArrivalDateTime(`${startDate}T12:00`);
    }
    if (endDate && !departureDateTime) {
      setDepartureDateTime(`${endDate}T18:00`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, startDate, endDate]);

  if (!isOpen) return null;

  const toggleHotelCategory = (value) =>
    setHotelCategories((prev) => {
      if (prev.includes(value)) {
        const next = prev.filter((v) => v !== value);
        return next.length ? next : [value]; // al menos una seleccionada
      }
      return [...prev, value];
    });

  const toggleActivity = (id) =>
    setActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const addCity = () =>
    setCities((prev) => [...prev, { name: "", startDate: "", endDate: "" }]);

  const removeCity = (idx) =>
    setCities((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const updateCity = (idx, field, value) =>
    setCities((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  // CTA del upsell PLUS: si no está autenticado → abrir login nested; si auth → flujo Stripe (TODO).
  const handlePlusCta = () => {
    if (!isAuthenticated) {
      setShowNestedAuth(true);
    } else {
      // Usuario autenticado en plan basic: futuro checkout Stripe.
      onOpenAuth && onOpenAuth();
    }
  };

  const plusCtaLabel = isAuthenticated ? "Desbloquear mi viaje PLUS" : "Iniciar sesión / Registrarme";

  const handleSubmit = () => {
    const details = {
      transportReady,
      arrivalDateTime: transportReady ? arrivalDateTime : null,
      departureReady,
      departureDateTime: departureReady ? departureDateTime : null,
      multiCity: isPlusUser ? multiCity : false,
      cities: isPlusUser && multiCity ? cities.filter((c) => c.name.trim()) : [],
      hotelCategories: isPlusUser ? hotelCategories : ["standard"],
      ...(isPlusUser
        ? {
            groupType,
            budget,
            budgetAmount,
            activities,
            mustVisit,
          }
        : {}),
    };
    onSave(details);
    onClose();

    // Si el usuario tiene destino + fechas ya rellenados, ejecuta la búsqueda automáticamente
    if (onAutoSearch && destination && startDate && endDate) {
      // Dar un tick al estado antes de disparar la búsqueda
      setTimeout(() => onAutoSearch(details), 50);
    }
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

          {/* Bloque 2: Tu salida */}
          <Section
            Icon={PlaneTakeoff}
            title="Tu salida"
            subtitle="¿Tienes ya el vuelo o transporte de vuelta?"
          >
            <p className="text-xs text-gray-500 mb-4">
              Si nos indicas a qué hora sales del destino, exprimimos el último día sin prisas
              y evitamos cruzarlo con desplazamientos.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <ChoiceButton
                active={departureReady}
                onClick={() => setDepartureReady(true)}
                label="Sí, ya lo tengo"
                data-testid="departure-yes"
              />
              <ChoiceButton
                active={!departureReady}
                onClick={() => setDepartureReady(false)}
                label="Todavía no"
                data-testid="departure-no"
              />
            </div>

            {departureReady && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: BRAND_BLUE }}>
                  Fecha y hora de salida del destino
                </label>
                <input
                  type="datetime-local"
                  value={departureDateTime}
                  onChange={(e) => setDepartureDateTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ccca4]"
                  data-testid="departure-datetime"
                />
              </div>
            )}
          </Section>

          {/* Bloque 3: Multi-ciudad */}
          <Section
            Icon={Route}
            title="¿Varias ciudades?"
            subtitle="Encadena varios destinos en un mismo viaje."
          >
            {!isPlusUser ? (
              <PlusUpsell
                ctaLabel={plusCtaLabel}
                onCta={handlePlusCta}
                message="Con PLUS puedes planificar viajes por varias ciudades en una sola búsqueda, con fechas independientes para cada destino."
              />
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  Si vas a moverte por más de una ciudad, añádelas con las fechas de cada una.
                  Lo tendremos en cuenta al montar el itinerario y los desplazamientos.
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <ChoiceButton
                    active={multiCity}
                    onClick={() => setMultiCity(true)}
                    label="Sí, varias ciudades"
                    data-testid="multicity-yes"
                  />
                  <ChoiceButton
                    active={!multiCity}
                    onClick={() => setMultiCity(false)}
                    label="Solo un destino"
                    data-testid="multicity-no"
                  />
                </div>

                {multiCity && (
              <div className="space-y-3">
                {cities.map((c, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-3 bg-gray-50 border border-gray-200 space-y-2"
                    data-testid={`city-row-${idx}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: BRAND_GREEN, letterSpacing: "0.14em" }}
                      >
                        Ciudad {idx + 1}
                      </span>
                      {cities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCity(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar ciudad"
                          data-testid={`city-remove-${idx}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Ciudad (ej: Roma)"
                      value={c.name}
                      onChange={(e) => updateCity(idx, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#3ccca4]"
                      data-testid={`city-name-${idx}`}
                    />
                    {(() => {
                      const outOfRange = (() => {
                        if (!startDate || !endDate) return false;
                        const minT = new Date(startDate + "T00:00:00").getTime();
                        const maxT = new Date(endDate + "T00:00:00").getTime();
                        const cs = c.startDate ? new Date(c.startDate + "T00:00:00").getTime() : null;
                        const ce = c.endDate ? new Date(c.endDate + "T00:00:00").getTime() : null;
                        if (cs && (cs < minT || cs > maxT)) return true;
                        if (ce && (ce < minT || ce > maxT)) return true;
                        return false;
                      })();

                      return (
                        <>
                          <div
                            className={`rounded-md transition-colors ${
                              outOfRange ? "ring-2 ring-red-400" : ""
                            }`}
                          >
                            <RangeDatePicker
                              startDate={c.startDate}
                              endDate={c.endDate}
                              onChange={({ startDate: s, endDate: e }) => {
                                updateCity(idx, "startDate", s);
                                updateCity(idx, "endDate", e);
                              }}
                              singleLabel="¿Qué días vas a estar?"
                              minDate={startDate ? new Date(startDate + "T00:00:00") : undefined}
                              maxDate={endDate ? new Date(endDate + "T00:00:00") : undefined}
                              triggerClassName={`block w-full px-3 py-2 rounded-md text-sm bg-white text-left font-medium transition-colors ${
                                outOfRange
                                  ? "border-2 border-red-400 text-red-600"
                                  : c.startDate && c.endDate
                                  ? "border border-gray-300 text-gray-800 hover:border-[#3ccca4]"
                                  : "border border-gray-300 text-gray-400 hover:border-[#3ccca4]"
                              }`}
                            />
                          </div>
                          {outOfRange && (
                            <p
                              className="text-xs mt-1 font-medium text-red-500"
                              data-testid={`city-error-${idx}`}
                            >
                              ¿Te has equivocado con las fechas? Esta ciudad se ha salido del rango de tu viaje.
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCity}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:border-[#3ccca4] hover:text-[#031834] transition-colors"
                  data-testid="add-city"
                >
                  <Plus className="w-4 h-4" />
                  Añadir otra ciudad
                </button>
              </div>
            )}
              </>
            )}
          </Section>

          {/* Bloque 4: Alojamiento */}
          <Section
            Icon={Hotel}
            title="Alojamiento"
            subtitle="¿En qué tipo de alojamiento estás pensando?"
          >
            {!isPlusUser ? (
              <PlusUpsell
                ctaLabel={plusCtaLabel}
                onCta={handlePlusCta}
                message="Pásate a PLUS para dormir en sitios únicos: hoteles boutique, villas privadas, apartamentos de diseño y hostales con rollazo."
              />
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-3">
                  Puedes elegir varias opciones — te daremos alternativas de cada tipo.
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {HOTEL_CATEGORIES.map((cat) => {
                    const active = hotelCategories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => toggleHotelCategory(cat.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          active ? "shadow-sm" : "hover:bg-gray-50"
                        }`}
                        style={{
                          border: `2px solid ${active ? BRAND_GREEN : "#E5E7EB"}`,
                          backgroundColor: active ? `${BRAND_GREEN}10` : "#fff",
                        }}
                        data-testid={`hotel-cat-${cat.value}`}
                      >
                        <span
                          className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-colors"
                          style={{
                            border: `2px solid ${active ? BRAND_GREEN : "#D1D5DB"}`,
                            backgroundColor: active ? BRAND_GREEN : "#fff",
                          }}
                        >
                          {active && (
                            <Check
                              className="w-3 h-3"
                              style={{ color: BRAND_BLUE }}
                              strokeWidth={3}
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
                    );
                  })}
                </div>
              </>
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
                ctaLabel={plusCtaLabel}
                onCta={handlePlusCta}
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

      {/* AuthModal anidado — z superior para quedar encima del modal de personalización */}
      {showNestedAuth && (
        <div className="fixed inset-0 z-[300]">
          <AuthModal isOpen={true} onClose={() => setShowNestedAuth(false)} />
        </div>
      )}
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

const PlusUpsell = ({ onCta, message, ctaLabel = "Desbloquear mi viaje PLUS" }) => (
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
        <span className="text-xs text-white/60">Desde 1€/mes · cancela cuando quieras</span>
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
        {ctaLabel}
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

    {/* Experiencias agrupadas */}
    <div>
      <p className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Compass className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Experiencias que te molan
      </p>
      <p className="text-xs text-gray-500 mb-4">
        Elige todas las que quieras, sin límite. Las agrupamos por estilo para que encuentres tu rollo.
      </p>

      <div className="space-y-5">
        {ACTIVITY_GROUPS.map(({ group, items }) => (
          <div key={group}>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: BRAND_GREEN, letterSpacing: "0.14em" }}
            >
              {group}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {items.map((a) => {
                const active = activities.includes(a.id);
                const { Icon } = a;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleActivity(a.id)}
                    className="flex items-start gap-3 p-3 rounded-lg text-left transition-all hover:-translate-y-0.5"
                    style={{
                      border: `2px solid ${active ? BRAND_GREEN : "#E5E7EB"}`,
                      backgroundColor: active ? `${BRAND_GREEN}12` : "#fff",
                    }}
                    data-testid={`activity-${a.id}`}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: active ? BRAND_GREEN : `${BRAND_GREEN}18`,
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: active ? BRAND_BLUE : BRAND_GREEN }}
                        strokeWidth={2.2}
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm leading-snug"
                        style={{ color: BRAND_BLUE }}
                      >
                        {a.label}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{a.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Tus sitios Sí o Sí */}
    <div>
      <p className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <MapPin className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Tus sitios &quot;Sí o Sí&quot;
      </p>
      <p className="text-xs text-gray-500 mb-2">
        ¿Tienes algún sitio fichado que no puede faltar? Pégalo aquí — si lo tienes en el radar,
        lo encajamos en el plan.
      </p>
      <textarea
        value={mustVisit}
        onChange={(e) => setMustVisit(e.target.value)}
        placeholder="Ej: cenar en La Terraza del Casino, atardecer en el Templo de Debod, ese café que viste el otro día…"
        rows={3}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ccca4] resize-none"
        data-testid="must-visit-textarea"
      />
    </div>
  </div>
);
