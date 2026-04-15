import { useState } from "react";
import { Calendar, MapPin, Euro, Search, Plane } from "lucide-react";
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

export const Hero = ({ onSearch }) => {
  const [searchData, setSearchData] = useState({
    departureCity: "Barcelona",
    startDate: "",
    endDate: "",
    budget: ""
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchData.budget && searchData.startDate && searchData.endDate) {
      onSearch(searchData);
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
                    <MapPin className="w-4 h-4" style={{ color: '#0A2540' }} />
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
                    <Euro className="w-4 h-4" style={{ color: '#2ED3B7' }} />
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
                    <Calendar className="w-4 h-4" style={{ color: '#0A2540' }} />
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
                    <Calendar className="w-4 h-4" style={{ color: '#0A2540' }} />
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

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-base text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:opacity-90"
                style={{ background: '#2ED3B7' }}
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar mi viaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
