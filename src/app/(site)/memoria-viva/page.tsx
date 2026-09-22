import { HeartHandshake } from "lucide-react";
import type { Metadata } from "next";
import { Timeline } from "@/components/institutional/timeline";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionTitle } from "@/components/site/section-title";
import { getMarcosHistoricos, getMemoriaVivaContent } from "@/lib/site-content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Memória Viva | Corretora Val",
  description:
    "Explore a trajetória da Corretora Val ao longo dos anos. Um memorial digital sobre nossas origens, momentos marcantes e o legado imobiliário em Balneário Camboriú.",
};

export default async function MemoriaVivaPage() {
  const [dbMarcos, content] = await Promise.all([
    getMarcosHistoricos(),
    getMemoriaVivaContent(),
  ]);

  const timelineItems =
    dbMarcos.length > 0
      ? dbMarcos.map((m) => ({
          year: String(m.year),
          title: m.title,
          description: m.description || "",
          image:
            String(m.year) === "1989"
              ? {
                  src: "/images/institutional/valdete-inicio-1989.png",
                  alt: "Valdete no início da carreira na Imobiliária Gonzaga em Curitiba (1989/1990)",
                  caption:
                    "1989 — O convite que abriu a primeira porta, na Imobiliária Gonzaga em Curitiba.",
                }
              : undefined,
        }))
      : undefined;
  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="Nossa História em Fotos e Momentos"
        title="Memória Viva: Uma história construída com pessoas, lugares e sonhos."
        subtitle="Um espaço especial dedicado a preservar a memória da Corretora Val e os marcos que construíram nossa relação com Balneário Camboriú e Camboriú."
      />

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <SectionTitle
            eyebrow="Linha do Tempo"
            title="Capítulos marcantes da nossa caminhada"
            subtitle="Conheça a evolução da Corretora Val ao longo das últimas décadas."
          />

          <div className="max-w-4xl">
            <Timeline items={timelineItems} />
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="py-16 bg-[var(--surface-muted)] border-y text-center">
        <div className="shell max-w-3xl mx-auto space-y-4">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-2">
            <HeartHandshake size={24} />
          </div>
          <h2 className="display text-3xl md:text-4xl text-[var(--plum)] italic">
            {content.quote}
          </h2>
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
            {content.quoteDescription}
          </p>
        </div>
      </section>

      <CTASection
        title="Faça parte dos próximos capítulos desta história."
        description="Estamos prontos para atender você e sua família com o mesmo carinho e atenção de sempre."
      />
    </main>
  );
}
