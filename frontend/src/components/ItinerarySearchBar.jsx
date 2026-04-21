import { useState } from "react";
import { MapPin, Calendar as CalendarIcon, Search, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { es } from "date-fns/locale";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2,
  });

  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const update = (partial) => {
    const newData = { ...searchData, ...partial };
    setSearchData(newData);
    if (onSearchDataChange) onSearchDataChange(newData);
  };

  const handleDestination = (e) => update({ destination: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.destination && searchData.startDate && searchData.endDate) {
      onSearch(searchData);
    }
  };

  const toISO = (date) =>
    date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : "";

  const parseISO = (iso) => (iso ? new Date(iso + "T00:00:00") : undefined);

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso + "T00:00:00");
    const dayOfWeek = date.toLocaleDateString("es-ES", { weekday: "short" });
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });
    const dayCapitalized = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    return `${dayCapitalized}, ${day} ${month}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md overflow-hidden"
        style={{ border: "4px solid #003580", height: "80px", minHeight: "80px", maxHeight: "80px" }}
        data-testid="itinerary-search-form"
      >
        <div className="flex items-stretch" style={{ height: "100%" }}>
          {/* Bloque 1: Destino */}
          <div className="flex-[1.3] flex items-center gap-3 px-5">
            <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              name="destination"
              placeholder="¿A dónde vas a viajar?"
              value={searchData.destination}
              onChange={handleDestination}
              className="w-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-medium"
              required
              data-testid="search-destination-input"
            />
          </div>

          <div className="w-1 flex-shrink-0 self-stretch flex items-stretch" style={{ margin: "-4px 0" }}>
            <div className="w-full" style={{ backgroundColor: "#003580", borderRadius: "4px" }}></div>
          </div>

          {/* Bloque 2: Fechas */}
          <div className="flex-[1.8] flex items-center gap-2 px-5">
            <CalendarIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />

            {/* Fecha de llegada */}
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors focus:outline-none"
                  data-testid="search-start-date-button"
                >
                  <span className={searchData.startDate ? "text-gray-800 font-medium" : "text-gray-500"}>
                    {searchData.startDate ? formatDate(searchData.startDate) : "Fecha de llegada"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="start">
                <Calendar
                  mode="single"
                  locale={es}
                  weekStartsOn={1}
                  selected={parseISO(searchData.startDate)}
                  onSelect={(d) => {
                    if (!d) return;
                    const iso = toISO(d);
                    const endIso =
                      searchData.endDate && new Date(searchData.endDate) < d ? "" : searchData.endDate;
                    update({ startDate: iso, endDate: endIso });
                    setStartOpen(false);
                    setTimeout(() => setEndOpen(true), 150);
                  }}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="text-gray-600 text-base font-bold px-1">—</div>

            {/* Fecha de salida */}
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors focus:outline-none"
                  data-testid="search-end-date-button"
                >
                  <span className={searchData.endDate ? "text-gray-800 font-medium" : "text-gray-500"}>
                    {searchData.endDate ? formatDate(searchData.endDate) : "Fecha de salida"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="start">
                <Calendar
                  mode="single"
                  locale={es}
                  weekStartsOn={1}
                  selected={parseISO(searchData.endDate)}
                  onSelect={(d) => {
                    if (!d) return;
                    update({ endDate: toISO(d) });
                    setEndOpen(false);
                  }}
                  disabled={(date) => {
                    const min = searchData.startDate ? parseISO(searchData.startDate) : today;
                    return date < min;
                  }}
                  defaultMonth={
                    searchData.startDate ? parseISO(searchData.startDate) : undefined
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="w-1 flex-shrink-0 self-stretch flex items-stretch" style={{ margin: "-4px 0" }}>
            <div className="w-full" style={{ backgroundColor: "#003580", borderRadius: "4px" }}></div>
          </div>

          {/* Bloque 3: Personalizar */}
          <div
            className="flex-[0.9] flex items-center justify-center gap-2 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onOpenDetails}
            data-testid="search-personalize-button"
          >
            <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: "#3ccca4" }} />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">Personalizar</span>
          </div>

          <div className="w-1 flex-shrink-0 self-stretch flex items-stretch" style={{ margin: "-4px 0" }}>
            <div className="w-full" style={{ backgroundColor: "#003580", borderRadius: "4px" }}></div>
          </div>

          {/* Bloque 4: Buscar */}
          <button
            type="submit"
            disabled={!searchData.destination || !searchData.startDate || !searchData.endDate}
            className="flex-[0.4] flex items-center justify-center px-4 font-bold transition-all hover:opacity-90"
            style={{
              backgroundColor: "#3ccca4",
              cursor:
                !searchData.destination || !searchData.startDate || !searchData.endDate
                  ? "not-allowed"
                  : "pointer",
            }}
            data-testid="search-submit-button"
          >
            <span className="whitespace-nowrap" style={{ color: "#003580" }}>
              Buscar
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
