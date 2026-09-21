import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { prisma } from "@/lib/prisma";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.postBlog.findUnique({ where: { slug } });

  if (!post) {
    return { title: "Artigo não encontrado | Corretora Val" };
  }

  return {
    title: post.seoTitle || `${post.title} | Blog Corretora Val`,
    description: post.seoDescription || post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await prisma.postBlog.findUnique({ where: { slug } });

  if (!post?.isPublished) {
    notFound();
  }

  // Fetch featured properties to show as related sidebar widget
  const featuredProperties = await prisma.imovel.findMany({
    where: { status: "DISPONIVEL", isFeatured: true, archivedAt: null },
    take: 2,
  });

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow={post.category}
        title={post.title}
        subtitle={post.summary}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Main Content */}
            <article className="lg:col-span-8 space-y-8">
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b text-xs text-[var(--ink-soft)]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--plum)]">
                    <User size={15} className="text-[var(--gold)]" />
                    <span>{post.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-[var(--gold)]" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[var(--gold)]" />
                    <span>{post.readingTimeMinutes} min de leitura</span>
                  </div>
                </div>

                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 font-bold text-[var(--plum)] hover:text-[var(--gold)] transition-colors"
                >
                  <ArrowLeft size={14} /> Voltar ao Blog
                </Link>
              </div>

              {/* Body */}
              <div
                className="prose prose-plum max-w-none space-y-6 text-[var(--ink)] leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--plum)] [&_h2]:pt-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--plum)] [&_h3]:pt-2 [&_p]:text-base [&_p]:text-[var(--ink-soft)] [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--gold)] [&_blockquote]:pl-4 [&_blockquote]:italic"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted admin-generated content
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Bottom Navigation */}
              <div className="pt-8 border-t flex items-center justify-between">
                <Link
                  href="/blog"
                  className="interactive inline-flex items-center gap-2 rounded-full border px-6 py-3 text-xs font-bold text-[var(--plum)] uppercase hover:bg-[var(--surface-muted)]"
                >
                  <ArrowLeft size={14} /> Ver todos os artigos
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              {/* WhatsApp Box */}
              <div className="rounded-3xl border border-[var(--gold-light)] bg-gradient-to-br from-[var(--surface-muted)] to-[var(--surface)] p-8 shadow-xs space-y-4">
                <h4 className="font-bold text-lg text-[var(--plum)]">
                  Dúvidas sobre este tema?
                </h4>
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                  Fale com a Corretora Val e receba uma orientação personalizada
                  para o seu imóvel ou investimento.
                </p>
                <a
                  href="https://wa.me/5547974007301"
                  target="_blank"
                  rel="noreferrer"
                  className="interactive flex items-center justify-center gap-2 rounded-full bg-[var(--plum)] py-3 text-xs font-extrabold text-white uppercase shadow-md hover:bg-[var(--plum-bright)] transition-all"
                >
                  Falar no WhatsApp
                </a>
              </div>

              {/* Related Properties */}
              {featuredProperties.length > 0 && (
                <div className="rounded-3xl border bg-white p-8 shadow-xs space-y-4">
                  <h4 className="font-bold text-base text-[var(--plum)]">
                    Imóveis em Destaque
                  </h4>
                  <div className="space-y-4">
                    {featuredProperties.map((prop) => (
                      <Link
                        key={prop.id}
                        href={`/imoveis/${prop.slug}`}
                        className="block rounded-2xl border p-4 hover:border-[var(--gold-light)] transition-all group"
                      >
                        <span className="text-[0.65rem] font-extrabold text-[var(--gold)] uppercase block">
                          {prop.code} · {prop.city}
                        </span>
                        <h5 className="font-bold text-sm text-[var(--plum)] group-hover:text-[var(--plum-bright)] transition-colors line-clamp-1">
                          {prop.title}
                        </h5>
                        <p className="text-xs text-[var(--ink-soft)] mt-1">
                          {prop.salePrice
                            ? `R$ ${prop.salePrice.toLocaleString("pt-BR")}`
                            : "Consulte valor"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
