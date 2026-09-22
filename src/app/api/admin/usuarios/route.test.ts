import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const usuario = {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { prisma: { usuario } };
});

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

let route: typeof import("./route");

type UsuarioMock = {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type PrismaMock = { prisma: { usuario: UsuarioMock } };

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  route = await import("./route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/admin/usuarios handlers", () => {
  it("POST creates a user when admin", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.usuario.create.mockResolvedValue({
      id: "1",
      email: "a@a.com",
      name: "A",
      role: "admin",
      createdAt: new Date(),
    });

    const req = new Request("http://localhost/api/admin/usuarios", {
      method: "POST",
      body: JSON.stringify({
        email: "a@a.com",
        password: "senha1234",
        name: "A",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req as Request);
    expect(prismaMock.prisma.usuario.create).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it("POST rejects duplicate email", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const err = new Error("unique") as unknown as { code?: string };
    err.code = "P2002";
    prismaMock.prisma.usuario.create.mockRejectedValue(err);

    const req = new Request("http://localhost/api/admin/usuarios", {
      method: "POST",
      body: JSON.stringify({ email: "a@a.com", password: "senha1234" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await route.POST(req as Request);
    expect(res.status).toBe(409);
  });

  it("POST rejects passwords without the required strength", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });

    const req = new Request("http://localhost/api/admin/usuarios", {
      method: "POST",
      body: JSON.stringify({ email: "a@a.com", password: "12345678" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await route.POST(req);

    expect(res.status).toBe(400);
    expect(prismaMock.prisma.usuario.create).not.toHaveBeenCalled();
  });

  it("clears mustChangePassword after the owner changes their password", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { role: "admin", email: "me@x" },
    });
    prismaMock.prisma.usuario.findUnique.mockResolvedValue({
      id: "me",
      password: "$2a$10$eLCNG7jaz2Q/DO7spGFKRucKh0r5eehv66byGhlFe8FPUT9bkWvOK",
    });

    const req = new Request("http://localhost/api/admin/usuarios", {
      method: "PUT",
      body: JSON.stringify({
        type: "changeOwnPassword",
        currentPassword: "senha1234",
        newPassword: "novaSenha9",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await route.PUT(req);

    expect(res.status).toBe(200);
    expect(prismaMock.prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: "me" },
      data: { password: expect.any(String), mustChangePassword: false },
    });
  });

  it("DELETE prevents deleting own account", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { role: "admin", email: "me@x" },
    });
    prismaMock.prisma.usuario.findUnique.mockResolvedValue({ id: "me" });
    const res = await route.DELETE(
      new Request("http://localhost/api/admin/usuarios?id=me"),
    );
    expect(prismaMock.prisma.usuario.delete).not.toHaveBeenCalled();
    expect(res.status).toBe(400);
  });
});
