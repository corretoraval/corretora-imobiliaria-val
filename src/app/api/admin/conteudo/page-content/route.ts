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

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
  }

  const page = await prisma.paginaSite.findUnique({
    where: { slug },
    select: { slug: true, content: true },
  });
  if (!page) {
    return NextResponse.json(
      { error: "Página não encontrada", slug, content: null },
      { status: 404 },
    );
  }

  return NextResponse.json({ slug: page.slug, content: page.content ?? null });
}
