"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  ExternalLink,
  LoaderCircle,
  MessageSquare,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { AdminModal } from "@/components/admin/admin-modal";
import {
  defaultHomeContent,
  normalizeHomeContent,
  type HomeContent,
} from "@/lib/home-content";
import { uploadFile } from "@/lib/upload-file";

type Page = {
  slug: string;
  navigationLabel: string;
  eyebrow: string | null;
  title: string;
  heading: string;
  intro: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  sortOrder: number;
  content: Record<string, unknown> | null;
};

type Depoimento = {
  id: string;
  clientName: string;
  text: string;
  role: string | null;
  avatarUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
};

type MarcoHistorico = {
  id: string;
  year: number;
  title: string;
  description: string | null;
  sortOrder: number;
};

type MembroEquipe = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  sortOrder: number;
};

const STRUCTURED_SLUGS = [
  "home",
  "administracao",
  "quem-somos",
  "memoria-viva",
  "aluguel-anual-balneario-camboriu",
  "temporada-balneario-camboriu",
  "comprar-imoveis-balneario-camboriu",
  "administracao-imoveis-balneario-camboriu",
];

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string | number | null;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url" | "number";
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold text-[var(--plum)] uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
      <input
        className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-normal text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value ?? ""}
      />
    </label>
  );
}

/** Campo de texto com contador de caracteres e alerta de limite. */
function SeoField({
  label,
  value,
  onChange,
  limit,
  rows = 2,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  limit: number;
  rows?: number;
}) {
  const len = (value ?? "").length;
  const over = len > limit;
  const color = over
    ? "text-red-600"
    : len > limit * 0.9
      ? "text-amber-600"
      : "text-[var(--ink-soft)]";
  return (
    <label className="grid gap-1 text-xs font-bold text-[var(--plum)] uppercase tracking-wider">
      {label}
      <textarea
        className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-normal leading-6 text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        value={value ?? ""}
      />
      <span className={`text-right text-[0.7rem] font-normal normal-case tracking-normal ${color}`}>
        {len}/{limit} caracteres{over ? " — acima do ideal" : ""}
      </span>
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 4,
  required = false,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs font-bold text-[var(--plum)] uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
      <textarea
        className="rounded-xl border border-[var(--border,#d4cec4)] bg-white px-3.5 py-2.5 text-sm font-normal leading-6 text-[var(--ink)] focus:border-[var(--plum)] focus:outline-hidden"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={rows}
        value={value ?? ""}
      />
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos para o conteúdo estruturado por página
// ─────────────────────────────────────────────────────────────────────────────
type HomeContentState = HomeContent;

type AdminContentState = {
  benefitsEyebrow: string;
  benefitsTitle: string;
  benefitsSubtitle: string;
  benefits: Array<{ title: string; description: string }>;
  stepsEyebrow: string;
  stepsTitle: string;
  stepsSubtitle: string;
  steps: Array<{ number: string; title: string; description: string }>;
};

type QuemSomosContentState = {
  biographyTitle: string;
  biographyLead: string;
  biographyParagraphsText: string; // newline-separated for textarea
  quoteText: string;
  quoteAuthor: string;
};

type MemoriaVivaContentState = {
  quoteBannerText: string;
  quoteBannerDescription: string;
};

const DEFAULT_ADMIN: AdminContentState = {
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

const DEFAULT_QUEM_SOMOS: QuemSomosContentState = {
  biographyTitle: "Valdete Gonçalves de Melo",
  biographyLead:
    "Meu nome é Valdete Gonçalves de Melo, fundadora da Corretora Val, especialista em Administração de Imóveis, Locação Anual, Temporada e Compra e Venda, com atuação em Balneário Camboriú e Camboriú.",
  biographyParagraphsText:
    "O convite de 1989 abriu a primeira porta para trabalhar na tradicional Imobiliária Gonzaga, em Curitiba. Em 1990, iniciei oficialmente minha trajetória profissional no setor.\nA vida me levou por outros caminhos durante muitos anos, mas nunca apagou o sonho de voltar ao mercado imobiliário.\nDurante 25 anos, trabalhei como motoboy para sustentar minha família, sempre acreditando que o trabalho honesto abriria novas portas.\nTambém tive a honra de presidir a AMAE – Associação de Apoio à Criança e ao Adolescente com Mobilidade Reduzida e com Câncer.\nEm 2019, já em Balneário Camboriú, retornei ao mercado imobiliário e reencontrei a profissão que sempre fez parte da minha essência.\nFoi dessa trajetória que nasceu a Corretora Val.",
  quoteText:
    "Quero agradecer primeiramente por me ajudar a realizar um sonho guardado desde que resolvi caminhar aqui sozinha. Na pandemia fui dispensada do trabalho, sem rumo. A Michely e o Felipe me mostraram que eu era capaz — as palavras deles e o presente da Michely, me presenteando com o curso do CRECI, me fizeram acreditar que sou capaz.",
  quoteAuthor: "— Valdete Gonçalves de Melo · CRECI/SC 56372-F",
};

const DEFAULT_MEMORIA_VIVA: MemoriaVivaContentState = {
  quoteBannerText: "Cada imóvel carrega uma história. A nossa também.",
  quoteBannerDescription:
    "Preservamos com carinho as amizades e contatos que iniciaram lá nos primeiros anos e continuam confiando no nosso trabalho até os dias de hoje.",
};

// ─── Tipos e defaults para as 4 novas Landing Pages ──────────────────────────

type LandingTriCardState = {
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
};

type AdminImoveisLandingState = {
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
};

const DEFAULT_ALUGUEL_ANUAL: LandingTriCardState = {
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

const DEFAULT_TEMPORADA: LandingTriCardState = {
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

const DEFAULT_COMPRAR: LandingTriCardState = {
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
  textParagraph3: "",
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

const DEFAULT_ADMIN_IMOVEIS: AdminImoveisLandingState = {
  heroEyebrow: "GESTÃO PATRIMONIAL DEDICADA",
  heroTitle: "Administração de Imóveis em Balneário Camboriú",
  heroSubtitle:
    "Deixe a gestão do seu imóvel nas mãos de quem atua no mercado catarinense desde 1990. Rentabilidade justa, inquilinos qualificados e zero dor de cabeça para o proprietário.",
  sectionEyebrow: "Tranquilidade para Proprietários",
  sectionTitle: "Por que Confiar a Gestão do seu Imóvel à Corretora Val?",
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

export function ContentManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("home");
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // ─── Structured Content State ─────────────────────────────────────
  const [homeContent, setHomeContent] =
    useState<HomeContentState>(defaultHomeContent);
  const [adminContent, setAdminContent] =
    useState<AdminContentState>(DEFAULT_ADMIN);
  const [quemSomosContent, setQuemSomosContent] =
    useState<QuemSomosContentState>(DEFAULT_QUEM_SOMOS);
  const [memoriaVivaContent, setMemoriaVivaContent] =
    useState<MemoriaVivaContentState>(DEFAULT_MEMORIA_VIVA);
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);

  // ─── Landing pages state ─────────────────────────────────────────
  const [aluguelAnualContent, setAluguelAnualContent] =
    useState<LandingTriCardState>(DEFAULT_ALUGUEL_ANUAL);
  const [temporadaContent, setTemporadaContent] =
    useState<LandingTriCardState>(DEFAULT_TEMPORADA);
  const [comprarContent, setComprarContent] =
    useState<LandingTriCardState>(DEFAULT_COMPRAR);
  const [adminImoveisContent, setAdminImoveisContent] =
    useState<AdminImoveisLandingState>(DEFAULT_ADMIN_IMOVEIS);

  // ─── Depoimentos State ──────────────────────────────────────────
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [loadingDepoimentos, setLoadingDepoimentos] = useState(false);
  const [depoimentoModalOpen, setDepoimentoModalOpen] = useState(false);
  const [editingDepoimento, setEditingDepoimento] = useState<Depoimento | null>(
    null,
  );
  const [depoimentoForm, setDepoimentoForm] = useState({
    clientName: "",
    role: "",
    text: "",
    avatarUrl: "",
    isPublished: true,
    sortOrder: 0,
  });
  const [savingDepoimento, setSavingDepoimento] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ─── Marcos Históricos State ─────────────────────────────────────
  const [marcos, setMarcos] = useState<MarcoHistorico[]>([]);
  const [loadingMarcos, setLoadingMarcos] = useState(false);
  const [marcoModalOpen, setMarcoModalOpen] = useState(false);
  const [editingMarco, setEditingMarco] = useState<MarcoHistorico | null>(null);
  const [marcoForm, setMarcoForm] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    sortOrder: 0,
  });
  const [savingMarco, setSavingMarco] = useState(false);

  // ─── Membros Equipe State ────────────────────────────────────────
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [loadingMembros, setLoadingMembros] = useState(false);
  const [membroModalOpen, setMembroModalOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<MembroEquipe | null>(null);
  const [membroForm, setMembroForm] = useState({
    name: "",
    role: "",
    bio: "",
    photoUrl: "",
    sortOrder: 0,
  });
  const [savingMembro, setSavingMembro] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ─── Carregamento Inicial ─────────────────────────────────────────
  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/conteudo", {
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error("Não foi possível carregar o conteúdo.");
      const data = await response.json();
      setPages(data.pages ?? []);
      if (!data.pages?.some((page: Page) => page.slug === selectedSlug))
        setSelectedSlug(data.pages?.[0]?.slug ?? "home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Load structured content when slug changes for the 4 structured pages
  const loadStructuredContent = useCallback(async (slug: string) => {
    setLoadingContent(true);
    setContentExpanded(slug === "home");
    try {
      const res = await fetch(`/api/admin/conteudo/page-content?slug=${slug}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      const c = data.content ?? {};
      if (slug === "home") {
        setHomeContent(normalizeHomeContent(c));
      } else if (slug === "administracao") {
        setAdminContent({
          benefitsEyebrow: c.benefitsEyebrow ?? DEFAULT_ADMIN.benefitsEyebrow,
          benefitsTitle: c.benefitsTitle ?? DEFAULT_ADMIN.benefitsTitle,
          benefitsSubtitle:
            c.benefitsSubtitle ?? DEFAULT_ADMIN.benefitsSubtitle,
          benefits:
            Array.isArray(c.benefits) && c.benefits.length === 5
              ? c.benefits
              : DEFAULT_ADMIN.benefits,
          stepsEyebrow: c.stepsEyebrow ?? DEFAULT_ADMIN.stepsEyebrow,
          stepsTitle: c.stepsTitle ?? DEFAULT_ADMIN.stepsTitle,
          stepsSubtitle: c.stepsSubtitle ?? DEFAULT_ADMIN.stepsSubtitle,
          steps:
            Array.isArray(c.steps) && c.steps.length === 5
              ? c.steps
              : DEFAULT_ADMIN.steps,
        });
      } else if (slug === "quem-somos") {
        const paragraphs: string[] = Array.isArray(c.biographyParagraphs)
          ? c.biographyParagraphs
          : [];
        setQuemSomosContent({
          biographyTitle: c.biographyTitle ?? DEFAULT_QUEM_SOMOS.biographyTitle,
          biographyLead: c.biographyLead ?? DEFAULT_QUEM_SOMOS.biographyLead,
          biographyParagraphsText:
            paragraphs.length > 0
              ? paragraphs.join("\n")
              : DEFAULT_QUEM_SOMOS.biographyParagraphsText,
          quoteText: c.quoteText ?? DEFAULT_QUEM_SOMOS.quoteText,
          quoteAuthor: c.quoteAuthor ?? DEFAULT_QUEM_SOMOS.quoteAuthor,
        });
      } else if (slug === "memoria-viva") {
        setMemoriaVivaContent({
          quoteBannerText:
            c.quoteBannerText ?? DEFAULT_MEMORIA_VIVA.quoteBannerText,
          quoteBannerDescription:
            c.quoteBannerDescription ??
            DEFAULT_MEMORIA_VIVA.quoteBannerDescription,
        });
      } else if (slug === "aluguel-anual-balneario-camboriu") {
        setAluguelAnualContent({
          heroEyebrow: c.heroEyebrow ?? DEFAULT_ALUGUEL_ANUAL.heroEyebrow,
          heroTitle: c.heroTitle ?? DEFAULT_ALUGUEL_ANUAL.heroTitle,
          heroSubtitle: c.heroSubtitle ?? DEFAULT_ALUGUEL_ANUAL.heroSubtitle,
          sectionEyebrow: c.sectionEyebrow ?? DEFAULT_ALUGUEL_ANUAL.sectionEyebrow,
          sectionTitle: c.sectionTitle ?? DEFAULT_ALUGUEL_ANUAL.sectionTitle,
          intro: c.intro ?? DEFAULT_ALUGUEL_ANUAL.intro,
          card1Title: c.card1Title ?? DEFAULT_ALUGUEL_ANUAL.card1Title,
          card1Text: c.card1Text ?? DEFAULT_ALUGUEL_ANUAL.card1Text,
          card2Title: c.card2Title ?? DEFAULT_ALUGUEL_ANUAL.card2Title,
          card2Text: c.card2Text ?? DEFAULT_ALUGUEL_ANUAL.card2Text,
          card3Title: c.card3Title ?? DEFAULT_ALUGUEL_ANUAL.card3Title,
          card3Text: c.card3Text ?? DEFAULT_ALUGUEL_ANUAL.card3Text,
          textSectionTitle: c.textSectionTitle ?? DEFAULT_ALUGUEL_ANUAL.textSectionTitle,
          textParagraph1: c.textParagraph1 ?? DEFAULT_ALUGUEL_ANUAL.textParagraph1,
          textParagraph2: c.textParagraph2 ?? DEFAULT_ALUGUEL_ANUAL.textParagraph2,
          textParagraph3: c.textParagraph3 ?? DEFAULT_ALUGUEL_ANUAL.textParagraph3,
          listingsEyebrow: c.listingsEyebrow ?? DEFAULT_ALUGUEL_ANUAL.listingsEyebrow,
          listingsTitle: c.listingsTitle ?? DEFAULT_ALUGUEL_ANUAL.listingsTitle,
          listingsSubtitle: c.listingsSubtitle ?? DEFAULT_ALUGUEL_ANUAL.listingsSubtitle,
          ctaTitle: c.ctaTitle ?? DEFAULT_ALUGUEL_ANUAL.ctaTitle,
          ctaDescription: c.ctaDescription ?? DEFAULT_ALUGUEL_ANUAL.ctaDescription,
          ctaPrimaryLabel: c.ctaPrimaryLabel ?? DEFAULT_ALUGUEL_ANUAL.ctaPrimaryLabel,
          ctaSecondaryLabel: c.ctaSecondaryLabel ?? DEFAULT_ALUGUEL_ANUAL.ctaSecondaryLabel,
        });
      } else if (slug === "temporada-balneario-camboriu") {
        setTemporadaContent({
          heroEyebrow: c.heroEyebrow ?? DEFAULT_TEMPORADA.heroEyebrow,
          heroTitle: c.heroTitle ?? DEFAULT_TEMPORADA.heroTitle,
          heroSubtitle: c.heroSubtitle ?? DEFAULT_TEMPORADA.heroSubtitle,
          sectionEyebrow: c.sectionEyebrow ?? DEFAULT_TEMPORADA.sectionEyebrow,
          sectionTitle: c.sectionTitle ?? DEFAULT_TEMPORADA.sectionTitle,
          intro: c.intro ?? DEFAULT_TEMPORADA.intro,
          card1Title: c.card1Title ?? DEFAULT_TEMPORADA.card1Title,
          card1Text: c.card1Text ?? DEFAULT_TEMPORADA.card1Text,
          card2Title: c.card2Title ?? DEFAULT_TEMPORADA.card2Title,
          card2Text: c.card2Text ?? DEFAULT_TEMPORADA.card2Text,
          card3Title: c.card3Title ?? DEFAULT_TEMPORADA.card3Title,
          card3Text: c.card3Text ?? DEFAULT_TEMPORADA.card3Text,
          textSectionTitle: c.textSectionTitle ?? DEFAULT_TEMPORADA.textSectionTitle,
          textParagraph1: c.textParagraph1 ?? DEFAULT_TEMPORADA.textParagraph1,
          textParagraph2: c.textParagraph2 ?? DEFAULT_TEMPORADA.textParagraph2,
          textParagraph3: c.textParagraph3 ?? DEFAULT_TEMPORADA.textParagraph3,
          listingsEyebrow: c.listingsEyebrow ?? DEFAULT_TEMPORADA.listingsEyebrow,
          listingsTitle: c.listingsTitle ?? DEFAULT_TEMPORADA.listingsTitle,
          listingsSubtitle: c.listingsSubtitle ?? DEFAULT_TEMPORADA.listingsSubtitle,
          ctaTitle: c.ctaTitle ?? DEFAULT_TEMPORADA.ctaTitle,
          ctaDescription: c.ctaDescription ?? DEFAULT_TEMPORADA.ctaDescription,
          ctaPrimaryLabel: c.ctaPrimaryLabel ?? DEFAULT_TEMPORADA.ctaPrimaryLabel,
          ctaSecondaryLabel: c.ctaSecondaryLabel ?? DEFAULT_TEMPORADA.ctaSecondaryLabel,
        });
      } else if (slug === "comprar-imoveis-balneario-camboriu") {
        setComprarContent({
          heroEyebrow: c.heroEyebrow ?? DEFAULT_COMPRAR.heroEyebrow,
          heroTitle: c.heroTitle ?? DEFAULT_COMPRAR.heroTitle,
          heroSubtitle: c.heroSubtitle ?? DEFAULT_COMPRAR.heroSubtitle,
          sectionEyebrow: c.sectionEyebrow ?? DEFAULT_COMPRAR.sectionEyebrow,
          sectionTitle: c.sectionTitle ?? DEFAULT_COMPRAR.sectionTitle,
          intro: c.intro ?? DEFAULT_COMPRAR.intro,
          card1Title: c.card1Title ?? DEFAULT_COMPRAR.card1Title,
          card1Text: c.card1Text ?? DEFAULT_COMPRAR.card1Text,
          card2Title: c.card2Title ?? DEFAULT_COMPRAR.card2Title,
          card2Text: c.card2Text ?? DEFAULT_COMPRAR.card2Text,
          card3Title: c.card3Title ?? DEFAULT_COMPRAR.card3Title,
          card3Text: c.card3Text ?? DEFAULT_COMPRAR.card3Text,
          textSectionTitle: c.textSectionTitle ?? DEFAULT_COMPRAR.textSectionTitle,
          textParagraph1: c.textParagraph1 ?? DEFAULT_COMPRAR.textParagraph1,
          textParagraph2: c.textParagraph2 ?? DEFAULT_COMPRAR.textParagraph2,
          textParagraph3: c.textParagraph3 ?? DEFAULT_COMPRAR.textParagraph3,
          listingsEyebrow: c.listingsEyebrow ?? DEFAULT_COMPRAR.listingsEyebrow,
          listingsTitle: c.listingsTitle ?? DEFAULT_COMPRAR.listingsTitle,
          listingsSubtitle: c.listingsSubtitle ?? DEFAULT_COMPRAR.listingsSubtitle,
          ctaTitle: c.ctaTitle ?? DEFAULT_COMPRAR.ctaTitle,
          ctaDescription: c.ctaDescription ?? DEFAULT_COMPRAR.ctaDescription,
          ctaPrimaryLabel: c.ctaPrimaryLabel ?? DEFAULT_COMPRAR.ctaPrimaryLabel,
          ctaSecondaryLabel: c.ctaSecondaryLabel ?? DEFAULT_COMPRAR.ctaSecondaryLabel,
        });
      } else if (slug === "administracao-imoveis-balneario-camboriu") {
        setAdminImoveisContent({
          heroEyebrow: c.heroEyebrow ?? DEFAULT_ADMIN_IMOVEIS.heroEyebrow,
          heroTitle: c.heroTitle ?? DEFAULT_ADMIN_IMOVEIS.heroTitle,
          heroSubtitle: c.heroSubtitle ?? DEFAULT_ADMIN_IMOVEIS.heroSubtitle,
          sectionEyebrow: c.sectionEyebrow ?? DEFAULT_ADMIN_IMOVEIS.sectionEyebrow,
          sectionTitle: c.sectionTitle ?? DEFAULT_ADMIN_IMOVEIS.sectionTitle,
          intro: c.intro ?? DEFAULT_ADMIN_IMOVEIS.intro,
          intro2: c.intro2 ?? DEFAULT_ADMIN_IMOVEIS.intro2,
          pillar1Title: c.pillar1Title ?? DEFAULT_ADMIN_IMOVEIS.pillar1Title,
          pillar1Desc: c.pillar1Desc ?? DEFAULT_ADMIN_IMOVEIS.pillar1Desc,
          pillar2Title: c.pillar2Title ?? DEFAULT_ADMIN_IMOVEIS.pillar2Title,
          pillar2Desc: c.pillar2Desc ?? DEFAULT_ADMIN_IMOVEIS.pillar2Desc,
          pillar3Title: c.pillar3Title ?? DEFAULT_ADMIN_IMOVEIS.pillar3Title,
          pillar3Desc: c.pillar3Desc ?? DEFAULT_ADMIN_IMOVEIS.pillar3Desc,
          pillar4Title: c.pillar4Title ?? DEFAULT_ADMIN_IMOVEIS.pillar4Title,
          pillar4Desc: c.pillar4Desc ?? DEFAULT_ADMIN_IMOVEIS.pillar4Desc,
          pillar5Title: c.pillar5Title ?? DEFAULT_ADMIN_IMOVEIS.pillar5Title,
          pillar5Desc: c.pillar5Desc ?? DEFAULT_ADMIN_IMOVEIS.pillar5Desc,
          pillar6Title: c.pillar6Title ?? DEFAULT_ADMIN_IMOVEIS.pillar6Title,
          pillar6Desc: c.pillar6Desc ?? DEFAULT_ADMIN_IMOVEIS.pillar6Desc,
          flowTitle: c.flowTitle ?? DEFAULT_ADMIN_IMOVEIS.flowTitle,
          flowParagraph1: c.flowParagraph1 ?? DEFAULT_ADMIN_IMOVEIS.flowParagraph1,
          flowParagraph2: c.flowParagraph2 ?? DEFAULT_ADMIN_IMOVEIS.flowParagraph2,
          formEyebrow: c.formEyebrow ?? DEFAULT_ADMIN_IMOVEIS.formEyebrow,
          formTitle: c.formTitle ?? DEFAULT_ADMIN_IMOVEIS.formTitle,
          formSubtitle: c.formSubtitle ?? DEFAULT_ADMIN_IMOVEIS.formSubtitle,
          ctaTitle: c.ctaTitle ?? DEFAULT_ADMIN_IMOVEIS.ctaTitle,
          ctaDescription: c.ctaDescription ?? DEFAULT_ADMIN_IMOVEIS.ctaDescription,
          ctaPrimaryLabel: c.ctaPrimaryLabel ?? DEFAULT_ADMIN_IMOVEIS.ctaPrimaryLabel,
          ctaSecondaryLabel: c.ctaSecondaryLabel ?? DEFAULT_ADMIN_IMOVEIS.ctaSecondaryLabel,
          ctaSecondaryHref: c.ctaSecondaryHref ?? DEFAULT_ADMIN_IMOVEIS.ctaSecondaryHref,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar conteúdo estruturado:", err);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    if (STRUCTURED_SLUGS.includes(selectedSlug)) {
      loadStructuredContent(selectedSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug, loadStructuredContent]);

  async function saveStructuredContent(
    slug: string,
    content: Record<string, unknown>,
  ) {
    setSavingContent(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/conteudo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page-content",
          pageContent: { slug, content },
        }),
      });
      if (!res.ok) throw new Error("Não foi possível salvar o conteúdo.");
      await loadStructuredContent(slug);
      setMessage("Conteúdo estruturado salvo com sucesso.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSavingContent(false);
    }
  }

  function handleSaveHomeContent(e: FormEvent) {
    e.preventDefault();
    const c = homeContent;
    saveStructuredContent("home", c);
  }

  function handleSaveAdminContent(e: FormEvent) {
    e.preventDefault();
    saveStructuredContent("administracao", {
      benefitsEyebrow: adminContent.benefitsEyebrow,
      benefitsTitle: adminContent.benefitsTitle,
      benefitsSubtitle: adminContent.benefitsSubtitle,
      benefits: adminContent.benefits,
      stepsEyebrow: adminContent.stepsEyebrow,
      stepsTitle: adminContent.stepsTitle,
      stepsSubtitle: adminContent.stepsSubtitle,
      steps: adminContent.steps,
    });
  }

  function handleSaveQuemSomosContent(e: FormEvent) {
    e.preventDefault();
    const paragraphs = quemSomosContent.biographyParagraphsText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    saveStructuredContent("quem-somos", {
      biographyTitle: quemSomosContent.biographyTitle,
      biographyLead: quemSomosContent.biographyLead,
      biographyParagraphs: paragraphs,
      quoteText: quemSomosContent.quoteText,
      quoteAuthor: quemSomosContent.quoteAuthor,
    });
  }

  function handleSaveMemoriaVivaContent(e: FormEvent) {
    e.preventDefault();
    saveStructuredContent("memoria-viva", memoriaVivaContent);
  }

  function handleSaveLandingTriCard(
    e: FormEvent,
    slug: string,
    content: LandingTriCardState,
  ) {
    e.preventDefault();
    saveStructuredContent(slug, content);
  }

  function handleSaveAdminImoveisLanding(e: FormEvent) {
    e.preventDefault();
    saveStructuredContent(
      "administracao-imoveis-balneario-camboriu",
      adminImoveisContent,
    );
  }

  // Carrega seções específicas ao mudar o slug ativo
  const loadDepoimentos = useCallback(async () => {
    setLoadingDepoimentos(true);
    try {
      const res = await fetch("/api/admin/depoimentos");
      if (res.ok) {
        const data = await res.json();
        setDepoimentos(data.items ?? []);
      }
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);
    } finally {
      setLoadingDepoimentos(false);
    }
  }, []);

  const loadMarcos = useCallback(async () => {
    setLoadingMarcos(true);
    try {
      const res = await fetch("/api/admin/marcos");
      if (res.ok) {
        const data = await res.json();
        setMarcos(data.items ?? []);
      }
    } catch (err) {
      console.error("Erro ao buscar marcos:", err);
    } finally {
      setLoadingMarcos(false);
    }
  }, []);

  const loadMembros = useCallback(async () => {
    setLoadingMembros(true);
    try {
      const res = await fetch("/api/admin/equipe");
      if (res.ok) {
        const data = await res.json();
        setMembros(data.items ?? []);
      }
    } catch (err) {
      console.error("Erro ao buscar equipe:", err);
    } finally {
      setLoadingMembros(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSlug === "depoimentos") {
      loadDepoimentos();
    } else if (selectedSlug === "memoria-viva") {
      loadMarcos();
    } else if (selectedSlug === "quem-somos") {
      loadMembros();
    }
  }, [selectedSlug, loadDepoimentos, loadMarcos, loadMembros]);

  const selectedPage = pages.find((page) => page.slug === selectedSlug) ?? null;
  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPage) return;
    setSavingPage(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/conteudo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "page", page: selectedPage }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar a página.");
      setMessage(`Página “${selectedPage.navigationLabel}” salva com sucesso.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocorreu um erro.");
    } finally {
      setSavingPage(false);
    }
  }

  function patchPage(patch: Partial<Page>) {
    setPages((current) =>
      current.map((page) =>
        page.slug === selectedSlug ? { ...page, ...patch } : page,
      ),
    );
  }

  // ─── Handlers de Depoimentos ──────────────────────────────────────
  function openNewDepoimentoModal() {
    setEditingDepoimento(null);
    setDepoimentoForm({
      clientName: "",
      role: "",
      text: "",
      avatarUrl: "",
      isPublished: true,
      sortOrder: depoimentos.length + 1,
    });
    setDepoimentoModalOpen(true);
  }

  function openEditDepoimentoModal(item: Depoimento) {
    setEditingDepoimento(item);
    setDepoimentoForm({
      clientName: item.clientName,
      role: item.role ?? "",
      text: item.text,
      avatarUrl: item.avatarUrl ?? "",
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
    });
    setDepoimentoModalOpen(true);
  }

  async function handleSaveDepoimento(e: FormEvent) {
    e.preventDefault();
    setSavingDepoimento(true);
    try {
      const payload = {
        clientName: depoimentoForm.clientName.trim(),
        role: emptyToNull(depoimentoForm.role),
        text: depoimentoForm.text.trim(),
        avatarUrl: emptyToNull(depoimentoForm.avatarUrl),
        isPublished: depoimentoForm.isPublished,
        sortOrder: Number(depoimentoForm.sortOrder) || 0,
      };

      const url = editingDepoimento
        ? `/api/admin/depoimentos/${editingDepoimento.id}`
        : "/api/admin/depoimentos";
      const method = editingDepoimento ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao salvar depoimento");
      }

      setDepoimentoModalOpen(false);
      loadDepoimentos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar depoimento");
    } finally {
      setSavingDepoimento(false);
    }
  }

  async function handleDeleteDepoimento(id: string, name: string) {
    if (!confirm(`Deseja realmente remover o depoimento de "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/depoimentos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir depoimento");
      loadDepoimentos();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir depoimento");
    }
  }

  // ─── Handlers de Marcos Históricos ────────────────────────────────
  function openNewMarcoModal() {
    setEditingMarco(null);
    setMarcoForm({
      year: new Date().getFullYear(),
      title: "",
      description: "",
      sortOrder: marcos.length + 1,
    });
    setMarcoModalOpen(true);
  }

  function openEditMarcoModal(item: MarcoHistorico) {
    setEditingMarco(item);
    setMarcoForm({
      year: item.year,
      title: item.title,
      description: item.description ?? "",
      sortOrder: item.sortOrder,
    });
    setMarcoModalOpen(true);
  }

  async function handleSaveMarco(e: FormEvent) {
    e.preventDefault();
    setSavingMarco(true);
    try {
      const payload = {
        year: Number(marcoForm.year),
        title: marcoForm.title.trim(),
        description: emptyToNull(marcoForm.description),
        sortOrder: Number(marcoForm.sortOrder) || 0,
      };

      const url = editingMarco
        ? `/api/admin/marcos/${editingMarco.id}`
        : "/api/admin/marcos";
      const method = editingMarco ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao salvar marco histórico");
      }

      setMarcoModalOpen(false);
      loadMarcos();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erro ao salvar marco histórico",
      );
    } finally {
      setSavingMarco(false);
    }
  }

  async function handleDeleteMarco(id: string, title: string) {
    if (!confirm(`Deseja realmente remover o marco "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/marcos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir marco histórico");
      loadMarcos();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erro ao excluir marco histórico",
      );
    }
  }

  // ─── Handlers de Equipe ──────────────────────────────────────────
  function openNewMembroModal() {
    setEditingMembro(null);
    setMembroForm({
      name: "",
      role: "",
      bio: "",
      photoUrl: "",
      sortOrder: membros.length + 1,
    });
    setMembroModalOpen(true);
  }

  function openEditMembroModal(item: MembroEquipe) {
    setEditingMembro(item);
    setMembroForm({
      name: item.name,
      role: item.role,
      bio: item.bio ?? "",
      photoUrl: item.photoUrl ?? "",
      sortOrder: item.sortOrder,
    });
    setMembroModalOpen(true);
  }

  async function handleSaveMembro(e: FormEvent) {
    e.preventDefault();
    setSavingMembro(true);
    try {
      const payload = {
        name: membroForm.name.trim(),
        role: membroForm.role.trim(),
        bio: emptyToNull(membroForm.bio),
        photoUrl: emptyToNull(membroForm.photoUrl),
        sortOrder: Number(membroForm.sortOrder) || 0,
      };

      const url = editingMembro
        ? `/api/admin/equipe/${editingMembro.id}`
        : "/api/admin/equipe";
      const method = editingMembro ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao salvar membro da equipe");
      }

      setMembroModalOpen(false);
      loadMembros();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erro ao salvar membro da equipe",
      );
    } finally {
      setSavingMembro(false);
    }
  }

  async function handleDeleteMembro(id: string, name: string) {
    if (!confirm(`Deseja realmente remover "${name}" da equipe?`)) return;
    try {
      const res = await fetch(`/api/admin/equipe/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir membro da equipe");
      loadMembros();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erro ao excluir membro da equipe",
      );
    }
  }

  // ─── Upload Helper ───────────────────────────────────────────────
  async function handleFileUpload(
    file: File,
    onSuccess: (url: string) => void,
    setUploading: (val: boolean) => void,
  ) {
    setUploading(true);
    try {
      const uploaded = await uploadFile(file);
      onSuccess(uploaded.url);
    } catch (_err) {
      alert("Erro ao enviar imagem. Verifique o formato e tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  if (loading)
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <p className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          <LoaderCircle className="animate-spin" size={18} /> Carregando
          conteúdo…
        </p>
      </main>
    );

  return (
    <main className="p-6 sm:p-10">
      <p className="eyebrow">CMS Corretora Val</p>
      <h1 className="display mt-3 text-4xl text-[var(--plum)] sm:text-5xl">
        Páginas e Conteúdo
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        Gerencie as páginas estruturadas do site, incluindo seções
        institucionais, depoimentos, linha do tempo e membros da equipe.
      </p>

      <section className="mt-9 grid gap-7 xl:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Barra Lateral de Seleção de Páginas */}
        <aside className="rounded-3xl border bg-[var(--surface)] p-3 shadow-xs self-start">
          <p className="px-3 py-2 text-xs font-extrabold tracking-[0.12em] text-[var(--gold)] uppercase">
            Páginas do Site
          </p>
          <div className="space-y-1 mt-1">
            {pages.map((page) => {
              const isCurrent = page.slug === selectedSlug;
              return (
                <button
                  className={`interactive w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all ${
                    isCurrent
                      ? "bg-[var(--plum)] text-white shadow-md shadow-[var(--plum)]/20"
                      : "text-[var(--plum)] hover:bg-[var(--surface-muted)]"
                  }`}
                  key={page.slug}
                  onClick={() => {
                    setSelectedSlug(page.slug);
                    setMessage(null);
                  }}
                  type="button"
                >
                  <span>{page.navigationLabel}</span>
                  {page.slug === "depoimentos" && (
                    <MessageSquare size={15} className="opacity-70" />
                  )}
                  {page.slug === "memoria-viva" && (
                    <Clock size={15} className="opacity-70" />
                  )}
                  {page.slug === "quem-somos" && (
                    <Users size={15} className="opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conteúdo da Página Selecionada */}
        <div className="space-y-8">
          {/* Mensagem de Feedback */}
          {message && (
            <div
              className="rounded-2xl border border-[var(--gold-light)] bg-white p-4 text-sm font-semibold text-[var(--plum)] shadow-xs flex items-center gap-3 animate-in fade-in"
              role="status"
            >
              <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Aviso especial para a página Blog */}
          {selectedSlug === "blog" && (
            <div className="rounded-3xl border border-[var(--gold-light)] bg-gradient-to-br from-[var(--surface-muted)] to-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="display text-xl font-bold text-[var(--plum)]">
                    Artigos & Posts do Blog
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ink-soft)] max-w-xl">
                    Os artigos do blog contam com editor de texto rico (Tiptap),
                    upload de fotos inline, capas e categorias exclusivas.
                  </p>
                </div>
                <Link
                  href="/admin/blog"
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs hover:bg-[var(--plum-bright)]"
                >
                  <ExternalLink size={14} /> Ir para Gestão de Posts
                </Link>
              </div>
            </div>
          )}

          {/* Metadados e compatibilidade da página */}
          {selectedPage && (
            <form
              className="rounded-3xl border bg-[var(--surface)] p-6 shadow-xs sm:p-8"
              onSubmit={savePage}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--gold)]">
                    Metadados da página e SEO
                  </span>
                  <h2 className="display text-2xl sm:text-3xl font-bold text-[var(--plum)]">
                    {selectedPage.navigationLabel}
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                    Rota pública: /
                    {selectedPage.slug === "home" ? "" : selectedPage.slug}
                  </p>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--ink-soft)]">
                    {selectedSlug === "home"
                      ? "Esses campos não controlam diretamente o conteúdo visual da Home. Para editar o Hero e as demais seções exibidas no site, utilize o bloco Conteúdo Estruturado."
                      : "Esses campos são metadados, SEO e informações de compatibilidade da página selecionada."}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-bold text-[var(--plum)] bg-[var(--surface-muted)] px-4 py-2 rounded-full cursor-pointer">
                  <input
                    checked={selectedPage.isPublished}
                    onChange={(event) =>
                      patchPage({ isPublished: event.target.checked })
                    }
                    type="checkbox"
                  />
                  <span>Publicada no site</span>
                </label>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Input
                  label="Nome no menu do painel"
                  value={selectedPage.navigationLabel}
                  onChange={(value) => patchPage({ navigationLabel: value })}
                />
                <SeoField
                  label="Título para motores de busca (SEO Title) — ideal até 60"
                  value={selectedPage.seoTitle}
                  onChange={(value) =>
                    patchPage({ seoTitle: emptyToNull(value) })
                  }
                  limit={60}
                  rows={1}
                />
                <SeoField
                  label="Descrição para motores de busca (SEO Description) — ideal até 155"
                  value={selectedPage.seoDescription}
                  onChange={(value) =>
                    patchPage({ seoDescription: emptyToNull(value) })
                  }
                  limit={155}
                  rows={2}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer"
                  disabled={savingPage}
                  type="submit"
                >
                  <Save size={16} />{" "}
                  {savingPage ? "Salvando…" : "Salvar Dados da Página"}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SEÇÃO DINÂMICA: DEPOIMENTOS
              ═══════════════════════════════════════════════════════════ */}
          {selectedSlug === "depoimentos" && (
            <div className="rounded-3xl border bg-white p-6 shadow-xs sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--gold)]">
                    Gestão de Avaliações
                  </span>
                  <h3 className="display text-2xl font-bold text-[var(--plum)]">
                    Depoimentos de Clientes
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    Histórias e depoimentos autorizados exibidos na página
                    inicial e páginas institucionais.
                  </p>
                </div>
                <button
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] shadow-xs hover:bg-[var(--gold-light)] cursor-pointer"
                  onClick={openNewDepoimentoModal}
                  type="button"
                >
                  <Plus size={16} /> Novo Depoimento
                </button>
              </div>

              {loadingDepoimentos ? (
                <p className="flex items-center gap-2 text-sm text-[var(--ink-soft)] py-8">
                  <LoaderCircle className="animate-spin" size={16} /> Carregando
                  depoimentos…
                </p>
              ) : depoimentos.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--ink-soft)]">
                  Nenhum depoimento cadastrado ainda. Clique em &ldquo;Novo
                  Depoimento&rdquo; para adicionar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                        <th className="py-3 px-3">Cliente</th>
                        <th className="py-3 px-3">Função / Perfil</th>
                        <th className="py-3 px-3">Texto</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {depoimentos.map((dep) => (
                        <tr
                          key={dep.id}
                          className="hover:bg-[var(--surface-muted)]/50"
                        >
                          <td className="py-3.5 px-3 font-bold text-[var(--plum)]">
                            {dep.clientName}
                          </td>
                          <td className="py-3.5 px-3 text-xs text-[var(--ink-soft)]">
                            {dep.role || "—"}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs truncate text-xs text-[var(--ink)]">
                            &ldquo;{dep.text}&rdquo;
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {dep.isPublished ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <CheckCircle2 size={13} /> Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                <XCircle size={13} /> Oculto
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                aria-label="Editar"
                                className="interactive p-2 text-[var(--plum)] hover:bg-gray-100 rounded-lg"
                                onClick={() => openEditDepoimentoModal(dep)}
                                type="button"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                aria-label="Excluir"
                                className="interactive p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() =>
                                  handleDeleteDepoimento(dep.id, dep.clientName)
                                }
                                type="button"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SEÇÃO DINÂMICA: MEMÓRIA VIVA (MARCOS HISTÓRICOS)
              ═══════════════════════════════════════════════════════════ */}
          {selectedSlug === "memoria-viva" && (
            <div className="rounded-3xl border bg-white p-6 shadow-xs sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--gold)]">
                    Linha do Tempo
                  </span>
                  <h3 className="display text-2xl font-bold text-[var(--plum)]">
                    Marcos Históricos da Corretora Val
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    Capítulos que contam a história da fundadora e a evolução da
                    imobiliária.
                  </p>
                </div>
                <button
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] shadow-xs hover:bg-[var(--gold-light)] cursor-pointer"
                  onClick={openNewMarcoModal}
                  type="button"
                >
                  <Plus size={16} /> Novo Marco Histórico
                </button>
              </div>

              {loadingMarcos ? (
                <p className="flex items-center gap-2 text-sm text-[var(--ink-soft)] py-8">
                  <LoaderCircle className="animate-spin" size={16} /> Carregando
                  marcos históricos…
                </p>
              ) : marcos.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--ink-soft)]">
                  Nenhum marco cadastrado ainda. A página pública exibirá os
                  marcos padrão até que você cadastre novos.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                        <th className="py-3 px-3">Ano</th>
                        <th className="py-3 px-3">Título</th>
                        <th className="py-3 px-3">Descrição</th>
                        <th className="py-3 px-3 text-center">Ordem</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {marcos.map((marco) => (
                        <tr
                          key={marco.id}
                          className="hover:bg-[var(--surface-muted)]/50"
                        >
                          <td className="py-3.5 px-3 font-bold text-[var(--gold)]">
                            {marco.year}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-[var(--plum)]">
                            {marco.title}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs truncate text-xs text-[var(--ink-soft)]">
                            {marco.description || "—"}
                          </td>
                          <td className="py-3.5 px-3 text-center text-xs">
                            {marco.sortOrder}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                aria-label="Editar"
                                className="interactive p-2 text-[var(--plum)] hover:bg-gray-100 rounded-lg"
                                onClick={() => openEditMarcoModal(marco)}
                                type="button"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                aria-label="Excluir"
                                className="interactive p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() =>
                                  handleDeleteMarco(marco.id, marco.title)
                                }
                                type="button"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SEÇÃO DINÂMICA: QUEM SOMOS (MEMBROS DA EQUIPE)
              ═══════════════════════════════════════════════════════════ */}
          {selectedSlug === "quem-somos" && (
            <div className="rounded-3xl border bg-white p-6 shadow-xs sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--gold)]">
                    Estrutura Organizacional
                  </span>
                  <h3 className="display text-2xl font-bold text-[var(--plum)]">
                    Membros da Equipe
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    Profissionais e familiares que atuam na gestão, atendimento
                    e operações.
                  </p>
                </div>
                <button
                  className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--plum)] shadow-xs hover:bg-[var(--gold-light)] cursor-pointer"
                  onClick={openNewMembroModal}
                  type="button"
                >
                  <Plus size={16} /> Novo Membro
                </button>
              </div>

              {loadingMembros ? (
                <p className="flex items-center gap-2 text-sm text-[var(--ink-soft)] py-8">
                  <LoaderCircle className="animate-spin" size={16} /> Carregando
                  equipe…
                </p>
              ) : membros.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--ink-soft)]">
                  Nenhum membro cadastrado ainda. A página &ldquo;Quem
                  Somos&rdquo; exibirá a biografia da fundadora e família.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                        <th className="py-3 px-3">Foto</th>
                        <th className="py-3 px-3">Nome</th>
                        <th className="py-3 px-3">Cargo / Função</th>
                        <th className="py-3 px-3">Biografia</th>
                        <th className="py-3 px-3 text-center">Ordem</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {membros.map((membro) => (
                        <tr
                          key={membro.id}
                          className="hover:bg-[var(--surface-muted)]/50"
                        >
                          <td className="py-3.5 px-3">
                            <div className="size-10 rounded-full bg-[var(--surface-muted)] overflow-hidden border border-[var(--gold-light)] flex items-center justify-center text-xs font-bold text-[var(--plum)]">
                              {membro.photoUrl ? (
                                <Image
                                  src={membro.photoUrl}
                                  alt={membro.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                membro.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-[var(--plum)]">
                            {membro.name}
                          </td>
                          <td className="py-3.5 px-3 text-xs text-[var(--ink-soft)]">
                            {membro.role}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs truncate text-xs text-[var(--ink-soft)]">
                            {membro.bio || "—"}
                          </td>
                          <td className="py-3.5 px-3 text-center text-xs">
                            {membro.sortOrder}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                aria-label="Editar"
                                className="interactive p-2 text-[var(--plum)] hover:bg-gray-100 rounded-lg"
                                onClick={() => openEditMembroModal(membro)}
                                type="button"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                aria-label="Excluir"
                                className="interactive p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                onClick={() =>
                                  handleDeleteMembro(membro.id, membro.name)
                                }
                                type="button"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SEÇÃO ESTRUTURADA: CONTEÚDO DAS SEÇÕES DA PÁGINA
              ═══════════════════════════════════════════════════════════ */}
          {STRUCTURED_SLUGS.includes(selectedSlug) && selectedPage && (
            <div className="rounded-3xl border border-[var(--gold-light)] bg-white p-6 shadow-xs sm:p-8 space-y-4">
              {/* Header colapsável */}
              <button
                type="button"
                onClick={() => setContentExpanded((v) => !v)}
                className="interactive w-full flex items-center justify-between gap-3 border-b pb-5"
              >
                <div className="text-left">
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--gold)]">
                    Seções da Página
                  </span>
                  <h3 className="display text-2xl font-bold text-[var(--plum)]">
                    Conteúdo Estruturado
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                    Edite os textos visíveis nas seções desta página pública.
                  </p>
                </div>
                {contentExpanded ? (
                  <ChevronUp
                    size={20}
                    className="text-[var(--plum)] shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={20}
                    className="text-[var(--plum)] shrink-0"
                  />
                )}
              </button>

              {loadingContent && (
                <p className="flex items-center gap-2 text-sm text-[var(--ink-soft)] py-4">
                  <LoaderCircle className="animate-spin" size={16} /> Carregando
                  conteúdo…
                </p>
              )}

              {/* ── HOME ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "home" && (
                  <form className="space-y-6" onSubmit={handleSaveHomeContent}>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Hero Principal
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Texto de apoio / Eyebrow"
                          value={homeContent.hero.eyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, eyebrow: v },
                            }))
                          }
                        />
                        <Input
                          label="Título"
                          value={homeContent.hero.title}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, title: v },
                            }))
                          }
                        />
                        <Input
                          label="Destaque"
                          value={homeContent.hero.emphasis}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, emphasis: v },
                            }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Descrição"
                        rows={3}
                        value={homeContent.hero.description}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            hero: { ...p.hero, description: v },
                          }))
                        }
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Botão primário — texto"
                          value={homeContent.hero.primaryLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, primaryLabel: v },
                            }))
                          }
                        />
                        <Input
                          label="Botão primário — URL"
                          value={homeContent.hero.primaryHref}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, primaryHref: v },
                            }))
                          }
                        />
                        <Input
                          label="Botão secundário — texto"
                          value={homeContent.hero.secondaryLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, secondaryLabel: v },
                            }))
                          }
                        />
                        <Input
                          label="Botão secundário — URL"
                          value={homeContent.hero.secondaryHref}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, secondaryHref: v },
                            }))
                          }
                        />
                      </div>
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2 pt-2">
                        Card do Hero
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow do card"
                          value={homeContent.hero.cardEyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, cardEyebrow: v },
                            }))
                          }
                        />
                        <Input
                          label="Título do card"
                          value={homeContent.hero.cardTitle}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, cardTitle: v },
                            }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Texto do card"
                        rows={2}
                        value={homeContent.hero.cardDescription}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            hero: { ...p.hero, cardDescription: v },
                          }))
                        }
                      />
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2 pt-2">
                        Atendimento
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow do atendimento"
                          value={homeContent.hero.attentionEyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, attentionEyebrow: v },
                            }))
                          }
                        />
                        <Input
                          label="Título do atendimento"
                          value={homeContent.hero.attentionTitle}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero: { ...p.hero, attentionTitle: v },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Áreas de Atuação
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow da seção"
                          value={homeContent.servicesEyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              servicesEyebrow: v,
                            }))
                          }
                        />
                        <Input
                          label="Título da seção"
                          value={homeContent.servicesTitle}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              servicesTitle: v,
                            }))
                          }
                        />
                      </div>
                      {homeContent.services.map((svc, idx) => (
                        <div
                          key={svc.key}
                          className="rounded-2xl border p-4 space-y-3"
                        >
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">
                            Card {idx + 1} — {svc.key}
                          </span>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              label="Título"
                              value={svc.title}
                              onChange={(v) =>
                                setHomeContent((p) => ({
                                  ...p,
                                  services: p.services.map((s, i) =>
                                    i === idx ? { ...s, title: v } : s,
                                  ),
                                }))
                              }
                            />
                            <Input
                              label="URL do link"
                              value={svc.href}
                              onChange={(v) =>
                                setHomeContent((p) => ({
                                  ...p,
                                  services: p.services.map((s, i) =>
                                    i === idx ? { ...s, href: v } : s,
                                  ),
                                }))
                              }
                            />
                          </div>
                          <Textarea
                            label="Descrição"
                            rows={2}
                            value={svc.text}
                            onChange={(v) =>
                              setHomeContent((p) => ({
                                ...p,
                                services: p.services.map((s, i) =>
                                  i === idx ? { ...s, text: v } : s,
                                ),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Imóveis em Destaque
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow"
                          value={homeContent.featuredProperties.eyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              featuredProperties: {
                                ...p.featuredProperties,
                                eyebrow: v,
                              },
                            }))
                          }
                        />
                        <Input
                          label="Título"
                          value={homeContent.featuredProperties.title}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              featuredProperties: {
                                ...p.featuredProperties,
                                title: v,
                              },
                            }))
                          }
                        />
                        <Input
                          label="Link para todos"
                          value={homeContent.featuredProperties.viewAllLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              featuredProperties: {
                                ...p.featuredProperties,
                                viewAllLabel: v,
                              },
                            }))
                          }
                        />
                        <Input
                          label="Ação quando há imóveis"
                          value={homeContent.featuredProperties.gridActionLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              featuredProperties: {
                                ...p.featuredProperties,
                                gridActionLabel: v,
                              },
                            }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Subtítulo"
                        value={homeContent.featuredProperties.subtitle}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            featuredProperties: {
                              ...p.featuredProperties,
                              subtitle: v,
                            },
                          }))
                        }
                        rows={2}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Título sem destaques"
                          value={homeContent.featuredProperties.emptyTitle}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              featuredProperties: {
                                ...p.featuredProperties,
                                emptyTitle: v,
                              },
                            }))
                          }
                        />
                        <Input
                          label="Ação sem destaques"
                          value={
                            homeContent.featuredProperties.emptyActionLabel
                          }
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              featuredProperties: {
                                ...p.featuredProperties,
                                emptyActionLabel: v,
                              },
                            }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Descrição sem destaques"
                        value={homeContent.featuredProperties.emptyDescription}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            featuredProperties: {
                              ...p.featuredProperties,
                              emptyDescription: v,
                            },
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Autoridade
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow"
                          value={homeContent.authority.eyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              authority: { ...p.authority, eyebrow: v },
                            }))
                          }
                        />
                        <Input
                          label="Nome da fundadora"
                          value={homeContent.authority.founderName}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              authority: { ...p.authority, founderName: v },
                            }))
                          }
                        />
                        <Input
                          label="Credencial"
                          value={homeContent.authority.founderCredential}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              authority: {
                                ...p.authority,
                                founderCredential: v,
                              },
                            }))
                          }
                        />
                        <Input
                          label="Selo"
                          value={homeContent.authority.badgeLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              authority: { ...p.authority, badgeLabel: v },
                            }))
                          }
                        />
                      </div>
                      <Input
                        label="Título"
                        value={homeContent.authority.title}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            authority: { ...p.authority, title: v },
                          }))
                        }
                      />
                      <Textarea
                        label="Subtítulo"
                        value={homeContent.authority.subtitle}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            authority: { ...p.authority, subtitle: v },
                          }))
                        }
                        rows={2}
                      />
                      <Input
                        label="Título da história"
                        value={homeContent.authority.storyTitle}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            authority: { ...p.authority, storyTitle: v },
                          }))
                        }
                      />
                      <Textarea
                        label="Texto da história"
                        value={homeContent.authority.storyText}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            authority: { ...p.authority, storyText: v },
                          }))
                        }
                        rows={5}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Texto do link"
                          value={homeContent.authority.storyLinkLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              authority: { ...p.authority, storyLinkLabel: v },
                            }))
                          }
                        />
                        <Input
                          label="URL do link"
                          value={homeContent.authority.storyLinkHref}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              authority: { ...p.authority, storyLinkHref: v },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        CTA final
                      </h4>
                      <Input
                        label="Título"
                        value={homeContent.cta.title}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            cta: { ...p.cta, title: v },
                          }))
                        }
                      />
                      <Textarea
                        label="Descrição"
                        value={homeContent.cta.description}
                        onChange={(v) =>
                          setHomeContent((p) => ({
                            ...p,
                            cta: { ...p.cta, description: v },
                          }))
                        }
                        rows={3}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Botão principal"
                          value={homeContent.cta.primaryLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              cta: { ...p.cta, primaryLabel: v },
                            }))
                          }
                        />
                        <Input
                          label="Botão secundário"
                          value={homeContent.cta.secondaryLabel}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              cta: { ...p.cta, secondaryLabel: v },
                            }))
                          }
                        />
                        <Input
                          label="URL do botão secundário"
                          value={homeContent.cta.secondaryHref}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              cta: { ...p.cta, secondaryHref: v },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingContent}
                        className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer"
                      >
                        <Save size={16} />{" "}
                        {savingContent
                          ? "Salvando…"
                          : "Salvar Conteúdo da Home"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── ADMINISTRAÇÃO ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "administracao" && (
                  <form className="space-y-6" onSubmit={handleSaveAdminContent}>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Seção — Benefícios
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow"
                          value={adminContent.benefitsEyebrow}
                          onChange={(v) =>
                            setAdminContent((p) => ({
                              ...p,
                              benefitsEyebrow: v,
                            }))
                          }
                        />
                        <Input
                          label="Título da seção"
                          value={adminContent.benefitsTitle}
                          onChange={(v) =>
                            setAdminContent((p) => ({ ...p, benefitsTitle: v }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Subtítulo"
                        rows={2}
                        value={adminContent.benefitsSubtitle}
                        onChange={(v) =>
                          setAdminContent((p) => ({
                            ...p,
                            benefitsSubtitle: v,
                          }))
                        }
                      />
                      {adminContent.benefits.map((b, idx) => (
                        <div
                          key={b.title}
                          className="rounded-2xl border p-4 space-y-3"
                        >
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">
                            Benefício {idx + 1}
                          </span>
                          <Input
                            label="Título"
                            value={b.title}
                            onChange={(v) =>
                              setAdminContent((p) => ({
                                ...p,
                                benefits: p.benefits.map((x, i) =>
                                  i === idx ? { ...x, title: v } : x,
                                ),
                              }))
                            }
                          />
                          <Textarea
                            label="Descrição"
                            rows={2}
                            value={b.description}
                            onChange={(v) =>
                              setAdminContent((p) => ({
                                ...p,
                                benefits: p.benefits.map((x, i) =>
                                  i === idx ? { ...x, description: v } : x,
                                ),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Seção — Passo a Passo
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Eyebrow"
                          value={adminContent.stepsEyebrow}
                          onChange={(v) =>
                            setAdminContent((p) => ({ ...p, stepsEyebrow: v }))
                          }
                        />
                        <Input
                          label="Título da seção"
                          value={adminContent.stepsTitle}
                          onChange={(v) =>
                            setAdminContent((p) => ({ ...p, stepsTitle: v }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Subtítulo"
                        rows={2}
                        value={adminContent.stepsSubtitle}
                        onChange={(v) =>
                          setAdminContent((p) => ({ ...p, stepsSubtitle: v }))
                        }
                      />
                      {adminContent.steps.map((s, idx) => (
                        <div
                          key={s.number}
                          className="rounded-2xl border p-4 space-y-3"
                        >
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">
                            Passo {s.number}
                          </span>
                          <Input
                            label="Título"
                            value={s.title}
                            onChange={(v) =>
                              setAdminContent((p) => ({
                                ...p,
                                steps: p.steps.map((x, i) =>
                                  i === idx ? { ...x, title: v } : x,
                                ),
                              }))
                            }
                          />
                          <Textarea
                            label="Descrição"
                            rows={2}
                            value={s.description}
                            onChange={(v) =>
                              setAdminContent((p) => ({
                                ...p,
                                steps: p.steps.map((x, i) =>
                                  i === idx ? { ...x, description: v } : x,
                                ),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingContent}
                        className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer"
                      >
                        <Save size={16} />{" "}
                        {savingContent
                          ? "Salvando…"
                          : "Salvar Conteúdo da Administração"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── QUEM SOMOS ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "quem-somos" && (
                  <form
                    className="space-y-4"
                    onSubmit={handleSaveQuemSomosContent}
                  >
                    <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                      Biografia da Fundadora
                    </h4>
                    <Input
                      label="Título (nome)"
                      value={quemSomosContent.biographyTitle}
                      onChange={(v) =>
                        setQuemSomosContent((p) => ({
                          ...p,
                          biographyTitle: v,
                        }))
                      }
                    />
                    <Textarea
                      label="Parágrafo de abertura (lead)"
                      rows={3}
                      value={quemSomosContent.biographyLead}
                      onChange={(v) =>
                        setQuemSomosContent((p) => ({ ...p, biographyLead: v }))
                      }
                    />
                    <Textarea
                      label="Parágrafos da biografia (um por linha)"
                      rows={10}
                      value={quemSomosContent.biographyParagraphsText}
                      onChange={(v) =>
                        setQuemSomosContent((p) => ({
                          ...p,
                          biographyParagraphsText: v,
                        }))
                      }
                    />
                    <p className="text-xs text-[var(--ink-soft)]">
                      Cada linha vira um parágrafo separado no site público.
                    </p>

                    <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2 pt-2">
                      Citação / Depoimento da Fundadora
                    </h4>
                    <Textarea
                      label="Texto da citação"
                      rows={4}
                      value={quemSomosContent.quoteText}
                      onChange={(v) =>
                        setQuemSomosContent((p) => ({ ...p, quoteText: v }))
                      }
                    />
                    <Input
                      label="Assinatura da citação"
                      value={quemSomosContent.quoteAuthor}
                      onChange={(v) =>
                        setQuemSomosContent((p) => ({ ...p, quoteAuthor: v }))
                      }
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingContent}
                        className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer"
                      >
                        <Save size={16} />{" "}
                        {savingContent
                          ? "Salvando…"
                          : "Salvar Conteúdo de Quem Somos"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── MEMÓRIA VIVA ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "memoria-viva" && (
                  <form
                    className="space-y-4"
                    onSubmit={handleSaveMemoriaVivaContent}
                  >
                    <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                      Banner de Citação
                    </h4>
                    <Textarea
                      label="Texto da citação"
                      rows={2}
                      value={memoriaVivaContent.quoteBannerText}
                      onChange={(v) =>
                        setMemoriaVivaContent((p) => ({
                          ...p,
                          quoteBannerText: v,
                        }))
                      }
                    />
                    <Textarea
                      label="Texto complementar"
                      rows={3}
                      value={memoriaVivaContent.quoteBannerDescription}
                      onChange={(v) =>
                        setMemoriaVivaContent((p) => ({
                          ...p,
                          quoteBannerDescription: v,
                        }))
                      }
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingContent}
                        className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer"
                      >
                        <Save size={16} />{" "}
                        {savingContent
                          ? "Salvando…"
                          : "Salvar Conteúdo de Memória Viva"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── ALUGUEL ANUAL ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "aluguel-anual-balneario-camboriu" && (
                  <form
                    className="space-y-6"
                    onSubmit={(e) =>
                      handleSaveLandingTriCard(
                        e,
                        "aluguel-anual-balneario-camboriu",
                        aluguelAnualContent,
                      )
                    }
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Hero
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={aluguelAnualContent.heroEyebrow} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, heroEyebrow: v }))} />
                        <Input label="Título (H1)" value={aluguelAnualContent.heroTitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, heroTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={aluguelAnualContent.heroSubtitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, heroSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Seção Editorial
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow da seção" value={aluguelAnualContent.sectionEyebrow} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, sectionEyebrow: v }))} />
                        <Input label="Título da seção" value={aluguelAnualContent.sectionTitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, sectionTitle: v }))} />
                      </div>
                      <Textarea label="Parágrafo de introdução" rows={3} value={aluguelAnualContent.intro} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, intro: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Cards de Destaque
                      </h4>
                      {(["card1", "card2", "card3"] as const).map((k, i) => (
                        <div key={k} className="rounded-2xl border p-4 space-y-3">
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">Card {i + 1}</span>
                          <Input label="Título" value={aluguelAnualContent[`${k}Title`]} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, [`${k}Title`]: v }))} />
                          <Textarea label="Texto" rows={2} value={aluguelAnualContent[`${k}Text`]} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, [`${k}Text`]: v }))} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Bloco de Texto
                      </h4>
                      <Input label="Título da seção" value={aluguelAnualContent.textSectionTitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, textSectionTitle: v }))} />
                      <Textarea label="Parágrafo 1" rows={3} value={aluguelAnualContent.textParagraph1} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, textParagraph1: v }))} />
                      <Textarea label="Parágrafo 2" rows={3} value={aluguelAnualContent.textParagraph2} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, textParagraph2: v }))} />
                      <Textarea label="Parágrafo 3" rows={3} value={aluguelAnualContent.textParagraph3} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, textParagraph3: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Grade de Imóveis
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={aluguelAnualContent.listingsEyebrow} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, listingsEyebrow: v }))} />
                        <Input label="Título" value={aluguelAnualContent.listingsTitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, listingsTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={aluguelAnualContent.listingsSubtitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, listingsSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        CTA Final
                      </h4>
                      <Input label="Título" value={aluguelAnualContent.ctaTitle} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, ctaTitle: v }))} />
                      <Textarea label="Descrição" rows={2} value={aluguelAnualContent.ctaDescription} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, ctaDescription: v }))} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Botão principal" value={aluguelAnualContent.ctaPrimaryLabel} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, ctaPrimaryLabel: v }))} />
                        <Input label="Botão secundário" value={aluguelAnualContent.ctaSecondaryLabel} onChange={(v) => setAluguelAnualContent((p) => ({ ...p, ctaSecondaryLabel: v }))} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={savingContent} className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer">
                        <Save size={16} /> {savingContent ? "Salvando…" : "Salvar Aluguel Anual"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── TEMPORADA ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "temporada-balneario-camboriu" && (
                  <form
                    className="space-y-6"
                    onSubmit={(e) =>
                      handleSaveLandingTriCard(
                        e,
                        "temporada-balneario-camboriu",
                        temporadaContent,
                      )
                    }
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Hero</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={temporadaContent.heroEyebrow} onChange={(v) => setTemporadaContent((p) => ({ ...p, heroEyebrow: v }))} />
                        <Input label="Título (H1)" value={temporadaContent.heroTitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, heroTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={temporadaContent.heroSubtitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, heroSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Seção Editorial</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={temporadaContent.sectionEyebrow} onChange={(v) => setTemporadaContent((p) => ({ ...p, sectionEyebrow: v }))} />
                        <Input label="Título" value={temporadaContent.sectionTitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, sectionTitle: v }))} />
                      </div>
                      <Textarea label="Parágrafo de introdução" rows={3} value={temporadaContent.intro} onChange={(v) => setTemporadaContent((p) => ({ ...p, intro: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Cards de Destaque</h4>
                      {(["card1", "card2", "card3"] as const).map((k, i) => (
                        <div key={k} className="rounded-2xl border p-4 space-y-3">
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">Card {i + 1}</span>
                          <Input label="Título" value={temporadaContent[`${k}Title`]} onChange={(v) => setTemporadaContent((p) => ({ ...p, [`${k}Title`]: v }))} />
                          <Textarea label="Texto" rows={2} value={temporadaContent[`${k}Text`]} onChange={(v) => setTemporadaContent((p) => ({ ...p, [`${k}Text`]: v }))} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Bloco de Texto</h4>
                      <Input label="Título da seção" value={temporadaContent.textSectionTitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, textSectionTitle: v }))} />
                      <Textarea label="Parágrafo 1" rows={3} value={temporadaContent.textParagraph1} onChange={(v) => setTemporadaContent((p) => ({ ...p, textParagraph1: v }))} />
                      <Textarea label="Parágrafo 2" rows={3} value={temporadaContent.textParagraph2} onChange={(v) => setTemporadaContent((p) => ({ ...p, textParagraph2: v }))} />
                      <Textarea label="Parágrafo 3" rows={3} value={temporadaContent.textParagraph3} onChange={(v) => setTemporadaContent((p) => ({ ...p, textParagraph3: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Grade de Imóveis</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={temporadaContent.listingsEyebrow} onChange={(v) => setTemporadaContent((p) => ({ ...p, listingsEyebrow: v }))} />
                        <Input label="Título" value={temporadaContent.listingsTitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, listingsTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={temporadaContent.listingsSubtitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, listingsSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">CTA Final</h4>
                      <Input label="Título" value={temporadaContent.ctaTitle} onChange={(v) => setTemporadaContent((p) => ({ ...p, ctaTitle: v }))} />
                      <Textarea label="Descrição" rows={2} value={temporadaContent.ctaDescription} onChange={(v) => setTemporadaContent((p) => ({ ...p, ctaDescription: v }))} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Botão principal" value={temporadaContent.ctaPrimaryLabel} onChange={(v) => setTemporadaContent((p) => ({ ...p, ctaPrimaryLabel: v }))} />
                        <Input label="Botão secundário" value={temporadaContent.ctaSecondaryLabel} onChange={(v) => setTemporadaContent((p) => ({ ...p, ctaSecondaryLabel: v }))} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={savingContent} className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer">
                        <Save size={16} /> {savingContent ? "Salvando…" : "Salvar Temporada"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── COMPRAR IMÓVEIS ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "comprar-imoveis-balneario-camboriu" && (
                  <form
                    className="space-y-6"
                    onSubmit={(e) =>
                      handleSaveLandingTriCard(
                        e,
                        "comprar-imoveis-balneario-camboriu",
                        comprarContent,
                      )
                    }
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Hero</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={comprarContent.heroEyebrow} onChange={(v) => setComprarContent((p) => ({ ...p, heroEyebrow: v }))} />
                        <Input label="Título (H1)" value={comprarContent.heroTitle} onChange={(v) => setComprarContent((p) => ({ ...p, heroTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={comprarContent.heroSubtitle} onChange={(v) => setComprarContent((p) => ({ ...p, heroSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Seção Editorial</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={comprarContent.sectionEyebrow} onChange={(v) => setComprarContent((p) => ({ ...p, sectionEyebrow: v }))} />
                        <Input label="Título" value={comprarContent.sectionTitle} onChange={(v) => setComprarContent((p) => ({ ...p, sectionTitle: v }))} />
                      </div>
                      <Textarea label="Parágrafo de introdução" rows={3} value={comprarContent.intro} onChange={(v) => setComprarContent((p) => ({ ...p, intro: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Cards de Destaque</h4>
                      {(["card1", "card2", "card3"] as const).map((k, i) => (
                        <div key={k} className="rounded-2xl border p-4 space-y-3">
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">Card {i + 1}</span>
                          <Input label="Título" value={comprarContent[`${k}Title`]} onChange={(v) => setComprarContent((p) => ({ ...p, [`${k}Title`]: v }))} />
                          <Textarea label="Texto" rows={2} value={comprarContent[`${k}Text`]} onChange={(v) => setComprarContent((p) => ({ ...p, [`${k}Text`]: v }))} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Bloco de Texto</h4>
                      <Input label="Título da seção" value={comprarContent.textSectionTitle} onChange={(v) => setComprarContent((p) => ({ ...p, textSectionTitle: v }))} />
                      <Textarea label="Parágrafo 1" rows={3} value={comprarContent.textParagraph1} onChange={(v) => setComprarContent((p) => ({ ...p, textParagraph1: v }))} />
                      <Textarea label="Parágrafo 2" rows={3} value={comprarContent.textParagraph2} onChange={(v) => setComprarContent((p) => ({ ...p, textParagraph2: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Grade de Imóveis</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={comprarContent.listingsEyebrow} onChange={(v) => setComprarContent((p) => ({ ...p, listingsEyebrow: v }))} />
                        <Input label="Título" value={comprarContent.listingsTitle} onChange={(v) => setComprarContent((p) => ({ ...p, listingsTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={comprarContent.listingsSubtitle} onChange={(v) => setComprarContent((p) => ({ ...p, listingsSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">CTA Final</h4>
                      <Input label="Título" value={comprarContent.ctaTitle} onChange={(v) => setComprarContent((p) => ({ ...p, ctaTitle: v }))} />
                      <Textarea label="Descrição" rows={2} value={comprarContent.ctaDescription} onChange={(v) => setComprarContent((p) => ({ ...p, ctaDescription: v }))} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Botão principal" value={comprarContent.ctaPrimaryLabel} onChange={(v) => setComprarContent((p) => ({ ...p, ctaPrimaryLabel: v }))} />
                        <Input label="Botão secundário" value={comprarContent.ctaSecondaryLabel} onChange={(v) => setComprarContent((p) => ({ ...p, ctaSecondaryLabel: v }))} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={savingContent} className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer">
                        <Save size={16} /> {savingContent ? "Salvando…" : "Salvar Comprar Imóveis"}
                      </button>
                    </div>
                  </form>
                )}

              {/* ── ADMINISTRAÇÃO DE IMÓVEIS (Landing) ── */}
              {contentExpanded &&
                !loadingContent &&
                selectedSlug === "administracao-imoveis-balneario-camboriu" && (
                  <form className="space-y-6" onSubmit={handleSaveAdminImoveisLanding}>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Hero</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={adminImoveisContent.heroEyebrow} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, heroEyebrow: v }))} />
                        <Input label="Título (H1)" value={adminImoveisContent.heroTitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, heroTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={adminImoveisContent.heroSubtitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, heroSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Seção Editorial</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={adminImoveisContent.sectionEyebrow} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, sectionEyebrow: v }))} />
                        <Input label="Título" value={adminImoveisContent.sectionTitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, sectionTitle: v }))} />
                      </div>
                      <Textarea label="Parágrafo 1" rows={3} value={adminImoveisContent.intro} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, intro: v }))} />
                      <Textarea label="Parágrafo 2 (CRECI / credencial)" rows={3} value={adminImoveisContent.intro2} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, intro2: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Pilares do Serviço</h4>
                      {(
                        [
                          { n: 1, titleKey: "pillar1Title" as const, descKey: "pillar1Desc" as const },
                          { n: 2, titleKey: "pillar2Title" as const, descKey: "pillar2Desc" as const },
                          { n: 3, titleKey: "pillar3Title" as const, descKey: "pillar3Desc" as const },
                          { n: 4, titleKey: "pillar4Title" as const, descKey: "pillar4Desc" as const },
                          { n: 5, titleKey: "pillar5Title" as const, descKey: "pillar5Desc" as const },
                          { n: 6, titleKey: "pillar6Title" as const, descKey: "pillar6Desc" as const },
                        ] as const
                      ).map(({ n, titleKey, descKey }) => (
                        <div key={n} className="rounded-2xl border p-4 space-y-3">
                          <span className="text-xs font-bold text-[var(--gold)] uppercase">Pilar {n}</span>
                          <Input label="Título" value={adminImoveisContent[titleKey]} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, [titleKey]: v }))} />
                          <Textarea label="Descrição" rows={2} value={adminImoveisContent[descKey]} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, [descKey]: v }))} />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Fluxo da Administração</h4>
                      <Input label="Título" value={adminImoveisContent.flowTitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, flowTitle: v }))} />
                      <Textarea label="Parágrafo 1" rows={3} value={adminImoveisContent.flowParagraph1} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, flowParagraph1: v }))} />
                      <Textarea label="Parágrafo 2" rows={3} value={adminImoveisContent.flowParagraph2} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, flowParagraph2: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">Formulário de Cadastro</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Eyebrow" value={adminImoveisContent.formEyebrow} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, formEyebrow: v }))} />
                        <Input label="Título" value={adminImoveisContent.formTitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, formTitle: v }))} />
                      </div>
                      <Textarea label="Subtítulo" rows={2} value={adminImoveisContent.formSubtitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, formSubtitle: v }))} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">CTA Final</h4>
                      <Input label="Título" value={adminImoveisContent.ctaTitle} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, ctaTitle: v }))} />
                      <Textarea label="Descrição" rows={2} value={adminImoveisContent.ctaDescription} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, ctaDescription: v }))} />
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input label="Botão principal" value={adminImoveisContent.ctaPrimaryLabel} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, ctaPrimaryLabel: v }))} />
                        <Input label="Botão secundário" value={adminImoveisContent.ctaSecondaryLabel} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, ctaSecondaryLabel: v }))} />
                        <Input label="URL do botão secundário" value={adminImoveisContent.ctaSecondaryHref} onChange={(v) => setAdminImoveisContent((p) => ({ ...p, ctaSecondaryHref: v }))} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" disabled={savingContent} className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60 cursor-pointer">
                        <Save size={16} /> {savingContent ? "Salvando…" : "Salvar Administração de Imóveis"}
                      </button>
                    </div>
                  </form>
                )}
            </div>
          )}
        </div>
      </section>

      {/* ─── MODAL: DEPOIMENTO ──────────────────────────────────────── */}
      <AdminModal
        isOpen={depoimentoModalOpen}
        onClose={() => setDepoimentoModalOpen(false)}
        title={editingDepoimento ? "Editar Depoimento" : "Novo Depoimento"}
        description="Cadastre ou edite o depoimento de um cliente para o site."
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSaveDepoimento}>
          <Input
            label="Nome do Cliente"
            required
            value={depoimentoForm.clientName}
            onChange={(val) =>
              setDepoimentoForm((prev) => ({ ...prev, clientName: val }))
            }
          />
          <Input
            label="Cargo / Perfil (ex: Proprietário em Balneário Camboriú)"
            value={depoimentoForm.role}
            onChange={(val) =>
              setDepoimentoForm((prev) => ({ ...prev, role: val }))
            }
          />
          <Textarea
            label="Texto do Depoimento"
            required
            rows={4}
            value={depoimentoForm.text}
            onChange={(val) =>
              setDepoimentoForm((prev) => ({ ...prev, text: val }))
            }
          />

          <div>
            <Input
              label="URL da Foto / Avatar (Opcional)"
              value={depoimentoForm.avatarUrl}
              onChange={(val) =>
                setDepoimentoForm((prev) => ({ ...prev, avatarUrl: val }))
              }
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="interactive inline-flex items-center gap-1.5 text-xs font-bold text-[var(--plum)] bg-[var(--surface-muted)] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-200">
                <Upload size={14} />
                <span>{uploadingAvatar ? "Enviando…" : "Enviar Imagem"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        (url) =>
                          setDepoimentoForm((prev) => ({
                            ...prev,
                            avatarUrl: url,
                          })),
                        setUploadingAvatar,
                      );
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ordem de Exibição"
              type="number"
              value={depoimentoForm.sortOrder}
              onChange={(val) =>
                setDepoimentoForm((prev) => ({
                  ...prev,
                  sortOrder: Number(val) || 0,
                }))
              }
            />
            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-[var(--plum)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={depoimentoForm.isPublished}
                  onChange={(e) =>
                    setDepoimentoForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                />
                <span>Publicado no site</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              className="interactive px-5 py-2.5 rounded-full text-xs font-bold text-[var(--ink-soft)] hover:bg-gray-100"
              onClick={() => setDepoimentoModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingDepoimento}
              className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60"
            >
              <Save size={14} /> {savingDepoimento ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ─── MODAL: MARCO HISTÓRICO ──────────────────────────────────── */}
      <AdminModal
        isOpen={marcoModalOpen}
        onClose={() => setMarcoModalOpen(false)}
        title={editingMarco ? "Editar Marco Histórico" : "Novo Marco Histórico"}
        description="Cadastre ou edite um marco temporal na história da Corretora Val."
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSaveMarco}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ano / Época"
              required
              type="number"
              value={marcoForm.year}
              onChange={(val) =>
                setMarcoForm((prev) => ({
                  ...prev,
                  year: Number(val) || new Date().getFullYear(),
                }))
              }
            />
            <Input
              label="Ordem de Exibição"
              type="number"
              value={marcoForm.sortOrder}
              onChange={(val) =>
                setMarcoForm((prev) => ({
                  ...prev,
                  sortOrder: Number(val) || 0,
                }))
              }
            />
          </div>

          <Input
            label="Título do Marco"
            required
            value={marcoForm.title}
            onChange={(val) =>
              setMarcoForm((prev) => ({ ...prev, title: val }))
            }
          />

          <Textarea
            label="Descrição Detalhada"
            rows={4}
            value={marcoForm.description}
            onChange={(val) =>
              setMarcoForm((prev) => ({ ...prev, description: val }))
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              className="interactive px-5 py-2.5 rounded-full text-xs font-bold text-[var(--ink-soft)] hover:bg-gray-100"
              onClick={() => setMarcoModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingMarco}
              className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60"
            >
              <Save size={14} /> {savingMarco ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ─── MODAL: MEMBRO DA EQUIPE ─────────────────────────────────── */}
      <AdminModal
        isOpen={membroModalOpen}
        onClose={() => setMembroModalOpen(false)}
        title={
          editingMembro ? "Editar Membro da Equipe" : "Novo Membro da Equipe"
        }
        description="Cadastre os dados institucionais do integrante da equipe."
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSaveMembro}>
          <Input
            label="Nome Completo"
            required
            value={membroForm.name}
            onChange={(val) =>
              setMembroForm((prev) => ({ ...prev, name: val }))
            }
          />

          <Input
            label="Cargo / Especialidade (ex: Gestor Imobiliário & Operações)"
            required
            value={membroForm.role}
            onChange={(val) =>
              setMembroForm((prev) => ({ ...prev, role: val }))
            }
          />

          <Textarea
            label="Biografia / Apresentação"
            rows={4}
            value={membroForm.bio}
            onChange={(val) => setMembroForm((prev) => ({ ...prev, bio: val }))}
          />

          <div>
            <Input
              label="URL da Foto do Membro"
              value={membroForm.photoUrl}
              onChange={(val) =>
                setMembroForm((prev) => ({ ...prev, photoUrl: val }))
              }
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="interactive inline-flex items-center gap-1.5 text-xs font-bold text-[var(--plum)] bg-[var(--surface-muted)] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-200">
                <Upload size={14} />
                <span>{uploadingPhoto ? "Enviando…" : "Enviar Foto"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        (url) =>
                          setMembroForm((prev) => ({
                            ...prev,
                            photoUrl: url,
                          })),
                        setUploadingPhoto,
                      );
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <Input
            label="Ordem de Exibição"
            type="number"
            value={membroForm.sortOrder}
            onChange={(val) =>
              setMembroForm((prev) => ({
                ...prev,
                sortOrder: Number(val) || 0,
              }))
            }
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              className="interactive px-5 py-2.5 rounded-full text-xs font-bold text-[var(--ink-soft)] hover:bg-gray-100"
              onClick={() => setMembroModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingMembro}
              className="interactive inline-flex items-center gap-2 rounded-full bg-[var(--plum)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-[var(--plum-bright)] disabled:opacity-60"
            >
              <Save size={14} /> {savingMembro ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>
    </main>
  );
}
