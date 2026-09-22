import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Provide module-level mocks via factory (hoisted safely)
vi.mock("@/lib/prisma", () => {
  const imovel = {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  };
  const foto = {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  };
  return {
    prisma: {
      imovel,
      foto,
      $transaction: vi.fn(async (callback) => callback({ imovel, foto })),
    },
  };
});

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

type ImovelMock = {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
};

type FotoMock = {
  createMany: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
};

type PrismaMock = {
  prisma: {
    imovel: ImovelMock;
    foto: FotoMock;
    $transaction: ReturnType<typeof vi.fn>;
  };
};

let route: typeof import("./route");
let prismaMock: PrismaMock;

beforeAll(async () => {
  // Import after mocks are registered
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/imoveis handlers", () => {
  it("GET returns list of properties", async () => {
    const sample = [{ id: "1", title: "A", salePrice: 100 }];
    prismaMock.prisma.imovel.findMany.mockResolvedValue(sample);

    const res = await route.GET(new Request("http://localhost/api/imoveis"));
    expect(prismaMock.prisma.imovel.findMany).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("POST rejects when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/imoveis", {
      method: "POST",
      body: JSON.stringify({ title: "X" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(prismaMock.prisma.imovel.create).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
  });

  it("POST creates when admin", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.imovel.create.mockResolvedValue({
      id: "abc",
      title: "X",
    });
    prismaMock.prisma.imovel.findMany.mockResolvedValue([]);

    const payload = {
      code: "VAL-100",
      slug: "apartamento-teste",
      title: "Apartamento teste",
      propertyType: "Apartamento",
      purpose: "VENDA",
      city: "Camboriú",
      salePrice: 10,
    };
    const req = new Request("http://localhost/api/imoveis", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(prismaMock.prisma.imovel.create).toHaveBeenCalledWith({
      data: expect.objectContaining(payload),
    });
    expect(res.status).toBe(201);
  });

  it("saves photos and preserves their order and cover", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.imovel.create.mockResolvedValue({
      id: "abc",
      slug: "apartamento-teste",
    });
    prismaMock.prisma.imovel.findMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/imoveis", {
      method: "POST",
      body: JSON.stringify({
        slug: "apartamento-teste",
        title: "Apartamento teste",
        propertyType: "Apartamento",
        purpose: "VENDA",
        city: "Camboriú",
        salePrice: 10,
        photos: [
          { url: "/uploads/second.jpg", isCover: false },
          { url: "/uploads/cover.jpg", isCover: true },
        ],
      }),
      headers: { "Content-Type": "application/json" },
    });

    await route.POST(req);

    expect(prismaMock.prisma.foto.createMany).toHaveBeenCalledWith({
      data: [
        {
          url: "/uploads/second.jpg",
          alt: null,
          position: 0,
          isCover: false,
          imovelId: "abc",
        },
        {
          url: "/uploads/cover.jpg",
          alt: null,
          position: 1,
          isCover: true,
          imovelId: "abc",
        },
      ],
    });
  });

  it("replaces photos when an edited property is saved", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.imovel.update.mockResolvedValue({
      id: "abc",
      slug: "apartamento-teste",
    });

    const req = new Request("http://localhost/api/imoveis?id=abc", {
      method: "PUT",
      body: JSON.stringify({
        title: "Apartamento atualizado",
        photos: [{ url: "/uploads/new.jpg", isCover: true }],
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await route.PUT(req);

    expect(res.status).toBe(200);
    expect(prismaMock.prisma.foto.deleteMany).toHaveBeenCalledWith({
      where: { imovelId: "abc" },
    });
    expect(prismaMock.prisma.foto.createMany).toHaveBeenCalledWith({
      data: [
        {
          url: "/uploads/new.jpg",
          alt: null,
          position: 0,
          isCover: true,
          imovelId: "abc",
        },
      ],
    });
  });

  it("PUT requires id and admin", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const req = new Request("http://localhost/api/imoveis", {
      method: "PUT",
      body: JSON.stringify({ salePrice: 200 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.PUT(req);
    expect(prismaMock.prisma.imovel.update).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });

  it("DELETE archives instead of permanently deleting a property", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const res = await route.DELETE(
      new Request("http://localhost/api/imoveis?id=abc"),
    );
    expect(prismaMock.prisma.imovel.update).toHaveBeenCalledWith({
      where: { id: "abc" },
      data: expect.objectContaining({
        status: "ARQUIVADO",
        isFeatured: false,
      }),
    });
    expect(res.status).toBe(200);
  });
});
