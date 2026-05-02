import { useState } from "react";
import { X, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;

export const AuthModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(null); // { email }
  const [inlineError, setInlineError] = useState(null); // { message, kind }
  const [rememberMe, setRememberMe] = useState(false);

  if (!isOpen) return null;

  const switchToLoginWithEmail = () => {
    setMode("login");
    setInlineError(null);
    setEmailConfirm("");
    setPassword("");
    setPasswordConfirm("");
    setName("");
  };

  const handleForgotPassword = async () => {
    const target = email.trim().toLowerCase();
    if (!target) {
      toast.error(t("auth.forgotPasswordEmpty"));
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email: target });
      toast.success(t("auth.forgotPasswordSent"));
      setInlineError(null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || t("auth.forgotPasswordError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const userBefore = localStorage.getItem("session_token");
      const newUser = await loginWithGoogle(credentialResponse.credential);
      // Es nuevo si no había token antes y el usuario no tiene first_trip_used
      if (!userBefore && newUser && newUser.first_trip_used === false) {
        window.dispatchEvent(new Event("visitalo:welcome"));
      } else {
        toast.success(t("auth.welcome"));
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || t("auth.googleLoginError");
      toast.error(msg);
    }
  };

  const handleGoogleError = () => {
    toast.error(t("auth.googleError"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError(null);

    if (mode === "register") {
      if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
        toast.error(t("auth.emailMismatch"));
        return;
      }
      if (password !== passwordConfirm) {
        toast.error(t("auth.passwordMismatch"));
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password, rememberMe);
        toast.success(t("auth.welcomeBack"));
        onClose();
      } else {
        const result = await registerWithEmail(email, password, name);
        // Backend devuelve { ok, verification_required, email } — NO inicia sesión.
        if (result?.verification_required) {
          setRegisterSuccess({ email: result.email || email });
        } else {
          // Compatibilidad con flujo antiguo (no debería ocurrir).
          window.dispatchEvent(new Event("visitalo:welcome"));
          onClose();
        }
      }
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      // Caso especial: email ya registrado en signup → mostramos banner inline
      // con CTA para cambiar a login con el email pre-rellenado.
      if (
        mode === "register" &&
        status === 400 &&
        typeof detail === "string" &&
        /ya est[áa] registrado|already registered/i.test(detail)
      ) {
        setInlineError({ kind: "duplicate-email" });
        return;
      }

      const message =
        detail || (mode === "login" ? t("auth.badCredentials") : t("auth.registerError"));
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
          aria-label={t("common.close")}
          data-testid="auth-modal-close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-4">
            <img src="/visitalo-logo.png" alt="Visítalo.es" className="h-10 w-auto" />
          </div>

          {registerSuccess ? (
            <div className="text-center" data-testid="auth-verify-sent">
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5"
                style={{ backgroundColor: "rgba(60,204,164,0.14)" }}
              >
                <Mail className="w-7 h-7" style={{ color: BRAND_GREEN }} strokeWidth={2.2} />
              </div>
              <h2
                className="text-xl font-bold font-heading mb-3"
                style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
              >
                {t("auth.verifySentTitle")}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                {t("auth.verifySentBody1")}
              </p>
              <p
                className="text-sm font-bold mb-5"
                style={{ color: BRAND_BLUE }}
              >
                {registerSuccess.email}
              </p>
              <p className="text-xs text-gray-500 mb-6">
                {t("auth.verifySentBody2")}
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg font-bold transition-all"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="auth-verify-close"
              >
                {t("common.gotIt")}
              </button>
            </div>
          ) : (
            <>

          <h2
            className="text-2xl font-bold text-center mb-2 font-heading"
            style={{ color: BRAND_BLUE }}
          >
            {mode === "login" ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            {mode === "login" ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
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
              locale={t("auth.googleLocale")}
              width="368"
            />
          </div>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-3 text-xs text-gray-400 uppercase tracking-wide">{t("auth.dividerOr")}</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Formulario Email */}
          {inlineError?.kind === "duplicate-email" && mode === "register" && (
            <div
              className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2"
              data-testid="auth-duplicate-email-banner"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-800 leading-snug">
                  {t("auth.emailAlreadyRegistered")}
                </p>
                <button
                  type="button"
                  onClick={switchToLoginWithEmail}
                  className="mt-1.5 text-sm font-bold underline underline-offset-2 hover:no-underline"
                  style={{ color: BRAND_BLUE }}
                  data-testid="auth-duplicate-email-go-login"
                >
                  {t("auth.emailAlreadyRegisteredCta")} →
                </button>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={submitting}
                    className="text-xs text-gray-600 underline underline-offset-2 hover:text-gray-900 disabled:opacity-60"
                    data-testid="auth-duplicate-email-forgot"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3" data-testid="auth-email-form">
            {mode === "register" && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("auth.namePlaceholder")}
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
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (inlineError) setInlineError(null);
                }}
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                data-testid="auth-email-input"
              />
            </div>
            {mode === "register" && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder={t("auth.emailConfirmPlaceholder")}
                  value={emailConfirm}
                  onChange={(e) => setEmailConfirm(e.target.value)}
                  required
                  onPaste={(e) => e.preventDefault()}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  data-testid="auth-email-confirm-input"
                />
              </div>
            )}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                data-testid="auth-password-input"
              />
            </div>
            {mode === "login" && (
              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: BRAND_GREEN }}
                    data-testid="auth-remember-me"
                  />
                  <span>{t("auth.rememberMe")}</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={submitting}
                  className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 disabled:opacity-60"
                  data-testid="auth-forgot-password"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
            )}
            {mode === "register" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder={t("auth.passwordConfirmPlaceholder")}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  data-testid="auth-password-confirm-input"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-60"
              style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
              data-testid="auth-submit-button"
            >
              {submitting
                ? t("common.processing")
                : mode === "login"
                ? t("auth.submitLogin")
                : t("auth.submitRegister")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  onClick={() => setMode("register")}
                  className="font-bold"
                  style={{ color: BRAND_BLUE }}
                  data-testid="auth-toggle-register"
                >
                  {t("auth.register")}
                </button>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold"
                  style={{ color: BRAND_BLUE }}
                  data-testid="auth-toggle-login"
                >
                  {t("auth.login")}
                </button>
              </>
            )}
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
