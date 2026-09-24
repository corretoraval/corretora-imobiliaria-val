import type { Metadata } from "next";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { prisma } from "@/lib/prisma";
import { getPageSeo } from "@/lib/site-content";
import { BlogClientWrapper } from "./blog-client-wrapper";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("blog");

  return {
    title: seo.title ?? "Blog Imobiliário | Corretora Val",
    description:
      seo.description ??
      "Conteúdos, guias de investimento, dicas de locação e análises do mercado imobiliário em Balneário Camboriú e Camboriú.",
  };
}

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof prisma.postBlog.findMany>> = [];
  try {
    // NOTE: sem paginação — todos os posts publicados são carregados de uma vez
    // e repassados ao BlogClientWrapper via initialPosts. A filtragem por
    // categoria e busca por texto é feita inteiramente em memória no cliente.
    // Se for implementada paginação no futuro, revisar a lógica de filtro em
    // src/app/(site)/blog/blog-client-wrapper.tsx para buscar via API em vez
    // de filtrar apenas sobre o lote inicial.
    posts = await prisma.postBlog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    posts = [];
  }

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="Conteúdo & Mercado"
        title="Conteúdos para ajudar você a tomar melhores decisões imobiliárias."
        subtitle="Artigos exclusivos sobre investimentos, tendências de mercado, locação anual e orientações práticas para proprietários e compradores."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <BlogClientWrapper initialPosts={posts} />
        </div>
      </section>

      <CTASection
        title="Quer sugestões personalizadas para o seu investimento?"
        description="Fale diretamente comigo para receber análises do mercado imobiliário catarinense e encontrar as melhores oportunidades."
      />
    </main>
  );
}
