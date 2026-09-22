import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const membroEquipe = {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { prisma: { membroEquipe } };
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

type MembroMock = {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type PrismaMock = { prisma: { membroEquipe: MembroMock } };

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
  idRoute = await import("./[id]/route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/admin/equipe route handlers", () => {
  it("GET returns 401 if user is not admin", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await route.GET();
    expect(res.status).toBe(401);
  });

  it("GET returns items list when admin", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.membroEquipe.findMany.mockResolvedValue([
      { id: "1", name: "Valdete", role: "Fundadora", sortOrder: 0 },
    ]);
    const res = await route.GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe("Valdete");
  });

  it("POST returns 400 when validation fails", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const req = new Request("http://localhost/api/admin/equipe", {
      method: "POST",
      body: JSON.stringify({ name: "V" }), // name min 2, missing role
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(res.status).toBe(400);
  });

  it("POST creates membro successfully when valid", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.membroEquipe.create.mockResolvedValue({
      id: "eq-1",
      name: "Felipe Cesar",
      role: "Gestor",
      bio: "Operações",
      photoUrl: null,
      sortOrder: 1,
    });

    const req = new Request("http://localhost/api/admin/equipe", {
      method: "POST",
      body: JSON.stringify({
        name: "Felipe Cesar",
        role: "Gestor",
        bio: "Operações",
        photoUrl: null,
        sortOrder: 1,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req);
    expect(res.status).toBe(201);
    expect(prismaMock.prisma.membroEquipe.create).toHaveBeenCalled();
  });

  it("PUT updates membro successfully", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.membroEquipe.update.mockResolvedValue({
      id: "eq-1",
      name: "Felipe Cesar Atualizado",
      role: "Diretor de Operações",
      bio: "Nova bio",
      photoUrl: null,
      sortOrder: 1,
    });

    const req = new Request("http://localhost/api/admin/equipe/eq-1", {
      method: "PUT",
      body: JSON.stringify({
        name: "Felipe Cesar Atualizado",
        role: "Diretor de Operações",
        bio: "Nova bio",
        photoUrl: null,
        sortOrder: 1,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await idRoute.PUT(req, {
      params: Promise.resolve({ id: "eq-1" }),
    });
    expect(res.status).toBe(200);
    expect(prismaMock.prisma.membroEquipe.update).toHaveBeenCalled();
  });

  it("DELETE removes membro successfully", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.membroEquipe.delete.mockResolvedValue({ id: "eq-1" });

    const req = new Request("http://localhost/api/admin/equipe/eq-1", {
      method: "DELETE",
    });
    const res = await idRoute.DELETE(req, {
      params: Promise.resolve({ id: "eq-1" }),
    });
    expect(res.status).toBe(200);
    expect(prismaMock.prisma.membroEquipe.delete).toHaveBeenCalledWith({
      where: { id: "eq-1" },
    });
  });
});
