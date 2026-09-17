import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request: Request) {
  // Verificação de token de segurança caso configurado no ambiente
  const expectedSecret =
    process.env.HEALTH_CHECK_SECRET || process.env.CRON_SECRET;

  if (expectedSecret) {
    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-health-check-secret");

    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const providedToken = bearerToken || customHeader;

    if (!providedToken || providedToken !== expectedSecret) {
      return NextResponse.json(
        {
          status: "unauthorized",
          message: "Token de autorização inválido ou ausente.",
        },
        {
          status: 401,
          headers: NO_CACHE_HEADERS,
        },
      );
    }
  }

  try {
    const startTime = Date.now();
    // Executa uma consulta real e direta no PostgreSQL via Prisma
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: NO_CACHE_HEADERS,
      },
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      },
    );
  }
}
