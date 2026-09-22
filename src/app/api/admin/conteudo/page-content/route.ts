import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 });

  const page = await prisma.paginaSite.findUnique({
    where: { slug },
    select: { slug: true, content: true },
  });
  if (!page) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
  return NextResponse.json(page);
}
