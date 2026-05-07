# Code Review: Sprint 1 — Schema Base + Auth + RBAC

## Status: APROVADO COM RESSALVAS

**Revisor:** Code Reviewer Agent
**Data:** 2026-05-07
**Branch:** `feat/s1-schema-auth-rbac`
**Escopo:** 17 migrations, 3 edge functions, middleware, permissions, 3 paginas auth, callback, types, validators

---

## Resumo Executivo

A Sprint 1 implementa o schema multi-tenant completo (14 tabelas), Auth Hook para JWT custom claims, 3 Edge Functions de signup/bootstrap, middleware de roteamento por role, helpers de RBAC e paginas de auth com Magic Link. A implementacao segue fielmente a arquitetura definida (ADR-003) e corrigiu os 3 warnings do Security Review (W1: is_active no profiles_select_team, W2: WITH CHECK em factories/retailers update, W3: ON DELETE RESTRICT em team_members). A qualidade geral e alta. Ha 2 blockers de performance/seguranca nas Edge Functions e 4 warnings que devem ser corrigidos antes de avancar.

---

## Verificacao por Area

### A. Migrations (17 arquivos) — ✅

- **Idempotencia:** Extensions usam `IF NOT EXISTS`. Functions usam `CREATE OR REPLACE`. Tabelas usam `CREATE TABLE` simples (ok para migrations versionadas — cada migration roda exatamente 1 vez pelo Supabase CLI).
- **RLS:** 14/14 tabelas com `ENABLE ROW LEVEL SECURITY`.
- **Wrapper `(SELECT auth.uid())`:** 60+ ocorrencias, todas com wrapper. 0 violacoes.
- **`USING(true)` em DELETE:** 0 ocorrencias em DELETE. Apenas em SELECT de lookup tables (regions, categories) — correto.
- **SECURITY DEFINER + search_path:** `fn_update_timestamp` tem `SET search_path = public` (nao e DEFINER — correto). `custom_access_token_hook` tem `SECURITY DEFINER SET search_path = public` — correto.
- **GRANT/REVOKE Auth Hook:** `GRANT EXECUTE` para `supabase_auth_admin`, `REVOKE` para `authenticated`, `anon`, `public` — correto.
- **W1 corrigido:** `profiles_select_team` (migration 0017, linhas 120-133) inclui `tm1.is_active = true AND tm2.is_active = true`.
- **W2 corrigido:** `factories_update_owner` e `retailers_update_owner` (migration 0017, linhas 80-114) incluem `WITH CHECK` que impede alteracao de `id`, `created_by`, `created_at`.
- **W3 corrigido:** `team_members.factory_id` e `team_members.retailer_id` usam `ON DELETE RESTRICT` em vez de CASCADE (migration 0008, linhas 12-13), com comentario explicativo.
- **Indices:** Todas as colunas usadas em policies possuem indice na mesma migration.
- **Triggers:** 13 triggers de `updated_at` para todas as tabelas exceto `favorites` (que nao tem `updated_at` — correto, e imutavel).
- **Constraints:** `chk_tenant_xor`, `chk_address_owner`, `chk_invite_tenant`, `chk_favorite_target` — todos presentes e corretos.
- **Auth Hook:** Logica idempotente, valida `active_tenant_id` contra roles ativos, reseta para primeiro membership se invalido.
- **Sem ALTER TABLE com risco em prod:** Nenhuma migration altera tabelas existentes (schema novo).

### B. Edge Functions — ⚠️ (2 blockers + 1 warning)

- **service_role:** Usado apenas server-side via `createAdminClient()` — correto, nao exposto ao client.
- **Validacao Zod:** Todas as 3 functions validam input com Zod.
- **Tratamento OPTIONS:** `handleCors()` trata preflight em todas.
- **Deps Deno:** `zod@3.24.4` e `@supabase/supabase-js@2.49.4` com versao fixa — correto.
- **Sem leak de info:** Resposta identica para email existente vs novo (SAFE_RESPONSE) — correto.
- **bootstrap-mobio-admin:** Idempotente (verifica admin existente antes de criar, trata `already been registered`).
- **Problemas encontrados:** Ver secao de Issues abaixo.

### C. Auth + RBAC — ✅

**middleware.ts:**

- Rotas publicas reconhecidas: `/`, `/entrar`, `/cadastro/fabrica`, `/cadastro/lojista`, `/auth/callback`, `/api/health`.
- Static assets nao bloqueiam middleware (regex + startsWith `/_next`, `/_vercel`, `favicon.ico`).
- Sem bypass de auth: rotas nao publicas redirecionam para `/entrar` sem sessao.
- `resolveShell` + `ROLE_PATH_PREFIXES` funcionam: role determina shell, paths verificados.
- Env vars ausentes: 500 em rota protegida, passthrough em publica — correto.
- Usuarios autenticados em rotas publicas sao redirecionados para shell home — boa UX.

**permissions.ts:**

- Type safety: `Role` union, `AppMetadata` com campos tipados.
- `hasRole`, `isAdmin`, `canAccessTenant`, `isTenantOwner` — logica correta, usando optional chaining.
- `resolveShell` idempotente: mesmo input = mesmo output.
- `ROLE_PATH_PREFIXES`: admin tem acesso a `/admin`, `/atelier`, `/lojista` — correto conforme ADR-003.

**supabase/client.ts, server.ts, middleware.ts:**

- Separacao server/client: `createBrowserClient` no client, `createServerClient` com cookies no server.
- `server.ts` usa `await cookies()` (Next.js 15+ breaking change — correto).
- `middleware.ts` usa `supabase.auth.getUser()` (nao `getSession()`) — correto e seguro.
- Non-null assertion `!` em env vars: aceitavel — middleware ja verifica antes de criar client.

### D. Paginas de Auth — ✅

- `/entrar`: Form com Zod, Magic Link via `signInWithOtp`, mensagem safe ("Se o email for valido..."), estado `sent` com botao "Enviar novamente".
- `/cadastro/fabrica`: Validacao Zod completa (email, factory_name, cnpj, region_id, categories, responsible_name), invocacao via `supabase.functions.invoke("signup-factory")`, carrega regions/categories via useEffect.
- `/cadastro/lojista`: Mesma estrutura, invoca `signup-retailer`, carrega regions/categories.
- `/auth/callback`: `exchangeCodeForSession` + `getUser` + `resolveShell` + redirect para shell home. Fallback para `/entrar` se erro ou sem shell.
- Toaster (sonner) configurado no root layout.
- UI em pt-BR consistente: labels, placeholders, mensagens de erro.
- Acessibilidade: `<Label htmlFor>` + `<Input id>`, `aria-invalid` nos inputs com erro. Sem `<div onClick>`.

### E. Types (database.ts) — ✅

- Gerado via `supabase gen types typescript`.
- Cobre todas as 14 tabelas + `custom_access_token_hook` function.
- Sem edicao manual — safe para regeneracao futura.

### F. Conventions — ✅

- Path alias `@/` usado consistentemente.
- `cn()` disponivel em `lib/utils.ts` (nao usado extensivamente nesta sprint — esperado, poucos componentes visuais).
- TypeScript strict: 0 ocorrencias de `any` no src/.
- Comentarios minimos — apenas explicacoes necessarias nas migrations e TODOs documentados.
- Naming: codigo em ingles, UI em pt-BR.
- `service_role` / `SERVICE_ROLE`: 0 ocorrencias em `src/` — correto, nao exposto ao client.

### G. Build / Lint / Test — (Leitura do codigo, nao execucao)

> **Nota:** Como Code Reviewer agent em contexto de time, a execucao real de build/lint/test sera feita pelo QA na task #5. A leitura do codigo nao identificou nenhum problema que impediria compilacao.

- Todas as importacoes resolvem para arquivos existentes.
- Tipos consistentes entre migrations, database.ts e codigo TypeScript.
- Nenhum import circular detectado.

### H. Pendencias documentadas (decisions.md) — ✅

- Acoes manuais Supabase Dashboard documentadas: Auth Hook + BOOTSTRAP_SECRET + SITE_URL.
- Schema gaps (cnpj, categories, segments) documentados como divida tecnica aceita.
- `.env` vs `.env.example` documentado.

---

## Pontos Positivos

1. **Correcao completa dos warnings do Security Review (W1, W2, W3)** — todos os 3 warnings foram endereçados com solucoes corretas, incluindo comentarios explicativos no W3 (ON DELETE RESTRICT).
2. **Auth Hook robusto e idempotente** — `custom_access_token_hook` valida active_tenant_id contra roles ativos, reseta graciosamente, e tem GRANT/REVOKE corretos.
3. **Separacao exemplar de responsabilidades** — middleware (routing), permissions.ts (logica RBAC), server.ts/client.ts/middleware.ts (Supabase clients), validators/ (schemas Zod), Edge Functions (signup com service_role isolado).
4. **Mensagens safe em todo o fluxo de auth** — nenhum endpoint ou pagina revela se um email existe ou nao.
5. **RLS com cobertura completa** — 14 tabelas, 58+ policies, wrapper `(SELECT auth.uid())` em 100% das ocorrencias, indices em todas as colunas de policy.

---

## Issues

### Blockers (deve corrigir)

**B1. `listUsers()` sem filtro nas Edge Functions de signup — performance e escalabilidade**

- **Arquivo:** `supabase/functions/signup-factory/index.ts:54-55`
- **Arquivo:** `supabase/functions/signup-retailer/index.ts:51-52`
- **Descricao:** `supabase.auth.admin.listUsers()` retorna TODOS os usuarios do projeto sem paginacao. Com 1.000+ usuarios, essa chamada fica lenta e consome memoria. Com 10.000+, pode causar timeout na Edge Function (limite 30s).
- **Impacto:** Performance degradante, potencial timeout em producao.
- **Recomendacao:** Substituir por `supabase.auth.admin.listUsers({ filter: email })` ou, melhor, tentar `createUser` diretamente e tratar o erro `"already been registered"` como idempotencia (similar ao que `bootstrap-mobio-admin` ja faz na linha 87).

**B2. CNPJ logado em console.info na signup-factory**

- **Arquivo:** `supabase/functions/signup-factory/index.ts:141`
- **Descricao:** `console.info("Signup factory: cnpj and categories received but not persisted (schema pending):", { cnpj, categories })` loga o CNPJ do usuario nos logs da Edge Function. CNPJ e dado sensivel (documento fiscal). Logs do Supabase sao acessiveis no Dashboard e podem ser retidos.
- **Impacto:** Vazamento de dado sensivel em logs.
- **Recomendacao:** Remover o log do CNPJ. Se necessario rastrear que campos foram recebidos, logar apenas `"cnpj and categories received but not persisted (schema pending)"` sem os valores.

### Warnings (deveria corrigir)

**W1. Mismatch entre frontend validator e Edge Function para signup-retailer: campo `cnpj`**

- **Arquivo (frontend):** `src/lib/validators/auth.ts:31` — `signupRetailerSchema` inclui `cnpj` como campo obrigatorio.
- **Arquivo (frontend):** `src/app/(auth)/cadastro/lojista/page.tsx:152-163` — UI coleta CNPJ do lojista.
- **Arquivo (edge function):** `supabase/functions/signup-retailer/index.ts:5-12` — `signupRetailerSchema` NAO inclui `cnpj`.
- **Descricao:** O frontend coleta e valida CNPJ para lojistas, mas a Edge Function ignora silenciosamente esse campo (Zod strip por padrao). O usuario preenche CNPJ achando que foi registrado, mas o dado e descartado.
- **Impacto:** UX enganosa — usuario acredita que CNPJ foi salvo.
- **Recomendacao:** Ou (a) adicionar `cnpj` ao schema Zod da edge function e logar como TODO (sem valor, como recomendado no B2), ou (b) remover o campo CNPJ do formulario de lojista ate o schema suportar. Opcao (a) e preferivel para manter consistencia.

**W2. Formulario de signup nao desabilita botao apos double click durante submit**

- **Arquivo:** `src/app/(auth)/cadastro/fabrica/page.tsx:249`
- **Arquivo:** `src/app/(auth)/cadastro/lojista/page.tsx:248`
- **Descricao:** O botao de submit usa `disabled={pending}`, que funciona. Porem, `setPending(true)` esta dentro de `onSubmit` — se o usuario clicar duas vezes rapidamente antes do primeiro render, pode disparar duas invocacoes. O `handleSubmit` do react-hook-form previne submissoes durante validacao, mas nao durante a execucao da funcao async.
- **Impacto:** Risco baixo de dupla invocacao da Edge Function. A idempotencia da Edge Function mitiga parcialmente (retorna SAFE_RESPONSE se email ja existe).
- **Recomendacao:** Mover o `disabled` para tambem considerar `formState.isSubmitting` ou adicionar um `useRef` de debounce.

**W3. `addresses_update_factory` e `addresses_update_retailer` sem WITH CHECK**

- **Arquivo:** `supabase/migrations/20260507120008_addresses.sql:76-97`
- **Descricao:** Policies de UPDATE em addresses tem `USING` mas nao `WITH CHECK`. Sem WITH CHECK explicito, Postgres usa USING como fallback — funcional, mas um owner poderia teoricamente mover um endereco de uma factory para outra alterando `factory_id`.
- **Impacto:** Tampering — owner poderia alterar `factory_id`/`retailer_id` do endereco.
- **Recomendacao:** Adicionar `WITH CHECK` que garanta que `factory_id`/`retailer_id` nao pode ser alterado (similar ao WITH CHECK em factories/retailers update).

**W4. Edge Function `signup-factory` e `signup-retailer` nao validam `region_id` contra tabela**

- **Arquivo:** `supabase/functions/signup-factory/index.ts:50-51`
- **Arquivo:** `supabase/functions/signup-retailer/index.ts:47-48`
- **Descricao:** O Zod valida que `region_id` e um UUID valido, mas nao verifica se o UUID existe na tabela `regions`. Se o usuario enviar um UUID inventado, a FK constraint do Postgres rejeita o INSERT de factory/retailer, mas o usuario ja foi criado (auth + profile + sem factory). Isso deixa um usuario orfao.
- **Impacto:** Inconsistencia de dados — usuario criado sem tenant associado.
- **Recomendacao:** Validar existencia de `region_id` na tabela antes de criar o usuario, ou usar transacao (as Edge Functions nao usam transaction, entao o rollback manual seria necessario).

### Suggestions (poderia melhorar)

**S1. `factories_select_active` e `retailers_select_active` — nao exigem autenticacao**

- **Arquivo:** `supabase/migrations/20260507120004_factories.sql:24-25` e `20260507120005_retailers.sql:22-23`
- **Descricao:** As policies de SELECT em factories/retailers usam `USING (is_active = true)` sem verificar `auth.uid()`. Qualquer usuario anonimo com a anon key pode listar factories/retailers ativas.
- **Impacto:** Baixo — a anon key ja e publica e as factories ativas sao parte do catalogo. Mas se o negocio quiser restringir o catalogo a usuarios autenticados, precisa de policy mais restritiva.
- **Nota:** O Data Architecture doc diz "Autenticados (ativas)" na tabela de RLS, mas a implementacao permite anonimos. Se intencional (SEO, landing page), documentar. Se nao, adicionar `AND auth.uid() IS NOT NULL`.

**S2. Seed data nao executado nas migrations**

- **Descricao:** O Data Architecture doc define seed de regions (27 estados) e categories (4 categorias base), mas nao ha migration de seed. Os formularios de cadastro carregam regions/categories e mostram listas vazias se o seed nao foi executado.
- **Recomendacao:** Criar migration de seed ou script `supabase/seed.sql`.

**S3. `auth/callback/route.ts` — logica redundante para admin na linha 55**

- **Arquivo:** `src/app/auth/callback/route.ts:54-56`
- **Descricao:** `resolveShell(metadata)` ja retorna `"admin"` quando `active_role === "admin"`. O bloco extra (linhas 54-56) que verifica admin e redundante — se `resolveShell` retornar null, o admin tambem nao teria `active_role` definido, entao o check manual com `metadata?.roles?.some` cobre um edge case muito especifico (admin sem `active_role` no JWT mas com role no array).
- **Recomendacao:** Manter por seguranca (defense in depth para admin), mas adicionar comentario explicando o edge case.

---

## Compliance (codigo segue os docs?)

### Design & UI

- [x] Tokens design respeitados (Tailwind CSS variables, cores do tema)
- [x] Mobile-first (min-h-dvh, max-w-md, responsive padding)
- [x] Acessibilidade basica (Label+htmlFor, aria-invalid, buttons semanticos)
- [x] UI em pt-BR

### Arquitetura

- [x] Estrutura de pastas conforme Architecture doc
- [x] Server/Client components corretos ("use client" apenas onde necessario)
- [x] Path alias @/ consistente
- [x] Supabase clients separados (client.ts, server.ts, middleware.ts)
- [x] Middleware verifica `getUser()` (nao `getSession()`)

### Banco de Dados

- [x] RLS habilitado em 14/14 tabelas
- [x] Nomenclatura snake_case, tabelas plural
- [x] ON DELETE correto (RESTRICT, CASCADE, SET NULL conforme contexto)
- [x] Indices em colunas de policy
- [x] Triggers updated_at em 13/13 tabelas (favorites excluida — imutavel)
- [x] Auth Hook com SECURITY DEFINER + search_path + GRANT/REVOKE

### Seguranca

- [x] Wrapper `(SELECT auth.uid())` em 100% das policies
- [x] 0 ocorrencias de DELETE USING(true) em tabelas com dados
- [x] service_role: 0 ocorrencias em `src/` (apenas Edge Functions)
- [x] Mensagens safe (sem leak de existencia de email)
- [ ] CNPJ logado em Edge Function (B2)
- [ ] listUsers() sem filtro (B1)

---

## Resumo de Problemas

### Blockers (2)

1. **B1:** `listUsers()` sem filtro nas Edge Functions — performance/escalabilidade
2. **B2:** CNPJ logado em `console.info` — vazamento de dado sensivel

### Warnings (4)

1. **W1:** Mismatch frontend/backend: CNPJ coletado no form de lojista mas ignorado pela Edge Function
2. **W2:** Double submit possivel nos formularios de signup
3. **W3:** `addresses_update` sem WITH CHECK (factory_id/retailer_id pode ser alterado)
4. **W4:** `region_id` nao validado contra tabela antes de criar usuario (risco de usuario orfao)

### Suggestions (3)

1. **S1:** factories/retailers SELECT permite anonimos (doc diz "autenticados")
2. **S2:** Seed data nao executado (regions, categories)
3. **S3:** Logica redundante de admin no callback

---

## Atribuicao de Origem dos Problemas

- **B1 (listUsers sem filtro):** Ninguem — erro de implementacao do Stack Agent. Security Review recomendou idempotencia (secao 6: "verificar se factory/retailer ja existe"), mas nao previu o pattern especifico de listUsers.
- **B2 (CNPJ em log):** Ninguem — erro de implementacao do Stack Agent. Security Review nao cobre logs de Edge Functions (foco era schema/RLS).
- **W1 (mismatch cnpj lojista):** Deveria ter sido pego por: PO/Data Architect — o schema nao inclui cnpj para retailers, mas o formulario coleta. O decisions.md documenta gaps para factory (cnpj, categories) mas nao menciona cnpj para retailer explicitamente.
- **W2 (double submit):** Ninguem — erro de implementacao do Stack Agent.
- **W3 (addresses sem WITH CHECK):** Deveria ter sido pego por: Data Architect — mesmo padrao do W2 do Security Review (factories/retailers sem WITH CHECK) deveria ter sido aplicado tambem em addresses.
- **W4 (region_id nao validado):** Ninguem — erro de implementacao do Stack Agent. A validacao de FK e feita pelo Postgres, mas a sequencia de operacoes nao e transacional.

---

## Recomendacao para QA

Focar os testes em:

1. **Fluxo de signup completo:** Cadastrar factory e retailer, verificar que os dados chegam no banco (profile, team_member, factory/retailer).
2. **Idempotencia:** Tentar cadastrar o mesmo email duas vezes — deve retornar mesma resposta sem duplicar dados.
3. **Magic Link:** Verificar que o link de confirmacao funciona e redireciona para o shell correto.
4. **Middleware de roteamento:** Acessar rotas de atelier com role de lojista (deve redirecionar), acessar rotas protegidas sem autenticacao (deve ir para /entrar).
5. **Auth Hook:** Verificar que o JWT contem `roles`, `active_tenant_id`, `active_role` apos login.
6. **RLS:** Verificar que factory A nao ve dados de factory B.

---

## Veredicto

**Code Review Sprint 1: APROVADO COM RESSALVAS.** 2 blockers + 4 warnings encontrados. O Stack Agent deve corrigir B1, B2, W1, W2, W3 e W4 antes de avancar para QA. As 3 suggestions sao pendencias tecnicas que podem ser tratadas em sprint posterior.
