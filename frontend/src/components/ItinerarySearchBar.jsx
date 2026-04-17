import { useState } from "react";
import { MapPin, Calendar, Users, Search } from "lucide-react";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...searchData, [name]: value };
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

          {/* Fechas (Ida y Vuelta) */}
          <div className="flex-1 flex items-center gap-2 px-4 py-3 border-r border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ida
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={searchData.startDate}
                  onChange={handleChange}
                  className="w-full text-sm text-gray-800 focus:outline-none"
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Vuelta
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={searchData.endDate}
                  min={searchData.startDate}
                  onChange={handleChange}
                  className="w-full text-sm text-gray-800 focus:outline-none"
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Personas */}
          <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200">
            <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Viajeros
              </label>
              <select
                name="travelers"
                value={searchData.travelers}
                onChange={handleChange}
                className="text-sm text-gray-800 focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
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

        {/* Link Personalizar */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onOpenDetails}
            className="text-sm font-medium hover:underline"
            style={{ color: '#3ccca4' }}
          >
            + Personalizar mi viaje (vuelos, hotel, preferencias)
          </button>
        </div>
      </form>
    </div>
  );
};
