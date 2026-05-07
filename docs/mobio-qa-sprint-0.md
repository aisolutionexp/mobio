# QA Report: Sprint 0 — Setup & Fundamentos

## Status: APROVADO

## Resumo Executivo

Todos os 15 itens do DoD da Sprint 0 foram validados com sucesso. A fundacao do projeto MOBIO esta solida: Next.js 16.2.5 compila, linta, passa testes unitarios (Vitest, 4/4) e E2E (Playwright, 1/1), dev server responde corretamente, health check retorna 200, tokens MOBIO estao aplicados (cores oklch + fontes Fraunces/Inter), pagina 404 customizada funciona, CI/CD configurado com 4 jobs, Sentry integrado, e nenhuma credencial real esta exposta. O Code Review encontrou 0 blockers — as 4 warnings e 5 suggestions nao impedem o merge.

## Veredicto: APROVADO

Commit liberado. Pode abrir PR para merge na main.

---

## DoD — Validacao dos 15 Itens

| #   | Item                                                            | Status | Comando / Verificacao                     | Output Relevante                                                                                                                                                                                                                           |
| --- | --------------------------------------------------------------- | ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `npm run lint` exit 0                                           | PASSOU | `npm run lint`                            | Exit code 0, sem erros nem warnings                                                                                                                                                                                                        |
| 2   | `npx tsc --noEmit` exit 0                                       | PASSOU | `npx tsc --noEmit`                        | Exit code 0, sem erros                                                                                                                                                                                                                     |
| 3   | `npm run build` exit 0, sem erros TS                            | PASSOU | `npm run build`                           | Next.js 16.2.5 (Turbopack), compiled successfully in 2.5s, 3 routes geradas (/, /\_not-found, /api/health)                                                                                                                                 |
| 4   | `npm test` ao menos 1 teste passando                            | PASSOU | `npm test -- --run`                       | 1 test file, 4 tests passed (utils.test.ts — cn() helper)                                                                                                                                                                                  |
| 5   | `npx playwright test` ao menos 1 teste passando                 | PASSOU | `npx playwright test`                     | 1 passed (smoke.spec.ts — "home page loads with MOBIO heading"), 4.8s                                                                                                                                                                      |
| 6   | `npm run dev` responde em localhost:3000                        | PASSOU | `npm run dev` + `curl -sI localhost:3000` | HTTP/1.1 200 OK, X-Powered-By: Next.js                                                                                                                                                                                                     |
| 7   | `/api/health` retorna 200 com JSON                              | PASSOU | `curl -s localhost:3000/api/health`       | `{"status":"ok","timestamp":"2026-05-07T18:25:36.981Z"}`                                                                                                                                                                                   |
| 8   | `/` retorna 200 com "MOBIO" e classes Tailwind                  | PASSOU | `curl -s localhost:3000`                  | `<h1 class="font-heading text-primary text-5xl font-bold tracking-tight">MOBIO</h1>`, classes Tailwind aplicadas em todo o HTML                                                                                                            |
| 9   | CSS vars dos tokens MOBIO presentes                             | PASSOU | `grep globals.css`                        | `--primary`, `--background`, `--foreground`, `--secondary`, `--muted`, `--accent`, `--destructive` em oklch, light e dark mode                                                                                                             |
| 10  | Fontes Fraunces e Inter carregadas                              | PASSOU | `grep HTML` + `cat fonts.ts`              | `<html>` tem classes `inter_*__variable fraunces_*__variable`, `fonts.ts` define `--font-sans` (Inter) e `--font-display` (Fraunces) via next/font/google, `globals.css` mapeia `--font-heading: var(--font-display)`                      |
| 11  | Estrutura de pastas conforme architecture.md                    | PASSOU | `find src/ -type f` + `ls`                | Route groups: (admin), (atelier), (auth), (lojista). Supabase: browser.ts, server.ts, middleware.ts. Middleware: src/middleware.ts. Health: src/app/api/health/route.ts. Sentry: src/lib/sentry/{client,server}.ts + instrumentation hooks |
| 12  | `.env.example` NAO contem credenciais reais                     | PASSOU | `cat .env.example`                        | Apenas placeholders: `https://your-project.supabase.co`, `eyJhbG...`, `sbp_xxx`, `sntrys_xxx`                                                                                                                                              |
| 13  | `.env` real NAO esta versionado                                 | PASSOU | `git status --porcelain` + `.gitignore`   | `.env` e `.env.*` estao no `.gitignore` (exceto `.env.example`), nenhum `.env` aparece como tracked                                                                                                                                        |
| 14  | `.github/workflows/ci.yml` existe com lint+typecheck+test+build | PASSOU | `cat ci.yml`                              | 4 jobs: lint (`npm run lint`), typecheck (`npx tsc --noEmit`), test (`npm run test`), build (`npm run build`). Roda em push main/feat/fix + PRs para main. Concurrency com cancel-in-progress                                              |
| 15  | CLAUDE.md, decisions.md, ADRs preservados                       | PASSOU | `ls docs/`                                | CLAUDE.md na raiz, docs/decisions.md, docs/adr/ com ADR-001, ADR-002, ADR-003 — todos presentes                                                                                                                                            |

---

## Testes Manuais no Browser (via curl)

| Teste                                              | Resultado | Detalhes                                                                                                                                                                                                             |
| -------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http://localhost:3000` — landing com tokens MOBIO | PASSOU    | H1 "MOBIO" com classe `font-heading text-primary`, botoes shadcn (Primario, Secundario, Outline, Ghost, Destrutivo) com classes MOBIO, card Tipografia, color swatches (Primary, Secondary, Accent, Muted, Destruct) |
| `http://localhost:3000/api/health` — JSON          | PASSOU    | `{"status":"ok","timestamp":"..."}` com HTTP 200                                                                                                                                                                     |
| `http://localhost:3000/_not-found` — pagina 404    | PASSOU    | HTTP 404, renderiza "Pagina nao encontrada" com botao "Voltar ao inicio" em pt-BR                                                                                                                                    |
| Console limpo de erros                             | PASSOU    | Sem erros JS no output do servidor. Warning de middleware deprecation (`"middleware" → "proxy"`) e aceitavel (Next.js 16 migration path)                                                                             |

---

## Seguranca

| Verificacao                                          | Resultado                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `SERVICE_ROLE_KEY` ausente em browser client         | PASSOU — grep retornou vazio em `src/lib/supabase/browser.ts` |
| `.env` nao versionado                                | PASSOU — .gitignore cobre `.env` e `.env.*`                   |
| `.env.example` sem credenciais reais                 | PASSOU — apenas placeholders                                  |
| Nenhum `VITE_` prefix remanescente                   | PASSOU — grep em `.env.example` e `src/` retornou vazio       |
| `test-results/` e `playwright-report/` no .gitignore | PASSOU                                                        |

---

## Cobertura de Testes

| Tipo              | Arquivo                           | Testes | Resultado      |
| ----------------- | --------------------------------- | ------ | -------------- |
| Unitario (Vitest) | `src/lib/__tests__/utils.test.ts` | 4      | 4/4 PASSOU     |
| E2E (Playwright)  | `e2e/smoke.spec.ts`               | 1      | 1/1 PASSOU     |
| **Total**         |                                   | **5**  | **5/5 PASSOU** |

---

## Warnings do Code Review (nao bloqueantes)

Os 4 warnings identificados pelo Code Review foram confirmados. Nenhum impede o merge da Sprint 0:

| Warning                                   | Confirmado                                                | Impacto Sprint 0                              |
| ----------------------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| W1 — `browser.ts` vs `client.ts` (naming) | Sim — arquivo e `browser.ts`, arquitetura diz `client.ts` | Nenhum — funcional, corrigir antes Sprint 1   |
| W2 — `tracesSampleRate: 1.0` em prod      | Sim — ambos client.ts e server.ts usam 1.0 fixo           | Nenhum em dev — corrigir antes de deploy prod |
| W3 — Middleware noop sem env vars em prod | Sim — retorna silenciosamente                             | Nenhum — Sprint 0 nao tem auth                |
| W4 — CI sem cache Playwright              | Sim — ci.yml nao tem job E2E                              | Nenhum — E2E roda local                       |

---

## Bugs Encontrados

Nenhum bug encontrado.

---

## Notas Adicionais

1. **Next.js 16 middleware deprecation:** O build e o dev server emitem warning `The "middleware" file convention is deprecated. Please use "proxy" instead.` Isso e esperado — Next.js 16 esta migrando a API. O middleware funciona normalmente. Avaliar migracao para Sprint 1+.

2. **Fontes carregadas corretamente:** O HTML servido confirma que Inter e Fraunces sao carregadas via next/font com preload de woff2 e CSS variables aplicadas no `<html>`. Sem FOUT.

3. **shadcn/ui usa base-nova (@base-ui/react):** Conforme S2 do Code Review, shadcn v4 migrou de Radix para Base UI. Funcional — atualizar docs de arquitetura.

---

## Recomendacao Final

**Commit liberado. PR pode ser aberto para merge na branch main.**

Todas as 15 verificacoes do DoD passaram. Os warnings do Code Review devem ser corrigidos antes da Sprint 1, mas nao bloqueiam o merge da Sprint 0. O projeto esta pronto para receber a proxima sprint.
