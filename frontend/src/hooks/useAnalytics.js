import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getCookieConsent } from "../components/CookieBanner";

const API = process.env.REACT_APP_BACKEND_URL;
const VISITOR_ID_KEY = "visitalo_visitor_id";
const HEARTBEAT_MS = 30_000;

const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      // UUIDv4 corto sin dependencias.
      const rand = () =>
        Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      id = `v_${Date.now().toString(36)}_${rand()}${rand()}${rand()}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
};

const consentAllowsAnalytics = () => {
  const c = getCookieConsent();
  return Boolean(c && c.analytics === true);
};

/**
 * Hook que registra page-views y mantiene la presencia online del visitante.
 *
 * - Se monta una sola vez en App.js, dentro de <BrowserRouter>.
 * - Trackea cada cambio de ruta vía POST /api/analytics/track.
 * - Envía heartbeat cada 30s mientras la pestaña esté visible.
 * - Solo activo si el usuario aceptó cookies analíticas (banner GDPR).
 * - Se reactiva sin recargar al recibir el evento `visitalo:cookie-consent`.
 */
export const useAnalytics = () => {
  const location = useLocation();
  const heartbeatRef = useRef(null);
  const consentRef = useRef(consentAllowsAnalytics());

  // Reaccionamos al cambio de consentimiento sin recarga.
  useEffect(() => {
    const onConsent = () => {
      consentRef.current = consentAllowsAnalytics();
    };
    window.addEventListener("visitalo:cookie-consent", onConsent);
    return () => window.removeEventListener("visitalo:cookie-consent", onConsent);
  }, []);

  // 1) Track al cambiar de ruta.
  useEffect(() => {
    if (!consentRef.current) return;
    const visitor_id = getVisitorId();
    const lang =
      typeof document !== "undefined" ? document.documentElement.lang || "" : "";

    axios
      .post(
        `${API}/api/analytics/track`,
        {
          visitor_id,
          path: `${location.pathname}${location.search || ""}`,
          referrer: document.referrer || "",
          lang,
        },
        { withCredentials: true },
      )
      .catch(() => {
        /* silent — analytics no debe romper la app */
      });
  }, [location.pathname, location.search]);

  // 2) Heartbeat periódico mientras la pestaña sea visible.
  useEffect(() => {
    const sendHeartbeat = () => {
      if (!consentRef.current) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      const visitor_id = getVisitorId();
      const lang =
        typeof document !== "undefined" ? document.documentElement.lang || "" : "";
      axios
        .post(
          `${API}/api/analytics/heartbeat`,
          {
            visitor_id,
            path: `${window.location.pathname}${window.location.search || ""}`,
            lang,
          },
          { withCredentials: true },
        )
        .catch(() => {
          /* silent */
        });
    };

    // Primer heartbeat inmediato cuando llega consentimiento.
    sendHeartbeat();
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") sendHeartbeat();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
};
