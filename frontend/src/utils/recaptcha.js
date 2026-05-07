// Carga el script de reCAPTCHA v3 una sola vez y devuelve un Promise<grecaptcha>.
let loadingPromise = null;

export const loadRecaptcha = (siteKey) => {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.grecaptcha?.execute) return Promise.resolve(window.grecaptcha);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-recaptcha="v3"]');
    if (existing) {
      existing.addEventListener("load", () =>
        window.grecaptcha.ready(() => resolve(window.grecaptcha)),
      );
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.async = true;
    s.defer = true;
    s.dataset.recaptcha = "v3";
    s.onload = () => window.grecaptcha.ready(() => resolve(window.grecaptcha));
    s.onerror = () => {
      loadingPromise = null;
      reject(new Error("recaptcha-script-failed"));
    };
    document.head.appendChild(s);
  });
  return loadingPromise;
};

export const executeRecaptcha = async (siteKey, action = "contact") => {
  const grecaptcha = await loadRecaptcha(siteKey);
  return grecaptcha.execute(siteKey, { action });
};
