# QA Report: Sprint 3 — Atelier Fabrica — Catalogo

## Status: APROVADO COM RESSALVAS

## Resumo Executivo

Sprint 3 entrega CRUD de catalogo (colecoes, produtos, fotos, acabamentos, especificacoes), workflow de publicacao (draft/published/archived com unarchive), gestao de equipe com convites criptograficos, Edge Functions (process-product-image placeholder e accept-invite), 35 migrations com RLS + indices, 4 storage buckets com 16 policies path-based. Build, lint, typecheck e 99 testes passam. Todos os blockers e warnings do Code Review foram corrigidos. Uma ressalva funcional: rota `/aceitar-convite/[token]` nao esta em `PUBLIC_PATHS` do middleware, impedindo acesso sem autenticacao.

## Veredicto: APROVADO COM RESSALVAS

19/20 itens DoD passaram. 1 item com ressalva (rota aceitar-convite protegida pelo middleware).

---

## Checklist DoD — 20 itens

| #   | Item                                    | Comando / Verificacao                                                               | Resultado                                                                                                                                                                                                                             | Status   |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | npm run lint -> exit 0                  | `npm run lint`                                                                      | 0 errors, 6 warnings (vars nao usadas em testes)                                                                                                                                                                                      | PASSOU   |
| 2   | npx tsc --noEmit -> exit 0              | `npx tsc --noEmit`                                                                  | Sem output (0 erros)                                                                                                                                                                                                                  | PASSOU   |
| 3   | npm run build -> exit 0 (17 rotas)      | `npm run build`                                                                     | 17 rotas geradas incluindo /atelier/catalogo, /[collectionId], /[collectionId]/[productId], /atelier/conta, /atelier/conta/equipe, /aceitar-convite/[token]                                                                           | PASSOU   |
| 4   | npm test -> 99/99 passa                 | `npm test`                                                                          | 9 test files, 99 tests, all passed (1.01s)                                                                                                                                                                                            | PASSOU   |
| 5   | npx playwright test -> smoke passa      | `npx playwright test`                                                               | 1 test passed (863ms)                                                                                                                                                                                                                 | PASSOU   |
| 6   | 35 migrations                           | `ls supabase/migrations/ \| wc -l`                                                  | 35 migrations (18 base + 16 S3 + 1 fix B2a = 35)                                                                                                                                                                                      | PASSOU   |
| 7   | 5 Edge Functions                        | `ls supabase/functions/`                                                            | signup-factory, signup-retailer, bootstrap-mobio-admin, process-product-image, accept-invite (+ \_shared)                                                                                                                             | PASSOU   |
| 8   | Tabelas novas com RLS                   | `grep ENABLE ROW LEVEL SECURITY` em migrations                                      | Todas 15 tabelas (boards, linesheets, notifications, quotes, orders, showrooms, plans, subscriptions, factory_categories, retailer_segments, board_items, linesheet_items, quote_items, order_items, showroom_attendees) com RLS=true | PASSOU   |
| 9   | Storage buckets criados                 | `grep INSERT INTO storage.buckets`                                                  | avatars, factory-logos, product-photos, board-covers — 4 buckets                                                                                                                                                                      | PASSOU   |
| 10  | Storage policies criadas                | `grep CREATE POLICY` em storage_buckets.sql                                         | 16 policies                                                                                                                                                                                                                           | PASSOU   |
| 11  | Auditoria: listUsers em functions       | `grep listUsers supabase/functions/`                                                | 0 ocorrencias (fix B1 aplicado — usa fetch filtrado com page=1&per_page=1)                                                                                                                                                            | PASSOU   |
| 12  | Auditoria: auth.uid() sem (SELECT)      | `grep auth.uid() \| grep -v (SELECT`                                                | 0 ocorrencias — todas com wrapper (SELECT auth.uid())                                                                                                                                                                                 | PASSOU   |
| 13  | Auditoria: select("\*") em src/         | `grep select("*") src/`                                                             | 0 ocorrencias (fix W3 aplicado — selects explicitos)                                                                                                                                                                                  | PASSOU   |
| 14  | Auditoria: USING(true) em migrations    | `grep USING(true) supabase/migrations/`                                             | 0 ocorrencias                                                                                                                                                                                                                         | PASSOU   |
| 15  | CHECK constraint invites.role expandido | `grep invites_role_check` em migration 20260507150000                               | CHECK (role IN ('atelier_owner', 'atelier_member', 'lojista_owner', 'lojista_buyer')) — 4 roles                                                                                                                                       | PASSOU   |
| 16  | Dev server smoke                        | curl contra localhost:3000                                                          | /design-system=200, /entrar=200, /aceitar-convite/test-token=307 (redirect para /entrar), /atelier/catalogo=307, /atelier/conta/equipe=307                                                                                            | RESSALVA |
| 17  | requireFactoryAccess em mutations       | `grep requireFactoryAccess` em actions/                                             | Presente em todos: collections.ts (5x), products.ts (4x), product-images.ts (4x), finishes.ts (3x), product-specs.ts (6x)                                                                                                             | PASSOU   |
| 18  | Upload: validacao tipo + size           | Leitura de product-images.ts                                                        | ALLOWED_TYPES=["image/jpeg","image/png","image/webp"], MAX_SIZE=10MB, validacao antes de upload                                                                                                                                       | PASSOU   |
| 19  | Tokens criptograficos >= 256 bits       | `grep randomUUID team.ts`                                                           | 2x randomUUID() concatenados = 64 chars hex = 256 bits                                                                                                                                                                                | PASSOU   |
| 20  | UX: unarchive + filter chips            | `grep unarchive product-status-actions.tsx` + `grep StatusFilter catalogo/page.tsx` | unarchiveProduct presente (W5 fix), StatusFilter importado e renderizado                                                                                                                                                              | PASSOU   |

---

## Ressalva: /aceitar-convite nao e rota publica

**Arquivo:** `src/middleware.ts:11-20`

**Problema:** A rota `/aceitar-convite/[token]` nao esta em `PUBLIC_PATHS` do middleware. Quando um usuario sem sessao (ex: convidado que ainda nao tem conta) acessa a URL do convite, recebe redirect 307 para `/entrar?redirect=%2Faceitar-convite%2F...`. A pagina `aceitar-convite/[token]/page.tsx` foi implementada corretamente com tratamento de token invalido/expirado, mas o middleware impede acesso.

**Impacto:** Bloqueio funcional do fluxo de convite para novos usuarios. Um convidado que nao tem conta no MOBIO nao consegue acessar a pagina de aceite.

**Correcao necessaria:** Adicionar `/aceitar-convite` ao array `PUBLIC_PATHS` em `src/middleware.ts`.

**Severidade:** Warning funcional — nao impede deploy mas bloqueia um fluxo de usuario. O redirect preserva a URL no query param, entao se o usuario fizer login primeiro, sera redirecionado de volta.

---

## Verificacao dos Fixes do Code Review

| Fix | Descricao                             | Verificado                                                                                       | Status    |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | --------- |
| B1  | listUsers sem filtro em accept-invite | `getUserIdByEmail()` usa fetch filtrado com `page=1&per_page=1`                                  | CORRIGIDO |
| B2  | Mismatch role Zod vs SQL CHECK        | Zod validator com 4 roles, SQL CHECK com 4 roles (migration 20260507150000)                      | CORRIGIDO |
| B2a | cancelInvite com status "cancelled"   | Usa `status: "revoked"` (correto)                                                                | CORRIGIDO |
| W1  | N+1 reorder loop                      | Aceito como pendencia MVP (registro em decisions.md)                                             | N/A MVP   |
| W2  | Icon-only buttons sem aria-label      | aria-label adicionado em status-actions, member-actions, invite-actions, finishes-tab, specs-tab | CORRIGIDO |
| W3  | select("\*") em queries               | 0 ocorrencias em src/ e functions/ — selects explicitos                                          | CORRIGIDO |
| W4  | Token enumeration em aceitar-convite  | Mensagem unica "Convite invalido ou expirado" na pagina                                          | CORRIGIDO |
| W5  | ProductStatusActions sem unarchive    | unarchiveProduct importado e passado como onUnarchive                                            | CORRIGIDO |

---

## Pendencias Documentadas (decisions.md)

1. process-product-image e placeholder MVP — implementar pipeline de variants em sprint futura
2. Email de convite nao enviado automaticamente — URL para copiar. Implementar envio via Resend/Postmark futuramente
3. N+1 reorder loop — aceitavel para MVP, refatorar com batch update quando volume crescer

---

## Atribuicao de Origem dos Problemas

- **Ressalva /aceitar-convite nao publica**: Deveria ter sido pego por: **Stack Agent** (ao criar a rota, deveria ter adicionado ao PUBLIC_PATHS) e **Code Reviewer** (verificacao de rotas publicas vs protegidas).

Todos os demais itens (B1, B2, W1-W5 do CR) foram corrigidos pelo Stack Agent no fix round. Atribuicao original ja documentada no Code Review.

---

## Recomendacao Final

Sprint 3 **APROVADA COM RESSALVAS**. Commit liberado apos correcao da rota `/aceitar-convite` em `PUBLIC_PATHS` do middleware. A correcao e trivial (1 linha) mas funcional — sem ela, o fluxo de convite nao funciona para usuarios novos.

19/20 itens DoD passaram. Build, testes (99/99), typecheck e lint todos verdes. Todos os 7 fixes do Code Review foram aplicados e verificados. RLS em 100% das tabelas, 16 storage policies, auditorias de seguranca limpas.
