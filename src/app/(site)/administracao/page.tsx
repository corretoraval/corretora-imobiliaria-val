import {
  DollarSign,
  FileCheck,
  Headset,
  LineChart,
  Lock,
  Megaphone,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { PropertyOwnerForm } from "@/components/forms/property-owner-form";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionTitle } from "@/components/site/section-title";
import { getAdministracaoPageContent } from "@/lib/site-content";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Administração de Imóveis | Corretora Val",
  description:
    "Gestão profissional de imóveis em Balneário Camboriú e Camboriú. Divulgação estratégica, seleção rigorosa de inquilinos e segurança total para o seu patrimônio.",
};

const BENEFIT_ICONS = [ShieldCheck, Megaphone, Users, LineChart, Lock];

const careItems = [
  {
    icon: FileCheck,
    title: "Gestão de Locação",
    desc: "Emissão de contratos, vistoria fotográfica e acompanhamento de chaves.",
  },
  {
    icon: DollarSign,
    title: "Cobrança & Repasse",
    desc: "Controle pontual de pagamentos, repasses e acompanhamento de adimplência.",
  },
  {
    icon: Headset,
    title: "Atendimento ao Inquilino",
    desc: "Central direta para resolução de dúvidas e ocorrências do dia a dia.",
  },
  {
    icon: Wrench,
    title: "Manutenção & Reparos",
    desc: "Acompanhamento de orçamentos e reparos necessários para conservar o imóvel.",
  },
];

export default async function AdministracaoPage() {
  const adminContent = await getAdministracaoPageContent();

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="Patrimônio Bem Cuidado"
        title="Seu imóvel merece ser administrado por quem entende."
        subtitle="Há mais de três décadas cuidamos do patrimônio de famílias em Balneário Camboriú e Camboriú com transparência, segurança e atenção dedicada."
      />

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <SectionTitle
            eyebrow={adminContent.benefitsEyebrow}
            title={adminContent.benefitsTitle}
            subtitle={adminContent.benefitsSubtitle}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminContent.benefits.map((b, index) => {
              const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
              return (
                <div
                  key={b.title}
                  className="rounded-2xl border p-8 bg-[var(--surface)] hover:border-[var(--gold-light)] transition-all"
                >
                  <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-white text-[var(--plum)] shadow-xs">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--plum)] mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)] border-y">
        <div className="shell">
          <SectionTitle
            eyebrow={adminContent.stepsEyebrow}
            title={adminContent.stepsTitle}
            subtitle={adminContent.stepsSubtitle}
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {adminContent.steps.map((s) => (
              <div
                key={s.number}
                className="rounded-2xl border bg-white p-6 relative flex flex-col justify-between"
              >
                <div>
                  <span className="display block text-3xl font-bold text-[var(--gold)] mb-3">
                    {s.number}
                  </span>
                  <h4 className="font-bold text-base text-[var(--plum)] mb-2">
                    {s.title}
                  </h4>
                  <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we care for & Form Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs font-extrabold tracking-[0.14em] text-[var(--gold)] uppercase block mb-2">
                  Cuidado Integral
                </span>
                <h2 className="display text-3xl md:text-4xl text-[var(--plum)] leading-tight">
                  O que cuidamos para você em cada detalhe
                </h2>
                <p className="mt-4 text-sm text-[var(--ink-soft)] leading-relaxed">
                  Gerenciar um imóvel exige tempo, atenção legal e
                  acompanhamento. Assumimos a rotina operacional para que você
                  tenha retorno sem preocupações.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {careItems.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.title}
                      className="rounded-2xl border p-5 bg-[var(--surface)]"
                    >
                      <Icon size={20} className="text-[var(--gold)] mb-2" />
                      <h4 className="font-bold text-sm text-[var(--plum)] mb-1">
                        {c.title}
                      </h4>
                      <p className="text-xs text-[var(--ink-soft)]">{c.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7">
              <PropertyOwnerForm />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Deixe seu patrimônio nas mãos de quem cuida dele."
        description="Fale diretamente comigo para tirar suas dúvidas sobre valores de aluguel, vistorias e taxas de administração."
      />
    </main>
  );
}
