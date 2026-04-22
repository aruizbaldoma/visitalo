import { Sparkles, Zap, MapPin, Shield } from "lucide-react";
import { benefits } from "../data/mock";

const benefitIcons = [Sparkles, Zap, MapPin, Shield];

export const Benefits = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¿Por qué RutaBarata?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hacemos que viajar sea más fácil, rápido y económico
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefitIcons[index];
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, rgba(5, 44, 78, 0.1), rgba(60, 204, 164, 0.2))' }}>
                  <Icon className="w-8 h-8" style={{ color: '#031834' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
