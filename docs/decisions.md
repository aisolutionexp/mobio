# Decisões — MOBIO

### [2026-05-07] Repositório clonado do GitHub vazio

**Contexto:** Pasta `/Volumes/SSD1TB/Projetos/mobio` estava vazia; repo `git@github.com:aisolutionexp/mobio.git` continha apenas `README.md` (commit inicial `0bb583e`).
**Decisão:** Clonar direto na pasta. Stack a ser materializada via Sprint 0 conforme backlog na plataforma GP.
**Escopo:** Setup inicial do projeto.

### [2026-05-07] Stack confirmada: Next.js 16

**Contexto:** Backlog importado na plataforma GP define stack na Sprint 0 (subtask `19663a65`).
**Decisão:** Next.js 16 + TS + Tailwind + shadcn/ui + Supabase + Vercel + Sentry + Vitest + Playwright. Não usar Vite.
**Escopo:** Projeto inteiro. Risco registrado: Next.js 16 pode ter breaking changes vs 14/15 — verificar release notes antes de iniciar.

### [2026-05-07] `.env` versus `.env.example`

**Contexto:** Credenciais Supabase fornecidas (URL, publishable key, service*role, access_token sbp*).
**Decisão:** `.env` real ignorado pelo git via `.gitignore`. Template versionado em `.env.example`. `service_role_key` e `SUPABASE_ACCESS_TOKEN` nunca devem ir pro frontend — apenas Edge Functions / scripts server-side.
**Escopo:** Toda a base de código. Recomendação extra ao usuário: rotacionar as 3 keys no painel Supabase como precaução por terem trafegado em chat.

### [2026-05-07] Sprint 0 será orquestrada via `/team`

**Contexto:** Sprint 0 tem 10 subtasks técnicas (bootstrap, tooling, CI/CD, observabilidade). Por regra do POP, qualquer feature/setup grande vai via `/team` — Claude principal não implementa direto.
**Decisão:** Ao iniciar Sprint 0, invocar `/team` com escopo completo (Architect → Stack → Code Reviewer → QA), uma subtask por vez ou em lotes coerentes.
**Escopo:** Todas as sprints do projeto.

### [2026-05-07] Pendências técnicas Sprint 1 (gaps Lote B)

**Contexto:** Edge Functions de signup (signup-factory, signup-retailer) recebem e validam via Zod campos que não existem no schema atual: `cnpj` em factories, `categories` (junction) em factory_categories, `segments` em retailers.
**Decisão:** Aceitar como dívida técnica. Adicionar migrations em sprint posterior para: 1) coluna `cnpj` em factories com índice único, 2) tabela `factory_categories` (junction), 3) `retailer_segments` ou coluna `segments[]`. Idempotência atual por slug pode ter colisão se 2 nomes idênticos com CNPJs diferentes — refatorar para dedup por (cnpj, email) quando cnpj for persistido.
**Escopo:** Edge Functions de signup. Campos são recebidos e logados como TODO no código.

### [2026-05-07] Configuração manual no painel Supabase pós-Sprint 1

**Contexto:** Sprint 1 introduz Auth Hook + Edge Functions que precisam de configuração no painel Supabase Dashboard.
**Decisão:** Ações manuais necessárias após merge da Sprint 1:

1. Authentication → Hooks → Custom Access Token Hook → schema `public`, function `custom_access_token_hook`
2. Edge Functions → bootstrap-mobio-admin → Secrets → `BOOTSTRAP_SECRET` (valor seguro ≥ 32 chars)
3. Edge Functions → cada function → Secrets → `SITE_URL = https://<domínio-produção>`
4. Verificar que `SUPABASE_SERVICE_ROLE_KEY` está disponível (default)
   **Escopo:** Deploy de produção da Sprint 1.

### [2026-05-08] Server actions S6 excedem 200 linhas

**Contexto:** boards.ts (453) e linesheets.ts (691) excedem o limite de 200 linhas. Code Review S6 (W3) recomendou split.
**Decisão:** Aceitar como pendência técnica. Refatorar em sprint futura splitando por domínio (e.g. linesheets-crud.ts, linesheet-items.ts, linesheet-pricing.ts).
**Escopo:** src/lib/actions/. Não bloqueia funcionalidade.

### [2026-05-08] S7 — Server actions de quotes excedem 200 linhas

**Contexto:** quotes.ts (352) e quotes-retailer.ts (306) excedem o limite. CR S7 (W3+W4) recomendou split. Acumulado da S6.
**Decisão:** Aceitar como pendência técnica. Refatorar em sprint futura splitando por domínio (e.g. quotes-crud.ts, quote-items.ts, quote-messages.ts).
**Escopo:** src/lib/actions/.

### [2026-05-08] S8 — VAPID keys para Web Push

**Contexto:** Web Push requer par de chaves VAPID (public + private). As chaves devem ser geradas uma vez e setadas como variáveis de ambiente.
**Decisão:** Gerar com `npx web-push generate-vapid-keys`. Configurar:

1. `.env.local` do Next.js: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
2. Supabase Edge Functions secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (via `npx supabase secrets set`)
   **Escopo:** Web Push (service worker + edge function send-web-push). `VAPID_PRIVATE_KEY` nunca exposta no client.

### [2026-05-08] S8 — Server actions e components excedem 200 linhas

**Contexto:** conversations.ts (358), showrooms.ts (336), conversation-view.tsx (311) excedem o limite. Acumulado das sprints S6-S7-S8.
**Decisão:** Aceitar como pendência técnica. Refatorar em sprint dedicada (split conversations-crud, conversations-messages, etc).
**Escopo:** src/lib/actions/, src/components/domain/messaging/.

### [2026-05-08] S8 — Service Worker como public/sw.js

**Contexto:** Next.js 16 com Turbopack não suporta next-pwa nativamente. Service workers precisam estar no diretório public/.
**Decisão:** Criar `public/sw.js` como vanilla service worker (sem build step). Registrado pelo componente `PushSubscribeButton` no client.
**Escopo:** Web Push notifications.

### [2026-05-08] S10 — Sentry alertas e regras (pendência operacional)

**Contexto:** Sentry SDK já integrado com tracesSampleRate 0.1 (prod) / 1.0 (dev), source maps upload via withSentryConfig, tunnel route /monitoring. Alertas e regras de notificação precisam ser configurados no painel Sentry.
**Decisão:** Configuração de alertas é pendência operacional (André configura no painel Sentry):

1. Alerta de erro em signup (signup-factory, signup-retailer) — prioridade alta
2. Alerta de erro em pagamentos/quotes — prioridade alta
3. Performance: LCP > 2.5s — alerta de warning
4. Error rate > 5% em 15min — alerta crítico
5. Notificação via email (Slack quando disponível)
   **Escopo:** Painel Sentry — não requer alteração de código.

### [2026-05-08] S10 — Sentry breadcrumbs em Edge Functions Deno (não integrar)

**Contexto:** Edge Functions (signup-factory, signup-retailer, accept-invite, verify-retailer, send-web-push) rodam no Deno runtime. @sentry/nextjs não é compatível com Deno.
**Decisão:** Não integrar Sentry nas Edge Functions por enquanto. O Sentry SDK para Deno (@sentry/deno) existe mas adiciona complexidade. Erros em Edge Functions continuam visíveis nos logs do Supabase Dashboard. Reavaliar quando houver necessidade concreta de rastreamento distribuído.
**Escopo:** Todas as Edge Functions em supabase/functions/.
