import { useState } from "react";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const userBefore = localStorage.getItem("session_token");
      const newUser = await loginWithGoogle(credentialResponse.credential);
      // Es nuevo si no había token antes y el usuario no tiene first_trip_used
      if (!userBefore && newUser && newUser.first_trip_used === false) {
        window.dispatchEvent(new Event("visitalo:welcome"));
      } else {
        toast.success("¡Bienvenido!");
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Error al iniciar sesión con Google";
      toast.error(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error("No se pudo completar el login con Google");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("¡Bienvenido de nuevo!");
      } else {
        await registerWithEmail(email, password, name);
        // Al registrarse por primera vez, disparar welcome modal
        window.dispatchEvent(new Event("visitalo:welcome"));
      }
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        (mode === "login" ? "Credenciales incorrectas" : "Error al registrarse");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      data-testid="auth-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        data-testid="auth-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cerrar"
          data-testid="auth-modal-close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-4">
            <img src="/visitalo-logo.png" alt="Visítalo.es" className="h-10 w-auto" />
          </div>

          <h2
            className="text-2xl font-bold text-center mb-2 font-heading"
            style={{ color: BRAND_BLUE }}
          >
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            {mode === "login"
              ? "Accede para guardar tus itinerarios"
              : "Regístrate y empieza a planificar tu viaje"}
          </p>

          {/* Botón oficial de Google Identity Services */}
          <div className="flex justify-center" data-testid="auth-google-button">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              shape="rectangular"
              text={mode === "login" ? "signin_with" : "signup_with"}
              locale="es"
              width="368"
            />
          </div>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 uppercase tracking-wide">o</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Formulario Email */}
          <form onSubmit={handleSubmit} className="space-y-3" data-testid="auth-email-form">
            {mode === "register" && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": BRAND_GREEN }}
                  data-testid="auth-name-input"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                data-testid="auth-email-input"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Contraseña (mín. 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                data-testid="auth-password-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-60"
              style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
              data-testid="auth-submit-button"
            >
              {submitting
                ? "Procesando…"
                : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="font-bold"
                  style={{ color: BRAND_BLUE }}
                  data-testid="auth-toggle-register"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold"
                  style={{ color: BRAND_BLUE }}
                  data-testid="auth-toggle-login"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
