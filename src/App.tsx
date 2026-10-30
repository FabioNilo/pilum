import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, NO_PREFERENCE, ScrollTrigger } from "@/lib/motion";
import { track } from "@/lib/track";
import { projects } from "@/data/projects";
import { DEFAULT_SEGMENT, getSegment, readSegmentFromUrl, segments, writeSegmentToUrl, type SegmentId } from "@/data/segments";
import type { ServiceId } from "@/data/services";
import { About } from "@/components/About";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Chooser } from "@/components/Chooser";
import { OrderFlow } from "@/components/OrderFlow";
import { Portfolio } from "@/components/Portfolio";
import { PwaDemo } from "@/components/PwaDemo";
import { ProjectCard } from "@/components/ProjectCard";
import { Services } from "@/components/Services";
import { SegmentPicker, SegmentSwitcher } from "@/components/SegmentPicker";
import { Testimonials } from "@/components/Testimonials";
import { CtaFooter, Differentials, Header, Hero, HowItWorks, PainStrip } from "@/components/Sections";

/** Ao trocar de nicho, o conteúdo novo entra com um fade (só opacidade: transform quebraria a seção fixa). */
function SegmentContent({ animate, children }: { animate: boolean; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!animate) return;
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        gsap.from(root.current, { autoAlpha: 0, duration: 0.45, ease: "power1.out", clearProps: "opacity,visibility" });
      });
    },
    { scope: root },
  );
  return <div ref={root}>{children}</div>;
}

export default function App() {
  // Quem chega por ?nicho= (anúncio, Instagram) ou escolhe um setor recebe o CTA desse setor; os demais, o da empresa.
  const [fromUrl] = useState(() => readSegmentFromUrl());
  const [segmentId, setSegmentId] = useState<SegmentId>(() => fromUrl ?? DEFAULT_SEGMENT);
  const [service, setService] = useState<ServiceId | null>(null);
  const switched = useRef(false);
  const segment = getSegment(segmentId);
  const { solutions } = segment;
  const segProjects = solutions.projectIds.map((id) => projects.find((p) => p.id === id)).filter((p) => !!p);

  const choose = (id: SegmentId, origin: string) => {
    if (id === segmentId) return;
    switched.current = true;
    setSegmentId(id);
    writeSegmentToUrl(id);
    track("nicho_escolhido", { nicho: id, origem: origin });
  };

  // O conteúdo do nicho muda a altura da página: recalcula as posições dos gatilhos de scroll.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [segmentId]);

  // Clique numa dor ou num "ver a opção indicada": rola até a solução, trocando de nicho se ela for de outro.
  const goToSolution = (projectId: string, ref: string) => {
    track("dor_click", { ref });
    if (!solutions.projectIds.includes(projectId)) {
      const other = segments.find((s) => s.solutions.projectIds.includes(projectId));
      if (other) choose(other.id, "link");
    }
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => document.getElementById(projectId)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" }), 120);
  };

  // Card de serviço: filtra o portfólio e rola até ele.
  const pickService = (id: ServiceId) => {
    track("servico_click", { servico: id });
    setService(id);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("portfolio")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  };

  const segmentCta = fromUrl || switched.current ? segment.cta : undefined;

  return (
    <>
      <Header />
      <main>
        <Hero projects={projects} />
        <Services onPick={pickService} />
        <Portfolio service={service} onServiceChange={setService} />
        <Testimonials />

        <SegmentPicker value={segmentId} onChange={choose} contentId="nicho" />

        <div id="nicho" className="scroll-mt-32">
          <SegmentContent key={segmentId} animate={switched.current}>
            <PainStrip pains={segment.pains} onPick={goToSolution} />
            <BeforeAfter data={segment.beforeAfter} />
            <OrderFlow flow={segment.flow} />
            <PwaDemo pwa={segment.pwa} />

            <section id="solucoes" className="section scroll-mt-32">
              <div className="container">
                <p className="eyebrow">Soluções para você</p>
                <h2 className="mt-2 max-w-2xl text-3xl uppercase sm:text-4xl">{solutions.title}</h2>
                <p className="mt-3 max-w-2xl text-ink-soft">{solutions.intro}</p>

                {solutions.chooser && <Chooser items={solutions.chooser} onPick={goToSolution} />}

                <div className="mt-8 space-y-8">
                  {segProjects.map((p, i) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      flip={i % 2 === 1}
                      onSee={goToSolution}
                      note={solutions.notes?.[p.id]}
                      ctaLabel={solutions.cardCta}
                    />
                  ))}
                </div>
              </div>
            </section>

            <SegmentSwitcher value={segmentId} onChange={choose} contentId="nicho" />
          </SegmentContent>
        </div>

        <HowItWorks />
        <About />
        <Differentials />
      </main>
      <CtaFooter title={segmentCta?.title} text={segmentCta?.text} message={segmentCta?.message} />
    </>
  );
}
