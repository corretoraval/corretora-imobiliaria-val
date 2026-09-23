import { NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const provider = getStorageProvider();

    if (!provider.createSignedUploadUrl) {
      return NextResponse.json(
        {
          ok: false,
          directUpload: false,
          error:
            "Signed upload URLs are not supported by the current storage provider",
        },
        { status: 200 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      filename?: unknown;
      contentType?: unknown;
    };

    if (
      typeof body.filename !== "string" ||
      !body.filename.trim() ||
      typeof body.contentType !== "string" ||
      !body.contentType.trim()
    ) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
        { status: 400 },
      );
    }

    const signed = await provider.createSignedUploadUrl(
      body.filename.trim(),
      body.contentType.trim(),
    );

    return NextResponse.json({
      ok: true,
      directUpload: true,
      url: signed.url,
      path: signed.path,
      uploadUrl: signed.uploadUrl,
    });
  } catch (err) {
    console.error("Signed URL creation error:", err);
    return NextResponse.json(
      { error: "Failed to generate signed upload URL" },
      { status: 500 },
    );
  }
}
