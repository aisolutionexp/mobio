# ADR-002: Estrutura de Pastas — Route Groups + src/

## Status: Accepted

## Contexto

O MOBIO tem dois shells distintos (Atelier e Lojista) com navegação, layout e permissões diferentes, além de um painel Admin. A estrutura de pastas precisa:

- Separar visualmente os shells sem duplicar código compartilhado
- Permitir que cada shell tenha layout, error boundary e loading states independentes
- Escalar para 11 sprints de features sem virar caos
- Manter a convenção do Next.js App Router

## Decisão

### 1. Código em `src/` (não na raiz)

Todo código da aplicação fica dentro de `src/`. A raiz contém apenas configuração (`next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, etc.).

**Motivo:** Separação clara entre código e configuração. Path alias `@/` aponta para `./src/`, mantendo imports limpos.

### 2. Route groups para separar shells

```
src/app/
├── (auth)/        # Login, registro — sem sidebar
├── (atelier)/     # Shell do atelier/fábrica
├── (lojista)/     # Shell do lojista
├── (admin)/       # Painel administrativo
└── api/           # Route Handlers (webhooks, cron)
```

Cada route group tem seu próprio `layout.tsx` com sidebar, topbar e providers específicos.

**Regra de URL:** Route groups não afetam a URL. `(atelier)/catalogo/page.tsx` resolve para `/catalogo`. O `middleware.ts` determina qual route group servir com base no role do usuário autenticado.

### 3. Componentes organizados em 3 camadas

```
src/components/
├── ui/            # shadcn/ui — atoms reutilizáveis (Button, Input, Dialog)
├── shared/        # Componentes compartilhados entre shells (DataTable, FileUpload)
└── domain/        # Componentes de domínio por feature (ProductCard, OrderTimeline)
```

- `ui/` — gerado pelo shadcn/ui CLI, modificável livremente
- `shared/` — componentes genéricos que não pertencem a um domínio específico
- `domain/[feature]/` — componentes que encapsulam lógica de um domínio de negócio

### 4. Lib como camada de serviço

```
src/lib/
├── supabase/      # Clients (browser, server, admin)
├── sentry/        # Init configs
├── actions/       # Server Actions por domínio
├── services/      # Lógica de negócio pura
├── validators/    # Schemas zod
└── utils.ts       # Funções puras utilitárias
```

## Alternativas descartadas

### Apps separadas com Turborepo (monorepo multi-package)

```
apps/
├── atelier/       # Next.js app para ateliês
├── lojista/       # Next.js app para lojistas
└── admin/         # Next.js app para admin
packages/
├── ui/            # Componentes compartilhados
├── config/        # Configs compartilhadas
└── types/         # Tipos compartilhados
```

- Melhor isolamento entre shells
- Build independente por app
- **Descartada porque:** Complexidade desproporcional para o estágio do projeto. Supabase é o mesmo, auth é compartilhado, muitos componentes são compartilhados. Turborepo adiciona configuração de packages, versioning, build pipeline. Route groups resolvem o mesmo problema com zero overhead. Se a necessidade de isolamento crescer, migrar para Turborepo é viável sem reescrever código

### Código na raiz (sem src/)

- Menos indireção
- Padrão em alguns templates Next.js
- **Descartada porque:** Com a quantidade de pastas do MOBIO (app, components, lib, hooks, types, contexts, config), a raiz ficaria poluída com 20+ pastas misturando código e configuração. `src/` cria boundary visual clara

### Features como modules auto-contidos

```
src/features/
├── products/
│   ├── components/
│   ├── hooks/
│   ├── actions/
│   └── types.ts
```

- Alta coesão por feature
- Menos arquivos em cada pasta
- **Descartada porque:** No App Router, as rotas já agrupam por feature (`app/(atelier)/catalogo/`). Duplicar essa organização em `features/` cria duas árvores paralelas. Componentes de domínio ficam em `components/domain/[feature]/`, hooks em `hooks/`, actions em `lib/actions/` — colocation suficiente sem estrutura paralela

## Consequências

### Positivas

- Estrutura escalável — cada sprint adiciona pastas dentro de route groups existentes
- Código compartilhado em um só lugar (components/shared, lib/)
- Layout e auth isolados por shell sem duplicação
- Path alias `@/` mantém imports limpos independente da profundidade

### Negativas

- URLs ambíguas entre route groups (ex: `/dashboard` existe em atelier e lojista) — middleware deve resolver. Se mal configurado, pode servir o route group errado
- Route groups são invisíveis na URL — debugging requer conhecer a estrutura
- Se os shells divergirem muito no futuro, route groups podem não ser suficientes — migração para Turborepo seria necessária
