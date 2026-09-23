"use client";

import {
  Archive,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminModal } from "@/components/admin/admin-modal";
import { toSlug } from "@/lib/identifiers";
import { formatPrice } from "@/lib/format-price";
import { type UploadProgress, uploadFile } from "@/lib/upload-file";

type Purpose = "VENDA" | "LOCACAO_ANUAL" | "TEMPORADA";

type Property = {
  id: string;
  code: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  propertyType: string;
  purpose: Purpose;
  status: string;
  city: string;
  neighborhood?: string | null;
  salePrice: number | null;
  monthlyRent: number | null;
  dailyRate: number | null;
  guestCapacity?: number | null;
  dailyRateConsultation?: boolean;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  availabilityNotes?: string | null;
  bedrooms?: number | null;
  suites?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  privateArea?: number | null;
  isFeatured: boolean;
  furnished?: boolean;
  hasAirConditioning?: boolean;
  hasBarbecue?: boolean;
  hasBalcony?: boolean;
  seaView?: boolean;
  oceanFront?: boolean;
  hasElevator?: boolean;
  allowsPets?: boolean;
  features?: string[] | null;
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
  furnished: boolean;
  hasAirConditioning: boolean;
  hasBarbecue: boolean;
  hasBalcony: boolean;
  seaView: boolean;
  oceanFront: boolean;
  hasElevator: boolean;
  allowsPets: boolean;
  customFeatures: string;
  guestCapacity: string;
  dailyRateConsultation: boolean;
  availabilityStart: string;
  availabilityEnd: string;
  availabilityNotes: string;
};

type PhotoEntry = {
  url: string;
  path?: string;
  alt?: string;
  position?: number;
  isCover?: boolean;
};

type PropertyPayload = {
  code?: string;
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
  guestCapacity?: number | null;
  dailyRateConsultation?: boolean;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  availabilityNotes?: string | null;
  bedrooms?: number | null;
  suites?: number | null;
  bathrooms?: number | null;
  parkingSpaces?: number | null;
  privateArea?: number | null;
  summary?: string | null;
  description?: string | null;
  furnished: boolean;
  hasAirConditioning: boolean;
  hasBarbecue: boolean;
  hasBalcony: boolean;
  seaView: boolean;
  oceanFront: boolean;
  hasElevator: boolean;
  allowsPets: boolean;
  features?: string[] | null;
  photos?: Array<{
    url: string;
    alt?: string | null;
    position?: number;
    isCover?: boolean;
  }>;
};

type PropertySort =
  | "code-asc"
  | "code-desc"
  | "name-asc"
  | "name-desc"
  | "createdAt-asc"
  | "createdAt-desc"
  | "updatedAt-asc"
  | "updatedAt-desc";

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
  furnished: false,
  hasAirConditioning: false,
  hasBarbecue: false,
  hasBalcony: false,
  seaView: false,
  oceanFront: false,
  hasElevator: false,
  allowsPets: false,
  customFeatures: "",
  guestCapacity: "",
  dailyRateConsultation: false,
  availabilityStart: "",
  availabilityEnd: "",
  availabilityNotes: "",
};

function formatCurrencyInput(value: number | string): string {
  if (value === "" || value === null || value === undefined) return "";
  const numeric =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/\D/g, ""));
  if (Number.isNaN(numeric) || numeric === 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function parseCurrencyInput(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

export function AdminPropertiesManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [userEditedSlug, setUserEditedSlug] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertySort, setPropertySort] = useState<PropertySort>("code-asc");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    code: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    currentFileName: string;
    percent: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  function openCreateModal() {
    setEditingId(null);
    setDraft(initialDraft);
    setPhotos([]);
    setUserEditedSlug(false);
    setShowMoreDetails(false);
    setUploadingPhotos(false);
    setUploadProgress(null);
    setUploadError(null);
    setMessage(null);
    setIsModalOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(initialDraft);
    setPhotos([]);
    setShowMoreDetails(false);
    setUploadingPhotos(false);
    setUploadProgress(null);
    setUploadError(null);
    setIsModalOpen(false);
  }

  async function loadPropertyForEdit(property: Property) {
    setMessage(null);
    try {
      const res = await fetch(`/api/imoveis?id=${property.id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Não foi possível carregar o imóvel.");
      const full = await res.json();
      const rawPrice =
        full.salePrice ?? full.monthlyRent ?? full.dailyRate ?? "";

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
        parkingSpaces:
          full.parkingSpaces != null ? String(full.parkingSpaces) : "",
        privateArea: full.privateArea != null ? String(full.privateArea) : "",
        summary: full.summary || "",
        description: full.description || "",
        furnished: Boolean(full.furnished),
        hasAirConditioning: Boolean(full.hasAirConditioning),
        hasBarbecue: Boolean(full.hasBarbecue),
        hasBalcony: Boolean(full.hasBalcony),
        seaView: Boolean(full.seaView),
        oceanFront: Boolean(full.oceanFront),
        hasElevator: Boolean(full.hasElevator),
        allowsPets: Boolean(full.allowsPets),
        customFeatures: Array.isArray(full.features)
          ? full.features.join(", ")
          : "",
        guestCapacity:
          full.guestCapacity != null ? String(full.guestCapacity) : "",
        dailyRateConsultation: Boolean(full.dailyRateConsultation),
        availabilityStart: full.availabilityStart
          ? String(full.availabilityStart).slice(0, 10)
          : "",
        availabilityEnd: full.availabilityEnd
          ? String(full.availabilityEnd).slice(0, 10)
          : "",
        availabilityNotes: full.availabilityNotes || "",
      });
      setUserEditedSlug(true);

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
          full.photos.map((photo: PhotoEntry) => ({
            url: photo.url,
            path: photo.path ?? undefined,
            alt: photo.alt ?? undefined,
            isCover: photo.isCover ?? false,
            position: photo.position ?? undefined,
          })),
        );
      }
      setUploadingPhotos(false);
      setUploadProgress(null);
      setUploadError(null);
      setEditingId(property.id);
      setIsModalOpen(true);
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
      code: draft.code.trim().toUpperCase() || undefined,
      slug: draft.slug || toSlug(draft.title),
      title: draft.title.trim(),
      propertyType: draft.propertyType.trim(),
      purpose: draft.purpose,
      city: draft.city.trim(),
      neighborhood: draft.neighborhood.trim() || null,
      isFeatured: draft.isFeatured,
      ...(draft.purpose === "VENDA" ? { salePrice: numericPrice } : {}),
      ...(draft.purpose === "LOCACAO_ANUAL"
        ? { monthlyRent: numericPrice }
        : {}),
      ...(draft.purpose === "TEMPORADA" ? { dailyRate: numericPrice } : {}),
      ...(draft.purpose === "TEMPORADA"
        ? {
            guestCapacity: draft.guestCapacity
              ? Number(draft.guestCapacity)
              : null,
            dailyRateConsultation: draft.dailyRateConsultation,
            availabilityStart: draft.availabilityStart
              ? new Date(`${draft.availabilityStart}T00:00:00`).toISOString()
              : null,
            availabilityEnd: draft.availabilityEnd
              ? new Date(`${draft.availabilityEnd}T00:00:00`).toISOString()
              : null,
            availabilityNotes: draft.availabilityNotes.trim() || null,
          }
        : {}),
      bedrooms: draft.bedrooms ? Number(draft.bedrooms) : null,
      suites: draft.suites ? Number(draft.suites) : null,
      bathrooms: draft.bathrooms ? Number(draft.bathrooms) : null,
      parkingSpaces: draft.parkingSpaces ? Number(draft.parkingSpaces) : null,
      privateArea: draft.privateArea ? Number(draft.privateArea) : null,
      summary: draft.summary.trim() || null,
      description: draft.description.trim() || null,
      furnished: draft.furnished,
      hasAirConditioning: draft.hasAirConditioning,
      hasBarbecue: draft.hasBarbecue,
      hasBalcony: draft.hasBalcony,
      seaView: draft.seaView,
      oceanFront: draft.oceanFront,
      hasElevator: draft.hasElevator,
      allowsPets: draft.allowsPets,
      features: draft.customFeatures
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
      photos: photos.map((p, i) => ({
        url: p.url,
        alt: p.alt ?? null,
        position: i,
        isCover: !!p.isCover,
      })),
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
      setIsModalOpen(false);
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
      code: draft.code.trim().toUpperCase() || undefined,
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
      guestCapacity:
        draft.purpose === "TEMPORADA" && draft.guestCapacity
          ? Number(draft.guestCapacity)
          : null,
      dailyRateConsultation:
        draft.purpose === "TEMPORADA" && draft.dailyRateConsultation,
      availabilityStart:
        draft.purpose === "TEMPORADA" && draft.availabilityStart
          ? new Date(`${draft.availabilityStart}T00:00:00`).toISOString()
          : null,
      availabilityEnd:
        draft.purpose === "TEMPORADA" && draft.availabilityEnd
          ? new Date(`${draft.availabilityEnd}T00:00:00`).toISOString()
          : null,
      availabilityNotes:
        draft.purpose === "TEMPORADA"
          ? draft.availabilityNotes.trim() || null
          : null,
      bedrooms: draft.bedrooms ? Number(draft.bedrooms) : null,
      suites: draft.suites ? Number(draft.suites) : null,
      bathrooms: draft.bathrooms ? Number(draft.bathrooms) : null,
      parkingSpaces: draft.parkingSpaces ? Number(draft.parkingSpaces) : null,
      privateArea: draft.privateArea ? Number(draft.privateArea) : null,
      summary: draft.summary.trim() || null,
      description: draft.description.trim() || null,
      furnished: draft.furnished,
      hasAirConditioning: draft.hasAirConditioning,
      hasBarbecue: draft.hasBarbecue,
      hasBalcony: draft.hasBalcony,
      seaView: draft.seaView,
      oceanFront: draft.oceanFront,
      hasElevator: draft.hasElevator,
      allowsPets: draft.allowsPets,
      features: draft.customFeatures
        .split(",")
        .map((feature) => feature.trim())
        .filter(Boolean),
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
      setIsModalOpen(false);
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
  const visibleProperties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
    const filtered = properties.filter((property) =>
      [property.title, property.code, property.city].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      ),
    );
    const [field, direction] = propertySort.split("-") as [
      "code" | "name" | "createdAt" | "updatedAt",
      "asc" | "desc",
    ];
    const multiplier = direction === "asc" ? 1 : -1;

    return filtered.toSorted((left, right) => {
      if (field === "code") {
        return (
          left.code.localeCompare(right.code, "pt-BR", {
            numeric: true,
          }) * multiplier
        );
      }
      if (field === "name") {
        return left.title.localeCompare(right.title, "pt-BR") * multiplier;
      }
      return (
        (new Date(left[field]).getTime() - new Date(right[field]).getTime()) *
        multiplier
      );
    });
  }, [properties, propertySort, searchTerm]);

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
            Cadastre novos imóveis, gerencie fotos, valores e mantenha seu
            catálogo atualizado.
          </p>
        </div>
        <div className="flex flex-row items-center gap-3 shrink-0">
          <button
            className="interactive inline-flex items-center justify-center gap-2 rounded-full border bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--plum)] hover:border-[var(--gold)] whitespace-nowrap"
            disabled={loading}
            onClick={loadProperties}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={16} /> Atualizar lista
          </button>
          <button
            className="interactive inline-flex items-center justify-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] whitespace-nowrap"
            onClick={openCreateModal}
            type="button"
          >
            <Plus aria-hidden="true" size={18} /> Adicionar Imóvel
          </button>
        </div>
      </div>

      {message && (
        <div
          className="mt-6 rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-sm font-semibold text-[var(--plum)] shadow-xs"
          role="status"
        >
          {message}
        </div>
      )}

      {/* ── Listagem em Largura Total ─────────── */}
      <section className="mt-8">
        <div className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-5 shadow-[0_8px_24px_rgba(53,16,79,0.06)] sm:p-7">
          <div className="flex flex-col gap-4 border-b border-[var(--border,#f0ede6)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="display text-3xl text-[var(--plum)]">
              Catálogo Ativo
            </h2>
            <span className="rounded-full bg-[var(--surface-muted,#f0ede6)] px-3 py-1 text-xs font-bold text-[var(--ink-soft)]">
              {visibleProperties.length} de {properties.length}{" "}
              {properties.length === 1 ? "imóvel" : "imóveis"}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Buscar imóvel</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por título, código ou cidade..."
                className="w-full rounded-xl border border-[var(--border,#d4cec4)] bg-[var(--surface-muted,#faf8f5)] px-4 py-2.5 text-sm focus:border-[var(--plum)] focus:outline-hidden"
              />
            </label>
            <label className="sm:w-72">
              <span className="sr-only">Ordenar imóveis</span>
              <select
                value={propertySort}
                onChange={(event) =>
                  setPropertySort(event.target.value as PropertySort)
                }
                className="w-full rounded-xl border border-[var(--border,#d4cec4)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
              >
                <option value="code-asc">Código: menor para maior</option>
                <option value="code-desc">Código: maior para menor</option>
                <option value="name-asc">Nome: A-Z</option>
                <option value="name-desc">Nome: Z-A</option>
                <option value="createdAt-desc">Cadastro: mais recentes</option>
                <option value="createdAt-asc">Cadastro: mais antigos</option>
                <option value="updatedAt-desc">
                  Modificação: mais recentes
                </option>
                <option value="updatedAt-asc">Modificação: mais antigas</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--ink-soft)]">
              <LoaderCircle className="animate-spin" size={20} /> Carregando
              imóveis…
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-sm text-[var(--ink-soft)]">
                Nenhum imóvel ativo cadastrado no catálogo.
              </p>
              <button
                className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[var(--plum-bright)]"
                onClick={openCreateModal}
                type="button"
              >
                <Plus size={16} /> Cadastrar primeiro imóvel
              </button>
            </div>
          ) : visibleProperties.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[var(--ink-soft)]">
                Nenhum imóvel corresponde à busca informada.
              </p>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-[var(--border,#f0ede6)]">
              {visibleProperties.map((property) => {
                const price =
                  property.salePrice ??
                  property.monthlyRent ??
                  property.dailyRate ??
                  null;

                return (
                  <li
                    className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center hover:bg-[var(--surface-muted,#faf8f5)]/50 rounded-2xl px-3 transition-colors"
                    key={property.id}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--plum)] bg-[var(--plum)]/10 px-2 py-0.5 rounded">
                          {property.code}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                          {property.purpose.replace("_", " ")}
                        </span>
                        {property.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <Sparkles size={10} /> Destaque
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-[var(--ink)] text-base truncate">
                        {property.title}
                      </h3>

                      <p className="text-xs text-[var(--ink-soft)] flex items-center gap-1.5 flex-wrap">
                        <MapPin
                          size={12}
                          className="text-[var(--gold)] shrink-0"
                        />
                        <span>{property.city}</span>
                        {property.neighborhood ? (
                          <span>· {property.neighborhood}</span>
                        ) : null}
                        {price != null ? (
                          <span className="font-bold text-[var(--plum)]">
                            · {formatPrice(price)}
                          </span>
                        ) : null}
                        {property.bedrooms ? (
                          <span>· {property.bedrooms} dorms</span>
                        ) : null}
                        {property.privateArea ? (
                          <span>· {property.privateArea} m²</span>
                        ) : null}
                      </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex shrink-0 flex-wrap gap-2 mt-2 sm:mt-0">
                      <button
                        className="interactive inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--plum)]/25 px-4 py-2 text-xs font-bold text-[var(--plum)] hover:border-[var(--plum)] hover:bg-[var(--plum)]/5 min-h-[36px]"
                        onClick={() => loadPropertyForEdit(property)}
                        type="button"
                      >
                        <Pencil aria-hidden="true" size={14} /> Editar
                      </button>

                      <button
                        className="interactive inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs font-bold text-[var(--ink-soft)] hover:border-amber-400 hover:text-amber-700 min-h-[36px]"
                        onClick={() => archiveProperty(property.id)}
                        type="button"
                      >
                        <Archive aria-hidden="true" size={14} /> Arquivar
                      </button>

                      <button
                        className="interactive inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:border-red-500 hover:bg-red-50 min-h-[36px]"
                        onClick={() =>
                          setDeleteTarget({
                            id: property.id,
                            code: property.code,
                            title: property.title,
                          })
                        }
                        type="button"
                      >
                        <Trash2 aria-hidden="true" size={14} /> Excluir
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Modal do Formulário de Imóvel ─────────────── */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={cancelEdit}
        title={
          isEditing ? `Editar Imóvel ${editingCode || ""}` : "Adicionar Imóvel"
        }
        description={
          isEditing
            ? "Atualize as informações, fotos, valores e características deste imóvel."
            : "Preencha os dados abaixo para cadastrar um novo imóvel no catálogo."
        }
        size="4xl"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Seção: Identificação Principal */}
          <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface-muted,#faf8f5)] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--gold)]">
              Informações Básicas
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Código do Imóvel (gerado automaticamente)
                <input
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)] placeholder:font-normal placeholder:text-gray-400 focus:border-[var(--plum)] focus:outline-hidden"
                  placeholder="Gerado ao salvar (VAL-001, VAL-002...)"
                  readOnly={!isEditing}
                  onChange={(e) =>
                    setDraft({ ...draft, code: e.target.value.toUpperCase() })
                  }
                  value={draft.code}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Título do Imóvel *
                <input
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] placeholder:font-normal placeholder:text-gray-400 focus:border-[var(--plum)] focus:outline-hidden"
                  minLength={3}
                  placeholder="Ex: Apartamento Vista Mar na Barra Sul"
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      title: e.target.value,
                      slug: userEditedSlug
                        ? draft.slug
                        : toSlug(e.target.value),
                    })
                  }
                  required
                  value={draft.title}
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              URL Amigável (Slug)
              <input
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-xs font-mono text-[var(--ink)] placeholder:text-gray-400 focus:border-[var(--plum)] focus:outline-hidden"
                placeholder="ex: apartamento-vista-mar-barra-sul"
                onChange={(e) => {
                  setUserEditedSlug(true);
                  setDraft({ ...draft, slug: toSlug(e.target.value) });
                }}
                value={draft.slug}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Finalidade *
                <select
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)] focus:border-[var(--plum)] focus:outline-hidden"
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      purpose: e.target.value as Purpose,
                    })
                  }
                  value={draft.purpose}
                >
                  <option value="VENDA">Venda</option>
                  <option value="LOCACAO_ANUAL">Locação Anual</option>
                  <option value="TEMPORADA">Temporada</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Tipo do Imóvel *
                <input
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                  placeholder="Ex: Apartamento, Casa, Cobertura"
                  onChange={(e) =>
                    setDraft({ ...draft, propertyType: e.target.value })
                  }
                  required
                  value={draft.propertyType}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                {draft.purpose === "VENDA"
                  ? "Preço de Venda *"
                  : draft.purpose === "LOCACAO_ANUAL"
                    ? "Aluguel Mensal *"
                    : "Valor da Diária *"}
                <input
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)] placeholder:font-normal placeholder:text-gray-400 focus:border-[var(--plum)] focus:outline-hidden"
                  placeholder="R$ 0"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setDraft({
                      ...draft,
                      price: digits ? formatCurrencyInput(digits) : "",
                    });
                  }}
                  required={
                    draft.purpose !== "TEMPORADA" ||
                    !draft.dailyRateConsultation
                  }
                  value={draft.price}
                />
              </label>
            </div>

            {draft.purpose === "TEMPORADA" && (
              <div className="grid gap-4 rounded-xl border border-[var(--border,#d4cec4)] bg-white p-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  <input
                    checked={draft.dailyRateConsultation}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--plum)]"
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        dailyRateConsultation: e.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                  Diária sob consulta
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Capacidade de hóspedes
                  <input
                    className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    min={1}
                    onChange={(e) =>
                      setDraft({ ...draft, guestCapacity: e.target.value })
                    }
                    type="number"
                    value={draft.guestCapacity}
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Disponível a partir de
                  <input
                    className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    onChange={(e) =>
                      setDraft({ ...draft, availabilityStart: e.target.value })
                    }
                    type="date"
                    value={draft.availabilityStart}
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Disponível até
                  <input
                    className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    min={draft.availabilityStart || undefined}
                    onChange={(e) =>
                      setDraft({ ...draft, availabilityEnd: e.target.value })
                    }
                    type="date"
                    value={draft.availabilityEnd}
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)] sm:col-span-2">
                  Observações de disponibilidade
                  <textarea
                    className="min-h-20 rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    onChange={(e) =>
                      setDraft({ ...draft, availabilityNotes: e.target.value })
                    }
                    value={draft.availabilityNotes}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Seção: Localização */}
          <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface-muted,#faf8f5)] p-5 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--gold)]">
              Localização
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Cidade *
                <input
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  required
                  value={draft.city}
                />
              </label>

              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Bairro
                <input
                  className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] placeholder:font-normal placeholder:text-gray-400 focus:border-[var(--plum)] focus:outline-hidden"
                  placeholder="Ex: Barra Sul, Centro, Pioneiros"
                  onChange={(e) =>
                    setDraft({ ...draft, neighborhood: e.target.value })
                  }
                  value={draft.neighborhood}
                />
              </label>
            </div>
          </div>

          {/* Seção: Características e Lazer (Collapsible) */}
          <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface-muted,#faf8f5)] p-5">
            <button
              className="flex w-full items-center justify-between text-left text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] hover:text-[var(--gold)] transition-colors"
              onClick={() => setShowMoreDetails((v) => !v)}
              type="button"
            >
              <span>Detalhes, Medidas e Descrição</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--ink-soft)]">
                {showMoreDetails ? "Recolher" : "Expandir campos"}
                {showMoreDetails ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </button>

            {showMoreDetails && (
              <div className="mt-4 space-y-4 pt-4 border-t border-[var(--border,#f0ede6)]">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Quartos
                    <input
                      className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                      min={0}
                      onChange={(e) =>
                        setDraft({ ...draft, bedrooms: e.target.value })
                      }
                      type="number"
                      value={draft.bedrooms}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Suítes
                    <input
                      className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                      min={0}
                      onChange={(e) =>
                        setDraft({ ...draft, suites: e.target.value })
                      }
                      type="number"
                      value={draft.suites}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Banheiros
                    <input
                      className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                      min={0}
                      onChange={(e) =>
                        setDraft({ ...draft, bathrooms: e.target.value })
                      }
                      type="number"
                      value={draft.bathrooms}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Vagas
                    <input
                      className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                      min={0}
                      onChange={(e) =>
                        setDraft({ ...draft, parkingSpaces: e.target.value })
                      }
                      type="number"
                      value={draft.parkingSpaces}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Área (m²)
                    <input
                      className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                      min={0}
                      onChange={(e) =>
                        setDraft({ ...draft, privateArea: e.target.value })
                      }
                      type="number"
                      value={draft.privateArea}
                    />
                  </label>
                </div>

                <div className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  <span>Diferenciais</span>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border,#d4cec4)] bg-white p-3 sm:grid-cols-4">
                    {(
                      [
                        ["furnished", "Mobiliado"],
                        ["hasAirConditioning", "Ar-condicionado"],
                        ["hasBarbecue", "Churrasqueira"],
                        ["hasBalcony", "Sacada"],
                        ["seaView", "Vista para o mar"],
                        ["oceanFront", "Frente-mar"],
                        ["hasElevator", "Elevador"],
                        ["allowsPets", "Aceita pet"],
                      ] as const
                    ).map(([field, label]) => (
                      <label
                        className="flex items-center gap-2 text-xs font-semibold normal-case tracking-normal text-[var(--ink)]"
                        key={field}
                      >
                        <input
                          checked={draft[field]}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--plum)]"
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              [field]: e.target.checked,
                            })
                          }
                          type="checkbox"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Outros diferenciais
                  <input
                    className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    placeholder="Ex.: home office, lavanderia (separe por vírgulas)"
                    onChange={(e) =>
                      setDraft({ ...draft, customFeatures: e.target.value })
                    }
                    value={draft.customFeatures}
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Resumo Curto
                  <input
                    className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    maxLength={200}
                    placeholder="Frase de destaque para cards e compartilhamento"
                    onChange={(e) =>
                      setDraft({ ...draft, summary: e.target.value })
                    }
                    value={draft.summary}
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Descrição Completa
                  <textarea
                    className="rounded-xl border border-[var(--border,#d4cec4)] bg-white p-3.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                    placeholder="Descreva os detalhes, mobília, posição solar, comodidades do edifício, etc."
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                    rows={4}
                    value={draft.description}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Destaque e Upload de Fotos */}
          <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface-muted,#faf8f5)] p-5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(e) =>
                  setDraft({ ...draft, isFeatured: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-[var(--plum)] focus:ring-[var(--plum)]"
              />
              <span className="text-sm font-bold text-[var(--plum)] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[var(--gold)]" />
                Marcar como Imóvel em Destaque na Página Inicial
              </span>
            </label>

            <div className="pt-3 border-t border-[var(--border,#f0ede6)]">
              <label
                htmlFor="property-photos-input"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-2 cursor-pointer"
              >
                Fotos do Imóvel
              </label>
              <input
                id="property-photos-input"
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingPhotos}
                className="block w-full text-xs text-[var(--ink-soft)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-extrabold file:bg-[var(--plum)] file:text-white hover:file:bg-[var(--plum-bright)] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  setUploadingPhotos(true);
                  setUploadError(null);

                  for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    setUploadProgress({
                      current: i + 1,
                      total: files.length,
                      currentFileName: file.name,
                      percent: 0,
                    });

                    try {
                      const uploaded = await uploadFile(file, {
                        onProgress: (p: UploadProgress) => {
                          setUploadProgress({
                            current: i + 1,
                            total: files.length,
                            currentFileName: file.name,
                            percent: p.percent,
                          });
                        },
                      });

                      if (uploaded.url) {
                        setPhotos((current) => [
                          ...current,
                          {
                            url: uploaded.url,
                            path: uploaded.path,
                            alt: draft.title || file.name,
                            position: current.length,
                            isCover: current.length === 0,
                          },
                        ]);
                      }
                    } catch (err) {
                      console.error("Upload error:", err);
                      const errMsg =
                        err instanceof Error
                          ? err.message
                          : "Erro ao enviar o arquivo.";
                      setUploadError(
                        `Erro ao enviar a foto "${file.name}": ${errMsg}. Tente novamente.`,
                      );
                    }
                  }

                  setUploadingPhotos(false);
                  setUploadProgress(null);
                  e.target.value = "";
                }}
              />

              {uploadError && (
                <div className="mt-3 flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <span>{uploadError}</span>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                    aria-label="Fechar alerta de erro de upload"
                  >
                    ✕
                  </button>
                </div>
              )}

              {uploadingPhotos && uploadProgress && (
                <div className="mt-3 rounded-xl border border-[var(--border,#d4cec4)] bg-white p-3 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--plum)]">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <LoaderCircle
                        size={14}
                        className="animate-spin text-[var(--gold)] shrink-0"
                      />
                      <span className="truncate">
                        Enviando foto {uploadProgress.current} de{" "}
                        {uploadProgress.total}:{" "}
                        <span className="font-normal text-[var(--ink-soft)]">
                          {uploadProgress.currentFileName}
                        </span>
                      </span>
                    </div>
                    <span className="font-bold text-[var(--gold)] ml-2 shrink-0">
                      {uploadProgress.percent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-sunken,#e8e3d9)]">
                    <div
                      className="h-full bg-[var(--plum)] transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.url}
                      className="relative group rounded-xl overflow-hidden border border-[var(--border,#d4cec4)] bg-white h-24"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt || `Foto ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          setPhotos((current) => {
                            if (idx === 0) return current;
                            const next = [...current];
                            [next[idx - 1], next[idx]] = [
                              next[idx],
                              next[idx - 1],
                            ];
                            return next.map((item, position) => ({
                              ...item,
                              position,
                            }));
                          })
                        }
                        className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white text-xs hover:bg-black/90 disabled:opacity-30"
                        title="Mover para a esquerda"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === photos.length - 1}
                        onClick={() =>
                          setPhotos((current) => {
                            if (idx === current.length - 1) return current;
                            const next = [...current];
                            [next[idx], next[idx + 1]] = [
                              next[idx + 1],
                              next[idx],
                            ];
                            return next.map((item, position) => ({
                              ...item,
                              position,
                            }));
                          })
                        }
                        className="absolute left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white text-xs hover:bg-black/90 disabled:opacity-30"
                        title="Mover para a direita"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((current) =>
                            current.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white text-xs hover:bg-red-600 transition-colors"
                        title="Remover foto"
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
                        className={`absolute bottom-1 left-1 rounded px-2 py-0.5 text-[10px] font-bold ${
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
          </div>

          {/* Ações do Formulário */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border,#f0ede6)]">
            <button
              type="button"
              onClick={cancelEdit}
              className="interactive rounded-full border border-gray-300 px-5 py-2.5 text-sm font-bold text-[var(--ink-soft)] hover:border-[var(--plum)] hover:text-[var(--plum)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingPhotos}
              className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} /> Salvando…
                </>
              ) : uploadingPhotos ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} /> Enviando
                  fotos…
                </>
              ) : isEditing ? (
                <>
                  <Pencil size={16} /> Salvar Alterações
                </>
              ) : (
                <>
                  <Plus size={16} /> Cadastrar Imóvel
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

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
