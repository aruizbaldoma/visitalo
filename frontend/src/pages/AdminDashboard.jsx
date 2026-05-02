import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Search,
  KeyRound,
  LogOut,
  Loader2,
  ChevronRight,
  Mail,
  X,
  ArrowLeft,
  ExternalLink,
  MapPin,
  Calendar,
  Copy,
  Check,
  Users,
  BarChart3,
} from "lucide-react";
import AdminAnalytics from "./AdminAnalytics";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const useAdminAuth = () => {
  const [token] = useState(() => localStorage.getItem("admin_token"));
  return { token };
};

const adminFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    window.location.assign("/admin/login");
    throw new Error("No autorizado");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Error");
  return data;
};

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'analytics'
  const adminEmail = localStorage.getItem("admin_email") || "";

  useEffect(() => {
    if (!token) return;
    if (activeTab !== "users") return;
    setLoading(true);
    adminFetch(`/api/admin/users?limit=500`)
      .then((d) => setUsers(d.users || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, activeTab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email || "").toLowerCase().includes(q) ||
        (u.name || "").toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleLogout = async () => {
    try {
      await adminFetch(`/api/admin/logout`, { method: "POST" });
    } catch {}
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    navigate("/admin/login", { replace: true });
  };

  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <Helmet>
        <title>Dashboard · Admin Visitalo.es</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Top bar */}
      <header
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
      >
        <div>
          <h1 className="text-lg font-bold font-heading">Visitalo.es · Admin</h1>
          <p className="text-xs opacity-70">Sesión activa: {adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          data-testid="admin-logout"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("users")}
            className="px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 -mb-px border-b-2 transition-colors"
            style={
              activeTab === "users"
                ? { borderColor: BRAND_GREEN, color: BRAND_BLUE }
                : { borderColor: "transparent", color: "#6b7280" }
            }
            data-testid="tab-users"
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className="px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 -mb-px border-b-2 transition-colors"
            style={
              activeTab === "analytics"
                ? { borderColor: BRAND_GREEN, color: BRAND_BLUE }
                : { borderColor: "transparent", color: "#6b7280" }
            }
            data-testid="tab-analytics"
          >
            <BarChart3 className="w-4 h-4" /> Analítica
          </button>
        </div>

        {activeTab === "analytics" && <AdminAnalytics />}

        {activeTab === "users" && (
        <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-2xl font-bold font-heading"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              Usuarios registrados
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total: {users.length} {users.length === 1 ? "usuario" : "usuarios"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-72">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email o nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm focus:outline-none"
              data-testid="admin-search"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_GREEN }} />
          </div>
        )}

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-lg mb-4"
            style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        {!loading && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: "#f7faf9" }}>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">Usuario</th>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Registro</th>
                    <th className="px-5 py-3">Último login</th>
                    <th className="px-5 py-3 text-center">Búsquedas</th>
                    <th className="px-5 py-3 text-center">Clics</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.user_id}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelected(u.user_id)}
                      data-testid={`user-row-${u.user_id}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img
                              src={u.picture}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: "rgba(60,204,164,0.16)",
                                color: BRAND_BLUE,
                              }}
                            >
                              {(u.name || u.email || "?").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p
                              className="font-semibold truncate"
                              style={{ color: BRAND_BLUE }}
                            >
                              {u.name || "—"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {u.auth_provider || "email"}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {fmtDate(u.created_at)}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {fmtDate(u.last_login_at)}
                      </td>
                      <td className="px-5 py-3 text-center font-semibold">
                        {u.total_searches || 0}
                      </td>
                      <td className="px-5 py-3 text-center font-semibold">
                        {u.total_clicks || 0}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-400 inline" />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                        Sin usuarios coincidentes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
        )}
      </main>

      {selected && (
        <UserDetailDrawer userId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

const UserDetailDrawer = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetState, setResetState] = useState(null); // { new_password, email_sent }
  const [resetLoading, setResetLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminFetch(`/api/admin/users/${userId}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleReset = async () => {
    if (!window.confirm("¿Generar nueva contraseña y enviarla por email?")) return;
    setResetLoading(true);
    try {
      const r = await adminFetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      setResetState(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setResetLoading(false);
    }
  };

  const copyPassword = async () => {
    if (!resetState?.new_password) return;
    await navigator.clipboard.writeText(resetState.new_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: "rgba(3,24,52,0.4)" }}
      onClick={onClose}
      data-testid="user-detail-drawer"
    >
      <div
        className="w-full max-w-2xl h-full bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 px-6 py-4 flex items-center justify-between border-b border-gray-200"
          style={{ backgroundColor: "#fff" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100"
              aria-label="Cerrar"
              data-testid="user-detail-close"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold" style={{ color: BRAND_BLUE }}>
              Detalle del usuario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND_GREEN }} />
            </div>
          )}
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg"
              style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}
            >
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Datos del usuario */}
              <section
                className="bg-gray-50 rounded-xl p-5"
                data-testid="user-detail-info"
              >
                <div className="flex items-center gap-4 mb-4">
                  {data.user.picture ? (
                    <img
                      src={data.user.picture}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{
                        backgroundColor: "rgba(60,204,164,0.16)",
                        color: BRAND_BLUE,
                      }}
                    >
                      {(data.user.name || data.user.email || "?")
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p
                      className="font-bold text-lg"
                      style={{ color: BRAND_BLUE }}
                    >
                      {data.user.name || "—"}
                    </p>
                    <p className="text-sm text-gray-600">{data.user.email}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-gray-500">
                      Provider
                    </dt>
                    <dd className="font-medium" style={{ color: BRAND_BLUE }}>
                      {data.user.auth_provider || "email"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-gray-500">
                      Registro
                    </dt>
                    <dd className="font-medium" style={{ color: BRAND_BLUE }}>
                      {fmtDate(data.user.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-gray-500">
                      Último login
                    </dt>
                    <dd className="font-medium" style={{ color: BRAND_BLUE }}>
                      {fmtDate(data.user.last_login_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-gray-500">
                      User ID
                    </dt>
                    <dd className="font-mono text-xs text-gray-600">
                      {data.user.user_id}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Restablecer contraseña */}
              <section className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4
                      className="font-bold mb-1"
                      style={{ color: BRAND_BLUE }}
                    >
                      Restablecer contraseña
                    </h4>
                    <p className="text-sm text-gray-500">
                      Genera una contraseña temporal y la envía al email del
                      usuario.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={resetLoading}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.03] disabled:opacity-50"
                    style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                    data-testid="user-reset-password"
                  >
                    {resetLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    Restablecer
                  </button>
                </div>

                {resetState && (
                  <div
                    className="mt-4 p-4 rounded-lg"
                    style={{ backgroundColor: "rgba(60,204,164,0.10)" }}
                  >
                    <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">
                      Nueva contraseña
                    </p>
                    <div className="flex items-center gap-2">
                      <code
                        className="flex-1 px-3 py-2 bg-white rounded-md font-mono text-sm font-bold border border-gray-200"
                        style={{ color: BRAND_BLUE }}
                      >
                        {resetState.new_password}
                      </code>
                      <button
                        onClick={copyPassword}
                        className="px-3 py-2 bg-white rounded-md border border-gray-200 hover:bg-gray-50"
                        aria-label="Copiar contraseña"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" style={{ color: BRAND_GREEN }} />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <p className="mt-3 text-xs flex items-center gap-1.5 text-gray-600">
                      <Mail className="w-3.5 h-3.5" />
                      {resetState.email_sent
                        ? "Email enviado correctamente al usuario."
                        : "El email no pudo enviarse — pásala manualmente."}
                    </p>
                  </div>
                )}
              </section>

              {/* Búsquedas */}
              <section>
                <h4
                  className="font-bold mb-3"
                  style={{ color: BRAND_BLUE }}
                >
                  Historial de búsquedas
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({data.searches?.length || 0})
                  </span>
                </h4>
                {data.searches?.length ? (
                  <ul className="space-y-2" data-testid="user-detail-searches">
                    {data.searches.map((s, idx) => (
                      <li
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm"
                      >
                        <MapPin
                          className="w-4 h-4"
                          style={{ color: BRAND_GREEN }}
                        />
                        <span className="font-semibold" style={{ color: BRAND_BLUE }}>
                          {s.destination}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                          <Calendar className="w-3.5 h-3.5" />
                          {s.start_date} → {s.end_date}
                        </span>
                        <span className="text-xs text-gray-400 hidden md:inline">
                          {fmtDate(s.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aún no ha hecho ninguna búsqueda.
                  </p>
                )}
              </section>

              {/* Clics */}
              <section>
                <h4
                  className="font-bold mb-3"
                  style={{ color: BRAND_BLUE }}
                >
                  Enlaces clicados
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({data.clicks?.length || 0})
                  </span>
                </h4>
                {data.clicks?.length ? (
                  <ul className="space-y-2" data-testid="user-detail-clicks">
                    {data.clicks.map((c, idx) => (
                      <li
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm"
                      >
                        <ExternalLink
                          className="w-4 h-4"
                          style={{ color: BRAND_GREEN }}
                        />
                        <span className="font-semibold uppercase text-xs tracking-wider" style={{ color: BRAND_BLUE }}>
                          {c.kind || "link"}
                        </span>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate flex-1 text-gray-600 hover:text-gray-900"
                        >
                          {c.url}
                        </a>
                        <span className="text-xs text-gray-400 hidden md:inline flex-shrink-0">
                          {fmtDate(c.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aún no ha clicado ningún enlace.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
