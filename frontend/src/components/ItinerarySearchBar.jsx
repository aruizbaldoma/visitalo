import { useState } from "react";
import { MapPin, Calendar, Search, Sparkles } from "lucide-react";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...searchData, [name]: value };
    setSearchData(newData);
    if (onSearchDataChange) {
      onSearchDataChange(newData);
    }
  };

  const handleDateChange = (field, value) => {
    const newData = { ...searchData, [field]: value };
    setSearchData(newData);
    if (onSearchDataChange) {
      onSearchDataChange(newData);
    }
    // Close the picker after selection
    if (field === 'startDate') {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.destination && searchData.startDate && searchData.endDate) {
      onSearch(searchData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    return `${day} ${month}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-3" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-0">
          {/* Destino - Una sola línea */}
          <div className="flex-1 flex items-center gap-3 px-5 py-4 border-r border-gray-200">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              name="destination"
              placeholder="¿A dónde vas a viajar?"
              value={searchData.destination}
              onChange={handleChange}
              className="w-full text-sm text-gray-800 placeholder-gray-500 focus:outline-none font-medium"
              required
            />
          </div>

          {/* Fechas - Una sola línea horizontal */}
          <div className="flex-[2] flex items-center gap-2 px-5 py-4 border-r border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            
            {/* Llegada Button */}
            <div className="flex-1 relative">
              <button
                type="button"
                className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowStartDatePicker(!showStartDatePicker);
                  setShowEndDatePicker(false);
                }}
              >
                <div className={`text-sm ${searchData.startDate ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {searchData.startDate ? formatDate(searchData.startDate) : 'Llegada'}
                </div>
              </button>

              {/* Start Date Picker Dropdown */}
              {showStartDatePicker && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowStartDatePicker(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20" style={{ minWidth: '280px' }}>
                    <input
                      type="date"
                      value={searchData.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Separator */}
            <div className="text-gray-400 text-sm">-</div>

            {/* Regreso Button */}
            <div className="flex-1 relative">
              <button
                type="button"
                className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowEndDatePicker(!showEndDatePicker);
                  setShowStartDatePicker(false);
                }}
              >
                <div className={`text-sm ${searchData.endDate ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {searchData.endDate ? formatDate(searchData.endDate) : 'Regreso'}
                </div>
              </button>

              {/* End Date Picker Dropdown */}
              {showEndDatePicker && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowEndDatePicker(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20" style={{ minWidth: '280px' }}>
                    <input
                      type="date"
                      value={searchData.endDate}
                      min={searchData.startDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Personalizar */}
          <div 
            className="flex items-center gap-3 px-5 py-4 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onOpenDetails}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: '#3ccca4' }} />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Personalizar
            </span>
          </div>

          {/* Botón Buscar */}
          <div className="flex items-center pl-2">
            <button
              type="submit"
              disabled={!searchData.destination || !searchData.startDate || !searchData.endDate}
              className="px-8 py-5 font-bold text-white rounded-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: '#3ccca4' }}
            >
              <Search className="w-5 h-5" />
              <span className="whitespace-nowrap">Buscar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
