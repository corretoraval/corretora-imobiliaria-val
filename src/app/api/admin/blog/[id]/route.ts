import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { findAvailableSlug } from "@/lib/identifiers";
import { prisma } from "@/lib/prisma";
import { sanitizeBlogPostContent } from "@/lib/sanitize-blog";
import { blogPostSchema } from "../route";

const blogPostUpdateSchema = blogPostSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
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
    console.error("API /api/admin/blog/[id] error:", error);
  }

  return NextResponse.json(
    { error: "Erro interno do servidor" },
    { status: 500 },
  );
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
  }

  try {
    const existing = await prisma.postBlog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const data = blogPostUpdateSchema.parse(body);

    const updatePayload: Record<string, unknown> = { ...data };

    if (data.title && !data.slug) {
      updatePayload.slug = await findAvailableSlug(
        data.title,
        async (candidate) =>
          Boolean(
            await prisma.postBlog.findFirst({
              where: { slug: candidate, NOT: { id } },
              select: { id: true },
            }),
          ),
      );
    }

    if (data.content) {
      updatePayload.content = sanitizeBlogPostContent(data.content);
    }

    // Se estiver publicando agora pela primeira vez ou saindo de rascunho para publicado
    if (data.isPublished === true && !existing.isPublished) {
      updatePayload.publishedAt = new Date();
    }

    if (data.title && !data.seoTitle && !existing.seoTitle) {
      updatePayload.seoTitle = data.title;
    }

    if (data.summary && !data.seoDescription && !existing.seoDescription) {
      updatePayload.seoDescription = data.summary;
    }

    const updated = await prisma.postBlog.update({
      where: { id },
      data: updatePayload,
    });

    try {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      if (existing.slug) {
        revalidatePath(`/blog/${existing.slug}`);
      }
      if (updated.slug && updated.slug !== existing.slug) {
        revalidatePath(`/blog/${updated.slug}`);
      }
    } catch (e) {
      console.error("Revalidate after blog update failed:", e);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("API /api/admin/blog/[id] PUT error:", error);
    return errorResponse(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
  }

  try {
    const existing = await prisma.postBlog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 },
      );
    }

    await prisma.postBlog.delete({
      where: { id },
    });

    try {
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
      if (existing.slug) {
        revalidatePath(`/blog/${existing.slug}`);
      }
    } catch (e) {
      console.error("Revalidate after blog delete failed:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /api/admin/blog/[id] DELETE error:", error);
    return errorResponse(error);
  }
}
