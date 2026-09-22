import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { getSiteSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contato | Corretora Val",
  description:
    "Fale com a Corretora Val por WhatsApp, telefone ou formulário. Atendimento especializado para compra, venda e administração de imóveis em Balneário Camboriú.",
};

export default async function ContatoPage() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp
    ? `https://wa.me/${settings.whatsapp}`
    : "#";

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="Canais Diretos"
        title="Vamos conversar?"
        subtitle="Encontre a orientação certa para o seu imóvel com quem conhece Balneário Camboriú e Camboriú em cada detalhe."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-extrabold tracking-[0.14em] text-[var(--gold)] uppercase block mb-2">
                  Atendimento Humano & Direto
                </span>
                <h2 className="display text-3xl md:text-4xl text-[var(--plum)] leading-tight">
                  Estou à disposição para te ouvir.
                </h2>
                <p className="mt-4 text-sm text-[var(--ink-soft)] leading-relaxed">
                  Seja para colocar seu imóvel para administrar, comprar um novo
                  apartamento ou tirar dúvidas sobre a nossa região, conte com
                  meu atendimento direto, acolhedor e transparente.
                </p>
                <p className="mt-2 text-xs font-bold text-[var(--plum)]">
                  — Valdete Gonçalves de Melo · CRECI/SC 56372-F
                </p>
              </div>

              {/* Channels Grid */}
              <div className="space-y-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="interactive flex items-center gap-4 rounded-2xl border p-5 bg-[var(--surface)] hover:border-[var(--gold-light)] hover:bg-white transition-all group"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-soft)] uppercase block">
                      WhatsApp
                    </span>
                    <strong className="text-base text-[var(--plum)] font-bold">
                      {settings.phone || "(47) 97400-7391"}
                    </strong>
                  </div>
                </a>

                <a
                  href={`tel:${settings.phone?.replace(/\D/g, "")}`}
                  className="interactive flex items-center gap-4 rounded-2xl border p-5 bg-[var(--surface)] hover:border-[var(--gold-light)] hover:bg-white transition-all group"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--plum)] text-white shadow-xs group-hover:scale-105 transition-transform">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-soft)] uppercase block">
                      Telefone Comercial
                    </span>
                    <strong className="text-base text-[var(--plum)] font-bold">
                      {settings.phone || "(47) 97400-7391"}
                    </strong>
                  </div>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="interactive flex items-center gap-4 rounded-2xl border p-5 bg-[var(--surface)] hover:border-[var(--gold-light)] hover:bg-white transition-all group"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-soft)] uppercase block">
                      E-mail
                    </span>
                    <strong className="text-base text-[var(--plum)] font-bold">
                      {settings.email || "contato@corretoraval.com.br"}
                    </strong>
                  </div>
                </a>

                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="interactive flex items-center gap-4 rounded-2xl border p-5 bg-[var(--surface)] hover:border-[var(--gold-light)] hover:bg-white transition-all group"
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-pink-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Share2 size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--ink-soft)] uppercase block">
                        Instagram
                      </span>
                      <strong className="text-base text-[var(--plum)] font-bold">
                        @corretoraval
                      </strong>
                    </div>
                  </a>
                )}
              </div>

              {/* Hours & Location Box */}
              <div className="rounded-2xl border bg-[var(--surface-muted)] p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--plum)] uppercase">
                  <MapPin size={16} className="text-[var(--gold)]" />{" "}
                  Localização
                </div>
                <p className="text-xs text-[var(--ink-soft)]">
                  {settings.address}
                </p>

                <div className="flex items-center gap-2 text-xs font-bold text-[var(--plum)] uppercase pt-2 border-t">
                  <Clock size={16} className="text-[var(--gold)]" /> Horário de
                  Atendimento
                </div>
                <p className="text-xs text-[var(--ink-soft)]">
                  Segunda a Sexta: 08:30 às 18:00 | Sábado: 09:00 às 13:00
                </p>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Prefere um atendimento imediato via WhatsApp?"
        description="Clique abaixo e fale diretamente com a Corretora Val sem esperar e-mail."
      />
    </main>
  );
}
