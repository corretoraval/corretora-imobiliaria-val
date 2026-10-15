import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// GET /api/admin/mensagens/count
// Retorna o total de leads não lidos (status != ARQUIVADO, isRead = false)
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await prisma.lead.count({
      where: {
        isRead: false,
        status: { not: "ARQUIVADO" },
        emailStatus: { not: "spam" },
      },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/admin/mensagens/count error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
