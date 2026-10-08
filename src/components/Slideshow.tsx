import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";
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

  const caption = videoUrl && index === 0 ? "Vídeo de demonstração" : slides[index - offset]?.caption;

  return (
    <div className="group relative" aria-roledescription="carrossel" aria-label={`Telas: ${title}`}>
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

      {total > 1 && (
        <>
          <NavButton side="left" onClick={prev} label="Tela anterior" />
          <NavButton side="right" onClick={next} label="Próxima tela" />
        </>
      )}

      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="min-h-[2.5rem] text-sm text-ink-soft sm:min-h-[1.25rem]" aria-live="polite">
          {caption}
        </p>
        <div className="flex shrink-0 items-center gap-1.5 pt-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Ir para a tela ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-accent" : "w-1.5 bg-ink/20 hover:bg-ink/40"}`}
            />
          ))}
          <Expand className="ml-2 hidden h-3.5 w-3.5 text-ink-mute sm:block" aria-hidden />
        </div>
      </div>

      {zoom !== null && <Lightbox slides={slides} start={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

function NavButton({ side, onClick, label }: { side: "left" | "right"; onClick: () => void; label: string }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-[calc(50%-1.5rem)] ${side === "left" ? "left-2" : "right-2"} -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-card backdrop-blur transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function Lightbox({ slides, start, onClose }: { slides: Slide[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const n = slides.length;
  const s = slides[i];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => (v + 1) % n);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [n, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={s.caption}
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 text-white">
        <p className="text-sm">
          <span className="text-white/60">
            {i + 1}/{n} ·{" "}
          </span>
          {s.caption}
        </p>
        <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center py-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={s.src}
          alt={s.caption}
          className={`max-h-full rounded-xl object-contain shadow-2xl ${s.device === "mobile" ? "max-w-[min(100%,420px)]" : "max-w-full"}`}
        />
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setI((i - 1 + n) % n)}
              className="absolute left-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Próxima"
              onClick={() => setI((i + 1) % n)}
              className="absolute right-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
