"use client";

import { KeyRound, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { AdminModal } from "@/components/admin/admin-modal";

type User = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  createdAt: string;
};

export function UsersManager({
  currentUserEmail,
}: {
  currentUserEmail?: string;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", { cache: "no-store" });
      if (!res.ok) throw new Error("Não foi possível carregar usuários");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Modal de Usuário (Criação e Edição)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    email: string;
    name?: string | null;
    role: string;
  }>({ email: "", name: "", role: "admin" });

  const [createForm, setCreateForm] = useState<{
    email: string;
    name: string;
    password: string;
    role: string;
  }>({ email: "", name: "", password: "", role: "admin" });

  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  function openCreateModal() {
    setEditTarget(null);
    setCreateForm({ email: "", name: "", password: "", role: "admin" });
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEdit(user: User) {
    setModalError(null);
    setEditForm({ email: user.email, name: user.name ?? "", role: user.role });
    setEditTarget(user);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditTarget(null);
    setModalError(null);
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setModalError(null);
    setModalSubmitting(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Falha ao criar usuário");
      }
      setMessage("Usuário criado com sucesso.");
      closeModal();
      await load();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : String(err));
    } finally {
      setModalSubmitting(false);
    }
  }

  async function handleEditUser(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setModalError(null);
    setModalSubmitting(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "updateUser",
          id: editTarget.id,
          name: editForm.name,
          role: editForm.role,
          email: editForm.email,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Falha ao atualizar usuário");
      }
      setMessage("Usuário atualizado com sucesso.");
      closeModal();
      await load();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : String(err));
    } finally {
      setModalSubmitting(false);
    }
  }

  // Troca de senha da própria conta
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  async function resetPassword(userId: string) {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "resetPassword", id: userId }),
      });
      if (!res.ok) throw new Error("Falha ao resetar senha");
      const data = await res.json();
      alert(`Senha temporária gerada: ${data.tempPassword}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/usuarios?id=${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao excluir usuário");
      setMessage("Usuário excluído com sucesso.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <main className="p-6 sm:p-10">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Usuários</p>
          <h1 className="display mt-3 text-4xl text-[var(--plum)] sm:text-5xl">
            Gerenciamento de Usuários
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
            Crie, edite e gerencie logins de acesso e permissões ao painel
            administrativo.
          </p>
        </div>
        <button
          className="interactive inline-flex items-center justify-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)]"
          onClick={openCreateModal}
          type="button"
        >
          <Plus aria-hidden="true" size={18} /> Novo Usuário
        </button>
      </div>

      {message && (
        <div
          className="mt-6 rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-4 text-sm font-semibold text-[var(--plum)] shadow-xs"
          role="status"
        >
          {message}
        </div>
      )}

      {/* ── Tabela de Usuários em Largura Total ─────────── */}
      <section className="mt-8">
        <div className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface)] p-6 shadow-[0_8px_24px_rgba(53,16,79,0.06)] sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border,#f0ede6)] pb-4">
            <h2 className="display text-2xl text-[var(--plum)]">
              Operadores Cadastrados
            </h2>
            <span className="rounded-full bg-[var(--surface-muted,#f0ede6)] px-3 py-1 text-xs font-bold text-[var(--ink-soft)]">
              {users.length} {users.length === 1 ? "usuário" : "usuários"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--ink-soft)]">
              <LoaderCircle className="animate-spin" size={20} /> Carregando
              operadores…
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="text-sm text-[var(--ink-soft)]">
                Nenhum usuário cadastrado no momento.
              </p>
              <button
                className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-[var(--plum-bright)]"
                onClick={openCreateModal}
                type="button"
              >
                <Plus size={16} /> Cadastrar primeiro operador
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border,#f0ede6)] text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider">
                    <th className="pb-3 pr-4">Nome / E-mail</th>
                    <th className="pb-3 pr-4">Papel</th>
                    <th className="pb-3 pr-4">Data de Cadastro</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border,#f0ede6)]">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[var(--surface-muted,#faf8f5)]/50 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="font-bold text-[var(--ink)]">
                          {u.name || "Sem nome cadastrado"}
                        </div>
                        <div className="text-xs text-[var(--ink-soft)]">
                          {u.email}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            u.role === "admin"
                              ? "bg-[var(--plum)]/10 text-[var(--plum)]"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-xs text-[var(--ink-soft)] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="interactive inline-flex items-center gap-1 rounded-full border border-[var(--border,#e8e3d9)] px-3 py-1.5 text-xs font-bold text-[var(--plum)] hover:bg-[var(--plum)] hover:text-white"
                            onClick={() => openEdit(u)}
                            title="Editar informações"
                          >
                            <Pencil size={13} /> Editar
                          </button>
                          <button
                            type="button"
                            className="interactive inline-flex items-center gap-1 rounded-full border border-[var(--border,#e8e3d9)] px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50"
                            onClick={() => resetPassword(u.id)}
                            title="Gerar senha temporária"
                          >
                            <KeyRound size={13} /> Resetar Senha
                          </button>
                          <button
                            type="button"
                            className="interactive inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => deleteUser(u.id)}
                            disabled={u.email === currentUserEmail}
                            title={
                              u.email === currentUserEmail
                                ? "Não é possível excluir a própria conta logada"
                                : "Excluir operador"
                            }
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Minha Conta (Troca de senha pessoal) ─────────── */}
      <section className="mt-8 rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface)] p-6 shadow-[0_8px_24px_rgba(53,16,79,0.06)] sm:p-8">
        <h2 className="display text-2xl text-[var(--plum)]">Minha Conta</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Gerencie a segurança da sua conta conectada atualmente (
          {currentUserEmail}).
        </p>

        <div className="mt-6">
          {!showPasswordForm ? (
            <button
              type="button"
              className="interactive inline-flex items-center gap-2 rounded-full border border-[var(--border,#e8e3d9)] px-5 py-2.5 text-xs font-bold text-[var(--plum)] hover:border-[var(--plum)]"
              onClick={() => setShowPasswordForm(true)}
            >
              <KeyRound size={14} /> Trocar minha senha de acesso
            </button>
          ) : (
            <div className="rounded-2xl border border-[var(--border,#e8e3d9)] bg-[var(--surface-muted,#faf8f5)] p-5 sm:max-w-md">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--gold)] mb-3">
                Atualizar Senha
              </h3>
              <ChangePasswordForm onDone={() => setShowPasswordForm(false)} />
              <div className="mt-3">
                <button
                  type="button"
                  className="interactive text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--plum)]"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancelar alteração
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Modal de Criação / Edição de Usuário ─────────── */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editTarget ? "Editar Usuário" : "Novo Usuário"}
        description={
          editTarget
            ? `Atualize os dados cadastrais e papel do usuário ${editTarget.email}.`
            : "Preencha as credenciais e papel de acesso para o novo operador."
        }
        size="lg"
      >
        {editTarget ? (
          /* Formulário de Edição */
          <form className="space-y-4" onSubmit={handleEditUser}>
            {modalError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                {modalError}
              </div>
            )}

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              E-mail *
              <input
                type="email"
                required
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Nome Completo
              <input
                type="text"
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                value={editForm.name ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Papel de Acesso *
              <select
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)] focus:border-[var(--plum)] focus:outline-hidden"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
              >
                <option value="admin">Administrador (acesso total)</option>
                <option value="user">Usuário padrão</option>
              </select>
            </label>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border,#f0ede6)]">
              <button
                type="button"
                onClick={closeModal}
                className="interactive rounded-full border border-gray-300 px-5 py-2.5 text-sm font-bold text-[var(--ink-soft)] hover:border-[var(--plum)] hover:text-[var(--plum)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={modalSubmitting}
                className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60"
              >
                {modalSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={16} />{" "}
                    Salvando…
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Formulário de Criação */
          <form className="space-y-4" onSubmit={handleCreateUser}>
            {modalError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                {modalError}
              </div>
            )}

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              E-mail de Acesso *
              <input
                type="email"
                required
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                placeholder="operador@corretoraval.com.br"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Nome Completo
              <input
                type="text"
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                placeholder="Ex: Ana Maria Silva"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Senha Inicial *
              <input
                type="password"
                required
                minLength={8}
                pattern="^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$"
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
                placeholder="Mínimo 6 caracteres"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Papel de Acesso *
              <select
                className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-bold text-[var(--plum)] focus:border-[var(--plum)] focus:outline-hidden"
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value })
                }
              >
                <option value="admin">Administrador (acesso total)</option>
                <option value="user">Usuário padrão</option>
              </select>
            </label>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border,#f0ede6)]">
              <button
                type="button"
                onClick={closeModal}
                className="interactive rounded-full border border-gray-300 px-5 py-2.5 text-sm font-bold text-[var(--ink-soft)] hover:border-[var(--plum)] hover:text-[var(--plum)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={modalSubmitting}
                className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60"
              >
                {modalSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" size={16} /> Criando…
                  </>
                ) : (
                  "Criar Operador"
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </main>
  );
}

function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const currentPassword = (fd.get("currentPassword") as string) || "";
    const newPassword = (fd.get("newPassword") as string) || "";
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "changeOwnPassword",
          currentPassword,
          newPassword,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || "Falha ao trocar senha");
      }
      setMessage("Senha alterada com sucesso.");
      form.reset();
      if (onDone) onDone();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
        Senha atual
        <input
          name="currentPassword"
          type="password"
          required
          className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
        />
      </label>
      <label className="grid gap-1 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
        Nova senha
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
        />
      </label>
      <div className="flex items-center gap-2 mt-1">
        <button
          className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-4 py-2 text-xs font-extrabold text-white hover:bg-[var(--plum-bright)]"
          type="submit"
          disabled={loading}
        >
          {loading ? "Salvando…" : "Confirmar troca"}
        </button>
      </div>
      {message && (
        <p className="mt-2 text-xs font-bold text-[var(--plum)]">{message}</p>
      )}
    </form>
  );
}
