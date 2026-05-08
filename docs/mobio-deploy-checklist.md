# MOBIO — Checklist de Deploy para Producao

Checklist operacional para o desenvolvedor executar antes do deploy de producao.

---

## Pre-requisitos (corrigir antes de deploy)

- [ ] **BUG-001/002**: Adicionar `/sitemap.xml`, `/robots.txt` e `/monitoring` ao `PUBLIC_PATHS` no `src/middleware.ts` (ou excluir do matcher)
- [ ] **BUG-003**: Atualizar strings nos testes — `skip-link.test.tsx:14` ("conteudo" -> "conteudo" com acento), `public-pages.spec.ts:16` (regex com acentos)
- [ ] Re-rodar `npm test` (488/488) e `npx playwright test` (28/28) apos correcoes

---

## 1. Banco de Dados (Supabase)

- [ ] Criar projeto Supabase de producao (se ainda nao existir)
- [ ] Aplicar todas as 75 migrations no projeto de producao: `npx supabase db push --linked`
- [ ] Verificar que RLS esta habilitado em todas as tabelas: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') EXCEPT SELECT relname FROM pg_class JOIN pg_catalog.pg_policy ON pg_class.oid = pg_policy.polrelid);`
- [ ] Verificar que a function `custom_access_token_hook` existe: `SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';`

## 2. Auth Hook (CRITICO)

- [ ] No painel Supabase: **Authentication > Hooks > Custom Access Token Hook**
  - Schema: `public`
  - Function: `custom_access_token_hook`
- [ ] Testar: fazer login e verificar que `app_metadata` contem `role`, `active_role`, `tenant_id` no JWT

## 3. Edge Functions (13 functions)

Todas devem ser deployadas no projeto Supabase de producao:

```bash
npx supabase functions deploy signup-factory
npx supabase functions deploy signup-retailer
npx supabase functions deploy bootstrap-mobio-admin
npx supabase functions deploy process-product-image
npx supabase functions deploy accept-invite
npx supabase functions deploy send-factory-invitation
npx supabase functions deploy accept-factory-invitation
npx supabase functions deploy verify-retailer
npx supabase functions deploy search-products
npx supabase functions deploy cancel-order
npx supabase functions deploy send-order-status-email
npx supabase functions deploy send-web-push
npx supabase functions deploy export-analytics-csv
```

- [ ] Todas as 13 functions deployadas com sucesso
- [ ] Verificar logs: `npx supabase functions logs <nome>` para cada function critica

## 4. Secrets do Supabase Edge Functions

No painel Supabase: **Edge Functions > Manage secrets** (ou via CLI `npx supabase secrets set`):

- [ ] `BOOTSTRAP_SECRET` — string aleatoria >= 32 caracteres (usada por bootstrap-mobio-admin)
- [ ] `SITE_URL` — URL de producao (ex: `https://mobio.com.br`)
- [ ] `VAPID_PUBLIC_KEY` — chave publica VAPID para web push
- [ ] `VAPID_PRIVATE_KEY` — chave privada VAPID (gerar com `npx web-push generate-vapid-keys`)
- [ ] `VAPID_SUBJECT` — email para VAPID (ex: `mailto:noreply@mobio.com`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — ja disponivel como variavel default, verificar se esta ativa

## 5. Variaveis de Ambiente (.env.local de producao)

Configurar no Vercel (ou no hosting escolhido). Referencia: `.env.example`

### Supabase

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase de producao
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key do projeto de producao
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only, NUNCA NEXT*PUBLIC*)
- [ ] `SUPABASE_ACCESS_TOKEN` — token da Management API (para CI/CD)

### Sentry

- [ ] `NEXT_PUBLIC_SENTRY_DSN` — DSN do projeto Sentry (client-side)
- [ ] `SENTRY_DSN` — DSN do projeto Sentry (server-side)
- [ ] `SENTRY_AUTH_TOKEN` — auth token para upload de source maps (CI only)
- [ ] `SENTRY_ORG` — organizacao no Sentry
- [ ] `SENTRY_PROJECT` — nome do projeto no Sentry (ex: `mobio`)

### Web Push VAPID

- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — mesma chave configurada nos secrets do Supabase
- [ ] `VAPID_PRIVATE_KEY` — mesma chave privada (server-only)
- [ ] `VAPID_SUBJECT` — email VAPID

### Site

- [ ] `NEXT_PUBLIC_SITE_URL` — URL de producao (ex: `https://mobio.com.br`)

## 6. Sentry — Configuracao no Painel

- [ ] Criar projeto Sentry (Next.js)
- [ ] Configurar alertas:
  - [ ] Signup failures (errors em signup-factory/signup-retailer)
  - [ ] Payment errors (errors em order flow)
  - [ ] Error rate > 5% em 1h
  - [ ] LCP > 2.5s (web vital)
- [ ] Integrar notificacoes: Email e/ou Slack
- [ ] Verificar que source maps estao sendo uploadados no build

## 7. Rate Limits (Supabase)

- [ ] Authentication > Rate Limits:
  - [ ] Sign up: max 10/hora por IP
  - [ ] Sign in: max 30/hora por IP
  - [ ] Magic link: max 5/hora por email
- [ ] Email rate limits configurados (evitar abuso de convites)

## 8. Vercel / Hosting

- [ ] Projeto Vercel criado e conectado ao repositorio GitHub
- [ ] Todas as env vars configuradas no painel Vercel (ver secao 5)
- [ ] Build settings: Framework Preset = Next.js (auto-detect)
- [ ] Root directory: `/` (raiz do repo)
- [ ] Build command: `npm run build` (default)
- [ ] Custom domain configurado (ex: `mobio.com.br`)
- [ ] SSL automatico ativo (Vercel faz por padrao)
- [ ] Verificar que o build no Vercel completa sem erros

## 9. Pos-Deploy — Verificacao

### Smoke Tests (verificar manualmente)

- [ ] Home `/` carrega com titulo "MOBIO — Fashion Marketplace B2B"
- [ ] `/entrar` carrega formulario de login
- [ ] `/cadastro/fabrica` carrega formulario de signup fabrica
- [ ] `/cadastro/lojista` carrega formulario de signup lojista
- [ ] `/sitemap.xml` retorna XML valido (apos fix BUG-001)
- [ ] `/robots.txt` retorna conteudo com disallow areas autenticadas (apos fix BUG-001)
- [ ] `/politica-de-privacidade` carrega pagina completa
- [ ] `/design-system` carrega catalogo de componentes

### Fluxo End-to-End

- [ ] Signup fabrica funciona: preencher form -> Edge Function `signup-factory` cria usuario + tenant
- [ ] Magic link recebido em email real (verificar inbox)
- [ ] Auth Hook injeta custom claims corretamente (`role`, `active_role`, `tenant_id` no JWT)
- [ ] Onboarding completo redireciona para shell correta

### Security

- [ ] CSP nao quebra nenhuma feature em producao (testar: login, upload de imagem, Sentry, web push)
- [ ] Headers de seguranca presentes: `curl -I https://mobio.com.br`
- [ ] HSTS com preload aparece na resposta

### Observabilidade

- [ ] Sentry recebe primeiro evento de teste (trigger: acessar rota inexistente autenticado para gerar error boundary)
- [ ] Tunnel `/monitoring` funciona (apos fix BUG-002)
- [ ] Source maps resolvem corretamente no Sentry (stack traces legivel)

### LGPD

- [ ] Banner LGPD aparece em primeira visita (limpar localStorage e recarregar)
- [ ] Aceitar -> banner some e nao reaparece
- [ ] Recusar -> banner some e nao reaparece

---

## Resumo de Riscos

| Risco                                                                              | Mitigacao                                                         |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Auth Hook nao configurado -> usuarios sem claims -> acesso negado a tudo           | Configurar ANTES de liberar acesso                                |
| Secrets faltando nas Edge Functions -> signup/convites/push falham silenciosamente | Verificar logs apos primeiro teste real                           |
| CSP `unsafe-eval` pode ser desnecessario em producao                               | Monitorar reports CSP, remover se possivel                        |
| Schema validation de env vars ausente -> crash silencioso se variavel faltar       | Implementar `src/lib/env.ts` com Zod (sugestao S2 do Code Review) |
| Rate limits nao configurados -> abuso de signup/magic-link                         | Configurar antes de anunciar publicamente                         |
