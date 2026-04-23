import { X, Plane, Hotel, Sparkles, Crown, Utensils, Wallet } from "lucide-react";
import { useState, useEffect } from "react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const HOTEL_CATEGORIES = [
  { value: "standard", label: "Estándar", sub: "3-4 estrellas", plus: false },
  { value: "luxury", label: "Lujo", sub: "5 estrellas", plus: true },
  { value: "boutique", label: "Boutique", sub: "Pequeño y con encanto", plus: true },
  { value: "hostel", label: "Hostal con encanto", sub: "Ideal para mochileros", plus: true },
  { value: "apartment", label: "Apartamento", sub: "Como en casa", plus: true },
  { value: "rural", label: "Casa rural", sub: "Escapada a la naturaleza", plus: true },
];

const ACTIVITIES = [
  { id: "beach", label: "Playa y sol", emoji: "🏖️" },
  { id: "diving", label: "Buceo / Snorkel", emoji: "🤿" },
  { id: "rafting", label: "Rafting extremo", emoji: "🛶" },
  { id: "paragliding", label: "Paracaídas / Parapente", emoji: "🪂" },
  { id: "balloon", label: "Paseo en globo", emoji: "🎈" },
  { id: "nightlife", label: "Fiesta y vida nocturna", emoji: "🎉" },
  { id: "relax", label: "Modo Zen / Relax total", emoji: "🧘" },
  { id: "culture", label: "Museos y cultura", emoji: "🏛️" },
  { id: "foodie", label: "Gastronomía local", emoji: "🍝" },
  { id: "shopping", label: "Compras y mercados", emoji: "🛍️" },
  { id: "hiking", label: "Senderismo y naturaleza", emoji: "🥾" },
  { id: "nature", label: "Parques y fauna", emoji: "🦜" },
];

const BUDGET_OPTIONS = [
  { value: "saver", label: "Modo ahorro", emoji: "💪" },
  { value: "balanced", label: "Presupuesto equilibrado", emoji: "⚖️" },
  { value: "luxury", label: "Me sobra, quiero lujo", emoji: "💎" },
];

const PACKAGE_OPTIONS = [
  { value: "basic", label: "Solo vuelos + hotel" },
  { value: "full", label: "Todo cerrado con actividades" },
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

  const [hotelCategory, setHotelCategory] = useState("standard");
  const [hasHotel, setHasHotel] = useState(false);
  const [hotelName, setHotelName] = useState("");

  // Bloque "Hazlo a tu gusto" (PLUS)
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [groupType, setGroupType] = useState("pareja");
  const [budget, setBudget] = useState("balanced");
  const [budgetAmount, setBudgetAmount] = useState(1000);
  const [packageType, setPackageType] = useState("basic");
  const [activities, setActivities] = useState([]);
  const [mustVisit, setMustVisit] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    // Reset a defaults al abrir
    setHotelCategory("standard");
  }, [isOpen]);

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
      hotelCategory: isPlusUser ? hotelCategory : "standard",
      hasHotel,
      hotelName: hasHotel ? hotelName : null,
      // Todo lo demás solo aplica si es PLUS
      ...(isPlusUser
        ? {
            flexibleDates,
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
            <h2
              className="text-2xl font-bold font-heading"
              style={{ color: BRAND_BLUE }}
            >
              Personaliza tu viaje
            </h2>
            <p className="text-sm text-gray-500">
              {totalDays > 0 ? `${totalDays} días · ${startDate} — ${endDate}` : "Ajusta tu experiencia"}
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

        {/* Banner PLUS promo para no registrados */}
        {!isAuthenticated && (
          <div
            className="mx-6 mt-5 rounded-xl p-4 flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            }}
            data-testid="plus-promo-banner"
          >
            <div className="p-2 bg-white/30 rounded-lg flex-shrink-0">
              <Crown className="w-5 h-5" style={{ color: BRAND_BLUE }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: BRAND_BLUE }}>
                Desbloquea PLUS gratis
              </p>
              <p className="text-xs" style={{ color: BRAND_BLUE }}>
                Personaliza cada detalle de tu viaje sin coste.
              </p>
            </div>
            <button
              type="button"
              onClick={goToAuth}
              className="px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
            >
              Registrarme gratis
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          {/* ------ Bloque 1: Hotel ------ */}
          <section className="rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-start gap-3 mb-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_GREEN}20` }}
              >
                <Hotel className="w-5 h-5" style={{ color: BRAND_GREEN }} />
              </div>
              <div>
                <h3 className="font-bold font-heading" style={{ color: BRAND_BLUE }}>
                  ¿En qué tipo de alojamiento estabas pensando?
                </h3>
                <p className="text-xs text-gray-500">
                  Buscaremos los mejores del destino según tu elección.
                </p>
              </div>
            </div>

            {!isPlusUser ? (
              <PlusGate
                defaultLabel="Estándar (3-4 estrellas)"
                ctaLabel="Únete a PLUS"
                message="Desbloquea hoteles de lujo, apartamentos, hostales con encanto y más."
                onCta={goToAuth}
              />
            ) : (
              <>
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
                        border: `2px solid ${
                          hotelCategory === cat.value ? BRAND_GREEN : "#E5E7EB"
                        }`,
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
                        <p
                          className="font-semibold text-sm"
                          style={{ color: BRAND_BLUE }}
                        >
                          {cat.label}
                        </p>
                        <p className="text-xs text-gray-500">{cat.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <label
                    className="text-sm font-medium"
                    style={{ color: BRAND_BLUE }}
                  >
                    ¿Ya tienes hotel?
                  </label>
                  <Switch checked={hasHotel} onChange={setHasHotel} />
                </div>
                {hasHotel && (
                  <input
                    type="text"
                    placeholder="Nombre del hotel que ya has reservado"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                  />
                )}
              </>
            )}
          </section>

          {/* ------ Bloque 2: Hazlo a tu gusto ------ */}
          <section className="rounded-xl p-5" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-start gap-3 mb-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${BRAND_GREEN}20` }}
              >
                <Sparkles className="w-5 h-5" style={{ color: BRAND_GREEN }} />
              </div>
              <div>
                <h3 className="font-bold font-heading" style={{ color: BRAND_BLUE }}>
                  Hazlo a tu gusto 🎯
                </h3>
                <p className="text-xs text-gray-500">
                  Cuéntanos cómo te gusta viajar y te lo montamos a medida.
                </p>
              </div>
            </div>

            {!isPlusUser ? (
              <PlusGate
                ctaLabel="Únete a PLUS"
                message="Activa PLUS y elige presupuesto, ritmo, actividades y sitios imprescindibles."
                onCta={goToAuth}
              />
            ) : (
              <PlusCustomizer
                flexibleDates={flexibleDates}
                setFlexibleDates={setFlexibleDates}
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
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
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
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// ------- Subcomponentes -------

const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="relative w-12 h-6 rounded-full transition-colors focus:outline-none"
    style={{ backgroundColor: checked ? BRAND_GREEN : "#D1D5DB" }}
  >
    <span
      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
      style={{ transform: checked ? "translateX(26px)" : "translateX(2px)" }}
    ></span>
  </button>
);

const PlusGate = ({ defaultLabel, ctaLabel, message, onCta }) => (
  <div>
    {defaultLabel && (
      <div
        className="p-3 rounded-lg mb-3 flex items-center gap-3"
        style={{ backgroundColor: `${BRAND_GREEN}15` }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: BRAND_GREEN }}
        />
        <p className="text-sm font-semibold" style={{ color: BRAND_BLUE }}>
          {defaultLabel} <span className="text-xs font-normal text-gray-500">(por defecto)</span>
        </p>
      </div>
    )}
    <div
      className="rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
      style={{
        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        <Crown className="w-5 h-5 flex-shrink-0" style={{ color: BRAND_BLUE }} />
        <p className="text-sm font-medium" style={{ color: BRAND_BLUE }}>
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onCta}
        className="px-4 py-2 rounded-lg font-bold text-xs transition-all hover:opacity-90 whitespace-nowrap"
        style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
        data-testid="plus-gate-cta"
      >
        {ctaLabel}
      </button>
    </div>
  </div>
);

const PlusCustomizer = ({
  flexibleDates,
  setFlexibleDates,
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
  <div className="space-y-5">
    {/* Fechas flexibles + equipo */}
    <div>
      <p className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Plane className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        ¡Cuéntanos sobre tu viaje!
      </p>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-gray-700">
          ¿Fechas flexibles? <span className="text-xs text-gray-400">(jugamos para ahorrar)</span>
        </label>
        <Switch checked={flexibleDates} onChange={setFlexibleDates} />
      </div>
      <label className="block text-sm text-gray-700 mb-2">¿Con quién vas?</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { v: "solo", l: "Viaje solo" },
          { v: "pareja", l: "Pareja" },
          { v: "amigos", l: "Amigos" },
          { v: "familia", l: "Familia" },
        ].map((g) => (
          <button
            key={g.v}
            type="button"
            onClick={() => setGroupType(g.v)}
            className="py-2 px-3 rounded-lg text-xs font-medium transition-all"
            style={{
              border: `2px solid ${groupType === g.v ? BRAND_GREEN : "#E5E7EB"}`,
              color: BRAND_BLUE,
              backgroundColor: groupType === g.v ? `${BRAND_GREEN}15` : "#fff",
            }}
          >
            {g.l}
          </button>
        ))}
      </div>
    </div>

    {/* Presupuesto */}
    <div>
      <p className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Wallet className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Hablemos de pasta (sin dramas)
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
          >
            <span className="text-lg mr-1">{b.emoji}</span>
            <span>{b.label}</span>
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

      <p className="text-sm text-gray-700 mt-4 mb-2">¿Qué quieres incluir?</p>
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
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>

    {/* Actividades */}
    <div>
      <p className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <span className="text-base">🎢</span> ¿Qué te pide el cuerpo?
      </p>
      <p className="text-xs text-gray-500 mb-3">Elige todas las que te molen, no hay límite.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ACTIVITIES.map((a) => {
          const active = activities.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleActivity(a.id)}
              className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all text-left"
              style={{
                border: `2px solid ${active ? BRAND_GREEN : "#E5E7EB"}`,
                backgroundColor: active ? `${BRAND_GREEN}15` : "#fff",
                color: BRAND_BLUE,
              }}
            >
              <span className="text-base">{a.emoji}</span>
              <span className="flex-1">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Must visit */}
    <div>
      <p className="font-bold mb-2 text-sm flex items-center gap-2" style={{ color: BRAND_BLUE }}>
        <Utensils className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        Tus "Sí o Sí" 📍
      </p>
      <p className="text-xs text-gray-500 mb-2">
        ¿Algún restaurante de TikTok, mirador secreto o museo raro que quieras sí o sí?
      </p>
      <textarea
        value={mustVisit}
        onChange={(e) => setMustVisit(e.target.value)}
        placeholder="Ej: cenar en La Terraza del Casino, ver el atardecer en el Templo de Debod, comer callos en Casa Lucas…"
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none resize-none"
      />
    </div>
  </div>
);
