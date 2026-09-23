export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadFileOptions {
  timeoutMs?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadFileResult {
  url: string;
  path?: string;
}

function shouldUseXhr(): boolean {
  const isTest = typeof process !== "undefined" && Boolean(process.env?.VITEST);
  return typeof XMLHttpRequest !== "undefined" && !isTest;
}

function performDirectUpload(
  uploadUrl: string,
  file: File,
  options?: UploadFileOptions,
  timeoutMs = 60000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (shouldUseXhr()) {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );
      xhr.timeout = timeoutMs;

      if (options?.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(
              100,
              Math.round((event.loaded / event.total) * 100),
            );
            options.onProgress?.({
              loaded: event.loaded,
              total: event.total,
              percent,
            });
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (options?.onProgress) {
            options.onProgress({
              loaded: file.size,
              total: file.size,
              percent: 100,
            });
          }
          resolve();
        } else {
          reject(
            new Error(
              `Erro ao enviar a foto "${file.name}" para o storage (HTTP ${xhr.status}).`,
            ),
          );
        }
      };

      xhr.ontimeout = () => {
        reject(
          new Error(
            `Tempo limite excedido ao enviar a foto "${file.name}". Verifique o tamanho do arquivo ou sua conexão.`,
          ),
        );
      };

      xhr.onerror = () => {
        reject(
          new Error(
            `Falha de conexão ao enviar a foto "${file.name}". Verifique sua internet e tente novamente.`,
          ),
        );
      };

      xhr.send(file);
    } else {
      // Node.js or Vitest test environment using fetch
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
        signal: controller.signal,
      })
        .then((res) => {
          clearTimeout(timer);
          if (!res.ok) {
            throw new Error(
              `Erro ao enviar a foto "${file.name}" para o storage (HTTP ${res.status}).`,
            );
          }
          if (options?.onProgress) {
            options.onProgress({
              loaded: file.size,
              total: file.size,
              percent: 100,
            });
          }
          resolve();
        })
        .catch((err) => {
          clearTimeout(timer);
          if (
            err &&
            typeof err === "object" &&
            "name" in err &&
            err.name === "AbortError"
          ) {
            reject(
              new Error(
                `Tempo limite excedido ao enviar a foto "${file.name}".`,
              ),
            );
          } else {
            reject(
              err instanceof Error
                ? err
                : new Error(`Erro ao enviar a foto "${file.name}".`),
            );
          }
        });
    }
  });
}

function performMultipartUpload(
  file: File,
  options?: UploadFileOptions,
  timeoutMs = 60000,
): Promise<UploadFileResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    if (shouldUseXhr()) {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/uploads");
      xhr.timeout = timeoutMs;

      if (options?.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(
              100,
              Math.round((event.loaded / event.total) * 100),
            );
            options.onProgress?.({
              loaded: event.loaded,
              total: event.total,
              percent,
            });
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText) as {
            url?: string;
            path?: string;
            error?: string;
          };
          if (xhr.status >= 200 && xhr.status < 300 && data.url) {
            if (options?.onProgress) {
              options.onProgress({
                loaded: file.size,
                total: file.size,
                percent: 100,
              });
            }
            resolve({ url: data.url, path: data.path });
          } else {
            reject(
              new Error(
                data.error ||
                  `Erro ao enviar a foto "${file.name}". Tente novamente.`,
              ),
            );
          }
        } catch {
          reject(
            new Error(
              `Erro inesperado ao processar o envio da foto "${file.name}".`,
            ),
          );
        }
      };

      xhr.ontimeout = () => {
        reject(
          new Error(`Tempo limite excedido ao enviar a foto "${file.name}".`),
        );
      };

      xhr.onerror = () => {
        reject(new Error(`Falha de conexão ao enviar a foto "${file.name}".`));
      };

      xhr.send(form);
    } else {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      fetch("/api/uploads", {
        method: "POST",
        body: form,
        signal: controller.signal,
      })
        .then(async (res) => {
          clearTimeout(timer);
          const data = (await res.json().catch(() => ({}))) as {
            url?: string;
            path?: string;
            error?: string;
          };
          if (!res.ok || !data.url) {
            throw new Error(
              data.error ||
                `Erro ao enviar a foto "${file.name}". Tente novamente.`,
            );
          }
          if (options?.onProgress) {
            options.onProgress({
              loaded: file.size,
              total: file.size,
              percent: 100,
            });
          }
          resolve({ url: data.url, path: data.path });
        })
        .catch((err) => {
          clearTimeout(timer);
          if (
            err &&
            typeof err === "object" &&
            "name" in err &&
            err.name === "AbortError"
          ) {
            reject(
              new Error(
                `Tempo limite excedido ao enviar a foto "${file.name}".`,
              ),
            );
          } else {
            reject(
              err instanceof Error
                ? err
                : new Error(`Erro ao enviar a foto "${file.name}".`),
            );
          }
        });
    }
  });
}

export async function uploadFile(
  file: File,
  options?: UploadFileOptions,
): Promise<UploadFileResult> {
  const timeoutMs = options?.timeoutMs ?? 60000;

  // 1. Tenta obter uma Signed Upload URL do Supabase Storage
  let prepared: {
    ok?: boolean;
    directUpload?: boolean;
    error?: string;
    url?: string;
    path?: string;
    uploadUrl?: string;
  } = {};

  try {
    const prepareResponse = await fetch("/api/uploads/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    });

    if (prepareResponse.ok) {
      prepared = (await prepareResponse.json()) as typeof prepared;
    } else if (prepareResponse.status === 404) {
      // Fallback para /api/uploads se /api/uploads/signed-url não estiver disponível
      const fallbackPrepare = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });
      if (fallbackPrepare.ok) {
        prepared = (await fallbackPrepare.json()) as typeof prepared;
      }
    } else {
      const errJson = (await prepareResponse.json().catch(() => ({}))) as {
        error?: string;
      };
      if (prepareResponse.status >= 500) {
        throw new Error(
          errJson.error ||
            `Erro no servidor ao preparar o envio da foto "${file.name}".`,
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Erro no servidor")) {
      throw err;
    }
    // Falha silenciosa de preparação direciona para o fallback de multipart upload
  }

  // 2. Se a signed upload URL foi gerada, executa o upload DIRETO para o Supabase Storage (sem passar pela Vercel)
  if (prepared.uploadUrl && prepared.url) {
    await performDirectUpload(prepared.uploadUrl, file, options, timeoutMs);
    return { url: prepared.url, path: prepared.path };
  }

  // 3. Fallback: upload multipart padrão (ex: ambiente de desenvolvimento local com LocalStorage)
  return performMultipartUpload(file, options, timeoutMs);
}
