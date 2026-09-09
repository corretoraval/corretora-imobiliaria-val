"use client";

import {
  Archive,
  Bed,
  Car,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  LoaderCircle,
  MapPin,
  Maximize2,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { formatPrice } from "@/lib/format-price";

type Purpose = "VENDA" | "LOCACAO_ANUAL" | "TEMPORADA";

type Property = {
  id: string;
  code: string;
  slug: string;
  title: string;
  propertyType: string;
  purpose: Purpose;
  status: string;
  city: string;
  neighborhood?: string | null;
  salePrice: number | null;
  monthlyRent: number | null;
  dailyRate: number | null;
  bedrooms?: number | null;
  suites?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  privateArea?: number | null;
  isFeatured: boolean;
};

type Draft = {
  code: string;
  slug: string;
  title: string;
  propertyType: string;
  purpose: Purpose;
  city: string;
  neighborhood: string;
  price: string;
  isFeatured: boolean;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parkingSpaces: string;
  privateArea: string;
  summary: string;
  description: string;
};

type PhotoEntry = {
  url: string;
  path?: string;
  alt?: string;
  position?: number;
  isCover?: boolean;
};

type PropertyPayload = {
  code: string;
  slug: string;
  title: string;
  propertyType: string;
  purpose: Purpose;
  city: string;
  neighborhood?: string | null;
  isFeatured: boolean;
  salePrice?: number | null;
  monthlyRent?: number | null;
  dailyRate?: number | null;
  bedrooms?: number | null;
  suites?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  privateArea?: number | null;
  summary?: string | null;
  description?: string | null;
  photos?: Array<{
    url: string;
    alt: string | null;
    position: number;
    isCover: boolean;
  }>;
};

const initialDraft: Draft = {
  code: "",
  slug: "",
  title: "",
  propertyType: "Apartamento",
  purpose: "VENDA",
  city: "Balneário Camboriú",
  neighborhood: "",
  price: "",
  isFeatured: false,
  bedrooms: "",
  suites: "",
  bathrooms: "",
  parkingSpaces: "",
  privateArea: "",
  summary: "",
  description: "",
};

function priceFor(property: Property) {
  return property.salePrice ?? property.monthlyRent ?? property.dailyRate;
}

function labelFor(purpose: Purpose) {
  if (purpose === "LOCACAO_ANUAL") return "Aluguel mensal";
  if (purpose === "TEMPORADA") return "Valor da diária";
  return "Valor de venda";
}

function formatCurrencyInput(val: string | number): string {
  if (val === "" || val === null || val === undefined) return "";
  const clean = String(val).replace(/\D/g, "");
  if (!clean) return "";
  const num = Number(clean);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("pt-BR").format(num);
}

function parseCurrencyInput(val: string): number | null {
  const clean = val.replace(/\D/g, "");
  return clean ? Number(clean) : null;
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminPropertiesManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    code: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/imoveis", { cache: "no-store" });
      if (!response.ok)
        throw new Error("Não foi possível carregar os imóveis.");
      setProperties(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Open/close delete confirmation dialog
  useEffect(() => {
    if (deleteTarget) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [deleteTarget]);

  function cancelEdit() {
    setEditingId(null);
    setDraft(initialDraft);
    setPhotos([]);
    setMessage(null);
  }

  async function loadPropertyForEdit(property: Property) {
    setMessage(null);
    try {
      const res = await fetch(`/api/imoveis?id=${property.id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Não foi possível carregar o imóvel.");
      const full = await res.json();
      const rawPrice = full.salePrice ?? full.monthlyRent ?? full.dailyRate ?? "";

      setDraft({
        code: full.code || "",
        slug: full.slug || "",
        title: full.title || "",
        propertyType: full.propertyType || "Apartamento",
        purpose: full.purpose || "VENDA",
        city: full.city || "Balneário Camboriú",
        neighborhood: full.neighborhood || "",
        price: rawPrice !== "" ? formatCurrencyInput(rawPrice) : "",
        isFeatured: Boolean(full.isFeatured),
        bedrooms: full.bedrooms != null ? String(full.bedrooms) : "",
        suites: full.suites != null ? String(full.suites) : "",
        bathrooms: full.bathrooms != null ? String(full.bathrooms) : "",
        parkingSpaces: full.parkingSpaces != null ? String(full.parkingSpaces) : "",
        privateArea: full.privateArea != null ? String(full.privateArea) : "",
        summary: full.summary || "",
        description: full.description || "",
      });

      if (
        full.neighborhood ||
        full.bedrooms ||
        full.suites ||
        full.bathrooms ||
        full.parkingSpaces ||
        full.privateArea ||
        full.summary ||
        full.description
      ) {
        setShowMoreDetails(true);
      }

      if (Array.isArray(full.photos)) {
        setPhotos(
          full.photos.map((photo: any) => ({
            url: photo.url,
            path: photo.path ?? undefined,
            alt: photo.alt ?? undefined,
            isCover: photo.isCover ?? false,
            position: photo.position ?? undefined,
          })),
        );
      }
      setEditingId(property.id);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro ao carregar imóvel.",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId) {
      await updateProperty();
    } else {
      await createProperty();
    }
  }

  async function createProperty() {
    setSubmitting(true);
    setMessage(null);

    const numericPrice = parseCurrencyInput(draft.price);
    const payload: PropertyPayload = {
      code: draft.code.trim().toUpperCase(),
      slug: draft.slug || toSlug(draft.title),
      title: draft.title.trim(),
      propertyType: draft.propertyType.trim(),
      purpose: draft.purpose,
      city: draft.city.trim(),
      neighborhood: draft.neighborhood.trim() || null,
      isFeatured: draft.isFeatured,
      ...(draft.purpose === "VENDA" ? { salePrice: numericPrice } : {}),
      ...(draft.purpose === "LOCACAO_ANUAL" ? { monthlyRent: numericPrice } : {}),
      ...(draft.purpose === "TEMPORADA" ? { dailyRate: numericPrice } : {}),
      bedrooms: draft.bedrooms ? Number(draft.bedrooms) : null,
      suites: draft.suites ? Number(draft.suites) : null,
      bathrooms: draft.bathrooms ? Number(draft.bathrooms) : null,
      parkingSpaces: draft.parkingSpaces ? Number(draft.parkingSpaces) : null,
      privateArea: draft.privateArea ? Number(draft.privateArea) : null,
      summary: draft.summary.trim() || null,
      description: draft.description.trim() || null,
    };

    if (photos.length > 0) {
      payload.photos = photos.map((p, i) => ({
        url: p.url,
        alt: p.alt ?? null,
        position: i,
        isCover: !!p.isCover,
      }));
    }

    try {
      const response = await fetch("/api/imoveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Revise os dados do imóvel.",
        );
      }

      setDraft(initialDraft);
      setPhotos([]);
      setMessage("Imóvel cadastrado com sucesso.");
      await loadProperties();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateProperty() {
    if (!editingId) return;
    setSubmitting(true);
    setMessage(null);

    const numericPrice = parseCurrencyInput(draft.price);
    const payload: PropertyPayload = {
      code: draft.code.trim().toUpperCase(),
      slug: draft.slug || toSlug(draft.title),
      title: draft.title.trim(),
      propertyType: draft.propertyType.trim(),
      purpose: draft.purpose,
      city: draft.city.trim(),
      neighborhood: draft.neighborhood.trim() || null,
      isFeatured: draft.isFeatured,
      salePrice: draft.purpose === "VENDA" ? numericPrice : null,
      monthlyRent: draft.purpose === "LOCACAO_ANUAL" ? numericPrice : null,
      dailyRate: draft.purpose === "TEMPORADA" ? numericPrice : null,
      bedrooms: draft.bedrooms ? Number(draft.bedrooms) : null,
      suites: draft.suites ? Number(draft.suites) : null,
      bathrooms: draft.bathrooms ? Number(draft.bathrooms) : null,
      parkingSpaces: draft.parkingSpaces ? Number(draft.parkingSpaces) : null,
      privateArea: draft.privateArea ? Number(draft.privateArea) : null,
      summary: draft.summary.trim() || null,
      description: draft.description.trim() || null,
    };

    try {
      const response = await fetch(`/api/imoveis?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Revise os dados do imóvel.",
        );
      }

      setMessage(`Imóvel ${draft.code} atualizado com sucesso.`);
      setEditingId(null);
      setDraft(initialDraft);
      setPhotos([]);
      await loadProperties();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setSubmitting(false);
    }
  }

  async function archiveProperty(id: string) {
    if (
      !window.confirm(
        "Arquivar este imóvel? Ele deixará de aparecer no site público.",
      )
    ) {
      return;
    }

    setMessage(null);
    const response = await fetch(`/api/imoveis?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Não foi possível arquivar o imóvel.");
      return;
    }

    setMessage("Imóvel arquivado.");
    await loadProperties();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/imoveis/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Não foi possível excluir o imóvel.");
      }
      setMessage(`Imóvel ${deleteTarget.code} excluído permanentemente.`);
      setDeleteTarget(null);
      await loadProperties();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const isEditing = editingId !== null;
  const editingCode = isEditing
    ? (properties.find((p) => p.id === editingId)?.code ?? "imóvel")
    : null;

  return (
    <main className="shell py-12 sm:py-16" style={{ minHeight: "100dvh" }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Painel Corretora Val</p>
          <h1 className="display mt-3 text-4xl text-[var(--plum)] sm:text-5xl">
            Gestão de Imóveis
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
            Cadastre novos imóveis, gerencie fotos, valores e mantenha seu catálogo atualizado.
          </p>
        </div>
        <button
          className="interactive inline-flex items-center justify-center gap-2 rounded-full border bg-[var(--surface)] px-5 py-3 text-sm font-bold text-[var(--plum)] hover:border-[var(--gold)]"
          disabled={loading}
          onClick={loadProperties}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={16} /> Atualizar lista
        </button>
      </div>

      {/* ── Grid Principal: Lista + Formulário ─────────── */}
      <section className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]">
        {/* Lista de Imóveis */}
        <div className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-5 shadow-[0_8px_24px_rgba(53,16,79,0.06)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="display text-3xl text-[var(--plum)]">
              Catálogo Ativo
            </h2>
            <span className="rounded-full bg-[var(--surface-muted,#f0ede6)] px-3 py-1 text-xs font-bold text-[var(--ink-soft)]">
              {properties.length} imóveis
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-[var(--ink-soft)]">
              <LoaderCircle className="animate-spin" size={18} /> Carregando imóveis…
            </div>
          ) : properties.length === 0 ? (
            <p className="py-10 text-sm text-[var(--ink-soft)]">
              Nenhum imóvel ativo. Cadastre o primeiro usando o formulário ao lado.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--border,#f0ede6)]">
              {properties.map((property) => {
                const price = priceFor(property);
                const isBeingEdited = editingId === property.id;
                const purposeLabel =
                  property.purpose === "LOCACAO_ANUAL"
                    ? "LOCAÇÃO ANUAL"
                    : property.purpose === "TEMPORADA"
                      ? "TEMPORADA"
                      : "VENDA";

                return (
                  <li
                    className={`flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between transition-all ${
                      isBeingEdited
                        ? "bg-[var(--surface-muted,#faf8f5)] -mx-3 px-3 rounded-2xl ring-2 ring-[var(--gold)]/50"
                        : ""
                    }`}
                    key={property.id}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[var(--plum)]/10 px-2 py-0.5 text-[0.65rem] font-extrabold tracking-wider text-[var(--plum)] uppercase">
                          {property.code}
                        </span>
                        <span className="text-[0.65rem] font-bold text-[var(--gold)] uppercase tracking-wider">
                          {purposeLabel}
                        </span>
                        {isBeingEdited && (
                          <span className="rounded bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--plum)]">
                            editando
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 truncate font-bold text-[var(--plum)] text-base">
                        {property.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                        {property.propertyType} · {property.city}
                        {property.neighborhood ? ` (${property.neighborhood})` : ""}
                        {price != null ? ` · ${formatPrice(price)}` : ""}
                      </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        className="interactive inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--plum)]/20 px-3.5 py-1.5 text-xs font-bold text-[var(--plum)] hover:border-[var(--plum)] hover:bg-[var(--plum)]/5"
                        onClick={() =>
                          isBeingEdited
                            ? cancelEdit()
                            : loadPropertyForEdit(property)
                        }
                        type="button"
                      >
                        {isBeingEdited ? (
                          <>
                            <X aria-hidden="true" size={13} /> Cancelar
                          </>
                        ) : (
                          <>
                            <Pencil aria-hidden="true" size={13} /> Editar
                          </>
                        )}
                      </button>

                      <button
                        className="interactive inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-bold text-[var(--ink-soft)] hover:border-amber-400 hover:text-amber-700"
                        onClick={() => archiveProperty(property.id)}
                        type="button"
                      >
                        <Archive aria-hidden="true" size={13} /> Arquivar
                      </button>

                      <button
                        className="interactive inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-600 hover:border-red-500 hover:bg-red-50"
                        onClick={() =>
                          setDeleteTarget({
                            id: property.id,
                            code: property.code,
                            title: property.title,
                          })
                        }
                        type="button"
                      >
                        <Trash2 aria-hidden="true" size={13} /> Excluir
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Painel do Formulário */}
        <section
          ref={formRef}
          className="rounded-3xl bg-[var(--plum)] p-6 text-white shadow-[0_12px_34px_rgba(53,16,79,0.2)] sm:p-8 self-start"
        >
          {isEditing ? (
            <>
              <p className="eyebrow text-[var(--gold-light)]">Modo de Edição</p>
              <h2 className="display mt-2 text-3xl">
                Editando <span className="text-[var(--gold-light)]">{editingCode}</span>
              </h2>
            </>
          ) : (
            <>
              <p className="eyebrow text-[var(--gold-light)]">Novo Imóvel</p>
              <h2 className="display mt-2 text-3xl">Adicionar Imóvel</h2>
            </>
          )}

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {/* Código e Título */}
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                Código do Imóvel *
                <input
                  className="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)] placeholder:font-normal placeholder:text-gray-400"
                  minLength={3}
                  placeholder="Ex: VAL-004"
                  onChange={(e) =>
                    setDraft({ ...draft, code: e.target.value.toUpperCase() })
                  }
                  required
                  value={draft.code}
                />
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                Título do Imóvel *
                <input
                  className="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] placeholder:font-normal placeholder:text-gray-400"
                  minLength={3}
                  placeholder="Ex: Apartamento Vista Mar na Barra Sul"
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      title: e.target.value,
                      slug: draft.slug || toSlug(e.target.value),
                    })
                  }
                  required
                  value={draft.title}
                />
              </label>
            </div>

            {/* URL amigável */}
            <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
              URL Amigável (Slug) *
              <input
                className="rounded-xl border-0 bg-white px-3.5 py-2.5 text-xs font-mono text-[var(--ink)] placeholder:text-gray-400"
                placeholder="ex: apartamento-vista-mar-barra-sul"
                onChange={(e) =>
                  setDraft({ ...draft, slug: toSlug(e.target.value) })
                }
                required
                value={draft.slug}
              />
            </label>

            {/* Finalidade e Tipo */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                Finalidade *
                <select
                  className="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)]"
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      purpose: e.target.value as Purpose,
                    })
                  }
                  value={draft.purpose}
                >
                  <option value="VENDA">Venda (Comprar)</option>
                  <option value="LOCACAO_ANUAL">Locação Anual (Alugar)</option>
                  <option value="TEMPORADA">Temporada</option>
                </select>
              </label>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                Tipo do Imóvel *
                <input
                  className="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)]"
                  placeholder="Ex: Apartamento, Casa, Cobertura"
                  onChange={(e) =>
                    setDraft({ ...draft, propertyType: e.target.value })
                  }
                  required
                  value={draft.propertyType}
                />
              </label>
            </div>

            {/* Cidade e Preço com Máscara e R$ */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                Cidade *
                <input
                  className="rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)]"
                  placeholder="Ex: Balneário Camboriú"
                  onChange={(e) =>
                    setDraft({ ...draft, city: e.target.value })
                  }
                  required
                  value={draft.city}
                />
              </label>

              {/* CAMPO DE VALOR COM R$ E MÁSCARA */}
              <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                {labelFor(draft.purpose)} *
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-extrabold text-[var(--plum)] select-none">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full rounded-xl border-0 bg-white py-2.5 pl-11 pr-3.5 text-sm font-extrabold text-[var(--plum)] placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="0"
                    onChange={(e) => {
                      const masked = formatCurrencyInput(e.target.value);
                      setDraft({ ...draft, price: masked });
                    }}
                    required
                    value={draft.price}
                  />
                </div>
              </label>
            </div>

            {/* Destaque na Home */}
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded accent-[var(--gold)]"
                checked={draft.isFeatured}
                onChange={(e) =>
                  setDraft({ ...draft, isFeatured: e.target.checked })
                }
              />
              <span>Exibir como imóvel em destaque na Home</span>
            </label>

            {/* Botão para Expandir Mais Detalhes (Quartos, Metragem, Bairro, etc.) */}
            <div className="border-t border-white/15 pt-3">
              <button
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="interactive flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-[var(--gold-light)] hover:text-white transition-colors"
              >
                <span>
                  {showMoreDetails
                    ? "− Ocultar características e descrição"
                    : "+ Adicionar características detalhadas (quartos, m², fotos, etc.)"}
                </span>
                {showMoreDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Seção Expansível de Detalhes */}
            {showMoreDetails && (
              <div className="space-y-4 rounded-2xl bg-white/10 p-4 border border-white/10">
                {/* Bairro */}
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                  Bairro
                  <input
                    className="rounded-xl border-0 bg-white px-3.5 py-2 text-sm text-[var(--ink)] placeholder:text-gray-400"
                    placeholder="Ex: Centro, Barra Sul, Pioneiros"
                    value={draft.neighborhood}
                    onChange={(e) =>
                      setDraft({ ...draft, neighborhood: e.target.value })
                    }
                  />
                </label>

                {/* Quartos, Suítes, Banheiros, Vagas, Metragem */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 text-xs font-bold text-white/90">
                    Dormitórios (Qts)
                    <input
                      type="number"
                      min="0"
                      className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-[var(--ink)]"
                      placeholder="Ex: 3"
                      value={draft.bedrooms}
                      onChange={(e) =>
                        setDraft({ ...draft, bedrooms: e.target.value })
                      }
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-bold text-white/90">
                    Suítes
                    <input
                      type="number"
                      min="0"
                      className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-[var(--ink)]"
                      placeholder="Ex: 1"
                      value={draft.suites}
                      onChange={(e) =>
                        setDraft({ ...draft, suites: e.target.value })
                      }
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-bold text-white/90">
                    Banheiros
                    <input
                      type="number"
                      min="0"
                      className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-[var(--ink)]"
                      placeholder="Ex: 2"
                      value={draft.bathrooms}
                      onChange={(e) =>
                        setDraft({ ...draft, bathrooms: e.target.value })
                      }
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-bold text-white/90">
                    Vagas de Garagem
                    <input
                      type="number"
                      min="0"
                      className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-[var(--ink)]"
                      placeholder="Ex: 2"
                      value={draft.parkingSpaces}
                      onChange={(e) =>
                        setDraft({ ...draft, parkingSpaces: e.target.value })
                      }
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-bold text-white/90">
                    Área Privativa (m²)
                    <input
                      type="number"
                      min="0"
                      className="rounded-xl border-0 bg-white px-3 py-2 text-sm text-[var(--ink)]"
                      placeholder="Ex: 120"
                      value={draft.privateArea}
                      onChange={(e) =>
                        setDraft({ ...draft, privateArea: e.target.value })
                      }
                    />
                  </label>
                </div>

                {/* Resumo */}
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                  Resumo Curto
                  <input
                    className="rounded-xl border-0 bg-white px-3.5 py-2 text-sm text-[var(--ink)] placeholder:text-gray-400"
                    placeholder="Ex: Cobertura duplex com vista panorâmica para a Praia Central."
                    value={draft.summary}
                    onChange={(e) =>
                      setDraft({ ...draft, summary: e.target.value })
                    }
                  />
                </label>

                {/* Descrição Completa */}
                <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-white/90">
                  Descrição Completa do Imóvel
                  <textarea
                    rows={4}
                    className="rounded-xl border-0 bg-white px-3.5 py-2 text-sm text-[var(--ink)] placeholder:text-gray-400 resize-y"
                    placeholder="Descreva todos os detalhes, mobília, posição solar, lazer do prédio, etc."
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </label>
              </div>
            )}

            {/* Upload e Galeria de Fotos */}
            <div className="grid gap-2 border-t border-white/15 pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Fotos do Imóvel
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={async (e) => {
                    const files = Array.from(e.currentTarget.files || []);
                    if (files.length === 0) return;
                    setMessage("Enviando imagens...");
                    try {
                      for (const f of files) {
                        const form = new FormData();
                        form.append("file", f, f.name);
                        const resp = await fetch("/api/uploads", {
                          method: "POST",
                          body: form,
                        });
                        const body = await resp.json();
                        if (!resp.ok)
                          throw new Error(body.error || "Upload falhou");
                        setPhotos((prev) => [
                          ...prev,
                          {
                            url: body.url,
                            path: body.path,
                            isCover: prev.length === 0,
                          },
                        ]);
                      }
                    } catch (err) {
                      setMessage(
                        err instanceof Error ? err.message : "Erro no upload",
                      );
                    } finally {
                      setMessage(null);
                    }
                  }}
                />
                <label
                  htmlFor="photos"
                  className="interactive inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border bg-[var(--surface)] px-5 py-2.5 text-xs font-bold text-[var(--plum)] hover:border-[var(--gold)]"
                >
                  Selecionar Fotos
                </label>
                <span className="text-xs text-white/70">
                  {photos.length} foto(s) selecionada(s).
                </span>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.url || `photo-${idx}`}
                      className="relative h-16 w-24 overflow-hidden rounded-xl bg-white shadow-xs"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt || `Foto ${idx + 1}`}
                        width={96}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((current) =>
                            current.filter((_, photoIndex) => photoIndex !== idx),
                          )
                        }
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white text-[10px] hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((current) =>
                            current.map((item, photoIndex) => ({
                              ...item,
                              isCover: photoIndex === idx,
                            })),
                          )
                        }
                        className={`absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          photo.isCover
                            ? "bg-[var(--gold)] text-[var(--plum)]"
                            : "bg-black/60 text-white hover:bg-black/90"
                        }`}
                      >
                        {photo.isCover ? "Capa ✓" : "Definir Capa"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Linha de Envio e Cancelamento */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="interactive inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-extrabold text-[var(--plum)] hover:bg-[var(--gold-light)] disabled:cursor-wait disabled:opacity-70 shadow-md"
                disabled={submitting}
                type="submit"
              >
                {submitting ? (
                  <LoaderCircle className="animate-spin" size={17} />
                ) : isEditing ? (
                  <Pencil size={17} />
                ) : (
                  <Plus size={17} />
                )}
                {submitting
                  ? "Salvando…"
                  : isEditing
                    ? "Salvar Alterações"
                    : "Cadastrar Imóvel"}
              </button>

              {isEditing && (
                <button
                  className="interactive inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white/80 hover:border-white hover:text-white"
                  onClick={cancelEdit}
                  type="button"
                >
                  <X size={15} /> Cancelar
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="mt-4 rounded-xl bg-white/15 p-3 text-xs font-semibold text-white" role="status">
              {message}
            </p>
          )}
        </section>
      </section>

      {/* ── Dialog de Exclusão Permanente ─────────────── */}
      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-3xl p-0 shadow-2xl backdrop:bg-black/50"
        onCancel={() => setDeleteTarget(null)}
      >
        <div className="p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 aria-hidden="true" className="text-red-600" size={22} />
          </div>
          <h2 className="text-xl font-extrabold text-[var(--plum)]">
            Excluir imóvel permanentemente?
          </h2>
          {deleteTarget && (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">
              Você está prestes a excluir{" "}
              <strong className="text-[var(--ink)]">
                {deleteTarget.code} — {deleteTarget.title}
              </strong>
              . Esta ação removerá o registro e todas as fotos associadas.
            </p>
          )}
          <div className="mt-6 flex flex-wrap-reverse gap-3">
            <button
              className="interactive flex-1 rounded-full border px-5 py-3 text-sm font-bold text-[var(--plum)] hover:border-[var(--plum)]"
              onClick={() => setDeleteTarget(null)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="interactive flex-1 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
              disabled={deleting}
              onClick={confirmDelete}
              type="button"
            >
              {deleting ? "Excluindo…" : "Sim, excluir"}
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
