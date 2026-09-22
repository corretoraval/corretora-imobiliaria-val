"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function ChangePasswordForm({
  email,
  destination,
}: {
  email: string;
  destination: string;
}) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const response = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "changeOwnPassword",
          currentPassword,
          newPassword,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(body?.error)
          ? body.error[0]?.message
          : body?.error;
        throw new Error(message || "Não foi possível alterar a senha.");
      }

      router.replace(destination);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-12">
      <form
        className="w-full max-w-md space-y-5 rounded-3xl border bg-white p-8 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="eyebrow">Primeiro acesso</p>
          <h1 className="display mt-3 text-4xl text-[var(--plum)]">
            Crie uma nova senha
          </h1>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">
            A senha temporária da conta {email} precisa ser substituída antes de
            acessar o painel.
          </p>
        </div>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
          Senha atual
          <input
            autoComplete="current-password"
            className="rounded-xl border px-3.5 py-2.5 text-sm"
            minLength={8}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
            value={currentPassword}
          />
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
          Nova senha
          <input
            autoComplete="new-password"
            className="rounded-xl border px-3.5 py-2.5 text-sm"
            minLength={8}
            onChange={(event) => setNewPassword(event.target.value)}
            pattern="^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$"
            required
            type="password"
            value={newPassword}
          />
          <span className="normal-case tracking-normal text-[var(--ink-soft)]">
            Mínimo de 8 caracteres, com pelo menos uma letra e um número.
          </span>
        </label>

        {error && (
          <p
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          className="w-full rounded-full bg-[var(--plum)] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </main>
  );
}
