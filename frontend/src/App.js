import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "./components/Header";
import { HeroItinerary } from "./components/HeroItinerary";
import { TravelDetailsModal } from "./components/TravelDetailsModal";
import { ItineraryTimeline } from "./components/ItineraryTimeline";
import { Footer } from "./components/Footer";
import { AuthCallback } from "./components/AuthCallback";
import { useAuth } from "./contexts/AuthContext";
import { Bookmark } from "lucide-react";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import MyTrips from "./pages/MyTrips";

const API = process.env.REACT_APP_BACKEND_URL;

function App() {
  // CRITICAL: Detect session_id synchronously BEFORE any other logic runs.
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/misviajes" element={<MyTrips />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelDetails, setTravelDetails] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [currentSearchData, setCurrentSearchData] = useState({ startDate: "", endDate: "", destination: "" });
  const [savingTrip, setSavingTrip] = useState(false);

  // Mock user plan - cambiar a 'plus' para testear funcionalidad premium
  const [userPlan, setUserPlan] = useState('basic'); // 'basic' o 'plus'

  const handleSearchDataChange = (data) => {
    setCurrentSearchData(data);
  };

  const handleSaveTrip = async () => {
    if (!itinerary || !searchParams) return;
    setSavingTrip(true);
    try {
      const token = localStorage.getItem("session_token");
      const days = calculateDays(searchParams.startDate, searchParams.endDate);
      await axios.post(
        `${API}/api/trips/save`,
        {
          destination: searchParams.destination,
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          title: `${searchParams.destination} · ${days} días`,
          itinerary,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("¡Viaje guardado en Mis Viajes!");
    } catch (err) {
      console.error("save trip error", err);
      toast.error("No se pudo guardar el viaje");
    } finally {
      setSavingTrip(false);
    }
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  const handleSearch = async (searchData) => {
    setIsLoading(true);
    setSearchParams(searchData);
    toast.loading("Generando tu itinerario personalizado...");

    try {
      const requestData = {
        destination: searchData.destination,
        startDate: searchData.startDate,
        endDate: searchData.endDate,
        userPlan: userPlan,
        ...travelDetails
      };

      const response = await axios.post(`${API}/api/generate-itinerary`, requestData);

      const mockMode = response.headers['x-mock-mode'] === 'true';
      setIsMockMode(mockMode);

      setItinerary(response.data.itinerary);
      toast.dismiss();

      if (mockMode) {
        toast.info("🎭 Modo Demo: Itinerario de ejemplo generado");
      } else {
        toast.success("¡Itinerario generado exitosamente!");
      }

      // Scroll al itinerario
      setTimeout(() => {
        document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      toast.dismiss();
      console.error("Error:", error);
      toast.error("Error al generar el itinerario. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = (details) => {
    setTravelDetails(details);
    toast.success("Detalles guardados correctamente");
  };

  const totalDays = searchParams
    ? calculateDays(searchParams.startDate, searchParams.endDate)
    : 0;

  return (
    <div className="App min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Toaster position="top-center" richColors />

      {/* Banner Modo MOCK */}
      {isMockMode && (
        <div
          style={{
            background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
            color: 'white',
            padding: '10px 16px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🎭 MODO DEMO ACTIVO - Itinerario de ejemplo (sin usar API de Gemini)
        </div>
      )}
      
      {/* Banner Plan Testing - Solo para desarrollo */}
      <div
        style={{
          background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <span>🧪 TEST MODE:</span>
        <select 
          value={userPlan} 
          onChange={(e) => setUserPlan(e.target.value)}
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'white',
            color: '#1f2937',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <option value="basic">👤 Plan BASIC</option>
          <option value="plus">⭐ Plan PLUS</option>
        </select>
      </div>

      <Header />

      {/* Hero con Buscador */}
      <HeroItinerary
        onSearch={handleSearch}
        onOpenDetails={() => setIsModalOpen(true)}
        onSearchDataChange={handleSearchDataChange}
      />

      {/* Modal de Detalles */}
      <TravelDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDetails}
        totalDays={totalDays}
        startDate={currentSearchData.startDate || searchParams?.startDate || ""}
        endDate={currentSearchData.endDate || searchParams?.endDate || ""}
        userPlan={userPlan}
        isAuthenticated={isAuthenticated}
        onOpenAuth={() => window.dispatchEvent(new Event("visitalo:open-auth"))}
      />

      {/* Timeline de Itinerario */}
      <section id="itinerary" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ccca4] mb-4"></div>
              <p className="text-gray-600 text-lg">Generando tu itinerario personalizado...</p>
            </div>
          ) : (
            <>
              {itinerary && isAuthenticated && (
                <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mb-4 flex justify-end">
                  <button
                    onClick={handleSaveTrip}
                    disabled={savingTrip}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#3ccca4', color: '#031834' }}
                    data-testid="save-trip-button"
                  >
                    <Bookmark className="w-4 h-4" />
                    {savingTrip ? "Guardando..." : "Guardar en Mis Viajes"}
                  </button>
                </div>
              )}
              <ItineraryTimeline itinerary={itinerary} isAuthenticated={isAuthenticated} />
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
