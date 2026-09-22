import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const marcoHistorico = {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { prisma: { marcoHistorico } };
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

type MarcoMock = {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type PrismaMock = { prisma: { marcoHistorico: MarcoMock } };

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
  idRoute = await import("./[id]/route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/admin/marcos route handlers", () => {
  it("GET returns 401 if user is not admin", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await route.GET();
    expect(res.status).toBe(401);
  });

  it("GET returns items list when admin", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.marcoHistorico.findMany.mockResolvedValue([
      {
        id: "1",
        year: 1989,
        title: "Início",
        description: "História",
        sortOrder: 0,
      },
    ]);
    const res = await route.GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].year).toBe(1989);
  });

  it("POST returns 400 when validation fails", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const req = new Request("http://localhost/api/admin/marcos", {
      method: "POST",
      body: JSON.stringify({ year: 1800 }), // year < 1900
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(res.status).toBe(400);
  });

  it("POST creates marco successfully when valid", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.marcoHistorico.create.mockResolvedValue({
      id: "m-1",
      year: 2019,
      title: "Fundação",
      description: "Recomeço",
      sortOrder: 1,
    });

    const req = new Request("http://localhost/api/admin/marcos", {
      method: "POST",
      body: JSON.stringify({
        year: 2019,
        title: "Fundação",
        description: "Recomeço",
        sortOrder: 1,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(res.status).toBe(201);
    expect(prismaMock.prisma.marcoHistorico.create).toHaveBeenCalled();
  });

  it("PUT updates marco successfully", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.marcoHistorico.update.mockResolvedValue({
      id: "m-1",
      year: 2020,
      title: "Novo Título",
      description: "Nova Descrição",
      sortOrder: 2,
    });

    const req = new Request("http://localhost/api/admin/marcos/m-1", {
      method: "PUT",
      body: JSON.stringify({
        year: 2020,
        title: "Novo Título",
        description: "Nova Descrição",
        sortOrder: 2,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await idRoute.PUT(req, {
      params: Promise.resolve({ id: "m-1" }),
    });
    expect(res.status).toBe(200);
    expect(prismaMock.prisma.marcoHistorico.update).toHaveBeenCalled();
  });

  it("DELETE removes marco successfully", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.marcoHistorico.delete.mockResolvedValue({ id: "m-1" });

    const req = new Request("http://localhost/api/admin/marcos/m-1", {
      method: "DELETE",
    });
    const res = await idRoute.DELETE(req, {
      params: Promise.resolve({ id: "m-1" }),
    });
    expect(res.status).toBe(200);
    expect(prismaMock.prisma.marcoHistorico.delete).toHaveBeenCalledWith({
      where: { id: "m-1" },
    });
  });
});
