const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const email = "admin@example.com";
const confirmed = process.argv.includes("--confirm");

async function main() {
  const user = await prisma.usuario.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      _count: { select: { contratos: true } },
    },
  });

  if (!user) {
    console.log(`Nenhum usuário encontrado para ${email}.`);
    return;
  }

  if (user._count.contratos > 0) {
    throw new Error(
      `Exclusão abortada: ${email} possui ${user._count.contratos} contrato(s). Reatribua esses registros antes de remover a conta.`,
    );
  }

  if (!confirmed) {
    console.log(
      `Conta encontrada (${user.id}, role=${user.role}) sem contratos associados. ` +
        "Nenhuma alteração foi feita. Execute novamente com --confirm para excluir.",
    );
    return;
  }

  await prisma.usuario.delete({ where: { id: user.id } });
  console.log(`Usuário ${email} removido com segurança.`);
}

main()
  .catch((error) => {
    console.error("Falha ao remover usuário de teste:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
