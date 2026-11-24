import {
  ArrowRight,
  FileCheck2,
  Shield,
  ShoppingBag,
  TrendingUp,
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
  getComprarImoveisPageContent,
  getPageSeo,
} from "@/lib/site-content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("comprar-imoveis-balneario-camboriu");
  const title =
    seo.title ??
    "Comprar Imóveis em Balneário Camboriú e Camboriú | Venda | Corretora Val";
  const description =
    seo.description ??
    "Apartamentos, coberturas e casas à venda em Balneário Camboriú e Camboriú. Assessoria jurídica completa e oportunidades com alta valorização no litoral.";
  return {
    title,
    description,
    alternates: { canonical: "/comprar-imoveis-balneario-camboriu" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: `${SITE_URL}/comprar-imoveis-balneario-camboriu`,
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

async function getSaleProperties() {
  try {
    const rows = await prisma.imovel.findMany({
      where: {
        purpose: "VENDA",
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
      price: r.salePrice ?? r.monthlyRent ?? null,
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

export default async function ComprarImoveisPage() {
  const [properties, c] = await Promise.all([
    getSaleProperties(),
    getComprarImoveisPageContent(),
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
                <TrendingUp size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                {c.card1Title}
              </h3>
              <p className="text-xs sm:text-sm mt-2">{c.card1Text}</p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <Shield size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                {c.card2Title}
              </h3>
              <p className="text-xs sm:text-sm mt-2">{c.card2Text}</p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <FileCheck2 size={20} />
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
          </div>
        </div>
      </section>

      {/* Grade de Imóveis à Venda */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)]">
        <div className="shell">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow={c.listingsEyebrow}
              title={c.listingsTitle}
              subtitle={c.listingsSubtitle}
            />
            <Link
              href="/imoveis?finalidade=venda"
              className="interactive inline-flex items-center gap-2 text-sm font-extrabold text-[var(--plum)] hover:text-[var(--gold)] transition-colors self-start md:self-end"
            >
              Ver todos os imóveis à venda <ArrowRight size={16} />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-3xl border border-[var(--gold-light)] bg-white p-8 md:p-12 text-center space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)]">
                <ShoppingBag size={22} />
              </div>
              <h3 className="display text-2xl text-[var(--plum)]">
                Novos imóveis à venda em captação
              </h3>
              <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
                Temos opções em negociação privada e lançamentos. Fale com nossa
                equipe para receber a seleção ideal para seu perfil.
              </p>
              <div className="pt-2">
                <Link
                  href="/contato"
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-xs font-bold text-white hover:bg-[var(--plum-bright)] transition-all"
                >
                  Consultar Oportunidades <ArrowRight size={14} />
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
              href="/imoveis?finalidade=venda"
              className="interactive inline-flex items-center gap-2 rounded-full border border-[var(--plum)] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white transition-all"
            >
              Ver Todos os Imóveis à Venda <ArrowRight size={15} />
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
