import { Award, Compass, MapPin, Quote, Shield, Target } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Timeline } from "@/components/institutional/timeline";
import { ValuesGrid } from "@/components/institutional/values-grid";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionTitle } from "@/components/site/section-title";
import {
  getMarcosHistoricos,
  getMembrosEquipe,
  getPageSeo,
  getQuemSomosContent,
  getQuemSomosPageContent,
} from "@/lib/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("quem-somos");

  return {
    title: seo.title ?? "Quem Somos | Corretora Val",
    description:
      seo.description ??
      "Conheça a história de Valdete Gonçalves de Melo e a trajetória da Corretora Val em Balneário Camboriú e Camboriú: trabalho, família, compromisso e confiança desde 1990.",
  };
}

export default async function QuemSomosPage() {
  const [dbMarcos, membros, content, quemSomosContent] = await Promise.all([
    getMarcosHistoricos(),
    getMembrosEquipe(),
    getQuemSomosContent(),
    getQuemSomosPageContent(),
  ]);

  const timelineItems =
    dbMarcos.length > 0
      ? dbMarcos.map((m) => ({
          year: String(m.year),
          title: m.title,
          description: m.description || "",
          image:
            String(m.year) === "1989"
              ? {
                  src: "/images/institutional/valdete-inicio-1989.png",
                  alt: "Valdete no início da carreira na Imobiliária Gonzaga em Curitiba (1989/1990)",
                  caption:
                    "1989 — O convite que abriu a primeira porta, na Imobiliária Gonzaga em Curitiba.",
                }
              : undefined,
        }))
      : undefined;
  return (
    <main className="min-h-screen">
      <PageHero
        eyebrow="QUEM SOMOS"
        title="Minha História. Meu Compromisso."
        subtitle="Desde 1990, uma trajetória construída com trabalho, família e confiança."
      />

      {/* ═══════════════════════════════════════════════════════════
          SEÇÃO 1 — Perfil da Fundadora (Abertura & Biografia)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Biografia Textual */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-extrabold tracking-[0.14em] text-[var(--gold)] uppercase block">
                História de Dedicação & Superação
              </span>
              <h2 className="display text-3xl md:text-5xl text-[var(--plum)] leading-tight">
                {quemSomosContent.biographyTitle}
              </h2>

              <p className="text-base md:text-lg text-[var(--ink)] leading-relaxed font-semibold">
                {quemSomosContent.biographyLead}
              </p>

              <div className="space-y-4 text-sm md:text-base text-[var(--ink-soft)] leading-relaxed">
                {content.biography.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>

              {/* Personal Gratitude & Overcoming Highlight */}
              <div className="rounded-3xl border border-[var(--gold-light)] bg-gradient-to-r from-[var(--surface-muted)] to-[var(--surface)] p-6 md:p-8 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] shrink-0 mt-1">
                    <Quote size={20} />
                  </div>
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--gold)]">
                      Palavras da Fundadora
                    </span>
                    <p className="text-base text-[var(--plum)] font-medium italic leading-relaxed">
                      {content.quote}
                    </p>
                    <p className="text-xs font-bold text-[var(--ink-soft)]">
                      {quemSomosContent.quoteAuthor}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto de Perfil Oficial & Identificação (Proporção 2:3 nativa 682x1024) */}
            <div className="lg:col-span-5 flex justify-center lg:block">
              <div className="overflow-hidden rounded-3xl border border-[var(--gold-light)] bg-gradient-to-br from-[var(--surface-muted)] to-[var(--surface)] p-5 md:p-6 shadow-lg space-y-5 w-full max-w-[360px] lg:max-w-none">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[var(--plum)]/10 shadow-inner">
                  <Image
                    src="/images/institutional/valdete-perfil.png"
                    alt="Valdete Gonçalves de Melo, fundadora da Corretora Val, em traje profissional blazer preto e camisa branca"
                    fill
                    priority
                    className="object-contain object-top"
                    sizes="(max-width: 768px) 360px, 420px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--plum)]/75 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="display text-2xl font-bold leading-tight">
                      Valdete Gonçalves de Melo
                    </p>
                    <p className="text-xs font-extrabold tracking-wider text-[var(--gold-light)] uppercase mt-0.5">
                      CRECI/SC 56372-F
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex size-11 items-center justify-center rounded-full bg-[var(--plum)] text-[var(--gold)] shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--plum)]">
                      Corretora Val
                    </h3>
                    <span className="text-xs text-[var(--gold)] font-bold uppercase tracking-wider block">
                      Fundadora & Gestora Patrimonial
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--plum)]">
                    <MapPin size={15} className="text-[var(--gold)] shrink-0" />{" "}
                    Balneário Camboriú & Camboriú — SC
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--plum)]">
                    <Shield size={15} className="text-[var(--gold)] shrink-0" />{" "}
                    Administração, Locação Anual, Temporada e Vendas
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 border text-center space-y-0.5 shadow-xs">
                  <span className="display text-xl font-bold text-[var(--plum)]">
                    Confiança que abre portas.
                  </span>
                  <p className="text-[0.65rem] text-[var(--gold)] font-extrabold uppercase tracking-wider">
                    Slogan Institucional
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEÇÃO 2 — Missão, Visão e Valores (Antiga Seção 4)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--surface-muted)] border-y">
        <div className="shell">
          <SectionTitle
            eyebrow="Propósito Institucional"
            title="Nossa Missão & Nossa Visão"
            subtitle="Direcionadores fundamentais que conduzem a nossa atuação diária."
            align="center"
          />

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mt-12">
            <div className="rounded-3xl border bg-white p-8 md:p-10 shadow-xs space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--plum)] text-[var(--gold)]">
                <Target size={24} />
              </div>
              <h3 className="display text-2xl font-bold text-[var(--plum)]">
                Nossa Missão
              </h3>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                Administrar patrimônios com responsabilidade, transparência e
                organização, oferecendo segurança para proprietários e
                tranquilidade para inquilinos, sempre por meio de um atendimento
                humano e personalizado.
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-8 md:p-10 shadow-xs space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--plum)] text-[var(--gold)]">
                <Compass size={24} />
              </div>
              <h3 className="display text-2xl font-bold text-[var(--plum)]">
                Nossa Visão
              </h3>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                Ser reconhecida como referência em administração de imóveis e
                locações em Balneário Camboriú e Camboriú, unindo experiência,
                inovação e relacionamento de confiança.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <SectionTitle
              eyebrow="Pilares Éticos"
              title="Nossos Valores"
              subtitle="Princípios que orientam cada contrato, atendimento e negociação."
              align="center"
            />
            <div className="mt-10">
              <ValuesGrid />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEÇÃO 3 — Linha do Tempo Visual com Fotos Históricas (Antiga Seção 2)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="shell max-w-4xl">
          <SectionTitle
            eyebrow="Memória & Marcos"
            title="Nossa Linha do Tempo"
            subtitle="Os momentos decisivos que transformaram experiência, superação e dedicação na solidez da Corretora Val."
            align="center"
          />

          <div className="mt-14">
            <Timeline items={timelineItems} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEÇÃO 4 — Família (Composição Completa Sem Cortes - 3:2 Nativo)
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--surface-muted)] border-y">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            {/* Foto da Família em Proporção 3:2 Nativa com object-contain */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-3xl border border-[var(--gold-light)] bg-white p-4 md:p-5 shadow-lg space-y-3">
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-neutral-50 shadow-inner">
                  <Image
                    src="/images/institutional/valdete-familia.jpg"
                    alt="Valdete Gonçalves de Melo, seu filho Felipe Cesar e seu neto Kauan Enrique com vista panorâmica para o skyline de Balneário Camboriú"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                </div>
                <div className="px-2 pb-1 text-center">
                  <span className="eyebrow text-[var(--gold)] block">
                    Família & Continuidade
                  </span>
                  <p className="display text-xl md:text-2xl text-[var(--plum)] font-bold mt-1">
                    Três gerações unidas pelo cuidado
                  </p>
                  <p className="text-xs text-[var(--ink-soft)] mt-1 max-w-md mx-auto">
                    Valdete, seu filho Felipe e seu neto Kauan — unindo
                    experiência, inovação e compromisso ético da Corretora Val
                    em Balneário Camboriú.
                  </p>
                </div>
              </div>
            </div>

            {/* Texto da Seção Família */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-extrabold tracking-[0.14em] text-[var(--gold)] uppercase block">
                Nossa Família
              </span>
              <h2 className="display text-3xl md:text-4xl text-[var(--plum)] leading-tight">
                A Corretora Val é uma empresa construída em família.
              </h2>
              <p className="text-base text-[var(--ink-soft)] leading-relaxed">
                Ao meu lado caminham meu filho{" "}
                <strong className="text-[var(--plum)] font-bold">
                  Felipe Cesar Gonçalves de Melo
                </strong>
                , que atua na gestão da empresa, meu neto{" "}
                <strong className="text-[var(--plum)] font-bold">
                  Kauan Enrique Otto
                </strong>
                , representando a nova geração do mercado imobiliário, e toda a
                minha família, que sempre foi a base de cada recomeço.
              </p>
              <p className="text-base text-[var(--ink-soft)] leading-relaxed">
                Minha filha{" "}
                <strong className="text-[var(--plum)] font-bold">
                  Michely
                </strong>
                , meu genro{" "}
                <strong className="text-[var(--plum)] font-bold">Marcos</strong>
                , meus netos{" "}
                <strong className="text-[var(--plum)] font-bold">Malu</strong> e{" "}
                <strong className="text-[var(--plum)] font-bold">Raul</strong>,
                e minha mãe{" "}
                <strong className="text-[var(--plum)] font-bold">Dileia</strong>{" "}
                fazem parte da história que inspira a Corretora Val todos os
                dias. São eles que me lembram por que vale a pena trabalhar com
                dedicação, honestidade e amor pelo que faço.
              </p>
              <div className="pt-3 border-t border-[var(--gold-light)]/40">
                <p className="text-xs font-bold text-[var(--plum)] italic">
                  &ldquo;Acreditamos que cada cliente que confia seu imóvel a
                  nós passa a fazer parte da nossa história.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Seção Dinâmica de Membros da Equipe */}
          {membros.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[var(--gold-light)]/40">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="eyebrow text-[var(--gold)] block">
                  Corpo Profissional
                </span>
                <h3 className="display text-2xl md:text-3xl text-[var(--plum)] font-bold mt-1">
                  Nossa Equipe de Atendimento & Operações
                </h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
                {membros.map((membro) => (
                  <div
                    key={membro.id}
                    className="flex gap-4 rounded-3xl border border-[var(--gold-light)] bg-white p-6 shadow-xs"
                  >
                    <div className="size-16 rounded-2xl bg-[var(--plum)]/10 text-[var(--plum)] font-bold flex items-center justify-center text-lg shrink-0 overflow-hidden border border-[var(--gold-light)]">
                      {membro.photoUrl ? (
                        <Image
                          src={membro.photoUrl}
                          alt={membro.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        membro.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="display text-lg font-bold text-[var(--plum)] leading-tight">
                        {membro.name}
                      </h4>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--gold)]">
                        {membro.role}
                      </p>
                      {membro.bio && (
                        <p className="text-xs text-[var(--ink-soft)] leading-relaxed pt-1">
                          {membro.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SEÇÃO 5 — Manifesto & CTA Final
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="shell max-w-4xl">
          <div className="rounded-3xl border border-[var(--gold-light)] bg-gradient-to-br from-[var(--plum)] to-[#4A1768] p-8 md:p-14 text-white shadow-xl space-y-6 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-white/10 text-[var(--gold-light)] mb-2">
              <Quote size={28} />
            </div>
            <span className="eyebrow text-[var(--gold-light)] block">
              Compromisso de Vida
            </span>
            <h2 className="display text-3xl md:text-5xl text-white">
              Nosso Manifesto
            </h2>

            <div className="space-y-4 text-base md:text-lg text-white/90 leading-relaxed italic max-w-2xl mx-auto pt-2">
              <p>&ldquo;Não acreditamos que imóveis sejam apenas paredes.</p>
              <p>Cada chave representa um novo começo.</p>
              <p>Cada contrato simboliza confiança.</p>
              <p>Cada cliente faz parte da nossa história.</p>
              <p>
                É por isso que trabalhamos todos os dias com responsabilidade,
                transparência e respeito.
              </p>
              <p className="font-bold text-[var(--gold-light)] not-italic text-lg md:text-xl pt-3">
                Porque mais do que administrar imóveis, administramos
                patrimônios, construímos confiança e aproximamos pessoas do
                lugar onde viverão novas histórias.&rdquo;
              </p>
            </div>

            <div className="pt-8 border-t border-white/20 inline-block text-center">
              <p className="display text-2xl text-white font-bold">
                Valdete Gonçalves de Melo
              </p>
              <p className="text-xs text-[var(--gold-light)] font-extrabold uppercase tracking-widest mt-1">
                Corretora Val · CRECI/SC 56372-F
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Confiança que abre portas."
        description="Fale diretamente comigo para cuidar do seu imóvel com a atenção, o carinho e a segurança que seu patrimônio merece."
        primaryButtonText="Falar pelo WhatsApp"
        secondaryButtonText="Ver Nossos Imóveis"
        secondaryButtonHref="/imoveis"
      />
    </main>
  );
}
