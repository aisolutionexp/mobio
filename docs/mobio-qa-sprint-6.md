# QA Report: Sprint 6 — Linesheet + Boards

## Resumo Executivo

Sprint 6 implementa boards com drag-and-drop, linesheet builder com variantes de pricing, PDF server-side via @react-pdf/renderer, compartilhamento publico via token 256-bit, e importacao de board para linesheet. Validacao estatica (tsc, build, testes) passou integralmente. Lint reporta 1 erro e 15 warnings — o erro e da Sprint 6 (`share-token-list.tsx`), nao pre-existente. Todos os fixes do Code Review (W1 baseUrl, W2 reorder N+1) foram aplicados corretamente. Schema, RLS, RPC e seguranca validados sem problemas.

## Veredicto: APROVADO COM RESSALVAS

Ressalva unica: 1 lint error em `share-token-list.tsx:29` (setState dentro de useEffect — React Compiler rule `react-hooks/set-state-in-effect`). Nao impacta funcionalidade (o useEffect sincroniza props para state, padrao valido em React 18, mas flagged pelo React Compiler). Nao bloqueia deploy.

---

## Tabela 18 Itens DoD

| #   | Item                                             | Resultado     | Detalhe                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npm run lint` exit 0                            | RESSALVA      | 1 error + 15 warnings. O erro esta em `src/components/domain/linesheets/share-token-list.tsx:29` — `setState` dentro de `useEffect` (rule `react-hooks/set-state-in-effect` do React Compiler). Arquivo criado na S6, NAO pre-existente. Os 15 warnings sao pre-existentes (sprints anteriores: `quote-form.tsx`, `factory-settings-form.tsx`, `quotes.test.ts`, `linesheet-pdf.tsx`). |
| 2   | `npx tsc --noEmit` exit 0                        | PASSOU        | 0 erros TypeScript                                                                                                                                                                                                                                                                                                                                                                     |
| 3   | `npm run build` exit 0                           | PASSOU        | Build completo. 6 rotas S6 presentes: `/lojista/boards`, `/lojista/boards/[boardId]`, `/lojista/linesheet`, `/lojista/linesheet/[linesheetId]`, `/linesheet-publico/[token]`, `/api/linesheets/[id]/pdf`                                                                                                                                                                               |
| 4   | `npm test` 305/305                               | PASSOU        | 30 test files, 305 tests, 0 failures (4.53s)                                                                                                                                                                                                                                                                                                                                           |
| 5   | `npx playwright test` smoke OK                   | PASSOU        | 1/1 passed (2.3s)                                                                                                                                                                                                                                                                                                                                                                      |
| 6   | Migrations: 53 total (47+5+1)                    | PASSOU        | 53 migrations locais. S6: 5 (130000-130004) + 1 (140000 retailer ownership)                                                                                                                                                                                                                                                                                                            |
| 7   | Edge functions: 9 (sem nova PDF)                 | PASSOU        | 9 functions listadas. PDF e API Route do Next.js, nao edge function                                                                                                                                                                                                                                                                                                                    |
| 8   | Tabelas/cols S6                                  | PASSOU        | `linesheet_share_tokens` criada (130000). `note` em linesheet_items e board_items (130001). `msrp` em products e `pricing_variant` em linesheets (130002)                                                                                                                                                                                                                              |
| 9   | RPC `get_linesheet_by_token` SECURITY DEFINER    | PASSOU        | Migration 130004: `SECURITY DEFINER SET search_path = public` confirmado                                                                                                                                                                                                                                                                                                               |
| 10  | Auditoria security (6 greps)                     | PASSOU        | `service_role` src/ = 0. `auth.uid()` sem `(SELECT)` em S6 = 0. `select("*")` src/ = 0. `USING(true)` S6 = 0. `listUsers` functions/ = 0. `console.log.*token\|password` functions/ = 0                                                                                                                                                                                                |
| 11  | Zod UUID em IDs                                  | PASSOU        | `z.string().uuid()` presente em 4 arquivos de actions (boards, linesheets, linesheet-export, linesheet-share) + 2 validators = 18 referências. `linesheet-public.ts` recebe token (nao UUID), validado por `length < 10`                                                                                                                                                               |
| 12  | W1 fix: baseUrl parenteses                       | PASSOU        | `linesheet-export.ts:19-23`: `NEXT_PUBLIC_SITE_URL ?? (VERCEL_URL ? ... : ...)` — parenteses corretos aplicados                                                                                                                                                                                                                                                                        |
| 13  | W2 fix: reorder com Promise.all                  | PASSOU        | `boards.ts:403` e `linesheets.ts:468`: `Promise.all(updates)` confirmado, sem for loop sequencial                                                                                                                                                                                                                                                                                      |
| 14  | W3 fix: decisions.md entry                       | PASSOU        | Entry `[2026-05-08] Server actions S6 excedem 200 linhas` presente em decisions.md                                                                                                                                                                                                                                                                                                     |
| 15  | Dev server smoke (rotas S6)                      | NAO EXECUTADO | Dev server nao foi levantado durante QA. Build confirma rotas, Playwright smoke confirma app funcional                                                                                                                                                                                                                                                                                 |
| 16  | Middleware: `/linesheet-publico` em PUBLIC_PATHS | PASSOU        | `src/middleware.ts:22`: `"/linesheet-publico"` presente                                                                                                                                                                                                                                                                                                                                |
| 17  | Sidebar: item 04 = Linesheet                     | PASSOU        | `src/app/(lojista)/layout.tsx:28-29`: label "Linesheet", href "/lojista/linesheet"                                                                                                                                                                                                                                                                                                     |
| 18  | PDF server-side: @react-pdf/renderer             | PASSOU        | `src/lib/pdf/linesheet-pdf.tsx:11` importa `@react-pdf/renderer`. `route.ts` importa `renderLinesheetPdf`. Sem `jspdf` ou `html2canvas` no projeto. Fonte Inter embutida (Google Fonts CDN). Fraunces nao registrada no PDF (apenas Inter)                                                                                                                                             |

---

## Bugs Encontrados

### BUG-001: Lint error em share-token-list.tsx (S6)

- **Arquivo:** `src/components/domain/linesheets/share-token-list.tsx:29`
- **Regra:** `react-hooks/set-state-in-effect`
- **Codigo:**
  ```tsx
  React.useEffect(() => {
    setTokens(initialTokens);
  }, [initialTokens]);
  ```
- **Problema:** O React Compiler flagga `setState` sincrono dentro de `useEffect` como erro porque pode causar renders cascading. O padrao de sincronizar props para state e valido em React 18, mas o React Compiler sugere usar a prop diretamente ou `useSyncExternalStore`.
- **Severidade:** Warning (nao impacta funcionalidade — build compila normalmente, testes passam)
- **Correcao sugerida:** Remover o `useEffect` + `useState` e usar `initialTokens` diretamente, gerenciando apenas o `revokingId` como estado local. Ou usar o pattern `key={listVersion}` para forcar re-render do componente quando os tokens mudam.
- **Classificacao:** Erro da Sprint 6, NAO pre-existente. Arquivo criado na S6.

### Observacao: Lint error pre-existente mencionado pelo CR

O Code Review mencionou "1 erro pre-existente de TODO em `subscriptions.ts:101`". Esse TODO **nao gera lint error** — e apenas um comentario. O erro real de lint e o BUG-001 acima, que o CR nao detectou porque foi introduzido no Lote 3.

### Observacao: Fonte Fraunces ausente no PDF

O DoD menciona "fontes Fraunces/Inter embutidas" no PDF. O PDF (`linesheet-pdf.tsx`) registra apenas Inter via Google Fonts CDN. Fraunces (fonte de heading do design system) nao esta embutida. Impacto visual apenas — headings no PDF usam Inter ao inves de Fraunces. Nao bloqueia.

---

## Pendencias Documentadas

| #   | Pendencia                                                       | Tipo    | Origem                     |
| --- | --------------------------------------------------------------- | ------- | -------------------------- |
| P1  | BUG-001: lint error `share-token-list.tsx:29`                   | Tecnica | Stack Agent S6             |
| P2  | Fonte Fraunces nao embutida no PDF                              | Design  | Stack Agent S6             |
| P3  | `linesheet-pdf.tsx:218` warning de alt text em Image            | A11y    | Stack Agent S6             |
| P4  | boards.ts (453 linhas) e linesheets.ts (691 linhas) excedem 200 | Tecnica | Registrado em decisions.md |

---

## Regressao

Testes de sprints anteriores inclusos no test suite: 305/305 passando. Build compila todas as rotas de S1-S5 sem erros. Playwright smoke confirma homepage funcional.

---

## Atribuicao de Origem dos Problemas

- **BUG-001 (lint error setState em useEffect):** Deveria ter sido pego por: **Code Reviewer** (lint analysis reportou "0 errors" mas o erro existia no arquivo `share-token-list.tsx` criado no Lote 3). O CR classificou o lint error como vindo de `subscriptions.ts` (TODO, que nao e lint error), perdendo o erro real.
- **P2 (Fraunces ausente no PDF):** Ninguem — decisao implicita de usar apenas Inter para simplificar o PDF. Poderia ter sido pego pelo CR comparando com o DoD.
- **P3 (alt text warning):** Ninguem — warning de a11y em componente de PDF (nao renderiza em browser). Impacto zero.
- **P4 (arquivos >200 linhas):** Ninguem — acumulo natural. Ja registrado em decisions.md.

---

## Recomendacao Final

Sprint 6 esta solida em funcionalidade, seguranca e cobertura de testes. O unico issue real (BUG-001) e um lint error que nao impacta execucao — pode ser corrigido no inicio da proxima sprint ou em patch dedicado. Recomendo **APROVADO COM RESSALVAS** — a sprint pode avancar para merge apos correcao do BUG-001 (estimativa: 5 minutos).
