# Arquitetura: MOBIO

> B2B fashion marketplace — conecta ateliês/fábricas a lojistas multimarca.

## Stack

- **Framework:** Next.js 16 (App Router) — TypeScript strict
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix primitives + CVA variants)
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
- **Deploy:** Vercel (ISR, Edge Runtime, Preview Deployments)
- **Observabilidade:** Sentry (error tracking + performance)
- **Testes:** Vitest (unit/integration) + Playwright (E2E) + React Testing Library (component)
- **CI/CD:** GitHub Actions (lint → typecheck → test → build → deploy)

Stack confirmada em `docs/decisions.md` (2026-05-07). Detalhes em `docs/adr/ADR-001-stack-confirmation.md`.

## Estrutura de Pastas

```
src/
├── app/                            # App Router — rotas e layouts
│   ├── (auth)/                     # Route group: login, registro, recuperação
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx              # Layout auth (centrado, sem sidebar)
│   │
│   ├── (atelier)/                  # Route group: shell Atelier/Fábrica
│   │   ├── layout.tsx              # Layout atelier (sidebar, topbar, tenant context)
│   │   ├── dashboard/page.tsx
│   │   ├── catalogo/               # Catálogo de produtos
│   │   ├── pedidos/                # Gestão de pedidos recebidos
│   │   ├── linesheets/             # Criação e gestão de linesheets
│   │   ├── showrooms/              # Showrooms virtuais
│   │   ├── mensagens/              # Chat com lojistas
│   │   ├── analytics/              # Métricas do atelier
│   │   └── conta/                  # Configurações da conta atelier
│   │
│   ├── (lojista)/                  # Route group: shell Lojista
│   │   ├── layout.tsx              # Layout lojista (sidebar, topbar, tenant context)
│   │   ├── dashboard/page.tsx
│   │   ├── discover/               # Descoberta de ateliês e produtos
│   │   ├── atelier/[slug]/         # Factory page (perfil público do atelier)
│   │   ├── produto/[slug]/         # Product detail page
│   │   ├── boards/                 # Boards de curadoria
│   │   ├── quotes/                 # Pedidos de cotação
│   │   ├── pedidos/                # Gestão de pedidos feitos
│   │   ├── mensagens/              # Chat com ateliês
│   │   ├── analytics/              # Métricas do lojista
│   │   └── conta/                  # Configurações da conta lojista
│   │
│   ├── (admin)/                    # Route group: painel administrativo MOBIO
│   │   ├── layout.tsx
│   │   └── ...                     # Gestão de tenants, moderação, métricas globais
│   │
│   ├── api/                        # Route Handlers
│   │   ├── webhooks/               # Webhooks de integrações externas
│   │   │   └── stripe/route.ts     # Ex: webhook de pagamento
│   │   └── cron/                   # Cron jobs via Vercel
│   │       └── cleanup/route.ts
│   │
│   ├── layout.tsx                  # Root layout (providers, fonts, metadata)
│   ├── not-found.tsx               # 404 global
│   ├── error.tsx                   # Error boundary global
│   └── globals.css                 # Tailwind directives + CSS tokens
│
├── components/
│   ├── ui/                         # shadcn/ui — atoms (Button, Input, Dialog, etc.)
│   ├── shared/                     # Componentes compartilhados entre shells
│   │   ├── data-table/             # Tabela genérica com sorting, filtering, pagination
│   │   ├── file-upload/            # Upload para Supabase Storage
│   │   ├── image-gallery/          # Galeria de imagens de produto
│   │   └── ...
│   └── domain/                     # Componentes de domínio (molecules/organisms)
│       ├── auth/                   # LoginForm, RegisterForm, RoleGuard
│       ├── product/                # ProductCard, ProductGrid, ProductForm
│       ├── order/                  # OrderCard, OrderTimeline, OrderStatusBadge
│       ├── linesheet/              # LinesheetBuilder, LinesheetPreview
│       ├── board/                  # BoardCard, BoardGrid, BoardEditor
│       ├── quote/                  # QuoteForm, QuoteCard
│       ├── chat/                   # ChatWindow, MessageBubble, ChatList
│       ├── showroom/               # ShowroomBuilder, ShowroomPreview
│       └── analytics/              # ChartCard, MetricCard, DateRangePicker
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase browser client (singleton)
│   │   ├── server.ts               # Supabase server client (cookies-based)
│   │   ├── middleware.ts            # Helper para middleware auth
│   │   └── admin.ts                # Supabase admin client (service_role — server only)
│   ├── sentry/
│   │   ├── client.ts               # Sentry client-side init
│   │   └── server.ts               # Sentry server-side init
│   ├── actions/                    # Server Actions (mutations)
│   │   ├── auth.ts                 # login, register, logout, resetPassword
│   │   ├── product.ts              # createProduct, updateProduct, deleteProduct
│   │   ├── order.ts                # createOrder, updateOrderStatus
│   │   ├── linesheet.ts            # createLinesheet, publishLinesheet
│   │   └── ...
│   ├── services/                   # Lógica de negócio pura (sem framework)
│   │   ├── pricing.ts              # Cálculos de preço, margem, markup
│   │   ├── permissions.ts          # Helpers de RBAC — can(), hasRole()
│   │   └── ...
│   ├── validators/                 # Schemas zod
│   │   ├── auth.ts                 # loginSchema, registerSchema
│   │   ├── product.ts              # productSchema, variantSchema
│   │   ├── order.ts                # orderSchema
│   │   └── ...
│   └── utils.ts                    # cn(), formatCurrency(), formatDate(), etc.
│
├── hooks/                          # Custom hooks (client-side)
│   ├── use-auth.ts                 # Hook de autenticação (sessão, role, tenant)
│   ├── use-permissions.ts          # Hook de permissões — can('products:create')
│   ├── use-realtime.ts             # Hook genérico para Supabase Realtime
│   └── ...
│
├── types/                          # TypeScript types/interfaces
│   ├── database.ts                 # Types gerados pelo Supabase CLI
│   ├── auth.ts                     # UserRole, TenantContext, Session
│   ├── api.ts                      # ApiResponse<T>, PaginatedResponse<T>
│   └── ...
│
├── contexts/                       # React Context (estado global mínimo)
│   ├── auth-context.tsx            # AuthProvider — sessão, role, tenant
│   └── tenant-context.tsx          # TenantProvider — contexto do tenant ativo
│
├── config/                         # Configurações da aplicação
│   ├── navigation.ts               # Menu items por role
│   ├── constants.ts                # Constantes da aplicação
│   └── brand.ts                    # Tokens de marca (nome, logo, cores do tenant)
│
└── middleware.ts                    # Next.js middleware — auth guard + role routing
```

Decisão sobre estrutura de pastas em `docs/adr/ADR-002-folder-structure.md`.

## Estratégia Multi-App

O MOBIO tem dois shells principais (Atelier e Lojista) + um painel Admin. Cada shell é um route group dentro do mesmo App Router.

### Por que route groups (não apps separadas)

- Código compartilhado (components, hooks, lib, types) fica em um só lugar
- Deploy único na Vercel — simplifica CI/CD, preview deployments, domínio
- Supabase é o mesmo projeto — sem duplicação de policies, triggers, storage buckets
- Autenticação compartilhada — um usuário pode ser atelier_owner E lojista_buyer

### Como funciona

| Route group | URL base                       | Layout                | Quem acessa                   |
| ----------- | ------------------------------ | --------------------- | ----------------------------- |
| `(auth)`    | `/login`, `/register`          | Centrado, sem sidebar | Todos                         |
| `(atelier)` | `/dashboard`, `/catalogo`, ... | Sidebar atelier       | atelier_owner, atelier_member |
| `(lojista)` | `/dashboard`, `/discover`, ... | Sidebar lojista       | lojista_owner, lojista_buyer  |
| `(admin)`   | `/admin/...`                   | Sidebar admin         | admin                         |

O `middleware.ts` na raiz verifica a sessão e a role do usuário:

- Sem sessão → redireciona para `/login`
- Com sessão + role atelier → permite acesso a `(atelier)`, bloqueia `(lojista)` e `(admin)`
- Com sessão + role lojista → permite acesso a `(lojista)`, bloqueia `(atelier)` e `(admin)`
- Com sessão + role admin → permite acesso a `(admin)`

**Ambiguidade de URL:** `(atelier)/dashboard` e `(lojista)/dashboard` resolvem para `/dashboard`. O middleware resolve por role — o route group correto é servido com base no role do usuário autenticado.

### Layout por shell

Cada route group tem seu próprio `layout.tsx` que encapsula:

- Sidebar com navegação específica do shell (itens do menu definidos em `config/navigation.ts`)
- Topbar com tenant selector (um usuário pode ter múltiplos ateliês/lojas)
- Tenant context provider
- Error boundary do shell

O root `layout.tsx` encapsula:

- Providers globais (AuthProvider, ThemeProvider, Toaster)
- Metadata padrão
- Fonts
- Sentry init

## Padrões de Módulos

### Server Components vs Client Components

| Cenário                                  | Tipo                                               | Motivo                                       |
| ---------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| Listagem de dados (catálogo, pedidos)    | Server Component                                   | Fetch no servidor, sem waterfall no client   |
| Formulário com interatividade            | Client Component (`"use client"`)                  | Precisa de useState, handlers                |
| Tabela com sorting/filtering client-side | Client Component                                   | Interatividade local                         |
| Page com fetch + child interativo        | Server Component (page) + Client Component (child) | Composição — servidor busca, client interage |
| Layout com sidebar colapsável            | Client Component                                   | Estado local da UI                           |

**Regra padrão:** Server Component até que o componente precise de `useState`, `useEffect`, event handlers ou browser APIs. Anotar `"use client"` apenas nos componentes que realmente precisam.

### Server Actions

Toda mutation (criar, atualizar, deletar) usa Server Actions em `lib/actions/`.

```
Componente (client) → Server Action (server) → Supabase → revalidatePath/revalidateTag
```

- Validação com zod no server action antes de qualquer operação
- `revalidatePath()` ou `revalidateTag()` após mutation para invalidar cache
- Retorno tipado: `{ success: true, data } | { success: false, error }` — nunca throw para erros de negócio
- Server Actions podem chamar `lib/services/` para lógica de negócio complexa

### Route Handlers (app/api/)

Usados **apenas** quando:

- Webhook externo precisa de endpoint HTTP público (Stripe, Supabase, etc.)
- Cron job via Vercel Cron
- Integração que exige resposta HTTP específica (PDF download, file stream)

Para mutations internas da aplicação, **sempre** Server Actions — não Route Handlers.

### Edge Functions do Supabase

Usadas quando:

- Lógica precisa rodar dentro do Supabase (próxima ao banco, sem latência de rede)
- Secrets sensíveis que não devem transitar pelo Next.js
- Processamento assíncrono disparado por trigger de banco (ex: enviar email após criar pedido)

Edge Functions ficam em `supabase/functions/`, com código compartilhado em `supabase/functions/_shared/`.

## Convenções

### Imports

- Path alias: `@/` → `./src/`
- Configuração via `tsconfig.json` (compilerOptions.paths) + `next.config.ts` (se necessário)
- Ordem de imports: 1) next/react, 2) libs externas, 3) `@/components`, 4) `@/lib`, 5) `@/hooks`, 6) `@/types`, 7) relativos

### Naming

| Elemento               | Convenção                   | Exemplo                        |
| ---------------------- | --------------------------- | ------------------------------ |
| Arquivos de componente | kebab-case                  | `product-card.tsx`             |
| Componentes            | PascalCase                  | `ProductCard`                  |
| Hooks                  | camelCase com prefixo `use` | `useAuth`, `usePermissions`    |
| Server Actions         | camelCase                   | `createProduct`, `updateOrder` |
| Tipos/Interfaces       | PascalCase                  | `Product`, `OrderStatus`       |
| Constantes             | UPPER_SNAKE_CASE            | `MAX_UPLOAD_SIZE`              |
| Variáveis de env       | UPPER_SNAKE_CASE            | `NEXT_PUBLIC_SUPABASE_URL`     |
| Rotas (pastas)         | kebab-case                  | `forgot-password/`             |
| Schemas zod            | camelCase + sufixo Schema   | `productSchema`, `loginSchema` |

### Variáveis de Ambiente

| Variável                        | Onde usar                                      | Escopo  |
| ------------------------------- | ---------------------------------------------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client + Server                                | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server                                | Pública |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server Actions, Route Handlers, Edge Functions | Secreta |
| `SUPABASE_ACCESS_TOKEN`         | CI/CD (migrations, type gen)                   | Secreta |
| `SENTRY_DSN`                    | Client + Server                                | Pública |
| `SENTRY_AUTH_TOKEN`             | CI/CD (source maps)                            | Secreta |

### File Colocation

- Um componente por arquivo
- Componentes de domínio agrupados por feature em `components/domain/[feature]/`
- Server Actions agrupados por domínio em `lib/actions/[domain].ts`
- Schemas zod agrupados por domínio em `lib/validators/[domain].ts`
- Hooks no root `hooks/` — se um hook é usado apenas dentro de um componente, pode ficar no mesmo diretório

### Error Boundaries

- Error boundary global em `app/error.tsx`
- Error boundary por route group: `app/(atelier)/error.tsx`, `app/(lojista)/error.tsx`
- Integração com Sentry: `error.tsx` reporta automaticamente via `Sentry.captureException()`
- `not-found.tsx` global + por route group se necessário

## Decisões de Arquitetura

Cada decisão abaixo tem ADR detalhado em `docs/adr/`.

- Stack: Next.js 16 + Supabase + Vercel — ADR-001
- Monorepo com route groups para multi-app (vs apps separadas ou monorepo Turborepo) — ADR-002
- Auth via Supabase Auth + custom claims em app_metadata para RBAC multi-tenant — ADR-003

## Regras Técnicas do Projeto

- `lib/supabase/server.ts` é o único ponto de entrada para Supabase server-side — nunca instanciar client diretamente em Server Components ou Server Actions
- `lib/supabase/client.ts` é o único ponto de entrada para Supabase client-side
- `lib/supabase/admin.ts` (service_role) — apenas em Route Handlers de webhook e Edge Functions. Nunca em Server Actions comuns
- Todo input validado com zod em `lib/validators/` antes de chegar ao banco
- Tipos de banco gerados via `npx supabase gen types typescript` em `types/database.ts` — nunca editar manualmente
- `middleware.ts` é a primeira linha de defesa de auth — roles verificadas antes de servir a rota
- UI em pt-BR, código (variáveis, funções, componentes) em inglês
- Mobile-first: estilizar para mobile, expandir com breakpoints Tailwind (`sm:`, `md:`, `lg:`)
- Prefixo `NEXT_PUBLIC_` para variáveis de ambiente expostas ao client. **Nunca** `VITE_`

## Integrações Externas

### Supabase

- **Client browser:** `lib/supabase/client.ts` — singleton com `createBrowserClient()`
- **Client server:** `lib/supabase/server.ts` — `createServerClient()` com cookies do Next.js
- **Admin:** `lib/supabase/admin.ts` — `createClient()` com service_role key (server only)
- **Realtime:** Broadcast preferido sobre Postgres Changes. Habilitar apenas nas tabelas necessárias (mensagens, status de pedido)
- **Storage:** Buckets por tipo (product-images, linesheet-assets, avatars). URLs assinadas para conteúdo privado
- **Edge Functions:** `supabase/functions/` com `_shared/` para código compartilhado. Deps com versão fixa

### Sentry

- **Client:** `lib/sentry/client.ts` — init no root layout
- **Server:** `lib/sentry/server.ts` — init em `instrumentation.ts` (Next.js instrumentation hook)
- **Source maps:** Upload via `@sentry/nextjs` plugin no build
- **Env:** `SENTRY_DSN` (pública), `SENTRY_AUTH_TOKEN` (CI/CD only)

### Vercel

- **Deploy:** Automático via push para `main` (produção) e branches de feature (preview)
- **Cron:** `vercel.json` com cron jobs que chamam Route Handlers em `app/api/cron/`
- **Edge Config:** Para feature flags (se necessário no futuro)

## Preparação para Sprint 1 (Schema Base + Auth + RBAC)

A Sprint 1 implementa auth e RBAC. A arquitetura já prevê:

- `middleware.ts` pronto para verificar sessão e roles
- `contexts/auth-context.tsx` e `contexts/tenant-context.tsx` para estado de auth/tenant
- `hooks/use-auth.ts` e `hooks/use-permissions.ts` para consumo nos componentes
- `lib/services/permissions.ts` para lógica de RBAC
- `lib/supabase/server.ts` com pattern de cookies para SSR auth

Roles previstas (detalhes em ADR-003):

- `atelier_owner` — dono do atelier, acesso total ao shell atelier
- `atelier_member` — membro do atelier, acesso limitado conforme permissões
- `lojista_owner` — dono da loja, acesso total ao shell lojista
- `lojista_buyer` — comprador da loja, acesso a discover + pedidos
- `admin` — administrador MOBIO, acesso ao painel admin

Estratégia detalhada em `docs/adr/ADR-003-auth-rbac-strategy.md`.
