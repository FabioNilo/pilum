import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, NO_PREFERENCE } from "@/lib/motion";

type RevealOptions = {
  /** Distância inicial (px) no eixo Y. */
  y?: number;
  duration?: number;
  /** Intervalo entre os itens do grupo. */
  stagger?: number;
  delay?: number;
};

/**
 * Revela os filhos de um container (seletor) quando ele entra na tela, uma vez.
 * O estado escondido só existe via JS (gsap.from), então sem JS o conteúdo continua visível.
 * Com prefers-reduced-motion, nada é animado.
 */
export function useReveal<T extends HTMLElement>(selector: string, { y = 24, duration = 0.6, stagger = 0.1, delay = 0 }: RevealOptions = {}): RefObject<T> {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        gsap.from(selector, {
          autoAlpha: 0,
          y,
          duration,
          stagger,
          delay,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return ref;
}
