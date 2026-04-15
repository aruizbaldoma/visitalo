import { useState } from "react";
import { Calendar, MapPin, Euro, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { departureCities } from "../data/mock";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Hero = ({ onSearch }) => {
  const [searchData, setSearchData] = useState({
    departureCity: "Barcelona",
    startDate: "",
    endDate: "",
    budget: "",
    includeFlights: true,
    includeHotels: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchData.budget && searchData.startDate && searchData.endDate) {
      setIsLoading(true);
      
      try {
        // Llamar al backend con Gemini
        const response = await axios.post(`${API}/search-trips`, {
          departureCity: searchData.departureCity,
          startDate: searchData.startDate,
          endDate: searchData.endDate,
          budget: parseInt(searchData.budget),
          includeFlights: searchData.includeFlights,
          includeHotels: searchData.includeHotels
        });
        
        // Verificar si está en modo MOCK
        const isMockMode = response.headers['x-mock-mode'] === 'true';
        
        // Pasar los resultados al componente padre
        onSearch(response.data.results, isMockMode);
      } catch (error) {
        console.error("Error buscando viajes:", error);
        onSearch([]); // Enviar array vacío en caso de error
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1531329818183-bba7e80bfecd')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10, 37, 64, 0.95) 0%, rgba(10, 37, 64, 0.88) 50%, rgba(46, 211, 183, 0.15) 100%)' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Viaja más gastando menos
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 font-light max-w-2xl mx-auto">
            Introduce tus fechas y presupuesto, y te mostramos el mejor viaje posible desde España
          </p>

          {/* Search form */}
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Departure city */}
                <div className="text-left">
                  <Label htmlFor="departure" className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" style={{ color: '#052c4e' }} />
                    Ciudad de origen
                  </Label>
                  <Select 
                    value={searchData.departureCity}
                    onValueChange={(value) => setSearchData({...searchData, departureCity: value})}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departureCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div className="text-left">
                  <Label htmlFor="budget" className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <Euro className="w-4 h-4" style={{ color: '#3ccca4' }} />
                    Presupuesto máximo
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="ej: 500"
                    value={searchData.budget}
                    onChange={(e) => setSearchData({...searchData, budget: e.target.value})}
                    className="h-11"
                    min="100"
                    step="10"
                  />
                </div>

                {/* Start date */}
                <div className="text-left">
                  <Label htmlFor="startDate" className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" style={{ color: '#052c4e' }} />
                    Fecha de ida
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={searchData.startDate}
                    onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                    className="h-11"
                  />
                </div>

                {/* End date */}
                <div className="text-left">
                  <Label htmlFor="endDate" className="text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" style={{ color: '#052c4e' }} />
                    Fecha de vuelta
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={searchData.endDate}
                    onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                    className="h-11"
                    min={searchData.startDate}
                  />
                </div>
              </div>

              {/* Filtros de servicios */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="includeFlights"
                    checked={searchData.includeFlights}
                    onChange={(e) => setSearchData({...searchData, includeFlights: e.target.checked})}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{ accentColor: '#3ccca4' }}
                  />
                  <Label htmlFor="includeFlights" className="text-gray-700 font-medium cursor-pointer flex items-center gap-2">
                    ✈️ Incluir Vuelos
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="includeHotels"
                    checked={searchData.includeHotels}
                    onChange={(e) => setSearchData({...searchData, includeHotels: e.target.checked})}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{ accentColor: '#3ccca4' }}
                  />
                  <Label htmlFor="includeHotels" className="text-gray-700 font-medium cursor-pointer flex items-center gap-2">
                    🏨 Incluir Hoteles
                  </Label>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center -mt-2">
                📋 El itinerario siempre está incluido
              </p>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-base text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90"
                style={{ background: '#3ccca4' }}
                disabled={isLoading}
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? 'Buscando con IA...' : 'Buscar mi viaje'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
