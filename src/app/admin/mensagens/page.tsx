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
  Trash2,
  X,
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
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [filterEmail, setFilterEmail] = useState<EmailStatus | "">("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLeads = useCallback(
    async (isBackground = false) => {
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
        setSelectedIds(new Set());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, filterStatus, filterEmail, unreadOnly],
  );

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  // ── Atualização suave de leitura (sem piscar nem desmontar lista) ───────────
  async function markRead(id: string, isRead: boolean) {
    // Atualização otimista imediata no estado local
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === id ? { ...l, isRead, readAt: isRead ? new Date().toISOString() : null } : l,
        ),
      };
    });

    try {
      await fetch(`/api/admin/mensagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });
    } catch (err) {
      console.error("Erro ao marcar mensagem como lida:", err);
      // Reverte em caso de erro de rede
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          leads: prev.leads.map((l) => (l.id === id ? { ...l, isRead: !isRead } : l)),
        };
      });
    }
  }

  // ── Atualização suave de status (sem piscar nem desmontar lista) ────────────
  async function updateStatus(id: string, status: LeadStatus) {
    setSaving(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leads: prev.leads.map((l) => (l.id === id ? { ...l, status } : l)),
      };
    });

    try {
      const res = await fetch(`/api/admin/mensagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status.");
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setFeedback({ type: "error", text: "Não foi possível atualizar o status da mensagem." });
      void loadLeads(true);
    } finally {
      setSaving(null);
    }
  }

  // ── Exclusão individual com confirmação ──────────────────────────────────────
  async function deleteLead(id: string) {
    if (isDeleting) return;

    const leadToDelete = data?.leads.find((l) => l.id === id);
    const confirmMessage = leadToDelete
      ? `Deseja realmente excluir a mensagem de "${leadToDelete.name}"? Esta ação removerá a mensagem do painel.`
      : "Deseja realmente excluir esta mensagem do painel?";

    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/mensagens/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erro ao excluir mensagem.");
      }

      // Atualiza a lista no estado sem recarregar a página inteira
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          leads: prev.leads.filter((l) => l.id !== id),
          total: Math.max(0, prev.total - 1),
        };
      });

      // Se a mensagem excluída estiver aberta, fecha os detalhes
      if (expandedId === id) {
        setExpandedId(null);
      }

      // Remove da seleção se estava selecionada
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setFeedback({ type: "success", text: "Mensagem excluída com sucesso." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir mensagem.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Exclusão em massa com confirmação ────────────────────────────────────────
  async function deleteSelected() {
    if (isDeleting || selectedIds.size === 0) return;

    const count = selectedIds.size;
    const confirmMessage = `Tem certeza que deseja excluir ${count} ${
      count === 1 ? "mensagem selecionada" : "mensagens selecionadas"
    }? Esta ação removerá as mensagens do painel.`;

    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    setFeedback(null);

    const idsToDelete = Array.from(selectedIds);

    try {
      const res = await fetch("/api/admin/mensagens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Erro ao excluir mensagens selecionadas.");
      }

      // Atualiza a lista no estado removendo os itens excluídos
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          leads: prev.leads.filter((l) => !selectedIds.has(l.id)),
          total: Math.max(0, prev.total - idsToDelete.length),
        };
      });

      // Se a mensagem aberta estava entre as excluídas, fecha
      if (expandedId && selectedIds.has(expandedId)) {
        setExpandedId(null);
      }

      // Limpa seleções
      setSelectedIds(new Set());
      setFeedback({
        type: "success",
        text: `${count} ${count === 1 ? "mensagem excluída" : "mensagens excluídas"} com sucesso.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir mensagens selecionadas.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Helpers de seleção ───────────────────────────────────────────────────────
  const currentLeads = data?.leads ?? [];
  const allCurrentSelected =
    currentLeads.length > 0 && currentLeads.every((lead) => selectedIds.has(lead.id));

  function toggleSelectAll() {
    if (allCurrentSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const lead of currentLeads) {
          next.delete(lead.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const lead of currentLeads) {
          next.add(lead.id);
        }
        return next;
      });
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

      {/* Banner de feedback / alerta */}
      {feedback && (
        <div
          className={`mt-4 flex items-center justify-between rounded-xl p-3.5 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

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
          onClick={() => void loadLeads(true)}
          disabled={refreshing}
          className="interactive ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-[var(--ink-soft)] hover:text-[var(--plum)] disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-[var(--plum)]" : ""} />
          Atualizar
        </button>
      </div>

      {/* Barra de ações em massa e seleção */}
      {currentLeads.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2.5 text-xs text-[var(--ink-soft)] shadow-xs">
          <label className="flex cursor-pointer items-center gap-2 font-bold text-[var(--ink)] select-none">
            <input
              type="checkbox"
              id="select-all-messages"
              className="size-4 rounded border-gray-300 text-[var(--plum)] focus:ring-[var(--plum)] cursor-pointer"
              checked={allCurrentSelected}
              onChange={toggleSelectAll}
            />
            <span>Selecionar todas as {currentLeads.length} da página</span>
          </label>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--plum)]/10 px-2.5 py-0.5 font-bold text-[var(--plum)]">
                {selectedIds.size} selecionada{selectedIds.size > 1 ? "s" : ""}
              </span>

              <button
                type="button"
                id="btn-delete-selected"
                disabled={isDeleting}
                onClick={() => void deleteSelected()}
                className="interactive flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                Excluir selecionadas
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="hover:underline text-[var(--ink-soft)] px-1"
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de Mensagens */}
      <div className="mt-4 grid gap-3">
        {loading && !data && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--ink-soft)]">
            <LoaderCircle size={18} className="animate-spin text-[var(--plum)]" /> Carregando mensagens…
          </div>
        )}

        {!loading && currentLeads.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center bg-white">
            <MessageSquare size={32} className="text-[var(--ink-soft)]/40" />
            <p className="text-sm font-bold text-[var(--ink-soft)]">
              Nenhuma mensagem encontrada
            </p>
            <p className="text-xs text-[var(--ink-soft)]/60">
              Ajuste os filtros ou aguarde novos contatos.
            </p>
          </div>
        )}

        {currentLeads.map((lead) => {
          const isExpanded = expandedId === lead.id;
          const isSaving = saving === lead.id;
          const isLeadSelected = selectedIds.has(lead.id);
          const emailBadge = EMAIL_BADGE[lead.emailStatus] ?? EMAIL_BADGE.pending;
          const statusBadge = STATUS_LABEL[lead.status] ?? STATUS_LABEL.NOVO;

          return (
            <article
              key={lead.id}
              className={`rounded-2xl border bg-white shadow-xs transition-all ${
                isLeadSelected
                  ? "border-[var(--plum)] ring-1 ring-[var(--plum)] bg-purple-50/20"
                  : lead.isRead
                    ? "opacity-90 border-[var(--border,#e8e3d9)]"
                    : "border-[var(--plum)]/30 shadow-[0_2px_8px_rgba(53,16,79,0.06)]"
              }`}
            >
              {/* Linha resumo com checkbox e trigger suave */}
              <div className="flex items-start gap-2 p-3 sm:p-4">
                {/* Checkbox de seleção em massa */}
                <div className="pt-1 pl-1">
                  <input
                    type="checkbox"
                    id={`check-lead-${lead.id}`}
                    aria-label={`Selecionar mensagem de ${lead.name}`}
                    checked={isLeadSelected}
                    onChange={() => toggleSelectOne(lead.id)}
                    className="size-4 rounded border-gray-300 text-[var(--plum)] focus:ring-[var(--plum)] cursor-pointer"
                  />
                </div>

                {/* Botão de expansão (área clicável da linha) */}
                <button
                  id={`msg-${lead.id}`}
                  type="button"
                  className="interactive flex-1 text-left min-w-0"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : lead.id);
                    if (!lead.isRead) void markRead(lead.id, true);
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {lead.isRead ? (
                        <MailOpen size={18} className="shrink-0 text-[var(--ink-soft)]/50" />
                      ) : (
                        <Mail size={18} className="shrink-0 text-[var(--plum)]" />
                      )}
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${lead.isRead ? "text-[var(--ink-soft)]" : "text-[var(--plum)]"}`}>
                          {lead.name}
                        </p>
                        <p className="text-xs text-[var(--ink-soft)] truncate">
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

                {/* Ação rápida de exclusão individual na linha */}
                <button
                  type="button"
                  id={`btn-delete-${lead.id}`}
                  title="Excluir esta mensagem"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteLead(lead.id);
                  }}
                  className="interactive p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors shrink-0 ml-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Conteúdo expandido */}
              {isExpanded && (
                <div className="border-t px-5 pb-5 pt-4 bg-[var(--surface-muted,#faf8f5)]/40 rounded-b-2xl">
                  {lead.message && (
                    <div className="mb-4 rounded-xl bg-white border p-3.5 shadow-2xs">
                      <p className="text-xs font-bold text-[var(--ink-soft)] uppercase mb-1">
                        Mensagem
                      </p>
                      <p className="text-sm text-[var(--ink)] whitespace-pre-wrap leading-relaxed">
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

                  {/* Barra de ações do detalhe */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
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
                      className="rounded-full border bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] ml-auto"
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

                    {/* Alternar Leitura */}
                    <button
                      id={`read-toggle-${lead.id}`}
                      type="button"
                      disabled={isSaving}
                      onClick={() => void markRead(lead.id, !lead.isRead)}
                      className="interactive inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--plum)]"
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

                    {/* Botão de Excluir Mensagem nos detalhes */}
                    <button
                      type="button"
                      id={`btn-detail-delete-${lead.id}`}
                      disabled={isDeleting}
                      onClick={() => void deleteLead(lead.id)}
                      className="interactive inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 size={13} /> Excluir
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
            className="interactive rounded-full border bg-white px-4 py-2 text-sm disabled:opacity-40"
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
            className="interactive rounded-full border bg-white px-4 py-2 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </main>
  );
}
