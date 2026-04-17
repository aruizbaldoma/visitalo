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
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    return `${day} ${month}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-3" style={{ border: '3px solid #003580' }}>
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

          {/* Fechas - Una sola línea horizontal (mismo ancho que destino) */}
          <div className="flex-1 flex items-center gap-2 px-5 py-4 border-r border-gray-200">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            
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

          {/* Personalizar (mismo ancho que los otros) */}
          <div 
            className="flex-1 flex items-center justify-center gap-3 px-5 py-4 border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
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
