import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { blogPostSchema } from "@/lib/blog-constants";
import { findAvailableSlug } from "@/lib/identifiers";
import { prisma } from "@/lib/prisma";
import { sanitizeBlogPostContent } from "@/lib/sanitize-blog";

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
