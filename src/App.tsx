import { useState } from "react";
import { track } from "@/lib/track";
import { primaryNiches, projects, type NicheId } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { Testimonials } from "@/components/Testimonials";
import { CtaFooter, Differentials, Header, Hero, HowItWorks, NicheFilter, PainStrip } from "@/components/Sections";

export default function App() {
  const [niche, setNiche] = useState<NicheId | "todos">("todos");
  const visible = niche === "todos" ? projects : projects.filter((p) => p.niche === niche);
  const main = visible.filter((p) => primaryNiches.includes(p.niche));
  const others = visible.filter((p) => !primaryNiches.includes(p.niche));

  // Clique numa dor: abre todos os nichos (para o card existir) e rola até a solução.
  const goToSolution = (projectId: string, ref: string) => {
    setNiche("todos");
    track("dor_click", { ref });
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => document.getElementById(projectId)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 60);
  };

  return (
    <>
      <Header />
      <main>
        <Hero projects={projects} />
        <PainStrip onPick={goToSolution} />

        <section id="solucoes" className="section scroll-mt-16">
          <div className="container">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Soluções por nicho</p>
                <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">
                  Soluções prontas para adaptar ao seu negócio, testadas em restaurantes e delivery
                </h2>
                <p className="mt-3 max-w-2xl text-ink-soft">
                  {/* TODO(fabio): se quiser dizer "em uso" também nos outros nichos, confirme antes quais clientes autorizam. */}
                  Veja as telas e imagine com a sua marca.
                </p>
              </div>
              <NicheFilter value={niche} onChange={setNiche} />
            </div>

            {main.length > 0 && (
              <div className="mt-10 space-y-8">
                {main.map((p, i) => (
                  <ProjectCard key={p.id} project={p} flip={i % 2 === 1} />
                ))}
              </div>
            )}

            {others.length > 0 && (
              <div className={main.length > 0 ? "mt-16 border-t border-paper-line pt-12" : "mt-10"}>
                <p className="eyebrow">Também desenvolvo para</p>
                <p className="mt-2 max-w-2xl text-ink-soft">
                  A mesma base serve para outros negócios de atendimento. Estas são demonstrações prontas para adaptar.
                </p>
                <div className="mt-6 space-y-6">
                  {others.map((p, i) => (
                    <ProjectCard key={p.id} project={p} flip={i % 2 === 1} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <Testimonials />
        <HowItWorks />
        <Differentials />
      </main>
      <CtaFooter />
    </>
  );
}
