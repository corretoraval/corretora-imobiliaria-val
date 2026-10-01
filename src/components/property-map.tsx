"use client";

import dynamic from "next/dynamic";
import { Compass, Info, MapPin } from "lucide-react";

// Carrega o Leaflet apenas no cliente para evitar erros de SSR ("window is not defined")
const PropertyMapInner = dynamic(() => import("./property-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] sm:h-[400px] w-full rounded-2xl bg-[var(--surface-muted,#f0ede6)] animate-pulse flex flex-col items-center justify-center text-[var(--ink-soft)] gap-2">
      <MapPin className="text-[var(--gold)] animate-bounce" size={28} />
      <span className="text-xs font-semibold">Carregando mapa...</span>
    </div>
  ),
});

interface PropertyMapProps {
  visibility?: "EXATA" | "APROXIMADA" | "OCULTA" | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  city: string;
  neighborhood?: string | null;
  address?: string | null;
  pontosReferencia?: string | null;
  title: string;
}

export function PropertyMap({
  visibility,
  latitude,
  longitude,
  city,
  neighborhood,
  address,
  pontosReferencia,
  title,
}: PropertyMapProps) {
  // Se visibilidade for OCULTA ou não tiver coordenadas válidas, a seção inteira não é exibida
  if (!visibility || visibility === "OCULTA") {
    return null;
  }

  const lat = latitude != null ? Number(latitude) : null;
  const lng = longitude != null ? Number(longitude) : null;

  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  const isExact = visibility === "EXATA";
  const locationLabel = isExact && address
    ? `${address} — ${neighborhood ? `${neighborhood}, ` : ""}${city}`
    : `${neighborhood ? `${neighborhood}, ` : ""}${city}`;

  return (
    <section aria-labelledby="property-location-heading" className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-[var(--gold)]">Onde fica</span>
          <h2 id="property-location-heading" className="display text-2xl text-[var(--plum)]">
            Localização
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--ink-soft)]">
            <MapPin size={16} className="text-[var(--gold)] shrink-0" />
            <span>{locationLabel}</span>
          </p>
        </div>

        <div>
          {isExact ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Localização exata
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              <Info size={14} className="text-amber-600" />
              Região aproximada
            </span>
          )}
        </div>
      </div>

      {!isExact && (
        <div className="flex items-start gap-2.5 rounded-xl bg-[var(--surface-muted,#faf8f5)] p-3 text-xs text-[var(--ink-soft)] border border-[var(--border,#f0ede6)]">
          <Info size={16} className="text-[var(--gold)] shrink-0 mt-0.5" />
          <p>
            Por motivos de segurança e discrição aos proprietários, o mapa exibe a área aproximada do bairro. O endereço completo e visita presencial são fornecidos no contato com a corretora.
          </p>
        </div>
      )}

      {/* Container do Mapa Leaflet */}
      <div className="rounded-2xl border border-[var(--border,#e8e3d9)] overflow-hidden shadow-inner">
        <PropertyMapInner
          latitude={lat}
          longitude={lng}
          visibility={visibility}
          title={title}
          addressLabel={locationLabel}
        />
      </div>

      {/* Pontos de Referência / Proximidades */}
      {pontosReferencia && (
        <div className="rounded-2xl bg-[var(--surface-muted,#faf8f5)] p-4 sm:p-5 border border-[var(--border,#f0ede6)]">
          <div className="flex items-center gap-2 mb-2">
            <Compass size={18} className="text-[var(--gold)]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--plum)]">
              Pontos de Referência e Proximidades
            </h3>
          </div>
          <p className="text-sm text-[var(--ink)] leading-relaxed whitespace-pre-line">
            {pontosReferencia}
          </p>
        </div>
      )}
    </section>
  );
}
