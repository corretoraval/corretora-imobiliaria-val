import {
  Bath,
  Bed,
  Car,
  Check,
  ChevronRight,
  Compass,
  Dog,
  Flame,
  Home,
  Layers,
  MapPin,
  Maximize2,
  Share2,
  ShieldCheck,
  Sparkles,
  Tv,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyLeadForm } from "@/components/property-lead-form";
import { formatPrice } from "@/lib/format-price";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

async function getPropertyBySlug(slug: string) {
  try {
    const decodedSlug = decodeURIComponent(slug);
    const property = await prisma.imovel.findFirst({
      where: {
        OR: [{ slug: decodedSlug }, { code: decodedSlug }, { id: decodedSlug }],
        archivedAt: null,
      },
      include: {
        photos: {
          orderBy: [{ isCover: "desc" }, { position: "asc" }],
        },
      },
    });
    return property;
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
    return null;
  }
}

async function getRelatedProperties(currentId: string, purpose: string, city: string) {
  try {
    const properties = await prisma.imovel.findMany({
      where: {
        id: { not: currentId },
        archivedAt: null,
        OR: [{ purpose: purpose as any }, { city }],
      },
      take: 3,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        photos: {
          orderBy: [{ isCover: "desc" }, { position: "asc" }],
        },
      },
    });

    return properties.map((r) => ({
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

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Imóvel não encontrado | Corretora Val",
    };
  }

  const coverUrl = property.photos[0]?.url;

  return {
    title: `${property.title} | ${property.code} - Corretora Val`,
    description:
      property.summary ||
      property.description ||
      `Confira detalhes de ${property.title} em ${property.city}. Atendimento exclusivo Corretora Val.`,
    openGraph: {
      title: `${property.title} | Corretora Val`,
      description: property.summary || undefined,
      images: coverUrl ? [{ url: coverUrl }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const related = await getRelatedProperties(
    property.id,
    property.purpose,
    property.city,
  );

  // Configuração do Badge e Rótulo de Preço
  const isRent = property.purpose === "LOCACAO_ANUAL";
  const isSeason = property.purpose === "TEMPORADA";
  const isSale = property.purpose === "VENDA";

  let mainPrice = property.salePrice;
  let pricePeriod = "";
  let purposeBadge = { label: "Venda", bg: "bg-[var(--gold)] text-[var(--plum)]" };

  if (isRent) {
    mainPrice = property.monthlyRent;
    pricePeriod = " /mês";
    purposeBadge = { label: "Locação Anual", bg: "bg-[var(--plum)] text-white" };
  } else if (isSeason) {
    mainPrice = property.dailyRate;
    pricePeriod = " /diária";
    purposeBadge = { label: "Temporada", bg: "bg-emerald-700 text-white" };
  }

  // Lista de comodidades
  const amenities = [
    { label: "Suítes", active: Boolean(property.suites && property.suites > 0), desc: `${property.suites} suíte(s)` },
    { label: "Mobiliado", active: property.furnished, icon: Home },
    { label: "Sacada", active: property.hasBalcony, icon: Compass },
    { label: "Churrasqueira", active: property.hasBarbecue, icon: Flame },
    { label: "Piscina", active: property.hasPool, icon: Waves },
    { label: "Ar Condicionado", active: property.hasAirConditioning, icon: Wind },
    { label: "Vista para o Mar", active: property.seaView, icon: Waves },
    { label: "Frente Mar", active: property.oceanFront, icon: Waves },
    { label: "Quadra Mar", active: property.beachBlock, icon: Waves },
    { label: "Aceita Pets", active: property.allowsPets, icon: Dog },
    { label: "Elevador", active: property.hasElevator, icon: Layers },
    { label: "Wi-Fi", active: property.hasWifi, icon: Wifi },
  ].filter((a) => a.active);

  return (
    <main className="shell py-10 sm:py-14">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
        <Link href="/" className="hover:text-[var(--plum)] transition-colors">
          Início
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <Link href="/imoveis" className="hover:text-[var(--plum)] transition-colors">
          Imóveis
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="font-semibold text-[var(--plum)] truncate max-w-xs">
          {property.code}
        </span>
      </nav>

      {/* Header do Imóvel */}
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${purposeBadge.bg}`}
            >
              {purposeBadge.label}
            </span>
            <span className="rounded-full bg-[var(--surface-muted,#f0ede6)] px-3 py-1 text-xs font-bold text-[var(--ink-soft)]">
              {property.propertyType}
            </span>
            {property.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--gold)]/20 px-3 py-1 text-xs font-bold text-[var(--plum)] border border-[var(--gold)]/40">
                <Sparkles size={12} className="text-[var(--gold)]" /> Destaque
              </span>
            )}
            <span className="rounded bg-black/5 px-2 py-0.5 font-mono text-xs font-bold text-[var(--ink-soft)]">
              Cód: {property.code}
            </span>
          </div>

          <h1 className="display mt-3 text-3xl leading-tight text-[var(--plum)] sm:text-4xl lg:text-5xl">
            {property.title}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--ink-soft)]">
            <MapPin size={16} className="text-[var(--gold)] shrink-0" />
            <span>
              {property.neighborhood ? `${property.neighborhood}, ` : ""}
              {property.city} — SC
            </span>
          </p>
        </div>

        {/* Preço em destaque superior */}
        <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 shadow-sm lg:text-right shrink-0">
          <span className="text-[0.7rem] font-bold text-[var(--ink-soft)] uppercase tracking-wider block">
            Valor de {purposeBadge.label}
          </span>
          <p className="display text-3xl font-extrabold text-[var(--plum)] sm:text-4xl">
            {mainPrice != null ? (
              <>
                {formatPrice(mainPrice)}
                {pricePeriod && (
                  <span className="text-base font-normal text-[var(--ink-soft)]">
                    {pricePeriod}
                  </span>
                )}
              </>
            ) : (
              "Sob consulta"
            )}
          </p>
        </div>
      </div>

      {/* Grid Principal: Galeria & Detalhes + Sidebar */}
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_25rem]">
        {/* Coluna da Esquerda */}
        <div className="space-y-10">
          {/* Galeria de Fotos */}
          <PropertyGallery title={property.title} photos={property.photos} />

          {/* Ficha Rápida / Especificações em Cartões */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {property.bedrooms ? (
              <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-center shadow-xs">
                <Bed className="mx-auto mb-1 text-[var(--gold)]" size={24} />
                <span className="text-xs text-[var(--ink-soft)] block">Dormitórios</span>
                <span className="font-extrabold text-[var(--plum)] text-lg">
                  {property.bedrooms} {property.bedrooms === 1 ? "quarto" : "quartos"}
                </span>
              </div>
            ) : null}

            {property.suites ? (
              <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-center shadow-xs">
                <ShieldCheck className="mx-auto mb-1 text-[var(--gold)]" size={24} />
                <span className="text-xs text-[var(--ink-soft)] block">Suítes</span>
                <span className="font-extrabold text-[var(--plum)] text-lg">
                  {property.suites} {property.suites === 1 ? "suíte" : "suítes"}
                </span>
              </div>
            ) : null}

            {property.bathrooms ? (
              <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-center shadow-xs">
                <Bath className="mx-auto mb-1 text-[var(--gold)]" size={24} />
                <span className="text-xs text-[var(--ink-soft)] block">Banheiros</span>
                <span className="font-extrabold text-[var(--plum)] text-lg">
                  {property.bathrooms}
                </span>
              </div>
            ) : null}

            {property.parkingSpaces ? (
              <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-center shadow-xs">
                <Car className="mx-auto mb-1 text-[var(--gold)]" size={24} />
                <span className="text-xs text-[var(--ink-soft)] block">Garagem</span>
                <span className="font-extrabold text-[var(--plum)] text-lg">
                  {property.parkingSpaces} {property.parkingSpaces === 1 ? "vaga" : "vagas"}
                </span>
              </div>
            ) : null}

            {property.privateArea ? (
              <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-center shadow-xs">
                <Maximize2 className="mx-auto mb-1 text-[var(--gold)]" size={24} />
                <span className="text-xs text-[var(--ink-soft)] block">Área Privativa</span>
                <span className="font-extrabold text-[var(--plum)] text-lg">
                  {property.privateArea} m²
                </span>
              </div>
            ) : null}

            {property.totalArea ? (
              <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-center shadow-xs">
                <Maximize2 className="mx-auto mb-1 text-[var(--gold)]" size={24} />
                <span className="text-xs text-[var(--ink-soft)] block">Área Total</span>
                <span className="font-extrabold text-[var(--plum)] text-lg">
                  {property.totalArea} m²
                </span>
              </div>
            ) : null}
          </div>

          {/* Custos adicionais (Condomínio, IPTU) se cadastrados */}
          {(property.condoFee || property.iptu || property.cleaningFee) && (
            <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface-muted,#faf8f5)] p-5">
              <h3 className="font-bold text-sm text-[var(--plum)] mb-3 uppercase tracking-wider">
                Custos e Encargos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {property.condoFee ? (
                  <div>
                    <span className="text-xs text-[var(--ink-soft)] block">Condomínio</span>
                    <span className="font-bold text-[var(--plum)]">{formatPrice(property.condoFee)}/mês</span>
                  </div>
                ) : null}
                {property.iptu ? (
                  <div>
                    <span className="text-xs text-[var(--ink-soft)] block">IPTU</span>
                    <span className="font-bold text-[var(--plum)]">{formatPrice(property.iptu)}/ano</span>
                  </div>
                ) : null}
                {property.cleaningFee ? (
                  <div>
                    <span className="text-xs text-[var(--ink-soft)] block">Taxa de Limpeza</span>
                    <span className="font-bold text-[var(--plum)]">{formatPrice(property.cleaningFee)}</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Descrição do Imóvel */}
          <div className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-6 sm:p-8 shadow-xs">
            <h2 className="display text-2xl text-[var(--plum)] mb-4">
              Sobre o imóvel
            </h2>

            {property.summary && (
              <p className="text-base font-semibold text-[var(--plum-bright)] mb-4 leading-relaxed">
                {property.summary}
              </p>
            )}

            <div className="prose prose-plum max-w-none text-sm leading-relaxed text-[var(--ink)] whitespace-pre-line">
              {property.description ||
                "Imóvel exclusivo selecionado pela Corretora Val com alto padrão de qualidade, localização privilegiada e documentação rigorosamente verificada. Entre em contato para agendar uma visita privativa."}
            </div>
          </div>

          {/* Comodidades e Diferenciais */}
          {amenities.length > 0 && (
            <div className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-6 sm:p-8 shadow-xs">
              <h2 className="display text-2xl text-[var(--plum)] mb-5">
                Diferenciais e Comodidades
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((item, idx) => {
                  const Icon = item.icon || Check;
                  return (
                    <div
                      key={item.label || idx}
                      className="flex items-center gap-2.5 rounded-xl bg-[var(--surface-muted,#faf8f5)] p-3 text-xs font-semibold text-[var(--plum)]"
                    >
                      <Icon size={16} className="text-[var(--gold)] shrink-0" />
                      <span>{item.desc || item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna da Direita (Sidebar de Conversão) */}
        <aside className="lg:sticky lg:top-24 self-start">
          <PropertyLeadForm
            propertyCode={property.code}
            propertyTitle={property.title}
            propertyAddress={property.neighborhood ? `${property.neighborhood}, ${property.city}` : property.city}
            propertyType={property.propertyType}
          />
        </aside>
      </div>

      {/* Imóveis Relacionados / Semelhantes */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-[var(--border,#e8e3d9)] pt-14">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end mb-8">
            <div>
              <span className="eyebrow text-[var(--gold)]">Veja também</span>
              <h2 className="display mt-1 text-3xl text-[var(--plum)]">
                Imóveis Semelhantes
              </h2>
            </div>
            <Link
              href="/imoveis"
              className="interactive text-sm font-bold text-[var(--plum)] hover:text-[var(--plum-bright)]"
            >
              Ver todos os imóveis →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
