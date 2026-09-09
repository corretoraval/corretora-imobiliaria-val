"use client";

import { useCallback, useEffect, useState } from "react";

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

  // Edit modal state
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    email: string;
    name?: string | null;
    role: string;
  }>({ email: "", name: "", role: "admin" });
  const [_editError, setEditError] = useState<string | null>(null);

  function openEdit(user: User) {
    setEditError(null);
    setEditForm({ email: user.email, name: user.name ?? "", role: user.role });
    setEditTarget(user);
  }

  function closeEdit() {
    setEditTarget(null);
    setEditError(null);
  }

  async function _submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditError(null);
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
      await load();
      closeEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : String(err));
    }
  }

  // password change toggle state
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const email = (fd.get("email") as string) || "";
    const name = (fd.get("name") as string) || undefined;
    const password = (fd.get("password") as string) || "";
    const role = (fd.get("role") as string) || "admin";
    setMessage(null);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role }),
      });
      if (!res.ok) throw new Error("Falha ao criar usuário");
      setMessage("Usuário criado com sucesso");
      form.reset();
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    }
  }

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
      alert(`Senha temporária: ${data.tempPassword}`);
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
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <main className="p-6 sm:p-10">
      <p className="eyebrow">Usuários</p>
      <h1 className="display mt-3 text-4xl text-[var(--plum)] sm:text-5xl">
        Gerenciamento de Usuários
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        Crie, edite e remova logins de acesso ao painel administrativo.
      </p>

      <section className="mt-9 grid gap-7 lg:grid-cols-2">
        <div className="rounded-2xl border bg-[var(--surface)] p-5 shadow sm:p-7">
          <h2 className="text-lg font-bold text-[var(--plum)]">Novo usuário</h2>
          <form className="mt-4 grid gap-3" onSubmit={createUser}>
            <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
              E-mail
              <input
                name="email"
                type="email"
                required
                className="rounded-lg border bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
              Nome
              <input
                name="name"
                type="text"
                className="rounded-lg border bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
              Senha
              <input
                name="password"
                type="password"
                required
                className="rounded-lg border bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
              Papel
              <select
                name="role"
                defaultValue="admin"
                className="rounded-lg border bg-white px-3 py-2"
              >
                <option value="admin">admin</option>
                <option value="user">user</option>
              </select>
            </label>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-4 py-2 text-sm font-extrabold text-white"
              type="submit"
            >
              Criar
            </button>
          </form>
        </div>

        <div className="rounded-2xl border bg-[var(--surface)] p-5 shadow sm:p-7">
          <h2 className="text-lg font-bold text-[var(--plum)]">
            Lista de usuários
          </h2>
          {loading ? (
            <p className="mt-4">Carregando…</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[600px] w-full text-sm">
                <thead className="text-left text-[var(--ink-soft)]">
                  <tr>
                    <th className="pb-3 pr-4">E-mail</th>
                    <th className="pb-3 pr-4">Nome</th>
                    <th className="pb-3 pr-4">Papel</th>
                    <th className="pb-3 pr-4">Criado</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">{u.name ?? "—"}</td>
                      <td className="py-3 pr-4">{u.role}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="text-xs font-semibold text-[var(--plum)] hover:underline"
                            onClick={() => resetPassword(u.id)}
                          >
                            Resetar
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-[var(--plum)] hover:underline"
                            onClick={() => openEdit(u)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                            onClick={() => deleteUser(u.id)}
                            disabled={u.email === currentUserEmail}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {message && (
            <p className="mt-4 text-sm text-[var(--plum)]">{message}</p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-[var(--surface)] p-5 shadow sm:p-7">
        <h2 className="text-lg font-bold text-[var(--plum)]">Minha conta</h2>
        <div>
          {!showPasswordForm ? (
            <button
              type="button"
              className="text-sm font-bold text-[var(--plum)]"
              onClick={() => setShowPasswordForm(true)}
            >
              Trocar senha
            </button>
          ) : (
            <div className="mt-4 md:w-1/2">
              <ChangePasswordForm onDone={() => setShowPasswordForm(false)} />
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs text-[var(--ink-soft)]"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
      setMessage("Senha alterada com sucesso");
      form.reset();
      if (onDone) onDone();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-4 grid gap-3 md:w-1/2" onSubmit={handleSubmit}>
      <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
        Senha atual
        <input
          name="currentPassword"
          type="password"
          required
          className="rounded-lg border bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm font-bold text-[var(--plum)]">
        Nova senha
        <input
          name="newPassword"
          type="password"
          required
          className="rounded-lg border bg-white px-3 py-2"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-extrabold text-[var(--plum)]"
          type="submit"
          disabled={loading}
        >
          Confirmar
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-[var(--plum)]">{message}</p>}
    </form>
  );
}
