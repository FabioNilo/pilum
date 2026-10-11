import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

// Só anima quando o visitante não pediu menos movimento (mesma regra de src/index.css).
export const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";

declare global {
  interface Window {
    __piIntroDone?: boolean;
  }
}

// A abertura (index.html) avisa quando termina; se nem rodou, chama na hora.
// O timeout evita que o Hero fique escondido se o evento nunca chegar.
export function whenIntroDone(cb: () => void, fallbackMs = 9500) {
  if (window.__piIntroDone || !document.getElementById("intro")) {
    cb();
    return () => {};
  }
  let called = false;
  const run = () => {
    if (called) return;
    called = true;
    window.removeEventListener("pi-intro-done", run);
    window.clearTimeout(timer);
    cb();
  };
  const timer = window.setTimeout(run, fallbackMs);
  window.addEventListener("pi-intro-done", run);
  return () => {
    called = true;
    window.removeEventListener("pi-intro-done", run);
    window.clearTimeout(timer);
  };
}
