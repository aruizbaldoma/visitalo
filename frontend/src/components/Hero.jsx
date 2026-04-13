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
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1531329818183-bba7e80bfecd')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 via-orange-400/85 to-green-600/80"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Plane className="w-16 h-16 text-white animate-pulse" />
      </div>
      <div className="absolute bottom-32 right-16 opacity-20">
        <Plane className="w-20 h-20 text-white animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Viaja más gastando menos
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-12 font-light">
            Introduce tus fechas y presupuesto, y te mostramos el mejor viaje posible desde España
          </p>

          {/* Search form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto backdrop-blur-sm">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Departure city */}
                <div className="text-left">
                  <Label htmlFor="departure" className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Ciudad de origen
                  </Label>
                  <Select 
                    value={searchData.departureCity}
                    onValueChange={(value) => setSearchData({...searchData, departureCity: value})}
                  >
                    <SelectTrigger className="w-full h-12">
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
                  <Label htmlFor="budget" className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Euro className="w-4 h-4 text-green-600" />
                    Presupuesto máximo
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="ej: 500"
                    value={searchData.budget}
                    onChange={(e) => setSearchData({...searchData, budget: e.target.value})}
                    className="h-12"
                    min="100"
                    step="10"
                  />
                </div>

                {/* Start date */}
                <div className="text-left">
                  <Label htmlFor="startDate" className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Fecha de ida
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={searchData.startDate}
                    onChange={(e) => setSearchData({...searchData, startDate: e.target.value})}
                    className="h-12"
                  />
                </div>

                {/* End date */}
                <div className="text-left">
                  <Label htmlFor="endDate" className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Fecha de vuelta
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={searchData.endDate}
                    onChange={(e) => setSearchData({...searchData, endDate: e.target.value})}
                    className="h-12"
                    min={searchData.startDate}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
