import { useState } from "react";
import "@/App.css";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { ExampleTrips } from "./components/ExampleTrips";
import { Benefits } from "./components/Benefits";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  const handleSearch = async (results, mockMode = false) => {
    setIsSearching(true);
    setIsMockMode(mockMode);
    toast.loading("Buscando los mejores viajes con IA...");
    
    try {
      // Los resultados ya vienen del backend
      setSearchResults(results);
      toast.dismiss();
      
      if (mockMode) {
        toast.info("🎭 Modo Demo: Mostrando datos de ejemplo (sin gastar API)");
      }
      
      if (results.length > 0) {
        toast.success(`¡Encontramos ${results.length} viaje(s) increíble(s)!`);
      } else {
        toast.info("No encontramos viajes. Intenta aumentar tu presupuesto.");
      }
      
      // Scroll to results
      setTimeout(() => {
        const element = document.getElementById('viajes');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    } catch (error) {
      toast.dismiss();
      toast.error("Hubo un error al buscar viajes. Inténtalo de nuevo.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      
      {isMockMode && (
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🎭 MODO DEMO ACTIVO - Mostrando datos de ejemplo (sin gastar API de Gemini)
        </div>
      )}
      
      <Header />
      
      <main>
        <section id="inicio">
          <Hero onSearch={handleSearch} />
        </section>
        
        <section id="como-funciona">
          <HowItWorks />
        </section>
        
        <section id="viajes">
          <ExampleTrips searchResults={searchResults} />
        </section>
        
        <Benefits />
        
        <Testimonials />
        
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
