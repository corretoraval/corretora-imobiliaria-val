import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(1000).nullable().optional(),
  photoUrl: z.string().trim().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.membroEquipe.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = schema.parse(await request.json());
    const item = await prisma.membroEquipe.create({
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio ?? null,
        photoUrl: data.photoUrl ?? null,
        sortOrder: data.sortOrder,
      },
    });
    revalidatePath("/quem-somos");
    revalidatePath("/admin/conteudo");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
