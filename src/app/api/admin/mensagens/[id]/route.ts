import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

const updateSchema = z.object({
  status: z
    .enum(["NOVO", "EM_ATENDIMENTO", "CONCLUIDO", "ARQUIVADO"])
    .optional(),
  isRead: z.boolean().optional(),
});

// PATCH /api/admin/mensagens/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = updateSchema.parse(await request.json());

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.isRead !== undefined) {
      data.isRead = body.isRead;
      data.readAt = body.isRead ? new Date() : null;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error(`PATCH /api/admin/mensagens/${id} error:`, error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE /api/admin/mensagens/[id] — soft delete via status ARQUIVADO
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.lead.update({
      where: { id },
      data: { status: "ARQUIVADO" },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`DELETE /api/admin/mensagens/${id} error:`, error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
