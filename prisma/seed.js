const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const properties = [
  {
    code: "VAL-001",
    slug: "apartamento-praia-central",
    title: "Apartamento na Praia Central",
    summary: "Vista para o mar em localização privilegiada.",
    description: "Apartamento amplo, bem iluminado e próximo à praia.",
    propertyType: "Apartamento",
    purpose: "VENDA",
    city: "Balneário Camboriú",
    neighborhood: "Centro",
    salePrice: 1250000,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 2,
    privateArea: 110,
    hasBalcony: true,
    hasBarbecue: true,
    seaView: true,
    isFeatured: true,
    markers: ["DESTAQUE", "ALTO_PADRAO"],
  },
  {
    code: "VAL-002",
    slug: "casa-jardim-camboriu",
    title: "Casa em Camboriú - Jardim",
    summary: "Uma casa confortável para viver com tranquilidade.",
    description: "Casa com ótima localização e espaço para a família.",
    propertyType: "Casa",
    purpose: "VENDA",
    city: "Camboriú",
    neighborhood: "Centro",
    salePrice: 850000,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    privateArea: 140,
    allowsPets: true,
    isFeatured: true,
    markers: ["OPORTUNIDADE", "PET_FRIENDLY"],
  },
  {
    code: "VAL-003",
    slug: "cobertura-vista-mar",
    title: "Cobertura vista mar",
    summary: "Cobertura duplex com vista aberta para o mar.",
    description: "Ambientes integrados e localização frente mar.",
    propertyType: "Cobertura",
    purpose: "VENDA",
    city: "Balneário Camboriú",
    neighborhood: "Barra Sul",
    salePrice: 3200000,
    bedrooms: 4,
    suites: 2,
    bathrooms: 4,
    parkingSpaces: 3,
    privateArea: 220,
    hasPool: true,
    oceanFront: true,
    seaView: true,
    isFeatured: true,
    markers: ["DESTAQUE", "ALTO_PADRAO", "FRENTE_MAR"],
  },
];

const pages = [
  {
    slug: "home",
    navigationLabel: "Início",
    eyebrow: "Balneário Camboriú e Camboriú",
    title: "Confiança que abre portas.",
    heading: "Tudo o que seu imóvel precisa, com o cuidado que você espera.",
    intro:
      "Com uma trajetória no mercado imobiliário iniciada em 1990, a Corretora Val une experiência, atendimento humano, gestão responsável e compromisso real com o seu patrimônio.",
    body: "Uma empresa construída em família, para relações que permanecem muito depois da entrega das chaves.",
    ctaLabel: "Conheça nossos imóveis",
    ctaHref: "/imoveis",
    seoTitle: "Corretora Val | Confiança que abre portas",
    seoDescription:
      "Administração de imóveis, venda, locação anual e temporada em Balneário Camboriú e Camboriú.",
    sortOrder: 0,
  },
  {
    slug: "administracao",
    navigationLabel: "Administração",
    eyebrow: "Patrimônio bem cuidado",
    title: "Administração de imóveis",
    heading: "Cuidamos do seu patrimônio com atenção e transparência.",
    intro:
      "Conte com uma gestão próxima, organizada e preparada para acompanhar cada detalhe do seu imóvel.",
    body: "Fale com a Corretora Val para apresentar seu imóvel e entender a melhor forma de administrá-lo.",
    ctaLabel: "Administrar meu imóvel",
    ctaHref: "/contato",
    sortOrder: 1,
  },
  {
    slug: "quem-somos",
    navigationLabel: "Quem Somos",
    eyebrow: "Desde 1990",
    title: "Quem somos",
    heading: "Experiência regional, relações duradouras e atendimento humano.",
    intro:
      "A Corretora Val nasceu para cuidar de imóveis e das histórias que eles abrigam.",
    body: "Nossa trajetória é construída em família, com conhecimento de Balneário Camboriú, Camboriú e região.",
    ctaLabel: "Fale conosco",
    ctaHref: "/contato",
    sortOrder: 2,
  },
  {
    slug: "autoridade",
    navigationLabel: "Autoridade",
    eyebrow: "Confiança e experiência",
    title: "Autoridade",
    heading: "Conhecimento imobiliário para decisões mais seguras.",
    intro:
      "Atendimento personalizado, atuação local e compromisso com negociações transparentes.",
    body: "CRECI/SC 56372-F. Conteúdo, orientação e experiência para cada etapa da sua decisão imobiliária.",
    ctaLabel: "Conheça nossos imóveis",
    ctaHref: "/imoveis",
    sortOrder: 3,
  },
  {
    slug: "memoria-viva",
    navigationLabel: "Memória Viva",
    eyebrow: "Nossa história",
    title: "Memória Viva",
    heading: "Histórias, encontros e o legado da Corretora Val.",
    intro:
      "Um espaço para compartilhar os capítulos que construíram nossa relação com a região.",
    body: "Fotos, bastidores e memórias que preservam a nossa trajetória e os vínculos com cada cliente.",
    sortOrder: 4,
  },
  {
    slug: "blog",
    navigationLabel: "Blog",
    eyebrow: "Conteúdo imobiliário",
    title: "Blog",
    heading: "Informação para orientar sua próxima escolha.",
    intro:
      "Dicas, mercado, administração e conteúdos sobre viver e investir na nossa região.",
    body: "Em breve, artigos assinados pela Corretora Val.",
    sortOrder: 5,
  },
  {
    slug: "depoimentos",
    navigationLabel: "Depoimentos",
    eyebrow: "Relações de confiança",
    title: "Depoimentos",
    heading: "Cada experiência autorizada conta um pouco da nossa história.",
    intro: "Publicamos relatos de clientes somente com autorização.",
    body: "Em breve, histórias compartilhadas por quem confiou seu imóvel e seus projetos à Corretora Val.",
    sortOrder: 6,
  },
  {
    slug: "contato",
    navigationLabel: "Contato",
    eyebrow: "Vamos conversar",
    title: "Contato",
    heading: "Encontre a orientação certa para o seu imóvel.",
    intro: "Fale com a Corretora Val por WhatsApp, telefone ou e-mail.",
    body: "Estamos em Balneário Camboriú e atendemos também Camboriú e região.",
    ctaLabel: "Falar pelo WhatsApp",
    ctaHref: "https://wa.me/5547974007391",
    sortOrder: 7,
  },
];

const posts = [
  {
    slug: "guia-de-investimento-imobiliario-balneario-camboriu",
    title: "Guia de Investimento Imobiliário em Balneário Camboriú para 2026",
    summary:
      "Descubra por que a cidade possui um dos metros quadrados mais valorizados do Brasil e como escolher a melhor oportunidade.",
    category: "Investimentos",
    authorName: "Corretora Val",
    readingTimeMinutes: 6,
    isFeatured: true,
    coverImage: "/uploads/investimento-bc.jpg",
    content: `Balneário Camboriú continua se consolidando como o polo imobiliário de maior liquidez e valorização do litoral catarinense. Para investidores que buscam segurança patrimonial e rentabilidade acima da média nacional, a cidade oferece um ecossistema único.

### 1. Valorização Histórica
Nos últimos cinco anos, imóveis na quadra mar e frente mar registraram valorizações anuais consistentes. A infraestrutura urbana moderna, aliada aos investimentos públicos em alargamento da faixa de areia e saneamento, atrai investidores de todo o país.

### 2. Rentabilidade com Locação de Temporada
Imóveis bem localizados em Balneário Camboriú apresentam altíssima taxa de ocupação nos meses de alta temporada (novembro a março), garantindo um yield anual atrativo para quem busca renda passiva.

### 3. Como Escolher a Melhor Oportunidade
Ao analisar um imóvel para investimento na região, considere:
- **Localização:** Imóveis na Barra Sul e Centro possuem demanda perene.
- **Tipologia:** Apartamentos de 2 e 3 suítes com vaga privativa têm a maior liquidez de revenda.
- **Documentação:** Garantir que o imóvel esteja 100% regularizado com matrícula individualizada.`,
    seoTitle:
      "Investimento Imobiliário em Balneário Camboriú (2026) | Corretora Val",
    seoDescription:
      "Guia completo de investimento e valorização imobiliária em Balneário Camboriú com a experiência da Corretora Val.",
  },
  {
    slug: "dicas-para-preparar-seu-imovel-para-locacao-anual",
    title: "5 Dicas Essenciais para Preparar seu Imóvel para Locação Anual",
    summary:
      "Aumente a atratividade do seu patrimônio e garanta bons inquilinos com pequenas adequações estratégicas.",
    category: "Alugar",
    authorName: "Corretora Val",
    readingTimeMinutes: 4,
    isFeatured: false,
    coverImage: "/uploads/preparar-imovel.jpg",
    content: `Alugar um imóvel com agilidade e valor justo exige preparação prévia. Inquilinos qualificados buscam unidades bem conservadas, funcionais e com documentação transparente.

### 1. Revisão Hidráulica e Elétrica
Antes de anunciar, certifique-se de que torneiras, chuveiros, tomadas e disjuntores estejam operando perfeitamente. Pequenos reparos evitam desgastes no início do contrato.

### 2. Pintura Neutra e Iluminação
Paredes pintadas com cores neutras (off-white ou bege claro) ampliam visualmente os ambientes e agradam a todos os perfis de moradores.

### 3. Gestão Profissional de Imóveis
Contar com uma administração imobiliária experiente garante vistoria detalhada de entrada e saída, análise rigorosa de crédito e segurança no recebimento dos aluguéis.`,
    seoTitle: "Como Preparar seu Imóvel para Locação Anual | Corretora Val",
    seoDescription:
      "Dicas práticas da Corretora Val para valorizar seu imóvel e conquistar os melhores inquilinos em Balneário Camboriú.",
  },
  {
    slug: "morar-em-camboriu-qualidade-de-vida-e-tranquilidade",
    title:
      "Morar em Camboriú: Qualidade de Vida, Natureza e Proximidade do Mar",
    summary:
      "Conheça as vantagens de residir na cidade vizinha a Balneário Camboriú, combinando tranquilidade e excelente custo-benefício.",
    category: "Comprar",
    authorName: "Corretora Val",
    readingTimeMinutes: 5,
    isFeatured: false,
    coverImage: "/uploads/morar-camboriu.jpg",
    content: `Camboriú vem se destacando como uma excelente alternativa para famílias que desejam espaço, tranquilidade e custos de moradia mais acessíveis, sem abrir mão da proximidade de Balneário Camboriú.

### Espaço Familiar e Bairros Planejados
A cidade oferece opções de casas em loteamentos abertos e condomínios fechados cercados por áreas verdes, ideais para quem busca quintal, espaço para pets e convivência em comunidade.

### Custo-Benefício Atraente
O valor do metro quadrado em Camboriú permite adquirir imóveis com área privativa significativamente maior do que na área praiana vizinha.`,
    seoTitle: "Morar em Camboriú: Vantagens e Imóveis | Corretora Val",
    seoDescription:
      "Saiba por que Camboriú é uma excelente escolha para morar bem perto do mar em SC.",
  },
];

async function main() {
  await prisma.configuracaoSite.upsert({
    where: { id: "principal" },
    update: {},
    create: {
      id: "principal",
      phone: "(47) 97400-7391",
      whatsapp: "5547974007391",
      email: "contato@corretoraval.com.br",
      address: "Balneário Camboriú — SC",
      instagramUrl: "https://www.instagram.com/valdete_goncalvesdemelo/",
      // Tema padrão: Ametista & Ouro Real
      themePreset: "ametista-ouro",
      primaryColor: "#35104f",
      primaryHover: "#4a1768",
      accentColor: "#b58a3a",
      accentLightColor: "#d8bd82",
      backgroundColor: "#f8f5ef",
      titleFont: "cormorant",
      bodyFont: "manrope",
    },
  });

  for (const page of pages) {
    await prisma.paginaSite.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  for (const property of properties) {
    await prisma.imovel.upsert({
      where: { code: property.code },
      update: property,
      create: property,
    });
  }

  for (const post of posts) {
    await prisma.postBlog.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  // Depoimentos
  const depoimentos = [
    {
      clientName: "Márcia Oliveira",
      text: "A Corretora Val cuidou do meu apartamento por anos com total transparência. Cada detalhe foi tratado com atenção e profissionalismo. Recomendo sem hesitar.",
      role: "Proprietária · Balneário Camboriú",
      sortOrder: 0,
      isPublished: true,
    },
    {
      clientName: "Roberto Fonseca",
      text: "Encontrei minha casa em Camboriú com a ajuda da equipe. Eles entenderam exatamente o que eu precisava e me guiaram em cada passo da negociação.",
      role: "Comprador · Camboriú",
      sortOrder: 1,
      isPublished: true,
    },
    {
      clientName: "Ana Beatriz Lima",
      text: "Confiei a locação do meu imóvel à Corretora Val e nunca me preocupei com vacância. A gestão é impecável e o atendimento é sempre humano.",
      role: "Investidora · Balneário Camboriú",
      sortOrder: 2,
      isPublished: true,
    },
  ];

  for (const depoimento of depoimentos) {
    const existing = await prisma.depoimento.findFirst({
      where: { clientName: depoimento.clientName },
    });
    if (!existing) {
      await prisma.depoimento.create({ data: depoimento });
    }
  }

  // Marcos históricos reais alinhados à Linha do Tempo da Corretora Val
  const marcos = [
    {
      year: 1989,
      title: "O convite que abriu a primeira porta",
      description:
        "Convite para atuar na tradicional Imobiliária Gonzaga, em Curitiba, marcando o primeiro contato de Valdete com o mercado imobiliário.",
      sortOrder: 0,
    },
    {
      year: 1990,
      title: "O início oficial da trajetória profissional",
      description:
        "Início formal na Imobiliária Gonzaga, atuando como secretária, vistoriadora e intermediadora de relações entre proprietários e locatários.",
      sortOrder: 1,
    },
    {
      year: 1995,
      title: "Trabalho Honesto & Liderança Social na AMAE",
      description:
        "Dedicação como motoboy durante 25 anos para sustentar a família com dignidade, somada à presidência da AMAE em apoio a crianças com mobilidade reduzida.",
      sortOrder: 2,
    },
    {
      year: 2019,
      title: "Recomeço em Balneário Camboriú e Nascimento da Corretora Val",
      description:
        "Retorno ao mercado imobiliário no litoral catarinense, reencontrando a vocação e fundando oficialmente a Corretora Val.",
      sortOrder: 3,
    },
    {
      year: 2024,
      title: "Tradição Familiar na Administração de Patrimônios",
      description:
        "Gestão familiar estruturada para administração de imóveis, locação anual, temporada e compra e venda, unindo gerações.",
      sortOrder: 4,
    },
  ];

  for (const marco of marcos) {
    const existing = await prisma.marcoHistorico.findFirst({
      where: { year: marco.year, title: marco.title },
    });
    if (!existing) {
      await prisma.marcoHistorico.create({ data: marco });
    }
  }

  // Membros reais da equipe institucional
  const membros = [
    {
      name: "Valdete Gonçalves de Melo",
      role: "Fundadora & Gestora Patrimonial",
      bio: "Mais de 35 anos de história no setor. Especialista em administração de imóveis e locações em Balneário Camboriú e Camboriú. CRECI/SC 56372-F.",
      photoUrl: "/images/institutional/valdete-perfil.png",
      sortOrder: 0,
    },
    {
      name: "Felipe Cesar Gonçalves de Melo",
      role: "Gestão & Operações",
      bio: "Atua na gestão operacional, contratos e estratégia patrimonial da Corretora Val.",
      sortOrder: 1,
    },
    {
      name: "Kauan Enrique Otto",
      role: "Inovação & Atendimento",
      bio: "Nova geração no mercado imobiliário com foco em relacionamento moderno, agilidade e tecnologia.",
      sortOrder: 2,
    },
  ];

  for (const membro of membros) {
    const existing = await prisma.membroEquipe.findFirst({
      where: { name: membro.name },
    });
    if (!existing) {
      await prisma.membroEquipe.create({ data: membro });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
