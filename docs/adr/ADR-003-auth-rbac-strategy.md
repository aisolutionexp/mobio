# ADR-003: Estratégia de Auth + RBAC Multi-Tenant

## Status: Accepted

> **Nota:** Este ADR define a DECISÃO arquitetural. A implementação real acontece na Sprint 1 (Schema Base + Auth + RBAC).

## Contexto

O MOBIO é multi-tenant com dois tipos de tenant (atelier e loja) e múltiplos roles por tenant. Requisitos:

- Um usuário pode pertencer a múltiplos tenants (ex: ser dono de um atelier E buyer de uma loja)
- Cada tenant tem seus próprios dados isolados (produtos, pedidos, etc.)
- Roles determinam o que o usuário pode fazer dentro de um tenant
- O middleware do Next.js precisa saber o role para rotear para o shell correto
- RLS no Postgres precisa do tenant_id para isolar dados

## Decisão

### Provedor de Auth: Supabase Auth

Supabase Auth nativo — sem Auth0, Clerk ou outro provedor externo.

**Motivo:** Integração nativa com RLS (via `auth.uid()` e `auth.jwt()`), sem custo adicional por MAU, Edge Functions acessam o contexto de auth diretamente.

### Armazenamento de Roles: `app_metadata` via Auth Hooks

Roles e tenant_id armazenados em `app_metadata` do JWT do Supabase:

```json
{
  "app_metadata": {
    "roles": [
      { "tenant_id": "uuid-atelier-1", "role": "atelier_owner" },
      { "tenant_id": "uuid-loja-1", "role": "lojista_buyer" }
    ],
    "active_tenant_id": "uuid-atelier-1",
    "active_role": "atelier_owner"
  }
}
```

- `roles` — lista de todos os tenants/roles do usuário
- `active_tenant_id` — tenant ativo na sessão atual
- `active_role` — role ativa na sessão atual
- Troca de tenant/role via Server Action que atualiza `app_metadata` e revalida sessão

**Por que `app_metadata` (não tabela separada):**

- Disponível no JWT sem query adicional
- Acessível no middleware do Next.js (Edge Runtime) sem round-trip ao banco
- Acessível em RLS via `auth.jwt()->'app_metadata'`
- Supabase Auth Hooks podem popular na criação do usuário

### Roles Previstas

| Role             | Shell   | Permissões                                                                |
| ---------------- | ------- | ------------------------------------------------------------------------- |
| `atelier_owner`  | Atelier | CRUD total no atelier. Gerencia membros, configurações, catálogo, pedidos |
| `atelier_member` | Atelier | Acesso configurável por permissão (ver catálogo, processar pedidos, etc.) |
| `lojista_owner`  | Lojista | CRUD total na loja. Gerencia buyers, configurações, pedidos               |
| `lojista_buyer`  | Lojista | Discover, boards, quotes, pedidos (sem configurações da loja)             |
| `admin`          | Admin   | Acesso total ao painel administrativo MOBIO                               |

### Camadas de Proteção (Defense in Depth)

| Camada            | Responsabilidade                            | Implementação                                                              |
| ----------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| **Middleware**    | Bloqueia rotas por role antes de renderizar | `src/middleware.ts` — verifica JWT, extrai role, roteia                    |
| **Server Action** | Valida permissão antes de executar mutation | `lib/services/permissions.ts` → `can('products:create')`                   |
| **RLS**           | Isola dados por tenant no Postgres          | Policies usando `(SELECT auth.jwt()->'app_metadata'->>'active_tenant_id')` |
| **UI**            | Esconde elementos sem permissão (UX only)   | `hooks/use-permissions.ts` → `can('products:create')`                      |

**Regra:** A UI esconde — o servidor protege. Um request direto sem UI deve receber erro de permissão, não dados.

### Fluxo de Autenticação

```
1. Login → Supabase Auth → JWT com app_metadata (roles, active_tenant_id)
2. Middleware lê JWT → verifica sessão → extrai active_role
3. Se sem sessão → redirect /login
4. Se role = atelier_* → serve route group (atelier)
5. Se role = lojista_* → serve route group (lojista)
6. Se role = admin → serve route group (admin)
7. Server Components usam supabase server client (cookies) → fetch com RLS
8. Server Actions validam permissão + RLS no banco
```

### Troca de Tenant/Role

Usuário com múltiplos tenants pode trocar via seletor no topbar:

```
1. Usuário seleciona outro tenant no dropdown
2. Client chama Server Action switchTenant(tenantId)
3. Server Action atualiza app_metadata.active_tenant_id e active_role
4. Sessão revalidada → middleware serve o route group correto
5. revalidatePath('/') → UI atualiza
```

### Permissões Granulares (atelier_member)

Para `atelier_member`, as permissões são granulares e configuráveis pelo `atelier_owner`:

```json
{
  "permissions": [
    "products:read",
    "products:create",
    "orders:read",
    "orders:update"
  ]
}
```

Armazenadas em tabela `tenant_member_permissions` (não no JWT — JWT só tem role).
Verificação: Server Action consulta tabela de permissões quando role é `atelier_member`.

Hook `usePermissions()` carrega permissões no client (via query inicial) e expõe `can('products:create')`.

## Alternativas descartadas

### Auth0 / Clerk como provedor externo

- UIs de login pré-construídas
- Multi-tenant e RBAC como features nativas
- **Descartada porque:** Custo por MAU significativo em marketplace B2B. Supabase Auth é gratuito e integrado com RLS. Adicionar provedor externo cria dependência + complexidade de sync entre auth externo e Supabase

### Roles em tabela separada (não app_metadata)

- Mais flexível para queries complexas
- Sem limite de tamanho do JWT
- **Descartada porque:** Exigiria round-trip ao banco no middleware (Edge Runtime), aumentando latência em toda navegação. `app_metadata` no JWT resolve para RBAC com 5-6 roles. Se o schema de permissões ficar muito complexo, considerar mover para tabela — mas para o MVP, JWT é suficiente

### RBAC via Supabase Auth.admin (server-only)

- Toda verificação de permissão no server
- Client não sabe os roles (server-rendered)
- **Descartada porque:** UX prejudicada — client precisa saber permissões para esconder/mostrar elementos. Verificação dupla (client para UX + server para segurança) é o padrão correto

## Consequências

### Positivas

- Latência zero no middleware para verificar roles (JWT local)
- RLS integrado com auth — dados isolados por tenant automaticamente
- Modelo flexível — suporta múltiplos tenants por usuário
- Permissões granulares para roles que precisam (atelier_member) sem sobrecarregar JWT

### Negativas

- `app_metadata` tem limite de tamanho — se um usuário pertencer a 50+ tenants, o JWT pode ficar grande. Mitigação: limitar tenants por usuário ou paginar roles
- Troca de tenant requer atualizar JWT — não é instantâneo (precisa refresh da sessão)
- Permissões granulares de `atelier_member` exigem query adicional ao banco (não estão no JWT) — mitigável com cache no client via React Query
- Se Supabase Auth tiver limitação futura, migração para provedor externo é trabalhosa
