import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  clientName: z.string().trim().min(2).max(80),
  text: z.string().trim().min(10).max(1_200),
  role: z.string().trim().max(120).nullable(),
  avatarUrl: z.string().trim().url().nullable(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const data = schema.parse(await request.json());
    const item = await prisma.depoimento.update({
      where: { id },
      data,
    });
    revalidatePath("/depoimentos");
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.depoimento.delete({ where: { id } });
  revalidatePath("/depoimentos");
  return NextResponse.json({ ok: true });
}
