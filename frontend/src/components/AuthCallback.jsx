import { useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API = process.env.REACT_APP_BACKEND_URL;

/**
 * Procesa el session_id devuelto por Emergent Auth tras login con Google.
 * REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
 */
export const AuthCallback = () => {
  const { setSessionFromCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent StrictMode double-execution
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const sessionId = params.get("session_id");

    if (!sessionId) {
      window.location.replace("/");
      return;
    }

    (async () => {
      try {
        const { data } = await axios.post(
          `${API}/api/auth/session`,
          { session_id: sessionId },
          { withCredentials: true },
        );
        setSessionFromCallback(data.session_token, data.user);
        // Clean hash and go home
        window.location.replace("/");
      } catch (err) {
        console.error("Auth callback error:", err);
        window.location.replace("/?auth_error=1");
      }
    })();
  }, [setSessionFromCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#3ccca4] mb-4"></div>
        <p className="text-gray-700 font-medium">Iniciando sesión...</p>
      </div>
    </div>
  );
};
