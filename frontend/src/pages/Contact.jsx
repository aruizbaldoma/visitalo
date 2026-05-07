import { Helmet } from "react-helmet-async";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ContactSection } from "../components/ContactSection";

const COPY = {
  es: {
    htmlLang: "es",
    canonical: "https://visitalo.es/contacto",
    altUrl: "https://visitalo.es/contact",
    title: "Contacto · Visitalo.es",
    description:
      "Escríbenos y te respondemos en menos de 24h. Cuéntanos qué necesitas y te ayudamos a montar tu próximo viaje.",
  },
  en: {
    htmlLang: "en",
    canonical: "https://visitalo.es/contact",
    altUrl: "https://visitalo.es/contacto",
    title: "Contact · Visitalo.es",
    description:
      "Drop us a line and we'll reply within 24h. Tell us what you need and we'll help you plan your next trip.",
  },
};

export default function Contact({ lang = "es" }) {
  const c = COPY[lang] || COPY.es;
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <Helmet>
        <html lang={c.htmlLang} />
        <title>{c.title}</title>
        <meta name="description" content={c.description} />
        <link rel="canonical" href={c.canonical} />
        <link rel="alternate" hrefLang={lang === "es" ? "en" : "es"} href={c.altUrl} />
        <link rel="alternate" hrefLang={lang} href={c.canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.description} />
        <meta property="og:url" content={c.canonical} />
      </Helmet>
      <Header />
      <main className="flex-1">
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
