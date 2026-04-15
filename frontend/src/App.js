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

  const handleSearch = async (results) => {
    setIsSearching(true);
    toast.loading("Buscando los mejores viajes con IA...");
    
    try {
      // Los resultados ya vienen del backend
      setSearchResults(results);
      toast.dismiss();
      
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
