# Security Review: MOBIO — Sprint 1 (Schema + Auth + RBAC)

> Review do modelo de dados, RLS, Auth Hook e RBAC multi-tenant ANTES da implementacao.
> Data: 2026-05-07

## Veredicto: APROVADO COM RESSALVAS

O modelo de seguranca esta solido e bem construido. Nenhum blocker critico encontrado. 3 warnings que devem ser corrigidos durante a implementacao pelo Stack agent. A arquitetura segue as melhores praticas de multi-tenant isolation com RLS, auth hook com SECURITY DEFINER + search_path, e tokens criptograficos para convites.

---

## Resultado dos Greps de Auditoria

| Verificacao                                    | Comando                                                | Resultado                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `auth.uid()` sem wrapper `(SELECT ...)`        | `grep 'auth\.uid()' \| grep -v '(SELECT auth\.uid())'` | **0 ocorrencias** — PASS                                                                  |
| `USING(true)` em DELETE policies               | `grep 'USING\s*(true)' \| grep -iv SELECT`             | **0 ocorrencias** — PASS                                                                  |
| SECURITY DEFINER sem `SET search_path`         | `grep SECURITY DEFINER` vs `grep search_path`          | **Todas com search_path** — PASS                                                          |
| ENABLE ROW LEVEL SECURITY vs CREATE TABLE      | 14 tabelas criadas, 14 com RLS                         | **100% cobertura** — PASS                                                                 |
| GRANT/REVOKE no Auth Hook                      | `grep GRANT\|REVOKE`                                   | **Correto: GRANT para supabase_auth_admin, REVOKE para authenticated/anon/public** — PASS |
| `user_metadata` usado para claims de seguranca | `grep user_metadata`                                   | **0 ocorrencias** — PASS                                                                  |
| Token criptografico em invites                 | `grep gen_random_bytes`                                | **32 bytes (256 bits)** — PASS                                                            |

---

## Issues Encontrados

### BLOCKERS (impedem implementacao)

Nenhum.

### WARNINGS (resolver durante implementacao)

**W1. `profiles_select_team` nao verifica `is_active` nos team_members**

- Arquivo: `20260507120016_auth_hook_and_deferred_policies.sql:110-121`
- Descricao: A policy `profiles_select_team` faz JOIN entre `team_members tm1` e `team_members tm2` mas nao filtra por `tm1.is_active = true AND tm2.is_active = true`. Um membro desativado (soft-deleted) ainda consegue ver perfis de outros membros do tenant.
- Impacto: Information Disclosure (STRIDE) — membro desativado mantem acesso visual a perfis.
- Recomendacao: Adicionar `AND tm1.is_active = true AND tm2.is_active = true` ao WHERE da policy.

**W2. `factories_update_owner` e `retailers_update_owner` sem `WITH CHECK`**

- Arquivo: `20260507120016_auth_hook_and_deferred_policies.sql:80-104`
- Descricao: As policies de UPDATE em factories e retailers tem `USING (...)` mas nao tem `WITH CHECK (...)`. Sem `WITH CHECK`, o Postgres usa a clausula `USING` como fallback para o check — funcional mas nao explicito. O risco e que um owner poderia potencialmente alterar campos como `created_by` ou `is_active` sem restricao granular.
- Impacto: Tampering (STRIDE) — owner pode mudar qualquer coluna da factory/retailer, incluindo `created_by`.
- Recomendacao: Adicionar `WITH CHECK` explicito que impeca alteracao de `created_by` e `id`, ou adicionar constraint no UPDATE que limite colunas atualizaveis via Server Action (a camada de aplicacao ja deveria restringir, mas defense in depth).

**W3. ON DELETE CASCADE em `team_members.factory_id` e `team_members.retailer_id`**

- Arquivo: `20260507120007_team_members.sql:9-10`
- Descricao: Se uma factory ou retailer for deletada (hard delete), todos os team_members associados sao removidos em cascata. A factory/retailer usa `ON DELETE RESTRICT` em `auth.users(id)`, o que e correto. Porem, nao ha policy de DELETE em factories nem retailers, o que significa que a delecao so e possivel via service_role. Isso mitiga o risco, mas se no futuro alguem adicionar uma policy DELETE em factories, o CASCADE pode causar perda massiva de dados.
- Impacto: Risco futuro — nao ha vetor de ataque hoje, mas o design permite destruicao em cascata.
- Recomendacao: Considerar `ON DELETE SET NULL` em `team_members.factory_id` e `team_members.retailer_id` para preservar historico, ou documentar explicitamente que factories/retailers NUNCA devem ter policy DELETE.

### SUGGESTIONS (nice-to-have)

**S1. Indices compostos para queries frequentes de policies**

- Descricao: As policies de tabelas como collections, products, addresses, etc. fazem `EXISTS (SELECT 1 FROM team_members WHERE user_id = ... AND factory_id = ... AND is_active = true)`. Ja existem indices individuais e compostos `(user_id, factory_id)` e `(user_id, retailer_id)`. Porem, um indice composto `(user_id, factory_id, is_active)` cobriria a query inteira sem lookup adicional.
- Recomendacao: Monitorar performance apos deploy. Se queries de RLS ficarem lentas, adicionar indices compostos com `is_active`.

**S2. `fn_update_timestamp` nao e SECURITY DEFINER mas poderia ser mais restritiva**

- Arquivo: `20260507120016_auth_hook_and_deferred_policies.sql:12-21`
- Descricao: A function `fn_update_timestamp()` tem `SET search_path = public` (bom), nao e SECURITY DEFINER (correto, nao precisa). Sem observacoes de seguranca, apenas nota de que esta bem configurada.

**S3. Considerar rate limiting na tabela invites**

- Descricao: Nao ha limitacao de quantos convites um owner pode criar por periodo. Um owner malicioso (ou comprometido) pode gerar milhares de convites. A restricao deve ser implementada na camada de aplicacao (Server Action) pelo Stack agent.
- Recomendacao: Implementar rate limit no Server Action de criacao de convites (ex: max 50 convites ativos por tenant).

**S4. `invites.expires_at` — validacao de expiracao**

- Descricao: O campo `expires_at` tem default de 7 dias (`now() + INTERVAL '7 days'`), mas nao ha check constraint impedindo que alguem defina uma expiracao muito longa (ex: 100 anos). A validacao deve ser feita no Server Action.
- Recomendacao: Implementar validacao no Server Action para limitar `expires_at` a no maximo 30 dias.

**S5. Admin role sem tenant — policy coverage**

- Descricao: O role `admin` em team_members tem `factory_id IS NULL AND retailer_id IS NULL`. Nenhuma policy atualmente concede ao admin acesso a dados de tenants. Isso e correto para o MVP (admin acessara via Supabase Dashboard ou painel admin futuro com service_role), mas deve ser documentado para que o Stack agent saiba que o admin panel precisara de Server Actions com service_role.
- Recomendacao: Documentar no backlog que o painel admin usara service_role client, nao policies de RLS.

---

## Matriz de Cobertura RLS

| Tabela         | RLS | SELECT                                  | INSERT                       | UPDATE                    | DELETE          | Isolamento                              |
| -------------- | --- | --------------------------------------- | ---------------------------- | ------------------------- | --------------- | --------------------------------------- |
| regions        | ON  | Publico                                 | — (service_role)             | —                         | —               | N/A (lookup)                            |
| categories     | ON  | Publico                                 | — (service_role)             | —                         | —               | N/A (lookup)                            |
| factories      | ON  | Autenticados (ativas)                   | Criador via auth.uid()       | Owner (via team_members)  | — (PROIBIDO)    | created_by no INSERT                    |
| retailers      | ON  | Autenticados (ativas)                   | Criador via auth.uid()       | Owner (via team_members)  | — (PROIBIDO)    | created_by no INSERT                    |
| profiles       | ON  | Proprio + team (W1)                     | Proprio                      | Proprio                   | —               | id = auth.uid()                         |
| team_members   | ON  | Proprio + owner do tenant               | — (service_role)             | Owner do tenant           | — (soft delete) | user_id + tenant_id                     |
| addresses      | ON  | Membros do tenant                       | Owner do tenant              | Owner do tenant           | Owner do tenant | factory_id/retailer_id via team_members |
| collections    | ON  | Membros factory + lojistas (ativas)     | Owner/member factory         | Owner/member factory      | Owner factory   | factory_id via team_members             |
| products       | ON  | Membros factory + lojistas (ativos)     | Owner/member factory         | Owner/member factory      | Owner factory   | factory_id via team_members             |
| product_images | ON  | Membros factory + lojistas (prod ativo) | Owner/member factory         | Owner/member factory      | Owner factory   | factory_id via team_members             |
| finishes       | ON  | Membros factory + lojistas (ativos)     | Owner/member factory         | Owner/member factory      | —               | factory_id via team_members             |
| product_specs  | ON  | Membros factory + lojistas (prod ativo) | Owner/member factory         | Owner/member factory      | Owner factory   | factory_id via team_members             |
| invites        | ON  | Owner do tenant                         | Owner do tenant              | Owner do tenant (revogar) | — (rastreavel)  | factory_id/retailer_id via team_members |
| favorites      | ON  | Proprio (dentro do retailer)            | Proprio (dentro do retailer) | —                         | Proprio         | user_id + retailer_id                   |

**Totais: 14 tabelas, 14 com RLS habilitado, 58 policies criadas.**

---

## Analise por Area de Foco

### 1. RLS — Todas as 17 migrations

- **ENABLE ROW LEVEL SECURITY:** 14/14 tabelas — 100% cobertura
- **Wrapper `(SELECT auth.uid())`:** Todas as policies usam o wrapper corretamente — 0 violacoes
- **Indices em colunas de policy:** Todas as colunas referenciadas em policies (`user_id`, `factory_id`, `retailer_id`, `is_active`, `created_by`) possuem indice correspondente na mesma migration
- **DELETE com USING(true):** 0 ocorrencias — todas as policies DELETE verificam ownership via team_members
- **Policies separadas por operacao:** Correto — cada operacao (SELECT, INSERT, UPDATE, DELETE) tem policy individual

### 2. SECURITY DEFINER

- **`fn_update_timestamp`:** Nao e SECURITY DEFINER (correto, nao precisa). Tem `SET search_path = public` (boa pratica preventiva).
- **`custom_access_token_hook`:** SECURITY DEFINER com `SET search_path = public` — correto e necessario para ler team_members sem RLS.
- **Auth Hook escalation:** O hook NAO confia em valores enviados pelo usuario — ele busca roles diretamente da tabela team_members. O `active_tenant_id` preservado do `app_metadata` existente e validado contra os roles ativos (`NOT EXISTS` check na linha 188-190). Se o tenant nao esta mais nos roles ativos, o hook reseta para o primeiro. Idempotente: multiplas chamadas com mesmo estado produzem mesmo resultado.
- **GRANTs:** Apenas `supabase_auth_admin` pode invocar o Auth Hook. `authenticated`, `anon` e `public` tem EXECUTE revogado. Correto.

### 3. Multi-tenant Isolation

- **Factory vs Factory:** Products, collections, finishes, product_images, product_specs — todos filtram por `factory_id` via `team_members` lookup. Factory A nao consegue ver dados de Factory B.
- **Retailer vs Retailer:** Favorites filtram por `user_id + retailer_id` via team_members. Retailer A nao ve favoritos de Retailer B.
- **Cross-tenant:** Lojistas veem catalogo publico (products/collections/finishes com `is_active = true`) de TODAS as factories — correto, e a funcionalidade de marketplace.
- **XOR constraint:** `chk_tenant_xor` em team_members garante que um membership e factory OU retailer, nunca ambos (exceto admin sem tenant). Constraint `chk_address_owner` em addresses garante o mesmo. `chk_invite_tenant` garante consistencia role-tenant em invites. `chk_favorite_target` garante favorito de produto OU factory, nunca ambos.

### 4. JWT Custom Claims

- **Tamanho:** Cada entry no array `roles` tem ~80 bytes (tenant_id UUID + tenant_type + role). Com 50 tenants: ~4KB. Limite JWT de 8KB respeitado com margem.
- **app_metadata vs user_metadata:** Todas as claims de seguranca (roles, active_tenant_id, active_role) estao em `app_metadata`. Zero uso de `user_metadata` para claims de seguranca. Correto — `user_metadata` e editavel pelo client.
- **active_tenant_id validation:** O hook valida que o `active_tenant_id` preservado ainda existe nos roles ativos. Se nao existe, reseta para o primeiro membership. Previne que um usuario mantenha acesso a um tenant do qual foi removido.
- **Sem PII no JWT:** Apenas `tenant_id`, `tenant_type` e `role` no JWT. Nenhum email, nome ou dados pessoais.

### 5. Convites e Tokens

- **Token criptografico:** `gen_random_bytes(32)` = 256 bits de entropia, encodado em hex (64 chars). Nao adivinhavel.
- **Expiracao:** Default de 7 dias. Campo `expires_at` presente.
- **Validacao do email:** A constraint `chk_invite_tenant` garante consistencia role-tenant. Porem, a validacao de que o email do convidado corresponde ao convite deve ser feita na Edge Function de aceite (nao no schema). O Stack agent deve implementar: ao aceitar convite, verificar que `invites.email = email_do_usuario_autenticado`.
- **Status workflow:** `pending -> accepted | expired | revoked` com CHECK constraint. Sem policy DELETE (rastreavel). Correto.

### 6. Edge Functions de Signup (a implementar)

O doc menciona Edge Functions para signup. Recomendacoes para o Stack agent:

- **Idempotencia:** `signup-factory` e `signup-retailer` devem verificar se factory/retailer ja existe (por slug ou email) antes de criar. Se ja existe e o usuario e o `created_by`, retornar sucesso sem duplicar.
- **Rate limit:** Implementar rate limiting nas Edge Functions de signup (ex: max 3 signups por IP por hora).
- **Magic link:** Resposta identica se email existe ou nao ("se o email estiver cadastrado, enviaremos um link"). Nao revelar existencia de conta.
- **bootstrap-mobio-admin:** Deve ser idempotente — verificar se admin ja existe antes de criar. Usar `ON CONFLICT DO NOTHING` no INSERT de team_members.

### 7. Dados Sensiveis

- **Profiles:** Nao armazena email (email fica em `auth.users`). Profiles expoe `full_name`, `avatar_path`, `phone` — acessiveis apenas para membros do mesmo tenant (via policy `profiles_select_team`, com ressalva W1).
- **Invites:** Lista de convites visivel apenas para owner do tenant. Email do convidado visivel apenas para o owner que convidou. Correto.
- **service_role:** Usado apenas no Auth Hook (via `supabase_auth_admin`) e nas Edge Functions (a implementar). Nenhuma referencia a service_role no client-side. Correto.

### 8. Anti-patterns Cross-Project

| Anti-pattern                            | Status   | Detalhes                                          |
| --------------------------------------- | -------- | ------------------------------------------------- |
| `auth.uid()` sem wrapper `(SELECT ...)` | PASS     | 0 ocorrencias                                     |
| Indice em coluna de policy              | PASS     | Todos os indices presentes                        |
| SECURITY DEFINER sem `SET search_path`  | PASS     | Ambas as functions tem `SET search_path = public` |
| DELETE com `USING(true)`                | PASS     | 0 ocorrencias                                     |
| Claims de seguranca em `user_metadata`  | PASS     | 0 ocorrencias                                     |
| ON DELETE CASCADE em tabelas de audit   | **NOTA** | Ver W3 — team_members usa CASCADE                 |

---

## Recomendacoes para o Stack Agent

1. **Corrigir `profiles_select_team` (W1):** Adicionar filtro `is_active = true` nos dois lados do JOIN antes de deployar as migrations.

2. **Adicionar `WITH CHECK` em `factories_update_owner` e `retailers_update_owner` (W2):** Ou, minimamente, garantir no Server Action que apenas colunas permitidas sejam atualizadas (nunca `created_by`, `id`).

3. **Server Actions SEMPRE chamam `auth.getUser()` internamente** — nunca confiar em userId passado como parametro. Padrao: `getUser()` -> validar input (zod) -> verificar ownership -> executar.

4. **Edge Functions de signup:** Implementar idempotencia, rate limiting, e magic link sem vazamento de info.

5. **Aceite de convite:** Validar que `invites.email = email_do_usuario_autenticado`. Verificar `expires_at > now()` e `status = 'pending'` antes de aceitar.

6. **Rate limit em invites:** Max 50 convites ativos por tenant no Server Action.

7. **Painel admin:** Usar service_role client (`src/lib/supabase/admin.ts`) para operacoes admin. Nao criar policies RLS para admin no MVP.

8. **HTTP Security Headers:** Configurar em `next.config.ts` antes do deploy: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
