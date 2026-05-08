# Code Review: Sprint 7 — Quotes + Pedidos Cross-Pontas

## Status: ⚠️ Aprovado com ressalvas

## Objetivo do Sprint

Chat em cotações (quote_messages), timeline de status em pedidos (order_status_history), payment tracking (schedules + records), cancelamento com policy por fábrica, notificações com Realtime, Edge Functions para cancelamento e notificação de status.

## Critério de Saída

- [x] Migrations aplicadas (6 novas) com RLS + índices
- [x] Server Actions com `'use server'` + Zod + require\*Access
- [x] Edge Functions com auth JWT + Zod + mensagens genéricas
- [x] Realtime com cleanup em useEffect
- [x] Chat quote_messages funcional (factory + retailer)
- [x] State machine de status validada server-side
- [x] Payment tracking (schedule + records) factory-only write
- [ ] Realtime de notificações — **notifications não está na publication supabase_realtime**
- [x] Build + lint + tsc + tests green (370/370)

## Pontos Positivos

- RLS muito bem implementado: todas as 4 tabelas novas com policies granulares e `(SELECT auth.uid())` wrapper consistente
- `accept_quote` como RPC atômica com `FOR UPDATE` é uma decisão arquitetural sólida — elimina race condition na transição quote→order
- `fn_log_order_status_change` como BEFORE UPDATE trigger garante que nenhuma transição escapa do histórico, inclusive em RPCs SECURITY DEFINER
- `fn_can_cancel_order` com janela configurável por fábrica (`factory_settings.cancellation_policy_hours`) é elegante e extensível
- Edge Function `cancel-order` idempotente (retorna 200 se já cancelado) — padrão correto
- Chat Realtime com de-duplicação por ID (`prev.some(m => m.id === msg.id)`) e cleanup correto
- `useOrderRealtime` com `removeChannel` + `clearTimeout` no cleanup — zero memory leaks
- Separação factory/retailer wrapper para QuoteChat é boa composição
- Todos os validators Zod com mensagens em pt-BR
- Zero `select('*')`, zero `service_role` no src, zero `USING(true)`, zero `console.log` com dados sensíveis

## Compliance (código segue os docs?)

### Design & UI

- [x] Tokens shadcn/ui respeitados (bg-muted, text-destructive, border-border, etc.)
- [x] Mobile-first com grid responsive (grid-cols-1 sm:grid-cols-2 lg:grid-cols-2)
- [x] Estados vazios tratados (timeline, chat, payment schedules, notifications)
- [x] Acessibilidade: breadcrumbs com `aria-label`, icons com `aria-hidden`, `sr-only` no botão Send do chat
- [x] Textos da UI em pt-BR
- [x] Double submit prevenido: `loading`/`pending` state em CancelOrderButton, RecordPaymentDialog, CreatePaymentScheduleForm

### Arquitetura

- [x] Estrutura de pastas conforme Architect: actions/, validators/, hooks/, components/domain/
- [x] Server Actions com `'use server'` e validação Zod
- [x] Lógica de negócio em actions/services, não nos componentes
- [x] `"use client"` apenas onde necessário (componentes com hooks/interatividade)
- [x] `params` awaited corretamente (Next.js 15+ pattern) em todas as pages

### Banco de Dados

- [x] RLS habilitado em todas as 4 tabelas novas (na mesma migration)
- [x] `(SELECT auth.uid())` wrapper em todas as policies
- [x] Índices nas colunas usadas em policies/queries (quote_id, order_id, sender_user_id, etc.)
- [x] SECURITY DEFINER com SET search_path = public em todas as functions
- [x] Nomenclatura snake_case consistente
- [x] TEXT + CHECK para enums (payment_method, status)
- [x] Triggers atômicos na mesma migration

## Qualidade de Código

### Code Smells

- [x] Sem duplicação significativa em actions (cada action tem responsabilidade distinta)
- [ ] `formatCurrency` e `formatDate` duplicadas em 4+ pages — candidatas a utils

### Nomes e Legibilidade

- [x] Nomes auto-explicativos em ações, hooks e componentes
- [x] Consistência nos nomes: `list*`, `get*`, `mark*`, `record*`, `create*`

### Complexidade

- [x] Funções dentro do limite de 20 linhas de lógica (com exceção de pages que são composição)
- [x] Máximo 2 níveis de indentação nos componentes
- [ ] `quotes.ts` com 352 linhas (limite 200) — piora dívida da S6
- [ ] `quotes-retailer.ts` com 306 linhas (limite 200) — novo breach

### Performance

- [x] Sem queries N+1
- [x] Paginação com pageSize=50 em todas as listagens
- [x] Column selection precisa em todas as queries
- [x] `.single()` usado em queries de registro único
- [x] `.maybeSingle()` usado quando o registro pode não existir

### React Patterns

- [x] useEffect com cleanup em todos os Realtime channels
- [x] Nenhuma mutação direta de estado
- [x] De-duplicação em setMessages/setHistory/setItems
- [x] `useCallback` para handlers passados como props (wrappers)
- [x] Keys corretas em listas (item.id, msg.id, n.id, record.id)
- [x] `timerRef` para timeout cleanup em useOrderRealtime

### Acoplamento

- [x] Componentes não acessam Supabase diretamente (passam por actions)
- [x] QuoteChat genérico recebe `onSendMessage`/`onMarkAsRead` via props — factory e retailer wrappers injetam a action correta

## Segurança

- [x] RLS em todas as tabelas
- [x] Secrets não expostos no client (zero `service_role` em src/)
- [x] Validação server-side com Zod em todos os actions (exceto 3 funções — ver Warnings)
- [x] `getUser()` para verificação (não `getSession()`)
- [x] Edge Functions validam JWT via `supabase.auth.getUser(jwt)`
- [x] Mensagens genéricas de erro nas Edge Functions (`internal_error`, `unauthorized`)
- [x] `cancel-order` verifica membership do retailer antes de cancelar
- [x] RBAC: `requireFactoryAccess()`/`requireRetailerAccess()` em todas as actions
- [x] `fn_can_cancel_order` via RPC server-side (não client-side bypass)
- [ ] `markQuoteMessagesAsRead` factory-side não valida quoteId com Zod — ver Warnings

## Regressão

- Sprint 7 alterou/estendeu: `orders` (REPLICA IDENTITY), `quotes.ts` (novas funções de chat)
- [x] Actions de quotes existentes (create, list, update status) continuam íntegras
- [x] Pages de quotes existentes continuam funcionais
- [x] Orders de sprints anteriores não foram alterados em lógica

## Resumo de Problemas

### 🔴 Blockers (deve corrigir)

1. **Notifications Realtime não funciona** — `notification-list.tsx:56-81` subscreve ao canal `postgres_changes` da tabela `notifications`, mas a tabela **não** foi adicionada à publication `supabase_realtime` (nenhuma migration faz `ALTER PUBLICATION supabase_realtime ADD TABLE notifications`). Resultado: o INSERT Realtime silenciosamente não entrega eventos. Correção: criar migration adicionando `ALTER TABLE notifications REPLICA IDENTITY FULL; ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`

### 🟡 Warnings (deveria corrigir)

1. **Zod validation missing** — `markQuoteMessagesAsRead` em `src/lib/actions/quotes.ts:289` (factory-side) recebe `quoteId: string` mas **não valida com Zod UUID** antes de usar na query `.eq("quote_id", quoteId)`. O lado retailer (`quotes-retailer.ts:148`) valida corretamente com `quoteIdSchema`. Correção: adicionar `const parsed = quoteIdSchema.safeParse(quoteId)` no início
2. **Zod validation missing** — `getFactoryOrder` (`src/lib/actions/orders.ts:58`) e `updateOrderStatus` (`src/lib/actions/orders.ts:75`) recebem `orderId: string` sem validação Zod UUID. O lado retailer (`orders-retailer.ts:44-46`) valida com `orderIdSchema`. Correção: importar e aplicar `orderIdSchema` (já existe em `validators/orders-retailer.ts` ou criar um `validators/orders.ts`)
3. **Arquivo excede 200 linhas** — `src/lib/actions/quotes.ts` com 352 linhas. Piora a dívida técnica registrada em `docs/decisions.md` (S6). Recomendação: split em `quotes-crud.ts` + `quotes-chat.ts`
4. **Arquivo excede 200 linhas** — `src/lib/actions/quotes-retailer.ts` com 306 linhas. Recomendação: split em `quotes-retailer-crud.ts` + `quotes-retailer-chat.ts`

### 🟢 Suggestions (poderia melhorar)

1. **Duplicação de utils** — `formatCurrency` e `formatDate` aparecem idênticas em 4+ pages (`atelier/pedidos/[orderId]`, `lojista/pedidos/[orderId]`, `lojista/pedidos/quotes/[quoteId]`, `atelier/.../quotes/[quoteId]`). Extrair para `src/lib/format.ts`
2. **STATUS_LABELS inconsistente** — `send-order-status-email/index.ts:8` usa `processing: "Em produção"` enquanto `order-status-timeline.tsx:19` e `order-status-select.tsx:12` usam `processing: "Processando"`. Harmonizar para um label único
3. **createPaymentSchedule role check vs RLS** — O server action (`payments.ts:54`) restringe a `atelier_owner`/`admin`, mas o RLS permite `atelier_member` também. O server action é mais restritivo (seguro), mas cria uma inconsistência silenciosa. Se a intenção é que members possam criar, ajustar o action; se não, manter como está e documentar

## Veredicto

Code Review Sprint 7 encontrou **1 blocker** e **4 warnings**. O blocker (notifications não no Realtime) impede funcionalidade core da sprint. O stack agent deve corrigir antes de avançar para QA.

### Correções necessárias:

1. [Blocker] Criar migration para adicionar `notifications` ao `supabase_realtime`
2. [Warning] Adicionar Zod UUID validation em `markQuoteMessagesAsRead` factory-side
3. [Warning] Adicionar Zod UUID validation em `getFactoryOrder` e `updateOrderStatus`
4. [Warning] Split `quotes.ts` (352 linhas) — pode ser feito como pendência técnica se preferir
5. [Warning] Split `quotes-retailer.ts` (306 linhas) — pode ser feito como pendência técnica se preferir
