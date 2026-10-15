"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit2,
  Eye,
  LoaderCircle,
  Lock,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { AdminModal } from "@/components/admin/admin-modal";

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required: boolean;
  placeholder?: string | null;
  options?: string | null;
  order: number;
  isActive: boolean;
  isProtected?: boolean;
};

export type FormTexts = {
  formTitle: string;
  formSubtitle?: string | null;
  formButtonText: string;
  formSuccessMessage: string;
};

export function ContactFormConfigManager() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [texts, setTexts] = useState<FormTexts>({
    formTitle: "Envie uma Mensagem",
    formSubtitle:
      "Preencha o formulário abaixo e eu entrarei em contato diretamente com a orientação certa para o que você precisa.",
    formButtonText: "Enviar Mensagem",
    formSuccessMessage:
      "Obrigada pelo contato! Retornarei sua mensagem o mais breve possível.",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal de edição / criação de campo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    label: string;
    type: "text" | "email" | "tel" | "textarea" | "select";
    required: boolean;
    placeholder: string;
    options: string;
    isActive: boolean;
    isProtected: boolean;
  }>({
    name: "",
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: "",
    isActive: true,
    isProtected: false,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/formulario-contato");
      if (!res.ok) throw new Error("Erro ao carregar dados do formulário.");
      const data = await res.json();
      if (data.fields) setFields(data.fields);
      if (data.texts) setTexts(data.texts);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreateModal = () => {
    setEditingField(null);
    setFormData({
      name: "",
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      options: "",
      isActive: true,
      isProtected: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (field: FormField) => {
    setEditingField(field);
    setFormData({
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder ?? "",
      options: field.options ?? "",
      isActive: field.isActive,
      isProtected: Boolean(field.isProtected),
    });
    setIsModalOpen(true);
  };

  const handleModalSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) return;

    const normalizedName = formData.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    if (editingField) {
      // Edição
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingField.id
            ? {
                ...f,
                label: formData.label.trim(),
                type: formData.type,
                required:
                  formData.isProtected && f.name === "name"
                    ? true
                    : formData.required,
                placeholder: formData.placeholder.trim() || null,
                options: formData.options.trim() || null,
                isActive:
                  formData.isProtected && f.name === "name"
                    ? true
                    : formData.isActive,
              }
            : f,
        ),
      );
    } else {
      // Novo campo
      const newField: FormField = {
        id: `temp_${Date.now()}`,
        name: normalizedName,
        label: formData.label.trim(),
        type: formData.type,
        required: formData.required,
        placeholder: formData.placeholder.trim() || null,
        options: formData.options.trim() || null,
        order: fields.length,
        isActive: formData.isActive,
        isProtected: false,
      };
      setFields((prev) => [...prev, newField]);
    }

    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const updated = [...fields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFields(updated);
  };

  const handleDeleteField = async (field: FormField) => {
    if (
      field.isProtected ||
      field.name === "name" ||
      field.name === "email" ||
      field.name === "phone"
    ) {
      alert("Campos protegidos não podem ser excluídos.");
      return;
    }

    if (!confirm(`Deseja realmente excluir o campo "${field.label}"?`)) return;

    if (!field.id.startsWith("temp_")) {
      try {
        const res = await fetch(
          `/api/admin/formulario-contato?id=${field.id}`,
          {
            method: "DELETE",
          },
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erro ao excluir.");
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir.");
        return;
      }
    }

    setFields((prev) => prev.filter((f) => f.id !== field.id));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);
    setErrorMsg(null);

    // Validações locais
    const nameField = fields.find((f) => f.name === "name");
    if (!nameField?.isActive || !nameField.required) {
      setErrorMsg(
        "O campo 'Nome completo' é obrigatório e deve permanecer ativo.",
      );
      setSaving(false);
      return;
    }

    const emailField = fields.find((f) => f.name === "email");
    const phoneField = fields.find((f) => f.name === "phone");
    const hasContact =
      (emailField?.isActive && emailField?.required) ||
      (phoneField?.isActive && phoneField?.required);

    if (!hasContact) {
      setErrorMsg(
        "Ao menos um meio de retorno ('E-mail' ou 'Telefone / WhatsApp') deve permanecer ativo e obrigatório.",
      );
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/formulario-contato", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts,
          fields: fields.map((f, idx) => ({ ...f, order: idx })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar alterações.");
      }

      setMessage("Configurações do formulário de contato salvas com sucesso!");
      loadData();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-[var(--ink-soft)]">
        <LoaderCircle size={18} className="animate-spin text-[var(--gold)]" />
        Carregando configuração do formulário...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid principal: 7 colunas Configuração / 5 colunas Pré-visualização */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Painel de Edição */}
        <div className="space-y-8 lg:col-span-7">
          {/* 1. Textos do Formulário */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[var(--plum)] flex items-center gap-2">
              Textos do Formulário
            </h2>
            <p className="text-xs text-[var(--ink-soft)]">
              Personalize o título, instruções e mensagens exibidas aos clientes
              no site.
            </p>

            <div className="grid gap-4">
              <label className="block text-xs font-bold text-[var(--ink)] uppercase">
                Título do Formulário *
                <input
                  type="text"
                  value={texts.formTitle}
                  onChange={(e) =>
                    setTexts({ ...texts, formTitle: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                />
              </label>

              <label className="block text-xs font-bold text-[var(--ink)] uppercase">
                Subtítulo / Instrução
                <textarea
                  rows={2}
                  value={texts.formSubtitle ?? ""}
                  onChange={(e) =>
                    setTexts({ ...texts, formSubtitle: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[var(--ink)] uppercase">
                  Texto do Botão *
                  <input
                    type="text"
                    value={texts.formButtonText}
                    onChange={(e) =>
                      setTexts({ ...texts, formButtonText: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                  />
                </label>

                <label className="block text-xs font-bold text-[var(--ink)] uppercase">
                  Mensagem de Sucesso *
                  <input
                    type="text"
                    value={texts.formSuccessMessage}
                    onChange={(e) =>
                      setTexts({ ...texts, formSuccessMessage: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-[var(--border,#d4cec4)] px-3.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 2. Gerenciador de Campos */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[var(--plum)]">
                  Campos do Formulário
                </h2>
                <p className="text-xs text-[var(--ink-soft)]">
                  Adicione, edite ou altere a ordem dos campos apresentados.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="interactive inline-flex items-center gap-1.5 rounded-xl bg-[var(--plum)] px-3.5 py-2 text-xs font-bold text-white hover:bg-[var(--plum-bright)] shadow-xs transition-colors"
              >
                <Plus size={15} />
                Novo Campo
              </button>
            </div>

            {/* Lista com reordenação */}
            <div className="divide-y rounded-xl border">
              {fields.map((field, idx) => {
                const isFieldProtected =
                  field.isProtected ||
                  field.name === "name" ||
                  field.name === "email" ||
                  field.name === "phone";

                return (
                  <div
                    key={field.name}
                    className={`flex items-center justify-between p-3.5 transition-colors ${
                      !field.isActive ? "bg-stone-50 opacity-60" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Botões de reordenação */}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          aria-label="Subir campo"
                          className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-20"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          aria-label="Descer campo"
                          className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 disabled:opacity-20"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-[var(--ink)]">
                            {field.label}
                          </strong>
                          <span className="text-[11px] font-mono text-stone-400">
                            ({field.name})
                          </span>

                          {field.required && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                              Obrigatório
                            </span>
                          )}

                          {isFieldProtected && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              <Lock size={10} /> Protegido
                            </span>
                          )}

                          {!field.isActive && (
                            <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                          Tipo:{" "}
                          <span className="font-semibold">{field.type}</span>
                          {field.placeholder && (
                            <span> · Placeholder: "{field.placeholder}"</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(field)}
                        className="interactive rounded-lg border p-1.5 text-stone-600 hover:border-[var(--plum)] hover:text-[var(--plum)]"
                        title="Editar campo"
                      >
                        <Edit2 size={14} />
                      </button>

                      {!isFieldProtected && (
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field)}
                          className="interactive rounded-lg border p-1.5 text-red-500 hover:border-red-600 hover:bg-red-50"
                          title="Excluir campo"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botão Salvar Todas as Alterações */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAll}
              className="interactive inline-flex items-center gap-2 rounded-xl bg-[var(--plum)] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />{" "}
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} /> Salvar Formulário de Contato
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Pré-visualização em Tempo Real (Painel Lateral) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-2xl border bg-stone-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--plum)] uppercase tracking-wider">
              <Eye size={15} className="text-[var(--gold)]" />
              Pré-visualização ao vivo
            </div>

            {/* Simulação exata do card público */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="display text-xl font-bold text-[var(--plum)]">
                {texts.formTitle || "Envie uma Mensagem"}
              </h3>
              {texts.formSubtitle && (
                <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                  {texts.formSubtitle}
                </p>
              )}

              <div className="space-y-3 pt-2">
                {fields
                  .filter((f) => f.isActive)
                  .map((field) => (
                    <div
                      key={field.name}
                      className="block text-[11px] font-bold text-[var(--ink)] uppercase"
                    >
                      <span>{field.label} {field.required && "*"}</span>
                      {field.type === "textarea" ? (
                        <textarea
                          disabled
                          rows={3}
                          placeholder={field.placeholder ?? undefined}
                          className="mt-1 block w-full rounded-lg border bg-stone-50 p-2.5 text-xs text-stone-500 cursor-not-allowed"
                        />
                      ) : field.type === "select" ? (
                        <select
                          disabled
                          className="mt-1 block w-full rounded-lg border bg-stone-50 px-3 py-2 text-xs text-stone-500 cursor-not-allowed"
                        >
                          <option>
                            {field.placeholder || "Selecione uma opção"}
                          </option>
                          {(field.options || "")
                            .split(/[,;\n]/)
                            .map((o) => o.trim())
                            .filter(Boolean)
                            .map((opt) => (
                              <option key={opt}>{opt}</option>
                            ))}
                        </select>
                      ) : (
                        <input
                          disabled
                          type={field.type}
                          placeholder={field.placeholder ?? undefined}
                          className="mt-1 block w-full rounded-lg border bg-stone-50 px-3 py-2 text-xs text-stone-500 cursor-not-allowed"
                        />
                      )}
                    </div>
                  ))}

                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-[var(--plum)] py-3 text-xs font-bold uppercase tracking-wider text-white opacity-85 shadow-sm mt-3 flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  {texts.formButtonText || "Enviar Mensagem"}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-stone-400">
              Esta é uma representação em tempo real do formulário na página de
              contato.
            </p>
          </div>
        </div>
      </div>

      {/* Modal AdminModal para Criar ou Editar Campo */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingField
            ? `Editar Campo: ${editingField.label}`
            : "Novo Campo de Formulário"
        }
        description="Defina as propriedades, regras e comportamento deste campo."
      >
        <form onSubmit={handleModalSave} className="space-y-4">
          <label className="block text-xs font-bold text-[var(--ink)] uppercase">
            Rótulo de Exibição *
            <input
              type="text"
              required
              value={formData.label}
              placeholder="Ex: Cidade de Preferência"
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="mt-1 block w-full rounded-xl border px-3.5 py-2.5 text-sm"
            />
          </label>

          <label className="block text-xs font-bold text-[var(--ink)] uppercase">
            Identificador Técnico *
            <input
              type="text"
              required
              disabled={Boolean(editingField)}
              value={formData.name}
              placeholder="Ex: cidade_preferencia"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono disabled:bg-stone-100 disabled:text-stone-500"
            />
            {editingField && (
              <span className="block mt-1 text-[11px] font-normal text-stone-400 lowercase">
                O identificador técnico não pode ser alterado após criação.
              </span>
            )}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold text-[var(--ink)] uppercase">
              Tipo de Entrada *
              <select
                value={formData.type}
                disabled={formData.isProtected}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as FormField["type"],
                  })
                }
                className="mt-1 block w-full rounded-xl border px-3.5 py-2.5 text-sm disabled:bg-stone-100"
              >
                <option value="text">Texto simples (text)</option>
                <option value="email">E-mail (email)</option>
                <option value="tel">Telefone (tel)</option>
                <option value="textarea">Área de texto grande (textarea)</option>
                <option value="select">Seleção de opções (select)</option>
              </select>
            </label>

            <label className="block text-xs font-bold text-[var(--ink)] uppercase">
              Texto de Exemplo (Placeholder)
              <input
                type="text"
                value={formData.placeholder}
                placeholder="Ex: Digite aqui..."
                onChange={(e) =>
                  setFormData({ ...formData, placeholder: e.target.value })
                }
                className="mt-1 block w-full rounded-xl border px-3.5 py-2.5 text-sm"
              />
            </label>
          </div>

          {formData.type === "select" && (
            <label className="block text-xs font-bold text-[var(--ink)] uppercase">
              Opções da Seleção (separadas por vírgula)
              <input
                type="text"
                value={formData.options}
                placeholder="Opção 1, Opção 2, Opção 3"
                onChange={(e) =>
                  setFormData({ ...formData, options: e.target.value })
                }
                className="mt-1 block w-full rounded-xl border px-3.5 py-2.5 text-sm"
              />
            </label>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.required}
                disabled={formData.isProtected && formData.name === "name"}
                onChange={(e) =>
                  setFormData({ ...formData, required: e.target.checked })
                }
                className="size-4 rounded border-stone-300 text-[var(--plum)]"
              />
              Campo Obrigatório
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                disabled={formData.isProtected && formData.name === "name"}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="size-4 rounded border-stone-300 text-[var(--plum)]"
              />
              Campo Ativo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--plum)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--plum-bright)]"
            >
              Salvar Campo
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
