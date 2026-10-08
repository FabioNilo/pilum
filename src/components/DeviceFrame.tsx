import type { Slide } from "@/data/projects";

/** Enquadra o print numa área 16:10: barra de navegador no desktop, moldura de celular no mobile. */
export function DeviceFrame({ slide, eager = false }: { slide: Slide; eager?: boolean }) {
  const img = (
    <img
      src={slide.src}
      alt={slide.caption}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full object-cover object-top"
    />
  );

  if (slide.device === "mobile") {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-paper-line/60 to-paper p-4">
        <div className="h-full aspect-[390/844] overflow-hidden rounded-[1.6rem] border-[5px] border-ink bg-ink shadow-card">
          <div className="h-full overflow-hidden rounded-[1.2rem] bg-white">{img}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-[16/10] flex-col overflow-hidden bg-white">
      <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-paper-line bg-paper px-3">
        <span className="h-2 w-2 rounded-full bg-[#f87171]" />
        <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
        <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
      </div>
      <div className="min-h-0 flex-1">{img}</div>
    </div>
  );
}
