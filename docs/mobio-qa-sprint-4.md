# QA Report: Sprint 4 — Atelier Fabrica — Comercio

## Status: APROVADO

---

## Resumo Executivo

Sprint 4 implementa a camada comercial do atelier: convites fabrica-lojista (`factory_invitations`), autorizacao de retailers (`authorized_retailers`), configuracoes comerciais (`factory_settings`), enderecos de entrega (`retailer_addresses`), conversas/mensagens (`conversations`/`messages`), numeracao de pedidos (`order_number` MOB-YYYY-NNNNN) e seed de planos. Todos os 20 itens do checklist DoD passaram. As correcoes W-01, W-02 e W-03 do Code Review foram aplicadas corretamente. Nenhum bug encontrado.

---

## Veredicto: APROVADO

20/20 itens DoD passaram. Sem blockers, sem bugs. Commit liberado.

---

## Checklist DoD — 20 Itens

### 1. npm run lint -> exit 0

**Resultado:** PASSOU

```
14 problems (0 errors, 14 warnings)
```

Warnings nao-bloqueantes: 12x React Compiler incompatible-library (react-hook-form `watch`/`register`), 1x `@typescript-eslint/no-unused-vars` em test, 1x react-hooks/incompatible-library. Zero erros.

### 2. npx tsc --noEmit -> exit 0

**Resultado:** PASSOU

```
(sem output — zero erros TypeScript)
```

### 3. npm run build -> exit 0

**Resultado:** PASSOU — 29 rotas

```
Route (app)
├ ○ /design-system
├ ƒ /aceitar-convite-fabrica/[token]
├ ƒ /aceitar-convite/[token]
├ ƒ /atelier/catalogo
├ ƒ /atelier/conta/configuracoes
├ ƒ /atelier/conta/plano
├ ƒ /atelier/lojistas
├ ƒ /atelier/lojistas/[retailerId]
├ ƒ /atelier/lojistas/[retailerId]/quote
├ ƒ /atelier/pedidos
├ ƒ /atelier/pedidos/[orderId]
├ ƒ /lojista/conta
├ ƒ /lojista/conta/enderecos
└ ... (29 rotas total)
```

### 4. npm test -> 169/169 passa

**Resultado:** PASSOU

```
Test Files  16 passed (16)
     Tests  169 passed (169)
  Duration  1.92s
```

### 5. npx playwright test -> smoke OK

**Resultado:** PASSOU

```
1 passed (925ms)
[chromium] › e2e/smoke.spec.ts:3:5 › home page loads with MOBIO heading
```

### 6. supabase migration list -> 43 migrations

**Resultado:** PASSOU — 43 migrations (local = remote sincronizado)

```
20260507120000 ... 20260507160007 (43 total)
Sprint 4: 20260507160000-20260507160007 (8 migrations)
```

### 7. supabase functions -> 7 functions

**Resultado:** PASSOU — 7 functions no filesystem

```
accept-factory-invitation
accept-invite
bootstrap-mobio-admin
process-product-image
send-factory-invitation
signup-factory
signup-retailer
```

Nota: `supabase functions list` retornou 403 (permissao da conta), verificado via filesystem.

### 8. Tabelas novas S4 com RLS

**Resultado:** PASSOU — 6/6 tabelas com `rowsecurity: true`

```json
authorized_retailers  -> rowsecurity: true
conversations         -> rowsecurity: true
factory_invitations   -> rowsecurity: true
factory_settings      -> rowsecurity: true
messages              -> rowsecurity: true
retailer_addresses    -> rowsecurity: true
```

### 9. order_number sequence + trigger

**Resultado:** PASSOU — formato MOB-YYYY-NNNNN confirmado

```sql
CREATE OR REPLACE FUNCTION public.fn_generate_order_number()
  RETURNS trigger LANGUAGE plpgsql
  SECURITY DEFINER SET search_path TO 'public'
AS $function$
  IF NEW.order_number IS NULL THEN
    v_year := EXTRACT(YEAR FROM COALESCE(NEW.created_at, now()))::INT;
    v_seq := nextval('order_number_seq');
    NEW.order_number := 'MOB-' || v_year::TEXT || '-' || lpad(v_seq::TEXT, 5, '0');
  END IF;
$function$
```

Checklist: SECURITY DEFINER, search_path fixo, idempotente (`IF NULL`), sequence atomica.

### 10. Plans seed >= 5

**Resultado:** PASSOU — 5 planos

```
Atelier Free    | atelier | R$   0
Atelier Pro     | atelier | R$ 149
Atelier Business| atelier | R$ 299
Lojista Free    | lojista | R$   0
Lojista Plus    | lojista | R$  99
```

### 11. CHECK invites.role

**Resultado:** PASSOU — 3 constraints

```
invites_role_check: role IN ('atelier_owner','atelier_member','lojista_owner','lojista_buyer')
invites_status_check: status IN ('pending','accepted','expired','revoked')
chk_invite_tenant: factory xor retailer, role compativel com tenant type
```

### 12. Auditoria security (5 greps)

**Resultado:** PASSOU — todos 0 matches

| Grep                                               | Resultado |
| -------------------------------------------------- | --------- |
| `select("*")` em src/ + functions/                 | 0 matches |
| `auth.uid()` sem `(SELECT)` em migrations S4       | 0 matches |
| `USING(true)` em migrations S4                     | 0 matches |
| `console.log.*token\|password\|cnpj` em functions/ | 0 matches |
| `listUsers` em functions/                          | 0 matches |

### 13. Token nao vaza pro client

**Resultado:** PASSOU

`listFactoryInvitations` seleciona colunas explicitas:

```typescript
.select("id, retailer_email, retailer_name, status, expires_at, accepted_at, invited_by, created_at")
```

Campo `token` excluido da selecao. Correcao W-02 do CR aplicada.

### 14. Server Actions com Zod

**Resultado:** PASSOU — spot check 4 actions

| Action                           | Zod                                       |
| -------------------------------- | ----------------------------------------- |
| `factory-invitations.ts`         | `sendFactoryInvitationSchema.safeParse()` |
| `quotes.ts`                      | `createQuoteSchema.safeParse()`           |
| `retailer-addresses.ts` (create) | `retailerAddressSchema.safeParse()`       |
| `retailer-addresses.ts` (update) | `retailerAddressSchema.safeParse()`       |

### 15. requireFactoryAccess/requireRetailerAccess em mutations

**Resultado:** PASSOU — spot check

| Arquivo                  | Chamadas                   |
| ------------------------ | -------------------------- |
| `quotes.ts`              | 7x `requireFactoryAccess`  |
| `factory-invitations.ts` | 7x `requireFactoryAccess`  |
| `retailer-addresses.ts`  | 5x `requireRetailerAccess` |

### 16. Dev server smoke

**Resultado:** PASSOU — 10/10 rotas

| Rota                            | Esperado | Resultado |
| ------------------------------- | -------- | --------- |
| `/design-system`                | 200      | 200       |
| `/entrar`                       | 200      | 200       |
| `/aceitar-convite/test`         | 200      | 200       |
| `/aceitar-convite-fabrica/test` | 200      | 200       |
| `/atelier/lojistas`             | 307      | 307       |
| `/atelier/pedidos`              | 307      | 307       |
| `/atelier/conta/configuracoes`  | 307      | 307       |
| `/atelier/conta/plano`          | 307      | 307       |
| `/lojista/conta`                | 307      | 307       |
| `/lojista/conta/enderecos`      | 307      | 307       |

### 17. middleware.ts inclui /aceitar-convite-fabrica

**Resultado:** PASSOU

```typescript
const PUBLIC_PATHS = [
  ...
  "/aceitar-convite-fabrica",
  ...
];
```

### 18. Sidebar atelier: item 06 = Lojistas

**Resultado:** PASSOU

```typescript
{ number: "06", label: "Lojistas", href: "/atelier/lojistas", icon: Store },
```

### 19. Edge Functions com versao Deno fixa

**Resultado:** PASSOU

```
6 functions: npm:zod@3.24.4
_shared:    esm.sh/@supabase/supabase-js@2.49.4
```

### 20. Paginacao implementada

**Resultado:** PASSOU — 5 actions com `.range()`

```
quotes.ts:29        .range(page * pageSize, (page + 1) * pageSize - 1)
factory-invitations.ts:22  .range(0, 49)
factory-invitations.ts:38  .range(0, 49)
retailer-addresses.ts:22   .range(0, 49)
orders.ts:44        .range(page * pageSize, (page + 1) * pageSize - 1)
```

Correcao W-03 do CR aplicada. `listFactoryOrders` e `listFactoryQuotes` com paginacao parametrizada, demais com limit 50.

---

## Bugs Encontrados

Nenhum.

---

## Pendencias Documentadas

### Do Code Review (suggestions — pendencia tecnica, nao-bloqueantes)

| #    | Descricao                                                        | Arquivo                    |
| ---- | ---------------------------------------------------------------- | -------------------------- |
| S-02 | `revokeFactoryInvitation` sem filtro `tenantId` (RLS protege)    | factory-invitations.ts:219 |
| S-03 | `revokeAuthorization` aceita `factoryId` do client (RLS protege) | factory-invitations.ts:236 |
| S-04 | factory-settings-form.tsx > 200 linhas (411 loc)                 | factory-settings-form.tsx  |
| S-05 | factory-invitations.ts > 200 linhas (~310 loc)                   | factory-invitations.ts     |

Nota: S-01 (aria-label no Dialog.Close) e S-06 (valueAsNumber) foram corrigidos no fix do CR.

### Observacao menor

- `subscriptions.ts:41` usa `select("*, plan:plans(*)")` em `getActiveSubscription` — uso legitimo (busca 1 subscription com join), nao e o mesmo caso que o W-02.

---

## Atribuicao de Origem dos Problemas

Nenhum bug encontrado. Todos os 20 itens passaram.

Correcoes do Code Review (W-01, W-02, W-03, S-01, S-06) foram aplicadas corretamente pelo Stack Agent no fix.

**Atribuicao: todos os agentes anteriores entregaram corretamente.**

---

## Recomendacao Final

QA Sprint 4 APROVADO. Todos os 20 itens do checklist DoD passaram. As 5 correcoes do Code Review foram aplicadas. Build, testes, TypeScript e Playwright estao limpos. Commit liberado.
