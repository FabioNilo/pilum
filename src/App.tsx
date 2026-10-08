import { useState } from "react";
import { projects, type NicheId } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { CtaFooter, Differentials, Header, Hero, HowItWorks, NicheFilter, PainStrip } from "@/components/Sections";

export default function App() {
  const [niche, setNiche] = useState<NicheId | "todos">("todos");
  const visible = niche === "todos" ? projects : projects.filter((p) => p.niche === niche);

  return (
    <>
      <Header />
      <main>
        <Hero projects={projects} />
        <PainStrip onPick={setNiche} />

        <section id="solucoes" className="section scroll-mt-16">
          <div className="container">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Soluções por nicho</p>
                <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-5xl">Sistemas reais, já em uso por pequenos negócios</h2>
                <p className="mt-3 max-w-2xl text-ink-soft">
                  Cada solução nasceu de um problema concreto de um cliente. Veja as telas e imagine com a sua marca.
                </p>
              </div>
              <NicheFilter value={niche} onChange={setNiche} />
            </div>

            <div className="mt-10 space-y-8">
              {visible.map((p, i) => (
                <ProjectCard key={p.id} project={p} flip={i % 2 === 1} />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        <Differentials />
      </main>
      <CtaFooter />
    </>
  );
}
