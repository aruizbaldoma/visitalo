import { useState } from "react";
import { MapPin, Calendar as CalendarIcon, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { es } from "date-fns/locale";

const BRAND_BLUE = "#031834";

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
    date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "";
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

  const invalid =
    !searchData.destination || !searchData.startDate || !searchData.endDate;

  const VerticalDivider = () => (
    <div
      className="hidden md:flex w-1 flex-shrink-0 self-stretch items-stretch"
      style={{ margin: "-4px 0" }}
    >
      <div
        className="w-full"
        style={{ backgroundColor: BRAND_BLUE, borderRadius: "4px" }}
      ></div>
    </div>
  );

  const HorizontalDivider = () => (
    <div
      className="md:hidden h-1 w-full flex-shrink-0"
      style={{ backgroundColor: BRAND_BLUE }}
    ></div>
  );

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md overflow-hidden"
        style={{ border: `4px solid ${BRAND_BLUE}` }}
        data-testid="itinerary-search-form"
      >
        <div className="flex flex-col md:flex-row md:items-stretch md:h-20">
          {/* Bloque 1: Destino */}
          <div className="flex-[1.3] flex items-center gap-3 px-5 py-4 md:py-0 min-h-[60px]">
            <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              name="destination"
              placeholder="¿A dónde vas a viajar?"
              value={searchData.destination}
              onChange={handleDestination}
              className="w-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-medium bg-transparent"
              required
              data-testid="search-destination-input"
            />
          </div>

          <HorizontalDivider />
          <VerticalDivider />

          {/* Bloque 2: Fechas */}
          <div className="flex-[1.8] flex items-center gap-2 px-5 py-4 md:py-0 min-h-[60px]">
            <CalendarIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />

            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors focus:outline-none truncate"
                  data-testid="search-start-date-button"
                >
                  <span
                    className={`block truncate ${
                      searchData.startDate ? "text-gray-800 font-medium" : "text-gray-500"
                    }`}
                  >
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
                      searchData.endDate && new Date(searchData.endDate) < d
                        ? ""
                        : searchData.endDate;
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

            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex-1 text-left text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors focus:outline-none truncate"
                  data-testid="search-end-date-button"
                >
                  <span
                    className={`block truncate ${
                      searchData.endDate ? "text-gray-800 font-medium" : "text-gray-500"
                    }`}
                  >
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

          <HorizontalDivider />
          <VerticalDivider />

          {/* Bloque 3: Personalizar */}
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex-[0.9] flex items-center justify-center gap-2 px-4 py-4 md:py-0 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors"
            data-testid="search-personalize-button"
          >
            <img
              src="/favicon.png"
              alt=""
              aria-hidden="true"
              className="w-6 h-6 flex-shrink-0"
            />
            <span className="text-sm font-bold whitespace-nowrap" style={{ color: BRAND_BLUE }}>
              Personalizar
            </span>
          </button>

          <HorizontalDivider />
          <VerticalDivider />

          {/* Bloque 4: Buscar */}
          <button
            type="submit"
            disabled={invalid}
            className="flex-[0.4] flex items-center justify-center gap-2 px-4 py-4 md:py-0 min-h-[56px] font-bold transition-all hover:opacity-90"
            style={{
              backgroundColor: "#3ccca4",
              cursor: invalid ? "not-allowed" : "pointer",
            }}
            data-testid="search-submit-button"
          >
            <Search className="w-5 h-5 md:hidden" style={{ color: BRAND_BLUE }} />
            <span className="whitespace-nowrap" style={{ color: BRAND_BLUE }}>
              ¡Montar mi aventura!
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
