import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock do prisma hoisted
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $queryRaw: vi.fn(),
    },
  };
});

describe("API /api/health handler", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.HEALTH_CHECK_SECRET;
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("retorna HTTP 200 e database: connected quando a consulta tem sucesso", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("./route");
    const req = new Request("http://localhost/api/health");
    const res = await GET(req);

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.database).toBe("connected");
    expect(typeof json.latencyMs).toBe("number");
    expect(json.timestamp).toBeDefined();

    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("rejeita com HTTP 401 quando HEALTH_CHECK_SECRET está ativo e token não é enviado", async () => {
    process.env.HEALTH_CHECK_SECRET = "super-secret-123";

    const { prisma } = await import("@/lib/prisma");
    const { GET } = await import("./route");

    const req = new Request("http://localhost/api/health");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.status).toBe("unauthorized");
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("rejeita com HTTP 401 quando token enviado é incorreto", async () => {
    process.env.HEALTH_CHECK_SECRET = "super-secret-123";

    const { prisma } = await import("@/lib/prisma");
    const { GET } = await import("./route");

    const req = new Request("http://localhost/api/health", {
      headers: {
        Authorization: "Bearer token-errado",
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("permite a requisição com HTTP 200 quando Bearer token está correto", async () => {
    process.env.HEALTH_CHECK_SECRET = "super-secret-123";

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("./route");

    const req = new Request("http://localhost/api/health", {
      headers: {
        Authorization: "Bearer super-secret-123",
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("permite a requisição com HTTP 200 quando x-health-check-secret está correto", async () => {
    process.env.HEALTH_CHECK_SECRET = "super-secret-123";

    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);

    const { GET } = await import("./route");

    const req = new Request("http://localhost/api/health", {
      headers: {
        "x-health-check-secret": "super-secret-123",
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("retorna HTTP 500 e database: disconnected quando a consulta ao banco falha", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.$queryRaw).mockRejectedValue(
      new Error("Conexão com banco recusada"),
    );

    const { GET } = await import("./route");
    const req = new Request("http://localhost/api/health");
    const res = await GET(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.status).toBe("error");
    expect(json.database).toBe("disconnected");
    expect(json.timestamp).toBeDefined();
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });
});
