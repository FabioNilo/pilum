import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from "lucide-react";
import type { Slide } from "@/data/projects";
import { DeviceFrame } from "./DeviceFrame";

type Props = { slides: Slide[]; title: string; videoUrl?: string; label?: string };

export function Slideshow({ slides, title, videoUrl, label }: Props) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);
  const closeZoom = useCallback(() => setZoom(null), []);
  const offset = videoUrl ? 1 : 0;
  const total = slides.length + offset;

  if (total === 0) {
    return (
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-paper-line bg-paper text-ink-mute">
        <ImageOff className="h-6 w-6" aria-hidden />
        <span className="text-sm">Demonstração em breve</span>
      </div>
    );
  }

  const onVideo = Boolean(videoUrl) && index === 0;
  const caption = onVideo ? "Vídeo de demonstração" : slides[index - offset]?.caption;

  return (
    <div aria-roledescription="carrossel" aria-label={`Telas: ${title}`}>
      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-paper-line shadow-card" ref={emblaRef}>
          <div className="flex">
            {videoUrl && (
              <div className="min-w-0 flex-[0_0_100%]">
                <iframe
                  src={videoUrl}
                  title={`Vídeo: ${title}`}
                  className="aspect-[16/10] w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => setZoom(i)}
                className="relative min-w-0 flex-[0_0_100%] cursor-zoom-in text-left"
                aria-label={`Ampliar: ${s.caption}`}
              >
                <DeviceFrame slide={s} eager={i === 0} />
              </button>
            ))}
          </div>
        </div>

        {label && (
          <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-paper backdrop-blur">
            {label}
          </span>
        )}

        {/* Aviso fixo de que a tela pode ser ampliada (o botão real é a própria imagem). */}
        {!onVideo && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper shadow-lg ring-1 ring-white/40"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>
              <span className="sm:hidden">Toque</span>
              <span className="hidden sm:inline">Clique</span> para ampliar
            </span>
          </span>
        )}

        {total > 1 && (
          <>
            <NavButton side="left" onClick={prev} label="Tela anterior" />
            <NavButton side="right" onClick={next} label="Próxima tela" />
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-h-[2.5rem] flex-1 text-sm text-ink-soft sm:min-h-[1.25rem]" aria-live="polite">
          {caption}
        </p>
        {total > 1 && (
          <div className="flex shrink-0 items-center">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Ir para a tela ${i + 1}`}
                aria-current={i === index}
                className="group/dot p-1.5"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-accent" : "w-2 bg-ink/40 group-hover/dot:bg-ink/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoom !== null && <Lightbox slides={slides} start={zoom} onClose={closeZoom} />}
    </div>
  );
}

/** Seta sólida e escura, com contorno branco: lê bem sobre qualquer print, claro ou escuro. */
function NavButton({ side, onClick, label }: { side: "left" | "right"; onClick: () => void; label: string }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-paper shadow-lg ring-2 ring-white transition-colors hover:bg-ink-soft ${
        side === "left" ? "left-2" : "right-2"
      }`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

function Lightbox({ slides, start, onClose }: { slides: Slide[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const s = slides[i];
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={s.caption}
      className="fixed inset-0 z-50 flex h-dvh flex-col bg-ink/[0.98] p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="flex items-start justify-between gap-4 text-paper" onClick={stop}>
        <p className="text-sm leading-snug">
          <span className="text-paper/70">
            {i + 1}/{n} ·{" "}
          </span>
          {s.caption}
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-lg hover:bg-white"
        >
          <X className="h-4 w-4" aria-hidden />
          Fechar
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center py-4"
        onClick={stop}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        <img
          src={s.src}
          alt={s.caption}
          className={`max-h-full rounded-xl object-contain shadow-2xl ${s.device === "mobile" ? "max-w-[min(100%,420px)]" : "max-w-full"}`}
        />
      </div>

      {/* Setas fora da imagem, para nunca ficarem sobre um print claro. */}
      <div className="flex items-center justify-between gap-3" onClick={stop}>
        {n > 1 ? (
          <button
            type="button"
            aria-label="Tela anterior"
            onClick={() => go(-1)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink shadow-lg hover:bg-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : (
          <span />
        )}
        <p className="text-center text-xs text-paper/80">{n > 1 ? "Deslize para o lado ou use as setas" : ""}</p>
        {n > 1 ? (
          <button
            type="button"
            aria-label="Próxima tela"
            onClick={() => go(1)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink shadow-lg hover:bg-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
