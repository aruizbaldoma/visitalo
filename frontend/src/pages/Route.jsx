import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Bookmark } from "lucide-react";

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import { useAuth } from "../contexts/AuthContext";
import { useItinerary } from "../contexts/ItineraryContext";

const API = process.env.REACT_APP_BACKEND_URL;
const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export default function RoutePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { itinerary, isMockMode, searchParams, travelDetails } = useItinerary();
  const [savingTrip, setSavingTrip] = useState(false);

  // Si no hay itinerario (entrada directa por URL / refresh limpio), redirige al home.
  useEffect(() => {
    if (!itinerary) {
      navigate("/", { replace: true });
    }
  }, [itinerary, navigate]);

  if (!itinerary) return null;

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new Event("visitalo:open-auth"));
      return;
    }
    setSavingTrip(true);
    try {
      const token = localStorage.getItem("session_token");
      const payload = {
        destination: itinerary.destination,
        start_date: searchParams?.startDate || null,
        end_date: searchParams?.endDate || null,
        itinerary,
      };
      await axios.post(`${API}/api/trips/save`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Viaje guardado en Mis Viajes");
    } catch (err) {
      console.error("save trip error", err);
      toast.error("No se pudo guardar el viaje");
    } finally {
      setSavingTrip(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{`Tu ruta · ${itinerary.destination || "Visitalo.es"}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {isMockMode && (
        <div
          style={{
            background: "linear-gradient(90deg, #f59e0b 0%, #f97316 100%)",
            color: "white",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          MODO DEMO ACTIVO — itinerario de ejemplo
        </div>
      )}

      <Header />

      {/* Hero resumen de la ruta */}
      <section
        className="px-4 py-10 md:py-14"
        style={{ backgroundColor: BRAND_BLUE }}
        data-testid="route-hero"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            data-testid="route-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al buscador
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: BRAND_GREEN, letterSpacing: "0.2em" }}
              >
                Tu ruta
              </span>
              <h1
                className="text-3xl md:text-5xl font-bold font-heading text-white"
                style={{ letterSpacing: "-0.02em", lineHeight: "1.05" }}
                data-testid="route-destination"
              >
                {itinerary.destination}
              </h1>
              {searchParams?.startDate && searchParams?.endDate && (
                <p className="text-white/70 text-sm md:text-base mt-2">
                  {searchParams.startDate} — {searchParams.endDate} · {itinerary.totalDays} días
                </p>
              )}
            </div>

            {isAuthenticated && (
              <button
                onClick={handleSaveTrip}
                disabled={savingTrip}
                className="self-start lg:self-auto flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="save-trip-button"
              >
                <Bookmark className="w-4 h-4" />
                {savingTrip ? "Guardando..." : "Guardar en Mis Viajes"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Timeline del itinerario */}
      <main className="flex-1 py-10 md:py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <ItineraryTimeline
            itinerary={itinerary}
            isAuthenticated={isAuthenticated}
            travelDetails={travelDetails}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
