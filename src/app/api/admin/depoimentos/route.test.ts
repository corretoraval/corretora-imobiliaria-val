import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const depoimento = {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { prisma: { depoimento } };
});

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

let route: typeof import("./route");
let idRoute: typeof import("./[id]/route");

type DepoimentoMock = {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type PrismaMock = { prisma: { depoimento: DepoimentoMock } };

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
  idRoute = await import("./[id]/route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/admin/depoimentos route handlers", () => {
  it("GET returns 401 if user is not admin", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await route.GET();
    expect(res.status).toBe(401);
  });

  it("GET returns items list when admin", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.depoimento.findMany.mockResolvedValue([
      { id: "1", clientName: "Maria", text: "Excelente atendimento", isPublished: true },
    ]);
    const res = await route.GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].clientName).toBe("Maria");
  });

  it("POST returns 400 when body validation fails", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const req = new Request("http://localhost/api/admin/depoimentos", {
      method: "POST",
      body: JSON.stringify({ clientName: "M" }), // too short
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(res.status).toBe(400);
  });

  it("POST creates depoimento successfully when data is valid", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.depoimento.create.mockResolvedValue({
      id: "dep-1",
      clientName: "Carlos Pereira",
      text: "Serviço impecável e muita agilidade.",
      role: "Investidor",
      avatarUrl: null,
      isPublished: true,
      sortOrder: 0,
    });

    const req = new Request("http://localhost/api/admin/depoimentos", {
      method: "POST",
      body: JSON.stringify({
        clientName: "Carlos Pereira",
        text: "Serviço impecável e muita agilidade.",
        role: "Investidor",
        avatarUrl: null,
        isPublished: true,
        sortOrder: 0,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(res.status).toBe(201);
    expect(prismaMock.prisma.depoimento.create).toHaveBeenCalled();
  });

  it("PUT updates depoimento successfully", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.depoimento.update.mockResolvedValue({
      id: "dep-1",
      clientName: "Carlos Atualizado",
      text: "Texto atualizado do depoimento com mais de dez caracteres.",
      role: "Proprietário",
      avatarUrl: null,
      isPublished: true,
      sortOrder: 1,
    });

    const req = new Request("http://localhost/api/admin/depoimentos/dep-1", {
      method: "PUT",
      body: JSON.stringify({
        clientName: "Carlos Atualizado",
        text: "Texto atualizado do depoimento com mais de dez caracteres.",
        role: "Proprietário",
        avatarUrl: null,
        isPublished: true,
        sortOrder: 1,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await idRoute.PUT(req, {
      params: Promise.resolve({ id: "dep-1" }),
    });
    expect(res.status).toBe(200);
    expect(prismaMock.prisma.depoimento.update).toHaveBeenCalled();
  });

  it("DELETE removes depoimento successfully", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.depoimento.delete.mockResolvedValue({ id: "dep-1" });

    const req = new Request("http://localhost/api/admin/depoimentos/dep-1", {
      method: "DELETE",
    });
    const res = await idRoute.DELETE(req, {
      params: Promise.resolve({ id: "dep-1" }),
    });
    expect(res.status).toBe(200);
    expect(prismaMock.prisma.depoimento.delete).toHaveBeenCalledWith({
      where: { id: "dep-1" },
    });
  });
});
