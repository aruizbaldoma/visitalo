import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Lock, Mail, Loader2 } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const existing = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (existing) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail || "Credenciales inválidas");
        setLoading(false);
        return;
      }
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_email", data.email);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: BRAND_BLUE }}
      data-testid="admin-login-page"
    >
      <Helmet>
        <title>Admin · Visitalo.es</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div
        className="w-full max-w-md bg-white rounded-2xl p-8"
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}
      >
        <div className="flex flex-col items-center mb-7">
          <span
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(60,204,164,0.14)" }}
          >
            <Lock className="w-6 h-6" style={{ color: BRAND_GREEN }} strokeWidth={2.4} />
          </span>
          <h1
            className="text-2xl font-bold font-heading"
            style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
          >
            Acceso administradores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Solo personal autorizado de Visitalo.es
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-[#3ccca4]">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm focus:outline-none"
                placeholder="tu@email.com"
                autoComplete="email"
                data-testid="admin-login-email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
              Contraseña
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-[#3ccca4]">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm focus:outline-none"
                autoComplete="current-password"
                data-testid="admin-login-password"
              />
            </div>
          </div>

          {error && (
            <div
              className="text-sm px-3 py-2 rounded-md"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}
              data-testid="admin-login-error"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
            data-testid="admin-login-submit"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
