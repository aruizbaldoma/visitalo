import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { testimonials } from "../data/mock";

export const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros viajeros
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Miles de personas ya están viajando más por menos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <Quote className="w-10 h-10 mb-4" style={{ color: 'rgba(60, 204, 164, 0.4)' }} />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" style={{ fill: '#3ccca4', color: '#3ccca4' }} />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>

                {/* Author */}
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.city}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#052c4e' }}>12,000+</div>
            <div className="text-gray-600">Viajes creados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#3ccca4' }}>€450</div>
            <div className="text-gray-600">Ahorro promedio</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#052c4e' }}>4.9/5</div>
            <div className="text-gray-600">Valoración</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#3ccca4' }}>24/7</div>
            <div className="text-gray-600">Disponibilidad</div>
          </div>
        </div>
      </div>
    </section>
  );
};
