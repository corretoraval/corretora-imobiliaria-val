import type { Metadata } from "next";
import { AuthorityStats } from "@/components/institutional/authority-stats";
import { TestimonialsPlaceholder } from "@/components/institutional/testimonials-placeholder";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionTitle } from "@/components/site/section-title";
import { getDepoimentos, getPageSeo } from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("autoridade");

  return {
    title: seo.title ?? "Autoridade e Experiência | Corretora Val",
    description:
      seo.description ??
      "Confiança imobiliária em Balneário Camboriú e Camboriú. Mais de 35 anos de experiência, registro CRECI/SC 56372-F e sólida reputação na gestão patrimonial.",
  };
}

export default async function AutoridadePage() {
  const depoimentos = await getDepoimentos();

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="Confiança & Experiência"
        title="Experiência que transforma negócios imobiliários em decisões seguras."
        subtitle="Conhecimento profundo do mercado catarinense amparado por registro profissional, processos estruturados e reputação construída ao longo de décadas."
      />

      {/* Stats & Trust Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <SectionTitle
            eyebrow="Prova de Autoridade"
            title="Números e credibilidade no mercado local"
            subtitle="Estrutura de atuação pensada para oferecer máxima segurança em compra, venda e locação."
          />

          <AuthorityStats />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)] border-y">
        <TestimonialsPlaceholder testimonials={depoimentos} />
      </section>

      <CTASection
        title="Converse com quem entende a fundo o mercado imobiliário local."
        description="Fale diretamente comigo, Valdete Gonçalves de Melo (CRECI/SC 56372-F), para orientações seguras e atendimento personalizado."
      />
    </main>
  );
}
