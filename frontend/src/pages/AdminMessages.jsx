import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, MessageSquare } from "lucide-react";

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

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    adminFetch(`/api/admin/contact-messages?limit=300`)
      .then((d) => setMessages(d.messages || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="admin-messages">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: BRAND_GREEN }} />
      </div>
    );
  }

  return (
    <div data-testid="admin-messages">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-heading" style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}>
            Mensajes de contacto
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Total: {messages.length} {messages.length === 1 ? "mensaje" : "mensajes"}
          </p>
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

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#f7faf9" }}>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Recibido</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Teléfono</th>
                <th className="px-5 py-3">Comentario</th>
                <th className="px-5 py-3 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m, i) => (
                <tr
                  key={`${m.created_at}-${i}`}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelected(m)}
                  data-testid={`msg-row-${i}`}
                >
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {fmtDate(m.created_at)}
                  </td>
                  <td className="px-5 py-3 font-semibold" style={{ color: BRAND_BLUE }}>
                    {m.first_name} {m.last_name}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <a
                      href={`mailto:${m.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                      style={{ color: BRAND_BLUE }}
                    >
                      {m.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <a
                      href={`tel:${m.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                      style={{ color: BRAND_BLUE }}
                    >
                      {m.phone}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-md truncate">
                    {m.comment || "—"}
                  </td>
                  <td className="px-5 py-3 text-center text-xs tabular-nums">
                    {typeof m.recaptcha_score === "number"
                      ? m.recaptcha_score.toFixed(2)
                      : "—"}
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    Aún no has recibido ningún mensaje.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(3,24,52,0.4)" }}
          onClick={() => setSelected(null)}
          data-testid="msg-detail"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-bold font-heading mb-1" style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}>
              {selected.first_name} {selected.last_name}
            </h4>
            <p className="text-xs text-gray-500 mb-4">{fmtDate(selected.created_at)}</p>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${selected.email}`} className="hover:underline" style={{ color: BRAND_BLUE }}>
                  {selected.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${selected.phone}`} className="hover:underline" style={{ color: BRAND_BLUE }}>
                  {selected.phone}
                </a>
              </li>
            </ul>
            {selected.comment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Comentario
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: BRAND_BLUE }}>
                  {selected.comment}
                </p>
              </div>
            )}
            <button
              onClick={() => setSelected(null)}
              className="w-full py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
              data-testid="msg-detail-close"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
