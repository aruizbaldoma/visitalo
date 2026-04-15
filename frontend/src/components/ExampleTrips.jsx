import { MapPin, Calendar, Euro, Plane, Hotel, Coffee } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

export const ExampleTrips = ({ searchResults = null }) => {
  // Solo mostramos resultados reales de la búsqueda, sin datos mock
  const tripsToShow = searchResults || [];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {searchResults ? "Viajes encontrados" : "Tus viajes aparecerán aquí"}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {searchResults 
              ? `Hemos encontrado ${tripsToShow.length} viaje(s) dentro de tu presupuesto`
              : "Utiliza el buscador para encontrar tu próxima aventura"
            }
          </p>
        </div>

        {!searchResults ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              🔍 Introduce tus datos de viaje arriba para descubrir opciones increíbles
            </p>
          </div>
        ) : tripsToShow.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No encontramos viajes dentro de tu presupuesto. Intenta aumentar un poco el monto.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tripsToShow.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 border-0 shadow-lg group">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={trip.image} 
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="text-white text-lg px-4 py-2 shadow-lg" style={{ backgroundColor: '#3ccca4' }}>
                      {trip.days} días
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {trip.destination}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trip.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: '#052c4e' }}>
                        {trip.price}€
                      </div>
                      <p className="text-sm text-gray-500">persona</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Includes */}
                  <div className="flex flex-wrap gap-2">
                    {trip.includes.flights && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Plane className="w-3 h-3" />
                        Vuelos
                      </Badge>
                    )}
                    {trip.includes.hotel && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Hotel className="w-3 h-3" />
                        Hotel
                      </Badge>
                    )}
                    {trip.includes.breakfast && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Coffee className="w-3 h-3" />
                        Desayuno
                      </Badge>
                    )}
                  </div>

                  {/* Itinerary */}
                  <div>
                    <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#052c4e' }} />
                      Itinerario
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {trip.itinerary.map((day, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-0.5" style={{ color: '#3ccca4' }}>•</span>
                          <span>{day}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Departure */}
                  <p className="text-sm text-gray-500">
                    Desde <span className="font-semibold text-gray-700">{trip.departure}</span>
                  </p>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full text-white font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:opacity-90"
                    style={{ background: '#3ccca4' }}
                  >
                    Ver viaje completo
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
