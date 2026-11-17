import {
  DollarSign,
  FileCheck,
  Headset,
  Lock,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { PropertyOwnerForm } from "@/components/forms/property-owner-form";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionTitle } from "@/components/site/section-title";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import {
  getAdminImoveisLandingPageContent,
  getPageSeo,
} from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("administracao-imoveis-balneario-camboriu");
  const title =
    seo.title ??
    "Administração de Imóveis em Balneário Camboriú e Região | Corretora Val";
  const description =
    seo.description ??
    "Administração profissional de imóveis em Balneário Camboriú. Cuidamos do seu patrimônio com transparência, seleção rigorosa e repasses pontuais.";
  return {
    title,
    description,
    alternates: { canonical: "/administracao-imoveis-balneario-camboriu" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: `${SITE_URL}/administracao-imoveis-balneario-camboriu`,
      siteName: "Corretora Val",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

const PILLAR_ICONS = [
  ShieldCheck,
  FileCheck,
  DollarSign,
  Wrench,
  Lock,
  Headset,
] as const;

export default async function AdministracaoImoveisPage() {
  const c = await getAdminImoveisLandingPageContent();

  const pillars = [
    { title: c.pillar1Title, desc: c.pillar1Desc, Icon: PILLAR_ICONS[0] },
    { title: c.pillar2Title, desc: c.pillar2Desc, Icon: PILLAR_ICONS[1] },
    { title: c.pillar3Title, desc: c.pillar3Desc, Icon: PILLAR_ICONS[2] },
    { title: c.pillar4Title, desc: c.pillar4Desc, Icon: PILLAR_ICONS[3] },
    { title: c.pillar5Title, desc: c.pillar5Desc, Icon: PILLAR_ICONS[4] },
    { title: c.pillar6Title, desc: c.pillar6Desc, Icon: PILLAR_ICONS[5] },
  ];

  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow={c.heroEyebrow}
        title={c.heroTitle}
        subtitle={c.heroSubtitle}
      />

      {/* Conteúdo Editorial Otimizado para SEO (>300 palavras) */}
      <section className="py-16 md:py-20 bg-white border-b">
        <div className="shell max-w-4xl space-y-8 text-[var(--ink-soft)] leading-relaxed">
          <SectionTitle
            eyebrow={c.sectionEyebrow}
            title={c.sectionTitle}
          />

          <p className="text-base sm:text-lg">{c.intro}</p>

          <p className="text-sm sm:text-base">{c.intro2}</p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                    <pillar.Icon size={20} />
                  </div>
                  <h3 className="display text-xl text-[var(--plum)] font-bold">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm mt-2 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-6">
            <h3 className="display text-2xl text-[var(--plum)] font-bold">
              {c.flowTitle}
            </h3>
            <p className="text-sm sm:text-base">{c.flowParagraph1}</p>
            <p className="text-sm sm:text-base">{c.flowParagraph2}</p>
          </div>
        </div>
      </section>

      {/* Seção de Cadastro do Imóvel pelo Proprietário */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)]">
        <div className="shell max-w-4xl">
          <SectionTitle
            eyebrow={c.formEyebrow}
            title={c.formTitle}
            subtitle={c.formSubtitle}
            align="center"
          />

          <div className="mt-10 rounded-3xl border border-[var(--gold-light)] bg-white p-6 sm:p-10 shadow-sm">
            <PropertyOwnerForm />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <CTASection
        title={c.ctaTitle}
        description={c.ctaDescription}
        primaryButtonText={c.ctaPrimaryLabel}
        secondaryButtonText={c.ctaSecondaryLabel}
        secondaryButtonHref={c.ctaSecondaryHref}
      />
    </main>
  );
}
