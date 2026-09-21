import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => {
  const postBlog = {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { prisma: { postBlog } };
});

const mockGetServerSession = vi.fn();
vi.mock("next-auth/next", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

let blogRoute: typeof import("./route");
let blogIdRoute: typeof import("./[id]/route");

type PostBlogMock = {
  findMany: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

type PrismaMock = { prisma: { postBlog: PostBlogMock } };

let prismaMock: PrismaMock;

beforeAll(async () => {
  prismaMock = (await import("@/lib/prisma")) as unknown as PrismaMock;
  blogRoute = await import("./route");
  blogIdRoute = await import("./[id]/route");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("API /api/admin/blog route handlers", () => {
  it("POST creates a post and sanitizes malicious HTML script tags", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    prismaMock.prisma.postBlog.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "post-1", ...data }),
    );

    const req = new Request("http://localhost/api/admin/blog", {
      method: "POST",
      body: JSON.stringify({
        title: "Dicas de Investimento",
        slug: "dicas-de-investimento",
        summary: "Resumo explicativo com mais de 10 caracteres.",
        content:
          "<p>Texto seguro</p><script>alert('malicious')</script><a href='https://val.com'>Link</a>",
        category: "Investimentos",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await blogRoute.POST(req);
    expect(res.status).toBe(201);

    const createCall = prismaMock.prisma.postBlog.create.mock.calls[0][0];
    expect(createCall.data.content).not.toContain("<script>");
    expect(createCall.data.content).toContain("<p>Texto seguro</p>");
    expect(createCall.data.content).toContain("href=\"https://val.com\"");
  });

  it("PUT does NOT change publishedAt when already published post is edited", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const originalPublishedAt = new Date("2025-01-15T10:00:00Z");

    prismaMock.prisma.postBlog.findUnique.mockResolvedValue({
      id: "post-1",
      slug: "post-ja-publicado",
      title: "Título Antigo",
      summary: "Resumo antigo válido.",
      content: "<p>Conteúdo</p>",
      category: "Mercado",
      isPublished: true,
      publishedAt: originalPublishedAt,
    });

    prismaMock.prisma.postBlog.update.mockImplementation(({ data }) =>
      Promise.resolve({ id: "post-1", ...data }),
    );

    const req = new Request("http://localhost/api/admin/blog/post-1", {
      method: "PUT",
      body: JSON.stringify({
        title: "Título Atualizado",
        content: "<p>Conteúdo novo com imagem <img src='https://cdn.com/foto.jpg' alt='Foto'/></p>",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await blogIdRoute.PUT(req, {
      params: Promise.resolve({ id: "post-1" }),
    });
    expect(res.status).toBe(200);

    const updateCall = prismaMock.prisma.postBlog.update.mock.calls[0][0];
    expect(updateCall.data.publishedAt).toBeUndefined();
    expect(updateCall.data.title).toBe("Título Atualizado");
    expect(updateCall.data.content).toContain("<img");
  });

  it("PUT updates publishedAt when transitioning from draft (isPublished: false) to published (isPublished: true)", async () => {
    mockGetServerSession.mockResolvedValue({ user: { role: "admin" } });
    const originalDraftDate = new Date("2025-01-01T00:00:00Z");

    prismaMock.prisma.postBlog.findUnique.mockResolvedValue({
      id: "post-2",
      slug: "post-rascunho",
      title: "Rascunho",
      summary: "Resumo antigo válido.",
      content: "<p>Conteúdo</p>",
      category: "Mercado",
      isPublished: false,
      publishedAt: originalDraftDate,
    });

    prismaMock.prisma.postBlog.update.mockImplementation(({ data }) =>
      Promise.resolve({ id: "post-2", ...data }),
    );

    const req = new Request("http://localhost/api/admin/blog/post-2", {
      method: "PUT",
      body: JSON.stringify({
        isPublished: true,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await blogIdRoute.PUT(req, {
      params: Promise.resolve({ id: "post-2" }),
    });
    expect(res.status).toBe(200);

    const updateCall = prismaMock.prisma.postBlog.update.mock.calls[0][0];
    expect(updateCall.data.isPublished).toBe(true);
    expect(updateCall.data.publishedAt).toBeInstanceOf(Date);
    expect(updateCall.data.publishedAt.getTime()).toBeGreaterThan(
      originalDraftDate.getTime(),
    );
  });
});
