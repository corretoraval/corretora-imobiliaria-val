import { prisma } from "@/lib/prisma";
import { normalizeHomeContent } from "@/lib/home-content";
export type { HomeContent } from "@/lib/home-content";

export type AdministracaoContent = {
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: { title: string; description: string }[];
  stepsTitle: string;
  stepsSubtitle: string;
  steps: { number: string; title: string; desc: string }[];
};

export type QuemSomosContent = {
  biography: string[];
  quote: string;
};

export type MemoriaVivaContent = {
  quote: string;
  quoteDescription: string;
};

export const fallbackAdministracao: AdministracaoContent = {
  benefitsTitle:
    "Tranquilidade para você aproveitar os frutos do seu investimento.",
  benefitsSubtitle:
    "Conheça os diferenciais que tornam a nossa gestão de imóveis uma escolha segura e livre de dores de cabeça.",
  benefits: [
    {
      title: "Gestão Profissional",
      description:
        "Administração completa com relatórios transparentes, suporte jurídico e acompanhamento de cada contrato.",
    },
    {
      title: "Divulgação Estratégica",
      description:
        "Anúncios em portais de destaque, fotos de qualidade e atendimento ágil para atrair interessados qualificados.",
    },
    {
      title: "Seleção de Inquilinos",
      description:
        "Análise criteriosa de crédito e comprovantes de renda para garantir morada responsável e adimplência.",
    },
    {
      title: "Acompanhamento Contínuo",
      description:
        "Monitoramento de reajustes contratuais, vistorias periódicas de entrada e saída e renovações orientadas.",
    },
    {
      title: "Segurança Jurídica",
      description:
        "Contratos estruturados sob a Lei do Inquilinato com garantias locatícias sólidas para proteção do imóvel.",
    },
  ],
  stepsTitle: "Como funciona a nossa administração?",
  stepsSubtitle:
    "Um fluxo transparente e organizado em 5 etapas claras para você colocar seu imóvel para render.",
  steps: [
    {
      number: "01",
      title: "Você apresenta o imóvel",
      desc: "Entre em contato conosco e compartilhe as características do seu bem.",
    },
    {
      number: "02",
      title: "Avaliamos e cadastramos",
      desc: "Realizamos estudo de mercado para precificação justa e cadastro completo.",
    },
    {
      number: "03",
      title: "Divulgamos",
      desc: "Publicamos seu imóvel nas nossas redes, portal exclusivo e parceiros estratégicos.",
    },
    {
      number: "04",
      title: "Encontramos o perfil ideal",
      desc: "Filtramos propostas e selecionamos inquilinos qualificados.",
    },
    {
      number: "05",
      title: "Administramos",
      desc: "Gestão completa de recebimentos, manutenção e atendimento durante todo o contrato.",
    },
  ],
};

export const fallbackQuemSomos: QuemSomosContent = {
  biography: [
    "Meu nome é Valdete Gonçalves de Melo, fundadora da Corretora Val, especialista em Administração de Imóveis, Locação Anual, Temporada e Compra e Venda, com atuação em Balneário Camboriú e Camboriú.",
    "Minha história no mercado imobiliário teve início em 1989, com o convite que abriu a primeira porta para trabalhar na tradicional Imobiliária Gonzaga, em Curitiba. Foi em 1990 que iniciei oficialmente minha trajetória profissional no setor, começando como secretária e, com o tempo, passando a apresentar imóveis, realizar vistorias e intermediar relações entre proprietários e locatários.",
    "A vida me levou por outros caminhos durante muitos anos, mas nunca apagou o sonho de voltar ao mercado imobiliário.",
    "Durante 25 anos, trabalhei como motoboy para sustentar minha família, sempre acreditando que o trabalho honesto abriria novas portas.",
    "Também tive a honra de presidir a AMAE – Associação de Apoio à Criança e ao Adolescente com Mobilidade Reduzida e com Câncer, uma experiência que fortaleceu ainda mais meu compromisso com o cuidado, a responsabilidade e o respeito pelas pessoas.",
    "Em 2019, já em Balneário Camboriú, retornei ao mercado imobiliário e reencontrei a profissão que sempre fez parte da minha essência.",
    "Foi dessa trajetória que nasceu a Corretora Val.",
    "Hoje, atuamos com foco na administração de patrimônios, locação anual, temporada e compra e venda de imóveis, oferecendo um atendimento próximo, transparente e organizado.",
    "Mais do que intermediar negócios, acreditamos em construir relacionamentos duradouros, baseados na confiança e no respeito.",
  ],
  quote:
    "“Quero agradecer primeiramente por me ajudar a realizar um sonho guardado desde que resolvi caminhar aqui sozinha. Na pandemia fui dispensada do trabalho, sem rumo. A Michely e o Felipe me mostraram que eu era capaz — as palavras deles e o presente da Michely, me presenteando com o curso do CRECI, me fizeram acreditar que sou capaz.”",
};

export const fallbackMemoriaViva: MemoriaVivaContent = {
  quote: "“Cada imóvel carrega uma história. A nossa também.”",
  quoteDescription:
    "Preservamos com carinho as amizades e contatos que iniciaram lá nos primeiros anos e continuam confiando no nosso trabalho até os dias de hoje.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge<T>(fallback: T, value: unknown): T {
  if (!isRecord(fallback) || !isRecord(value)) return fallback;
  const result = { ...fallback };
  for (const key of Object.keys(fallback)) {
    const candidate = value[key];
    if (candidate === undefined || candidate === null) continue;
    const defaultValue = fallback[key as keyof T];
    if (Array.isArray(defaultValue)) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        (result as Record<string, unknown>)[key] = candidate;
      }
    } else if (isRecord(defaultValue)) {
      (result as Record<string, unknown>)[key] = merge(defaultValue, candidate);
    } else if (typeof candidate === typeof defaultValue) {
      (result as Record<string, unknown>)[key] = candidate;
    }
  }
  return result;
}

async function getPageContent(slug: string) {
  try {
    return (await prisma.paginaSite.findUnique({ where: { slug } }))?.content;
  } catch {
    return null;
  }
}

export async function getHomeContent() {
  const raw = await getPageContent("home");
  return normalizeHomeContent(raw);
}

export async function getAdministracaoContent() {
  const raw = await getPageContent("administracao");
  const content = merge(fallbackAdministracao, raw);
  if (isRecord(raw) && Array.isArray(raw.steps)) {
    return {
      ...content,
      steps: raw.steps
        .map((step) =>
          isRecord(step) && typeof step.description === "string"
            ? {
                number: String(step.number ?? ""),
                title: String(step.title ?? ""),
                desc: step.description,
              }
            : null,
        )
        .filter(
          (step): step is AdministracaoContent["steps"][number] =>
            step !== null,
        ),
    };
  }
  return content;
}

export async function getQuemSomosContent() {
  const raw = await getPageContent("quem-somos");
  const content = merge(fallbackQuemSomos, raw);
  if (isRecord(raw)) {
    return {
      biography:
        Array.isArray(raw.biographyParagraphs) &&
        raw.biographyParagraphs.length > 0
          ? raw.biographyParagraphs.filter(
              (paragraph): paragraph is string => typeof paragraph === "string",
            )
          : content.biography,
      quote: typeof raw.quoteText === "string" ? raw.quoteText : content.quote,
    };
  }
  return content;
}

export async function getMemoriaVivaContent() {
  const raw = await getPageContent("memoria-viva");
  const content = merge(fallbackMemoriaViva, raw);
  if (isRecord(raw)) {
    return {
      quote:
        typeof raw.quoteBannerText === "string"
          ? raw.quoteBannerText
          : content.quote,
      quoteDescription:
        typeof raw.quoteBannerDescription === "string"
          ? raw.quoteBannerDescription
          : content.quoteDescription,
    };
  }
  return content;
}

const fallbackSettings = {
  id: "principal",
  brandName: "Corretora Val",
  tagline: "Confiança que abre portas.",
  phone: "(47) 97400-7391",
  whatsapp: "5547974007391",
  email: "contato@corretoraval.com.br",
  address: "Balneário Camboriú — SC",
  instagramUrl: "https://www.instagram.com/valdete_goncalvesdemelo/",
  creci: "CRECI/SC 56372-F",
  // Tema visual — preset padrão: Ametista & Ouro Real
  themePreset: "ametista-ouro",
  primaryColor: "#35104f",
  primaryHover: "#4a1768",
  accentColor: "#b58a3a",
  accentLightColor: "#d8bd82",
  backgroundColor: "#f8f5ef",
  titleFont: "cormorant",
  bodyFont: "manrope",
};

export async function getSiteSettings() {
  try {
    const settings =
      (await prisma.configuracaoSite.findUnique({
        where: { id: "principal" },
      })) ?? fallbackSettings;
    return {
      ...fallbackSettings,
      ...settings,
      instagramUrl: settings.instagramUrl ?? fallbackSettings.instagramUrl,
    };
  } catch {
    return fallbackSettings;
  }
}

export async function getPublishedPages() {
  try {
    return await prisma.paginaSite.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getDepoimentos() {
  try {
    return await prisma.depoimento.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getMarcosHistoricos() {
  try {
    return await prisma.marcoHistorico.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getMembrosEquipe() {
  try {
    return await prisma.membroEquipe.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CONTEÚDO ESTRUTURADO ESPECÍFICO POR PÁGINA COM FALLBACK HARDCODED
// ═════════════════════════════════════════════════════════════════════════════

// ── ADMINISTRAÇÃO ────────────────────────────────────────────────────────────
export interface BenefitItem {
  title: string;
  description: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface AdministracaoPageContent {
  benefitsEyebrow: string;
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: BenefitItem[];
  stepsEyebrow: string;
  stepsTitle: string;
  stepsSubtitle: string;
  steps: StepItem[];
}

export const fallbackAdministracaoContent: AdministracaoPageContent = {
  benefitsEyebrow: "Por que confiar na Corretora Val",
  benefitsTitle: "Vantagens de ter seu imóvel administrado por especialistas",
  benefitsSubtitle:
    "Cuidamos de tudo para que você tenha rentabilidade, tranquilidade e a certeza de que seu patrimônio está em boas mãos.",
  benefits: [
    {
      title: "Gestão Profissional",
      description:
        "Administração completa com relatórios transparentes, suporte jurídico e acompanhamento de cada contrato.",
    },
    {
      title: "Divulgação Estratégica",
      description:
        "Anúncios em portais de destaque, fotos de qualidade e atendimento ágil para atrair interessados qualificados.",
    },
    {
      title: "Seleção de Inquilinos",
      description:
        "Análise criteriosa de crédito e comprovantes de renda para garantir morada responsável e adimplência.",
    },
    {
      title: "Acompanhamento Contínuo",
      description:
        "Monitoramento de reajustes contratuais, vistorias periódicas de entrada e saída e renovações orientadas.",
    },
    {
      title: "Segurança Jurídica",
      description:
        "Contratos estruturados sob a Lei do Inquilinato com garantias locatícias sólidas para proteção do imóvel.",
    },
  ],
  stepsEyebrow: "Como Funciona",
  stepsTitle: "Passo a passo para administrar seu imóvel",
  stepsSubtitle:
    "Um processo transparente e descomplicado do primeiro contato à entrega das chaves.",
  steps: [
    {
      number: "01",
      title: "Você apresenta o imóvel",
      description:
        "Preencha o formulário ou fale conosco pelo WhatsApp com os dados básicos do seu imóvel.",
    },
    {
      number: "02",
      title: "Avaliação e alinhamento",
      description:
        "Analisamos o potencial de locação ou venda, sugerimos valores de mercado e alinhamos as condições.",
    },
    {
      number: "03",
      title: "Vistoria e produção de fotos",
      description:
        "Realizamos vistoria detalhada de entrada e produzimos fotos para valorizar cada ambiente.",
    },
    {
      number: "04",
      title: "Divulgação e seleção de interessados",
      description:
        "Anunciamos nos melhores canais e fazemos a análise cadastral completa dos proponentes.",
    },
    {
      number: "05",
      title: "Contrato assinado e gestão ativa",
      description:
        "Elaboramos o contrato com garantias sólidas e assumimos toda a gestão do dia a dia.",
    },
  ],
};

export async function getAdministracaoPageContent(): Promise<AdministracaoPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "administracao" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackAdministracaoContent;
    }
    const c = page.content as Partial<AdministracaoPageContent>;
    return {
      benefitsEyebrow:
        c.benefitsEyebrow || fallbackAdministracaoContent.benefitsEyebrow,
      benefitsTitle:
        c.benefitsTitle || fallbackAdministracaoContent.benefitsTitle,
      benefitsSubtitle:
        c.benefitsSubtitle || fallbackAdministracaoContent.benefitsSubtitle,
      benefits:
        Array.isArray(c.benefits) && c.benefits.length === 5
          ? c.benefits
          : fallbackAdministracaoContent.benefits,
      stepsEyebrow: c.stepsEyebrow || fallbackAdministracaoContent.stepsEyebrow,
      stepsTitle: c.stepsTitle || fallbackAdministracaoContent.stepsTitle,
      stepsSubtitle:
        c.stepsSubtitle || fallbackAdministracaoContent.stepsSubtitle,
      steps:
        Array.isArray(c.steps) && c.steps.length === 5
          ? c.steps
          : fallbackAdministracaoContent.steps,
    };
  } catch {
    return fallbackAdministracaoContent;
  }
}

// ── 3. QUEM SOMOS ───────────────────────────────────────────────────────────
export interface QuemSomosPageContent {
  biographyTitle: string;
  biographyLead: string;
  biographyParagraphs: string[];
  quoteText: string;
  quoteAuthor: string;
}

export const fallbackQuemSomosContent: QuemSomosPageContent = {
  biographyTitle: "Valdete Gonçalves de Melo",
  biographyLead:
    "Meu nome é Valdete Gonçalves de Melo, fundadora da Corretora Val, especialista em Administração de Imóveis, Locação Anual, Temporada e Compra e Venda, com atuação em Balneário Camboriú e Camboriú.",
  biographyParagraphs: [
    "Minha história no mercado imobiliário teve início em 1989, com o convite que abriu a primeira porta para trabalhar na tradicional Imobiliária Gonzaga, em Curitiba. Foi em 1990 que iniciei oficialmente minha trajetória profissional no setor, começando como secretária e, com o tempo, passando a apresentar imóveis, realizar vistorias e intermediar relações entre proprietários e locatários.",
    "A vida me levou por outros caminhos durante muitos anos, mas nunca apagou o sonho de voltar ao mercado imobiliário.",
    "Durante 25 anos, trabalhei como motoboy para sustentar minha família, sempre acreditando que o trabalho honesto abriria novas portas.",
    "Também tive a honra de presidir a AMAE – Associação de Apoio à Criança e ao Adolescente com Mobilidade Reduzida e com Câncer, uma experiência que fortaleceu ainda mais meu compromisso com o cuidado, a responsabilidade e o respeito pelas pessoas.",
    "Em 2019, já em Balneário Camboriú, retornei ao mercado imobiliário e reencontrei a profissão que sempre fez parte da minha essência.",
    "Foi dessa trajetória que nasceu a Corretora Val.",
    "Hoje, atuamos com foco na administração de patrimônios, locação anual, temporada e compra e venda de imóveis, oferecendo um atendimento próximo, transparente e organizado.",
    "Mais do que intermediar negócios, acreditamos em construir relacionamentos duradouros, baseados na confiança e no respeito.",
  ],
  quoteText:
    "Quero agradecer primeiramente por me ajudar a realizar um sonho guardado desde que resolvi caminhar aqui sozinha. Na pandemia fui dispensada do trabalho, sem rumo. A Michely e o Felipe me mostraram que eu era capaz — as palavras deles e o presente da Michely, me presenteando com o curso do CRECI, me fizeram acreditar que sou capaz.",
  quoteAuthor: "— Valdete Gonçalves de Melo · CRECI/SC 56372-F",
};

export async function getQuemSomosPageContent(): Promise<QuemSomosPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "quem-somos" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackQuemSomosContent;
    }
    const c = page.content as Partial<QuemSomosPageContent>;
    return {
      biographyTitle:
        c.biographyTitle || fallbackQuemSomosContent.biographyTitle,
      biographyLead: c.biographyLead || fallbackQuemSomosContent.biographyLead,
      biographyParagraphs:
        Array.isArray(c.biographyParagraphs) && c.biographyParagraphs.length > 0
          ? c.biographyParagraphs
          : fallbackQuemSomosContent.biographyParagraphs,
      quoteText: c.quoteText || fallbackQuemSomosContent.quoteText,
      quoteAuthor: c.quoteAuthor || fallbackQuemSomosContent.quoteAuthor,
    };
  } catch {
    return fallbackQuemSomosContent;
  }
}

// ── 4. MEMÓRIA VIVA ─────────────────────────────────────────────────────────
export interface MemoriaVivaPageContent {
  quoteBannerText: string;
  quoteBannerDescription: string;
}

export const fallbackMemoriaVivaContent: MemoriaVivaPageContent = {
  quoteBannerText: "Cada imóvel carrega uma história. A nossa também.",
  quoteBannerDescription:
    "Preservamos com carinho as amizades e contatos que iniciaram lá nos primeiros anos e continuam confiando no nosso trabalho até os dias de hoje.",
};

export async function getMemoriaVivaPageContent(): Promise<MemoriaVivaPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "memoria-viva" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackMemoriaVivaContent;
    }
    const c = page.content as Partial<MemoriaVivaPageContent>;
    return {
      quoteBannerText:
        c.quoteBannerText || fallbackMemoriaVivaContent.quoteBannerText,
      quoteBannerDescription:
        c.quoteBannerDescription ||
        fallbackMemoriaVivaContent.quoteBannerDescription,
    };
  } catch {
    return fallbackMemoriaVivaContent;
  }
}
