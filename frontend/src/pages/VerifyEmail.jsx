import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [error, setError] = useState("");
  const { setSessionFromCallback } = useAuth();

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setStatus("error");
      setError("Falta el token en el enlace.");
      return;
    }
    (async () => {
      try {
        const { data } = await axios.post(`${API}/api/auth/verify-email`, {
          token,
        });
        if (cancelled) return;
        if (data?.session_token && data?.user) {
          // Auto-login.
          setSessionFromCallback(data.session_token, data.user);
        }
        setStatus("ok");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(
          err?.response?.data?.detail ||
            "No hemos podido verificar tu cuenta. Es posible que el enlace haya caducado.",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setSessionFromCallback]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f7faf9" }}
      data-testid="verify-email-page"
    >
      <Helmet>
        <title>Verificar cuenta · Visitalo.es</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg text-center">
        {status === "loading" && (
          <>
            <Loader2
              className="w-10 h-10 mx-auto mb-4 animate-spin"
              style={{ color: BRAND_GREEN }}
            />
            <h1
              className="text-xl font-bold font-heading"
              style={{ color: BRAND_BLUE }}
            >
              Verificando tu cuenta…
            </h1>
          </>
        )}
        {status === "ok" && (
          <>
            <CheckCircle2
              className="w-14 h-14 mx-auto mb-4"
              style={{ color: BRAND_GREEN }}
              strokeWidth={2.2}
            />
            <h1
              className="text-2xl font-bold font-heading mb-3"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              ¡Cuenta verificada!
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Ya estás dentro. Toca abajo y empieza a montar tu próximo viaje.
            </p>
            <Link
              to="/"
              className="inline-block w-full py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
              data-testid="verify-email-cta"
            >
              Empezar a planificar
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle
              className="w-14 h-14 mx-auto mb-4"
              style={{ color: "#ef4444" }}
              strokeWidth={2.2}
            />
            <h1
              className="text-2xl font-bold font-heading mb-3"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              No hemos podido verificarte
            </h1>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-block w-full py-3 rounded-lg font-bold transition-all hover:scale-[1.02]"
              style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
              data-testid="verify-email-back"
            >
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
