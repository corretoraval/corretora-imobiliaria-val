# Corretora Val

Site público e plataforma administrativa da Corretora Val, especializada em
administração de patrimônios, venda, locação anual e temporada em Balneário
Camboriú e Camboriú.

## Desenvolvimento local

Requer Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Banco de dados e painel

Configure o PostgreSQL sob controle da Corretora Val antes de usar o painel.

```bash
copy .env.example .env
# ajuste DATABASE_URL, NEXTAUTH_URL e NEXTAUTH_SECRET no .env
npm run db:deploy
npm run seed
```

O painel está em `http://localhost:3000/admin/imoveis`. O seed não cria usuários
administrativos; provisione uma conta de desenvolvimento explicitamente e nunca
reutilize credenciais de teste em ambientes compartilhados ou de produção.

Para verificar/remover com confirmação uma conta de teste legada em um banco
existente, use `npm run remove:test-admin -- --confirm`. Sem `--confirm`, o
script apenas verifica a conta e seus contratos associados.

Observação sobre ambiente Windows/OneDrive: alguns usuários relataram um aviso EPERM ao gerar o cliente Prisma (arquivo em `node_modules/.prisma`) quando o repositório está em pastas sincronizadas pelo OneDrive ou quando antivírus bloqueia arquivos temporários. Se ocorrer `EPERM` durante `npm install` ou `npx prisma generate`, recomenda-se mover o projeto para uma pasta local não sincronizada (por exemplo `C:\repos`), pausar a sincronização do OneDrive para a pasta do projeto, ou configurar exclusões no antivírus. Essa alteração não é obrigatória, mas reduz problemas de desenvolvimento no Windows.

## Qualidade

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run knip
npm run build
```

Para testes end-to-end, instale o navegador uma vez e execute:

```bash
npx playwright install chromium
npm run test:e2e
```

## Fluxo de contribuição

Leia [SAAS_MASTER_CONTEXT.md](./SAAS_MASTER_CONTEXT.md) antes de implementar.
Toda entrega começa em uma Issue e segue por Pull Request para a `main`.
