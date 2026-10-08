// Logo Pilum Code recriado em SVG a partir das pranchas em /public/brand.
// Símbolo: colchetes de código < > atravessados por um pilum (dardo romano) com ponta vermelha.

type Variant = "light" | "dark"; // fundo onde o logo será aplicado

const colors = {
  light: { mark: "#0E1116", tip: "#B3261E" },
  dark: { mark: "#ECEDEF", tip: "#E0483D" },
};

/** Geometria do símbolo (viewBox 196 150 568 568). Reutilizada no favicon. */
export function PilumMark({ mark, tip }: { mark: string; tip: string }) {
  return (
    <>
      <g fill="none" stroke={mark} strokeWidth="43" strokeLinejoin="miter" strokeMiterlimit="4">
        <polyline points="388,313 245,462 388,611" />
        <polyline points="572,313 715,462 572,611" />
      </g>
      <line x1="411" y1="700" x2="536" y2="286" stroke={mark} strokeWidth="20" />
      <rect x="-28" y="-14" width="56" height="28" fill={mark} transform="translate(490 440) rotate(16.9)" />
      <polygon points="500,276 565,163 561,294" fill={tip} />
    </>
  );
}

export function PilumSymbol({ variant = "light", className, title }: { variant?: Variant; className?: string; title?: string }) {
  const c = colors[variant];
  return (
    <svg
      viewBox="196 150 568 568"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <PilumMark mark={c.mark} tip={c.tip} />
    </svg>
  );
}

/**
 * Logo completo: símbolo + "PILUM" + "CODE" (+ slogan opcional).
 * O tamanho é controlado pelo font-size do className (tudo em em).
 */
export function PilumLogo({
  variant = "light",
  className = "",
  tagline = false,
}: {
  variant?: Variant;
  className?: string;
  tagline?: boolean;
}) {
  const dark = variant === "dark";
  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <span className="sr-only">Pilum Code{tagline ? " — Feito para acertar." : ""}</span>
      <span className="inline-flex items-center gap-[0.32em]" aria-hidden>
        <PilumSymbol variant={variant} className="h-[1.55em] w-[1.55em] shrink-0" />
        <span className="inline-flex flex-col">
          <span className={`font-display text-[1em] uppercase leading-[0.95] ${dark ? "text-paper" : "text-ink"}`}>Pilum</span>
          <span className={`mt-[0.08em] flex justify-between font-mono text-[0.34em] font-bold leading-none ${dark ? "text-accent-bright" : "text-accent"}`}>
            <span>C</span>
            <span>O</span>
            <span>D</span>
            <span>E</span>
          </span>
        </span>
      </span>
      {tagline && (
        <span aria-hidden className={`mt-[0.6em] font-mono text-[0.3em] uppercase tracking-[0.3em] ${dark ? "text-paper/60" : "text-ink-mute"}`}>
          Feito para acertar.
        </span>
      )}
    </span>
  );
}
