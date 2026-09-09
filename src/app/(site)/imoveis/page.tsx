export const revalidate = 30; // revalidate every 30s

import { KeyRound, ShoppingBag, Sun, Layers } from "lucide-react";
import Link from "next/link";
import { PropertyCard, type PropertyPurpose } from "@/components/property-card";
import { prisma } from "@/lib/prisma";

interface ImoveisPageProps {
  searchParams: Promise<{ finalidade?: string }>;
}

async function loadProperties(finalidadeFilter?: string) {
  try {
    const validPurpose = ["VENDA", "LOCACAO_ANUAL", "TEMPORADA"].includes(
      finalidadeFilter?.toUpperCase() || "",
    )
      ? (finalidadeFilter?.toUpperCase() as PropertyPurpose)
      : undefined;

    const rows = await prisma.imovel.findMany({
      where: {
        archivedAt: null,
        ...(validPurpose ? { purpose: validPurpose } : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 60,
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
      purpose: r.purpose as PropertyPurpose,
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
  } catch (error) {
    console.error("Erro ao carregar imóveis:", error);
    return [];
  }
}

export default async function ImoveisPage({ searchParams }: ImoveisPageProps) {
  const { finalidade } = await searchParams;
  const currentFilter = finalidade?.toUpperCase() || "TODOS";
  const properties = await loadProperties(finalidade);

  const filterTabs = [
    { id: "TODOS", label: "Todos os Imóveis", href: "/imoveis", icon: Layers },
    { id: "VENDA", label: "Comprar (Venda)", href: "/imoveis?finalidade=venda", icon: ShoppingBag },
    { id: "LOCACAO_ANUAL", label: "Alugar (Locação)", href: "/imoveis?finalidade=locacao_anual", icon: KeyRound },
    { id: "TEMPORADA", label: "Temporada", href: "/imoveis?finalidade=temporada", icon: Sun },
  ];

  return (
    <main className="shell py-12 sm:py-16">
      {/* Cabeçalho */}
      <div className="max-w-3xl">
        <span className="eyebrow text-[var(--gold)]">Catálogo Exclusivo</span>
        <h1 className="display mt-2 text-4xl text-[var(--plum)] sm:text-5xl">
          Imóveis Selecionados
        </h1>
        <p className="mt-3 text-base text-[var(--ink-soft)] leading-relaxed">
          Encontre os melhores apartamentos, casas e coberturas em Balneário Camboriú, Camboriú e região com a garantia e o cuidado da Corretora Val.
        </p>
      </div>

      {/* Abas de Filtro por Finalidade */}
      <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 border-b border-[var(--border,#e8e3d9)] pb-4">
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`interactive inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-[var(--plum)] text-white shadow-md"
                  : "bg-[var(--surface-muted,#faf8f5)] text-[var(--ink)] hover:bg-[var(--border,#eae5dc)] border border-transparent"
              }`}
            >
              <Icon size={14} className={isActive ? "text-[var(--gold)]" : "text-[var(--ink-soft)]"} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Listagem em Grade */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-[var(--border,#d4cec4)] bg-[var(--surface-muted,#faf8f5)] p-12 text-center">
            <p className="text-base font-bold text-[var(--plum)]">
              Nenhum imóvel encontrado nesta categoria no momento.
            </p>
            <p className="mt-2 text-xs text-[var(--ink-soft)]">
              Entre em contato conosco para encomendar seu imóvel ideal ou volte a visualizar todos os imóveis.
            </p>
            <Link
              href="/imoveis"
              className="interactive mt-5 inline-flex rounded-full bg-[var(--plum)] px-5 py-2.5 text-xs font-bold text-white hover:bg-[var(--plum-bright)] transition-colors"
            >
              Ver todos os imóveis
            </Link>
          </div>
        ) : (
          properties.map((p) => <PropertyCard key={p.id} property={p} />)
        )}
      </div>
    </main>
  );
}
