"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  LoaderCircle,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type EmailStatus = "pending" | "sent" | "failed" | "no_config" | "legacy" | "spam";
type LeadStatus = "NOVO" | "EM_ATENDIMENTO" | "CONCLUIDO" | "ARQUIVADO";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  subject: string | null;
  message: string | null;
  propertyAddress: string | null;
  propertyType: string | null;
  status: LeadStatus;
  emailStatus: EmailStatus;
  emailError: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

type ApiResponse = {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
};

// ── Labels e badges ────────────────────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  CONTATO: "Contato",
  ANUNCIAR: "Anunciar",
  ALUGAR: "Alugar",
  COMPRAR: "Comprar",
};

const STATUS_LABEL: Record<LeadStatus, { label: string; color: string }> = {
  NOVO: { label: "Novo", color: "bg-blue-100 text-blue-800" },
  EM_ATENDIMENTO: { label: "Em atendimento", color: "bg-yellow-100 text-yellow-800" },
  CONCLUIDO: { label: "Concluído", color: "bg-emerald-100 text-emerald-800" },
  ARQUIVADO: { label: "Arquivado", color: "bg-gray-100 text-gray-600" },
};

const EMAIL_BADGE: Record<EmailStatus, { icon: React.ReactNode; label: string; color: string }> = {
  sent: {
    icon: <CheckCircle2 size={12} />,
    label: "E-mail enviado",
    color: "bg-emerald-100 text-emerald-700",
  },
  failed: {
    icon: <XCircle size={12} />,
    label: "Falha no e-mail",
    color: "bg-red-100 text-red-700",
  },
  no_config: {
    icon: <AlertTriangle size={12} />,
    label: "Sem e-mail config.",
    color: "bg-orange-100 text-orange-700",
  },
  pending: {
    icon: <Clock size={12} />,
    label: "Pendente",
    color: "bg-gray-100 text-gray-600",
  },
  legacy: {
    icon: <Inbox size={12} />,
    label: "Anterior ao sistema",
    color: "bg-gray-100 text-gray-500",
  },
  spam: {
    icon: <XCircle size={12} />,
    label: "Spam (bloqueado)",
    color: "bg-purple-100 text-purple-700",
  },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function MensagensPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [filterEmail, setFilterEmail] = useState<EmailStatus | "">("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterStatus) params.set("status", filterStatus);
      if (filterEmail) params.set("email", filterEmail);
      if (unreadOnly) params.set("unread", "true");
      const res = await fetch(`/api/admin/mensagens?${params.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterEmail, unreadOnly]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  async function markRead(id: string, isRead: boolean) {
    setSaving(id);
    await fetch(`/api/admin/mensagens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
    setSaving(null);
    void loadLeads();
  }

  async function updateStatus(id: string, status: LeadStatus) {
    setSaving(id);
    await fetch(`/api/admin/mensagens/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(null);
    void loadLeads();
  }

  return (
    <main className="p-6 sm:p-10">
      {/* Cabeçalho */}
      <p className="eyebrow">Admin</p>
      <h1 className="display mt-3 text-4xl text-[var(--plum)] sm:text-5xl">
        Mensagens
      </h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        Todas as mensagens recebidas pelo site.
        {data && ` (${data.total} no total)`}
      </p>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--ink-soft)]" />
          <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wide">
            Filtros
          </span>
        </div>

        <select
          id="filter-status"
          className="rounded-lg border bg-white px-3 py-1.5 text-sm text-[var(--ink)]"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as LeadStatus | "");
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          <option value="NOVO">Novo</option>
          <option value="EM_ATENDIMENTO">Em atendimento</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="ARQUIVADO">Arquivado</option>
        </select>

        <select
          id="filter-email"
          className="rounded-lg border bg-white px-3 py-1.5 text-sm text-[var(--ink)]"
          value={filterEmail}
          onChange={(e) => {
            setFilterEmail(e.target.value as EmailStatus | "");
            setPage(1);
          }}
        >
          <option value="">Todos (e-mail)</option>
          <option value="sent">E-mail enviado</option>
          <option value="failed">Falha no e-mail</option>
          <option value="no_config">Sem config. de e-mail</option>
          <option value="spam">Spam (bloqueado)</option>
          <option value="legacy">Anterior ao sistema</option>
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)]">
          <input
            id="filter-unread"
            type="checkbox"
            className="rounded"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
          />
          Não lidas
        </label>

        <button
          id="btn-refresh-messages"
          type="button"
          onClick={() => void loadLeads()}
          className="interactive ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--plum)]"
        >
          <RefreshCw size={14} /> Atualizar
        </button>
      </div>

      {/* Lista */}
      <div className="mt-6 grid gap-3">
        {loading && (
          <div className="flex items-center gap-2 py-16 text-sm text-[var(--ink-soft)]">
            <LoaderCircle size={18} className="animate-spin" /> Carregando…
          </div>
        )}

        {!loading && data?.leads.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
            <MessageSquare size={32} className="text-[var(--ink-soft)]/40" />
            <p className="text-sm font-bold text-[var(--ink-soft)]">
              Nenhuma mensagem encontrada
            </p>
            <p className="text-xs text-[var(--ink-soft)]/60">
              Ajuste os filtros ou aguarde novos contatos.
            </p>
          </div>
        )}

        {!loading &&
          data?.leads.map((lead) => {
            const isExpanded = expandedId === lead.id;
            const isSaving = saving === lead.id;
            const emailBadge = EMAIL_BADGE[lead.emailStatus] ?? EMAIL_BADGE.pending;
            const statusBadge = STATUS_LABEL[lead.status] ?? STATUS_LABEL.NOVO;

            return (
              <article
                key={lead.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${
                  lead.isRead ? "opacity-80" : "border-[var(--plum)]/20 shadow-[0_0_0_2px_rgba(53,16,79,0.07)]"
                }`}
              >
                {/* Linha resumo */}
                <button
                  id={`msg-${lead.id}`}
                  type="button"
                  className="interactive w-full p-4 text-left sm:p-5"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : lead.id);
                    if (!lead.isRead) void markRead(lead.id, true);
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {lead.isRead ? (
                        <MailOpen size={18} className="shrink-0 text-[var(--ink-soft)]/50" />
                      ) : (
                        <Mail size={18} className="shrink-0 text-[var(--plum)]" />
                      )}
                      <div>
                        <p className={`text-sm font-bold ${lead.isRead ? "text-[var(--ink-soft)]" : "text-[var(--plum)]"}`}>
                          {lead.name}
                        </p>
                        <p className="text-xs text-[var(--ink-soft)]">
                          {lead.email} · {lead.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${emailBadge.color}`}>
                        {emailBadge.icon}
                        {emailBadge.label}
                      </span>
                      <span className="text-[10px] text-[var(--ink-soft)]">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>
                  </div>
                  {lead.subject && (
                    <p className="mt-2 text-xs font-semibold text-[var(--ink)]">
                      {lead.subject}
                    </p>
                  )}
                  {lead.message && !isExpanded && (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-soft)]">
                      {lead.message}
                    </p>
                  )}
                </button>

                {/* Conteúdo expandido */}
                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4">
                    {lead.message && (
                      <div className="mb-4 rounded-xl bg-[var(--surface-muted)] p-3">
                        <p className="text-xs font-bold text-[var(--ink-soft)] uppercase mb-1">
                          Mensagem
                        </p>
                        <p className="text-sm text-[var(--ink)] whitespace-pre-wrap">
                          {lead.message}
                        </p>
                      </div>
                    )}
                    <dl className="grid gap-1.5 sm:grid-cols-2 text-xs">
                      {lead.propertyAddress && (
                        <>
                          <dt className="font-bold text-[var(--ink-soft)]">Imóvel</dt>
                          <dd className="text-[var(--ink)]">{lead.propertyAddress}</dd>
                        </>
                      )}
                      {lead.propertyType && (
                        <>
                          <dt className="font-bold text-[var(--ink-soft)]">Tipo</dt>
                          <dd className="text-[var(--ink)]">{lead.propertyType}</dd>
                        </>
                      )}
                      <dt className="font-bold text-[var(--ink-soft)]">Categoria</dt>
                      <dd className="text-[var(--ink)]">{TYPE_LABEL[lead.type] ?? lead.type}</dd>
                      {lead.emailError && (
                        <>
                          <dt className="font-bold text-red-600">Erro de e-mail</dt>
                          <dd className="text-red-700 col-span-1">{lead.emailError}</dd>
                        </>
                      )}
                    </dl>

                    {/* Ações */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${lead.email}`}
                        id={`reply-${lead.id}`}
                        className="interactive inline-flex items-center gap-1.5 rounded-full bg-[var(--plum)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--plum)]/80"
                      >
                        <Mail size={13} /> Responder
                      </a>
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`whatsapp-${lead.id}`}
                        className="interactive inline-flex items-center gap-1.5 rounded-full border border-emerald-600 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                      >
                        <Phone size={13} /> WhatsApp
                      </a>

                      {/* Status dropdown */}
                      <select
                        id={`status-${lead.id}`}
                        className="rounded-full border px-3 py-1.5 text-xs font-bold text-[var(--ink)] ml-auto"
                        value={lead.status}
                        disabled={isSaving}
                        onChange={(e) =>
                          void updateStatus(lead.id, e.target.value as LeadStatus)
                        }
                      >
                        <option value="NOVO">Novo</option>
                        <option value="EM_ATENDIMENTO">Em atendimento</option>
                        <option value="CONCLUIDO">Concluído</option>
                        <option value="ARQUIVADO">Arquivar</option>
                      </select>

                      <button
                        id={`read-toggle-${lead.id}`}
                        type="button"
                        disabled={isSaving}
                        onClick={() => void markRead(lead.id, !lead.isRead)}
                        className="interactive inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--plum)]"
                      >
                        {isSaving ? (
                          <LoaderCircle size={13} className="animate-spin" />
                        ) : lead.isRead ? (
                          <Mail size={13} />
                        ) : (
                          <MailOpen size={13} />
                        )}
                        {lead.isRead ? "Marcar não lida" : "Marcar lida"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
      </div>

      {/* Paginação */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            id="btn-prev-page"
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="interactive rounded-full border px-4 py-2 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-[var(--ink-soft)]">
            {page} / {data.totalPages}
          </span>
          <button
            id="btn-next-page"
            type="button"
            disabled={page === data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="interactive rounded-full border px-4 py-2 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </main>
  );
}
