import {
  ArrowRight,
  CheckCircle2,
  Sun,
  Waves,
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
    "Aluguel por Temporada em Balneário Camboriú e Camboriú | Corretora Val",
  description:
    "Imóveis mobiliados para aluguel de temporada em Balneário Camboriú e Camboriú. Próximos ao mar, conforto e segurança para suas férias no litoral catarinense.",
  alternates: {
    canonical: "/temporada-balneario-camboriu",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/temporada-balneario-camboriu`,
    siteName: "Corretora Val",
    title:
      "Aluguel por Temporada em Balneário Camboriú e Camboriú | Corretora Val",
    description:
      "Reserve apartamentos e casas confortáveis para temporada em Balneário Camboriú e Camboriú com atendimento de confiança.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Aluguel por Temporada em Balneário Camboriú e Camboriú | Corretora Val",
    description:
      "Imóveis para aluguel de temporada em Balneário Camboriú e Camboriú.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

async function getSeasonProperties() {
  try {
    const rows = await prisma.imovel.findMany({
      where: {
        purpose: "TEMPORADA",
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
      price: r.dailyRate ?? r.salePrice ?? null,
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

export default async function TemporadaPage() {
  const properties = await getSeasonProperties();

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="LOCAÇÃO DE TEMPORADA & FÉRIAS"
        title="Aluguel por Temporada em Balneário Camboriú e Camboriú"
        subtitle="Viva momentos inesquecíveis no litoral de Santa Catarina com imóveis mobiliados, climatizados e estrategicamente localizados para o seu descanso e lazer."
      />

      {/* Conteúdo Editorial Otimizado para SEO (>300 palavras) */}
      <section className="py-16 md:py-20 bg-white border-b">
        <div className="shell max-w-4xl space-y-8 text-[var(--ink-soft)] leading-relaxed">
          <SectionTitle
            eyebrow="Férias no Litoral Catarinense"
            title="Por que Alugar por Temporada com a Corretora Val?"
          />

          <p className="text-base sm:text-lg">
            Conhecida como a <em>Capital Catarinense do Turismo</em>,{" "}
            <strong>Balneário Camboriú</strong> atrai milhares de visitantes todos
            os anos durante o verão, feriados prolongados e finais de semana.
            A cidade conta com atrações famosas internacionalmente, como a
            orla revitalizada da Praia Central, a moderna FG Big Wheel, o
            Parque Unipraias com bondinhos aéreos e uma vida noturna e
            gastronômica inigualável.
          </p>

          <div className="grid gap-6 md:grid-cols-3 pt-4">
            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <Waves size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                Localização Privilegiada
              </h3>
              <p className="text-xs sm:text-sm mt-2">
                Opções frente mar, quadra mar e a poucos metros da praia nos
                melhores pontos da Avenida Atlântica e Avenida Brasil.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <Sun size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                Totalmente Equipados
              </h3>
              <p className="text-xs sm:text-sm mt-2">
                Imóveis com ar-condicionado, Wi-Fi de alta velocidade, cozinha
                completa, churrasqueira e vaga de garagem privativa.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="display text-xl text-[var(--plum)] font-bold">
                Check-in Seguro
              </h3>
              <p className="text-xs sm:text-sm mt-2">
                Entrega de chaves organizada, contrato de locação por temporada
                formalizado e assistência próxima durante todo o período.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="display text-2xl text-[var(--plum)] font-bold">
              Imóveis para Famílias e Grupos em Balneário Camboriú e Camboriú
            </h3>
            <p className="text-sm sm:text-base">
              Ao planejar suas férias, evitar intermediários desconhecidos e
              garantir que o imóvel reservado condiz exatamente com as fotos é
              fundamental. A Corretora Val (CRECI/SC 56372-F) seleciona
              pessoalmente cada imóvel para <strong>temporada</strong>,
              certificando-se de que a estrutura esteja impecável para receber
              famílias com crianças, casais e pequenos grupos de amigos.
            </p>
            <p className="text-sm sm:text-base">
              Além de Balneário Camboriú, o município vizinho de{" "}
              <strong>Camboriú</strong> desponta como excelente alternativa de
              hospedagem, proporcionando tranquilidade no interior verde,
              imóveis amplos para grandes famílias e acesso rápido às praias em
              poucos minutos de carro.
            </p>
            <p className="text-sm sm:text-base">
              Nossa equipe orienta você na escolha do número ideal de dormitórios,
              capacidade máxima de hóspedes, proximidade com supermercados e
              farmácias, garantindo férias livres de imprevistos e com o aconchego
              que sua família merece.
            </p>
          </div>
        </div>
      </section>

      {/* Grade de Imóveis para Temporada */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)]">
        <div className="shell">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow="Seleção de Férias"
              title="Imóveis Disponíveis para Temporada"
              subtitle="Consulte diárias e pacotes especiais de verão, réveillon e feriados."
            />
            <Link
              href="/imoveis?finalidade=temporada"
              className="interactive inline-flex items-center gap-2 text-sm font-extrabold text-[var(--plum)] hover:text-[var(--gold)] transition-colors self-start md:self-end"
            >
              Ver todas as opções de temporada <ArrowRight size={16} />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-3xl border border-[var(--gold-light)] bg-white p-8 md:p-12 text-center space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)]">
                <Sun size={22} />
              </div>
              <h3 className="display text-2xl text-[var(--plum)]">
                Consulte datas e disponibilidade para a temporada
              </h3>
              <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
                Temos opções sazonais com disponibilidade sob consulta direta.
                Informe as datas de sua estadia e quantidade de hóspedes.
              </p>
              <div className="pt-2">
                <Link
                  href="/contato"
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-xs font-bold text-white hover:bg-[var(--plum-bright)] transition-all"
                >
                  Consultar Disponibilidade <ArrowRight size={14} />
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
              href="/imoveis?finalidade=temporada"
              className="interactive inline-flex items-center gap-2 rounded-full border border-[var(--plum)] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white transition-all"
            >
              Consultar Catálogo de Temporada <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <CTASection
        title="Planejando suas férias em Balneário Camboriú?"
        description="Entre em contato com a Corretora Val e reserve seu imóvel de temporada com total antecedência e segurança."
        primaryButtonText="Reservar pelo WhatsApp"
        secondaryButtonText="Ver mais imóveis"
        secondaryButtonHref="/imoveis"
      />
    </main>
  );
}
