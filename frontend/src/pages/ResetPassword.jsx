import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { setSessionFromCallback } = useAuth();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const lang = (i18n.language || "es").toLowerCase().startsWith("en") ? "en" : "es";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("resetPassword.tokenMissing"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("resetPassword.passwordTooShort"));
      return;
    }
    if (password !== passwordConfirm) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/reset-password`, {
        token,
        password,
      });
      if (data?.session_token && data?.user) {
        setSessionFromCallback(data.session_token, data.user);
      }
      setDone(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      const msg = err?.response?.data?.detail || t("resetPassword.error");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f7faf9" }}
      data-testid="reset-password-page"
    >
      <Helmet>
        <title>
          {lang === "en"
            ? "Reset password · Visitalo.es"
            : "Restablecer contraseña · Visitalo.es"}
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/visitalo-logo.png" alt="Visítalo.es" className="h-10 w-auto" />
        </div>

        {done ? (
          <div className="text-center" data-testid="reset-password-success">
            <CheckCircle2
              className="w-14 h-14 mx-auto mb-4"
              style={{ color: BRAND_GREEN }}
              strokeWidth={2.2}
            />
            <h1
              className="text-2xl font-bold font-heading mb-3"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              {t("resetPassword.successTitle")}
            </h1>
            <p className="text-sm text-gray-600">{t("resetPassword.successBody")}</p>
          </div>
        ) : (
          <>
            <h1
              className="text-2xl font-bold text-center mb-2 font-heading"
              style={{ color: BRAND_BLUE }}
            >
              {t("resetPassword.title")}
            </h1>
            <p className="text-sm text-center text-gray-500 mb-6">
              {t("resetPassword.subtitle")}
            </p>

            {!token ? (
              <div className="text-center py-6">
                <p className="text-sm text-red-600 mb-4">
                  {t("resetPassword.tokenMissing")}
                </p>
                <Link
                  to="/"
                  className="inline-block py-3 px-6 rounded-lg font-bold transition-all"
                  style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
                  data-testid="reset-password-back"
                >
                  {t("common.gotIt")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" data-testid="reset-password-form">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder={t("resetPassword.newPasswordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    data-testid="reset-password-input"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    data-testid="reset-password-confirm-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                  data-testid="reset-password-submit"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? t("common.processing") : t("resetPassword.submit")}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
