import { Plane, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export const CTA = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #031834 0%, #0D3A5E 50%, #3ccca4 100%)' }}></div>
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-8">
            <Plane className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Encuentra tu próximo viaje ahora
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light">
            Comienza a ahorrar en tus viajes hoy mismo. Es gratis y solo toma 30 segundos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={scrollToTop}
              className="h-14 px-8 text-base bg-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              style={{ color: '#031834' }}
            >
              Planificar viaje gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="mt-6 text-white/75 text-sm">
            Sin tarjeta de crédito • Sin compromisos • Resultados instantáneos
          </p>
        </div>
      </div>
    </section>
  );
};
