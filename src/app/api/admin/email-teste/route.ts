import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTestEmail } from "@/lib/email";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

// POST /api/admin/email-teste
// Dispara um e-mail de teste para o contactEmail cadastrado.
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await prisma.configuracaoSite.findUnique({
      where: { id: "principal" },
      select: { contactEmail: true },
    });

    if (!config?.contactEmail) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nenhum e-mail de recebimento configurado. Salve o e-mail antes de testar.",
        },
        { status: 400 },
      );
    }

    const result = await sendTestEmail(config.contactEmail);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: `E-mail de teste enviado para ${config.contactEmail}. Verifique sua caixa de entrada.`,
    });
  } catch (error) {
    console.error("POST /api/admin/email-teste error:", error);
    return NextResponse.json({ ok: false, error: "Erro interno." }, { status: 500 });
  }
}
