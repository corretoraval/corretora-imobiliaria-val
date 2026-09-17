"use client";

import { CheckCircle2, Loader2, MessageSquare, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

interface PropertyLeadFormProps {
  propertyCode: string;
  propertyTitle: string;
  propertyAddress?: string | null;
  propertyType?: string | null;
  whatsappNumber?: string | null;
}

export function PropertyLeadForm({
  propertyCode,
  propertyTitle,
  propertyAddress,
  propertyType,
  whatsappNumber = "5547974007301",
}: PropertyLeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    `Olá! Tenho interesse no imóvel ${propertyCode} (${propertyTitle}) e gostaria de mais informações ou agendar uma visita.`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Link direto do WhatsApp
  const cleanPhone = (whatsappNumber || "5547974007301").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${propertyCode} - ${propertyTitle}. Poderia me passar mais detalhes?`,
  )}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          type: "CONTATO",
          subject: `Interesse no imóvel ${propertyCode} - ${propertyTitle}`,
          message,
          propertyAddress: propertyAddress || null,
          propertyType: propertyType || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Não foi possível enviar sua mensagem.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--border,#e8e3d9)] bg-[var(--surface,#ffffff)] p-6 shadow-[0_12px_32px_rgba(53,16,79,0.08)] sm:p-7">
      <div className="text-center">
        <span className="eyebrow text-[var(--gold)]">
          Atendimento Exclusivo
        </span>
        <h3 className="display mt-1 text-2xl text-[var(--plum)]">
          Gostou deste imóvel?
        </h3>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">
          Fale diretamente com a Corretora Val e receba atendimento
          personalizado.
        </p>
      </div>

      {/* Botão de WhatsApp em Destaque */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="interactive mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-[#20bd5a] hover:shadow-lg transition-all"
      >
        <MessageSquare size={18} />
        <span>Falar no WhatsApp agora</span>
      </a>

      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border,#f0ede6)]" />
        </div>
        <span className="relative bg-[var(--surface,#ffffff)] px-3 text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wider">
          Ou envie uma mensagem
        </span>
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
          <CheckCircle2 className="mx-auto text-emerald-600 mb-2" size={32} />
          <h4 className="font-bold text-emerald-900 text-sm">
            Mensagem enviada com sucesso!
          </h4>
          <p className="mt-1 text-xs text-emerald-700">
            A Corretora Val entrará em contato com você o mais breve possível.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="lead-name"
              className="block text-xs font-bold text-[var(--plum)] mb-1"
            >
              Seu nome completo *
            </label>
            <input
              id="lead-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full rounded-xl border border-[var(--border,#e0ded8)] bg-[var(--surface-muted,#faf8f5)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="lead-email"
              className="block text-xs font-bold text-[var(--plum)] mb-1"
            >
              E-mail *
            </label>
            <input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl border border-[var(--border,#e0ded8)] bg-[var(--surface-muted,#faf8f5)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="lead-phone"
              className="block text-xs font-bold text-[var(--plum)] mb-1"
            >
              WhatsApp / Telefone *
            </label>
            <input
              id="lead-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(47) 99999-9999"
              className="w-full rounded-xl border border-[var(--border,#e0ded8)] bg-[var(--surface-muted,#faf8f5)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="lead-message"
              className="block text-xs font-bold text-[var(--plum)] mb-1"
            >
              Mensagem
            </label>
            <textarea
              id="lead-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-xl border border-[var(--border,#e0ded8)] bg-[var(--surface-muted,#faf8f5)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--plum)] focus:bg-white focus:outline-hidden transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="interactive flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--plum)] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[var(--plum-bright)] hover:shadow-lg transition-all disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Send size={16} />
            )}
            <span>{submitting ? "Enviando..." : "Enviar Mensagem"}</span>
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[10px] text-[var(--ink-soft)]">
        🔒 Seus dados estão seguros e não serão compartilhados com terceiros.
      </p>
    </div>
  );
}
