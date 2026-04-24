import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { Luggage, MapPin, Calendar, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

const API = process.env.REACT_APP_BACKEND_URL;
const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + (iso.length <= 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyTrips() {
  const { isAuthenticated, loading, refresh } = useAuth();
  const [trips, setTrips] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Post-checkout Stripe: detectar ?checkout=success&session_id=... y hacer polling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const sessionId = params.get("session_id");

    if (!sessionId) {
      if (checkoutStatus === "cancelled") {
        toast.info("Pago cancelado. Puedes volver a intentarlo cuando quieras.");
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        window.history.replaceState({}, "", url.toString());
      }
      return;
    }
    if (!isAuthenticated) return;

    let cancelled = false;
    const maxAttempts = 8;
    const pollIntervalMs = 2000;
    const loadingToast = toast.loading("Confirmando pago…");

    (async () => {
      const token = localStorage.getItem("session_token");
      for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
        try {
          const { data } = await axios.get(
            `${API}/api/stripe/checkout-status/${sessionId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (data.payment_status === "paid" && data.activated) {
            toast.success("¡Bienvenido a PLUS!", {
              id: loadingToast,
              description: "Tu suscripción está activa. Ya puedes disfrutar del Modo Dios.",
            });
            if (typeof refresh === "function") await refresh();
            break;
          }
          if (data.status === "expired") {
            toast.error("La sesión de pago expiró. Vuelve a intentarlo.", { id: loadingToast });
            break;
          }
          await new Promise((r) => setTimeout(r, pollIntervalMs));
        } catch (err) {
          toast.error("No pudimos verificar el pago. Si se cobró, contacta con info@visitalo.es.", {
            id: loadingToast,
          });
          break;
        }
      }
      // Limpiar query params
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const token = localStorage.getItem("session_token");
        const { data } = await axios.get(`${API}/api/trips`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(data.trips || []);
      } catch (err) {
        console.error("Error loading trips:", err);
        toast.error("No se pudieron cargar tus viajes");
      } finally {
        setFetching(false);
      }
    })();
  }, [isAuthenticated]);

  const handleDelete = async (tripId) => {
    if (!confirm("¿Seguro que quieres eliminar este viaje?")) return;
    try {
      const token = localStorage.getItem("session_token");
      await axios.delete(`${API}/api/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips((prev) => prev.filter((t) => t.trip_id !== tripId));
      toast.success("Viaje eliminado");
    } catch {
      toast.error("No se pudo eliminar el viaje");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3ccca4]"></div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Mis Viajes | Visítalo.es</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-10 lg:px-20 py-10 md:py-16 w-full">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-1 font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              Mis Viajes
            </h1>
            <p className="text-gray-600 text-sm">
              Aquí se guardan todos los itinerarios que hayas creado y guardado.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            data-testid="mytrips-new-button"
          >
            <Plus className="w-4 h-4" />
            Nuevo viaje
          </Link>
        </div>

        {fetching ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ccca4] mb-4"></div>
            <p className="text-gray-500">Cargando tus viajes...</p>
          </div>
        ) : trips.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl"
            style={{ border: "1px dashed #E5E7EB" }}
            data-testid="mytrips-empty"
          >
            <Luggage
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: BRAND_GREEN }}
            />
            <h2
              className="text-xl font-bold mb-2 font-heading"
              style={{ color: BRAND_BLUE }}
            >
              Aún no tienes viajes guardados
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Genera un itinerario desde la home y pulsa{" "}
              <strong>"Guardar"</strong> para verlo aquí siempre que quieras.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            >
              <Plus className="w-4 h-4" />
              Crear mi primer viaje
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <div
                key={trip.trip_id}
                className="p-5 rounded-xl bg-white hover:shadow-md transition-shadow"
                style={{ border: "1px solid #E5E7EB" }}
                data-testid={`trip-card-${trip.trip_id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-lg mb-1 font-heading truncate"
                      style={{ color: BRAND_BLUE }}
                    >
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(trip.trip_id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                    aria-label="Eliminar viaje"
                    data-testid={`trip-delete-${trip.trip_id}`}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Guardado el {formatDate(trip.createdAt?.substring(0, 10))}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
