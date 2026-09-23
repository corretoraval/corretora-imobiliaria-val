type HomeService = {
  key: string;
  title: string;
  text: string;
  href: string;
};

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
  servicesEyebrow: string;
  servicesTitle: string;
  services: HomeService[];
  featuredProperties: {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAllLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyActionLabel: string;
    gridActionLabel: string;
  };
  authority: {
    eyebrow: string;
    title: string;
    subtitle: string;
    founderName: string;
    founderCredential: string;
    badgeLabel: string;
    storyTitle: string;
    storyText: string;
    storyLinkLabel: string;
    storyLinkHref: string;
  };
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export const defaultHomeContent: HomeContent = {
  hero: {
    eyebrow: "Balneário Camboriú e Camboriú",
    title: "Confiança que abre portas.",
    emphasis: "abre",
    description:
      "Com uma trajetória no mercado imobiliário iniciada em 1990, a Corretora Val une experiência, atendimento humano, gestão responsável e compromisso real com o seu patrimônio.",
    primaryLabel: "Conheça nossos imóveis",
    primaryHref: "/imoveis",
    secondaryLabel: "Administrar meu imóvel",
    secondaryHref: "/administracao",
    cardEyebrow: "Desde 1990",
    cardTitle: "Mais que imóveis, cuidamos de histórias.",
    cardDescription:
      "Uma empresa construída em família, para relações que permanecem muito depois da entrega das chaves.",
    attentionEyebrow: "Atendimento próximo",
    attentionTitle: "Cada chave, um novo começo.",
  },
  servicesEyebrow: "Áreas de Atuação",
  servicesTitle:
    "Tudo o que seu imóvel precisa, com o cuidado que você espera.",
  services: [
    {
      key: "comprar",
      title: "Comprar",
      text: "Oportunidades selecionadas de imóveis para compra com análise documental completa e segurança jurídica.",
      href: "/imoveis",
    },
    {
      key: "alugar",
      title: "Alugar",
      text: "Locação anual transparente, com análise rigorosa e contratos seguros para inquilinos e proprietários.",
      href: "/imoveis",
    },
    {
      key: "temporada",
      title: "Temporada",
      text: "Imóveis exclusivos para desfrutar o litoral de Balneário Camboriú com conforto em cada temporada.",
      href: "/imoveis",
    },
    {
      key: "administrar",
      title: "Administrar Imóvel",
      text: "Gestão completa do seu patrimônio com vistorias, prestação de contas e atendimento próximo.",
      href: "/administracao",
    },
  ],
  featuredProperties: {
    eyebrow: "Oportunidades Selecionadas",
    title: "Imóveis em Destaque",
    subtitle:
      "Unidades exclusivas com documentação rigorosa em Balneário Camboriú e Camboriú.",
    viewAllLabel: "Ver todos os imóveis",
    emptyTitle: "Novos destaques em preparação",
    emptyDescription:
      "Estamos selecionando novas oportunidades de alto padrão. Consulte nosso catálogo completo para encontrar seu próximo imóvel.",
    emptyActionLabel: "Explorar Catálogo de Imóveis",
    gridActionLabel: "Ver todos os imóveis",
  },
  authority: {
    eyebrow: "Tradição & Solidez",
    title: "Credibilidade construída com trabalho e presença local",
    subtitle:
      "Estrutura profissional e dedicação para cuidar com excelência do seu patrimônio imobiliário.",
    founderName: "Valdete Gonçalves de Melo",
    founderCredential: "CRECI/SC 56372-F",
    badgeLabel: "Fundadora da Corretora Val",
    storyTitle: "Uma trajetória guiada pela confiança",
    storyText:
      "Com uma trajetória no mercado imobiliário iniciada em 1990, a Corretora Val une experiência, atendimento humano, gestão responsável e compromisso real com o seu patrimônio. O primeiro convite havia acontecido em 1989, abrindo as portas para a profissão em Curitiba; o início oficial da carreira veio em 1990, uma sólida trajetória foi construída com trabalho, superação e compromisso ético. Hoje, à frente da Corretora Val em Balneário Camboriú e Camboriú, unimos experiência e gestão familiar para transformar cada negociação em uma relação de confiança e cuidado real.",
    storyLinkLabel: "Conheça minha história",
    storyLinkHref: "/autoridade",
  },
  cta: {
    title: "Confiança que abre portas para o seu patrimônio.",
    description:
      "Fale diretamente com a Corretora Val para compra, administração, locação anual ou temporada em Balneário Camboriú e região.",
    primaryLabel: "Falar pelo WhatsApp",
    secondaryLabel: "Ver Nossos Imóveis",
    secondaryHref: "/imoveis",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeValue<T>(fallback: T, value: unknown): T {
  if (!isRecord(fallback) || !isRecord(value)) return fallback;
  const result = { ...fallback } as Record<string, unknown>;
  for (const key of Object.keys(fallback)) {
    const candidate = value[key];
    if (candidate === undefined || candidate === null) continue;
    const defaultValue = fallback[key as keyof T];
    if (Array.isArray(defaultValue)) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        result[key] = candidate;
      }
    } else if (isRecord(defaultValue)) {
      result[key] = mergeValue(defaultValue, candidate);
    } else if (typeof candidate === typeof defaultValue) {
      result[key] = candidate;
    }
  }
  return result as T;
}

export function normalizeHomeContent(raw: unknown): HomeContent {
  if (!isRecord(raw)) return defaultHomeContent;
  const hero = isRecord(raw.hero) ? raw.hero : {};
  const canonicalHero = { ...hero };
  if (canonicalHero.description === undefined)
    canonicalHero.description = hero.text;
  if (canonicalHero.primaryLabel === undefined)
    canonicalHero.primaryLabel = hero.primaryCtaText;
  if (canonicalHero.primaryHref === undefined)
    canonicalHero.primaryHref = hero.primaryCtaHref;
  if (canonicalHero.secondaryLabel === undefined)
    canonicalHero.secondaryLabel = hero.secondaryCtaText;
  if (canonicalHero.secondaryHref === undefined)
    canonicalHero.secondaryHref = hero.secondaryCtaHref;
  if (canonicalHero.cardDescription === undefined)
    canonicalHero.cardDescription = hero.cardText;
  const rawServices = Array.isArray(raw.services) ? raw.services : null;
  const services = rawServices
    ? defaultHomeContent.services.map((service, index) =>
        mergeValue(service, rawServices[index]),
      )
    : undefined;
  const normalized = {
    ...raw,
    servicesTitle: raw.servicesTitle ?? raw.areasTitle,
    hero: canonicalHero,
    services,
  };
  return mergeValue(defaultHomeContent, normalized);
}

export function splitHighlightedText(title: string, emphasis: string) {
  if (!emphasis) return { before: title, highlighted: "", after: "" };
  const start = title.indexOf(emphasis);
  if (start < 0) return { before: title, highlighted: "", after: "" };
  return {
    before: title.slice(0, start),
    highlighted: title.slice(start, start + emphasis.length),
    after: title.slice(start + emphasis.length),
  };
}
