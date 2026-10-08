import { ArrowDown } from "lucide-react";
import { tierChooser } from "@/data/projects";

/** "Qual é o seu caso?": leva o dono de restaurante direto à opção que combina com ele. */
export function Chooser({ onPick }: { onPick: (projectId: string, ref: string) => void }) {
  return (
    <section aria-labelledby="qual-caso" className="mt-10 rounded-3xl border border-paper-line bg-paper-card p-5 shadow-card sm:p-8">
      <p className="eyebrow">Qual é o seu caso?</p>
      <h3 id="qual-caso" className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
        Comece pela opção que combina com o seu restaurante
      </h3>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {tierChooser.map(({ ifYou, projectId, tierName }) => (
          <li key={projectId}>
            <a
              href={`#${projectId}`}
              onClick={(e) => {
                e.preventDefault();
                onPick(projectId, `caso-${projectId}`);
              }}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-paper-line bg-paper p-4 transition-colors hover:border-accent/60 hover:bg-accent-soft/60"
            >
              <span className="text-[0.95rem] text-ink">
                <span className="font-semibold">Se você…</span> {ifYou.replace(/^Você\s+/i, "").replace(/^./, (c) => c.toLowerCase())}
              </span>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:underline">
                {tierName}
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
