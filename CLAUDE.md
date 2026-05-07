# CLAUDE.md — MOBIO

> Apenas o que é específico deste projeto.
> Padrões globais em ~/.claude/CLAUDE.md — não repetir aqui.

## Stack

- **Framework:** Next.js 16 (App Router) — TypeScript strict
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
- **Deploy:** Vercel
- **Observabilidade:** Sentry (@sentry/nextjs)
- **Testes:** Vitest + React Testing Library + Playwright
- **CI/CD:** GitHub Actions

## Comandos

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build produção
npm run lint         # ESLint
npm run test         # Vitest
npm run test:e2e     # Playwright
```

## Regras de Negócio Permanentes

- **Multi-tenant** — toda query filtra por `active_tenant_id` além do RLS
- **Dois shells** — Atelier (fábricas) e Lojista (multimarcas) coexistem no mesmo App Router via route groups
- **Um usuário pode ter múltiplos tenants** — roles em `app_metadata` do JWT
- **Roles:** `atelier_owner`, `atelier_member`, `lojista_owner`, `lojista_buyer`, `admin`
- **UI em pt-BR** — todo texto visível ao usuário em português
- **Código em inglês** — variáveis, funções, componentes, tipos, nomes de arquivo

## Regras Técnicas do Projeto

### Auth

- Ler `src/middleware.ts`, `src/hooks/use-auth.ts` e `src/contexts/auth-context.tsx` ANTES de mexer em autenticação
- Sessão verificada via `getUser()` (nunca `getSession()`)
- Roles no JWT via `app_metadata` — acessíveis no middleware sem round-trip ao banco
- Troca de tenant via Server Action `switchTenant()` — atualiza `app_metadata` e revalida sessão

### Supabase

- `src/lib/supabase/server.ts` — único client server-side
- `src/lib/supabase/client.ts` — único client browser
- `src/lib/supabase/admin.ts` — service_role, apenas em webhooks e Edge Functions
- Tipos gerados: `src/types/database.ts` via `npx supabase gen types typescript`

### RLS

- Wrapper `(SELECT auth.uid())` — nunca `auth.uid()` direto em policies
- Índice obrigatório em toda coluna referenciada em policy (mesma migration)
- `SECURITY DEFINER` com `SET search_path = public` em toda function usada em policy
- **PROIBIDO:** policy de DELETE com `USING(true)` em tabelas com dados de usuário

### Env

- Prefixo `NEXT_PUBLIC_` para variáveis expostas ao client (nunca `VITE_`)
- `SUPABASE_SERVICE_ROLE_KEY` — nunca no client, nunca em Server Actions comuns
- `SUPABASE_ACCESS_TOKEN` — apenas CI/CD

### Estrutura

- Path alias: `@/` → `./src/`
- Route groups: `(auth)`, `(atelier)`, `(lojista)`, `(admin)`
- Server Actions em `src/lib/actions/[domínio].ts`
- Schemas zod em `src/lib/validators/[domínio].ts`
- Componentes: `ui/` (shadcn), `shared/` (genéricos), `domain/[feature]/` (domínio)

### Mutations

- Toda mutation via Server Action (não Route Handler)
- Route Handlers apenas para: webhooks, cron jobs, downloads
- Validar input com zod no server action antes de qualquer operação
- `revalidatePath()` ou `revalidateTag()` após mutation

## Documentação do Projeto

- `docs/decisions.md` — decisões tomadas em conversa
- `docs/mobio-architecture.md` — estrutura, padrões, multi-app strategy
- `docs/adr/` — Architecture Decision Records (ADR-001 a ADR-003+)
