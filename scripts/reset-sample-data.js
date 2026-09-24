/**
 * Zera os dados de EXEMPLO de Imóveis e Blog (e fotos associadas).
 * NÃO toca em: Usuario, Lead, ConfiguracaoSite, PaginaSite, Depoimento,
 * MarcoHistorico, MembroEquipe.
 *
 * Modo padrão = DRY RUN (só mostra o que seria apagado, não apaga nada).
 * Para apagar de verdade, rode com a flag --confirm.
 *
 * Uso:
 *   node scripts/reset-sample-data.js              # dry run (seguro)
 *   node scripts/reset-sample-data.js --confirm     # apaga de verdade
 *
 * Recomendado: faça um backup do banco (Supabase → Database backup)
 * antes de rodar com --confirm em produção.
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const path = require("node:path");

const prisma = new PrismaClient();
const CONFIRM = process.argv.includes("--confirm");

// Diretório local de uploads (mesmo usado pelo LocalStorageProvider)
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function isLocalUploadUrl(url) {
  return typeof url === "string" && url.startsWith("/uploads/");
}

function deleteLocalFileIfExists(url) {
  if (!isLocalUploadUrl(url)) return false;
  const filePath = path.join(UPLOADS_DIR, url.replace(/^\/uploads\//, ""));
  if (fs.existsSync(filePath)) {
    if (CONFIRM) fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

async function main() {
  // Mostra a que banco está conectando (host apenas, sem credenciais)
  const dbUrl = process.env.DATABASE_URL || "";
  const hostMatch = dbUrl.match(/@([^/]+)\//);
  console.log("\n=== Conectando ao banco ===");
  console.log("Host:", hostMatch ? hostMatch[1] : "(não foi possível identificar)");
  console.log("Modo:", CONFIRM ? "⚠️  CONFIRM (vai apagar de verdade)" : "DRY RUN (nada será apagado)");
  console.log("");

  // ---------- IMÓVEIS ----------
  const imoveis = await prisma.imovel.findMany({
    select: { id: true, code: true, title: true },
    include: undefined,
  });
  const fotos = await prisma.foto.findMany({
    where: { imovelId: { in: imoveis.map((i) => i.id) } },
    select: { id: true, url: true },
  });
  const contratos = await prisma.contrato.findMany({
    where: { imovelId: { in: imoveis.map((i) => i.id) } },
    select: { id: true, imovelId: true },
  });

  console.log(`Imóveis encontrados: ${imoveis.length}`);
  for (const i of imoveis) console.log(`  - [${i.code}] ${i.title}`);
  console.log(`Fotos associadas: ${fotos.length}`);
  console.log(`Contratos associados a esses imóveis: ${contratos.length}`);
  if (contratos.length > 0) {
    console.log(
      "  ⚠️  Existem contratos reais ligados a esses imóveis. Confirme se é seguro apagá-los antes de continuar.",
    );
  }

  // ---------- BLOG ----------
  const posts = await prisma.postBlog.findMany({
    select: { id: true, slug: true, title: true, coverImage: true },
  });
  console.log(`\nPosts de blog encontrados: ${posts.length}`);
  for (const p of posts) console.log(`  - [${p.slug}] ${p.title}`);

  console.log("\n=== Resumo ===");
  console.log(`${imoveis.length} imóveis, ${fotos.length} fotos, ${contratos.length} contratos, ${posts.length} posts de blog.`);

  if (!CONFIRM) {
    console.log("\nNada foi apagado (dry run). Rode com --confirm para executar de verdade.\n");
    return;
  }

  console.log("\n⚠️  Apagando de verdade em 3 segundos... (Ctrl+C para cancelar)");
  await new Promise((r) => setTimeout(r, 3000));

  // 1. Apaga contratos ligados aos imóveis (evita erro de FK)
  if (contratos.length > 0) {
    await prisma.contrato.deleteMany({
      where: { id: { in: contratos.map((c) => c.id) } },
    });
    console.log(`Contratos apagados: ${contratos.length}`);
  }

  // 2. Apaga arquivos físicos das fotos (antes de apagar os registros)
  let filesDeleted = 0;
  for (const f of fotos) {
    if (deleteLocalFileIfExists(f.url)) filesDeleted++;
  }
  console.log(`Arquivos de foto apagados do disco: ${filesDeleted}`);

  // 3. Apaga imóveis (Foto é cascade automático no schema)
  const deletedImoveis = await prisma.imovel.deleteMany({
    where: { id: { in: imoveis.map((i) => i.id) } },
  });
  console.log(`Imóveis apagados: ${deletedImoveis.count}`);

  // 4. Apaga imagem de capa dos posts (se local) e os posts
  let coverFilesDeleted = 0;
  for (const p of posts) {
    if (deleteLocalFileIfExists(p.coverImage)) coverFilesDeleted++;
  }
  const deletedPosts = await prisma.postBlog.deleteMany({
    where: { id: { in: posts.map((p) => p.id) } },
  });
  console.log(`Imagens de capa apagadas do disco: ${coverFilesDeleted}`);
  console.log(`Posts de blog apagados: ${deletedPosts.count}`);

  console.log("\n✅ Concluído.\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Erro:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
