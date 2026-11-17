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

export const revalidate = 60;

export const metadata: Metadata = {
  title:
    "Comprar Imóveis em Balneário Camboriú e Camboriú | Venda | Corretora Val",
  description:
    "Apartamentos, coberturas e casas à venda em Balneário Camboriú e Camboriú. Assessoria jurídica completa e oportunidades com alta valorização no litoral.",
  alternates: {
    canonical: "/comprar-imoveis-balneario-camboriu",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/comprar-imoveis-balneario-camboriu`,
    siteName: "Corretora Val",
    title:
      "Comprar Imóveis em Balneário Camboriú e Camboriú | Venda | Corretora Val",
    description:
      "Apartamentos, coberturas e casas à venda em Balneário Camboriú e Camboriú com assessoria experiente da Corretora Val.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Comprar Imóveis em Balneário Camboriú e Camboriú | Venda | Corretora Val",
    description:
      "Oportunidades de compra de imóveis em Balneário Camboriú e Camboriú.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

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
  const properties = await getSaleProperties();

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="COMPRA & VENDA DE IMÓVEIS"
        title="Comprar Imóveis em Balneário Camboriú e Camboriú"
        subtitle="Invista no metro quadrado mais valorizado do Brasil com total segurança jurídica, suporte documental minucioso e orientação de quem atua no mercado desde 1990."
      />

      {/* Conteúdo Editorial Otimizado para SEO (>300 palavras) */}
      <section className="py-16 md:py-20 bg-white border-b">
        <div className="shell max-w-4xl space-y-8 text-[var(--ink-soft)] leading-relaxed">
          <SectionTitle
            eyebrow="Investimento Seguro"
            title="O Mercado Imobiliário de Balneário Camboriú e Camboriú"
          />

          <p className="text-base sm:text-lg">
            <strong>Balneário Camboriú</strong> consolidou-se como o polo de
            maior valorização imobiliária do Brasil, atraindo investidores e
            famílias em busca de rentabilidade sólida, solidez patrimonial e
            qualidade de vida incomparável. Com arranha-céus imponentes, praias
            limpas, segurança de primeiro mundo e índice elevado de
            desenvolvimento humano (IDH), adquirir um imóvel na região é uma
            decisão estratégica de preservação e crescimento de capital.
          </p>

          <div className="grid gap-6 md:grid-cols-3 pt-4">
            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <TrendingUp size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                Alta Valorização
              </h3>
              <p className="text-xs sm:text-sm mt-2">
                Histórico consistente de valorização do metro quadrado acima da
                média nacional e excelente liquidez para revenda e locação.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <Shield size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                Due Diligence Completa
              </h3>
              <p className="text-xs sm:text-sm mt-2">
                Auditoria jurídica rigorosa: checagem de certidões cíveis, fiscais,
                trabalhistas, matrícula e ônus reais antes de qualquer sinal.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <FileCheck2 size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                Escritura & Financiamento
              </h3>
              <p className="text-xs sm:text-sm mt-2">
                Acompanhamento integral desde a proposta de compra até a
                assinatura da escritura pública definitiva e registro imobiliário.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="display text-2xl text-[var(--plum)] font-bold">
              Opções em Balneário Camboriú e Camboriú para Cada Perfil
            </h3>
            <p className="text-sm sm:text-base">
              Nosso portfólio contempla desde estúdios e apartamentos compactos
              para geração de renda por aluguel até suntuosos apartamentos de 3
              a 5 suítes frente ao mar na <em>Barra Sul</em>, <em>Centro</em> e{" "}
              <em>Pioneiros</em>. Para quem busca condomínios horizontais com
              amplo espaço, jardins e contato direto com a natureza,{" "}
              <strong>Camboriú</strong> apresenta condomínios fechados e bairros
              planejados com excelente relação custo por metro quadrado.
            </p>
            <p className="text-sm sm:text-base">
              A corretora Valdete Gonçalves de Melo (CRECI/SC 56372-F) atua com
              ética e discrição absoluta, intermediando negociações diretas com
              proprietários e construtoras renomadas. Seja para pagamento à vista,
              parcelamento direto com a construtora ou financiamento bancário com
              as melhores taxas do mercado, oferecemos assessoria personalizada
              em cada etapa.
            </p>
          </div>
        </div>
      </section>

      {/* Grade de Imóveis à Venda */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)]">
        <div className="shell">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow="Oportunidades de Compra"
              title="Imóveis Selecionados à Venda"
              subtitle="Confira apartamentos, casas e coberturas disponíveis para compra imediata."
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
        title="Quer comprar ou vender seu imóvel no litoral?"
        description="Fale diretamente com a Corretora Val e descubra as melhores opções com segurança jurídica total."
        primaryButtonText="Falar com a Corretora"
        secondaryButtonText="Ver mais imóveis"
        secondaryButtonHref="/imoveis"
      />
    </main>
  );
}
