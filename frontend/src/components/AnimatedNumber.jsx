import { useEffect, useRef, useState } from "react";

/**
 * AnimatedNumber — interpola suavemente entre el valor previo y el nuevo.
 * Añade un pequeño "flash" mint cuando sube y azul cuando baja,
 * y un micro-bounce de escala respetando la identidad de Visítalo.
 */
export const AnimatedNumber = ({
  value,
  decimals = 0,
  duration = 650,
  prefix = "",
  suffix = "",
  className = "",
  style = {},
  testId,
}) => {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(null); // 'up' | 'down' | null
  const fromRef = useRef(value);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (value === display) return;

    const from = fromRef.current;
    const to = value;
    const delta = to - from;
    const direction = delta > 0 ? "up" : delta < 0 ? "down" : null;
    setFlash(direction);

    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + delta * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = to;
        // Quitar flash tras un pelín más
        setTimeout(() => setFlash(null), 250);
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted =
    decimals > 0
      ? display.toLocaleString("es-ES", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(display).toLocaleString("es-ES");

  const flashStyle =
    flash === "up"
      ? { color: "#3ccca4", transform: "scale(1.08)" }
      : flash === "down"
      ? { color: "#031834", transform: "scale(0.96)" }
      : {};

  return (
    <span
      className={`inline-block transition-[transform,color] duration-200 ease-out ${className}`}
      style={{ ...style, ...flashStyle, transformOrigin: "left center" }}
      data-testid={testId}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
