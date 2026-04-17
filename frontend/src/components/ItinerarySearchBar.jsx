import { useState, useRef } from "react";
import { MapPin, Calendar, Search, Sparkles } from "lucide-react";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails, onSearchDataChange }) => {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 2
  });
  
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    // Capitalizar primera letra del día
    const dayCapitalized = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    return `${dayCapitalized}, ${day} ${month}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ border: '4px solid #003580' }}>
        <div className="flex items-center">
          {/* Destino - Ligeramente más ancho */}
          <div className="flex-[1.3] flex items-center gap-3 px-5 py-4" style={{ borderRight: '2px solid #003580' }}>
            <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0" />
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
          <div className="flex-1 flex items-center gap-2 px-5 py-4" style={{ borderRight: '2px solid #003580' }}>
            <Calendar className="w-6 h-6 text-gray-400 flex-shrink-0" />
            
            {/* Llegada - Click directo abre calendario */}
            <div className="flex-1 relative">
              <label 
                htmlFor="startDate"
                className="cursor-pointer block"
                onClick={() => startDateRef.current?.showPicker?.()}
              >
                <div className={`text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors ${searchData.startDate ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {searchData.startDate ? formatDate(searchData.startDate) : 'Llegada'}
                </div>
              </label>
              <input
                ref={startDateRef}
                id="startDate"
                type="date"
                name="startDate"
                value={searchData.startDate}
                onChange={handleChange}
                className="absolute opacity-0 pointer-events-none"
                style={{ colorScheme: 'light' }}
                required
              />
            </div>

            {/* Separator */}
            <div className="text-gray-400 text-sm">-</div>

            {/* Regreso - Click directo abre calendario */}
            <div className="flex-1 relative">
              <label 
                htmlFor="endDate"
                className="cursor-pointer block"
                onClick={() => endDateRef.current?.showPicker?.()}
              >
                <div className={`text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors ${searchData.endDate ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {searchData.endDate ? formatDate(searchData.endDate) : 'Regreso'}
                </div>
              </label>
              <input
                ref={endDateRef}
                id="endDate"
                type="date"
                name="endDate"
                value={searchData.endDate}
                min={searchData.startDate}
                onChange={handleChange}
                className="absolute opacity-0 pointer-events-none"
                style={{ colorScheme: 'light' }}
                required
              />
            </div>
          </div>

          {/* Personalizar */}
          <div 
            className="flex-1 flex items-center justify-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onOpenDetails}
            style={{ borderRight: '2px solid #003580' }}
          >
            <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: '#3ccca4' }} />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Personalizar
            </span>
          </div>

          {/* Botón Buscar - Bloque completo mint */}
          <button
            type="submit"
            disabled={!searchData.destination || !searchData.startDate || !searchData.endDate}
            className="flex-1 flex items-center justify-center gap-3 px-5 py-6 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#3ccca4' }}
          >
            <Search className="w-6 h-6" />
            <span className="whitespace-nowrap">Buscar</span>
          </button>
        </div>
      </form>
    </div>
  );
};
