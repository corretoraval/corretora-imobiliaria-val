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

## Storage de fotos em produção

O desenvolvimento local usa `public/uploads` quando as variáveis do Supabase
Storage não estão configuradas. Em produção na Vercel, configure um bucket
externo antes de cadastrar fotos:

1. No projeto Supabase de produção, abra **Storage** e crie o bucket
   `property-photos`.
2. Deixe o bucket **público**. As URLs públicas são persistidas em `Foto.url`
   e permitem que o site público e o `next/image` exibam as fotos sem criar
   URLs assinadas a cada renderização.
3. Em **Project Settings → API**, copie a **Project URL** e a `service_role`
   key. A `service_role` key deve permanecer somente em variáveis server-side:
   nunca a coloque em código cliente ou em `NEXT_PUBLIC_*`.
4. Na Vercel, em **Settings → Environment Variables → Production**, adicione:

   ```text
   SUPABASE_URL=https://<seu-projeto>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
   SUPABASE_STORAGE_BUCKET=property-photos
   ```

5. Faça um novo deploy para que a configuração seja carregada. O provider
   Supabase só é ativado quando `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY` existem; sem elas, o fallback local continua
   disponível para desenvolvimento.

O provider usa a API REST do Supabase para upload e exclusão, e grava no banco
a URL pública retornada pelo bucket. Arquivos locais existentes não são
migrados automaticamente: fotos que não estiverem mais disponíveis no
filesystem da aplicação precisam ser reenviadas.

## Fluxo de contribuição

Leia [SAAS_MASTER_CONTEXT.md](./SAAS_MASTER_CONTEXT.md) antes de implementar.
Toda entrega começa em uma Issue e segue por Pull Request para a `main`.
