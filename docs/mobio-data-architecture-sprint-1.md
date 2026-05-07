# Data Architecture: MOBIO — Sprint 1

> Schema base + Auth RBAC multi-tenant + RLS + Auth Hook (custom JWT claims)

## Diagrama de Entidades (Mermaid)

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1"
    auth_users ||--o{ team_members : "has memberships"
    auth_users ||--o{ favorites : "has"
    auth_users ||--o{ invites : "invited by"

    factories ||--o{ team_members : "has members"
    factories ||--o{ addresses : "has"
    factories ||--o{ collections : "has"
    factories ||--o{ products : "has"
    factories ||--o{ finishes : "has"
    factories ||--o{ product_images : "has"
    factories ||--o{ product_specs : "has"
    factories ||--o{ invites : "has"
    factories ||--o{ favorites : "favorited by"

    retailers ||--o{ team_members : "has members"
    retailers ||--o{ addresses : "has"
    retailers ||--o{ favorites : "has"
    retailers ||--o{ invites : "has"

    regions ||--o{ factories : "located in"
    regions ||--o{ retailers : "located in"

    categories ||--o{ products : "categorizes"
    categories ||--o{ categories : "parent"

    collections ||--o{ products : "groups"

    products ||--o{ product_images : "has"
    products ||--o{ product_specs : "has"
    products ||--o{ favorites : "favorited"

    regions {
        uuid id PK
        text name
        text code UK
        text country
    }

    categories {
        uuid id PK
        text name
        text slug UK
        uuid parent_id FK
        int sort_order
    }

    factories {
        uuid id PK
        text name
        text slug UK
        text description
        text logo_path
        text cover_path
        text website
        text phone
        citext email
        uuid region_id FK
        boolean is_active
        uuid created_by FK
    }

    retailers {
        uuid id PK
        text name
        text slug UK
        text description
        text logo_path
        text website
        text phone
        citext email
        uuid region_id FK
        boolean is_active
        uuid created_by FK
    }

    profiles {
        uuid id PK_FK
        text full_name
        text avatar_path
        text phone
    }

    team_members {
        uuid id PK
        uuid user_id FK
        uuid factory_id FK
        uuid retailer_id FK
        text role
        boolean is_active
        timestamptz joined_at
    }

    addresses {
        uuid id PK
        uuid factory_id FK
        uuid retailer_id FK
        text label
        text street
        text number
        text complement
        text district
        text city
        text state
        text zip_code
        text country
        boolean is_default
    }

    collections {
        uuid id PK
        uuid factory_id FK
        text name
        text slug
        text description
        text season
        int year
        boolean is_active
    }

    products {
        uuid id PK
        uuid factory_id FK
        uuid collection_id FK
        uuid category_id FK
        text name
        text slug
        text description
        text reference
        int min_order_qty
        numeric wholesale_price
        numeric retail_price
        boolean is_active
    }

    product_images {
        uuid id PK
        uuid product_id FK
        uuid factory_id FK
        text path
        text alt_text
        int sort_order
        boolean is_cover
    }

    finishes {
        uuid id PK
        uuid factory_id FK
        text name
        text description
        boolean is_active
    }

    product_specs {
        uuid id PK
        uuid product_id FK
        uuid factory_id FK
        text spec_key
        text spec_value
        int sort_order
    }

    invites {
        uuid id PK
        uuid factory_id FK
        uuid retailer_id FK
        citext email
        text role
        text token UK
        text status
        uuid invited_by FK
        timestamptz expires_at
        timestamptz accepted_at
    }

    favorites {
        uuid id PK
        uuid user_id FK
        uuid retailer_id FK
        uuid product_id FK
        uuid factory_id FK
    }
```

## Estratégia Multi-Tenant

O MOBIO opera com dois tipos de tenant concorrentes:

| Tenant             | Tabela      | Prefixo de roles | Isolamento                         |
| ------------------ | ----------- | ---------------- | ---------------------------------- |
| Factory (atelier)  | `factories` | `atelier_*`      | `factory_id` em cada tabela + RLS  |
| Retailer (lojista) | `retailers` | `lojista_*`      | `retailer_id` em cada tabela + RLS |

- `team_members` é a tabela pivô que liga `auth.users` a tenants com role específico
- Um usuário pode ter múltiplas entradas em `team_members` (um por tenant)
- Constraint `chk_tenant_xor`: factory_id XOR retailer_id (exceto admin)
- Dados de factory (products, collections, finishes, etc.) isolados por `factory_id`
- Dados de retailer (favorites) isolados por `retailer_id`
- Dados compartilhados (regions, categories) com leitura pública

## Tabelas

### regions

Lookup table de regiões (estados/países). Leitura pública, escrita via service_role (seed).

### categories

Categorias de produtos com hierarquia via `parent_id` (self-referential). Leitura pública.

### factories

Tenant principal do shell Atelier. `slug` único para URL pública. `created_by` referencia o usuário que criou a factory no signup flow. `is_active` para soft-disable. `email` usa tipo CITEXT (case-insensitive).

### retailers

Tenant principal do shell Lojista. Mesma estrutura base que factories, adaptada para lojistas multimarca.

### profiles

1:1 com `auth.users`. Dados públicos do usuário (nome, avatar, telefone). Não armazena role — role fica em `team_members` + `app_metadata` do JWT.

### team_members

Tabela pivô central do RBAC. Liga user a tenant com role específico. Constraints:

- `chk_tenant_xor`: factory_id XOR retailer_id (admin pode ter ambos null)
- `uq_user_factory`: um user tem apenas um papel por factory
- `uq_user_retailer`: um user tem apenas um papel por retailer
- Soft delete via `is_active` — nunca hard delete

### addresses

Polimórfico: pertence a factory OU retailer. Constraint `chk_address_owner` garante XOR.

### collections

Coleções de produtos da factory (temporada/linha). Slug único por factory.

### products

Produtos da factory. Slug único por factory. Busca fuzzy via `gin_trgm_ops` no campo `name`. Preços wholesale e retail separados.

### product_images

Imagens dos produtos. `factory_id` desnormalizado para performance de RLS (evita JOIN com products em toda query). `is_cover` marca imagem de capa. `path` referencia Storage bucket.

### finishes

Acabamentos disponíveis na factory (couro, camurça, etc.). Nome único por factory.

### product_specs

Especificações técnicas variáveis por produto (key-value). `spec_key` único por produto.

### invites

Convites de team members. Token criptográfico (32 bytes hex) para link de convite. Status workflow: pending → accepted | expired | revoked. Expiração padrão: 7 dias. Constraint `chk_invite_tenant`: factory→atelier_member, retailer→lojista_buyer.

### favorites

Favoritos do retailer. Lojista favorita produto OU factory (XOR via constraint). Unique por combinação user+retailer+target.

## RLS Policies

| Tabela         | SELECT                                     | INSERT                       | UPDATE                    | DELETE                        |
| -------------- | ------------------------------------------ | ---------------------------- | ------------------------- | ----------------------------- |
| regions        | Todos (público)                            | — (service_role)             | —                         | —                             |
| categories     | Todos (público)                            | — (service_role)             | —                         | —                             |
| factories      | Autenticados (ativas)                      | Criador (signup)             | Owner (via team_members)  | —                             |
| retailers      | Autenticados (ativas)                      | Criador (signup)             | Owner (via team_members)  | —                             |
| profiles       | Próprio + membros do mesmo tenant          | Próprio (signup)             | Próprio                   | —                             |
| team_members   | Próprio + owner do tenant                  | — (service_role)             | Owner do tenant           | — (soft delete via is_active) |
| addresses      | Membros do tenant                          | Owner do tenant              | Owner do tenant           | Owner do tenant               |
| collections    | Membros factory + lojistas (ativas)        | Owner/member factory         | Owner/member factory      | Owner factory                 |
| products       | Membros factory + lojistas (ativos)        | Owner/member factory         | Owner/member factory      | Owner factory                 |
| product_images | Membros factory + lojistas (produto ativo) | Owner/member factory         | Owner/member factory      | Owner factory                 |
| finishes       | Membros factory + lojistas (ativos)        | Owner/member factory         | Owner/member factory      | —                             |
| product_specs  | Membros factory + lojistas (produto ativo) | Owner/member factory         | Owner/member factory      | Owner factory                 |
| invites        | Owner do tenant                            | Owner do tenant              | Owner do tenant (revogar) | — (rastreável)                |
| favorites      | Próprio (dentro do retailer)               | Próprio (dentro do retailer) | —                         | Próprio                       |

## Triggers e Functions

| Trigger / Function         | Tabela             | Evento        | O que faz                                                          |
| -------------------------- | ------------------ | ------------- | ------------------------------------------------------------------ |
| `fn_update_timestamp`      | —                  | —             | Function genérica: seta `NEW.updated_at = now()`                   |
| `trg_*_updated_at`         | Todas (13 tabelas) | BEFORE UPDATE | Atualiza `updated_at` via `fn_update_timestamp()`                  |
| `custom_access_token_hook` | —                  | Auth Hook     | Injeta custom claims no JWT (roles, active_tenant_id, active_role) |

### custom_access_token_hook (SECURITY DEFINER)

```sql
-- Motivo do SECURITY DEFINER: precisa ler team_members sem RLS para montar claims do JWT.
-- SET search_path = public: segurança contra search_path hijacking.
-- Chamada pelo Supabase Auth ao gerar/renovar token.
-- Registrar no Dashboard: Authentication → Hooks → Custom Access Token Hook → schema "public", function "custom_access_token_hook"

-- Claims injetados em app_metadata:
-- {
--   "roles": [{ "tenant_id": "uuid", "tenant_type": "factory|retailer|platform", "role": "atelier_owner" }],
--   "active_tenant_id": "uuid" | null,
--   "active_role": "atelier_owner" | null
-- }

-- Comportamento:
-- 1. Busca todos os team_members ativos do usuário
-- 2. Monta array de roles com tenant_id, tenant_type e role
-- 3. Preserva active_tenant_id/active_role existentes (troca de tenant via Server Action)
-- 4. Se não há active_tenant_id válido: usa o primeiro membership (por joined_at ASC)
-- 5. Se sem memberships: roles=[], active_tenant_id=null, active_role=null
```

**Permissões da function:**

- `GRANT EXECUTE` para `supabase_auth_admin` (Supabase Auth precisa chamar)
- `REVOKE EXECUTE` de `authenticated`, `anon`, `public` (ninguém mais chama)

## Índices

```sql
-- regions: lookup por code e country
CREATE INDEX idx_regions_code ON regions (code);
CREATE INDEX idx_regions_country ON regions (country);

-- categories: lookup por slug e hierarquia
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent_id ON categories (parent_id);

-- factories: slug lookup, RLS por created_by, filtro por region e is_active
CREATE INDEX idx_factories_slug ON factories (slug);
CREATE INDEX idx_factories_region_id ON factories (region_id);
CREATE INDEX idx_factories_created_by ON factories (created_by);
CREATE INDEX idx_factories_is_active ON factories (is_active);

-- retailers: mesma lógica que factories
CREATE INDEX idx_retailers_slug ON retailers (slug);
CREATE INDEX idx_retailers_region_id ON retailers (region_id);
CREATE INDEX idx_retailers_created_by ON retailers (created_by);
CREATE INDEX idx_retailers_is_active ON retailers (is_active);

-- profiles: PK (id) já é índice; policies usam id = auth.uid() (PK scan)

-- team_members: coluna mais consultada em policies de todas as tabelas
CREATE INDEX idx_team_members_user_id ON team_members (user_id);
CREATE INDEX idx_team_members_factory_id ON team_members (factory_id);
CREATE INDEX idx_team_members_retailer_id ON team_members (retailer_id);
CREATE INDEX idx_team_members_role ON team_members (role);
CREATE INDEX idx_team_members_is_active ON team_members (is_active);
CREATE INDEX idx_team_members_user_factory ON team_members (user_id, factory_id);
CREATE INDEX idx_team_members_user_retailer ON team_members (user_id, retailer_id);

-- addresses: RLS por factory_id/retailer_id
CREATE INDEX idx_addresses_factory_id ON addresses (factory_id);
CREATE INDEX idx_addresses_retailer_id ON addresses (retailer_id);

-- collections: RLS por factory_id, filtro por is_active
CREATE INDEX idx_collections_factory_id ON collections (factory_id);
CREATE INDEX idx_collections_is_active ON collections (is_active);
CREATE INDEX idx_collections_slug ON collections (slug);

-- products: RLS por factory_id, filtros por collection/category/is_active, busca fuzzy por name
CREATE INDEX idx_products_factory_id ON products (factory_id);
CREATE INDEX idx_products_collection_id ON products (collection_id);
CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_is_active ON products (is_active);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- product_images: RLS por factory_id
CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_images_factory_id ON product_images (factory_id);

-- finishes: RLS por factory_id
CREATE INDEX idx_finishes_factory_id ON finishes (factory_id);
CREATE INDEX idx_finishes_is_active ON finishes (is_active);

-- product_specs: RLS por factory_id
CREATE INDEX idx_product_specs_product_id ON product_specs (product_id);
CREATE INDEX idx_product_specs_factory_id ON product_specs (factory_id);

-- invites: lookup por token (accept flow), filtro por email/status
CREATE INDEX idx_invites_factory_id ON invites (factory_id);
CREATE INDEX idx_invites_retailer_id ON invites (retailer_id);
CREATE INDEX idx_invites_email ON invites (email);
CREATE INDEX idx_invites_token ON invites (token);
CREATE INDEX idx_invites_status ON invites (status);
CREATE INDEX idx_invites_invited_by ON invites (invited_by);

-- favorites: RLS por user_id + retailer_id
CREATE INDEX idx_favorites_user_id ON favorites (user_id);
CREATE INDEX idx_favorites_retailer_id ON favorites (retailer_id);
CREATE INDEX idx_favorites_product_id ON favorites (product_id);
CREATE INDEX idx_favorites_factory_id ON favorites (factory_id);
```

## RBAC

**Abordagem:** A (Roles fixos) + B (JWT Custom Claims via Auth Hook).

Roles fixos definidos no sistema (TEXT + CHECK em `team_members.role`):

| Role             | Tenant     | Shell     | Permissões                                                    |
| ---------------- | ---------- | --------- | ------------------------------------------------------------- |
| `atelier_owner`  | Factory    | (atelier) | CRUD total no atelier. Gerencia membros.                      |
| `atelier_member` | Factory    | (atelier) | Acesso configurável (futuro: tabela de permissões granulares) |
| `lojista_owner`  | Retailer   | (lojista) | CRUD total na loja. Gerencia buyers.                          |
| `lojista_buyer`  | Retailer   | (lojista) | Discover, favorites, pedidos                                  |
| `admin`          | Plataforma | (admin)   | Acesso total ao painel MOBIO                                  |

**Auth Hook** (`custom_access_token_hook`): Injeta `roles`, `active_tenant_id` e `active_role` em `app_metadata` do JWT. Registrar no Supabase Dashboard (Authentication → Hooks → Custom Access Token Hook).

**Validação do limite 8KB do JWT:**

- `app_metadata.roles` contém array de objetos `{ tenant_id, tenant_type, role }` (~80 bytes por entry)
- Com 50 tenants: ~4KB — bem dentro do limite
- Caso extremo (100+ tenants): considerar paginação ou mover roles para tabela com cache no client
- Para MVP: limite aceitável. Monitorar em produção.

**Camadas de proteção (Defense in Depth):**

1. **Middleware** — verifica JWT, extrai `active_role`, roteia para shell correto
2. **Server Action** — valida permissão via `can()` helper
3. **RLS** — isola dados por `factory_id`/`retailer_id` via `team_members`
4. **UI** — esconde elementos (UX only, não segurança)

## Seed Data

```sql
-- Regiões do Brasil (estados)
INSERT INTO regions (name, code, country) VALUES
  ('Acre', 'AC', 'BR'),
  ('Alagoas', 'AL', 'BR'),
  ('Amapá', 'AP', 'BR'),
  ('Amazonas', 'AM', 'BR'),
  ('Bahia', 'BA', 'BR'),
  ('Ceará', 'CE', 'BR'),
  ('Distrito Federal', 'DF', 'BR'),
  ('Espírito Santo', 'ES', 'BR'),
  ('Goiás', 'GO', 'BR'),
  ('Maranhão', 'MA', 'BR'),
  ('Mato Grosso', 'MT', 'BR'),
  ('Mato Grosso do Sul', 'MS', 'BR'),
  ('Minas Gerais', 'MG', 'BR'),
  ('Pará', 'PA', 'BR'),
  ('Paraíba', 'PB', 'BR'),
  ('Paraná', 'PR', 'BR'),
  ('Pernambuco', 'PE', 'BR'),
  ('Piauí', 'PI', 'BR'),
  ('Rio de Janeiro', 'RJ', 'BR'),
  ('Rio Grande do Norte', 'RN', 'BR'),
  ('Rio Grande do Sul', 'RS', 'BR'),
  ('Rondônia', 'RO', 'BR'),
  ('Roraima', 'RR', 'BR'),
  ('Santa Catarina', 'SC', 'BR'),
  ('São Paulo', 'SP', 'BR'),
  ('Sergipe', 'SE', 'BR'),
  ('Tocantins', 'TO', 'BR');

-- Categorias base de produtos (moda/calçados)
INSERT INTO categories (name, slug) VALUES
  ('Calçados', 'calcados'),
  ('Bolsas', 'bolsas'),
  ('Acessórios', 'acessorios'),
  ('Vestuário', 'vestuario');

-- Subcategorias (parent_id preenchido via UPDATE após INSERT)
-- O Stack Agent deve implementar seed completo com subcategorias via script
```

## Decisões

| Decisão                                                   | Alternativa descartada                  | Motivo                                                                                                            |
| --------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| TEXT + CHECK para roles e status                          | PostgreSQL native ENUM                  | Difícil alterar enum em produção; TEXT + CHECK permite ADD/REMOVE via migration simples                           |
| CITEXT para emails                                        | TEXT + LOWER()                          | CITEXT é mais limpo e garante case-insensitivity automaticamente em WHERE e UNIQUE                                |
| factory_id desnormalizado em product_images/product_specs | JOIN com products para obter factory_id | Performance de RLS — evita JOIN em toda query de listagem                                                         |
| team_members como tabela pivô central                     | Roles direto em profiles                | Um usuário pode ter múltiplos tenants; profiles.role não suporta isso                                             |
| Auth Hook em vez de trigger on signup                     | Trigger after insert em auth.users      | Auth Hook é o mecanismo oficial do Supabase; trigger em auth.users é frágil e pode quebrar em updates do Supabase |
| Soft delete (is_active) em team_members                   | Hard DELETE                             | Auditabilidade; referências em audit_logs futuras; reversibilidade                                                |
| XOR constraint (factory_id/retailer_id) em team_members   | Tabela separada por tipo de tenant      | Uma tabela simplifica queries de RLS — todas as policies consultam team_members de forma uniforme                 |
| Token criptográfico em invites (gen_random_bytes)         | UUID como token                         | gen_random_bytes(32) = 256 bits de entropia vs UUID = 122 bits. Mais seguro para link de convite                  |
| fn_update_timestamp como trigger genérico                 | updated_at no código da aplicação       | Garantia no banco — impossível esquecer de atualizar                                                              |
| Profiles sem role                                         | Role em profiles                        | Role fica em team_members; profiles é 1:1 com auth.users e contém apenas dados do perfil                          |

## Migrations

17 arquivos em `supabase/migrations/`:

| #   | Arquivo                                              | Conteúdo                                                       |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- |
| 01  | `20260507120000_extensions.sql`                      | pg_trgm, pgcrypto, citext                                      |
| 02  | `20260507120001_enums.sql`                           | Documentação de roles (placeholder — TEXT + CHECK nas tabelas) |
| 03  | `20260507120002_regions.sql`                         | regions + RLS pública + índices                                |
| 04  | `20260507120003_categories.sql`                      | categories + RLS pública + índices                             |
| 05  | `20260507120004_factories.sql`                       | factories + RLS + índices                                      |
| 06  | `20260507120005_retailers.sql`                       | retailers + RLS + índices                                      |
| 07  | `20260507120006_profiles.sql`                        | profiles (1:1 auth.users) + RLS self                           |
| 08  | `20260507120007_team_members.sql`                    | team_members + RLS owner/self + índices                        |
| 09  | `20260507120008_addresses.sql`                       | addresses + RLS por tenant + índices                           |
| 10  | `20260507120009_collections.sql`                     | collections + RLS factory + público + índices                  |
| 11  | `20260507120010_products.sql`                        | products + RLS + busca trgm + índices                          |
| 12  | `20260507120011_product_images.sql`                  | product_images + RLS herdada + índices                         |
| 13  | `20260507120012_finishes.sql`                        | finishes + RLS factory + índices                               |
| 14  | `20260507120013_product_specs.sql`                   | product_specs + RLS + índices                                  |
| 15  | `20260507120014_invites.sql`                         | invites + token + RLS owner + índices                          |
| 16  | `20260507120015_favorites.sql`                       | favorites + RLS self/retailer + índices                        |
| 17  | `20260507120016_auth_hook_and_deferred_policies.sql` | fn_update_timestamp + triggers + policies deferred + Auth Hook |

## Ação Manual Obrigatória Pós-Deploy

Após aplicar as migrations (`supabase db push`), registrar o Auth Hook no Supabase Dashboard:

1. Ir para Authentication → Hooks
2. Ativar "Custom Access Token Hook"
3. Schema: `public`
4. Function: `custom_access_token_hook`
5. Salvar
