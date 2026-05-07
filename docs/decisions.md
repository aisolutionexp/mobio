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
