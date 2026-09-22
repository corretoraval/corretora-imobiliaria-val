import { prisma } from "@/lib/prisma";

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    emphasis: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    cardEyebrow: string;
    cardTitle: string;
    cardDescription: string;
    attentionEyebrow: string;
    attentionTitle: string;
  };
  areasTitle: string;
  areas: { title: string; text: string; href: string }[];
};

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

export const fallbackHome: HomeContent = {
  hero: {
    eyebrow: "Balneário Camboriú e Camboriú",
    title: "Confiança que abre portas.",
    emphasis: "abre",
    description:
      "Há mais de três décadas, transformamos imóveis em histórias bem cuidadas — com atendimento humano, gestão responsável e compromisso real com o seu patrimônio.",
    primaryLabel: "Conheça nossos imóveis",
    primaryHref: "/imoveis",
    secondaryLabel: "Administrar meu imóvel",
    secondaryHref: "/administracao",
    cardEyebrow: "Desde 1989",
    cardTitle: "Mais que imóveis, cuidamos de histórias.",
    cardDescription:
      "Uma empresa construída em família, para relações que permanecem muito depois da entrega das chaves.",
    attentionEyebrow: "Atendimento próximo",
    attentionTitle: "Cada chave, um novo começo.",
  },
  areasTitle: "Tudo o que seu imóvel precisa, com o cuidado que você espera.",
  areas: [
    {
      title: "Comprar",
      text: "Oportunidades selecionadas de imóveis para compra com análise documental completa e segurança jurídica.",
      href: "/imoveis",
    },
    {
      title: "Alugar",
      text: "Locação anual transparente, com análise rigorosa e contratos seguros para inquilinos e proprietários.",
      href: "/imoveis",
    },
    {
      title: "Temporada",
      text: "Imóveis exclusivos para desfrutar o litoral de Balneário Camboriú com conforto em cada temporada.",
      href: "/imoveis",
    },
    {
      title: "Administrar",
      text: "Gestão patrimonial dedicada, com vistorias criteriosas, repasses pontuais e suporte completo.",
      href: "/administracao",
    },
  ],
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
  return merge(fallbackHome, await getPageContent("home"));
}

export async function getAdministracaoContent() {
  return merge(fallbackAdministracao, await getPageContent("administracao"));
}

export async function getQuemSomosContent() {
  return merge(fallbackQuemSomos, await getPageContent("quem-somos"));
}

export async function getMemoriaVivaContent() {
  return merge(fallbackMemoriaViva, await getPageContent("memoria-viva"));
}

const fallbackSettings = {
  id: "principal",
  brandName: "Corretora Val",
  tagline: "Confiança que abre portas.",
  phone: "(47) 97400-7301",
  whatsapp: "5547974007301",
  email: "contato@corretoraval.com.br",
  address: "Balneário Camboriú — SC",
  instagramUrl: "https://www.instagram.com/",
  creci: "CRECI/SC 56372-F",
};

export async function getSiteSettings() {
  try {
    return (
      (await prisma.configuracaoSite.findUnique({
        where: { id: "principal" },
      })) ?? fallbackSettings
    );
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
