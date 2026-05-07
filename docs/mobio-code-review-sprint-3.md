# Code Review: Sprint 3 — Atelier Fabrica — Catalogo

## Status: Aprovado com ressalvas

## Resumo Executivo

Sprint 3 entrega CRUD completo de catalogo (colecoes, produtos, fotos, acabamentos, especificacoes), workflow de publicacao (draft/published/archived), gestao de equipe com convites, Edge Functions (process-product-image placeholder e accept-invite), 16 migrations com RLS + indices, e 4 storage buckets com policies path-based. Build, lint, typecheck e 98 testes passam. Qualidade geral do codigo e alta — server actions consistentes com ActionResult, validacao Zod antes de side-effects, requireFactoryAccess como defense-in-depth, e boa separacao Server/Client Components.

## Veredicto: APROVADO COM RESSALVAS

2 blockers e 5 warnings devem ser corrigidos antes de avancar para o QA.

---

## Pontos Positivos

- Excelente consistencia de pattern nos Server Actions: todos seguem `"use server"` + Zod parse + requireFactoryAccess + operacao + revalidatePath + ActionResult<T>. Nenhuma excecao no codebase inteiro.
- RLS com wrapper `(SELECT auth.uid())` em 100% das policies — conforme regra do CLAUDE.md.
- Storage policies path-based com `storage.foldername()` bem implementadas — 4 buckets, 16 policies cobrindo SELECT/INSERT/UPDATE/DELETE com granularidade correta (owner vs member vs authenticated).
- Trigger `fn_set_published_at` com SECURITY DEFINER + `SET search_path = public` — padrao correto.
- Trigger `fn_copy_quote_items_to_order` com SECURITY DEFINER — necessario e bem justificado.
- Signed URLs com TTL de 3600s (1h) para product-photos — adequado para MVP.
- accept-invite Edge Function com verificacao de expiracao, validacao de email match, idempotencia (re-aceite nao quebra, reativa membro inativo).
- Testes meaningful: permissions.test.ts cobre multi-tenant, active-tenant.test.ts cobre todos os edge cases de auth, validators cobrem limites e coercao.
- UI com estados vazios tratados, loading states, confirmacao via dialog antes de acoes destrutivas.
- Finishes por factory (sem product_id) — decisao correta para MVP, UX clara com label "Acabamentos da fabrica".

---

## A. Server Actions

- [x] `"use server"` presente em todos: collections.ts, products.ts, product-images.ts, finishes.ts, product-specs.ts, team.ts
- [x] Validacao Zod ANTES de side-effects em todos os actions que recebem input
- [x] requireFactoryAccess chamado apos auth e antes de mutacao
- [x] revalidatePath apos sucesso
- [x] Sem leak de service_role — grep confirma zero ocorrencias no src/
- [x] Erros tratados sem expor detalhes internos (mensagem generica no catch)
- [x] ActionResult<T> consistente

## B. RLS + Storage Policies

- [x] RLS habilitado em 100% das tabelas novas (16 migrations)
- [x] `(SELECT auth.uid())` wrapped em todas as policies — grep confirmado
- [x] Storage buckets com policies path-based usando `storage.foldername()`
- [x] Signed URLs com TTL 1h
- [x] Sem DELETE USING(true) em nenhuma tabela com dados de usuario

## C. Workflow de Publicacao

- [x] publishCollection bloqueia sem produtos publicados (validacao no server action, linhas 112-122 de collections.ts)
- [x] publishProduct auto-seta cover se nao houver (linhas 137-155 de products.ts)
- [x] archive nao apaga (status='archived')
- [x] Transicao confirmada via dialog (status-actions.tsx)

## D. Upload de Fotos

- [x] Validacao de tipo (image/jpeg|png|webp) e size (max 10MB) — product-images.ts:10-11, 27-36
- [x] Path correto: factory_id/product_id/uuid-filename — product-images.ts:50-51
- [x] product_image insert com position incremental (maxOrderRow + 1)
- [x] Reordenacao via setas — funcional

**Warning:** Reordenacao usa loop N+1 (ver item W-1 abaixo).

## E. Edge Functions

- [x] process-product-image: MVP placeholder validado, retorna acknowledged
- [x] accept-invite: token validado, expires_at, status pending
- [x] \_shared/ reutilizado (cors.ts, supabase.ts)
- [x] service_role apenas server-side (createAdminClient)

**Blocker:** accept-invite usa `listUsers()` sem filtro (ver item B-1 abaixo).

## F. Gestao de Equipe

- [x] inviteMember apenas atelier_owner (verificacao explicita no server action)
- [x] Token criptografico (randomUUID concatenado — 64 chars hex)
- [x] Convite com expires_at (7 dias)
- [x] accept-invite associa team_member
- [x] Re-aceite idempotente (reativa membro inativo)

**Blocker:** Mismatch role entre Zod validator e schema SQL (ver item B-2 abaixo).

## G. Acessibilidade

- [x] StatusFilter com role=tablist e aria-selected
- [x] Forms com labels associados via TextInput component
- [x] Dialog com Backdrop e dismiss via Close

**Warning:** Icon-only buttons e Menu.Triggers sem aria-label (ver item W-2 abaixo).

## H. Server vs Client

- [x] Pages (catalogo/page, collectionId/page, productId/page, equipe/page, aceitar-convite/page) sao Server Components
- [x] Client apenas para forms, drawers, dropdowns interativos (todos com "use client")
- [x] Sem fetch redundante em layouts
- [x] Promise-based params/searchParams (Next.js 15+/16 breaking change) — corretamente awaited

## I. Testes

- [x] 98 testes passando (de 4 anteriores)
- [x] Coverage meaningful: permissions (multi-tenant, admin, owner vs member), active-tenant (auth, role validation), validators (catalog 6 suites, team 2 suites, auth)
- [x] Mocks de Supabase realistas (createClient mockado com auth.getUser)
- [x] Sem testes flaky detectados
- [x] Component test (create-collection-drawer) verifica atributos ARIA

## J. Build/Lint/Test

- [x] npm run build verde
- [x] npm run lint 0 errors
- [x] npx tsc --noEmit 0 errors
- [x] npm test 98/98 passa

## K. Decisoes Pragmaticas (MVP)

- [x] Edge function process-product-image como placeholder — **pendencia futura registrada**
- [x] Finishes por factory (sem product_id) — UX clara
- [x] Email: invite retorna URL para copiar (sem envio automatico) — **pendencia futura**
- [x] Reordenacao com setas — UX aceitavel para MVP

## L. Convites e Schema

**Blocker:** Mismatch detectado (ver item B-2 abaixo).

---

## Blockers (deve corrigir)

### B-1. accept-invite: `listUsers()` carrega toda base de usuarios

**Arquivo:** `supabase/functions/accept-invite/index.ts:107`

**Problema:** Quando `createUser` falha com "already been registered", o codigo chama `supabase.auth.admin.listUsers()` sem filtro, carregando TODOS os usuarios do sistema na memoria para depois filtrar com `.find()`. Em producao com milhares de usuarios, isso causa: (1) latencia alta, (2) uso excessivo de memoria na Edge Function, (3) risco de timeout.

**Recomendacao:** Substituir por busca filtrada. A API admin do Supabase aceita filtros:

```typescript
const {
  data: { users },
} = await supabase.auth.admin.listUsers({
  filter: `email.eq.${email}`,
  page: 1,
  perPage: 1,
});
```

Ou usar o GoTrue admin endpoint direto se disponivel.

**Severidade:** Blocker (performance + escalabilidade)

---

### B-2. Mismatch role entre Zod validator e schema SQL de invites

**Arquivo:** `src/lib/validators/team.ts:5-6` vs `supabase/migrations/20260507120014_invites.sql:9-11`

**Problema:** O validator Zod do `inviteMemberSchema` aceita `["atelier_owner", "atelier_member"]` como roles validos. Porem, o schema SQL da tabela `invites` tem CHECK constraint `role IN ('atelier_member', 'lojista_buyer')`. Se o owner tentar convidar alguem com role `atelier_owner`, o Zod aceita mas o INSERT no Postgres falha com violacao de constraint.

**Alem disso:** O `cancelInvite` server action (`src/lib/actions/team.ts:160`) atualiza status para `"cancelled"`, mas o schema SQL so permite `('pending', 'accepted', 'expired', 'revoked')`. O INSERT vai falhar com violacao de CHECK constraint.

**Recomendacao:** Alinhar as fontes:

1. Zod validator: limitar a `["atelier_member"]` para convites de factory (atelier_owner nao deveria ser convidavel, apenas o owner original).
2. Se a intencao for permitir convidar owners, alterar o CHECK no SQL para incluir `atelier_owner`.
3. Alinhar `cancelInvite` com o status correto do schema: usar `"revoked"` em vez de `"cancelled"`.

**Severidade:** Blocker (integridade — CHECK constraint violation em producao)

---

## Warnings (deveria corrigir)

### W-1. Reordenacao de imagens/specs com loop N+1

**Arquivo:** `src/lib/actions/product-images.ts:120-126` e `src/lib/actions/product-specs.ts:194-199`

**Problema:** Ambos os `reorder` actions fazem um UPDATE individual por item num loop `for...of`. Para um produto com 10 imagens, sao 10 queries sequenciais. Isso nao e um problema critico no MVP (poucos itens por produto), mas e um smell de performance que piora com escala.

**Recomendacao:** Usar batch update via `unnest` ou uma unica RPC quando o volume crescer. Para MVP, aceitavel com nota.

**Severidade:** Warning

---

### W-2. Icon-only buttons e Menu.Triggers sem aria-label

**Arquivos:**

- `src/components/domain/catalog/status-actions.tsx:101-105` — Menu.Trigger com MoreVertical sem aria-label
- `src/components/domain/team/member-actions.tsx:56-58` — Menu.Trigger com MoreVertical sem aria-label
- `src/components/domain/team/invite-actions.tsx:38-40` — Menu.Trigger com MoreVertical sem aria-label
- `src/components/domain/catalog/product-finishes-tab.tsx:137-143` — button de remover com Trash2 sem aria-label (apenas `title`)
- `src/components/domain/catalog/product-specs-tab.tsx:216-248` — botoes ArrowUp/ArrowDown/Pencil/Trash2 sem aria-label

**Problema:** Screen readers nao conseguem identificar a funcao desses botoes. `title` nao substitui `aria-label` para acessibilidade.

**Recomendacao:** Adicionar `aria-label` descritivo em cada botao/trigger icon-only. Ex: `aria-label="Abrir menu de acoes"`, `aria-label="Remover acabamento"`.

**Severidade:** Warning (acessibilidade)

---

### W-3. `select("*")` em queries de listagem

**Arquivos:**

- `src/app/(atelier)/atelier/catalogo/[collectionId]/page.tsx:46` — collections `select("*")`
- `src/app/(atelier)/atelier/catalogo/[collectionId]/page.tsx:55` — products `select("*")`
- `src/app/(atelier)/atelier/catalogo/[collectionId]/[productId]/page.tsx:53` — products `select("*")`
- `supabase/functions/accept-invite/index.ts:45` — invites `select("*")`

**Problema:** Traz todas as colunas quando apenas algumas sao usadas. Em listagens, isso transfere dados desnecessarios.

**Recomendacao:** Substituir por column selection explicita. Ex: `select("id, name, description, status, slug, created_at, products(count)")`.

**Severidade:** Warning (performance)

---

### W-4. accept-invite expoe erro diferenciado para token invalido vs usado

**Arquivo:** `src/app/aceitar-convite/[token]/page.tsx:18-28` e `:33-48`

**Problema:** A pagina diferencia entre "Convite invalido" (token nao existe ou ja usado) e "Convite expirado" (token existe mas expirou). Isso permite enumeracao de tokens — um atacante pode distinguir tokens validos de invalidos. Para convites com token criptografico, o risco e baixo, mas e uma pratica de seguranca ruim.

**Recomendacao:** Usar mensagem generica unica: "Convite invalido ou expirado" para ambos os casos. A Edge Function accept-invite ja faz isso corretamente (mesma mensagem).

**Severidade:** Warning (seguranca — risco baixo por token criptografico, mas deveria seguir best practice)

---

### W-5. ProductStatusActions nao oferece unarchive

**Arquivo:** `src/components/domain/catalog/product-status-actions.tsx:19-24`

**Problema:** CollectionStatusActions passa `onUnarchive` para o StatusActions, permitindo restaurar colecao arquivada. Porem, ProductStatusActions nao passa `onUnarchive` — um produto arquivado fica preso nesse estado sem caminho de volta pela UI.

**Recomendacao:** Criar action `unarchiveProduct` em products.ts (similar ao existente `unarchiveCollection`) e passar como `onUnarchive` no ProductStatusActions.

**Severidade:** Warning (funcionalidade incompleta — assimetria entre collection e product)

---

## Suggestions (poderia melhorar)

### S-1. Token de convite usa randomUUID concatenado em vez de crypto.randomBytes

**Arquivo:** `src/lib/actions/team.ts:51`

**Problema:** O token e gerado com `randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "")` (64 chars hex). Funciona, mas o schema SQL ja define `DEFAULT encode(extensions.gen_random_bytes(32), 'hex')` que gera token criptograficamente forte. O server action sobrescreve esse default com um valor menos robusto (UUIDv4 e baseado em random, mas nao e o mesmo que randomBytes criptografico).

**Recomendacao:** Usar `crypto.randomBytes(32).toString('hex')` do Node.js para alinhar com a intencao do schema, ou omitir o campo `token` no INSERT e deixar o DEFAULT do banco gerar.

**Severidade:** Suggestion

---

### S-2. Tabs collection e product usam componentes separados quase identicos

**Arquivos:** `src/components/domain/catalog/collection-tabs.tsx` e `product-tabs.tsx`

**Problema potencial:** Se forem componentes muito similares (ambos renderizam tabs com Tabs/TabList/Tab/TabPanel), pode haver duplicacao. Verificar se abstrair um componente de tabs generico faria sentido.

**Severidade:** Suggestion (AHA — tolerar duplicacao por enquanto)

---

### S-3. Finishes tab nao tem paginacao

**Arquivo:** `src/lib/actions/finishes.ts:26-29`

**Problema:** `listFinishes` busca todos os acabamentos ativos sem limit. Em fabricas com dezenas de acabamentos, a lista cresce sem controle.

**Severidade:** Suggestion (MVP — volume baixo esperado)

---

### S-4. process-product-image nao valida auth

**Arquivo:** `supabase/functions/process-product-image/index.ts`

**Problema:** A Edge Function aceita qualquer POST com image_id valido. Nao verifica se o caller e autenticado ou se pertence a factory do produto. Como e MVP placeholder, o risco e baixo — mas ao implementar o processamento real, adicionar verificacao de auth.

**Severidade:** Suggestion (MVP placeholder — registrar para implementacao futura)

---

## Pendencias para decisions.md

1. **process-product-image** e placeholder MVP — implementar pipeline de variants (thumb/medium/large) em sprint futura.
2. **Email de convite** nao e enviado automaticamente — invite retorna URL para copiar. Implementar envio via Resend/Postmark em sprint futura.
3. **unarchiveProduct** — funcionalidade ausente na UI (colecao tem, produto nao).

---

## Recomendacao para QA

Apos correcao dos 2 blockers e 5 warnings:

- Testar fluxo completo de convite (criar, copiar link, aceitar) — verificar que `cancelled` nao quebra apos fix B-2.
- Testar publicacao de colecao com e sem produtos publicados.
- Testar upload de imagem em formatos invalidos e acima de 10MB.
- Testar reordenacao de imagens e specs.
- Testar acoes de status (publicar, arquivar, restaurar) com confirmacao.
- Verificar que produto arquivado pode ser restaurado apos fix W-5.

---

## Atribuicao de Origem dos Problemas

- **B-1 (listUsers sem filtro):** Ninguem — erro de implementacao do Stack Agent. A Edge Function deveria usar busca filtrada.
- **B-2 (mismatch role Zod vs SQL CHECK):** Deveria ter sido pego por: **Data Architect** (schema define CHECK constraint com `atelier_member`/`lojista_buyer` mas nao documenta que `atelier_owner` tambem deveria ser convidavel). Stack Agent tambem contribuiu ao criar Zod validator sem validar contra o CHECK do schema. `cancelInvite` com status `cancelled` vs `revoked` e erro de implementacao do Stack Agent.
- **W-1 (N+1 reorder):** Ninguem — erro de implementacao do Stack Agent. Aceitavel para MVP.
- **W-2 (aria-label):** Ninguem — erro de implementacao do Stack Agent.
- **W-3 (select \*):** Ninguem — erro de implementacao do Stack Agent.
- **W-4 (token enumeration):** Ninguem — erro de implementacao do Stack Agent.
- **W-5 (unarchiveProduct ausente):** Deveria ter sido pego por: **PO/Backlog** — se o workflow define draft/published/archived para produtos, a restauracao deveria estar nos criterios de aceite.
