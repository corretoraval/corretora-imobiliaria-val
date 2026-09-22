const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.imovel.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const [index, property] of properties.entries()) {
      await tx.imovel.update({
        where: { id: property.id },
        data: { code: `__REN_${String(index).padStart(6, "0")}` },
      });
    }

    for (const [index, property] of properties.entries()) {
      await tx.imovel.update({
        where: { id: property.id },
        data: { code: `VAL-${String(index + 1).padStart(3, "0")}` },
      });
    }
  });

  console.log(`Renumerados ${properties.length} imóveis.`);
}

main()
  .catch((error) => {
    console.error("Falha ao renumerar códigos de imóveis:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
