import { useState } from "react";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RangeDatePicker } from "./RangeDatePicker";
import { DestinationAutocomplete } from "./DestinationAutocomplete";

const BRAND_BLUE = "#031834";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const { t } = useTranslation();
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2,
  });

  const update = (partial) => {
    const newData = { ...searchData, ...partial };
    setSearchData(newData);
    if (onSearchDataChange) onSearchDataChange(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.destination && searchData.startDate && searchData.endDate) {
      onSearch(searchData);
    }
  };

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
        className="bg-white rounded-lg shadow-md"
        style={{ border: `4px solid ${BRAND_BLUE}` }}
        data-testid="itinerary-search-form"
      >
        <div className="flex flex-col md:flex-row md:items-stretch md:h-20 rounded-md overflow-visible">
          {/* Bloque 1: Destino */}
          <div className="flex-[1.3] flex items-center gap-3 px-5 py-4 md:py-0 min-h-[60px]">
            <DestinationAutocomplete
              value={searchData.destination}
              onChange={(destination) => update({ destination })}
              placeholder={t("search.destinationPlaceholder")}
              testId="search-destination-input"
            />
          </div>

          <HorizontalDivider />
          <VerticalDivider />

          {/* Bloque 2: Fechas */}
          <div
            data-date-block
            className="flex-[1.8] flex items-center gap-2 px-5 py-4 md:py-0 min-h-[60px]"
          >
            <CalendarIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <RangeDatePicker
              startDate={searchData.startDate}
              endDate={searchData.endDate}
              onChange={({ startDate, endDate }) => update({ startDate, endDate })}
              startPlaceholder={t("search.dateStart")}
              endPlaceholder={t("search.dateEnd")}
              className="flex-1"
              triggerClassName="block w-full text-sm text-gray-800 font-medium truncate"
              anchorSelector="[data-date-block]"
            />
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
              {t("search.customize")}
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
              {t("search.submit")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
