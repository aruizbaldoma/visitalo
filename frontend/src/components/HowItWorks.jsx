import { Calendar, Brain, CheckCircle } from "lucide-react";
import { howItWorksSteps } from "../data/mock";

const stepIcons = {
  1: Calendar,
  2: Brain,
  3: CheckCircle
};

export const HowItWorks = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#031834' }}>
            Cómo funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tres pasos simples para encontrar tu próxima aventura
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {howItWorksSteps.map((item) => {
            const Icon = stepIcons[item.step];
            return (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5" style={{ background: 'linear-gradient(to right, rgba(10, 37, 64, 0.3), rgba(46, 211, 183, 0.5))' }}></div>
                )}

                {/* Icon circle */}
                <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #031834, #3ccca4)' }}>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <Icon className="w-12 h-12" style={{ color: '#031834' }} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: '#3ccca4' }}>
                    {item.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2" style={{ color: '#0A2540' }}>
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
