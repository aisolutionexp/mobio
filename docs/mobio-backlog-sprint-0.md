# Backlog — Sprint 0: Fundação

> Sprint 0 materializa a infraestrutura do projeto MOBIO a partir do repositório
> vazio. Ao final, o ambiente de desenvolvimento estará completamente funcional:
> Next.js 16 rodando com Turbopack, tokens de marca aplicados, Supabase
> configurado (client + types skeleton), tooling de qualidade (lint, format,
> hooks), suíte de testes (Vitest + Playwright), CI/CD no GitHub Actions com
> preview deploy na Vercel, observabilidade via Sentry e health check ativo.
> A sprint está dividida em 4 fases sequenciais (A → B → C → D) para respeitar
> dependências; dentro de cada fase, a ordem é estritamente sequencial.

**Sprints (ordem de execução):**

1. Sprint 0 — Fundação (objetivo: projeto rodando end-to-end com tooling, testes, CI/CD e observabilidade)

**Gerado em:** 2026-05-07
**Baseado em:** Architecture v1, ADR-001, ADR-002, ADR-003, decisions.md, CLAUDE.md

**Notas:**

- Stack: Next.js 16 + TS strict + Tailwind CSS 4 + shadcn/ui + Supabase + Vercel + Sentry + Vitest + Playwright
- Branch: `feat/s0-setup`
- Projeto parte de repo vazio (apenas README.md + .gitignore + .env.example + docs/)
- `.env.example` existente usa prefixo `VITE_` — precisa ser corrigido para `NEXT_PUBLIC_` na Task 0.4

**DoD geral da Sprint 0:**

- [ ] `npm run dev` inicia sem erros (Turbopack)
- [ ] `npm run build` compila sem erros TypeScript
- [ ] `npm run lint` passa sem warnings
- [ ] Tokens de marca (cores, fontes Fraunces + Inter) visíveis na página raiz
- [ ] Smoke test Playwright verde
- [ ] Vitest roda com pelo menos 1 teste passando
- [ ] `GET /api/health` retorna 200 com JSON `{ status: "ok" }`
- [ ] CI/CD (GitHub Actions) executa lint → typecheck → test → build
- [ ] Sentry captura erros no client e server
- [ ] `.env.example` usa `NEXT_PUBLIC_` (não `VITE_`)

**Riscos identificados:**

1. **Next.js 16 breaking changes** — versão recente, pode ter edge cases com `@sentry/nextjs`, `@supabase/ssr` ou Tailwind v4. Mitigação: verificar changelogs antes do bootstrap; se bloqueante, pin em 15.x
2. **`.env.example` com prefixo `VITE_`** — legado de tentativa anterior. Corrigido obrigatoriamente na Task 0.4. Risco: alguém copiar o `.env.example` antes da correção e usar prefixo errado
3. **Tailwind CSS v4** — mudança de `tailwind.config.js` para CSS-based config. Verificar compatibilidade com shadcn/ui CLI
4. **Supabase free tier** — suficiente para desenvolvimento, mas Edge Functions têm limite de invocações. Monitorar se CI/CD consome invocações desnecessárias
5. **shadcn/ui + Tailwind v4** — shadcn/ui pode requerer adaptações para Tailwind v4 (CSS variables vs `tailwind.config`). Verificar docs do shadcn antes de iniciar

---

## Fase A — Fundação (bootstrap + banco + tooling)

---

### Task 0.1 — Bootstrap Next.js 16 + TypeScript + Tailwind + shadcn/ui

- **ID GP:** `19663a65`
- **Tipo:** setup
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** nenhuma
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `package.json`
  - `next.config.ts`
  - `tsconfig.json`
  - `tailwind.config.ts` (ou `postcss.config.mjs` se Tailwind v4 CSS-native)
  - `src/app/layout.tsx` (root layout)
  - `src/app/page.tsx` (página raiz)
  - `src/app/globals.css` (directives Tailwind)
  - `src/lib/utils.ts` (`cn()` helper)
  - `components.json` (config shadcn/ui)
  - `src/components/ui/button.tsx` (ao menos 1 componente shadcn como validação)
- **Resultado esperado:** Projeto Next.js 16 rodando com `npm run dev` (Turbopack), TypeScript strict, Tailwind CSS funcional, shadcn/ui inicializado com pelo menos o componente Button disponível. Estrutura de pastas conforme ADR-002 (`src/` com path alias `@/`).
- **Critérios de aceite:**
  - [ ] `npm run dev` inicia sem erros
  - [ ] `npm run build` compila sem erros
  - [ ] Path alias `@/` → `./src/` funcional
  - [ ] TypeScript em strict mode (`tsconfig.json` → `"strict": true`)
  - [ ] Tailwind CSS aplicando estilos (ex: `className="bg-red-500"` renderiza vermelho)
  - [ ] `cn()` disponível em `@/lib/utils`
  - [ ] shadcn/ui `Button` renderiza corretamente
  - [ ] Estrutura de pastas: `src/app/`, `src/components/ui/`, `src/lib/`

---

### Task 0.4 — Supabase: projeto local + client + .env + types skeleton

- **ID GP:** `4d4a01b7`
- **Tipo:** setup
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.1
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `src/lib/supabase/client.ts` (browser client singleton)
  - `src/lib/supabase/server.ts` (server client com cookies)
  - `src/lib/supabase/middleware.ts` (helper para middleware auth)
  - `src/types/database.ts` (types skeleton — placeholder até Sprint 1)
  - `.env.local` (credenciais reais — gitignored)
  - `.env.example` (atualizado com prefixos `NEXT_PUBLIC_`)
- **Resultado esperado:** Supabase clients configurados conforme arquitetura (`client.ts`, `server.ts`, `middleware.ts`). Types skeleton em `src/types/database.ts` com estrutura mínima para não quebrar imports. `.env.example` corrigido de `VITE_` para `NEXT_PUBLIC_`.
- **Critérios de aceite:**
  - [ ] `.env.example` atualizado: `VITE_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `src/lib/supabase/client.ts` exporta `createBrowserClient()` singleton
  - [ ] `src/lib/supabase/server.ts` exporta `createServerClient()` com cookies do Next.js
  - [ ] `src/lib/supabase/middleware.ts` exporta helper para uso no middleware de auth
  - [ ] `src/types/database.ts` existe como skeleton tipado (pode ser vazio ou com tipo mínimo `Database`)
  - [ ] Deps instaladas: `@supabase/supabase-js`, `@supabase/ssr`
  - [ ] Nenhum `VITE_` remanescente em qualquer arquivo do projeto
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` presente apenas em `.env.example` como comentário server-only, nunca importado no client

**ATENCAO — Correção obrigatória do `.env.example`:**
O `.env.example` existente na raiz do projeto usa prefixos `VITE_` (legado de tentativa anterior com Vite). Esta task DEVE corrigir para `NEXT_PUBLIC_` conforme regra do projeto (CLAUDE.md → "Prefixo `NEXT_PUBLIC_` para variáveis expostas ao client, nunca `VITE_`"). Verificar com grep que nenhum `VITE_` permaneça em qualquer arquivo após a correção.

---

### Task 0.6 — ESLint + Prettier + Husky + lint-staged

- **ID GP:** `c4c0c0cb`
- **Tipo:** config
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.4
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `eslint.config.mjs` (ESLint flat config — Next.js 16 usa flat config)
  - `.prettierrc` (ou `prettier.config.mjs`)
  - `.prettierignore`
  - `.husky/pre-commit`
  - `lint-staged.config.mjs` (ou campo `lint-staged` no `package.json`)
  - Scripts em `package.json`: `lint`, `lint:fix`, `format`, `format:check`
- **Resultado esperado:** Lint e formatação automáticos. Husky roda lint-staged no pre-commit (lint + format nos arquivos staged). ESLint configurado para Next.js + TypeScript + React. Prettier com regras consistentes.
- **Critérios de aceite:**
  - [ ] `npm run lint` passa sem erros em todos os arquivos existentes
  - [ ] `npm run format:check` confirma que todos os arquivos estão formatados
  - [ ] Husky pre-commit roda lint-staged ao fazer `git commit`
  - [ ] lint-staged executa ESLint + Prettier nos arquivos `.ts`, `.tsx`, `.js`, `.mjs`
  - [ ] Regras de ESLint compatíveis com App Router (sem warnings em Server Components)
  - [ ] Prettier não conflita com ESLint (usar `eslint-config-prettier` ou equivalente)

---

## Fase B — Estilo (fontes + tokens de marca)

---

### Task 0.3 — Fontes MOBIO via next/font (Fraunces + Inter)

- **ID GP:** `0e90856b`
- **Tipo:** config
- **Estimativa:** P (30min-1h)
- **Prioridade:** alta
- **Dependências:** Task 0.1
- **Stories cobertas:** —
- **Arquivos esperados:**
  - Modificar: `src/app/layout.tsx` (importar e aplicar fontes via `next/font`)
  - Criar: `src/config/fonts.ts` (centralizar definição das fontes)
- **Resultado esperado:** Fontes Fraunces (display/headings) e Inter (body/text) carregadas via `next/font/google`, com CSS variables aplicadas no `<html>` para consumo pelo Tailwind e componentes.
- **Critérios de aceite:**
  - [ ] Fraunces carregada via `next/font/google` com subset latin
  - [ ] Inter carregada via `next/font/google` com subset latin
  - [ ] CSS variables `--font-display` (Fraunces) e `--font-sans` (Inter) aplicadas no `<html>`
  - [ ] Tailwind configurado para usar as CSS variables como `fontFamily`
  - [ ] Página raiz renderiza com Inter no body e Fraunces em algum heading de exemplo
  - [ ] Sem flash de fonte não-estilizada (FOUT) — `next/font` garante isso nativamente

---

### Task 0.2 — Tokens MOBIO + bridge shadcn (CSS custom properties)

- **ID GP:** `8d159ed1`
- **Tipo:** config
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.3
- **Stories cobertas:** —
- **Arquivos esperados:**
  - Modificar: `src/app/globals.css` (tokens como CSS custom properties no `:root` e `.dark`)
  - Modificar: `tailwind.config.ts` (estender tema com tokens via CSS variables)
  - Criar: `src/config/brand.ts` (constantes de marca: nome, descrição, cores em formato TS)
- **Resultado esperado:** Design tokens do MOBIO (paleta de cores, espaçamento, border-radius, tipografia) definidos como CSS custom properties em `globals.css`. Bridge com shadcn/ui: os tokens do MOBIO mapeiam para as variáveis que o shadcn/ui espera (`--background`, `--foreground`, `--primary`, `--muted`, etc.). Página raiz demonstra tokens aplicados.
- **Critérios de aceite:**
  - [ ] CSS custom properties definidas no `:root` para light mode e em `.dark` para dark mode
  - [ ] Tokens mapeiam para as variáveis esperadas pelo shadcn/ui (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`)
  - [ ] Tailwind estendido para consumir tokens via `var(--nome-do-token)`
  - [ ] `src/config/brand.ts` exporta constantes de marca reutilizáveis
  - [ ] Botão shadcn/ui (`<Button>`) renderiza com cores do MOBIO (não o default cinza)
  - [ ] Fontes Fraunces e Inter integradas no token de tipografia
  - [ ] Página raiz mostra visualmente que os tokens estão aplicados (cores, fontes, espaçamento)

---

## Fase C — Testes (unit + E2E)

---

### Task 0.7 — Vitest + Testing Library + MSW (setup completo)

- **ID GP:** `a3a1fb3b`
- **Tipo:** setup
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.6
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `vitest.config.ts` (config com path alias, jsdom, setup files)
  - `src/test/setup.ts` (setup global — RTL matchers, MSW server start/reset/close)
  - `src/test/mocks/handlers.ts` (handlers MSW placeholder)
  - `src/test/mocks/server.ts` (MSW server instance)
  - `src/test/utils.tsx` (render customizado com providers se necessário)
  - `src/lib/__tests__/utils.test.ts` (teste smoke de `cn()`)
  - Scripts em `package.json`: `test`, `test:watch`, `test:coverage`
- **Resultado esperado:** Vitest configurado com jsdom, React Testing Library, MSW para mocking de API. Pelo menos 1 teste passando (`cn()` helper). Setup file inicializa MSW e limpa handlers entre testes.
- **Critérios de aceite:**
  - [ ] `npm run test` roda e passa sem erros
  - [ ] Vitest resolve path alias `@/`
  - [ ] React Testing Library disponível (imports de `@testing-library/react` funcionam)
  - [ ] MSW server inicia no setup e limpa handlers após cada teste
  - [ ] Teste de `cn()` passa (merging de classes Tailwind)
  - [ ] Coverage report configurado (`npm run test:coverage` gera relatório)
  - [ ] Deps instaladas: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`

---

### Task 0.8 — Playwright: esqueleto E2E com teste smoke

- **ID GP:** `54ab4e0b`
- **Tipo:** setup
- **Estimativa:** P (30min-1h)
- **Prioridade:** alta
- **Dependências:** Task 0.7
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `playwright.config.ts` (config com baseURL localhost, webServer, retries)
  - `e2e/smoke.spec.ts` (teste smoke: página raiz carrega e tem título)
  - `.gitignore` atualizado com `test-results/`, `playwright-report/`
  - Scripts em `package.json`: `test:e2e`, `test:e2e:ui`
- **Resultado esperado:** Playwright configurado com teste smoke que valida que a aplicação Next.js carrega. Config usa `webServer` para subir o dev server automaticamente.
- **Critérios de aceite:**
  - [ ] `npm run test:e2e` executa sem erros
  - [ ] Teste smoke navega para `/` e verifica que a página carregou (título ou elemento visível)
  - [ ] `playwright.config.ts` configura `webServer` com `npm run dev`
  - [ ] Artefatos de teste (`test-results/`, `playwright-report/`) no `.gitignore`
  - [ ] Playwright instalado com browsers: `npx playwright install --with-deps chromium`

---

## Fase D — Infraestrutura (middleware + observabilidade + CI/CD)

---

### Task 0.5 — Middleware de roteamento (esqueleto com guards de role)

- **ID GP:** `c6f142cb`
- **Tipo:** feat
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.4
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `src/middleware.ts` (middleware principal — esqueleto)
  - Modificar: `src/lib/supabase/middleware.ts` (helper de session refresh)
- **Resultado esperado:** Middleware do Next.js configurado como esqueleto funcional. Na Sprint 0, sem auth real — apenas estrutura preparada para Sprint 1. O middleware deve: (1) refresh de sessão Supabase (via helper), (2) stub de verificação de role que permite tudo por enquanto, (3) config de matcher para excluir assets estáticos e API routes públicas.
- **Critérios de aceite:**
  - [ ] `src/middleware.ts` exporta `middleware` function e `config.matcher`
  - [ ] Matcher exclui: `_next/static`, `_next/image`, `favicon.ico`, arquivos estáticos
  - [ ] Middleware chama helper de session refresh do Supabase (sem bloquear — noop se sem sessão)
  - [ ] Comentários `// TODO Sprint 1:` indicam onde adicionar verificação de role e redirect
  - [ ] Aplicação continua funcionando normalmente com o middleware ativo (não bloqueia navegação)
  - [ ] Estrutura preparada para role routing conforme ADR-003 (if/else por role → route group)

---

### Task 0.10 — Sentry SDK + route handler /api/health

- **ID GP:** `bf4054b3`
- **Tipo:** setup
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.5
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `src/lib/sentry/client.ts` (Sentry client-side init)
  - `src/lib/sentry/server.ts` (Sentry server-side init)
  - `src/instrumentation.ts` (Next.js instrumentation hook — inicia Sentry server)
  - `src/instrumentation-client.ts` (ou init no root layout — inicia Sentry client)
  - `src/app/api/health/route.ts` (route handler GET → `{ status: "ok", timestamp }`)
  - `src/app/error.tsx` (error boundary global com Sentry.captureException)
  - `src/app/not-found.tsx` (404 global)
  - Modificar: `next.config.ts` (plugin `@sentry/nextjs` para source maps)
  - Modificar: `.env.example` (adicionar `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`)
- **Resultado esperado:** Sentry captura erros automaticamente no client e server. Route handler `/api/health` responde com status 200 e JSON. Error boundary global integrado com Sentry. Source maps configurados para upload no build.
- **Critérios de aceite:**
  - [ ] `GET /api/health` retorna `{ "status": "ok", "timestamp": "..." }` com status 200
  - [ ] Sentry client init em `src/lib/sentry/client.ts` com DSN do env
  - [ ] Sentry server init em `src/lib/sentry/server.ts` via `instrumentation.ts`
  - [ ] `@sentry/nextjs` configurado em `next.config.ts`
  - [ ] `src/app/error.tsx` captura erros com `Sentry.captureException()` e mostra UI de erro
  - [ ] `src/app/not-found.tsx` existe com UI mínima
  - [ ] `.env.example` contém `SENTRY_DSN` e `SENTRY_AUTH_TOKEN` (com comentários de escopo)
  - [ ] Deps instaladas: `@sentry/nextjs`

---

### Task 0.9 — CI/CD: GitHub Actions + preview deploy Vercel

- **ID GP:** `237632e3`
- **Tipo:** infra
- **Estimativa:** M (1-2h)
- **Prioridade:** alta
- **Dependências:** Task 0.10
- **Stories cobertas:** —
- **Arquivos esperados:**
  - `.github/workflows/ci.yml` (pipeline: lint → typecheck → test → build)
  - `vercel.json` (config mínima — framework detection + region)
- **Resultado esperado:** Pipeline CI/CD no GitHub Actions que roda em PRs e pushes para `main` e branches de feature. Vercel faz deploy automático (preview para branches, produção para `main`). O workflow valida qualidade antes do deploy.
- **Critérios de aceite:**
  - [ ] `.github/workflows/ci.yml` existe com jobs: `lint`, `typecheck`, `test`, `build`
  - [ ] Pipeline usa `actions/checkout@v4`, `actions/setup-node@v4` com cache npm
  - [ ] Job `lint`: `npm run lint`
  - [ ] Job `typecheck`: `npx tsc --noEmit`
  - [ ] Job `test`: `npm run test -- --run` (Vitest em modo CI, não watch)
  - [ ] Job `build`: `npm run build`
  - [ ] Pipeline roda em: push para `main`, push para `feat/**`, `fix/**`, PRs para `main`
  - [ ] `vercel.json` configurado com framework `nextjs` e região adequada
  - [ ] Secrets documentados como necessários no repo: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (ou Vercel Git Integration automática)

**Ações manuais do desenvolvedor:**

- [ ] Conectar repositório GitHub ao projeto Vercel (Vercel Dashboard → Import Git Repository)
- [ ] Configurar variáveis de ambiente no Vercel Dashboard (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`)
- [ ] Se não usar Vercel Git Integration: criar secrets no GitHub (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)

---

## Ordem de Execução (Resumo)

```
Fase A — Fundação
  Task 0.1  Bootstrap Next.js 16              (sem dependência)
  Task 0.4  Supabase client + .env            (depende: 0.1)
  Task 0.6  ESLint + Prettier + Husky         (depende: 0.4)

Fase B — Estilo
  Task 0.3  Fontes Fraunces + Inter           (depende: 0.1)  [paralela à Fase A após 0.1]
  Task 0.2  Tokens MOBIO + bridge shadcn      (depende: 0.3)

Fase C — Testes
  Task 0.7  Vitest + RTL + MSW               (depende: 0.6)
  Task 0.8  Playwright E2E smoke              (depende: 0.7)

Fase D — Infraestrutura
  Task 0.5  Middleware esqueleto              (depende: 0.4)  [paralela às Fases B/C após 0.4]
  Task 0.10 Sentry + /api/health             (depende: 0.5)
  Task 0.9  CI/CD GitHub Actions + Vercel    (depende: 0.10)
```

**Nota sobre paralelismo:** Tasks 0.3 e 0.4 podem ser executadas em paralelo após 0.1. Da mesma forma, Task 0.5 pode ser executada em paralelo com a Fase B após 0.4 estar concluída. No entanto, para execução sequencial por um único agente, a ordem recomendada é a listada acima (Fase A → B → C → D).

**Grafo de dependências:**

```
0.1 ──┬── 0.4 ──┬── 0.6 ── 0.7 ── 0.8
      │         │
      │         └── 0.5 ── 0.10 ── 0.9
      │
      └── 0.3 ── 0.2
```
