import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

const PAGE_SIZE = 30;

// GET /api/admin/mensagens?page=1&status=NOVO&email=sent&unread=true
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const status = searchParams.get("status") ?? undefined;
  const emailStatus = searchParams.get("email") ?? undefined;
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const where = {
      ...(status ? { status: status as "NOVO" | "EM_ATENDIMENTO" | "CONCLUIDO" | "ARQUIVADO" } : {}),
      ...(emailStatus ? { emailStatus } : {}),
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          type: true,
          subject: true,
          message: true,
          propertyAddress: true,
          propertyType: true,
          status: true,
          emailStatus: true,
          emailError: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("GET /api/admin/mensagens error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// PATCH /api/admin/mensagens — bulk mark as read
const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  isRead: z.boolean(),
});

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bulkSchema.parse(await request.json());
    await prisma.lead.updateMany({
      where: { id: { in: body.ids } },
      data: {
        isRead: body.isRead,
        readAt: body.isRead ? new Date() : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/admin/mensagens error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE /api/admin/mensagens — exclusão em massa de mensagens
const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Selecione ao menos uma mensagem para excluir."),
});

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bulkDeleteSchema.parse(await request.json());
    const result = await prisma.lead.deleteMany({
      where: { id: { in: body.ids } },
    });
    return NextResponse.json({ ok: true, count: result.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }
    console.error("DELETE /api/admin/mensagens error:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir mensagens." },
      { status: 500 },
    );
  }
}
