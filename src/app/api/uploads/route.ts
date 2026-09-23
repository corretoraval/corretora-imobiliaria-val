import { NextResponse } from "next/server";
import { getStorageProvider } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const provider = getStorageProvider();
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
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
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${file.name}`.replace(
      /[^a-zA-Z0-9.\-_]/g,
      "_",
    );
    const uploaded = await provider.uploadFile(buffer, filename);
    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      path: uploaded.path,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
