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

export const revalidate = 60;

export const metadata: Metadata = {
  title:
    "Administração de Imóveis em Balneário Camboriú e Região | Corretora Val",
  description:
    "Administração profissional de imóveis em Balneário Camboriú. Cuidamos do seu patrimônio com transparência, seleção rigorosa e repasses pontuais.",
  alternates: {
    canonical: "/administracao-imoveis-balneario-camboriu",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/administracao-imoveis-balneario-camboriu`,
    siteName: "Corretora Val",
    title:
      "Administração de Imóveis em Balneário Camboriú e Região | Corretora Val",
    description:
      "Gestão completa e responsável de imóveis em Balneário Camboriú e Camboriú com segurança jurídica e atendimento humano.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Administração de Imóveis em Balneário Camboriú e Região | Corretora Val",
    description:
      "Gestão completa de imóveis em Balneário Camboriú e Camboriú.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

const servicePillars = [
  {
    icon: ShieldCheck,
    title: "Seleção Criteriosa de Inquilinos",
    desc: "Análise aprofundada de histórico financeiro, capacidade de pagamento, certidões negativas e checagem minuciosa de garantias locatícias.",
  },
  {
    icon: FileCheck,
    title: "Vistorias Detalhadas com Laudo",
    desc: "Vistoria inicial e final com fotos de alta qualidade e memorial descritivo completo para preservar o patrimônio exatamente como foi entregue.",
  },
  {
    icon: DollarSign,
    title: "Cobrança Rigorosa e Repasse Pontual",
    desc: "Controle financeiro automatizado, emissão pontual de boletos, gestão de encargos (IPTU, condomínio, taxa de lixo) e repasse sem atrasos.",
  },
  {
    icon: Wrench,
    title: "Gestão Ativa de Manutenções",
    desc: "Rede de profissionais parceiros de confiança (elétrica, hidráulica, pintura) para orçamentos justos e reparos rápidos sob aprovação do proprietário.",
  },
  {
    icon: Lock,
    title: "Segurança Jurídica Integral",
    desc: "Contratos personalizados sob a égide da Lei do Inquilinato (Lei nº 8.245/91), garantindo respaldo em eventuais cobranças ou reajustes anuais pelo índice pactuado.",
  },
  {
    icon: Headset,
    title: "Atendimento Direto e Humanizado",
    desc: "Canal direto com a corretora responsável, sem filas ou robôs impessoais. Relatórios transparentes e acompanhamento em tempo real.",
  },
];

export default function AdministracaoImoveisPage() {
  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="GESTÃO PATRIMONIAL DEDICADA"
        title="Administração de Imóveis em Balneário Camboriú"
        subtitle="Deixe a gestão do seu imóvel nas mãos de quem atua no mercado catarinense desde 1990. Rentabilidade justa, inquilinos qualificados e zero dor de cabeça para o proprietário."
      />

      {/* Conteúdo Editorial Otimizado para SEO (>300 palavras) */}
      <section className="py-16 md:py-20 bg-white border-b">
        <div className="shell max-w-4xl space-y-8 text-[var(--ink-soft)] leading-relaxed">
          <SectionTitle
            eyebrow="Tranquilidade para Proprietários"
            title="Por que Confiar a Gestão do seu Imóvel à Corretora Val?"
          />

          <p className="text-base sm:text-lg">
            Possuir um imóvel em <strong>Balneário Camboriú</strong> ou em{" "}
            <strong>Camboriú</strong> é um dos investimentos mais rentáveis e
            seguros do país. No entanto, lidar diretamente com inquilinos,
            cobranças em atraso, orçamentos abusivos de manutenção, vistorias
            incompletas e redação de contratos sem assessoria jurídica pode
            transformar uma fonte de renda em fonte constante de preocupação.
          </p>

          <p className="text-sm sm:text-base">
            A <strong>administração de imóveis</strong> da Corretora Val foi
            desenvolvida justamente para proteger o patrimônio da sua família.
            Com registro profissional <strong>CRECI/SC 56372-F</strong>,
            Valdete Gonçalves de Melo une mais de três décadas de experiência no
            setor imobiliário a uma postura de integridade, acompanhando
            pessoalmente cada imóvel sob sua gestão.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {servicePillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-[var(--gold-light)]/40 bg-[var(--surface-muted)] p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="display text-xl text-[var(--plum)] font-bold">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm mt-2 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 pt-6">
            <h3 className="display text-2xl text-[var(--plum)] font-bold">
              Fluxo Transparente da Administração de Imóveis
            </h3>
            <p className="text-sm sm:text-base">
              Nosso processo é estruturado em etapas claras: realizamos a
              avaliação mercadológica do valor de locação com base em dados
              reais de Balneário Camboriú, providenciamos fotos profissionais,
              anunciamos nos canais de maior relevância e filtramos os
              interessados com rigor.
            </p>
            <p className="text-sm sm:text-base">
              Após a aprovação cadastral, redigimos o contrato com todas as
              cláusulas protetivas, lavramos o laudo de vistoria com dezenas de
              registros fotográficos e passamos a monitorar os pagamentos e
              repasses mensais. Quando o contrato se encerra, executamos a
              conferência minuciosa de saída para que o imóvel seja entregue em
              perfeito estado de conservação.
            </p>
          </div>
        </div>
      </section>

      {/* Seção de Cadastro do Imóvel pelo Proprietário */}
      <section className="py-16 md:py-24 bg-[var(--surface-muted)]">
        <div className="shell max-w-4xl">
          <SectionTitle
            eyebrow="Cadastre seu Imóvel"
            title="Quer que cuidemos do seu imóvel?"
            subtitle="Preencha os dados abaixo e entraremos em contato diretamente com uma avaliação personalizada."
            align="center"
          />

          <div className="mt-10 rounded-3xl border border-[var(--gold-light)] bg-white p-6 sm:p-10 shadow-sm">
            <PropertyOwnerForm />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <CTASection
        title="Deseja conversar sobre a administração do seu imóvel?"
        description="Fale diretamente com a Corretora Val por WhatsApp e receba uma orientação sem compromisso."
        primaryButtonText="Conversar no WhatsApp"
        secondaryButtonText="Conhecer nossa história"
        secondaryButtonHref="/quem-somos"
      />
    </main>
  );
}
