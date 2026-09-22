import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const configuracaoSite = {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  };
  const paginaSite = {
    findMany: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  };
  return {
    prisma: {
      configuracaoSite,
      paginaSite,
      $transaction: vi.fn(),
    },
  };
});

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

let route: typeof import("./route");

type PrismaMock = {
  prisma: {
    configuracaoSite: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    paginaSite: {
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };
};

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
  prismaMock.prisma.$transaction.mockImplementation((operations) =>
    Promise.all(operations),
  );
});

describe("API /api/admin/conteudo PUT", () => {
  it("saves general settings without duplicate discriminator errors", async () => {
    const settings = {
      brandName: "Val Imóveis",
      tagline: "Confiança que abre portas.",
      phone: "(47) 99999-0000",
      whatsapp: "5547999990000",
      email: "contato@val.example",
      address: "Balneário Camboriú - SC",
      instagramUrl: "https://www.instagram.com/valdete_goncalvesdemelo/",
      creci: "CRECI/SC 56372-F",
      themePreset: "ametista-ouro",
      primaryColor: "#35104f",
      primaryHover: "#4a1768",
      accentColor: "#b58a3a",
      accentLightColor: "#d8bd82",
      backgroundColor: "#f8f5ef",
      titleFont: "cormorant",
      bodyFont: "manrope",
    };
    prismaMock.prisma.configuracaoSite.upsert.mockResolvedValue({
      id: "principal",
      ...settings,
    });

    const response = await route.PUT(
      new Request("http://localhost/api/admin/conteudo", {
        method: "PUT",
        body: JSON.stringify({ type: "settings", settings }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.prisma.configuracaoSite.upsert).toHaveBeenCalled();
  });

  it("saves structured Home content using the ContentManager payload", async () => {
    const content = {
      hero: {
        eyebrow: "Novo eyebrow",
        title: "Confiança que abre portas.",
        text: "Nova descrição",
      },
      services: [
        { key: "comprar", title: "Comprar", text: "Texto", href: "/imoveis" },
        { key: "alugar", title: "Alugar", text: "Texto", href: "/imoveis" },
        {
          key: "temporada",
          title: "Temporada",
          text: "Texto",
          href: "/imoveis",
        },
        {
          key: "administrar",
          title: "Administrar",
          text: "Texto",
          href: "/administracao",
        },
      ],
    };
    prismaMock.prisma.paginaSite.update.mockResolvedValue({
      slug: "home",
      content,
    });

    const response = await route.PUT(
      new Request("http://localhost/api/admin/conteudo", {
        method: "PUT",
        body: JSON.stringify({
          type: "page-content",
          pageContent: { slug: "home", content },
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.prisma.paginaSite.update).toHaveBeenCalledWith({
      where: { slug: "home" },
      data: { content },
    });
  });

  it("saves a page payload with the distinct page discriminator", async () => {
    const page = {
      slug: "contato",
      navigationLabel: "Contato",
      eyebrow: null,
      title: "Fale conosco",
      heading: "Entre em contato",
      intro: null,
      body: null,
      ctaLabel: null,
      ctaHref: null,
      seoTitle: null,
      seoDescription: null,
      isPublished: true,
      sortOrder: 4,
    };
    prismaMock.prisma.paginaSite.upsert.mockResolvedValue(page);

    const response = await route.PUT(
      new Request("http://localhost/api/admin/conteudo", {
        method: "PUT",
        body: JSON.stringify({ type: "page", page }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.prisma.paginaSite.upsert).toHaveBeenCalled();
  });
});
