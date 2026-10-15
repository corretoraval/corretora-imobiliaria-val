import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const lead = {
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  };
  return {
    prisma: {
      lead,
      $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    },
  };
});

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

let bulkRoute: typeof import("./route");
let singleRoute: typeof import("./[id]/route");

type LeadMock = {
  findMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
};

type PrismaMock = {
  prisma: {
    lead: LeadMock;
    $transaction: ReturnType<typeof vi.fn>;
  };
};

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  bulkRoute = await import("./route");
  singleRoute = await import("./[id]/route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/admin/mensagens handlers", () => {
  describe("GET /api/admin/mensagens", () => {
    it("retorna 401 para usuários não autenticados como admin", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = new Request("http://localhost/api/admin/mensagens");
      const res = await bulkRoute.GET(req);
      expect(res.status).toBe(401);
    });

    it("retorna lista de mensagens para admin", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
      prismaMock.prisma.lead.count.mockResolvedValue(1);
      prismaMock.prisma.lead.findMany.mockResolvedValue([
        {
          id: "lead_1",
          name: "Cliente Teste",
          email: "cliente@teste.com",
          phone: "47999999999",
          type: "CONTATO",
          subject: "Interesse",
          message: "Olá",
          propertyAddress: null,
          propertyType: null,
          status: "NOVO",
          emailStatus: "sent",
          emailError: null,
          isRead: false,
          readAt: null,
          createdAt: new Date(),
        },
      ]);

      const req = new Request("http://localhost/api/admin/mensagens?page=1");
      const res = await bulkRoute.GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.total).toBe(1);
      expect(data.leads).toHaveLength(1);
    });
  });

  describe("DELETE /api/admin/mensagens (exclusão em massa)", () => {
    it("retorna 401 se não for admin", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = new Request("http://localhost/api/admin/mensagens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ["id1", "id2"] }),
      });
      const res = await bulkRoute.DELETE(req);
      expect(res.status).toBe(401);
    });

    it("retorna 400 se a lista de ids for vazia", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
      const req = new Request("http://localhost/api/admin/mensagens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [] }),
      });
      const res = await bulkRoute.DELETE(req);
      expect(res.status).toBe(400);
    });

    it("exclui múltiplos leads do banco local via deleteMany sem tocar provedores externos", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
      prismaMock.prisma.lead.deleteMany.mockResolvedValue({ count: 2 });

      const req = new Request("http://localhost/api/admin/mensagens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ["lead_1", "lead_2"] }),
      });
      const res = await bulkRoute.DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.count).toBe(2);

      expect(prismaMock.prisma.lead.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["lead_1", "lead_2"] } },
      });
    });
  });

  describe("DELETE /api/admin/mensagens/[id] (exclusão individual)", () => {
    it("retorna 401 se não for admin", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const req = new Request("http://localhost/api/admin/mensagens/lead_1", {
        method: "DELETE",
      });
      const res = await singleRoute.DELETE(req, {
        params: Promise.resolve({ id: "lead_1" }),
      });
      expect(res.status).toBe(401);
    });

    it("exclui lead individual do banco local via delete", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
      prismaMock.prisma.lead.delete.mockResolvedValue({ id: "lead_1" });

      const req = new Request("http://localhost/api/admin/mensagens/lead_1", {
        method: "DELETE",
      });
      const res = await singleRoute.DELETE(req, {
        params: Promise.resolve({ id: "lead_1" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);

      expect(prismaMock.prisma.lead.delete).toHaveBeenCalledWith({
        where: { id: "lead_1" },
      });
    });

    it("trata erro P2025 se o registro já tiver sido excluído", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
      prismaMock.prisma.lead.delete.mockRejectedValue({ code: "P2025" });

      const req = new Request("http://localhost/api/admin/mensagens/lead_1", {
        method: "DELETE",
      });
      const res = await singleRoute.DELETE(req, {
        params: Promise.resolve({ id: "lead_1" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.message).toContain("já excluída");
    });
  });
});
