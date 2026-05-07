import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, User as UserIcon, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { executeRecaptcha } from "../utils/recaptcha";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";
const API = process.env.REACT_APP_BACKEND_URL;
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

const initialForm = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  comment: "",
};

export const ContactSection = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const sectionRef = useRef(null);

  // Si la URL trae #contacto al cargar la home, hacemos scroll suave.
  useEffect(() => {
    if (window.location.hash === "#contacto" && sectionRef.current) {
      // Pequeño delay para asegurar que la página completa está montada.
      setTimeout(() => {
        sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
    const onHashChange = () => {
      if (window.location.hash === "#contacto" && sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error(t("contact.errorMissing"));
      return;
    }
    setSubmitting(true);
    try {
      let recaptcha_token = "";
      if (RECAPTCHA_SITE_KEY) {
        try {
          recaptcha_token = await executeRecaptcha(RECAPTCHA_SITE_KEY, "contact");
        } catch {
          toast.error(t("contact.errorRecaptcha"));
          setSubmitting(false);
          return;
        }
      }
      await axios.post(`${API}/api/contact`, {
        ...form,
        recaptcha_token,
      });
      setDone(true);
      setForm(initialForm);
    } catch (err) {
      const msg = err?.response?.data?.detail || t("contact.errorGeneric");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contacto"
      ref={sectionRef}
      className="py-20"
      style={{ backgroundColor: "#f7faf9", scrollMarginTop: "80px" }}
      data-testid="contact-section"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: BRAND_GREEN }}
            >
              {t("contact.eyebrow")}
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold font-heading mb-3"
              style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
            >
              {t("contact.title")}
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              {t("contact.subtitle")}
            </p>
          </div>

          {done ? (
            <div
              className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm"
              data-testid="contact-success"
            >
              <CheckCircle2
                className="w-14 h-14 mx-auto mb-4"
                style={{ color: BRAND_GREEN }}
                strokeWidth={2.2}
              />
              <h3
                className="text-2xl font-bold font-heading mb-3"
                style={{ color: BRAND_BLUE, letterSpacing: "-0.02em" }}
              >
                {t("contact.successTitle")}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{t("contact.successBody")}</p>
              <button
                onClick={() => setDone(false)}
                className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND_BLUE, color: "#fff" }}
                data-testid="contact-send-another"
              >
                {t("contact.sendAnother")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm"
              data-testid="contact-form"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("contact.firstNamePlaceholder")}
                    value={form.first_name}
                    onChange={update("first_name")}
                    required
                    maxLength={80}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    style={{ "--tw-ring-color": BRAND_GREEN }}
                    data-testid="contact-first-name"
                  />
                </div>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("contact.lastNamePlaceholder")}
                    value={form.last_name}
                    onChange={update("last_name")}
                    required
                    maxLength={80}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    data-testid="contact-last-name"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder={t("contact.phonePlaceholder")}
                    value={form.phone}
                    onChange={update("phone")}
                    required
                    maxLength={40}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    data-testid="contact-phone"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder={t("contact.emailPlaceholder")}
                    value={form.email}
                    onChange={update("email")}
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                    data-testid="contact-email"
                  />
                </div>
              </div>

              <div className="relative mt-3 md:mt-4">
                <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  placeholder={t("contact.commentPlaceholder")}
                  value={form.comment}
                  onChange={update("comment")}
                  rows={4}
                  maxLength={2000}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                  data-testid="contact-comment"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 py-3.5 rounded-lg font-bold transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                data-testid="contact-submit"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? t("contact.submitting") : t("contact.submit")}
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
                {t("contact.recaptchaNotice")}{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {t("contact.recaptchaPrivacy")}
                </a>{" "}
                {t("contact.recaptchaAnd")}{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {t("contact.recaptchaTerms")}
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
