import {
  ArrowRight,
  CheckCircle2,
  FileText,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionTitle } from "@/components/site/section-title";
import { prisma } from "@/lib/prisma";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import {
  getAluguelAnualPageContent,
  getPageSeo,
} from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("aluguel-anual-balneario-camboriu");
  const title =
    seo.title ??
    "Aluguel Anual em Balneário Camboriú e Camboriú | Corretora Val";
  const description =
    seo.description ??
    "Encontre apartamentos e casas para aluguel anual em Balneário Camboriú e Camboriú. Contratos seguros, vistorias detalhadas e assessoria completa.";
  return {
    title,
    description,
    alternates: { canonical: "/aluguel-anual-balneario-camboriu" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: `${SITE_URL}/aluguel-anual-balneario-camboriu`,
      siteName: "Corretora Val",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

async function getRentalProperties() {
  try {
    const rows = await prisma.imovel.findMany({
      where: {
        purpose: "LOCACAO_ANUAL",
        archivedAt: null,
        status: "DISPONIVEL",
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: {
        photos: {
          orderBy: [{ isCover: "desc" }, { position: "asc" }],
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      slug: r.slug,
      title: r.title,
      location: r.neighborhood ? `${r.neighborhood}, ${r.city}` : r.city,
      city: r.city,
      neighborhood: r.neighborhood,
      purpose: r.purpose,
      price: r.monthlyRent ?? r.salePrice ?? null,
      salePrice: r.salePrice,
      monthlyRent: r.monthlyRent,
      dailyRate: r.dailyRate,
      propertyType: r.propertyType,
      bedrooms: r.bedrooms,
      suites: r.suites,
      bathrooms: r.bathrooms,
      parkingSpaces: r.parkingSpaces,
      privateArea: r.privateArea,
      isFeatured: r.isFeatured,
      photos: r.photos,
    }));
  } catch {
    return [];
  }
}

export default async function AluguelAnualPage() {
  const [properties, c] = await Promise.all([
    getRentalProperties(),
    getAluguelAnualPageContent(),
  ]);

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow={c.heroEyebrow}
        title={c.heroTitle}
        subtitle={c.heroSubtitle}
      />

      {/* Conteúdo Editorial Otimizado para SEO (>300 palavras) */}
      <section className="py-16 md:py-20 bg-white border-b">
        <div className="shell max-w-4xl space-y-8 text-[var(--ink-soft)] leading-relaxed">
          <SectionTitle
            eyebrow={c.sectionEyebrow}
            title={c.sectionTitle}
          />

          <p className="text-base sm:text-lg">{c.intro}</p>

          <div className="grid gap-6 md:grid-cols-3 pt-4">
            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                {c.card1Title}
              </h3>
              <p className="text-xs sm:text-sm mt-2">{c.card1Text}</p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <FileText size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                {c.card2Title}
              </h3>
              <p className="text-xs sm:text-sm mt-2">{c.card2Text}</p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                {c.card3Title}
              </h3>
              <p className="text-xs sm:text-sm mt-2">{c.card3Text}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="display text-2xl text-[var(--plum)] font-bold">
              {c.textSectionTitle}
            </h3>
            <p className="text-sm sm:text-base">{c.textParagraph1}</p>
            <p className="text-sm sm:text-base">{c.textParagraph2}</p>
            <p className="text-sm sm:text-base">{c.textParagraph3}</p>
          </div>
        </div>
      </section>

      {/* Imóveis em Destaque para Locação Anual */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)]">
        <div className="shell">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow={c.listingsEyebrow}
              title={c.listingsTitle}
              subtitle={c.listingsSubtitle}
            />
            <Link
              href="/imoveis?finalidade=locacao_anual"
              className="interactive inline-flex items-center gap-2 text-sm font-extrabold text-[var(--plum)] hover:text-[var(--gold)] transition-colors self-start md:self-end"
            >
              Ver todas as locações anuais <ArrowRight size={16} />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-3xl border border-[var(--gold-light)] bg-white p-8 md:p-12 text-center space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)]">
                <KeyRound size={22} />
              </div>
              <h3 className="display text-2xl text-[var(--plum)]">
                Novos imóveis para locação estão sendo cadastrados
              </h3>
              <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
                Entre em contato direto pelo WhatsApp para receber opções
                recém-captadas que ainda não foram publicadas no site.
              </p>
              <div className="pt-2">
                <Link
                  href="/contato"
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-xs font-bold text-white hover:bg-[var(--plum-bright)] transition-all"
                >
                  Falar com a Corretora Val <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/imoveis?finalidade=locacao_anual"
              className="interactive inline-flex items-center gap-2 rounded-full border border-[var(--plum)] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white transition-all"
            >
              Explorar Catálogo Completo de Locação <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <CTASection
        title={c.ctaTitle}
        description={c.ctaDescription}
        primaryButtonText={c.ctaPrimaryLabel}
        secondaryButtonText={c.ctaSecondaryLabel}
        secondaryButtonHref="/imoveis"
      />
    </main>
  );
}
