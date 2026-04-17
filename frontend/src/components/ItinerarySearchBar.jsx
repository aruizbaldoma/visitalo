import { useState } from "react";
import { MapPin, Calendar, Search, Settings } from "lucide-react";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const getDateDisplay = () => {
    if (searchData.startDate && searchData.endDate) {
      return `${formatDate(searchData.startDate)} - ${formatDate(searchData.endDate)}`;
    }
    return "Fecha Ida - Fecha Vuelta";
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-2" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-2">
          {/* Destino */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 border-r border-gray-200">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Destino
              </label>
              <input
                type="text"
                name="destination"
                placeholder="¿A dónde viajas?"
                value={searchData.destination}
                onChange={handleChange}
                className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Fechas (Ida y Vuelta) - Campo único clickable */}
          <div className="flex-1 relative">
            <div 
              className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 cursor-pointer hover:bg-gray-50"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ida y vuelta
                </label>
                <div className={`text-sm ${searchData.startDate && searchData.endDate ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {getDateDisplay()}
                </div>
              </div>
            </div>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDatePicker(false)}
                />
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-20" style={{ minWidth: '320px' }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Fecha Ida
                      </label>
                      <input
                        type="date"
                        value={searchData.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Fecha Vuelta
                      </label>
                      <input
                        type="date"
                        value={searchData.endDate}
                        min={searchData.startDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="w-full py-2 text-sm font-medium text-white rounded-md"
                      style={{ backgroundColor: '#3ccca4' }}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Personalizar (reemplaza a Viajeros) */}
          <div 
            className="flex items-center gap-2 px-4 py-3 border-r border-gray-200 cursor-pointer hover:bg-gray-50"
            onClick={onOpenDetails}
          >
            <Settings className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Personalizar
              </label>
              <div className="text-sm text-gray-800">
                Mi viaje
              </div>
            </div>
          </div>

          {/* Botón Buscar Integrado */}
          <div className="flex items-center gap-2 pl-2">
            <button
              type="submit"
              disabled={!searchData.destination || !searchData.startDate || !searchData.endDate}
              className="px-8 py-4 font-bold text-white rounded-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
