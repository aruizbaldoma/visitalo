import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets window scroll position to top whenever the route pathname changes.
 * Hash links (#section) keep their default browser behavior.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
