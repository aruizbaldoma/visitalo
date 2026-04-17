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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ border: '4px solid #003580', height: '80px', minHeight: '80px', maxHeight: '80px' }}>
        <div className="flex items-stretch" style={{ height: '100%' }}>
          {/* Bloque 1: Destino - Más ancho */}
          <div className="flex-[1.8] flex items-center gap-3 px-5">
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

          {/* Separador redondeado */}
          <div className="w-1 flex-shrink-0 relative">
            <div className="absolute inset-y-0 inset-x-0 rounded-full" style={{ backgroundColor: '#003580' }}></div>
          </div>

          {/* Bloque 2: Fechas - Más ancho */}
          <div className="flex-[1.8] flex items-center gap-2 px-5">
            <Calendar className="w-6 h-6 text-gray-400 flex-shrink-0" />
            
            {/* Fecha de llegada - Click directo abre calendario */}
            <div className="flex-1 relative">
              <label 
                htmlFor="startDate"
                className="cursor-pointer block"
                onClick={() => startDateRef.current?.showPicker?.()}
              >
                <div className={`text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors ${searchData.startDate ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {searchData.startDate ? formatDate(searchData.startDate) : 'Fecha de llegada'}
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

            {/* Fecha de salida - Click directo abre calendario */}
            <div className="flex-1 relative">
              <label 
                htmlFor="endDate"
                className="cursor-pointer block"
                onClick={() => endDateRef.current?.showPicker?.()}
              >
                <div className={`text-sm px-2 py-1 rounded hover:bg-gray-50 transition-colors ${searchData.endDate ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {searchData.endDate ? formatDate(searchData.endDate) : 'Fecha de salida'}
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

          {/* Separador redondeado */}
          <div className="w-1 flex-shrink-0 relative">
            <div className="absolute inset-y-0 inset-x-0 rounded-full" style={{ backgroundColor: '#003580' }}></div>
          </div>

          {/* Bloque 3: Personalizar - Más estrecho */}
          <div 
            className="flex-[0.5] flex items-center justify-center gap-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onOpenDetails}
          >
            <Sparkles className="w-6 h-6 flex-shrink-0" style={{ color: '#3ccca4' }} />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              Personalizar
            </span>
          </div>

          {/* Separador redondeado */}
          <div className="w-1 flex-shrink-0 relative">
            <div className="absolute inset-y-0 inset-x-0 rounded-full" style={{ backgroundColor: '#003580' }}></div>
          </div>

          {/* Bloque 4: Buscar - Mucho más estrecho */}
          <button
            type="submit"
            disabled={!searchData.destination || !searchData.startDate || !searchData.endDate}
            className="flex-[0.4] flex items-center justify-center px-4 font-bold transition-all hover:opacity-90"
            style={{ 
              backgroundColor: '#3ccca4',
              cursor: (!searchData.destination || !searchData.startDate || !searchData.endDate) ? 'not-allowed' : 'pointer'
            }}
          >
            <span className="whitespace-nowrap" style={{ color: '#003580' }}>Buscar</span>
          </button>
        </div>
      </form>
    </div>
  );
};
