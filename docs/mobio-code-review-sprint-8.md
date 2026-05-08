# Code Review: Sprint 8 — Showrooms + Mensageria + Notificacoes (Web Push)

## Status: ⚠️ Aprovado com ressalvas

## Objetivo do Sprint

Implementar Showrooms (slots + bookings), Mensageria (attachments + busca FTS + threads por contexto), Documentos do Lojista, Web Push (VAPID), Storage privado com signed URLs.

## Criterio de Saida

- [x] Factory CRUD showrooms + slots
- [x] Retailer agenda visitas (bookShowroomSlot atomico)
- [x] Mensageria com attachments, busca FTS, threads por contexto
- [x] Documentos do lojista (upload + signed URL)
- [x] Web Push (subscribe, service worker, edge function)
- [x] Storage privado (message-attachments, retailer-documents)
- [x] RLS em todas as tabelas novas
- [x] Build + lint + typecheck + 445 testes passando

## Tasks Validadas

| Task                                  | Status      | Observacao                                      |
| ------------------------------------- | ----------- | ----------------------------------------------- |
| Validators Zod showrooms              | ✅ OK       | UUID em todos IDs, refine em datas              |
| Server Actions showrooms.ts           | ✅ OK       | requireFactoryAccess, zod, ActionResult         |
| Server Actions showroom-bookings.ts   | ✅ OK       | requireRetailerAccess, atomicidade, notificacao |
| Server Actions conversations.ts       | ⚠️ Ressalva | N+1 em lastMessageMap, arquivo 358 linhas       |
| Server Actions message-attachments.ts | ✅ OK       | Validacao tipo + size, cleanup em falha         |
| Server Actions push-subscriptions.ts  | ✅ OK       | upsert com onConflict, zod                      |
| Server Actions retailer-documents.ts  | ✅ OK       | requireRetailerAccess, cleanup storage          |
| Componentes domain/showroom           | ✅ OK       | 10 componentes, estados vazios tratados         |
| Componentes domain/messaging          | ✅ OK       | Realtime cleanup, estados loading/vazio         |
| Componentes notifications/push        | ✅ OK       | SSR guard, permission states                    |
| Pages atelier/showroom                | ✅ OK       | Server Components, await params                 |
| Pages lojista/showroom                | ✅ OK       | —                                               |
| Pages mensagens (ambos)               | ✅ OK       | Suspense + skeleton                             |
| Page documentos lojista               | ✅ OK       | —                                               |
| Storage buckets + policies            | ✅ OK       | Path-based ACL                                  |
| Realtime publication                  | ✅ OK       | Idempotente para messages                       |
| FTS search_messages RPC               | ✅ OK       | SECURITY DEFINER + membership check             |
| Edge Function send-web-push           | ❌ Falha    | Sem auth do caller                              |
| Service Worker sw.js                  | ✅ OK       | Sem secrets, fallback correto                   |
| Testes S8                             | ✅ OK       | Validators + componentes + actions              |

## Criterios de Aceite das Stories

- [x] CA-1: Factory CRUD showrooms com slots — OK
- [x] CA-2: Retailer ve showrooms publicados/ativos e agenda visita — OK
- [x] CA-3: Booking atomico (verifica disponibilidade antes de inserir) — OK
- [x] CA-4: Mensageria com threads por contexto (quote, order, showroom_booking) — OK
- [x] CA-5: Anexos em mensagens com validacao tipo/tamanho — OK
- [x] CA-6: Busca FTS em mensagens — OK
- [x] CA-7: Documentos do lojista (upload, download signed URL, delete) — OK
- [x] CA-8: Web Push subscribe/unsubscribe funcional — OK
- [x] CA-9: Notificacoes push em booking novo — OK

## Pontos Positivos

- Excelente separacao de responsabilidades: validators em arquivos proprios, actions por dominio, componentes por feature
- RLS impecavel em todas as 9 migrations — todas usam `(SELECT auth.uid())`, indices em colunas referenciadas, SECURITY DEFINER com `SET search_path = public`
- `fn_booking_update_slot_availability` bem implementada: atomica, SECURITY DEFINER, recalcula count vs max_attendees
- `search_messages` RPC com verificacao explicita de membership antes de retornar resultados
- Realtime com cleanup adequado (`supabase.removeChannel`) em todos os useEffects
- Storage policies com path-based ACL usando `storage.foldername(name)` — correto
- Tratamento de erro 23505 (unique violation) em `bookShowroomSlot` com mensagem amigavel
- Fire-and-forget para push notifications que nao bloqueia a action principal

## Compliance (codigo segue os docs?)

### Design & UI

- [x] Textos em pt-BR
- [x] Estados vazios tratados em todas as listagens (showrooms, slots, bookings, mensagens, documentos)
- [x] Loading com Skeleton em mensagens e documentos
- [x] Botoes com `aria-label` ou `sr-only` (Send, Search, Attach)
- [x] Mobile-first com grid responsivo em messaging layout (`grid-cols-1 md:grid-cols-[360px_1fr]`)
- [x] `<button>` usado corretamente (conversation list items)

### Arquitetura

- [x] Estrutura de pastas conforme Architect (`actions/`, `validators/`, `components/domain/`, route groups)
- [x] Server Components nas pages, Client Components nos interativos
- [x] `await params` no ShowroomDetailPage (Next.js 15+ breaking change)
- [x] Metadata exportada nas pages de mensagens
- [x] `revalidatePath` apos mutations
- [x] Logica de negocio em actions, nao em componentes
- [x] Codigo em ingles

### Banco de Dados

- [x] RLS habilitado em todas as tabelas (5 tabelas novas)
- [x] `(SELECT auth.uid())` em todas as policies — grep confirma 0 ocorrencias sem wrapper
- [x] Nomenclatura snake_case, plural, ingles
- [x] Indices em colunas referenciadas em policies
- [x] Triggers `updated_at` em showroom_slots e showroom_bookings
- [x] TEXT + CHECK para enums (status, doc_type, message_type, context_type)
- [x] Partial unique indexes em conversations (context threading)
- [x] `USING(true)` — grep confirma 0 ocorrencias nas migrations S8
- [x] `select("*")` — grep confirma 0 ocorrencias em src/

## Qualidade de Codigo

### Code Smells

- [x] Sem duplicacao significativa
- [ ] 🔴 **N+1 em `listMyConversations`** (`conversations.ts:92-103`): loop `for (const convId of conversationIds)` faz 1 query por conversa para buscar ultima mensagem. Com 50 conversas = 50 queries extras. Substituir por uma unica query com window function ou RPC
- [ ] 🟡 `conversations.ts` com 358 linhas — excede limite de 200. Candidato a split: `conversations-crud.ts` + `conversations-messages.ts`
- [ ] 🟡 `showrooms.ts` com 336 linhas — excede limite de 200. Candidato a split: `showrooms-crud.ts` + `showrooms-slots.ts`
- [ ] 🟡 `conversation-view.tsx` com 311 linhas — excede limite de 200. Extrair `ConversationViewSkeleton` e logica de realtime para hook

### Nomes e Legibilidade

- [x] Nomes auto-explicativos (`bookShowroomSlot`, `markMessagesAsRead`, `notifyPushFireAndForget`)
- [x] Nomes de componentes descritivos (`BookSlotDialog`, `AttachmentPicker`, `RetailerBookingCard`)
- [x] Consistencia em nomenclatura (padrao `list*`, `get*`, `create*`, `update*`, `delete*`)

### Complexidade

- [x] Funcoes dentro do limite na maioria
- [ ] 🟡 `bookShowroomSlot` (showroom-bookings.ts:65-182) — 117 linhas, combina booking + notificacao factory + notificacao retailer. Extrair `notifyBookingCreated()` para service

### Performance

- [ ] 🔴 **N+1 em `listMyConversations`** — ja descrito acima. Impacto direto no tempo de carregamento da tela de mensagens
- [x] Paginacao em `listConversationMessages` (pageSize 50)
- [x] `Promise.allSettled` para envio de push (nao bloqueia se um falhar)
- [x] Indices GIN para FTS, parciais para slots disponiveis

### React Patterns

- [x] Realtime com cleanup em `useEffect` return (`supabase.removeChannel`)
- [x] Sem mutacao direta de estado (spread operator em `setMessages`, `setConversations`)
- [x] `useCallback` adequado em `handleAttachmentAdded`, `handleAttachmentRemoved`, `scrollToBottom`
- [x] `key={msg.id}` (nao index) em listas de mensagens
- [ ] 🟡 `conversation-list.tsx:114` — deps do useEffect usam `conversations.length` em vez do array. Se 2 arrays tiverem mesmo length mas itens diferentes, o effect nao re-executa. Considerar usar `JSON.stringify(convIds)` ou `useMemo` nos IDs
- [ ] 🟢 `conversation-view.tsx:318` — `key={i}` no skeleton (lista estatica, aceitavel)

### Acoplamento

- [x] Services nao dependem de React
- [x] Supabase acessado via actions, nao direto nos componentes (exceto Realtime no client — correto)
- [x] `push.ts` importa `createAdminClient` mas e server-only (sem `"use client"`)

## Seguranca

- [x] RLS habilitado em todas as tabelas
- [x] Validacao Zod em todas as actions (103 chamadas `.safeParse` no total)
- [x] `service_role` — grep em src/ retorna 0 matches (confinada em `admin.ts`)
- [x] `VAPID_PRIVATE_KEY` — aparece apenas em `src/lib/services/push.ts` (server-only) e na edge function
- [x] Service Worker `public/sw.js` sem secrets
- [x] `USING(true)` — 0 matches nas migrations S8
- [x] `console.log` com VAPID/token/password — 0 matches em supabase/functions
- [x] Double submit prevenido (button `disabled={sending}` nos forms)
- [x] RBAC: `requireFactoryAccess` / `requireRetailerAccess` em todas as actions
- [x] `markMessagesAsRead` filtra `.neq("sender_user_id", user.id)` — correto, apenas receiver
- [x] Signed URLs com expiracao 1h em ambos os buckets
- [x] Upload com validacao tipo + tamanho (25MB attachments, 10MB documentos)
- [ ] 🔴 **Edge Function `send-web-push` sem autenticacao**: nao valida JWT/auth do caller. Qualquer request POST com `user_id` pode disparar push notifications para qualquer usuario. Adicionar verificacao de auth header (Bearer token → `getUser()`) ou restringir a chamadas internas com service_role key
- [ ] 🟢 Sem validacao de schema de env vars (`src/env.ts` ou similar com `z.object({...}).parse(process.env)`)

### VAPID — Auditoria numerica

| Grep                                                             | Esperado           | Resultado                       |
| ---------------------------------------------------------------- | ------------------ | ------------------------------- |
| `grep "service_role" src/`                                       | 0                  | ✅ 0                            |
| `grep "VAPID_PRIVATE" src/` (client-side)                        | 0 fora server-only | ✅ Apenas push.ts (server-only) |
| `grep "auth.uid()" migrations/2026050817* sem (SELECT)`          | 0                  | ✅ 0 (todas com wrapper)        |
| `grep 'select("*")' src/`                                        | 0                  | ✅ 0                            |
| `grep "USING(true)" migrations/2026050817*`                      | 0                  | ✅ 0                            |
| `grep "console.log.*VAPID\|token\|password" supabase/functions/` | 0                  | ✅ 0                            |
| `.safeParse` total em actions                                    | >0                 | ✅ 103 chamadas                 |

## Regressao

- [x] Conversations — ALTER TABLE com constraint threading nao quebra conversations existentes (default NULL + partial unique)
- [x] Messages — coluna `body_tsv` GENERATED, nao afeta inserts existentes
- [x] Realtime — publication idempotente para messages (DO $$ block com IF NOT EXISTS)

## Resumo de Problemas

### 🔴 Blockers (deve corrigir)

1. **N+1 em `listMyConversations`** — `src/lib/actions/conversations.ts:92-103`: loop faz 1 query por conversa para buscar ultima mensagem. Com muitas conversas, degrada performance significativamente. Solucao: buscar com window function (`ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at DESC)`) ou RPC, ou ao menos fazer uma unica query com `.in('conversation_id', conversationIds).order('created_at', { ascending: false })` e pegar o primeiro de cada grupo no JS
2. **Edge Function `send-web-push` sem autenticacao** — `supabase/functions/send-web-push/index.ts`: nao valida identidade do caller. Qualquer request POST pode enviar push para qualquer `user_id`. Adicionar auth: ou validar Bearer token com `getUser()`, ou verificar que a chamada vem com service_role key (se for chamada interna apenas)

### 🟡 Warnings (deveria corrigir)

1. `conversations.ts` com 358 linhas — excede limite de 200. Split em `conversations-crud.ts` + `conversations-messages.ts`
2. `showrooms.ts` com 336 linhas — excede limite de 200. Split em `showrooms-crud.ts` + `showrooms-slots.ts`
3. `conversation-view.tsx` com 311 linhas — excede limite de 200. Extrair skeleton e/ou hook de realtime
4. `bookShowroomSlot` com 117 linhas — extrair logica de notificacao
5. `conversation-list.tsx:114` — deps do useEffect de realtime usam `conversations.length` que pode perder mudancas se length se mantiver igual

### 🟢 Suggestions (poderia melhorar)

1. Validacao de schema de env vars com zod (previne crash silencioso por env faltante em producao)
2. `listAvailableSlots` (`showroom-bookings.ts:32`) — `showroomId` nao passa por `showroomIdSchema.safeParse` (as demais actions validam)
3. Skeleton em `conversation-view.tsx` usa `key={i}` — aceitavel por ser lista estatica

## Veredicto

Code Review Sprint 8: **2 blockers + 5 warnings** encontrados. Stack agent deve corrigir os 2 blockers (N+1 em conversations + auth na edge function send-web-push) e os 5 warnings antes de avancar para QA.

Os 3 suggestions ficam como pendencia tecnica no `docs/mobio-status.md`.
