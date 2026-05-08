# QA Report: Sprint 9 — Analytics + Faturamento + Account Final

## Status: ⚠️ Aprovado com ressalvas

## Validacao Estatica

| Check              | Resultado                                                                       |
| ------------------ | ------------------------------------------------------------------------------- |
| `npx eslint .`     | 0 erros, 36 warnings (pre-existentes de sprints anteriores — nenhum novo da S9) |
| `npx tsc --noEmit` | 0 erros                                                                         |
| `npm run build`    | OK — todas as rotas S9 presentes no output                                      |
| `npm test`         | 483/483 testes passaram (54 suites)                                             |

## Rotas S9 no Build

| Rota                                  | Presente |
| ------------------------------------- | -------- |
| `/lojista/conta/analytics`            | OK       |
| `/lojista/conta/plano`                | OK       |
| `/atelier/financeiro`                 | OK       |
| `/atelier/financeiro/statements/[id]` | OK       |
| `/admin/audit`                        | OK       |
| `/atelier/conta/plano`                | OK       |

## Checklist DoD (18 itens)

| #   | Item                                         | Resultado | Notas                                                                                                                                                                                                                  |
| --- | -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npm run lint` -> exit 0                     | OK        | 0 errors (36 warnings pre-existentes, nenhum novo)                                                                                                                                                                     |
| 2   | `npx tsc --noEmit` -> exit 0                 | OK        | Zero erros                                                                                                                                                                                                             |
| 3   | `npm run build` -> exit 0 + 5 rotas S9       | OK        | 6 rotas S9 confirmadas no build output                                                                                                                                                                                 |
| 4   | `npm test` -> 483/483                        | OK        | 54 suites, 483 testes, 7.59s                                                                                                                                                                                           |
| 5   | `supabase migration list` -> 75 migrations   | OK        | 75 migrations, ultimas 5 sao S9 (190000-190004)                                                                                                                                                                        |
| 6   | `supabase functions list` -> 13 functions    | OK        | 13 functions incluindo export-analytics-csv                                                                                                                                                                            |
| 7   | RPCs S9 SECURITY DEFINER + SET search_path   | OK        | get_factory_analytics, get_retailer_analytics, get_admin_overview, fn_generate_monthly_statements, fn_log_audit — todos com SECURITY DEFINER + SET search_path = public                                                |
| 8   | Audit triggers em 9 tabelas                  | OK        | factories, retailers, team_members, orders, factory_settings, factory_invitations, authorized_retailers, plans, subscriptions                                                                                          |
| 9   | Tabelas novas RLS: statements + audit_logs   | OK        | statements: SELECT factory + admin, INSERT admin, UPDATE admin, sem DELETE. audit_logs: SELECT admin only, sem INSERT/UPDATE/DELETE para clients                                                                       |
| 10  | Auditoria security (6 greps)                 | OK        | service_role em src/: 0. auth.uid() sem SELECT wrapper: apenas em fn_log_audit dentro de SECURITY DEFINER (correto). select("\*"): 0. USING(true): 0. listUsers: 0. console.log token/password: 0                      |
| 11  | Zod UUID grep                                | OK        | statementIdSchema, auditLogIdSchema, edge fn tenant_id — todos z.string().uuid(). Analytics actions usam IDs de requireAccess() (server-side, sem input externo)                                                       |
| 12  | Fixes CR aplicados (W1-W5)                   | OK        | W1: tabIndex+role+onKeyDown em audit-log-row. W2: button no audit-log-filters. W3: React.cache() em salao + lojista/analytics. W4: toast.error em export-csv-button. W5: getUser() antes de getSession() em csv-export |
| 13  | Dev server smoke (5 rotas -> 307)            | OK        | /atelier/salao 307, /atelier/financeiro 307, /lojista/conta/analytics 307, /lojista/conta/plano 307, /admin/audit 307                                                                                                  |
| 14  | CSV export edge fn OPTIONS preflight         | OK        | handleCors retorna Response "ok" com corsHeaders em OPTIONS                                                                                                                                                            |
| 15  | Sidebars atualizadas: admin com Audit Log    | PARCIAL   | Admin sidebar tem "Audit Log" (/admin/audit). Atelier sidebar NAO tem "Financeiro" — ver Falhas                                                                                                                        |
| 16  | ROLE_PATH_PREFIXES cobre /atelier/financeiro | OK        | atelier_owner/member: ["/atelier"] cobre /atelier/financeiro. Admin: ["/admin", "/atelier", "/lojista"]                                                                                                                |
| 17  | Statements RLS (factory_id lookup)           | OK        | Policy statements_select_factory verifica team_members.factory_id = statements.factory_id com (SELECT auth.uid()) wrapper                                                                                              |
| 18  | Audit logs imutavel                          | OK        | Apenas FOR SELECT policy (admin). Zero INSERT/UPDATE/DELETE policies para clients. Writes via fn_log_audit SECURITY DEFINER                                                                                            |

## Falhas Encontradas

### W-QA1: Sidebar atelier sem link para Financeiro (Warning)

**Arquivo:** `src/app/(atelier)/layout.tsx`
**Problema:** ATELIER_NAV tem 8 itens (Salao, Colecoes, Produtos, Linesheet, Pedidos, Lojistas, Mensagens, Configuracoes) mas nao inclui "Financeiro" (`/atelier/financeiro`). A pagina existe e funciona via URL direta, mas o usuario nao tem link de navegacao no sidebar para acessa-la.
**Impacto:** Medio — factory owner precisa saber a URL para acessar o financeiro. Discoverability zero via navegacao.
**Correcao:** Adicionar item `{ number: "09", label: "Financeiro", href: "/atelier/financeiro", icon: Receipt }` no ATELIER_NAV.

## Regressao

Testes de sprints anteriores incluidos no `npm test`: 483/483 passaram. Sprint 9 cria tabelas e actions novos — nao modifica codigo de sprints anteriores.

## Cobertura por DoD

| Criterio DoD                                                              | Testado | Resultado                                                                                                                                                                                           |
| ------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard analytics fabrica com dados reais (GMV, top products, lojistas) | OK      | RPC get_factory_analytics verificada: CTE com filtered_orders, agg, top_products, top_retailers. Membership check. Cache() aplicado na page                                                         |
| Dashboard analytics lojista                                               | OK      | RPC get_retailer_analytics verificada: CTE com filtered_orders, agg, top_factories, top_categories. Membership check. Cache() aplicado na page                                                      |
| Relatorios CSV                                                            | OK      | Edge function export-analytics-csv: Zod validation, JWT getUser(), membership check, 4 export types (orders, statements, analytics_factory, analytics_retailer), CSV escape correto, CORS preflight |

## Pendencias Tecnicas (nao bloqueantes)

Herdadas do Code Review S9 (suggestions):

- S1: TABLE_LABELS duplicado entre admin/page.tsx e audit-log-row.tsx
- S2: Boundary date inconsistencia em getStatement (period_end + 23:59:59)
- S3: Campo `table` em auditLogFiltersSchema aceita qualquer string (poderia ser z.enum)
- S4: Campo `actor_email` no AuditLogDetail recebe full_name (naming inconsistente)
- W-QA1: Sidebar atelier sem link Financeiro (novo — encontrado pelo QA)

## Veredicto

QA Sprint 9 aprovado com ressalvas. 17 de 18 itens do DoD passaram integralmente. 1 item (sidebar) passou parcialmente: admin sidebar OK, atelier sidebar falta link para Financeiro (W-QA1). Todos os 5 fixes do Code Review (W1-W5) verificados e aplicados corretamente. 483/483 testes passando. Build limpo. Seguranca verificada.

**Recomendacao:** Corrigir W-QA1 (adicionar Financeiro ao sidebar atelier) antes de merge. E uma alteracao de 1 linha em `src/app/(atelier)/layout.tsx`.

---

**ATRIBUICAO DE ORIGEM DOS PROBLEMAS:**

- W-QA1 (sidebar atelier sem Financeiro): Deveria ter sido pego por: Code Reviewer (compliance contra DoD item 15 — verificou admin sidebar mas nao verificou atelier sidebar) e Stack Agent (implementou a rota mas nao adicionou ao nav).

Atribuicao consolidada: Sprint 9 entregue com qualidade alta. RPCs, RLS, seguranca e fixes do CR todos corretos. Unico problema novo e um link faltando no sidebar (baixa complexidade, alta visibilidade).
