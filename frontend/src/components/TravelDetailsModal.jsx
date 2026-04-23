import {
  X,
  PlaneLanding,
  Hotel,
  Crown,
  Compass,
  MapPin,
  Waves,
  Anchor,
  Plane,
  Wind,
  PartyPopper,
  Landmark,
  Check,
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

  // Bloque 0: llegada
  const [transportReady, setTransportReady] = useState(false);
  const [arrivalDateTime, setArrivalDateTime] = useState("");

  // Bloque 1: alojamiento
  const [hotelCategory, setHotelCategory] = useState("standard");

  // Bloque 2: actividades
  const [activities, setActivities] = useState([]);

  // Bloque 3: Sí o Sí
  const [mustVisit, setMustVisit] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setHotelCategory("standard");
    // Prefill de llegada con la fecha de inicio si está
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

        {/* Banner PLUS promo para no registrados */}
        {!isAuthenticated && (
          <div
            className="mx-6 mt-5 rounded-xl p-4 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
            data-testid="plus-promo-banner"
          >
            <div className="p-2 bg-white/30 rounded-lg flex-shrink-0">
              <Crown className="w-5 h-5" style={{ color: BRAND_BLUE }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: BRAND_BLUE }}>
                Prueba PLUS gratis
              </p>
              <p className="text-xs" style={{ color: BRAND_BLUE }}>
                Regístrate y personaliza cada detalle de tu viaje sin coste.
              </p>
            </div>
            <button
              type="button"
              onClick={goToAuth}
              className="px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
              data-testid="plus-promo-cta"
            >
              Registrarme gratis
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* ------ Bloque 0: Tu llegada ------ */}
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
                <p className="text-xs text-gray-400 mt-1.5">
                  Así el primer día no te lo montamos a las 9:00 si aterrizas a las 18:00.
                </p>
              </div>
            )}
          </Section>

          {/* ------ Bloque 1: Alojamiento ------ */}
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
                  message="Pásate al modo PLUS para dormir en sitios épicos: hoteles boutique, villas privadas, apartamentos de diseño y hostales con rollazo."
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

          {/* ------ Bloque 2: ¿Qué te pide el cuerpo? ------ */}
          <Section
            Icon={Compass}
            title="¿Qué te pide el cuerpo?"
            subtitle="No seas un turista más, visítalo todo."
          >
            {!isPlusUser ? (
              <PlusUpsell
                onCta={goToAuth}
                message="Activa PLUS y elige las experiencias que quieres incluir en tu itinerario: adrenalina, fiesta, cultura secreta y mucho más."
              />
            ) : (
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
            )}
          </Section>

          {/* ------ Bloque 3: Sí o Sí ------ */}
          <Section
            Icon={MapPin}
            title={`Tus sitios "Sí o Sí"`}
            subtitle="¿Tienes algún sitio fichado que no puede faltar?"
          >
            {!isPlusUser ? (
              <PlusUpsell
                onCta={goToAuth}
                message="Con PLUS puedes añadir los restaurantes, miradores o spots virales que quieres visitar obligatoriamente. Si lo tienes en el radar, lo encajamos en el plan."
              />
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-2">
                  Pega aquí los sitios que has visto en TikTok o Instagram, o cualquier lugar que
                  quieras visitar sí o sí. Si está en tu radar, lo encajamos en el plan.
                </p>
                <textarea
                  value={mustVisit}
                  onChange={(e) => setMustVisit(e.target.value)}
                  placeholder="Ej: cenar en La Terraza del Casino, atardecer en el Templo de Debod, café en @spot_de_tiktok…"
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3ccca4] resize-none"
                  data-testid="must-visit-textarea"
                />
              </>
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
      className="w-5 h-5 rounded-full flex items-center justify-center"
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
    className="rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
    style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
  >
    <div className="flex items-start gap-3 flex-1">
      <Crown className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND_BLUE }} />
      <p className="text-sm font-medium" style={{ color: BRAND_BLUE, lineHeight: "1.5" }}>
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
      Desbloquear mi viaje PLUS
    </button>
  </div>
);
