import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

// Lugares válidos para la búsqueda: países, ciudades, pueblos y regiones administrativas.
// Excluimos negocios, aeropuertos, calles y direcciones puntuales.
const INCLUDED_PRIMARY_TYPES = [
  "country",
  "locality",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
];

const newSessionToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback simple
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/**
 * DestinationAutocomplete — Booking-style autocompletado de destinos
 * usando Google Places API (New) Autocomplete.
 *
 * Props:
 *  - value: string (controlled)
 *  - onChange: (newValue: string) => void
 *  - placeholder: string
 */
export const DestinationAutocomplete = ({
  value,
  onChange,
  placeholder,
  testId = "search-destination-input",
}) => {
  const { i18n } = useTranslation();
  const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const sessionTokenRef = useRef(newSessionToken());
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const lastFetchedRef = useRef(""); // último input pedido — evita carreras
  const skipNextFetchRef = useRef(false); // cuando seleccionamos, no refetch

  const langCode = useMemo(
    () => ((i18n.language || "es").toLowerCase().startsWith("en") ? "en" : "es"),
    [i18n.language],
  );

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Llamada al endpoint de Places Autocomplete (New)
  const fetchSuggestions = async (input) => {
    if (!apiKey) return; // sin key, no hacemos nada
    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(PLACES_AUTOCOMPLETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify({
          input,
          languageCode: langCode,
          includedPrimaryTypes: INCLUDED_PRIMARY_TYPES,
          sessionToken: sessionTokenRef.current,
        }),
      });
      if (!res.ok) {
        setSuggestions([]);
        return;
      }
      const data = await res.json();
      const list = (data?.suggestions || [])
        .map((s) => s.placePrediction)
        .filter(Boolean)
        .slice(0, 6);
      // Sólo aplicamos si el input no ha cambiado mientras volvía la respuesta.
      if (lastFetchedRef.current === input) {
        setSuggestions(list);
        setHighlightIndex(list.length > 0 ? 0 : -1);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce: 300ms desde la última tecla.
  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = (value || "").trim();
    lastFetchedRef.current = trimmed;
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(trimmed), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, langCode]);

  const selectSuggestion = (sug) => {
    if (!sug) return;
    const main = sug.structuredFormat?.mainText?.text || "";
    const secondary = sug.structuredFormat?.secondaryText?.text || "";
    const full = secondary ? `${main}, ${secondary}` : main;
    skipNextFetchRef.current = true;
    onChange(full);
    setSuggestions([]);
    setOpen(false);
    setHighlightIndex(-1);
    // La sesión termina al hacer una selección; abrimos token nuevo
    // por si el usuario decide cambiar el destino.
    sessionTokenRef.current = newSessionToken();
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((idx) => (idx + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((idx) =>
        idx <= 0 ? suggestions.length - 1 : idx - 1,
      );
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  const showDropdown =
    open && (loading || suggestions.length > 0) && (value || "").trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full flex items-center gap-3">
      <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0" />
      <input
        type="text"
        name="destination"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-medium bg-transparent"
        required
        data-testid={testId}
      />

      {showDropdown && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-2 w-full md:w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          data-testid="destination-autocomplete-dropdown"
        >
          {loading && suggestions.length === 0 && (
            <div className="px-5 py-4 text-sm text-gray-500">
              {langCode === "en" ? "Searching…" : "Buscando…"}
            </div>
          )}
          {suggestions.map((sug, idx) => {
            const main = sug.structuredFormat?.mainText?.text || sug.text?.text || "";
            const secondary = sug.structuredFormat?.secondaryText?.text || "";
            const isActive = idx === highlightIndex;
            return (
              <button
                type="button"
                key={sug.placeId || `${main}-${idx}`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseDown={(e) => {
                  // mousedown evita que el blur del input cierre antes
                  e.preventDefault();
                  selectSuggestion(sug);
                }}
                className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors ${
                  isActive ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                }`}
                data-testid={`destination-option-${idx}`}
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: "rgba(60, 204, 164, 0.14)" }}
                >
                  <MapPin
                    className="w-4 h-4"
                    style={{ color: "#3ccca4" }}
                    strokeWidth={2.4}
                  />
                </span>
                <span className="flex flex-col min-w-0">
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: "#031834" }}
                  >
                    {main}
                  </span>
                  {secondary && (
                    <span className="text-xs text-gray-500 truncate">
                      {secondary}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
