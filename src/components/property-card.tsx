import {
  ArrowRight,
  Bed,
  Car,
  Check,
  Home,
  MapPin,
  Maximize2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";

export type PropertyPurpose = "VENDA" | "LOCACAO_ANUAL" | "TEMPORADA";

export interface PropertyCardProps {
  property: {
    id: string;
    code?: string;
    slug?: string;
    title: string;
    location: string;
    city?: string;
    neighborhood?: string | null;
    purpose?: PropertyPurpose;
    price: number | null;
    salePrice?: number | null;
    monthlyRent?: number | null;
    dailyRate?: number | null;
    propertyType?: string | null;
    bedrooms?: number | null;
    suites?: number | null;
    bathrooms?: number | null;
    parkingSpaces?: number | null;
    privateArea?: number | null;
    isFeatured?: boolean;
    photos?: Array<{ url: string; alt?: string | null; isCover?: boolean }>;
    coverImage?: string | null;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const href = property.slug ? `/imoveis/${property.slug}` : "/imoveis";

  // Determinar foto de capa
  const coverPhoto =
    property.coverImage ||
    property.photos?.find((p) => p.isCover)?.url ||
    property.photos?.[0]?.url;

  // Determinar preço e label por finalidade
  const purpose = property.purpose ?? "VENDA";
  let displayPrice = property.price;
  let priceSuffix = "";
  let purposeLabel = "Venda";
  let purposeBadgeClass =
    "bg-[var(--gold)] text-[var(--plum)] border border-[var(--gold-light)]/40";

  if (purpose === "LOCACAO_ANUAL") {
    displayPrice = property.monthlyRent ?? property.price;
    priceSuffix = " /mês";
    purposeLabel = "Locação Anual";
    purposeBadgeClass =
      "bg-[var(--plum)] text-white border border-white/20 shadow-xs";
  } else if (purpose === "TEMPORADA") {
    displayPrice = property.dailyRate ?? property.price;
    priceSuffix = " /diária";
    purposeLabel = "Temporada";
    purposeBadgeClass =
      "bg-emerald-700 text-white border border-emerald-500/30 shadow-xs";
  } else {
    displayPrice = property.salePrice ?? property.price;
    purposeLabel = "Venda";
    purposeBadgeClass =
      "bg-[var(--gold)] text-[var(--plum)] border border-[var(--gold-light)]/50 shadow-xs";
  }

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] shadow-[0_4px_16px_rgba(53,16,79,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[0_12px_28px_rgba(53,16,79,0.12)]">
      <div>
        {/* Imagem ou Capa com Degradê */}
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[var(--plum)] to-[var(--plum-bright)]">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_80%_20%,rgba(216,189,130,0.25),transparent_60%)]">
              <div className="text-center text-white/50">
                <Home className="mx-auto mb-1 opacity-40" size={32} />
                <span className="text-xs font-semibold tracking-wider">
                  CORRETORA VAL
                </span>
              </div>
            </div>
          )}

          {/* Gradiente de sobreposição para legibilidade das tags */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Badge de Finalidade (VENDA / LOCAÇÃO / TEMPORADA) */}
              <span
                className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-extrabold tracking-wide uppercase shadow-sm ${purposeBadgeClass}`}
              >
                {purposeLabel}
              </span>

              {/* Badge de Destaque */}
              {property.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--plum)]/90 px-2.5 py-0.5 text-[0.7rem] font-bold text-[var(--gold-light)] border border-[var(--gold)]/30 backdrop-blur-xs shadow-sm">
                  <Sparkles size={11} className="text-[var(--gold)]" /> Destaque
                </span>
              )}
            </div>

            {/* Tipo de Imóvel */}
            {property.propertyType && (
              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[0.68rem] font-semibold text-white/95 backdrop-blur-md border border-white/10 shadow-sm">
                {property.propertyType}
              </span>
            )}
          </div>

          {/* Código do imóvel no rodapé da imagem */}
          {property.code && (
            <div className="absolute bottom-2.5 left-3">
              <span className="rounded bg-black/60 px-2 py-0.5 text-[0.65rem] font-mono font-bold tracking-wider text-white/90 backdrop-blur-xs">
                {property.code}
              </span>
            </div>
          )}
        </div>

        {/* Informações do Imóvel */}
        <div className="p-5">
          <Link href={href} className="block group-hover:text-[var(--plum-bright)] transition-colors">
            <h3 className="text-lg font-bold leading-snug text-[var(--plum)] line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-soft)] line-clamp-1">
            <MapPin size={13} className="shrink-0 text-[var(--gold)]" />
            <span>{property.location}</span>
          </p>

          {/* Características (Quartos, Vagas, Metragem) */}
          {(property.bedrooms ||
            property.parkingSpaces ||
            property.privateArea) && (
            <div className="mt-4 flex items-center gap-3 border-t border-[var(--border,#f0ede6)] pt-3 text-xs text-[var(--ink-soft)] font-medium">
              {property.bedrooms ? (
                <span className="flex items-center gap-1" title="Quartos">
                  <Bed size={15} className="text-[var(--gold)]" />
                  {property.bedrooms} {property.bedrooms === 1 ? "qt" : "qts"}
                </span>
              ) : null}
              {property.parkingSpaces ? (
                <span className="flex items-center gap-1" title="Vagas de garagem">
                  <Car size={15} className="text-[var(--gold)]" />
                  {property.parkingSpaces} {property.parkingSpaces === 1 ? "vg" : "vgs"}
                </span>
              ) : null}
              {property.privateArea ? (
                <span className="flex items-center gap-1" title="Área privativa">
                  <Maximize2 size={13} className="text-[var(--gold)]" />
                  {property.privateArea} m²
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé com Preço e Botão Ver Detalhes */}
      <div className="flex items-center justify-between border-t border-[var(--border,#f0ede6)] bg-[var(--surface-muted,#faf8f5)] px-5 py-3.5">
        <div>
          <span className="block text-[0.65rem] font-bold text-[var(--ink-soft)] uppercase tracking-wider">
            {purposeLabel}
          </span>
          <p className="text-base font-extrabold text-[var(--plum)]">
            {displayPrice != null ? (
              <>
                {formatPrice(displayPrice)}
                {priceSuffix && (
                  <span className="text-xs font-normal text-[var(--ink-soft)]">
                    {priceSuffix}
                  </span>
                )}
              </>
            ) : (
              "Sob consulta"
            )}
          </p>
        </div>

        <Link
          href={href}
          className="interactive inline-flex items-center gap-1.5 rounded-full bg-[var(--plum)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--plum-bright)] hover:gap-2 transition-all duration-200"
        >
          Ver detalhes <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
