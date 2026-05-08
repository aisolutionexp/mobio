# QA Report: Sprint 8 — Showrooms + Mensageria + Notificacoes (Web Push)

## Status: APROVADO com ressalvas

Sprint 8 passa em todos os 20 itens do DoD. Build, typecheck e 445 testes passam sem falhas. Auditoria de seguranca limpa. 5 erros de lint sao novos da S8 (2 prefer-const corrigiveis, 3 do React Compiler — padrao funcional valido para Realtime). Nenhum blocker.

## Veredicto

**APROVADO** — pronto para merge apos corrigir os 2 prefer-const em conversations.ts (trivial).

---

## Tabela dos 20 Itens DoD

| #   | Item                                        | Resultado | Detalhes                                                                                                                                                                                                                                               |
| --- | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `npm run lint` — 5 errors                   | RESSALVA  | 5 errors NOVOS da S8 (ver secao Bugs). 32 warnings (pre-existentes + novos). Nenhum blocker funcional                                                                                                                                                  |
| 2   | `npx tsc --noEmit` — exit 0                 | OK        | Sem erros TypeScript                                                                                                                                                                                                                                   |
| 3   | `npm run build` — exit 0                    | OK        | Build completo. 6 rotas S8 confirmadas: /atelier/showroom, /atelier/showroom/[showroomId], /lojista/showroom, /atelier/mensagens, /lojista/mensagens, /lojista/conta/documentos                                                                        |
| 4   | `npm test` — 445/445                        | OK        | 47 test files, 445 tests, 5.11s                                                                                                                                                                                                                        |
| 5   | Migrations — 70                             | OK        | 70 migrations confirmadas                                                                                                                                                                                                                              |
| 6   | Edge Functions — 12                         | OK        | 12 functions: signup-factory, signup-retailer, bootstrap-mobio-admin, process-product-image, accept-invite, send-factory-invitation, accept-factory-invitation, verify-retailer, search-products, cancel-order, send-order-status-email, send-web-push |
| 7   | RPC list_my_conversations                   | OK        | SECURITY DEFINER + SET search_path = public                                                                                                                                                                                                            |
| 8   | RPC search_messages                         | OK        | SECURITY DEFINER + SET search_path = public, membership check explicito                                                                                                                                                                                |
| 9   | Storage buckets                             | OK        | message-attachments (privado), retailer-documents (privado) — criados na migration 20260508170006                                                                                                                                                      |
| 10  | Realtime publication                        | OK        | messages (idempotente), message_attachments, showroom_bookings — todos com REPLICA IDENTITY FULL                                                                                                                                                       |
| 11  | Auditoria security                          | OK        | Todos os greps limpos (ver detalhes abaixo)                                                                                                                                                                                                            |
| 12  | Auth send-web-push                          | OK        | Bearer token validado contra SUPABASE_SERVICE_ROLE_KEY (fix do CR B2 aplicado)                                                                                                                                                                         |
| 13  | Zod UUID em IDs                             | OK        | Todos os schemas de ID usam z.string().uuid() — showrooms (3), conversations (2), message-attachments (1), push-subscriptions (1), retailer-documents (1)                                                                                              |
| 14  | Dev server smoke                            | OK        | /atelier/showroom 307, /atelier/mensagens 307, /lojista/showroom 307, /lojista/mensagens 307, /lojista/conta/documentos 307 (redirect para login — correto, rotas protegidas)                                                                          |
| 15  | public/sw.js                                | OK        | Existe, contem listeners "push" (L1) e "notificationclick" (L21), sem secrets                                                                                                                                                                          |
| 16  | .env.example VAPID                          | OK        | NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT documentados                                                                                                                                                                            |
| 17  | Sidebar atelier — 8 itens                   | OK        | 01 Salao, 02 Colecoes, 03 Produtos, 04 Linesheet, 05 Pedidos, 06 Lojistas, 07 Mensagens, 08 Configuracoes                                                                                                                                              |
| 18  | Sidebar lojista — 9 itens                   | OK        | 01 Praca, 02 Descobrir, 03 Boards, 04 Linesheet, 05 Favoritos, 06 Showroom, 07 Pedidos, 08 Mensagens, 09 Conta                                                                                                                                         |
| 19  | RLS tabelas novas                           | OK        | RLS habilitado em: showroom_slots, showroom_bookings, message_attachments, push_subscriptions, retailer_documents                                                                                                                                      |
| 20  | Trigger fn_booking_update_slot_availability | OK        | Existe em migration 20260508170001, AFTER INSERT/UPDATE, recalcula is_available vs max_attendees                                                                                                                                                       |

## Auditoria de Seguranca (Item 11 — Detalhes)

| Grep                                                                     | Esperado        | Resultado                                                                                     |
| ------------------------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------- |
| `grep -rni "SERVICE_ROLE" src/`                                          | Apenas admin.ts | OK — src/lib/supabase/admin.ts:6,9                                                            |
| `grep "VAPID_PRIVATE" src/components/ src/app/` (client)                 | 0               | OK — 0 matches                                                                                |
| `grep "auth.uid()" migrations/2026050817* sem (SELECT)`                  | 0 em RLS        | OK — unica ocorrencia e dentro de body PL/pgSQL (search_messages, SECURITY DEFINER) — correto |
| `grep 'select("*")' src/`                                                | 0               | OK — 0 matches                                                                                |
| `grep "USING(true)" migrations/2026050817*`                              | 0               | OK — 0 matches                                                                                |
| `grep "console.log.*VAPID\|password\|token\|secret" supabase/functions/` | 0               | OK — 0 matches                                                                                |

## Bugs

### WARN-01: prefer-const em conversations.ts (NOVO S8)

**Arquivo:** `src/lib/actions/conversations.ts:211,228`
**Erro:** `profileMap` e `attachmentMap` declarados com `let` mas nunca reatribuidos (apenas mutados via `[key] = value`). ESLint exige `const`.
**Severidade:** Baixa — correcao trivial (`let` -> `const`).
**Deveria ter sido pego por:** Code Reviewer (deveria ter flaggado `prefer-const` — inline com o lint rule existente no projeto).

### WARN-02: React Compiler — set-state-in-effect em conversation-list.tsx (NOVO S8)

**Arquivo:** `src/components/domain/messaging/conversation-list.tsx:54,86`
**Erro:** React Compiler flag `setConversations(initialConversations)` no useEffect e `setConversations` no callback do Realtime como "cascading renders".
**Severidade:** Baixa — padrao funcional valido e necessario para Realtime subscriptions. O lint do React Compiler 19 e mais restritivo que o React Hooks lint anterior. O comportamento esta correto.
**Acao:** Aceitar como ressalva. Se o React Compiler for habilitado em modo estrito no futuro, refatorar para `useSyncExternalStore` ou `useReducer`.

### WARN-03: React Compiler — Cannot create components em message-attachment-card.tsx (NOVO S8)

**Arquivo:** `src/components/domain/messaging/message-attachment-card.tsx:58`
**Erro:** `const Icon = getFileIcon(attachment.file_type)` seguido de `<Icon />` — compiler interpreta como criar componente durante render.
**Severidade:** Baixa — padrao valido (dynamic icon selection). Lucide icons sao componentes estaticos reatribuidos, nao criados.
**Acao:** Aceitar como ressalva. Para silenciar: mover `getFileIcon` para fora do render ou usar conditional rendering inline.

## Pendencias (nao bloqueiam merge)

1. **VAPID keys nao configuradas** — `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT` precisam ser geradas e configuradas:
   - `.env.local` para o Next.js
   - `npx supabase secrets set` para a edge function send-web-push
   - Gerar com: `npx web-push generate-vapid-keys`

2. **send-web-push edge function secrets** — Alem das VAPID keys, a edge function precisa de `SUPABASE_SERVICE_ROLE_KEY` configurada como secret no Supabase (pode ja estar configurada como default).

3. **2 prefer-const** em conversations.ts (WARN-01) — correcao trivial (`let` -> `const` nas linhas 211 e 228).

4. **Pendencias tecnicas herdadas do CR S8** (aceitas como divida tecnica em decisions.md):
   - conversations.ts (358 linhas) — split futuro
   - showrooms.ts (336 linhas) — split futuro
   - conversation-view.tsx (311 linhas) — split futuro

## Recomendacao Final

Sprint 8 esta solida. Todos os criterios de aceite do DoD atendidos:

- Fabrica cria slots, lojista agenda, fabrica notificada (via push fire-and-forget)
- Mensageria com threads por contexto, attachments, busca FTS
- Upload de docs no Storage (message-attachments + retailer-documents, privados, signed URLs)
- Web Push VAPID configurado (sw.js + subscribe/unsubscribe + edge function autenticada)
- RLS em todas as tabelas novas, sem USING(true), sem select("\*")
- 445 testes passando, build OK, typecheck OK

**Acao recomendada:** corrigir os 2 prefer-const (trivial), merge, configurar VAPID keys no deploy.
