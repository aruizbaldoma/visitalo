import { createContext, useContext, useEffect, useState } from "react";

const ItineraryContext = createContext(null);

const STORAGE_KEY = "visitalo:current_itinerary";

export const ItineraryProvider = ({ children }) => {
  // Rehidratar desde sessionStorage para soportar refresh en /ruta
  const [itinerary, setItineraryState] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isMockMode, setIsMockMode] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [travelDetails, setTravelDetails] = useState(null);

  // Persistir el itinerario en sessionStorage
  useEffect(() => {
    try {
      if (itinerary) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(itinerary));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* noop */
    }
  }, [itinerary]);

  const setItinerary = (data) => setItineraryState(data);
  const clearItinerary = () => setItineraryState(null);

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
        setItinerary,
        clearItinerary,
        isMockMode,
        setIsMockMode,
        searchParams,
        setSearchParams,
        travelDetails,
        setTravelDetails,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};

export const useItinerary = () => {
  const ctx = useContext(ItineraryContext);
  if (!ctx) {
    throw new Error("useItinerary debe usarse dentro de <ItineraryProvider>");
  }
  return ctx;
};
