import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("session_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(data);
    } catch {
      localStorage.removeItem("session_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const loginWithEmail = async (email, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("session_token", data.session_token);
    setUser(data.user);
    return data.user;
  };

  const registerWithEmail = async (email, password, name) => {
    const { data } = await axios.post(`${API}/api/auth/register`, {
      email,
      password,
      name,
    });
    // Backend exige verificación de email — NO iniciamos sesión.
    return data;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await axios.post(`${API}/api/auth/google`, {
      credential,
    });
    localStorage.setItem("session_token", data.session_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    const token = localStorage.getItem("session_token");
    try {
      if (token) {
        await axios.post(
          `${API}/api/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          },
        );
      }
    } catch {
      // ignore
    }
    localStorage.removeItem("session_token");
    setUser(null);
  };

  const setSessionFromCallback = (sessionToken, userData) => {
    localStorage.setItem("session_token", sessionToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        setSessionFromCallback,
        refresh: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
