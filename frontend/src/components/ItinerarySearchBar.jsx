import { useState } from "react";
import { MapPin, Calendar, Search, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const ItinerarySearchBar = ({ onSearch, onOpenDetails }) => {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: "",
    endDate: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchData.destination && searchData.startDate && searchData.endDate) {
      onSearch(searchData);
    }
  };

  return (
    <div className="w-full bg-white shadow-md" style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      <form onSubmit={handleSubmit} className="p-6">
        {/* Layout vertical para mejor responsive */}
        <div className="space-y-4">
          {/* Destino */}
          <div>
            <Label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" style={{ color: '#3ccca4' }} />
              Destino
            </Label>
            <Input
              id="destination"
              type="text"
              placeholder="¿A dónde viajas?"
              value={searchData.destination}
              onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
              className="w-full border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
              required
            />
          </div>

          {/* Grid 2 columnas para fechas en pantallas medianas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha Inicio */}
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#3ccca4' }} />
                Fecha de Ida
              </Label>
              <Input
                id="startDate"
                type="date"
                value={searchData.startDate}
                onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                className="w-full border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
                style={{ colorScheme: 'light' }}
                required
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#3ccca4' }} />
                Fecha de Vuelta
              </Label>
              <Input
                id="endDate"
                type="date"
                value={searchData.endDate}
                min={searchData.startDate}
                onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                className="w-full border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
                style={{ colorScheme: 'light' }}
                required
              />
            </div>
          </div>

          {/* Botones en grid - 2 columnas */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onOpenDetails}
              className="w-full"
              style={{ borderRadius: '8px' }}
              title="Personaliza tu viaje con preferencias avanzadas"
            >
              <Sparkles className="w-4 h-4 mr-2" style={{ color: '#3ccca4' }} />
              <span>Personaliza</span>
            </Button>

            <Button
              type="submit"
              disabled={!searchData.destination || !searchData.startDate || !searchData.endDate}
              className="w-full font-bold"
              style={{ backgroundColor: '#3ccca4', color: 'white', borderRadius: '8px' }}
            >
              <Search className="w-4 h-4 mr-2" />
              Generar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
