# Data Architecture: MOBIO — Sprint 4

> Atelier Fábrica — Comércio: authorized_retailers + factory_invitations + factory_settings + retailer_addresses + conversations/messages + order_numbering + plans_seed

## Diagrama de Entidades — Tabelas Novas (Mermaid)

```mermaid
erDiagram
    factories ||--o{ authorized_retailers : "authorizes"
    retailers ||--o{ authorized_retailers : "authorized by"
    auth_users ||--o{ authorized_retailers : "authorized_by"

    factories ||--o{ factory_invitations : "invites"
    auth_users ||--o{ factory_invitations : "invited_by"

    factories ||--|| factory_settings : "has settings"

    retailers ||--o{ retailer_addresses : "shipping to"
    regions ||--o{ retailer_addresses : "located in"

    factories ||--o{ conversations : "participates"
    retailers ||--o{ conversations : "participates"
    conversations ||--|{ messages : "contains"
    auth_users ||--o{ messages : "sends"

    orders ||--|| orders : "has order_number"

    plans ||--o{ subscriptions : "subscribed via"

    authorized_retailers {
        uuid factory_id PK_FK
        uuid retailer_id PK_FK
        uuid authorized_by FK
        text status
        timestamptz authorized_at
        timestamptz revoked_at
    }

    factory_invitations {
        uuid id PK
        uuid factory_id FK
        citext retailer_email
        text retailer_name
        text token UK
        text status
        uuid invited_by FK
        timestamptz expires_at
        timestamptz accepted_at
        jsonb terms_snapshot
    }

    factory_settings {
        uuid factory_id PK_FK
        jsonb payment_terms
        jsonb shipping_policy
        jsonb commercial_terms
    }

    retailer_addresses {
        uuid id PK
        uuid retailer_id FK
        text label
        text recipient_name
        text address_line
        text complement
        text neighborhood
        text city
        text state
        text zip_code
        uuid region_id FK
        boolean is_default
    }

    conversations {
        uuid id PK
        uuid factory_id FK
        uuid retailer_id FK
        timestamptz last_message_at
        text status
    }

    messages {
        uuid id PK
        uuid conversation_id FK
        uuid sender_user_id FK
        text body
        jsonb attachments
        boolean is_read
        timestamptz edited_at
        timestamptz deleted_at
    }
```

## Migrations — Sprint 4

8 arquivos em `supabase/migrations/` (timestamps 20260507160000–20260507160007):

| #   | Arquivo                                   | Conteúdo                                                                        |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `20260507160000_authorized_retailers.sql` | authorized_retailers (N:N factory↔retailer) + RLS + trigger + índices           |
| 2   | `20260507160001_factory_invitations.sql`  | factory_invitations + token + partial unique + RLS + trigger + índices          |
| 3   | `20260507160002_factory_settings.sql`     | factory_settings (1:1 factory) + RLS (factory + authorized retailers) + trigger |
| 4   | `20260507160003_retailer_addresses.sql`   | retailer_addresses (shipping) + RLS (retailer + authorized factory) + trigger   |
| 5   | `20260507160004_conversations.sql`        | conversations + unique pair + RLS + trigger + índices                           |
| 6   | `20260507160005_messages.sql`             | messages + RLS + fn_update_conversation_last_message trigger + índices          |
| 7   | `20260507160006_order_numbering.sql`      | ALTER orders ADD order_number + sequence + fn_generate_order_number trigger     |
| 8   | `20260507160007_plans_seed.sql`           | INSERT plans seed (5 plans) ON CONFLICT DO NOTHING                              |

## Tabelas Novas

### authorized_retailers

Autorização N:N entre factory e retailer. PK composto (factory_id, retailer_id). Status: `active` | `revoked`. Factory owner autoriza/revoga; retailer vê suas autorizações. Nunca hard delete — revogação via status.

### factory_invitations

Convites privados da factory para lojistas. **Distinto de `invites` (S1)** — invites é para team members genéricos, factory_invitations é para convidar retailers ao catálogo privado. Token criptográfico 256 bits (`gen_random_bytes(32)`). Partial unique index garante apenas 1 convite pendente por email por factory. Expiração padrão: 7 dias. `terms_snapshot` JSONB opcional captura a política de pagamento no momento do convite.

### factory_settings

Configurações comerciais da factory (1:1 com factories). Campos JSONB flexíveis:

- `payment_terms`: formas de pagamento aceitas, prazos, parcelas, desconto à vista
- `shipping_policy`: modos de envio, prazos por região, política de frete
- `commercial_terms`: mínimo de pedido, prazo de entrega, condições gerais

RLS permite leitura por retailers autorizados (via `authorized_retailers`) além da factory.

### retailer_addresses

Endereços de entrega do lojista. **Distinto de `addresses` (S1)** — addresses é para sede do tenant (factory/retailer polimórfico), retailer_addresses é exclusivo para endereços de entrega com campos mais granulares (recipient_name, neighborhood, region_id). Factory autorizada pode ver para calcular frete.

### conversations

Conversas factory↔retailer. UNIQUE (factory_id, retailer_id) — 1 conversa por par. Status: `active` | `archived`. `last_message_at` atualizado automaticamente por trigger em messages. Ambos os lados podem criar, ver e arquivar.

### messages

Mensagens dentro de uma conversa. Soft delete via `deleted_at`. `is_read` para controle de leitura. `attachments` JSONB para referências a arquivos. Remetente pode editar (via `edited_at`). Receptor pode marcar como lido. Trigger `fn_update_conversation_last_message` atualiza `conversations.last_message_at` em cada nova mensagem.

## Alterações em Tabelas Existentes

### orders

- `order_number` TEXT UNIQUE — formato MOB-YYYY-NNNNN (ex: MOB-2026-00001)
- Gerado automaticamente via trigger BEFORE INSERT usando sequence `order_number_seq`
- Índice em `order_number` para lookup rápido

### plans (seed)

5 planos inseridos via ON CONFLICT DO NOTHING (idempotente):

- Atelier Free (R$ 0), Atelier Pro (R$ 149), Atelier Business (R$ 299)
- Lojista Free (R$ 0), Lojista Plus (R$ 99)
- Features como JSONB com flags booleanas e limites numéricos (null = ilimitado)

## RLS Policies — Tabelas Novas

| Tabela               | SELECT                               | INSERT               | UPDATE                   | DELETE          |
| -------------------- | ------------------------------------ | -------------------- | ------------------------ | --------------- |
| authorized_retailers | Factory members + retailer self      | Factory owner        | Factory owner            | — (soft revoke) |
| factory_invitations  | Factory members                      | Factory owner        | Factory owner            | — (soft revoke) |
| factory_settings     | Factory members + auth. retailers    | Factory owner        | Factory owner            | — (cascaded)    |
| retailer_addresses   | Retailer owner/buyer + auth. factory | Retailer owner/buyer | Retailer owner/buyer     | Retailer owner  |
| conversations        | Factory members + retailer members   | Either side          | Either side              | — (archived)    |
| messages             | Factory members + retailer members   | Either side (sender) | Sender + receiver (read) | — (soft delete) |

## Triggers e Functions — Sprint 4

| Trigger / Function                    | Tabela               | Evento        | O que faz                                                    |
| ------------------------------------- | -------------------- | ------------- | ------------------------------------------------------------ |
| `trg_authorized_retailers_updated_at` | authorized_retailers | BEFORE UPDATE | fn_update_timestamp()                                        |
| `trg_factory_invitations_updated_at`  | factory_invitations  | BEFORE UPDATE | fn_update_timestamp()                                        |
| `trg_factory_settings_updated_at`     | factory_settings     | BEFORE UPDATE | fn_update_timestamp()                                        |
| `trg_retailer_addresses_updated_at`   | retailer_addresses   | BEFORE UPDATE | fn_update_timestamp()                                        |
| `trg_conversations_updated_at`        | conversations        | BEFORE UPDATE | fn_update_timestamp()                                        |
| `fn_update_conversation_last_message` | messages             | AFTER INSERT  | Atualiza conversations.last_message_at com created_at da msg |
| `fn_generate_order_number`            | orders               | BEFORE INSERT | Gera order_number MOB-YYYY-NNNNN via sequence                |

### fn_update_conversation_last_message (SECURITY DEFINER)

```sql
-- Motivo do SECURITY DEFINER: precisa atualizar conversations sem RLS do usuário
-- (o trigger roda no contexto do INSERT em messages, mas conversations pode ter
-- RLS que bloqueia update pelo trigger).
-- SET search_path = public: segurança contra search_path hijacking.
```

### fn_generate_order_number (SECURITY DEFINER)

```sql
-- Motivo do SECURITY DEFINER: precisa chamar nextval() e modificar NEW.order_number
-- independente do contexto RLS do usuário.
-- SET search_path = public: segurança contra search_path hijacking.
-- Trade-off: gaps no sequence são possíveis em rollback (idiomático Postgres).
```

## Índices — Sprint 4

```sql
-- authorized_retailers: RLS por factory_id/retailer_id, filtro por status
CREATE INDEX idx_authorized_retailers_factory_id ON authorized_retailers (factory_id);
CREATE INDEX idx_authorized_retailers_retailer_id ON authorized_retailers (retailer_id);
CREATE INDEX idx_authorized_retailers_status ON authorized_retailers (status);
CREATE INDEX idx_authorized_retailers_authorized_by ON authorized_retailers (authorized_by);

-- factory_invitations: RLS por factory_id, lookup por token, filtro por status
CREATE INDEX idx_factory_invitations_factory_id ON factory_invitations (factory_id);
CREATE INDEX idx_factory_invitations_status ON factory_invitations (status);
CREATE INDEX idx_factory_invitations_invited_by ON factory_invitations (invited_by);
CREATE INDEX idx_factory_invitations_retailer_email ON factory_invitations (retailer_email);
-- token já tem UNIQUE index

-- factory_settings: PK (factory_id) já é índice

-- retailer_addresses: RLS por retailer_id, join por region_id
CREATE INDEX idx_retailer_addresses_retailer_id ON retailer_addresses (retailer_id);
CREATE INDEX idx_retailer_addresses_region_id ON retailer_addresses (region_id);
CREATE INDEX idx_retailer_addresses_is_default ON retailer_addresses (is_default);

-- conversations: RLS por factory_id/retailer_id, ordenação por last_message_at
CREATE INDEX idx_conversations_factory_id ON conversations (factory_id);
CREATE INDEX idx_conversations_retailer_id ON conversations (retailer_id);
CREATE INDEX idx_conversations_status ON conversations (status);
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);

-- messages: RLS via conversation_id JOIN, paginação por created_at
CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_sender_user_id ON messages (sender_user_id);
CREATE INDEX idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_is_read ON messages (is_read);

-- orders: lookup por order_number
CREATE INDEX idx_orders_order_number ON orders (order_number);
```

## Seed Data — Sprint 4

```sql
INSERT INTO plans (name, slug, type, price_cents, currency, features, is_active) VALUES
  ('Atelier Free', 'atelier-free', 'atelier', 0, 'BRL',
   '{"catalogo_basico": true, "max_colecoes": 1, "linesheets": false, "showrooms": false, "analytics": false, "max_produtos": 50}', true),
  ('Atelier Pro', 'atelier-pro', 'atelier', 14900, 'BRL',
   '{"catalogo_basico": true, "max_colecoes": null, "linesheets": true, "showrooms": true, "analytics": true, "max_produtos": null}', true),
  ('Atelier Business', 'atelier-business', 'atelier', 29900, 'BRL',
   '{"catalogo_basico": true, "max_colecoes": null, "linesheets": true, "showrooms": true, "analytics": true, "max_produtos": null, "api_access": true, "priority_support": true}', true),
  ('Lojista Free', 'lojista-free', 'lojista', 0, 'BRL',
   '{"discover": true, "favoritos": true, "max_boards": 1, "quotes": false, "analytics": false}', true),
  ('Lojista Plus', 'lojista-plus', 'lojista', 9900, 'BRL',
   '{"discover": true, "favoritos": true, "max_boards": null, "quotes": true, "analytics": true, "prioridade_showroom": true}', true)
ON CONFLICT (slug) DO NOTHING;
```

## Decisões — Sprint 4

| Decisão                                                      | Alternativa descartada            | Motivo                                                                                                        |
| ------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| factory_invitations separada de invites                      | Reusar invites com novo tipo      | Domínios distintos: invites = team members, factory_invitations = autorização comercial factory→retailer      |
| Sequence para order_number (com gaps)                        | UUID ou geração gap-free          | Sequences são atômicas e performáticas; gaps são aceitáveis em numeração de pedidos; gap-free exige locks     |
| terms_snapshot JSONB em factory_invitations                  | FK para factory_settings          | Snapshot congela as condições no momento do convite; se settings mudar depois, o convite reflete o original   |
| retailer_addresses separada de addresses                     | Reusar addresses com novos campos | addresses é polimórfico (sede factory/retailer); retailer_addresses é exclusivo shipping com campos distintos |
| factory_settings com JSONB (payment_terms, shipping_policy)  | Colunas fixas por campo           | Política comercial varia muito entre fábricas; JSONB dá flexibilidade sem migrations por campo novo           |
| Conversation unique par (factory_id, retailer_id)            | Múltiplas conversas por par       | Simplifica UX e evita fragmentação; Sprint 8 pode expandir para threads                                       |
| RLS em factory_settings para authorized retailers            | Apenas factory vê                 | Retailer precisa ver política de pagamento/frete antes de fazer pedido                                        |
| Plans seed com features JSONB booleano + limites numéricos   | Tabela plan_features normalizada  | JSONB mais flexível para MVP; null = ilimitado é convenção simples                                            |
| Single global sequence (order_number_seq) em vez de per-year | Sequence por ano com reset        | Simplicidade; o ano já consta no formato MOB-YYYY-NNNNN; sequence global evita race conditions de criação     |
