import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";
import { findAvailableSlug } from "@/lib/identifiers";
import { prisma } from "@/lib/prisma";
import { sanitizeBlogPostContent } from "@/lib/sanitize-blog";

export const categories = BLOG_CATEGORIES;

export const blogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, "O slug deve ter pelo menos 3 caracteres")
    .max(200, "O slug não pode ter mais de 200 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Formato de URL amigável inválido")
    .optional(),
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(200, "O título não pode ter mais de 200 caracteres"),
  summary: z
    .string()
    .trim()
    .min(10, "O resumo deve ter pelo menos 10 caracteres")
    .max(500, "O resumo não pode ter mais de 500 caracteres"),
  content: z.string().trim().min(1, "O conteúdo do post não pode estar vazio"),
  category: z.enum(BLOG_CATEGORIES),
  coverImage: z.string().trim().url().nullable().optional(),
  authorName: z
    .string()
    .trim()
    .min(2, "Nome do autor deve ter pelo menos 2 caracteres")
    .max(100)
    .default("Corretora Val"),
  readingTimeMinutes: z.coerce.number().int().positive().default(5),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(320).nullable().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues }, { status: 400 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Já existe um post com essa URL amigável. Tente outro título ou edite o slug.",
        },
        { status: 409 },
      );
    }
  }

  if (error instanceof Error) {
    console.error("API /api/admin/blog error:", error);
  }

  return NextResponse.json(
    { error: "Erro interno do servidor" },
    { status: 500 },
  );
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const posts = await prisma.postBlog.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("API /api/admin/blog GET error:", error);
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = blogPostSchema.parse(body);
    const slug = await findAvailableSlug(
      data.slug || data.title,
      async (candidate) =>
        Boolean(
          await prisma.postBlog.findUnique({
            where: { slug: candidate },
            select: { id: true },
          }),
        ),
    );

    const seoTitle = data.seoTitle?.trim() || data.title;
    const seoDescription = data.seoDescription?.trim() || data.summary;
    const content = sanitizeBlogPostContent(data.content);
    const publishedAt = new Date();

    const created = await prisma.postBlog.create({
      data: {
        ...data,
        slug,
        content,
        seoTitle,
        seoDescription,
        publishedAt,
      },
    });

    try {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      if (created.slug) {
        revalidatePath(`/blog/${created.slug}`);
      }
    } catch (e) {
      console.error("Revalidate after blog create failed:", e);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("API /api/admin/blog POST error:", error);
    return errorResponse(error);
  }
}
