"use client";

import * as React from "react";

/**
 * Thin gradient bar pinned to top of the viewport, fills as the user
 * scrolls. Pure CSS transform — runs at 60fps.
 */
export function ScrollProgress() {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        const v = max > 0 ? (h.scrollTop / max) * 100 : 0;
        setPct(v);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-accent via-[hsl(252,95%,75%)] to-[hsl(180,80%,60%)] origin-left transition-transform duration-150"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}
