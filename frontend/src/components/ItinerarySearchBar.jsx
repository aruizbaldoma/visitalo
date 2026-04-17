import { useState } from "react";
import { Search, Calendar, MapPin, Info } from "lucide-react";
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
    if (!searchData.destination || !searchData.startDate || !searchData.endDate) {
      return;
    }
    onSearch(searchData);
  };

  return (
    <div className="w-full bg-white shadow-md" style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Destino */}
          <div className="md:col-span-4">
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
              className="border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
              required
            />
          </div>

          {/* Fecha Inicio */}
          <div className="md:col-span-3">
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#3ccca4' }} />
              Fecha de Ida
            </Label>
            <Input
              id="startDate"
              type="date"
              value={searchData.startDate}
              onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
              className="border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
              required
            />
          </div>

          {/* Fecha Fin */}
          <div className="md:col-span-3">
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
              className="border-gray-300 focus:border-[#3ccca4] focus:ring-[#3ccca4]"
              required
            />
          </div>

          {/* Botones */}
          <div className="md:col-span-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onOpenDetails}
              className="flex-1 border-gray-300 hover:border-[#3ccca4] hover:bg-gray-50"
              title="Añadir información adicional del viaje"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white font-semibold"
              style={{ 
                backgroundColor: '#3ccca4',
                border: 'none'
              }}
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
