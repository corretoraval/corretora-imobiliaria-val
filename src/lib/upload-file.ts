export async function uploadFile(file: File) {
  const prepareResponse = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
    }),
  });

  const prepared = (await prepareResponse.json()) as {
    error?: string;
    url?: string;
    path?: string;
    uploadUrl?: string;
  };

  if (prepareResponse.ok && prepared.uploadUrl && prepared.url) {
    const uploadResponse = await fetch(prepared.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!uploadResponse.ok) {
      throw new Error("Não foi possível enviar o arquivo para o storage.");
    }
    return { url: prepared.url, path: prepared.path };
  }

  if (!prepareResponse.ok && prepareResponse.status !== 400) {
    throw new Error(prepared.error || "Não foi possível preparar o upload.");
  }

  const form = new FormData();
  form.append("file", file);
  const fallbackResponse = await fetch("/api/uploads", {
    method: "POST",
    body: form,
  });
  const fallback = (await fallbackResponse.json()) as {
    error?: string;
    url?: string;
    path?: string;
  };
  if (!fallbackResponse.ok || !fallback.url) {
    throw new Error(fallback.error || "Não foi possível enviar o arquivo.");
  }
  return { url: fallback.url, path: fallback.path };
}
