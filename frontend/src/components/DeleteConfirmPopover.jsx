import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Popover de confirmación de eliminación con estilo visitalo.es (azul corporativo + verde).
 * Se renderiza en posición absolute dentro de un contenedor relative.
 */
export const DeleteConfirmPopover = ({
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  cancelLabel,
}) => {
  const { t } = useTranslation();
  const resolvedTitle = title || t("deleteConfirm.defaultTitle");
  const resolvedMessage = message || t("deleteConfirm.defaultMessage");
  const resolvedConfirm = confirmLabel || t("deleteConfirm.confirm");
  const resolvedCancel = cancelLabel || t("deleteConfirm.keep");

  return (
    <>
      <div
        className="absolute inset-0 bg-black/5 rounded-lg z-20"
        onClick={onCancel}
        data-testid="delete-confirm-backdrop"
      />
      <div
        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 w-[min(340px,calc(100%-24px))] rounded-2xl shadow-2xl p-5 animate-[fadeInPop_0.2s_ease-out]"
        style={{
          background: "linear-gradient(135deg, #031834 0%, #0a2a4e 100%)",
          border: "1px solid rgba(60, 204, 164, 0.3)",
        }}
        data-testid="delete-confirm-popover"
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(60, 204, 164, 0.18)" }}
          >
            <Trash2 className="w-4 h-4" style={{ color: "#3ccca4" }} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight mb-1.5">{resolvedTitle}</p>
            <p className="text-white/75 text-xs leading-snug">{resolvedMessage}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            data-testid="delete-cancel"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold rounded-lg transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: "#3ccca4", color: "#031834" }}
            data-testid="delete-confirm"
          >
            {resolvedConfirm}
          </button>
        </div>
        <style>{`
          @keyframes fadeInPop {
            0% { opacity: 0; transform: translateY(-4px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </>
  );
};
