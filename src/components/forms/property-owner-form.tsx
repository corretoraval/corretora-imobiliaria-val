"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";

export function PropertyOwnerForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      propertyAddress: formData.get("propertyAddress") as string,
      propertyType: formData.get("propertyType") as string,
      message: formData.get("message") as string,
      type: "ANUNCIAR",
      contact_security_token: (formData.get("contact_security_token") as string) || undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar formulário.");
      }

      setStatus("success");
      form.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao enviar. Tente novamente.";
      setStatus("error");
      setErrorMessage(message);
    }
  };

  return (
    <div className="rounded-3xl border bg-white p-8 md:p-12 shadow-sm">
      <h3 className="display text-2xl md:text-3xl font-bold text-[var(--plum)] mb-2">
        Quero administrar meu imóvel
      </h3>
      <p className="text-sm text-[var(--ink-soft)] mb-8">
        Preencha os dados do seu imóvel e entraremos em contato para uma
        avaliação sem compromisso.
      </p>

      {status === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
          <div className="flex items-center gap-3 mb-2 font-bold text-lg">
            <CheckCircle2 size={22} className="text-emerald-600" />
            Solicitação Enviada com Sucesso!
          </div>
          <p className="text-sm text-emerald-700">
            Recebemos as informações do seu imóvel. Entrarei em contato em breve
            pelo telefone/WhatsApp informado para avaliarmos juntos o seu
            patrimônio.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
          >
            Enviar outra solicitação
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot invisível contra bots */}
          <input
            type="text"
            name="contact_security_token"
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            style={{ display: "none" }}
          />

          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="owner-name"
                className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
              >
                Nome completo *
              </label>
              <input
                id="owner-name"
                name="name"
                type="text"
                required
                placeholder="Seu nome"
                className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="owner-phone"
                className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
              >
                Telefone / WhatsApp *
              </label>
              <input
                id="owner-phone"
                name="phone"
                type="tel"
                required
                placeholder="(47) 99999-9999"
                className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="owner-email"
              className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
            >
              E-mail *
            </label>
            <input
              id="owner-email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="owner-type"
                className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
              >
                Tipo do Imóvel
              </label>
              <select
                id="owner-type"
                name="propertyType"
                className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Terreno / Lote">Terreno / Lote</option>
                <option value="Comercial">Comercial</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="owner-address"
                className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
              >
                Bairro / Cidade do Imóvel
              </label>
              <input
                id="owner-address"
                name="propertyAddress"
                type="text"
                placeholder="Ex: Centro, Balneário Camboriú"
                className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="owner-message"
              className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
            >
              Observações ou Detalhes do Imóvel
            </label>
            <textarea
              id="owner-message"
              name="message"
              rows={3}
              placeholder="Dormitórios, vagas, estado de conservação ou preferências..."
              className="w-full rounded-xl border bg-[var(--surface)] p-4 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="interactive flex w-full items-center justify-center gap-2 rounded-full bg-[var(--plum)] py-4 text-xs font-extrabold tracking-[0.1em] text-white uppercase shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-50 transition-all"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Send size={16} /> Solicitar Avaliação de Administração
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
