import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Header } from "./components/Header";
import { HeroItinerary } from "./components/HeroItinerary";
import { TravelDetailsModal } from "./components/TravelDetailsModal";
import { ItineraryTimeline } from "./components/ItineraryTimeline";
import { Footer } from "./components/Footer";

const API = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelDetails, setTravelDetails] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

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

      <Header />

      {/* Hero con Buscador */}
      <HeroItinerary
        onSearch={handleSearch}
        onOpenDetails={() => setIsModalOpen(true)}
      />

      {/* Modal de Detalles */}
      <TravelDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDetails}
        totalDays={totalDays}
        startDate={searchParams?.startDate || ""}
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
            <ItineraryTimeline itinerary={itinerary} isAuthenticated={false} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
