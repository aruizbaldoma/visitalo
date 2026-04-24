import { X, Check, Calendar, MapPin, Euro } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ConfirmationModal = ({ itinerary, totalPrice, isOpen, onClose, onConfirmPayment }) => {
  const { t } = useTranslation();
  if (!isOpen || !itinerary) return null;

  const totalActivities = itinerary.days.reduce((acc, day) => {
    return acc + 
      day.morning.activities.length + 
      day.afternoon.activities.length + 
      day.night.activities.length;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: '8px' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h3 className="text-2xl font-bold" style={{ color: '#031834' }}>
            {t("confirmation.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resumen del Destino */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6" style={{ color: '#031834' }} />
              <h4 className="text-xl font-bold" style={{ color: '#031834' }}>
                {itinerary.destination}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4" />
              <p className="text-sm">
                {itinerary.days[0]?.date} - {itinerary.days[itinerary.days.length - 1]?.date}
              </p>
              <span className="mx-2">•</span>
              <p className="text-sm font-semibold">
                {t("confirmation.dayCount", { count: itinerary.totalDays })}
              </p>
            </div>
          </div>

          {/* Resumen de Actividades por Día */}
          <div>
            <h5 className="font-bold text-lg mb-3" style={{ color: '#031834' }}>
              {t("confirmation.summaryTitle")}
            </h5>
            <div className="space-y-3">
              {itinerary.days.map((day) => {
                const dayActivities = [
                  ...day.morning.activities,
                  ...day.afternoon.activities,
                  ...day.night.activities
                ];
                const dayTotal = dayActivities.reduce((sum, act) => sum + (act.price || 0), 0);

                return (
                  <div key={day.day} className="bg-gray-50 p-4" style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">
                        {t("confirmation.dayLabel", { n: day.day })}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#031834' }}>
                        €{dayTotal.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">
                      {t("confirmation.activityCount", { count: dayActivities.length })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">{t("confirmation.totalActivities")}</p>
                <p className="text-lg font-bold" style={{ color: '#031834' }}>
                  {t("confirmation.activityCount", { count: totalActivities })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t("confirmation.totalPrice")}</p>
                <div className="flex items-center gap-2">
                  <Euro className="w-6 h-6" style={{ color: '#3ccca4' }} />
                  <p className="text-3xl font-bold" style={{ color: '#031834' }}>
                    {totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Nota Legal */}
            <div className="bg-yellow-50 p-3 mb-4" style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <p className="text-xs text-gray-700">
                <span className="font-semibold">{t("confirmation.legalTitle")}</span> {t("confirmation.legalText")}
              </p>
            </div>

            {/* Botón de Confirmación */}
            <button
              onClick={onConfirmPayment}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-lg text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              style={{ backgroundColor: '#3ccca4', borderRadius: '8px' }}
            >
              <Check className="w-5 h-5" />
              {t("confirmation.confirmCta")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
