# Code Review: Sprint 4 — Atelier Fabrica — Comercio

## Status: APROVADO COM RESSALVAS

---

## Resumo Executivo

Sprint 4 implementa a camada comercial do atelier: authorized_retailers, factory_invitations, factory_settings, retailer_addresses, conversations/messages, order_numbering e plans_seed. O codigo e de alta qualidade geral — migrations atomicas, RLS rigoroso com wrapper `(SELECT auth.uid())`, Server Actions com defense-in-depth via `requireFactoryAccess`/`requireRetailerAccess`, validacao zod antes de side-effects, e UI com estados vazios, loading e confirmacao em acoes destrutivas.

3 warnings e 6 suggestions encontrados. Nenhum blocker.

---

## Veredicto: APROVADO COM RESSALVAS

Sem blockers. 3 warnings devem ser corrigidos antes de avancar para QA.

---

## Areas Auditadas

### A. Server Actions

| Criterio                                         | Status                                     |
| ------------------------------------------------ | ------------------------------------------ |
| `'use server'` presente                          | OK — todos os 6 arquivos                   |
| Zod ANTES de side-effects                        | OK                                         |
| `requireFactoryAccess` / `requireRetailerAccess` | OK — todas as mutations                    |
| `revalidatePath`                                 | OK — todas as mutations                    |
| Sem leak de service_role                         | OK — grep `service_role` em `src/` = 0     |
| `ActionResult<T>` consistente                    | OK                                         |
| Validacao de transicao em `updateOrderStatus`    | OK — `VALID_TRANSITIONS` impede retrocesso |

### B. Edge Functions

| Criterio                                  | Status                                              |
| ----------------------------------------- | --------------------------------------------------- |
| send-factory-invitation: auth via JWT     | OK — verifica `authorization` header                |
| accept-factory-invitation: token validado | OK — 256-bit hex, lookup por token + status pending |
| accept-factory-invitation: idempotente    | PARCIAL — ver W-01                                  |
| Mensagem generica em erros                | OK — todos retornam "Convite invalido ou expirado"  |
| service_role apenas server-side           | OK                                                  |
| Sem console.log de PII                    | OK — grep 0 matches                                 |
| Deps Deno com versao fixa                 | OK — `npm:zod@3.24.4`                               |
| `_shared` usado                           | OK — cors.ts + supabase.ts                          |

### C. RLS + Schema

| Criterio                                                                | Status                                     |
| ----------------------------------------------------------------------- | ------------------------------------------ |
| 8 migrations com RLS habilitado                                         | OK                                         |
| `(SELECT auth.uid())` wrapper                                           | OK — 100% das policies usam wrapper        |
| Sem `DELETE USING(true)`                                                | OK — grep 0 matches                        |
| factory_settings RLS multi-tenant                                       | OK — owner + authorized retailers via JOIN |
| retailer_addresses RLS                                                  | OK — retailer own + factory authorized     |
| factory_invitations: factory_owner ve as suas                           | OK                                         |
| authorized_retailers: ambos lados SELECT                                | OK                                         |
| conversations + messages: membros do par                                | OK                                         |
| order_number unique + sequence + trigger SECURITY DEFINER + search_path | OK                                         |

### D. Order Numbering MOB-YYYY-NNNNN

| Criterio                                     | Status                                                                |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Migration cria sequence + function + trigger | OK                                                                    |
| Trigger BEFORE INSERT                        | OK                                                                    |
| Idempotente: `IF NEW.order_number IS NULL`   | OK                                                                    |
| Concurrency: `nextval` atomico               | OK                                                                    |
| Year handling                                | OK — single global sequence, decisao documentada em data-architecture |

### E. Quotes + Orders

| Criterio                                        | Status                                 |
| ----------------------------------------------- | -------------------------------------- |
| createQuote com snapshot de preco               | OK — `unit_price_cents` no quote_items |
| updateOrderStatus valida transicoes             | OK                                     |
| listFactoryQuotes/Orders com colunas explicitas | OK — sem `select('*')`                 |
| Multi-tenant isolation                          | OK — filtro por tenantId               |

### F. Convites Factory

| Criterio                           | Status                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| Token criptografico                | OK — `randomUUID + randomBytes(32).toString('hex')` = 96 chars |
| expires_at + partial unique        | OK — 7 dias, 1 pendente/email/factory                          |
| accept idempotente                 | PARCIAL — ver W-01                                             |
| terms_snapshot opcional            | OK                                                             |
| Tela publica com mensagem generica | OK                                                             |

### G. Configuracoes Comerciais (factory_settings)

| Criterio                   | Status                                                               |
| -------------------------- | -------------------------------------------------------------------- |
| Apenas atelier_owner edita | OK — role check no Server Action + RLS                               |
| member visualiza readonly  | OK — `readOnly={!isOwner}` no form                                   |
| Zod compostos consistentes | OK — paymentTermsSchema, shippingPolicySchema, commercialTermsSchema |

### H. Enderecos Retailer

| Criterio                                  | Status                                      |
| ----------------------------------------- | ------------------------------------------- |
| CRUD com requireRetailerAccess            | OK                                          |
| setDefaultAddress: 1 default por retailer | OK — UPDATE batch `is_default=false` antes  |
| Validacao UF + CEP regex                  | OK — enum de 27 UFs, regex `^\d{5}-?\d{3}$` |

### I. Auth + RBAC

| Criterio                      | Status                                     |
| ----------------------------- | ------------------------------------------ |
| Defense in depth em mutations | OK — role check em Server Action + RLS     |
| Multi-tenant isolation        | OK — `tenantId` filtro em todas as queries |
| RLS reforca                   | OK                                         |

### J. Build/Lint/Test

Delegado ao QA — team-lead confirma build/lint/tsc/test no proximo passo.

### K. Auditoria de Seguranca (greps)

| Grep                                                               | Resultado              |
| ------------------------------------------------------------------ | ---------------------- |
| `grep "service_role" src/`                                         | 0 matches              |
| `grep "auth.uid()" supabase/migrations/2026050716* sem (SELECT)`   | 0 — todos usam wrapper |
| `grep 'select("*")' src/`                                          | 3 matches (ver W-02)   |
| `grep "USING(true)" supabase/migrations/2026050716*`               | 0 matches              |
| `grep "listUsers" supabase/functions/`                             | 0 matches              |
| `grep "console.log.*(token\|email\|password)" supabase/functions/` | 0 matches              |

### L. Acessibilidade

| Criterio                            | Status                                                   |
| ----------------------------------- | -------------------------------------------------------- |
| Forms com label associado           | OK — `TextInput` com label, `Field`/`FieldLabel` pattern |
| Botoes icon-only com aria-label     | PARCIAL — ver S-01                                       |
| Status badges com cor + texto       | OK — `OrderStatusBadge`, `QuoteStatusBadge` usam texto   |
| Confirm dialog em acoes destrutivas | OK — revogacao, delete, status change                    |

### M. UX/Convencoes

| Criterio                            | Status                                          |
| ----------------------------------- | ----------------------------------------------- |
| Toast em mutations                  | OK — todos usam sonner                          |
| Loading states (isSubmitting)       | OK — loading prop nos Button                    |
| Confirm dialog em acoes destrutivas | OK — estado `confirming` com Confirmar/Cancelar |
| Empty states em listas              | OK — icone + texto descritivo                   |
| Paginacao em listas longas          | NAO — ver W-03                                  |

---

## Pontos Positivos

1. **RLS exemplar** — todas as 8 migrations seguem o padrao do projeto: RLS habilitado, wrapper `(SELECT auth.uid())`, indices em colunas de policy, SECURITY DEFINER com search_path. Nenhum desvio.
2. **Defense in depth consistente** — toda mutation verifica role no Server Action E no RLS. Dupla camada de protecao sem excecao.
3. **Validacao zod robusta** — schemas compostos para factory_settings, validacao de UF com enum, CEP com regex, transicoes de status de pedido com mapa explicito.
4. **UX bem pensada** — estados vazios com icone + texto orientativo, confirmacao antes de revogar/deletar, toast em todas as mutations, loading states.
5. **Edge Functions seguras** — mensagens genericas em erros, token criptografico, deps com versao fixa, sem PII em logs.
6. **Decisoes bem documentadas** — sequence global vs per-year, factory_invitations vs invites, retailer_addresses vs addresses — todas no data-architecture.

---

## Problemas Encontrados

### Warnings (devem ser corrigidos)

#### W-01 — accept-factory-invitation: `select("factory_id")` sem campo `status`

**Arquivo:** `supabase/functions/accept-factory-invitation/index.ts:202-209`
**Descricao:** O select busca apenas `factory_id` mas o codigo na linha 209 faz cast para `{ status: string }` e compara `.status !== "active"`. Como `status` nao foi selecionado, sera sempre `undefined`, fazendo o UPDATE executar sempre — mesmo quando o registro ja esta ativo.
**Impacto:** UPDATE desnecessario em authorized_retailers ja ativos. Nao destrutivo mas semanticamente incorreto.
**Recomendacao:** Alterar select para `select("factory_id, status")` e remover o cast `as unknown`.

#### W-02 — `select("*")` em 3 Server Actions

**Arquivos:**

- `src/lib/actions/subscriptions.ts:83` — `listAvailablePlans`
- `src/lib/actions/factory-invitations.ts:19` — `listFactoryInvitations`
- `src/lib/actions/retailer-addresses.ts:18` — `listRetailerAddresses`

**Descricao:** Regra do projeto (CLAUDE.md) e preferir selecionar colunas explicitas. Tabelas factory_invitations e plans tem campo `token` e `features` JSONB que nao precisam ser retornados em listagens.
**Impacto:** Performance (payload desnecessario) e seguranca (token do convite retornado ao client sem necessidade).
**Recomendacao:** Substituir por selecao explicita de colunas.

**Atencao especial para `listFactoryInvitations`:** retorna `token` ao client via `select("*")`. O token permite aceitar o convite. O componente `FactoryInvitationCard` nao usa o token, apenas email, name, status, dates. Remover `token` da selecao.

#### W-03 — Listas sem paginacao

**Arquivos:**

- `src/lib/actions/factory-invitations.ts:17-25` — `listFactoryInvitations`
- `src/lib/actions/factory-invitations.ts:27-40` — `listAuthorizedRetailers`
- `src/lib/actions/orders.ts:26-51` — `listFactoryOrders`
- `src/lib/actions/quotes.ts:12-31` — `listFactoryQuotes`
- `src/lib/actions/retailer-addresses.ts:12-25` — `listRetailerAddresses`

**Descricao:** Nenhuma lista usa `.range()` ou paginacao. Em MVP com poucos dados e aceitavel, mas fabricas com muitos lojistas/pedidos podem ter degradacao.
**Impacto:** Performance com crescimento de dados.
**Recomendacao:** Adicionar `.range(0, 49)` com paginacao basica (limit 50) pelo menos em `listFactoryOrders` e `listFactoryQuotes` que tendem a crescer mais rapido.

---

### Suggestions (podem ser melhorados)

#### S-01 — Dialog.Close icon-only sem aria-label

**Arquivo:** `src/components/domain/factory/invite-retailer-drawer.tsx:70-75`
**Descricao:** O botao X de fechar o drawer nao tem `aria-label="Fechar"`. Padrao consistente com outros drawers do projeto, mas seria bom corrigir em todos.
**Recomendacao:** Adicionar `aria-label="Fechar"` no Dialog.Close com icone X.

#### S-02 — `revokeFactoryInvitation` nao filtra por tenantId

**Arquivo:** `src/lib/actions/factory-invitations.ts:219-222`
**Descricao:** Faz `.update().eq("id", invitationId)` sem `.eq("factory_id", tenantId)`. O RLS protege, mas o padrao defense-in-depth do projeto (presente em `updateOrderStatus`, `sendQuote`, `rejectQuote`) sugere adicionar filtro explicito.
**Recomendacao:** Adicionar `.eq("factory_id", tenantId)` apos o `.eq("id", invitationId)`.

#### S-03 — `revokeAuthorization` aceita factoryId do client sem verificar

**Arquivo:** `src/lib/actions/factory-invitations.ts:236-266`
**Descricao:** Recebe `authorizationFactoryId` como parametro mas nao verifica se eh igual ao `tenantId` do requireFactoryAccess. O RLS protege, mas um client malicioso poderia tentar passar IDs arbitrarios.
**Recomendacao:** Usar `tenantId` do `requireFactoryAccess()` ao inves do parametro.

#### S-04 — factory-settings-form.tsx com 411 linhas

**Arquivo:** `src/components/domain/settings/factory-settings-form.tsx`
**Descricao:** Excede o limite de 200 linhas do projeto. Cada secao (pagamento, logistica, termos) poderia ser extraida em sub-componente.
**Recomendacao:** Extrair `PaymentTermsSection`, `ShippingPolicySection`, `CommercialTermsSection`.

#### S-05 — factory-invitations.ts com ~310 linhas

**Arquivo:** `src/lib/actions/factory-invitations.ts`
**Descricao:** Muitas funcoes (list, send, revoke, resend, revokeAuthorization) em um unico arquivo. Poderia separar authorized_retailers em arquivo proprio.
**Recomendacao:** Mover `listAuthorizedRetailers`, `revokeAuthorization` para `src/lib/actions/authorized-retailers.ts`.

#### S-06 — `register()` sem `valueAsNumber` em inputs numericos

**Arquivo:** `src/components/domain/settings/factory-settings-form.tsx:155-156, 165-166, 189-190`
**Descricao:** `register("payment_terms.prazo_dias_default")` com `type="number"` sem `{ valueAsNumber: true }`. O react-hook-form retorna string, mas o zod schema espera `number()`. O zodResolver pode nao converter automaticamente.
**Recomendacao:** Adicionar `{ valueAsNumber: true }` nos 3 register calls com type="number".

---

## Seguranca

| Criterio                              | Status                                          |
| ------------------------------------- | ----------------------------------------------- |
| RLS habilitado em todas as tabelas    | OK                                              |
| Validacao server-side com zod         | OK                                              |
| Secrets protegidos                    | OK — service_role apenas Edge Functions         |
| Double submit prevenido               | OK — loading/disabled states                    |
| Mensagens genericas em erros publicos | OK                                              |
| RBAC no servidor                      | OK — requireFactoryAccess/requireRetailerAccess |
| Token criptografico                   | OK — 96 chars hex                               |
| PII em logs                           | OK — sem vazamento                              |

---

## Regressao

Sprint 4 cria tabelas novas e altera apenas `orders` (ADD COLUMN). Nao modifica tabelas, RLS ou componentes de sprints anteriores. **Regressao nao aplicavel — sprint independente.**

---

## Resumo de Problemas

### Blockers

Nenhum.

### Warnings (devem ser corrigidos)

1. **W-01** — `accept-factory-invitation` select sem campo `status` — `supabase/functions/accept-factory-invitation/index.ts:202`
2. **W-02** — `select("*")` em 3 actions (token do convite exposto ao client) — `factory-invitations.ts:19`, `subscriptions.ts:83`, `retailer-addresses.ts:18`
3. **W-03** — Listas sem paginacao — `orders.ts`, `quotes.ts`, `factory-invitations.ts`, `retailer-addresses.ts`

### Suggestions (pendencia tecnica)

1. **S-01** — Dialog.Close sem aria-label — `invite-retailer-drawer.tsx:70`
2. **S-02** — `revokeFactoryInvitation` sem filtro tenantId — `factory-invitations.ts:219`
3. **S-03** — `revokeAuthorization` aceita factoryId do client — `factory-invitations.ts:236`
4. **S-04** — factory-settings-form.tsx > 200 linhas — `factory-settings-form.tsx`
5. **S-05** — factory-invitations.ts > 200 linhas — `factory-invitations.ts`
6. **S-06** — register() sem valueAsNumber — `factory-settings-form.tsx:155,165,189`

---

## Atribuicao de Origem dos Problemas

- **W-01** (accept-factory-invitation select incompleto): Ninguem — erro de implementacao do Stack Agent. O campo status deveria ter sido incluido no select.
- **W-02** (select("\*")): Ninguem — erro de implementacao do Stack Agent. Regra do projeto ja define preferencia por colunas explicitas.
- **W-03** (sem paginacao): Ninguem — erro de implementacao do Stack Agent. Paginacao basica deveria ter sido incluida nas listas que tendem a crescer.
- **S-01 a S-06**: Ninguem — erros de implementacao do Stack Agent. Agentes de planejamento entregaram corretamente.

**Atribuicao: agentes de planejamento entregaram corretamente, problemas sao de implementacao.**

---

## Recomendacao para QA

Apos correcao dos 3 warnings, QA deve focar em:

1. **Fluxo de convite completo**: enviar convite → aceitar via tela publica → verificar authorized_retailers
2. **Reenvio/revogacao de convites**: reenviar gera novo token, revogar muda status
3. **Factory settings**: salvar, atualizar, verificar que member ve readonly
4. **Retailer addresses**: CRUD completo, default address, delete com confirmacao
5. **Order status transitions**: validar que transicoes invalidas sao bloqueadas
6. **Cotacoes**: criar, enviar, rejeitar, verificar snapshot de preco
7. **Planos e assinaturas**: troca de plano, visualizacao de features
8. **Multi-tenant isolation**: factory A nao ve dados de factory B

---

## Veredicto

Code Review Sprint 4: 3 warnings encontrados, nenhum blocker. Stack agent deve corrigir W-01, W-02, W-03 antes de avancar para QA. Suggestions anotadas como pendencia tecnica.
