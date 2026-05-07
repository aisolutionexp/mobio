# ADR-001: Confirmação de Stack — Next.js 16 + Supabase + Vercel

## Status: Accepted

## Contexto

O projeto MOBIO é um B2B fashion marketplace com dois shells (Atelier e Lojista), múltiplas features interconectadas (catálogo, linesheets, boards, quotes, pedidos, showrooms, mensageria, analytics) e requisitos de multi-tenancy. A stack precisa suportar:

- SSR e ISR para SEO em páginas públicas (catálogo, factory pages)
- Autenticação robusta com RBAC multi-tenant
- Realtime para mensageria e status de pedidos
- Upload e gestão de imagens de produtos
- Deploy com preview environments para review de features
- Observabilidade (error tracking + performance monitoring)

## Decisão

Stack confirmada (decisão original em `docs/decisions.md`, 2026-05-07):

| Camada           | Tecnologia                     | Versão                                                |
| ---------------- | ------------------------------ | ----------------------------------------------------- |
| Framework        | Next.js                        | 16 (App Router)                                       |
| Linguagem        | TypeScript                     | strict mode                                           |
| Styling          | Tailwind CSS + shadcn/ui       | v4 + latest                                           |
| Backend          | Supabase                       | Postgres + Auth + Storage + Edge Functions + Realtime |
| Deploy           | Vercel                         | Pro                                                   |
| Observabilidade  | Sentry                         | @sentry/nextjs                                        |
| Testes unitários | Vitest + React Testing Library | latest                                                |
| Testes E2E       | Playwright                     | latest                                                |
| CI/CD            | GitHub Actions                 | Custom workflows                                      |

### Por que Next.js 16 (não 14 ou 15)

- App Router amadureceu em 15, e 16 consolida os padrões (Server Components, Server Actions, Middleware)
- Turbopack estável para dev (DX melhor)
- Improved caching e ISR — essencial para catálogo com muitos SKUs
- Suporte nativo a `instrumentation.ts` para Sentry server-side
- Next.js 16 é a versão mais recente — começar no latest evita migração futura

**Risco reconhecido:** Next.js 16 pode ter breaking changes em relação a 15. Mitigação: verificar release notes e changelogs antes do bootstrap. Se houver breaking changes críticos com Supabase SSR ou Sentry, considerar pin em 15 até estabilizar. Registrado em `docs/decisions.md`.

### Por que Supabase (não Firebase, não backend custom)

- Postgres nativo — queries SQL, RLS nativo, triggers, functions
- Auth com custom claims em `app_metadata` — RBAC sem tabela auxiliar
- Storage integrado com RLS — controle de acesso a imagens por tenant
- Realtime channels — mensageria sem infra adicional
- Edge Functions (Deno) — lógica server-side próxima ao banco
- Tipagem end-to-end via `supabase gen types`

### Por que Vercel (não AWS, não self-hosted)

- Integração nativa com Next.js (mesmo time)
- Preview deployments automáticos por PR
- Edge Runtime para middleware de auth (baixa latência)
- Cron jobs nativos via `vercel.json`
- Simplicidade operacional — sem gerenciar infra

## Alternativas descartadas

### Vite + React (SPA)

- Sem SSR nativo — prejudica SEO do catálogo público
- Exigiria backend separado (Express, Fastify) para auth cookies, webhooks
- Mais flexível porém mais infra para gerenciar
- **Descartada porque:** O MOBIO tem páginas públicas que precisam de SSR/ISR para SEO, e Server Actions simplificam mutations sem criar API REST separada

### Remix

- Excelente para formulários e mutations (loader/action pattern)
- Comunidade menor que Next.js
- Integração com Vercel funcional mas não nativa
- Supabase SSR helpers são otimizados para Next.js
- **Descartada porque:** Ecossistema Next.js é mais maduro para o tipo de aplicação (marketplace com SSR + client interativity), e a integração Supabase + Vercel + Next.js é de primeira classe

### Next.js 14/15

- Mais estável e testado em produção
- Documentação e exemplos mais abundantes
- **Descartada porque:** Iniciar em versão anterior significa migração futura obrigatória. O risco de breaking changes em 16 é menor que o custo de migrar depois com 11 sprints de código acumulado

## Consequências

### Positivas

- Stack coesa com integração de primeira classe entre todas as peças
- Tipagem end-to-end (TypeScript → Zod → Supabase types → UI)
- Deploy zero-config na Vercel
- Realtime, Storage e Auth sem infra adicional

### Negativas

- Vendor lock-in moderado na Vercel (mitigável — Next.js roda em qualquer lugar com adaptador)
- Vendor lock-in no Supabase (mitigável — é Postgres padrão, dados exportáveis)
- Next.js 16 pode ter edge cases não documentados por ser recente
- Custo de Vercel Pro pode escalar com tráfego (monitorar)
