"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: string; // text, email, tel, textarea, select
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

interface ContactFormProps {
  contactEmail?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  initialFields?: FormField[];
  initialTexts?: FormTexts;
}

export function ContactForm({
  contactEmail: initialContactEmail,
  whatsapp = "5547974007391",
  phone = "(47) 97400-7391",
  initialFields,
  initialTexts,
}: ContactFormProps) {
  const [fields, setFields] = useState<FormField[]>(initialFields ?? []);
  const [texts, setTexts] = useState<FormTexts>(
    initialTexts ?? {
      formTitle: "Envie uma Mensagem",
      formSubtitle:
        "Preencha o formulário abaixo e eu entrarei em contato diretamente com a orientação certa para o que você precisa.",
      formButtonText: "Enviar Mensagem",
      formSuccessMessage:
        "Obrigada pelo contato! Retornarei sua mensagem o mais breve possível.",
    },
  );
  const [isConfigured, setIsConfigured] = useState<boolean>(
    initialContactEmail !== undefined ? Boolean(initialContactEmail) : true,
  );
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(
    !initialFields && initialContactEmail === undefined,
  );

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Se não recebemos fields ou contactEmail via props, busca na API pública
  useEffect(() => {
    if (initialFields && initialContactEmail !== undefined) return;

    let isMounted = true;
    async function loadFormSchema() {
      try {
        const res = await fetch("/api/formulario-contato");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (data.fields) setFields(data.fields);
          if (data.texts) setTexts(data.texts);
          if (data.isConfigured !== undefined) setIsConfigured(data.isConfigured);
        }
      } catch {
        // Fallback silencioso
      } finally {
        if (isMounted) setIsLoadingSchema(false);
      }
    }
    loadFormSchema();
    return () => {
      isMounted = false;
    };
  }, [initialFields, initialContactEmail]);

  const cleanWhatsapp = (whatsapp || "5547974007391").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    "Olá, Val! Gostaria de falar com você sobre um atendimento imobiliário.",
  )}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setSavedNotice(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: Record<string, string> = {
      type: "CONTATO",
      source: "contato-page",
    };

    for (const [key, value] of formData.entries()) {
      payload[key] = String(value);
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        error?: string;
        savedOnly?: boolean;
        message?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem.");
      }

      if (data.savedOnly && data.message) {
        setSavedNotice(data.message);
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

  // Se o e-mail de recebimento não está configurado:
  // Mostra o WhatsApp como alternativa honesta e não finge que o formulário está operacional
  if (!isConfigured && !isLoadingSchema) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 md:p-12 shadow-sm text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm mb-4">
          <MessageCircle size={28} />
        </div>
        <h3 className="display text-2xl font-bold text-[var(--plum)] mb-2">
          Atendimento Direto pelo WhatsApp
        </h3>
        <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto mb-6">
          O formulário por e-mail está temporariamente em configuração. Para
          falar diretamente com a Corretora Val e obter resposta imediata, envie
          uma mensagem agora:
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="interactive inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-xs font-extrabold tracking-[0.1em] text-white uppercase shadow-md hover:bg-emerald-700 transition-all mb-4"
        >
          <MessageCircle size={18} /> Conversar no WhatsApp
        </a>

        {phone && (
          <div className="text-xs text-[var(--ink-soft)]">
            Ou ligue para:{" "}
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="font-bold text-[var(--plum)] hover:underline"
            >
              <Phone size={12} className="inline mr-1" />
              {phone}
            </a>
          </div>
        )}
      </div>
    );
  }

  // Lista de campos a renderizar (fallback caso fields esteja vazio)
  const renderedFields: FormField[] =
    fields.length > 0
      ? fields
      : [
          {
            id: "1",
            name: "name",
            label: "Nome completo",
            type: "text",
            required: true,
            placeholder: "Seu nome",
            order: 0,
            isActive: true,
          },
          {
            id: "2",
            name: "email",
            label: "E-mail",
            type: "email",
            required: true,
            placeholder: "seu@email.com",
            order: 1,
            isActive: true,
          },
          {
            id: "3",
            name: "phone",
            label: "Telefone / WhatsApp",
            type: "tel",
            required: true,
            placeholder: "(47) 99999-9999",
            order: 2,
            isActive: true,
          },
          {
            id: "4",
            name: "subject",
            label: "Assunto",
            type: "text",
            required: false,
            placeholder: "Sobre o que gostaria de conversar?",
            order: 3,
            isActive: true,
          },
          {
            id: "5",
            name: "message",
            label: "Mensagem",
            type: "textarea",
            required: false,
            placeholder: "Como podemos te ajudar?",
            order: 4,
            isActive: true,
          },
        ];

  return (
    <div className="rounded-3xl border bg-white p-8 md:p-12 shadow-sm">
      <h3 className="display text-2xl font-bold text-[var(--plum)] mb-2">
        {texts.formTitle}
      </h3>
      {texts.formSubtitle && (
        <p className="text-sm text-[var(--ink-soft)] mb-6">
          {texts.formSubtitle}
        </p>
      )}

      {status === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center animate-fade-in">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white mb-3 shadow-xs">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-emerald-950 mb-1">
            Recebemos sua mensagem!
          </h3>
          <p className="text-sm text-emerald-800 leading-relaxed max-w-md mx-auto mb-6">
            {savedNotice || texts.formSuccessMessage}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-xs font-extrabold tracking-wider text-white uppercase shadow-md hover:bg-emerald-700 transition-all"
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>

            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setSavedNotice(null);
              }}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 px-3 py-2"
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {renderedFields.map((field) => {
            const inputId = `contact-field-${field.name}`;

            if (field.type === "textarea") {
              return (
                <div key={field.name}>
                  <label
                    htmlFor={inputId}
                    className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
                  >
                    {field.label} {field.required && "*"}
                  </label>
                  <textarea
                    id={inputId}
                    name={field.name}
                    rows={4}
                    required={field.required}
                    placeholder={field.placeholder ?? undefined}
                    className="w-full rounded-xl border bg-[var(--surface)] p-4 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
                  />
                </div>
              );
            }

            if (field.type === "select") {
              const optionsList = (field.options || "")
                .split(/[,;\n]/)
                .map((o) => o.trim())
                .filter(Boolean);

              return (
                <div key={field.name}>
                  <label
                    htmlFor={inputId}
                    className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
                  >
                    {field.label} {field.required && "*"}
                  </label>
                  <select
                    id={inputId}
                    name={field.name}
                    required={field.required}
                    className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
                  >
                    <option value="">
                      {field.placeholder || "Selecione uma opção"}
                    </option>
                    {optionsList.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={field.name}>
                <label
                  htmlFor={inputId}
                  className="block text-xs font-bold text-[var(--ink)] uppercase mb-1.5"
                >
                  {field.label} {field.required && "*"}
                </label>
                <input
                  id={inputId}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder ?? undefined}
                  className="w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-hidden"
                />
              </div>
            );
          })}

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
                <Send size={16} /> {texts.formButtonText}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
