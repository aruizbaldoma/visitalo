import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BRAND_BLUE = "#031834";
const BRAND_GREEN = "#3ccca4";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

/* ---------- utils ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const beforeDay = (a, b) => {
  if (!a || !b) return false;
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()) < new Date(b.getFullYear(), b.getMonth(), b.getDate());
};
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/* ---------- Single month grid ---------- */
const MonthGrid = ({ month, start, end, hovered, onPick, onHover, minDate, maxDate }) => {
  const first = startOfMonth(month);
  const jsFirstWeekday = first.getDay(); // 0=Sun
  const leading = (jsFirstWeekday + 6) % 7; // convert to Mon=0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));

  const rangeEnd = end || hovered;

  return (
    <div className="flex-1 min-w-[260px]">
      <div className="text-center font-bold capitalize mb-3" style={{ color: BRAND_BLUE }}>
        {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 mb-1.5">
        {DAY_LABELS.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;
          const tooEarly = minDate && beforeDay(date, minDate);
          const tooLate = maxDate && beforeDay(maxDate, date);
          const isDisabled = tooEarly || tooLate;
          const isStart = sameDay(date, start);
          const isEnd = sameDay(date, end);
          const inRange =
            start && rangeEnd && !sameDay(date, start) && !sameDay(date, rangeEnd) &&
            date > start && date < rangeEnd;
          const isHoverPreview =
            start && !end && hovered && sameDay(date, hovered) && !sameDay(date, start);

          let bg = "transparent";
          let color = BRAND_BLUE;
          let fontWeight = 500;

          if (isStart || isEnd) {
            bg = BRAND_BLUE;
            color = "#fff";
            fontWeight = 700;
          } else if (inRange) {
            bg = `${BRAND_GREEN}33`;
            color = BRAND_BLUE;
          } else if (isHoverPreview) {
            bg = BRAND_GREEN;
            color = BRAND_BLUE;
            fontWeight = 700;
          }

          return (
            <button
              key={toISO(date)}
              type="button"
              disabled={isDisabled}
              onMouseEnter={() => !isDisabled && onHover(date)}
              onClick={() => !isDisabled && onPick(date)}
              className={`aspect-square rounded-md text-sm transition-colors ${
                isDisabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-[#3ccca4] hover:text-[#031834]"
              }`}
              style={{
                backgroundColor: bg,
                color: isDisabled ? "#D1D5DB" : color,
                fontWeight,
              }}
              data-testid={`day-${toISO(date)}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Main component ---------- */
export const RangeDatePicker = ({
  startDate,
  endDate,
  onChange,
  onOpenChange,
  startPlaceholder = "¿Cuándo llegas?",
  endPlaceholder = "¿Cuándo vuelves?",
  singleLabel,
  minDate,
  maxDate,
  className = "",
  triggerClassName = "",
  anchorSelector,
  align = "left",
}) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const seed = parseISO(startDate) || new Date();
    return startOfMonth(seed);
  });
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, openUp: false });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const start = useMemo(() => parseISO(startDate), [startDate]);
  const end = useMemo(() => parseISO(endDate), [endDate]);
  const minD = useMemo(() => minDate || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), [minDate]);

  // Recalcular posición del popover cuando se abre o scroll/resize
  const computePosition = () => {
    if (!triggerRef.current) return;
    // Si el caller pasó un selector de anchor, lo usamos para alinear el popover (p. ej. al bloque completo de fecha).
    const anchorEl =
      (anchorSelector && rootRef.current && rootRef.current.closest(anchorSelector)) ||
      triggerRef.current;
    const rect = anchorEl.getBoundingClientRect();
    const popoverHeight = 420;
    const popoverWidth = 620;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const spaceBelow = viewportH - rect.bottom;
    const openUp = spaceBelow < popoverHeight + 24 && rect.top > popoverHeight;

    let left;
    if (align === "right") {
      left = rect.right - popoverWidth;
    } else {
      left = rect.left;
    }
    if (left < 8) left = 8;
    if (left + popoverWidth > viewportW - 8) left = viewportW - popoverWidth - 8;

    const top = openUp ? rect.top - popoverHeight - 8 : rect.bottom + 8;
    setPopoverPos({ top, left, openUp });
  };

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    const handler = () => computePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      const inRoot = rootRef.current && rootRef.current.contains(e.target);
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!inRoot && !inPopover) {
        setOpen(false);
        onOpenChange && onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  const handlePick = (date) => {
    const iso = toISO(date);
    // Caso 1: no hay start o ya hay rango completo → inicia selección nueva
    if (!start || (start && end)) {
      onChange({ startDate: iso, endDate: "" });
      setHovered(null);
      return;
    }
    // Caso 2: hay start, no hay end
    if (beforeDay(date, start) || sameDay(date, start)) {
      // Si clickan antes o el mismo día, reiniciamos con ese como nueva start
      onChange({ startDate: iso, endDate: "" });
      setHovered(null);
      return;
    }
    // Rango completo: NO cerramos, el usuario confirma con "Hecho" o click fuera.
    onChange({ startDate: toISO(start), endDate: iso });
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange && onOpenChange(next);
    if (next) {
      // Cuando se abre, posicionar el view en la fecha de inicio si existe
      const seed = start || new Date();
      setViewMonth(startOfMonth(seed));
    }
  };

  const label = (() => {
    if (singleLabel && start && end) {
      const opt = { day: "2-digit", month: "short" };
      return `${start.toLocaleDateString("es-ES", opt)} — ${end.toLocaleDateString("es-ES", opt)}`;
    }
    if (singleLabel) {
      return singleLabel;
    }
    if (start && end) {
      const opt = { day: "2-digit", month: "short" };
      return `${start.toLocaleDateString("es-ES", opt)} — ${end.toLocaleDateString("es-ES", opt)}`;
    }
    if (start) {
      const opt = { day: "2-digit", month: "short" };
      return `${start.toLocaleDateString("es-ES", opt)} — ${endPlaceholder}`;
    }
    return `${startPlaceholder}  —  ${endPlaceholder}`;
  })();

  return (
    <div ref={rootRef} className={`relative ${className}`} data-testid="range-date-picker">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full text-left cursor-pointer ${triggerClassName}`}
        data-testid="range-date-trigger"
      >
        {label}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-5"
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              zIndex: 500,
              width: "min(620px, calc(100vw - 16px))",
            }}
            data-testid="range-date-popover"
          >
            {/* Navegación de meses */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Mes anterior"
                data-testid="range-date-prev"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: BRAND_BLUE }} />
              </button>
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: BRAND_GREEN, letterSpacing: "0.18em" }}
              >
                {start && end
                  ? "Fechas seleccionadas"
                  : start
                  ? "Elige la fecha de salida"
                  : "Elige la fecha de llegada"}
              </span>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Mes siguiente"
                data-testid="range-date-next"
              >
                <ChevronRight className="w-5 h-5" style={{ color: BRAND_BLUE }} />
              </button>
            </div>

            {/* 2 meses lado a lado */}
            <div
              className="flex gap-5 flex-col sm:flex-row"
              onMouseLeave={() => setHovered(null)}
            >
              <MonthGrid
                month={viewMonth}
                start={start}
                end={end}
                hovered={hovered}
                onPick={handlePick}
                onHover={setHovered}
                minDate={minD}
                maxDate={maxDate}
              />
              <MonthGrid
                month={addMonths(viewMonth, 1)}
                start={start}
                end={end}
                hovered={hovered}
                onPick={handlePick}
                onHover={setHovered}
                minDate={minD}
                maxDate={maxDate}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange({ startDate: "", endDate: "" });
                  setHovered(null);
                }}
                className="text-xs font-semibold text-gray-500 hover:text-[#031834] transition-colors"
                data-testid="range-date-clear"
              >
                Limpiar
              </button>
              {start && end && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenChange && onOpenChange(false);
                  }}
                  className="px-4 py-2 rounded-lg font-bold text-xs transition-all hover:opacity-90"
                  style={{ backgroundColor: BRAND_GREEN, color: BRAND_BLUE }}
                  data-testid="range-date-done"
                >
                  Hecho
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
