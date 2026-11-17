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
  email: null as string | null,
  contactEmail: null as string | null, // e-mail interno que recebe os formulários
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

export async function getPageSeo(slug: string) {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug },
      select: { seoTitle: true, seoDescription: true },
    });

    return {
      title: page?.seoTitle?.trim() || null,
      description: page?.seoDescription?.trim() || null,
    };
  } catch {
    return { title: null, description: null };
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

// ── 5. ALUGUEL ANUAL ─────────────────────────────────────────────────────────
export interface AluguelAnualPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  sectionEyebrow: string;
  sectionTitle: string;
  intro: string;
  card1Title: string;
  card1Text: string;
  card2Title: string;
  card2Text: string;
  card3Title: string;
  card3Text: string;
  textSectionTitle: string;
  textParagraph1: string;
  textParagraph2: string;
  textParagraph3: string;
  listingsEyebrow: string;
  listingsTitle: string;
  listingsSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}

export const fallbackAluguelAnualContent: AluguelAnualPageContent = {
  heroEyebrow: "LOCAÇÃO ANUAL RESIDENCIAL & COMERCIAL",
  heroTitle:
    "Aluguel Anual em Balneário Camboriú e Camboriú com Segurança Jurídica",
  heroSubtitle:
    "Encontre o imóvel ideal para morar ou estabelecer seu negócio no litoral catarinense com contratos estruturados, vistoria fotográfica minuciosa e atendimento dedicado.",
  sectionEyebrow: "Mercado de Locação Local",
  sectionTitle:
    "Como Funciona o Aluguel Anual em Balneário Camboriú e Região",
  intro:
    "Morar em Balneário Camboriú ou em Camboriú é o objetivo de muitas famílias e profissionais atraídos pela excepcional qualidade de vida, segurança pública de ponta, infraestrutura completa e praias deslumbrantes. No entanto, o mercado de aluguel anual na região possui características muito particulares que exigem acompanhamento profissional experiente para garantir negócios tranquilos e juridicamente equilibrados.",
  card1Title: "Garantias Seguras",
  card1Text:
    "Análise ágil e desburocratizada com modalidades aceitas: caução, seguro fiança, fiador idôneo ou título de capitalização.",
  card2Title: "Contratos Claros",
  card2Text:
    "Instrumentos contratuais rigorosamente alinhados à Lei do Inquilinato (Lei nº 8.245/1991), resguardando locador e locatário.",
  card3Title: "Vistoria Fotográfica",
  card3Text:
    "Relatório minucioso de entrada e saída com fotos em alta resolução, prevenindo qualquer atrito ao término do contrato.",
  textSectionTitle: "Principais Bairros para Locação Anual",
  textParagraph1:
    "A escolha da localização ideal depende do estilo de vida e do orçamento de cada locatário. Em Balneário Camboriú, o Centro oferece comodidade total para fazer tudo a pé, ficando próximo a bancos, supermercados, colégios e à praia. Os bairros Pioneiros e Barra Sul são procurados por quem valoriza tranquilidade e alta sofisticação. Já os bairros Nações e Municípios oferecem excelentes opções residenciais com ótimo custo-benefício.",
  textParagraph2:
    "Em Camboriú, bairros como o Centro, Santa Regina e Tabuleiros combinam proximidade imediata com Balneário Camboriú, facilidade de deslocamento e valores de locação bastante atrativos para apartamentos novos e casas em condomínio.",
  textParagraph3:
    "Com mais de 35 anos de vivência no setor imobiliário e registro CRECI/SC 56372-F, a Corretora Valdete Gonçalves de Melo presta assessoria humanizada, esclarecendo todas as dúvidas sobre taxas condominiais, IPTU, consumo individualizado e transferência de titularidade de serviços essenciais.",
  listingsEyebrow: "Oportunidades de Locação",
  listingsTitle: "Imóveis Disponíveis para Aluguel Anual",
  listingsSubtitle:
    "Confira opções selecionadas em Balneário Camboriú e Camboriú prontas para morar.",
  ctaTitle: "Quer alugar seu imóvel ou procura um novo lar?",
  ctaDescription:
    "Fale diretamente com a Corretora Val e tenha orientação sob medida para seu contrato de locação anual.",
  ctaPrimaryLabel: "Falar pelo WhatsApp",
  ctaSecondaryLabel: "Ver mais imóveis",
};

export async function getAluguelAnualPageContent(): Promise<AluguelAnualPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "aluguel-anual-balneario-camboriu" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackAluguelAnualContent;
    }
    const c = page.content as Partial<AluguelAnualPageContent>;
    const f = fallbackAluguelAnualContent;
    return {
      heroEyebrow: c.heroEyebrow || f.heroEyebrow,
      heroTitle: c.heroTitle || f.heroTitle,
      heroSubtitle: c.heroSubtitle || f.heroSubtitle,
      sectionEyebrow: c.sectionEyebrow || f.sectionEyebrow,
      sectionTitle: c.sectionTitle || f.sectionTitle,
      intro: c.intro || f.intro,
      card1Title: c.card1Title || f.card1Title,
      card1Text: c.card1Text || f.card1Text,
      card2Title: c.card2Title || f.card2Title,
      card2Text: c.card2Text || f.card2Text,
      card3Title: c.card3Title || f.card3Title,
      card3Text: c.card3Text || f.card3Text,
      textSectionTitle: c.textSectionTitle || f.textSectionTitle,
      textParagraph1: c.textParagraph1 || f.textParagraph1,
      textParagraph2: c.textParagraph2 || f.textParagraph2,
      textParagraph3: c.textParagraph3 || f.textParagraph3,
      listingsEyebrow: c.listingsEyebrow || f.listingsEyebrow,
      listingsTitle: c.listingsTitle || f.listingsTitle,
      listingsSubtitle: c.listingsSubtitle || f.listingsSubtitle,
      ctaTitle: c.ctaTitle || f.ctaTitle,
      ctaDescription: c.ctaDescription || f.ctaDescription,
      ctaPrimaryLabel: c.ctaPrimaryLabel || f.ctaPrimaryLabel,
      ctaSecondaryLabel: c.ctaSecondaryLabel || f.ctaSecondaryLabel,
    };
  } catch {
    return fallbackAluguelAnualContent;
  }
}

// ── 6. TEMPORADA ─────────────────────────────────────────────────────────────
export interface TemporadaPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  sectionEyebrow: string;
  sectionTitle: string;
  intro: string;
  card1Title: string;
  card1Text: string;
  card2Title: string;
  card2Text: string;
  card3Title: string;
  card3Text: string;
  textSectionTitle: string;
  textParagraph1: string;
  textParagraph2: string;
  textParagraph3: string;
  listingsEyebrow: string;
  listingsTitle: string;
  listingsSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}

export const fallbackTemporadaContent: TemporadaPageContent = {
  heroEyebrow: "LOCAÇÃO DE TEMPORADA & FÉRIAS",
  heroTitle: "Aluguel por Temporada em Balneário Camboriú e Camboriú",
  heroSubtitle:
    "Viva momentos inesquecíveis no litoral de Santa Catarina com imóveis mobiliados, climatizados e estrategicamente localizados para o seu descanso e lazer.",
  sectionEyebrow: "Férias no Litoral Catarinense",
  sectionTitle: "Por que Alugar por Temporada com a Corretora Val?",
  intro:
    "Conhecida como a Capital Catarinense do Turismo, Balneário Camboriú atrai milhares de visitantes todos os anos durante o verão, feriados prolongados e finais de semana. A cidade conta com atrações famosas internacionalmente, como a orla revitalizada da Praia Central, a moderna FG Big Wheel, o Parque Unipraias com bondinhos aéreos e uma vida noturna e gastronômica inigualável.",
  card1Title: "Localização Privilegiada",
  card1Text:
    "Opções frente mar, quadra mar e a poucos metros da praia nos melhores pontos da Avenida Atlântica e Avenida Brasil.",
  card2Title: "Totalmente Equipados",
  card2Text:
    "Imóveis com ar-condicionado, Wi-Fi de alta velocidade, cozinha completa, churrasqueira e vaga de garagem privativa.",
  card3Title: "Check-in Seguro",
  card3Text:
    "Entrega de chaves organizada, contrato de locação por temporada formalizado e assistência próxima durante todo o período.",
  textSectionTitle:
    "Imóveis para Famílias e Grupos em Balneário Camboriú e Camboriú",
  textParagraph1:
    "Ao planejar suas férias, evitar intermediários desconhecidos e garantir que o imóvel reservado condiz exatamente com as fotos é fundamental. A Corretora Val (CRECI/SC 56372-F) seleciona pessoalmente cada imóvel para temporada, certificando-se de que a estrutura esteja impecável para receber famílias com crianças, casais e pequenos grupos de amigos.",
  textParagraph2:
    "Além de Balneário Camboriú, o município vizinho de Camboriú desponta como excelente alternativa de hospedagem, proporcionando tranquilidade no interior verde, imóveis amplos para grandes famílias e acesso rápido às praias em poucos minutos de carro.",
  textParagraph3:
    "Nossa equipe orienta você na escolha do número ideal de dormitórios, capacidade máxima de hóspedes, proximidade com supermercados e farmácias, garantindo férias livres de imprevistos e com o aconchego que sua família merece.",
  listingsEyebrow: "Seleção de Férias",
  listingsTitle: "Imóveis Disponíveis para Temporada",
  listingsSubtitle:
    "Consulte diárias e pacotes especiais de verão, réveillon e feriados.",
  ctaTitle: "Planejando suas férias em Balneário Camboriú?",
  ctaDescription:
    "Entre em contato com a Corretora Val e reserve seu imóvel de temporada com total antecedência e segurança.",
  ctaPrimaryLabel: "Reservar pelo WhatsApp",
  ctaSecondaryLabel: "Ver mais imóveis",
};

export async function getTemporadaPageContent(): Promise<TemporadaPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "temporada-balneario-camboriu" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackTemporadaContent;
    }
    const c = page.content as Partial<TemporadaPageContent>;
    const f = fallbackTemporadaContent;
    return {
      heroEyebrow: c.heroEyebrow || f.heroEyebrow,
      heroTitle: c.heroTitle || f.heroTitle,
      heroSubtitle: c.heroSubtitle || f.heroSubtitle,
      sectionEyebrow: c.sectionEyebrow || f.sectionEyebrow,
      sectionTitle: c.sectionTitle || f.sectionTitle,
      intro: c.intro || f.intro,
      card1Title: c.card1Title || f.card1Title,
      card1Text: c.card1Text || f.card1Text,
      card2Title: c.card2Title || f.card2Title,
      card2Text: c.card2Text || f.card2Text,
      card3Title: c.card3Title || f.card3Title,
      card3Text: c.card3Text || f.card3Text,
      textSectionTitle: c.textSectionTitle || f.textSectionTitle,
      textParagraph1: c.textParagraph1 || f.textParagraph1,
      textParagraph2: c.textParagraph2 || f.textParagraph2,
      textParagraph3: c.textParagraph3 || f.textParagraph3,
      listingsEyebrow: c.listingsEyebrow || f.listingsEyebrow,
      listingsTitle: c.listingsTitle || f.listingsTitle,
      listingsSubtitle: c.listingsSubtitle || f.listingsSubtitle,
      ctaTitle: c.ctaTitle || f.ctaTitle,
      ctaDescription: c.ctaDescription || f.ctaDescription,
      ctaPrimaryLabel: c.ctaPrimaryLabel || f.ctaPrimaryLabel,
      ctaSecondaryLabel: c.ctaSecondaryLabel || f.ctaSecondaryLabel,
    };
  } catch {
    return fallbackTemporadaContent;
  }
}

// ── 7. COMPRAR IMÓVEIS ───────────────────────────────────────────────────────
export interface ComprarImoveisPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  sectionEyebrow: string;
  sectionTitle: string;
  intro: string;
  card1Title: string;
  card1Text: string;
  card2Title: string;
  card2Text: string;
  card3Title: string;
  card3Text: string;
  textSectionTitle: string;
  textParagraph1: string;
  textParagraph2: string;
  listingsEyebrow: string;
  listingsTitle: string;
  listingsSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
}

export const fallbackComprarImoveisContent: ComprarImoveisPageContent = {
  heroEyebrow: "COMPRA & VENDA DE IMÓVEIS",
  heroTitle: "Comprar Imóveis em Balneário Camboriú e Camboriú",
  heroSubtitle:
    "Invista no metro quadrado mais valorizado do Brasil com total segurança jurídica, suporte documental minucioso e orientação de quem atua no mercado desde 1990.",
  sectionEyebrow: "Investimento Seguro",
  sectionTitle: "O Mercado Imobiliário de Balneário Camboriú e Camboriú",
  intro:
    "Balneário Camboriú consolidou-se como o polo de maior valorização imobiliária do Brasil, atraindo investidores e famílias em busca de rentabilidade sólida, solidez patrimonial e qualidade de vida incomparável. Com arranha-céus imponentes, praias limpas, segurança de primeiro mundo e índice elevado de desenvolvimento humano (IDH), adquirir um imóvel na região é uma decisão estratégica de preservação e crescimento de capital.",
  card1Title: "Alta Valorização",
  card1Text:
    "Histórico consistente de valorização do metro quadrado acima da média nacional e excelente liquidez para revenda e locação.",
  card2Title: "Due Diligence Completa",
  card2Text:
    "Auditoria jurídica rigorosa: checagem de certidões cíveis, fiscais, trabalhistas, matrícula e ônus reais antes de qualquer sinal.",
  card3Title: "Escritura & Financiamento",
  card3Text:
    "Acompanhamento integral desde a proposta de compra até a assinatura da escritura pública definitiva e registro imobiliário.",
  textSectionTitle: "Opções em Balneário Camboriú e Camboriú para Cada Perfil",
  textParagraph1:
    "Nosso portfólio contempla desde estúdios e apartamentos compactos para geração de renda por aluguel até suntuosos apartamentos de 3 a 5 suítes frente ao mar na Barra Sul, Centro e Pioneiros. Para quem busca condomínios horizontais com amplo espaço, jardins e contato direto com a natureza, Camboriú apresenta condomínios fechados e bairros planejados com excelente relação custo por metro quadrado.",
  textParagraph2:
    "A corretora Valdete Gonçalves de Melo (CRECI/SC 56372-F) atua com ética e discrição absoluta, intermediando negociações diretas com proprietários e construtoras renomadas. Seja para pagamento à vista, parcelamento direto com a construtora ou financiamento bancário com as melhores taxas do mercado, oferecemos assessoria personalizada em cada etapa.",
  listingsEyebrow: "Oportunidades de Compra",
  listingsTitle: "Imóveis Selecionados à Venda",
  listingsSubtitle:
    "Confira apartamentos, casas e coberturas disponíveis para compra imediata.",
  ctaTitle: "Quer comprar ou vender seu imóvel no litoral?",
  ctaDescription:
    "Fale diretamente com a Corretora Val e descubra as melhores opções com segurança jurídica total.",
  ctaPrimaryLabel: "Falar com a Corretora",
  ctaSecondaryLabel: "Ver mais imóveis",
};

export async function getComprarImoveisPageContent(): Promise<ComprarImoveisPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "comprar-imoveis-balneario-camboriu" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackComprarImoveisContent;
    }
    const c = page.content as Partial<ComprarImoveisPageContent>;
    const f = fallbackComprarImoveisContent;
    return {
      heroEyebrow: c.heroEyebrow || f.heroEyebrow,
      heroTitle: c.heroTitle || f.heroTitle,
      heroSubtitle: c.heroSubtitle || f.heroSubtitle,
      sectionEyebrow: c.sectionEyebrow || f.sectionEyebrow,
      sectionTitle: c.sectionTitle || f.sectionTitle,
      intro: c.intro || f.intro,
      card1Title: c.card1Title || f.card1Title,
      card1Text: c.card1Text || f.card1Text,
      card2Title: c.card2Title || f.card2Title,
      card2Text: c.card2Text || f.card2Text,
      card3Title: c.card3Title || f.card3Title,
      card3Text: c.card3Text || f.card3Text,
      textSectionTitle: c.textSectionTitle || f.textSectionTitle,
      textParagraph1: c.textParagraph1 || f.textParagraph1,
      textParagraph2: c.textParagraph2 || f.textParagraph2,
      listingsEyebrow: c.listingsEyebrow || f.listingsEyebrow,
      listingsTitle: c.listingsTitle || f.listingsTitle,
      listingsSubtitle: c.listingsSubtitle || f.listingsSubtitle,
      ctaTitle: c.ctaTitle || f.ctaTitle,
      ctaDescription: c.ctaDescription || f.ctaDescription,
      ctaPrimaryLabel: c.ctaPrimaryLabel || f.ctaPrimaryLabel,
      ctaSecondaryLabel: c.ctaSecondaryLabel || f.ctaSecondaryLabel,
    };
  } catch {
    return fallbackComprarImoveisContent;
  }
}

// ── 8. ADMINISTRAÇÃO DE IMÓVEIS (LANDING PAGE) ───────────────────────────────
export interface AdminImoveisLandingPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  sectionEyebrow: string;
  sectionTitle: string;
  intro: string;
  intro2: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  pillar4Title: string;
  pillar4Desc: string;
  pillar5Title: string;
  pillar5Desc: string;
  pillar6Title: string;
  pillar6Desc: string;
  flowTitle: string;
  flowParagraph1: string;
  flowParagraph2: string;
  formEyebrow: string;
  formTitle: string;
  formSubtitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export const fallbackAdminImoveisLandingContent: AdminImoveisLandingPageContent =
  {
    heroEyebrow: "GESTÃO PATRIMONIAL DEDICADA",
    heroTitle: "Administração de Imóveis em Balneário Camboriú",
    heroSubtitle:
      "Deixe a gestão do seu imóvel nas mãos de quem atua no mercado catarinense desde 1990. Rentabilidade justa, inquilinos qualificados e zero dor de cabeça para o proprietário.",
    sectionEyebrow: "Tranquilidade para Proprietários",
    sectionTitle:
      "Por que Confiar a Gestão do seu Imóvel à Corretora Val?",
    intro:
      "Possuir um imóvel em Balneário Camboriú ou em Camboriú é um dos investimentos mais rentáveis e seguros do país. No entanto, lidar diretamente com inquilinos, cobranças em atraso, orçamentos abusivos de manutenção, vistorias incompletas e redação de contratos sem assessoria jurídica pode transformar uma fonte de renda em fonte constante de preocupação.",
    intro2:
      "A administração de imóveis da Corretora Val foi desenvolvida justamente para proteger o patrimônio da sua família. Com registro profissional CRECI/SC 56372-F, Valdete Gonçalves de Melo une mais de três décadas de experiência no setor imobiliário a uma postura de integridade, acompanhando pessoalmente cada imóvel sob sua gestão.",
    pillar1Title: "Seleção Criteriosa de Inquilinos",
    pillar1Desc:
      "Análise aprofundada de histórico financeiro, capacidade de pagamento, certidões negativas e checagem minuciosa de garantias locatícias.",
    pillar2Title: "Vistorias Detalhadas com Laudo",
    pillar2Desc:
      "Vistoria inicial e final com fotos de alta qualidade e memorial descritivo completo para preservar o patrimônio exatamente como foi entregue.",
    pillar3Title: "Cobrança Rigorosa e Repasse Pontual",
    pillar3Desc:
      "Controle financeiro automatizado, emissão pontual de boletos, gestão de encargos (IPTU, condomínio, taxa de lixo) e repasse sem atrasos.",
    pillar4Title: "Gestão Ativa de Manutenções",
    pillar4Desc:
      "Rede de profissionais parceiros de confiança (elétrica, hidráulica, pintura) para orçamentos justos e reparos rápidos sob aprovação do proprietário.",
    pillar5Title: "Segurança Jurídica Integral",
    pillar5Desc:
      "Contratos personalizados sob a égide da Lei do Inquilinato (Lei nº 8.245/91), garantindo respaldo em eventuais cobranças ou reajustes anuais pelo índice pactuado.",
    pillar6Title: "Atendimento Direto e Humanizado",
    pillar6Desc:
      "Canal direto com a corretora responsável, sem filas ou robôs impessoais. Relatórios transparentes e acompanhamento em tempo real.",
    flowTitle: "Fluxo Transparente da Administração de Imóveis",
    flowParagraph1:
      "Nosso processo é estruturado em etapas claras: realizamos a avaliação mercadológica do valor de locação com base em dados reais de Balneário Camboriú, providenciamos fotos profissionais, anunciamos nos canais de maior relevância e filtramos os interessados com rigor.",
    flowParagraph2:
      "Após a aprovação cadastral, redigimos o contrato com todas as cláusulas protetivas, lavramos o laudo de vistoria com dezenas de registros fotográficos e passamos a monitorar os pagamentos e repasses mensais. Quando o contrato se encerra, executamos a conferência minuciosa de saída para que o imóvel seja entregue em perfeito estado de conservação.",
    formEyebrow: "Cadastre seu Imóvel",
    formTitle: "Quer que cuidemos do seu imóvel?",
    formSubtitle:
      "Preencha os dados abaixo e entraremos em contato diretamente com uma avaliação personalizada.",
    ctaTitle: "Deseja conversar sobre a administração do seu imóvel?",
    ctaDescription:
      "Fale diretamente com a Corretora Val por WhatsApp e receba uma orientação sem compromisso.",
    ctaPrimaryLabel: "Conversar no WhatsApp",
    ctaSecondaryLabel: "Conhecer nossa história",
    ctaSecondaryHref: "/quem-somos",
  };

export async function getAdminImoveisLandingPageContent(): Promise<AdminImoveisLandingPageContent> {
  try {
    const page = await prisma.paginaSite.findUnique({
      where: { slug: "administracao-imoveis-balneario-camboriu" },
    });
    if (!page?.content || typeof page.content !== "object") {
      return fallbackAdminImoveisLandingContent;
    }
    const c = page.content as Partial<AdminImoveisLandingPageContent>;
    const f = fallbackAdminImoveisLandingContent;
    return {
      heroEyebrow: c.heroEyebrow || f.heroEyebrow,
      heroTitle: c.heroTitle || f.heroTitle,
      heroSubtitle: c.heroSubtitle || f.heroSubtitle,
      sectionEyebrow: c.sectionEyebrow || f.sectionEyebrow,
      sectionTitle: c.sectionTitle || f.sectionTitle,
      intro: c.intro || f.intro,
      intro2: c.intro2 || f.intro2,
      pillar1Title: c.pillar1Title || f.pillar1Title,
      pillar1Desc: c.pillar1Desc || f.pillar1Desc,
      pillar2Title: c.pillar2Title || f.pillar2Title,
      pillar2Desc: c.pillar2Desc || f.pillar2Desc,
      pillar3Title: c.pillar3Title || f.pillar3Title,
      pillar3Desc: c.pillar3Desc || f.pillar3Desc,
      pillar4Title: c.pillar4Title || f.pillar4Title,
      pillar4Desc: c.pillar4Desc || f.pillar4Desc,
      pillar5Title: c.pillar5Title || f.pillar5Title,
      pillar5Desc: c.pillar5Desc || f.pillar5Desc,
      pillar6Title: c.pillar6Title || f.pillar6Title,
      pillar6Desc: c.pillar6Desc || f.pillar6Desc,
      flowTitle: c.flowTitle || f.flowTitle,
      flowParagraph1: c.flowParagraph1 || f.flowParagraph1,
      flowParagraph2: c.flowParagraph2 || f.flowParagraph2,
      formEyebrow: c.formEyebrow || f.formEyebrow,
      formTitle: c.formTitle || f.formTitle,
      formSubtitle: c.formSubtitle || f.formSubtitle,
      ctaTitle: c.ctaTitle || f.ctaTitle,
      ctaDescription: c.ctaDescription || f.ctaDescription,
      ctaPrimaryLabel: c.ctaPrimaryLabel || f.ctaPrimaryLabel,
      ctaSecondaryLabel: c.ctaSecondaryLabel || f.ctaSecondaryLabel,
      ctaSecondaryHref: c.ctaSecondaryHref || f.ctaSecondaryHref,
    };
  } catch {
    return fallbackAdminImoveisLandingContent;
  }
}
