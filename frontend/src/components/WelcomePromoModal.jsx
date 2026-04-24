import { useEffect, useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const STORAGE_KEY = "visitalo:welcome_seen";

export const WelcomePromoModal = () => {
  const { isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* noop */
    }
    const id = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(id);
  }, [isAuthenticated, loading]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
  };

  const openAuth = () => {
    dismiss();
    window.dispatchEvent(new Event("visitalo:open-auth"));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[450] flex items-center justify-center bg-black/55 p-4 animate-[fadeIn_0.25s_ease-out]"
      onClick={dismiss}
      data-testid="welcome-promo-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[popIn_0.35s_cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          background: `linear-gradient(160deg, ${BRAND_BLUE} 0%, #0a2a4e 100%)`,
          border: `1px solid ${BRAND_GREEN}33`,
        }}
        data-testid="welcome-promo-modal"
      >
        {/* Glow decorativo */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ backgroundColor: BRAND_GREEN }}
        />
        <div
          className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ backgroundColor: BRAND_GREEN }}
        />

        {/* Botón cerrar */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
          data-testid="welcome-promo-close"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        <div className="relative p-8 md:p-10 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: "rgba(60, 204, 164, 0.18)" }}
          >
            <Sparkles className="w-4 h-4" style={{ color: BRAND_GREEN }} />
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
            >
              Regalo de bienvenida
            </span>
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold font-heading text-white mb-3"
            style={{ letterSpacing: "-0.02em", lineHeight: "1.1" }}
            data-testid="welcome-promo-title"
          >
            5 búsquedas
            <br />
            <span style={{ color: BRAND_GREEN }}>totalmente personalizadas</span>
            <br />
            gratis.
          </h2>

          <p
            className="text-white/75 text-sm md:text-base mb-7"
            style={{ lineHeight: "1.55" }}
          >
            Regístrate en Visítalo y desbloquea 5 viajes a tu medida sin coste: alojamientos únicos,
            experiencias curadas y cada detalle pensado para ti.
          </p>

          <button
            onClick={openAuth}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] hover:shadow-xl"
            style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
            data-testid="welcome-promo-cta"
          >
            Empezar gratis
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={dismiss}
            className="mt-4 text-xs text-white/50 hover:text-white/80 transition-colors"
            data-testid="welcome-promo-skip"
          >
            Ahora no, gracias
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.92) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
