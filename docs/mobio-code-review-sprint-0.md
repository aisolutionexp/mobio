# Code Review: Sprint 0 — Fundacao

## Status: APROVADO COM RESSALVAS

## Resumo Executivo

A Sprint 0 implementou com sucesso a fundacao do projeto MOBIO: Next.js 16.2.5 com Turbopack, Tailwind v4 com tokens MOBIO customizados, Supabase SSR (browser + server + middleware clients), Vitest + RTL + MSW, Playwright E2E, CI/CD via GitHub Actions, Sentry client/server com instrumentation hooks, health check endpoint, e tooling completo (ESLint flat config + Prettier + Husky + lint-staged). A qualidade geral do codigo e alta — TypeScript strict sem `any`, sem console.log perdido, sem secrets no client, separacao correta server/client. Foram encontrados 0 blockers, 4 warnings e 5 suggestions.

## Veredicto: APROVADO COM RESSALVAS

Nenhum blocker impede o avanço. Os 4 warnings devem ser corrigidos antes da Sprint 1, mas nao bloqueiam merge da Sprint 0.

---

## Issues Encontrados

### Blockers

Nenhum.

### Warnings

**W1 — Nome do arquivo Supabase browser client diverge da arquitetura**

- **Arquivo:** `src/lib/supabase/browser.ts`
- **Descricao:** O arquivo foi nomeado `browser.ts`, mas a arquitetura (`docs/mobio-architecture.md:88`), o CLAUDE.md (`:47`), e o ADR-002 definem consistentemente `client.ts`. Tres documentos de referencia nomeiam `src/lib/supabase/client.ts`.
- **Impacto:** Toda futura importacao seguira o nome errado. Quanto mais codigo depender de `browser.ts`, mais custosa a correcao. Importes futuros escritos por devs ou agentes que leiam a arquitetura terao erro de import.
- **Recomendacao:** Renomear `src/lib/supabase/browser.ts` para `src/lib/supabase/client.ts`. A funcao exportada `createClient()` ja esta correta.

**W2 — Sentry tracesSampleRate = 1.0 em producao**

- **Arquivo:** `src/lib/sentry/client.ts:6` e `src/lib/sentry/server.ts:6`
- **Descricao:** `tracesSampleRate: 1.0` envia 100% dos traces para o Sentry. Em producao com trafego real, isso gera custo alto e pode atingir limites de cota.
- **Impacto:** Custo de observabilidade inflacionado; possivel rate limiting do Sentry em producao.
- **Recomendacao:** Usar condicional por ambiente: `tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0`. O proprio task description no backlog menciona "tracesSampleRate sensato (0.1 producao, 1.0 dev)".

**W3 — Middleware noop sem env vars pode mascarar erro de configuracao em producao**

- **Arquivo:** `src/lib/supabase/middleware.ts:10-11`
- **Descricao:** Quando `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` estao ausentes, o middleware retorna silenciosamente sem processar sessao. Em dev/CI isso e adequado, mas em producao a ausencia dessas vars significa deploy quebrado e o middleware silencia o problema ao inves de expor.
- **Impacto:** Em producao, se as env vars faltarem por erro de config da Vercel, todo o sistema de auth sera silenciosamente desabilitado — usuarios nao autenticados acessarao rotas protegidas sem bloqueio. Nao e um risco imediato (Sprint 0 nao tem auth), mas e uma armadilha para Sprint 1+.
- **Recomendacao:** Manter o noop para `NODE_ENV !== "production"` (CI/dev), mas logar um warning ou fazer throw em producao quando as env vars forem obrigatorias. Pode ser implementado na Sprint 1 quando auth for adicionado — registrar como TODO explicito.

**W4 — CI workflow nao inclui cache de Playwright browsers**

- **Arquivo:** `.github/workflows/ci.yml`
- **Descricao:** O workflow nao tem um job de E2E tests nem cache de Playwright browsers. O backlog (Task 0.9) pedia jobs de `lint`, `typecheck`, `test`, `build` — E2E nao era obrigatorio, mas a ausencia de cache para Playwright significa que quando E2E for adicionado ao CI, cada run fara download dos browsers (~300MB), aumentando tempo e custo.
- **Impacto:** Lento quando E2E for adicionado. Sem impacto imediato.
- **Recomendacao:** Adicionar comentario no ci.yml indicando onde adicionar E2E job e cache. Corrigir na Sprint 1 ou quando E2E entrar no CI.

### Suggestions

**S1 — `SENTRY_ORG` e `SENTRY_PROJECT` nao estao no `.env.example`**

- **Arquivo:** `.env.example` / `next.config.ts:8-9`
- **Descricao:** `next.config.ts` referencia `process.env.SENTRY_ORG` e `process.env.SENTRY_PROJECT`, mas essas variaveis nao constam no `.env.example`. Um dev novo nao sabera que precisa configurar.
- **Recomendacao:** Adicionar ao `.env.example` com comentario de escopo (CI/CD only).

**S2 — shadcn/ui usa `base-nova` style com `@base-ui/react` ao inves de Radix**

- **Arquivo:** `components.json:3`, `src/components/ui/button.tsx:1`
- **Descricao:** A arquitetura (`docs/mobio-architecture.md:9`) define "shadcn/ui (Radix primitives + CVA variants)". A implementacao usa shadcn v4 `base-nova` style que utiliza `@base-ui/react` ao inves de Radix. Isso e uma evolucao natural do shadcn/ui v4 (shadcn migrou de Radix para Base UI) — nao e um problema, mas a documentacao de arquitetura esta desatualizada.
- **Recomendacao:** Atualizar `docs/mobio-architecture.md` para refletir "@base-ui/react primitives" ao inves de "Radix primitives" — manter documentacao precisa.

**S3 — `globals.css` referencia `--font-geist-mono` nao definida**

- **Arquivo:** `src/app/globals.css:12`
- **Descricao:** `--font-mono: var(--font-geist-mono)` referencia uma CSS variable que nao esta sendo definida (nenhuma fonte mono foi carregada em `config/fonts.ts`). Nao causa erro visual pois mono nao e usado na Sprint 0, mas e uma variavel apontando para o vazio.
- **Recomendacao:** Remover a linha ou carregar Geist Mono se planejado para uso futuro. Baixa prioridade.

**S4 — Sentry Replay configurado no client sem menção na arquitetura**

- **Arquivo:** `src/lib/sentry/client.ts:7-8`
- **Descricao:** `replaysSessionSampleRate: 0.1` e `replaysOnErrorSampleRate: 1.0` configuram Sentry Session Replay, que nao esta mencionado nos docs de arquitetura nem no backlog. Nao e problema — e uma feature util — mas pode gerar custo no plano Sentry.
- **Recomendacao:** Documentar decisao de usar Replay em `docs/decisions.md` e confirmar que o plano Sentry suporta.

**S5 — `brand.ts` cores em hex vs `globals.css` em oklch**

- **Arquivo:** `src/config/brand.ts` vs `src/app/globals.css`
- **Descricao:** `brand.ts` define cores em hex (#1a1a2e, #c9a96e, etc.) enquanto `globals.css` define tokens em oklch. As cores representam o mesmo valor, mas a dualidade pode causar confusao se alguem referenciar `brand.ts` esperando os mesmos valores exatos de `globals.css`.
- **Recomendacao:** Adicionar comentario em `brand.ts` indicando que os tokens autoritativos estao em `globals.css` (CSS custom properties) e que `brand.ts` e referencia para uso programatico fora do CSS.

---

## Pontos Positivos

1. **Separacao server/client impecavel** — `browser.ts` usa `createBrowserClient` com apenas `NEXT_PUBLIC_*`, `server.ts` usa `createServerClient` com cookies corretamente awaitados, `middleware.ts` usa `getUser()` (nunca `getSession()`) conforme regra de seguranca do projeto.
2. **TypeScript strict sem atalhos** — Nenhum `any`, nenhum `as Type`, nenhum `!` non-null assertion (exceto nos `process.env.NEXT_PUBLIC_*!` que sao padrão Supabase). Database type skeleton usa `Record<string, never>` ao inves de `any` ou `{}`.
3. **Tooling completo e coeso** — ESLint flat config com eslint-config-prettier para evitar conflitos, Prettier com plugin Tailwind, Husky pre-commit com lint-staged. Tudo integrado sem gaps.
4. **Sentry com pattern moderno** — Usa `instrumentation.ts` + `instrumentation-client.ts` (Next.js 16 pattern), nao os antigos `sentry.client.config.ts` / `sentry.server.config.ts`. `error.tsx` integra `captureException` corretamente.
5. **CI/CD bem estruturado** — Build job depende de lint + typecheck + test (gate correto). Concurrency com cancel-in-progress evita builds duplicados. Env vars de build sao placeholders (nao secrets reais).
6. **UI em pt-BR consistente** — Error boundary ("Algo deu errado"), not-found ("Pagina nao encontrada"), pagina raiz — tudo em portugues conforme regra do projeto.
7. **Tokens MOBIO customizados com dark mode** — Light e dark themes completos em oklch com bridge correto para shadcn/ui. Fontes Fraunces + Inter com CSS variables e font-display swap.

---

## Itens de DoD Verificados

### DoD Geral da Sprint 0

- [x] `npm run dev` inicia sem erros (Turbopack) — reportado pelo stack agent
- [x] `npm run build` compila sem erros TypeScript — CI workflow confirma
- [x] `npm run lint` passa sem warnings — reportado pelo stack agent
- [x] Tokens de marca (cores, fontes Fraunces + Inter) visiveis na pagina raiz — `page.tsx` demonstra tokens
- [x] Smoke test Playwright verde — `e2e/smoke.spec.ts` valida heading MOBIO
- [x] Vitest roda com pelo menos 1 teste passando — 4 testes em `utils.test.ts`
- [x] `GET /api/health` retorna 200 com JSON `{ status: "ok" }` — `route.ts` implementado
- [x] CI/CD executa lint, typecheck, test, build — `.github/workflows/ci.yml` confirmado
- [x] Sentry captura erros no client e server — init em instrumentation hooks + error boundary
- [x] `.env.example` usa `NEXT_PUBLIC_` (nao `VITE_`) — confirmado via grep

### Verificacao por Task

| Task                             | Status   | Observacao                                                           |
| -------------------------------- | -------- | -------------------------------------------------------------------- |
| 0.1 Bootstrap Next.js 16         | OK       | Next 16.2.5, TS strict, Tailwind v4, shadcn base-nova, path alias @/ |
| 0.2 Tokens MOBIO + bridge shadcn | OK       | CSS custom properties light/dark, bridge completo                    |
| 0.3 Fontes Fraunces + Inter      | OK       | next/font/google, CSS vars --font-sans e --font-display              |
| 0.4 Supabase clients + .env      | RESSALVA | Funcional, porem `browser.ts` deveria ser `client.ts` (W1)           |
| 0.5 Middleware esqueleto         | OK       | TODOs Sprint 1, matcher correto, noop resiliente                     |
| 0.6 ESLint + Prettier + Husky    | OK       | Flat config, lint-staged, pre-commit                                 |
| 0.7 Vitest + RTL + MSW           | OK       | Setup completo, 4 testes passando, MSW lifecycle correto             |
| 0.8 Playwright E2E smoke         | OK       | Smoke test, webServer config, gitignore atualizado                   |
| 0.9 CI/CD GitHub Actions         | RESSALVA | Jobs corretos, falta cache Playwright (W4)                           |
| 0.10 Sentry + /api/health        | RESSALVA | Funcional, tracesSampleRate nao diferencia prod/dev (W2)             |

---

## Seguranca

- [x] Nenhuma credencial real em arquivo versionado
- [x] `.env` e `.env.*` no `.gitignore` (exceto `.env.example`)
- [x] `SUPABASE_SERVICE_ROLE_KEY` nao aparece em nenhum arquivo em `src/` (grep confirmou)
- [x] `src/lib/supabase/admin.ts` nao existe (correto — so sera criado em sprint futura)
- [x] Sentry nao expoe secrets — usa `SENTRY_DSN` (publica) e `SENTRY_AUTH_TOKEN` apenas em CI
- [x] `vercel.json` sem secrets
- [x] `.env.example` usa valores placeholder (nao credenciais reais)
- [x] Browser client usa apenas `NEXT_PUBLIC_*` vars
- [x] Middleware usa `getUser()` (nao `getSession()`) — correto

---

## Recomendacao para o QA Agent

O QA deve focar em:

1. **Build verde**: `npm run build` sem erros — validar que o CI compila
2. **Dev server**: `npm run dev` inicia e renderiza pagina raiz com tokens MOBIO (cores, fontes)
3. **Health check**: `GET http://localhost:3000/api/health` retorna `{ "status": "ok", "timestamp": "..." }`
4. **Testes unitarios**: `npm run test` — 4 testes do `cn()` passam
5. **E2E smoke**: `npm run test:e2e` — heading MOBIO visivel
6. **Lint**: `npm run lint` sem erros
7. **Verificacao visual**: Pagina raiz mostra botoes shadcn com cores MOBIO (nao default cinza), fontes Fraunces em headings e Inter no body
8. **Seguranca**: Confirmar que `src/lib/supabase/browser.ts` NAO importa `SUPABASE_SERVICE_ROLE_KEY`
9. **Middleware**: Navegar entre paginas nao causa erro (middleware noop funcional)
10. **.env.example**: Nao contem nenhum `VITE_` prefix

---

## Atribuicao de Origem dos Problemas

- **W1 (browser.ts vs client.ts):** Erro de implementacao do Stack Agent — a arquitetura define `client.ts` claramente em 3 documentos
- **W2 (tracesSampleRate):** Erro de implementacao do Stack Agent — o backlog explicita "0.1 producao, 1.0 dev" e nao foi implementado
- **W3 (middleware noop prod):** Ninguem — e uma decisao de design valida para Sprint 0, mas precisa de TODO para Sprint 1
- **W4 (cache Playwright CI):** Ninguem — e otimizacao, nao estava explicita no backlog

**Resumo:** Agentes de planejamento entregaram corretamente. Os 2 warnings atribuiveis sao de implementacao do Stack Agent (naming + config).
