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
