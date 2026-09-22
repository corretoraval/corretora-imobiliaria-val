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
type HomeContentState = {
  hero_eyebrow: string;
  hero_title: string;
  hero_text: string;
  hero_primaryCtaText: string;
  hero_primaryCtaHref: string;
  hero_secondaryCtaText: string;
  hero_secondaryCtaHref: string;
  hero_cardEyebrow: string;
  hero_cardTitle: string;
  hero_cardText: string;
  services: Array<{ key: string; title: string; text: string; href: string }>;
};

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

const DEFAULT_HOME: HomeContentState = {
  hero_eyebrow: "Balneário Camboriú e Camboriú",
  hero_title: "Confiança que abre portas.",
  hero_text:
    "Há mais de três décadas, transformamos imóveis em histórias bem cuidadas — com atendimento humano, gestão responsável e compromisso real com o seu patrimônio.",
  hero_primaryCtaText: "Conheça nossos imóveis",
  hero_primaryCtaHref: "/imoveis",
  hero_secondaryCtaText: "Administrar meu imóvel",
  hero_secondaryCtaHref: "/administracao",
  hero_cardEyebrow: "Desde 1989",
  hero_cardTitle: "Mais que imóveis, cuidamos de histórias.",
  hero_cardText:
    "Uma empresa construída em família, para relações que permanecem muito depois da entrega das chaves.",
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
    "Minha história no mercado imobiliário teve início em 1989, com o convite que abriu a primeira porta para trabalhar na tradicional Imobiliária Gonzaga, em Curitiba.\nA vida me levou por outros caminhos durante muitos anos, mas nunca apagou o sonho de voltar ao mercado imobiliário.\nDurante 25 anos, trabalhei como motoboy para sustentar minha família, sempre acreditando que o trabalho honesto abriria novas portas.\nTambém tive a honra de presidir a AMAE – Associação de Apoio à Criança e ao Adolescente com Mobilidade Reduzida e com Câncer.\nEm 2019, já em Balneário Camboriú, retornei ao mercado imobiliário e reencontrei a profissão que sempre fez parte da minha essência.\nFoi dessa trajetória que nasceu a Corretora Val.",
  quoteText:
    "Quero agradecer primeiramente por me ajudar a realizar um sonho guardado desde que resolvi caminhar aqui sozinha. Na pandemia fui dispensada do trabalho, sem rumo. A Michely e o Felipe me mostraram que eu era capaz — as palavras deles e o presente da Michely, me presenteando com o curso do CRECI, me fizeram acreditar que sou capaz.",
  quoteAuthor: "— Valdete Gonçalves de Melo · CRECI/SC 56372-F",
};

const DEFAULT_MEMORIA_VIVA: MemoriaVivaContentState = {
  quoteBannerText: "Cada imóvel carrega uma história. A nossa também.",
  quoteBannerDescription:
    "Preservamos com carinho as amizades e contatos que iniciaram lá nos primeiros anos e continuam confiando no nosso trabalho até os dias de hoje.",
};

export function ContentManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("home");
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // ─── Structured Content State ─────────────────────────────────────
  const [homeContent, setHomeContent] =
    useState<HomeContentState>(DEFAULT_HOME);
  const [adminContent, setAdminContent] =
    useState<AdminContentState>(DEFAULT_ADMIN);
  const [quemSomosContent, setQuemSomosContent] =
    useState<QuemSomosContentState>(DEFAULT_QUEM_SOMOS);
  const [memoriaVivaContent, setMemoriaVivaContent] =
    useState<MemoriaVivaContentState>(DEFAULT_MEMORIA_VIVA);
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);

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
    setContentExpanded(false);
    try {
      const res = await fetch(`/api/admin/conteudo/page-content?slug=${slug}`);
      if (!res.ok) return;
      const data = await res.json();
      const c = data.content ?? {};
      if (slug === "home") {
        const hero = c.hero ?? {};
        const services =
          Array.isArray(c.services) && c.services.length === 4
            ? c.services
            : DEFAULT_HOME.services;
        setHomeContent({
          hero_eyebrow: hero.eyebrow ?? DEFAULT_HOME.hero_eyebrow,
          hero_title: hero.title ?? DEFAULT_HOME.hero_title,
          hero_text: hero.text ?? DEFAULT_HOME.hero_text,
          hero_primaryCtaText:
            hero.primaryCtaText ?? DEFAULT_HOME.hero_primaryCtaText,
          hero_primaryCtaHref:
            hero.primaryCtaHref ?? DEFAULT_HOME.hero_primaryCtaHref,
          hero_secondaryCtaText:
            hero.secondaryCtaText ?? DEFAULT_HOME.hero_secondaryCtaText,
          hero_secondaryCtaHref:
            hero.secondaryCtaHref ?? DEFAULT_HOME.hero_secondaryCtaHref,
          hero_cardEyebrow: hero.cardEyebrow ?? DEFAULT_HOME.hero_cardEyebrow,
          hero_cardTitle: hero.cardTitle ?? DEFAULT_HOME.hero_cardTitle,
          hero_cardText: hero.cardText ?? DEFAULT_HOME.hero_cardText,
          services,
        });
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
    saveStructuredContent("home", {
      hero: {
        eyebrow: c.hero_eyebrow,
        title: c.hero_title,
        text: c.hero_text,
        primaryCtaText: c.hero_primaryCtaText,
        primaryCtaHref: c.hero_primaryCtaHref,
        secondaryCtaText: c.hero_secondaryCtaText,
        secondaryCtaHref: c.hero_secondaryCtaHref,
        cardEyebrow: c.hero_cardEyebrow,
        cardTitle: c.hero_cardTitle,
        cardText: c.hero_cardText,
      },
      services: c.services,
    });
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
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Falha no upload");
      const data = await res.json();
      if (data.url) onSuccess(data.url);
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

          {/* Formulário Base de Cabeçalho & SEO da Página */}
          {selectedPage && (
            <form
              className="rounded-3xl border bg-[var(--surface)] p-6 shadow-xs sm:p-8"
              onSubmit={savePage}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-widest text-[var(--gold)]">
                    Cabeçalho & SEO
                  </span>
                  <h2 className="display text-2xl sm:text-3xl font-bold text-[var(--plum)]">
                    {selectedPage.navigationLabel}
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                    Rota pública: /
                    {selectedPage.slug === "home" ? "" : selectedPage.slug}
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
                <Input
                  label="Texto de apoio (Eyebrow)"
                  value={selectedPage.eyebrow}
                  onChange={(value) =>
                    patchPage({ eyebrow: emptyToNull(value) })
                  }
                />
                <div className="md:col-span-2">
                  <Input
                    label="Título da página"
                    value={selectedPage.title}
                    onChange={(value) => patchPage({ title: value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Título principal (Heading)"
                    value={selectedPage.heading}
                    onChange={(value) => patchPage({ heading: value })}
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Texto de introdução"
                    value={selectedPage.intro}
                    onChange={(value) =>
                      patchPage({ intro: emptyToNull(value) })
                    }
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    label="Conteúdo complementar"
                    value={selectedPage.body}
                    onChange={(value) =>
                      patchPage({ body: emptyToNull(value) })
                    }
                    rows={4}
                  />
                </div>
                <Input
                  label="Texto do botão (CTA)"
                  value={selectedPage.ctaLabel}
                  onChange={(value) =>
                    patchPage({ ctaLabel: emptyToNull(value) })
                  }
                />
                <Input
                  label="Destino do botão (URL / Rota)"
                  value={selectedPage.ctaHref}
                  onChange={(value) =>
                    patchPage({ ctaHref: emptyToNull(value) })
                  }
                />
                <Input
                  label="Título para motores de busca (SEO Title)"
                  value={selectedPage.seoTitle}
                  onChange={(value) =>
                    patchPage({ seoTitle: emptyToNull(value) })
                  }
                />
                <Textarea
                  label="Descrição para motores de busca (SEO Description)"
                  value={selectedPage.seoDescription}
                  onChange={(value) =>
                    patchPage({ seoDescription: emptyToNull(value) })
                  }
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
                          label="Eyebrow do Hero"
                          value={homeContent.hero_eyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({ ...p, hero_eyebrow: v }))
                          }
                        />
                        <Input
                          label="Título principal"
                          value={homeContent.hero_title}
                          onChange={(v) =>
                            setHomeContent((p) => ({ ...p, hero_title: v }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Texto do hero"
                        rows={3}
                        value={homeContent.hero_text}
                        onChange={(v) =>
                          setHomeContent((p) => ({ ...p, hero_text: v }))
                        }
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Botão primário — texto"
                          value={homeContent.hero_primaryCtaText}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero_primaryCtaText: v,
                            }))
                          }
                        />
                        <Input
                          label="Botão primário — URL"
                          value={homeContent.hero_primaryCtaHref}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero_primaryCtaHref: v,
                            }))
                          }
                        />
                        <Input
                          label="Botão secundário — texto"
                          value={homeContent.hero_secondaryCtaText}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero_secondaryCtaText: v,
                            }))
                          }
                        />
                        <Input
                          label="Botão secundário — URL"
                          value={homeContent.hero_secondaryCtaHref}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero_secondaryCtaHref: v,
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
                          value={homeContent.hero_cardEyebrow}
                          onChange={(v) =>
                            setHomeContent((p) => ({
                              ...p,
                              hero_cardEyebrow: v,
                            }))
                          }
                        />
                        <Input
                          label="Título do card"
                          value={homeContent.hero_cardTitle}
                          onChange={(v) =>
                            setHomeContent((p) => ({ ...p, hero_cardTitle: v }))
                          }
                        />
                      </div>
                      <Textarea
                        label="Texto do card"
                        rows={2}
                        value={homeContent.hero_cardText}
                        onChange={(v) =>
                          setHomeContent((p) => ({ ...p, hero_cardText: v }))
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-[var(--plum)] uppercase tracking-wider border-b pb-2">
                        Áreas de Atuação (4 cards)
                      </h4>
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
