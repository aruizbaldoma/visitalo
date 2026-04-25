import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "./components/Header";
import { HeroItinerary } from "./components/HeroItinerary";
import { TravelDetailsModal } from "./components/TravelDetailsModal";
import { ItineraryLoading } from "./components/ItineraryLoading";
import { WelcomePromoModal } from "./components/WelcomePromoModal";
import { Footer } from "./components/Footer";
import { AuthCallback } from "./components/AuthCallback";
import { useAuth } from "./contexts/AuthContext";
import { ItineraryProvider, useItinerary } from "./contexts/ItineraryContext";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import MyTrips from "./pages/MyTrips";
import Legal from "./pages/Legal";
import RoutePage from "./pages/Route";
import DestinationItinerary from "./pages/DestinationItinerary";
import { seoItinerariesBySlug } from "./data/seoItineraries";
import { CookieBanner } from "./components/CookieBanner";
import { ScrollToTop } from "./components/ScrollToTop";

const API = process.env.REACT_APP_BACKEND_URL;

function App() {
  if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ItineraryProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/ruta" element={<RoutePage />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/misviajes" element={<MyTrips />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/legal/:slug" element={<Legal />} />
            {Object.keys(seoItinerariesBySlug).map((slug) => (
              <Route
                key={slug}
                path={`/${slug}`}
                element={<DestinationItinerary data={seoItinerariesBySlug[slug]} />}
              />
            ))}
            <Route path="*" element={<MainApp />} />
          </Routes>
          <CookieBanner />
        </ItineraryProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

function MainApp() {
  const { isAuthenticated, user, refresh } = useAuth();
  const navigate = useNavigate();
  const {
    setItinerary,
    setIsMockMode,
    setSearchParams,
    travelDetails,
    setTravelDetails,
  } = useItinerary();

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSearchData, setCurrentSearchData] = useState({
    startDate: "",
    endDate: "",
    destination: "",
  });

  const userPlan = isAuthenticated && user?.user_plan === "plus" ? "plus" : "basic";

  const handleSearchDataChange = (data) => setCurrentSearchData(data);

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  };

  const handleSearch = async (searchData) => {
    setIsLoading(true);
    setSearchParams(searchData);

    let effectivePlan = userPlan;
    try {
      if (isAuthenticated) {
        const token = localStorage.getItem("session_token");
        const { data: consumeResp } = await axios.post(
          `${API}/api/auth/consume-plus-search`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
        effectivePlan = consumeResp.effective_plan || "basic";
        if (
          effectivePlan === "plus" &&
          !consumeResp.subscription_active &&
          typeof consumeResp.plus_searches_remaining === "number"
        ) {
          const left = consumeResp.plus_searches_remaining;
          if (left > 0) {
            toast.info(`Modo PLUS activado · te quedan ${left} búsquedas gratis`);
          } else {
            toast.info("Esta es tu última búsqueda PLUS gratis. Después pasarás a Basic.");
          }
        }
        refresh && refresh();
      }

      const mergedDetails = searchData._preloadedDetails || travelDetails || {};
      const requestData = {
        destination: searchData.destination,
        startDate: searchData.startDate,
        endDate: searchData.endDate,
        userPlan: effectivePlan,
        ...mergedDetails,
      };

      // Forward budget hints to backend if the user picked them in the modal
      if (mergedDetails.budget) {
        requestData.budget = mergedDetails.budget;
      }
      if (
        mergedDetails.budgetAmount !== undefined &&
        mergedDetails.budgetAmount !== null
      ) {
        requestData.budgetAmount = Number(mergedDetails.budgetAmount);
      }

      const response = await axios.post(`${API}/api/generate-itinerary`, requestData);

      const mockMode = response.headers["x-mock-mode"] === "true";
      setIsMockMode(mockMode);
      setItinerary(response.data.itinerary);
      toast.dismiss();

      if (mockMode) {
        toast.info("Modo Demo: itinerario de ejemplo generado");
      } else {
        toast.success("¡Itinerario generado exitosamente!");
      }

      // Navegar a la nueva página /ruta
      navigate("/ruta");
    } catch (error) {
      toast.dismiss();
      console.error("Error:", error);
      const status = error?.response?.status;
      const serverDetail = error?.response?.data?.detail;
      if (status === 503) {
        toast.error(
          serverDetail ||
            "El servicio está saturado. Espera unos segundos y vuelve a intentarlo.",
        );
      } else if (status === 429) {
        toast.error("Demasiadas peticiones. Prueba otra vez en un momento.");
      } else {
        toast.error("Error al generar el itinerario. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = (details) => {
    setTravelDetails(details);
    toast.success("Detalles guardados correctamente");

    const mustVisit = (details?.mustVisit || "").trim();
    if (mustVisit) {
      axios
        .post(`${API}/api/insights/must-visit`, {
          text: mustVisit,
          destination: currentSearchData?.destination || "",
          user_id: user?.user_id || null,
        })
        .catch(() => {
          /* noop */
        });
    }
  };

  const handleAutoSearch = (details) => {
    if (!currentSearchData?.destination || !currentSearchData?.startDate || !currentSearchData?.endDate) return;
    setTravelDetails(details);
    handleSearch({
      destination: currentSearchData.destination,
      startDate: currentSearchData.startDate,
      endDate: currentSearchData.endDate,
      _preloadedDetails: details,
    });
  };

  const totalDays = currentSearchData.startDate && currentSearchData.endDate
    ? calculateDays(currentSearchData.startDate, currentSearchData.endDate)
    : 0;

  return (
    <div className="App min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Toaster position="top-center" richColors />

      {isLoading && <ItineraryLoading />}

      <WelcomePromoModal />

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
        onAutoSearch={handleAutoSearch}
        totalDays={totalDays}
        destination={currentSearchData.destination || ""}
        startDate={currentSearchData.startDate || ""}
        endDate={currentSearchData.endDate || ""}
        userPlan={userPlan}
        isAuthenticated={isAuthenticated}
        onOpenAuth={() => window.dispatchEvent(new Event("visitalo:open-auth"))}
      />

      <Footer />
    </div>
  );
}

export default App;
