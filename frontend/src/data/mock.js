// Mock data for RutaBarata travel planner

export const exampleTrips = [
  {
    id: 1,
    destination: "Roma",
    country: "Italia",
    days: 3,
    price: 280,
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    itinerary: [
      "Día 1: Coliseo y Foro Romano",
      "Día 2: Vaticano y Capilla Sixtina",
      "Día 3: Fontana di Trevi y Villa Borghese"
    ],
    includes: {
      flights: true,
      hotel: true,
      breakfast: true
    },
    departure: "Barcelona"
  },
  {
    id: 2,
    destination: "Lisboa",
    country: "Portugal",
    days: 5,
    price: 320,
    image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a",
    itinerary: [
      "Día 1-2: Alfama y Castillo de San Jorge",
      "Día 3: Belém y Torre de Belém",
      "Día 4: Sintra y Cascais",
      "Día 5: Barrio Alto y Chiado"
    ],
    includes: {
      flights: true,
      hotel: true,
      breakfast: true
    },
    departure: "Madrid"
  },
  {
    id: 3,
    destination: "París",
    country: "Francia",
    days: 4,
    price: 350,
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",
    itinerary: [
      "Día 1: Torre Eiffel y Campos Elíseos",
      "Día 2: Louvre y Notre-Dame",
      "Día 3: Montmartre y Sacré-Cœur",
      "Día 4: Versalles"
    ],
    includes: {
      flights: true,
      hotel: true,
      breakfast: false
    },
    departure: "Barcelona"
  }
];

export const departureCities = [
  "Barcelona",
  "Madrid",
  "Valencia",
  "Sevilla",
  "Málaga",
  "Bilbao"
];

export const howItWorksSteps = [
  {
    step: 1,
    title: "Introduce tus datos",
    description: "Selecciona tu ciudad de origen, fechas de viaje y presupuesto disponible"
  },
  {
    step: 2,
    title: "IA analiza opciones",
    description: "Nuestra inteligencia artificial busca entre miles de combinaciones de vuelos y hoteles"
  },
  {
    step: 3,
    title: "Recibe tu viaje",
    description: "Obtén el itinerario optimizado listo para reservar al mejor precio"
  }
];

export const benefits = [
  {
    title: "Ahorra dinero automáticamente",
    description: "Encuentra las mejores ofertas sin buscar en decenas de páginas web"
  },
  {
    title: "Planificación instantánea",
    description: "Resultados en segundos, no pierdas tiempo comparando precios"
  },
  {
    title: "Optimizado desde España",
    description: "Especializado en vuelos y viajes desde ciudades españolas"
  },
  {
    title: "Sin complicaciones",
    description: "Todo organizado en un solo lugar, listo para reservar"
  }
];

export const testimonials = [
  {
    name: "María González",
    city: "Barcelona",
    rating: 5,
    comment: "Encontré un viaje a Roma por 280€. ¡Increíble! Normalmente me habría costado el doble."
  },
  {
    name: "Carlos Ruiz",
    city: "Madrid",
    rating: 5,
    comment: "Súper fácil de usar. En 2 minutos tenía mi escapada a Lisboa planificada."
  },
  {
    name: "Laura Martín",
    city: "Valencia",
    rating: 5,
    comment: "La IA encontró combinaciones que yo nunca habría descubierto. Ahorro garantizado."
  }
];

// Mock function to simulate trip search
export const searchTrips = async (searchData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return filtered trips based on budget
  return exampleTrips.filter(trip => trip.price <= searchData.budget);
};
