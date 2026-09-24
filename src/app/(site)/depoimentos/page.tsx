import type { Metadata } from "next";
import { TestimonialsPlaceholder } from "@/components/institutional/testimonials-placeholder";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { getDepoimentos, getPageSeo } from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("depoimentos");

  return {
    title: seo.title ?? "Depoimentos de Clientes | Corretora Val",
    description:
      seo.description ??
      "Confira as avaliações e experiências reais de clientes que confiaram a compra, venda ou administração de seus imóveis à Corretora Val.",
  };
}

export default async function DepoimentosPage() {
  const depoimentos = await getDepoimentos();

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="Relações de Confiança"
        title="O que dizem sobre a Corretora Val"
        subtitle="Histórias, vivências e a confiança de quem escolheu nossa assessoria para cuidar do seu patrimônio."
      />

      <section className="py-16 md:py-24 bg-white">
        <TestimonialsPlaceholder showTitle={false} testimonials={depoimentos} />
      </section>

      <CTASection
        title="Venha escrever o próximo capítulo conosco."
        description="Fale diretamente com a Corretora Val e descubra uma forma humana e segura de cuidar do seu imóvel."
      />
    </main>
  );
}
