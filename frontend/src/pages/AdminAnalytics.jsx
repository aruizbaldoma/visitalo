import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Users,
  Eye,
  UserPlus,
  Compass,
  ExternalLink,
  Smartphone,
  Globe,
  Activity,
  TrendingUp,
} from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;

const adminFetch = async (path) => {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Error");
  return res.json();
};

const RANGES = [
  { key: "24h", label: "24h" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "90d", label: "90 días" },
];

const fmtSeconds = (s) => {
  if (!s || s < 0) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const fmtAgo = (s) => {
  if (s == null) return "—";
  if (s < 5) return "ahora";
  if (s < 60) return `hace ${s}s`;
  return `hace ${Math.floor(s / 60)}m`;
};

const KpiCard = ({ icon: Icon, label, value, hint, color = BRAND_GREEN }) => (
  <div
    className="bg-white rounded-2xl border border-gray-200 p-5"
    data-testid={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}
  >
    <div className="flex items-center gap-2 mb-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}22`, color: BRAND_BLUE }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
    </div>
    <p className="text-3xl font-bold font-heading" style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}>
      {Number(value || 0).toLocaleString("es-ES")}
    </p>
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const RankingList = ({ title, items, icon: Icon, valueLabel = "" }) => {
  const max = Math.max(1, ...(items || []).map((x) => x.value || 0));
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4" style={{ color: BRAND_GREEN }} />}
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND_BLUE }}>
          {title}
        </h3>
      </div>
      {(!items || items.length === 0) && (
        <p className="text-xs text-gray-400 py-4 text-center">Sin datos en este rango.</p>
      )}
      <ul className="space-y-2.5">
        {(items || []).slice(0, 10).map((it) => (
          <li key={it.label} className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="truncate flex-1 mr-3" style={{ color: BRAND_BLUE }}>
                {it.label}
              </span>
              <span className="font-semibold tabular-nums">
                {Number(it.value).toLocaleString("es-ES")}
                {valueLabel ? ` ${valueLabel}` : ""}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((it.value / max) * 100)}%`,
                  backgroundColor: BRAND_GREEN,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Sparkline = ({ data }) => {
  // Mini-gráfico SVG sin dependencias — barra por día (visitantes únicos).
  const w = 720;
  const h = 120;
  const pad = 8;
  const max = Math.max(1, ...(data || []).map((d) => d.unique_visitors || 0));
  const barW = ((w - pad * 2) / Math.max(1, data?.length || 30)) * 0.78;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 col-span-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND_BLUE }}>
          Visitantes únicos · últimos 30 días
        </h3>
      </div>
      {(!data || data.length === 0) ? (
        <p className="text-xs text-gray-400 py-4 text-center">
          Aún no hay tráfico registrado.
        </p>
      ) : (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
          {data.map((d, i) => {
            const x = pad + i * ((w - pad * 2) / data.length);
            const barH = ((d.unique_visitors || 0) / max) * (h - pad * 2 - 18);
            const y = h - pad - barH - 14;
            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(2, barH)}
                  fill={BRAND_GREEN}
                  rx="2"
                />
                {i % Math.ceil(data.length / 6) === 0 && (
                  <text
                    x={x + barW / 2}
                    y={h - 2}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

const Funnel = ({ funnel }) => {
  const steps = [
    { key: "visitors", label: "Visitantes únicos" },
    { key: "searches", label: "Búsquedas" },
    { key: "signups", label: "Registros" },
    { key: "affiliate_clicks", label: "Clics a afiliados" },
  ];
  const max = Math.max(1, ...steps.map((s) => funnel?.[s.key] || 0));
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4" style={{ color: BRAND_GREEN }} />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: BRAND_BLUE }}>
          Embudo de conversión
        </h3>
      </div>
      <ul className="space-y-3">
        {steps.map((s, i) => {
          const value = funnel?.[s.key] || 0;
          const prev = i === 0 ? value : funnel?.[steps[i - 1].key] || 0;
          const pct = prev > 0 ? Math.round((value / prev) * 100) : null;
          return (
            <li key={s.key} className="text-sm">
              <div className="flex items-center justify-between mb-1">
                <span style={{ color: BRAND_BLUE }}>{s.label}</span>
                <span className="font-semibold tabular-nums">
                  {value.toLocaleString("es-ES")}
                  {i > 0 && pct !== null && (
                    <span className="text-xs text-gray-400 ml-2">({pct}%)</span>
                  )}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((value / max) * 100)}%`,
                    backgroundColor: BRAND_GREEN,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const LiveTable = ({ items }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" data-testid="live-table">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead style={{ backgroundColor: "#f7faf9" }}>
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-5 py-3">Visitante</th>
            <th className="px-5 py-3">Página</th>
            <th className="px-5 py-3">País</th>
            <th className="px-5 py-3">Dispositivo</th>
            <th className="px-5 py-3">En sesión</th>
            <th className="px-5 py-3">Última señal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.visitor_id} className="border-t border-gray-100">
              <td className="px-5 py-3">
                {it.is_authenticated ? (
                  <div className="flex items-center gap-2">
                    {it.user_picture ? (
                      <img
                        src={it.user_picture}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "rgba(60,204,164,0.18)", color: BRAND_BLUE }}
                      >
                        {(it.user_name || it.user_email || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-xs truncate" style={{ color: BRAND_BLUE }}>
                        {it.user_name || "—"}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{it.user_email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    Anónimo
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-xs font-mono text-gray-600 max-w-xs truncate">
                {it.path}
              </td>
              <td className="px-5 py-3 text-xs">{it.country}</td>
              <td className="px-5 py-3 text-xs capitalize">
                {it.device} · {it.browser}
              </td>
              <td className="px-5 py-3 text-xs">{fmtSeconds(it.seconds_in_session)}</td>
              <td className="px-5 py-3 text-xs text-gray-500">{fmtAgo(it.seconds_ago)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-gray-500 text-sm">
                Nadie navegando ahora mismo. Cuando alguien acepte cookies analíticas y entre, aparecerá aquí en directo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function AdminAnalytics() {
  const [range, setRange] = useState("7d");
  const [stats, setStats] = useState(null);
  const [live, setLive] = useState({ online: 0, items: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  // Fetch stats al cambiar el rango.
  useEffect(() => {
    setLoadingStats(true);
    setError("");
    adminFetch(`/api/admin/analytics/stats?range=${range}`)
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingStats(false));
  }, [range]);

  // Live: pull cada 5s.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await adminFetch(`/api/admin/analytics/live`);
        if (!cancelled) setLive(data);
      } catch {
        /* silent */
      }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const conversion = useMemo(() => {
    if (!stats?.funnel) return null;
    const v = stats.funnel.visitors || 0;
    const c = stats.funnel.affiliate_clicks || 0;
    return v > 0 ? ((c / v) * 100).toFixed(2) : "0.00";
  }, [stats]);

  return (
    <div className="space-y-8" data-testid="admin-analytics">
      {/* LIVE */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#22c55e" }}
              />
              <Activity className="w-5 h-5" style={{ color: BRAND_BLUE }} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading" style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}>
                {live.online} {live.online === 1 ? "persona viendo" : "personas viendo"} Visitalo.es ahora
              </h3>
              <p className="text-xs text-gray-500">Refresco automático cada 5 segundos · ventana 90s</p>
            </div>
          </div>
        </div>
        <LiveTable items={live.items || []} />
      </section>

      {/* STATS */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold font-heading" style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}>
            Estadísticas
          </h3>
          <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                style={
                  range === r.key
                    ? { backgroundColor: BRAND_BLUE, color: "#fff" }
                    : { color: BRAND_BLUE }
                }
                data-testid={`range-${r.key}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-lg mb-4"
            style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        {loadingStats && !stats && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: BRAND_GREEN }} />
          </div>
        )}

        {stats && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <KpiCard
                icon={Users}
                label="Visitantes únicos"
                value={stats.kpis?.unique_visitors}
              />
              <KpiCard icon={Eye} label="Páginas vistas" value={stats.kpis?.page_views} />
              <KpiCard
                icon={UserPlus}
                label="Registros nuevos"
                value={stats.kpis?.new_signups}
              />
              <KpiCard
                icon={Compass}
                label="Búsquedas"
                value={stats.kpis?.searches}
              />
              <KpiCard
                icon={ExternalLink}
                label="Clics afiliados"
                value={stats.kpis?.affiliate_clicks}
                hint={conversion ? `Conv. ${conversion}% sobre visitas` : undefined}
              />
            </div>

            {/* Funnel + Sparkline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <Funnel funnel={stats.funnel} />
              <div className="lg:col-span-2">
                <Sparkline data={stats.daily_series} />
              </div>
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RankingList
                title="Top destinos buscados"
                items={stats.top_destinations}
                icon={Compass}
              />
              <RankingList
                title="Top páginas"
                items={stats.top_pages}
                icon={Eye}
              />
              <RankingList
                title="Top afiliados clicados"
                items={stats.top_affiliates}
                icon={ExternalLink}
              />
              <RankingList
                title="Origen del tráfico"
                items={stats.referrers}
              />
              <RankingList
                title="Dispositivo"
                items={stats.devices}
                icon={Smartphone}
              />
              <RankingList
                title="Top países"
                items={stats.countries}
                icon={Globe}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
