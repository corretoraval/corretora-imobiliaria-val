import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ZodError, z } from "zod";
import { authOptions } from "@/lib/auth";
import { passwordSchema } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().max(120).optional(),
  password: passwordSchema,
  role: z.enum(["admin", "user"]).optional(),
});

const updateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("changeOwnPassword"),
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
  }),
  z.object({
    type: z.literal("updateUser"),
    id: z.string().min(1),
    email: z.string().trim().email().optional(),
    name: z.string().trim().max(120).optional(),
    role: z.enum(["admin", "user"]).optional(),
  }),
  z.object({
    type: z.literal("resetPassword"),
    id: z.string().min(1),
  }),
]);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const hash = await bcrypt.hash(body.password, 10);
    const role = body.role ?? "admin";
    const created = await prisma.usuario.create({
      data: {
        email: body.email.toLowerCase().trim(),
        name: body.name ?? null,
        password: hash,
        role,
        mustChangePassword: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    const maybeErr = error as unknown as { code?: string };
    if (
      maybeErr?.code === "P2002" ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002")
    ) {
      return NextResponse.json(
        { error: "E-mail já está em uso." },
        { status: 409 },
      );
    }

    console.error("API /api/admin/usuarios POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const payload = updateSchema.parse(await req.json());

    if (payload.type === "changeOwnPassword") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const user = await prisma.usuario.findUnique({
        where: { email: session.user.email },
      });
      if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      const match = await bcrypt.compare(
        payload.currentPassword,
        user.password,
      );
      if (!match)
        return NextResponse.json(
          { error: "Current password incorrect" },
          { status: 400 },
        );
      const hash = await bcrypt.hash(payload.newPassword, 10);
      await prisma.usuario.update({
        where: { id: user.id },
        data: { password: hash, mustChangePassword: false },
      });
      return NextResponse.json({ success: true });
    }

    // The following actions require admin
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (payload.type === "updateUser") {
      const data: { email?: string; name?: string | null; role?: string } = {};
      if (payload.email !== undefined)
        data.email = payload.email.toLowerCase().trim();
      if (payload.name !== undefined) data.name = payload.name ?? null;
      if (payload.role !== undefined) data.role = payload.role;
      const updated = await prisma.usuario.update({
        where: { id: payload.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      return NextResponse.json(updated);
    }

    if (payload.type === "resetPassword") {
      // generate temporary password
      const temp = `${Math.random().toString(36).slice(-10)}A1`;
      const hash = await bcrypt.hash(temp, 10);
      await prisma.usuario.update({
        where: { id: payload.id },
        data: { password: hash, mustChangePassword: true },
      });
      return NextResponse.json({ tempPassword: temp });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    const maybeErr = error as unknown as { code?: string };
    if (
      maybeErr?.code === "P2002" ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002")
    ) {
      return NextResponse.json(
        { error: "E-mail já está em uso." },
        { status: 409 },
      );
    }

    console.error("API /api/admin/usuarios PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    // resolve current user's id from DB to avoid relying on session.user.id
    const me = await prisma.usuario.findUnique({
      where: { email: session.user.email },
    });
    if (me?.id === id) {
      return NextResponse.json(
        { error: "Cannot delete own account" },
        { status: 400 },
      );
    }
  }

  try {
    await prisma.usuario.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /api/admin/usuarios DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
