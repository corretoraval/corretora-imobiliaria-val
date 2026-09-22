import {
  ArrowRight,
  Building2,
  CalendarDays,
  KeyRound,
  ShoppingBag,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AuthorityStats } from "@/components/institutional/authority-stats";
import { TestimonialsPlaceholder } from "@/components/institutional/testimonials-placeholder";
import { PropertyCard } from "@/components/property-card";
import { CTASection } from "@/components/site/cta-section";
import { SectionTitle } from "@/components/site/section-title";
import { prisma } from "@/lib/prisma";
import { getDepoimentos, getHomeContent } from "@/lib/site-content";

export const revalidate = 60;

async function getFeaturedProperties() {
  try {
    const rows = await prisma.imovel.findMany({
      where: {
        isFeatured: true,
        archivedAt: null,
      },
      orderBy: [{ createdAt: "desc" }],
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
      price: r.salePrice ?? r.monthlyRent ?? r.dailyRate ?? null,
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

export default async function Home() {
  const [featuredProperties, content, depoimentos] = await Promise.all([
    getFeaturedProperties(),
    getHomeContent(),
    getDepoimentos(),
  ]);

  return (
    <main>
      {/* Hero Section */}
      <section className="shell grid min-h-[calc(100dvh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.92fr] lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow fade-up">{content.hero.eyebrow}</p>
          <h1 className="display fade-up-delay mt-5 text-5xl leading-[0.92] text-[var(--plum)] sm:text-6xl lg:text-8xl">
            {content.hero.title.replace(content.hero.emphasis, "")}
            <em className="font-normal text-[var(--gold)]">
              {content.hero.emphasis}
            </em>
          </h1>
          <p className="fade-up-delay mt-7 max-w-xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
            {content.hero.description}
          </p>
          <div className="fade-up-delay mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--plum)] px-6 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(53,16,79,0.18)] hover:-translate-y-0.5 hover:bg-[var(--plum-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
              href={content.hero.primaryHref}
            >
              {content.hero.primaryLabel} <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link
              className="interactive inline-flex min-h-12 items-center justify-center gap-2 rounded-full border bg-[var(--surface)] px-6 text-sm font-extrabold text-[var(--plum)] hover:border-[var(--gold)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
              href={content.hero.secondaryHref}
            >
              {content.hero.secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#35104F_0%,#4A1768_58%,#765184_100%)] p-8 text-white shadow-[0_24px_60px_rgba(53,16,79,0.24)] sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(216,189,130,0.28),transparent_30%),radial-gradient(circle_at_10%_100%,rgba(255,255,255,0.13),transparent_35%)]" />
            <div className="relative">
              <span className="eyebrow text-[var(--gold-light)]">
                {content.hero.cardEyebrow}
              </span>
              <p className="display mt-10 max-w-sm text-4xl leading-none sm:text-5xl">
                {content.hero.cardTitle}
              </p>
              <div className="mt-12 border-t border-white/20 pt-5">
                <p className="text-sm leading-6 text-white/75">
                  {content.hero.cardDescription}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-5 hidden w-48 rounded-2xl border border-[var(--gold-light)] bg-[var(--surface)] p-5 text-[var(--plum)] shadow-[0_14px_35px_rgba(53,16,79,0.16)] sm:block">
            <p className="eyebrow">{content.hero.attentionEyebrow}</p>
            <p className="display mt-2 text-2xl leading-tight">
              {content.hero.attentionTitle}
            </p>
          </div>
        </div>
      </section>

      {/* Services / 4 Areas */}
      <section className="border-y bg-[var(--surface)] py-20">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Áreas de Atuação</p>
            <h2 className="display mt-4 text-4xl leading-none text-[var(--plum)] sm:text-5xl">
              {content.areasTitle}
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.areas.map((service, index) => {
              const Icon = [ShoppingBag, KeyRound, CalendarDays, Building2][index] ?? ShoppingBag;
              return (
                <Link
                  href={service.href}
                  key={service.title}
                  className="interactive flex flex-col justify-between rounded-2xl bg-[var(--background)] p-7 shadow-[0_0_0_1px_rgba(53,16,79,0.07),0_2px_4px_rgba(53,16,79,0.04)] hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(53,16,79,0.1),0_14px_28px_rgba(53,16,79,0.1)] transition-all group"
                >
                  <div>
                    <span className="flex size-11 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold-light)] group-hover:scale-105 transition-transform">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <h3 className="display mt-6 text-3xl text-[var(--plum)]">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                      {service.text}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-extrabold text-[var(--gold)] uppercase tracking-wider">
                    Saiba mais <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEÇÃO 1 — Imóveis em Destaque */}
      <section className="py-20 md:py-24 bg-white">
        <div className="shell">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle
              eyebrow="Oportunidades Selecionadas"
              title="Imóveis em Destaque"
              subtitle="Unidades exclusivas com documentação rigorosa em Balneário Camboriú e Camboriú."
            />
            <Link
              href="/imoveis"
              className="interactive inline-flex items-center gap-2 text-sm font-extrabold text-[var(--plum)] hover:text-[var(--gold)] transition-colors self-start md:self-end"
            >
              Ver todos os imóveis <ArrowRight size={16} />
            </Link>
          </div>

          {featuredProperties.length === 0 ? (
            <div className="rounded-3xl border border-[var(--gold-light)] bg-[var(--surface)] p-8 md:p-12 text-center space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)]">
                <Sparkles size={22} />
              </div>
              <h3 className="display text-2xl text-[var(--plum)]">
                Novos destaques em preparação
              </h3>
              <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
                Estamos selecionando novas oportunidades de alto padrão.
                Consulte nosso catálogo completo para encontrar seu próximo
                imóvel.
              </p>
              <div className="pt-2">
                <Link
                  href="/imoveis"
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-xs font-bold text-white hover:bg-[var(--plum-bright)] transition-all"
                >
                  Explorar Catálogo de Imóveis <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/imoveis"
                  className="interactive inline-flex items-center gap-2 rounded-full border border-[var(--plum)] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white transition-all shadow-xs"
                >
                  Ver todos os imóveis <ArrowRight size={15} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* SEÇÃO 2 — Autoridade (Números + Resumo da História) */}
      <section className="py-20 md:py-24 bg-[var(--surface-muted)] border-t">
        <div className="shell space-y-16">
          <SectionTitle
            eyebrow="Tradição & Solidez"
            title="Credibilidade construída com trabalho e presença local"
            subtitle="Estrutura profissional e dedicação para cuidar com excelência do seu patrimônio imobiliário."
          />

          <AuthorityStats />

          {/* Resumo da História da Fundadora com Foto */}
          <div className="overflow-hidden rounded-3xl border border-[var(--gold-light)] bg-white shadow-xs">
            <div className="grid gap-8 lg:grid-cols-12 items-center p-8 md:p-12">
              <div className="lg:col-span-4">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--plum)]/10 shadow-sm">
                  <Image
                    src="/images/institutional/valdete-perfil.png"
                    alt="Valdete Gonçalves de Melo - Fundadora da Corretora Val"
                    fill
                    className="object-contain object-top"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--plum)]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="display text-xl font-bold">
                      Valdete Gonçalves de Melo
                    </p>
                    <p className="text-xs font-extrabold tracking-wider text-[var(--gold-light)] uppercase">
                      CRECI/SC 56372-F
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3.5 py-1 text-xs font-bold text-[var(--gold)]">
                  <UserCheck size={16} /> Fundadora da Corretora Val
                </div>
                <h3 className="display text-3xl md:text-4xl text-[var(--plum)]">
                  Uma trajetória guiada pela confiança
                </h3>
                <p className="text-sm md:text-base text-[var(--ink-soft)] leading-relaxed">
                  Desde <strong>1989</strong>, quando o primeiro convite abriu
                  as portas no mercado imobiliário em Curitiba, e com início
                  oficial da carreira em <strong>1990</strong>, uma sólida
                  trajetória foi construída com trabalho, superação e
                  compromisso ético. Hoje, à frente da Corretora Val em
                  Balneário Camboriú e Camboriú, unimos experiência e gestão
                  familiar para transformar cada negociação em uma relação de
                  confiança e cuidado real.
                </p>
                <div className="pt-2">
                  <Link
                    href="/autoridade"
                    className="interactive inline-flex items-center gap-2 text-sm font-extrabold text-[var(--plum)] hover:text-[var(--gold)] transition-colors"
                  >
                    Conheça minha história <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — Depoimentos */}
      <section className="py-20 md:py-24 bg-white border-t">
        <TestimonialsPlaceholder testimonials={depoimentos} />
      </section>

      {/* CTA Final */}
      <CTASection
        title="Confiança que abre portas para o seu patrimônio."
        description="Fale diretamente com a Corretora Val para compra, administração, locação anual ou temporada em Balneário Camboriú e região."
        primaryButtonText="Falar pelo WhatsApp"
        secondaryButtonText="Ver Nossos Imóveis"
        secondaryButtonHref="/imoveis"
      />
    </main>
  );
}
