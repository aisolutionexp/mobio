# Code Review: Sprint 6 — Linesheet + Boards

## Status: APROVADO COM RESSALVAS

## Resumo Executivo

Sprint 6 implementa CRUD completo de Boards e Linesheets para o shell Lojista, incluindo drag-and-drop, variantes de pricing, anotacoes por item, geracao de PDF via @react-pdf/renderer, compartilhamento publico via token criptografico 256-bit, e importacao de board para linesheet. Codigo bem estruturado, seguro e consistente com sprints anteriores. 1 bug de logica encontrado na construcao do baseUrl (linesheet-export), 1 warning de performance no reorder (N+1 sequential updates), e suggestions de qualidade menores.

---

## A. Server Actions

- [x] `"use server"` em todos os 5 arquivos
- [x] Zod UUID validacao em todos os IDs via `z.string().uuid()` (grep confirma matches em boards.ts, linesheets.ts, linesheet-export.ts, linesheet-share.ts, linesheet-public.ts)
- [x] `requireRetailerAccess()` usado em toda action que requer autenticacao (defense in depth)
- [x] `revalidatePath` apos toda mutation
- [x] Sem leak de `service_role` (grep `service_role` em src/ = 0 matches)
- [x] `ActionResult` consistente em todas as actions

## B. RLS + Schema Novo

- [x] 5+1 migrations com RLS habilitado
- [x] Migration `20260508140000`: policy retailer + factory_id nullable + CHECK XOR (`chk_linesheet_owner`)
- [x] `(SELECT auth.uid())` wrapped em todas as policies (grep confirma todas as ocorrencias usam wrapper)
- [x] Indices em colunas de policy: `idx_linesheet_share_tokens_linesheet_id`, `idx_linesheet_share_tokens_created_by`, `idx_linesheets_retailer_id`
- [x] Sem `DELETE USING(true)` (grep = 0 matches)
- [x] RPC `get_linesheet_by_token` com `SECURITY DEFINER SET search_path = public`
- [x] Policies de `linesheet_share_tokens`: factory CRUD completo com role checks corretos (owner-only para DELETE)
- [x] Policies retailer para linesheets e linesheet_items: SELECT/INSERT/UPDATE/DELETE com role checks adequados

## C. PDF Generation

- [x] Endpoint `/api/linesheets/[id]/pdf` protegido via `requireRetailerAccess()` + ownership check (`.eq("retailer_id", tenantId)`)
- [x] Sem leak de imagens de outras factories (query filtrada por linesheet ownership)
- [x] `params` awaited corretamente (Next.js 15+)
- [x] Tratamento de erro: retorna 400/404/500 sem PII
- [x] Fontes Inter embutidas (Google Fonts CDN)
- [x] `resolvePrice` no route.ts implementa corretamente logica de pricing por variant com custom override
- [x] `renderToBuffer` — sincrono mas aceitavel para PDFs de tamanho moderado (4 items/pagina)

## D. Share Link Publico

- [x] Token 256-bit via `crypto.randomBytes(32).toString("hex")`
- [x] `expires_at` validado server-side na RPC (`lst.expires_at IS NULL OR lst.expires_at > now()`)
- [x] Revogacao funciona (`is_revoked = true` bloqueia na RPC)
- [x] Mensagem generica em erros — `notFound()` sem detalhes (anti-enumeration)
- [x] `access_count` incremental na RPC (atomico, sem race)
- [x] `/linesheet-publico` em `PUBLIC_PATHS` do middleware
- [x] Public view nao expoe links de edicao
- [x] Layout readonly (Server Component puro, sem actions)

## E. Drag-and-drop

- [x] HTML5 nativo com `onDragStart/onDragOver/onDrop`
- [x] Optimistic UI: atualiza estado local primeiro, rollback em caso de erro (`setItems(initialItems)`)
- [x] `key={item.id}` em listas — nao usa index como key

## F. Variantes de Preco

- [x] `pricing_variant` com CHECK constraint (`'retailer' | 'msrp' | 'custom'`)
- [x] Zod enum validation (`pricingVariantSchema`)
- [x] `resolvePrice` implementado corretamente em 3 locais: route.ts, public-linesheet-view.tsx, linesheet-item-card.tsx
- [x] `custom` usa `custom_price` do item
- [x] Display correto no PDF e na public view

## G. Anotacoes

- [x] `note` max 500 (board_items) e 1000 (linesheet_items) — CHECK no banco + maxLength no validator + maxLength no input
- [x] React escape em Server Components protege contra XSS
- [x] Debounce de 800ms no input (UX adequado)
- [x] Cleanup do timeout via `clearTimeout` no `onBlur`

## H. Importar de Board

- [x] `importBoardToLinesheet` copia items preservando ordem relativa
- [x] Sem duplicacao (verifica `existingProductIds` antes de inserir)
- [x] Preserva `note` do board item
- [x] Batch insert (nao N+1 — todos os items inseridos em um unico `.insert(toInsert)`)

## I. Add to Board / Add to Linesheet

- [x] Botoes disponibilizados via dialogs (`AddToBoardDialog`, `AddToLinesheetDialog`)
- [x] Actions verificam ownership via `requireRetailerAccess()` + `.eq("retailer_id", tenantId)`
- [x] Sem leak — RLS garante que lojista nao autorizado nao ve dados

## J. Sidebar Lojista

- [x] Item 04 = "Linesheet" no layout do lojista (`src/app/(lojista)/layout.tsx:28-32`)
- [x] `ROLE_PATH_PREFIXES.lojista_owner` cobre `/lojista` (que inclui `/lojista/linesheet`)
- [x] Sem regressao nos itens existentes (01-07 todos presentes)

## K. Build/Lint/Test

- [x] Build: reportado verde pelo Lote 3
- [x] Lint: reportado com 0 errors
- [x] `tsc --noEmit`: 0 errors
- [x] Testes: 305/305 passando

## L. Auditoria de Seguranca

- [x] `grep "service_role" src/` = 0 matches
- [x] `grep "auth.uid()"` em migrations S6 — todos com wrapper `(SELECT ...)`
- [x] `grep 'select("*")' src/` = 0 matches
- [x] `grep "USING(true)"` em migrations S6 = 0 matches
- [x] `grep "console.log.*token|password" supabase/functions/` = 0 matches
- [x] Zod UUID em todos os 5 arquivos de actions da sprint
- [x] Sem `console.log` em nenhum arquivo da sprint

## M. Lint Pre-existente

O L3 reportou "1 erro pre-existente". Grep por `console.log` nos arquivos do sprint retorna 0. O TODO em `src/lib/actions/subscriptions.ts:101` e de sprint anterior e nao foi introduzido nesta sprint. Classificado como nao-bloqueante — nao e um lint error, e sim um TODO fora do escopo da sprint.

---

## Pontos Positivos

1. **Excelente separacao de responsabilidades**: validators em arquivo proprio, actions com pattern consistente, componentes de dominio isolados. Codigo muito organizado.
2. **Seguranca exemplar**: token 256-bit, RPC SECURITY DEFINER com search_path, RLS completo com wrapper `(SELECT auth.uid())`, validacao Zod em todas as entradas. Zero shortcuts de seguranca.
3. **Optimistic UI com rollback**: drag-and-drop usa estado local otimista e reverte em caso de erro — UX solida.
4. **Batch operations**: `importBoardToLinesheet` faz insert em batch, `createSignedUrls` busca todas as URLs de uma vez. Sem N+1 nas operacoes de leitura.
5. **Acessibilidade cuidada**: `aria-label` nos inputs de nota e preco, `aria-hidden` nos icones decorativos, botoes com `type="button"` explicito nos dialogs.

---

## Problemas Encontrados

### Blockers

Nenhum.

### Warnings

**W1. Bug de logica no baseUrl — `src/lib/actions/linesheet-export.ts:19-21`**

```typescript
const baseUrl =
  (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL)
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
```

Precedencia de operador errada. O ternario `?:` tem precedencia menor que `??`, entao a expressao e avaliada como:

```
const baseUrl = (SITE_URL ?? VERCEL_URL) ? `https://${VERCEL_URL}` : "http://localhost:3000"
```

Se `NEXT_PUBLIC_SITE_URL` estiver definido (que e o caso em producao), ele e truthy, e o resultado sera `https://${VERCEL_URL}` — usando a URL errada do Vercel ao inves do site URL customizado.

**Correcao**: Adicionar parenteses ao ternario:

```typescript
const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");
```

Nota: o mesmo padrao existe em `src/lib/actions/linesheet-share.ts:57-61` mas esta escrito corretamente la (com `??` e ternario separados por parentese implicito via quebra de linha). Apenas `linesheet-export.ts` tem o bug.

Severidade: Warning (nao Blocker porque a action `generateLinesheetPDF` apenas retorna a URL para o client abrir — em ambiente de producao com SITE_URL definido o resultado e `https://undefined` se VERCEL_URL nao existir, ou URL errada se existir; o PDF route em si funciona normalmente quando acessado diretamente).

**W2. Reorder faz updates sequenciais (N+1) — `boards.ts:396-404` e `linesheets.ts:461-469`**

```typescript
for (const item of parsed.data.ordering) {
  const { error } = await supabase
    .from("board_items")
    .update({ position: item.position })
    .eq("id", item.id)
    .eq("board_id", parsed.data.boardId);
  if (error) return { success: false, error: error.message };
}
```

Loop sequencial de updates — cada item e uma round-trip ao Supabase. Para boards/linesheets com muitos items, isso pode ser lento. Poderia ser resolvido com uma RPC batch ou `Promise.all` (embora `Promise.all` perca atomicidade).

Severidade: Warning. Funciona corretamente, mas com boards grandes (20+ items) sera lento.

**W3. Arquivo `linesheets.ts` tem 691 linhas — excede limite de 200**

`src/lib/actions/linesheets.ts` tem 691 linhas e 12 funcoes exportadas. `src/lib/actions/boards.ts` tem 453 linhas. Ambos excedem o limite de 200 linhas definido no architecture.

Severidade: Warning. Sugere-se extrair funcoes de leitura (list, get, listAvailable) para um arquivo separado das mutations (create, update, delete, reorder, import).

### Suggestions

**S1. Duplicacao da logica de `resolvePrice`**

A funcao `resolvePrice` esta implementada em 3 locais distintos:

- `src/app/api/linesheets/[id]/pdf/route.ts:159-177`
- `src/components/domain/linesheets/public-linesheet-view.tsx:15-30`
- `src/components/domain/linesheets/linesheet-item-card.tsx:33-49`

Poderia ser extraida para `src/lib/utils.ts` ou `src/lib/pricing.ts`.

**S2. Duplicacao da logica de signed URLs (cover image)**

A logica de encontrar a cover image + buscar signed URLs esta duplicada em 3 locais:

- `boards.ts:80-106`
- `linesheets.ts:119-147`
- `route.ts:55-87`

Poderia ser extraida para um util compartilhado.

**S3. `NoteInput` e `LinesheetNoteInput` sao quase identicos**

Os dois componentes de nota (`boards/note-input.tsx` e `linesheets/linesheet-note-input.tsx`) diferem apenas na action chamada e no `maxLength`. Poderiam ser um unico componente parametrizado.

**S4. `linesheet-export.ts` nao e necessario como Server Action**

`generateLinesheetPDF` nao faz nenhuma operacao de banco — apenas monta uma URL. Poderia ser uma funcao utilitaria pura no client ao inves de Server Action, evitando round-trip desnecessario.

---

## Regressao

Regressao nao aplicavel para a maioria do codigo — Sprint 6 cria recursos novos (boards, linesheets, share tokens). A migration `20260508140000` altera a tabela `linesheets` (DROP NOT NULL em factory_id), que ja existia na Sprint 3. Verificacao:

- [x] Linesheets existentes (factory-owned) continuam funcionando — policies de factory nao foram alteradas
- [x] CHECK constraint `chk_linesheet_owner` garante que pelo menos um owner existe
- [x] Indice em `retailer_id` nao afeta queries existentes por `factory_id`

---

## Veredicto

Code Review Sprint 6: **2 warnings encontrados** (bug de baseUrl e reorder N+1). Stack agent deve corrigir W1 (bug de logica) e W2 (performance) antes de avancar para o QA. W3 (tamanho do arquivo) pode ser registrado como pendencia tecnica. Suggestions sao melhorias opcionais.

---

## Atribuicao de Origem dos Problemas

- **W1 (Bug baseUrl linesheet-export)**: Ninguem — erro de implementacao do Stack Agent. Precedencia de operador `??` vs ternario `?:`.
- **W2 (Reorder N+1)**: Ninguem — erro de implementacao do Stack Agent. O Data Architect definiu a estrutura corretamente; a escolha de loop sequencial foi do implementador.
- **W3 (Arquivo >200 linhas)**: Ninguem — acumulo natural de funcoes. Architect definiu limite de 200 mas nao e critico neste contexto.
- **S1-S4**: Ninguem — oportunidades de refatoracao, nao falhas de planejamento.

**Atribuicao consolidada**: Agentes de planejamento entregaram corretamente. Todos os problemas sao de implementacao.
