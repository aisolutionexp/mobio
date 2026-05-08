# Code Review: Sprint 9 — Analytics + Faturamento + Account Final

## Status: ⚠️ Aprovado com ressalvas

## Objetivo do Sprint

Analytics (factory, retailer, admin), Statements mensais (fatura GMV), Audit Logs com triggers genéricos, CSV export, plano lojista.

## Critério de Saída

- [x] Dashboards analytics (factory + retailer + admin) funcionais
- [x] Statements mensais gerados e listados por factory
- [x] Audit logs com triggers em 9 tabelas críticas
- [x] CSV export via Edge Function com membership check
- [x] Plano lojista com troca de plano
- [x] Build + lint + tsc + tests verdes

## Pontos Positivos

- RPCs SECURITY DEFINER com `SET search_path = public` e checks de membership em todas — padrão de segurança exemplar
- Audit log trigger genérico (`fn_log_audit`) é elegante — single function para 9 tabelas, com TG_TABLE_NAME/TG_OP, evita duplicação
- Column selection precisa em todas as queries Supabase (zero `select('*')`)
- Validators zod em todas as boundaries (actions, edge function) — consistente
- CSV escape correto cobrindo vírgulas, aspas e newlines
- Separação clara: actions por domínio, componentes por feature, validators por domínio
- Uso correto de `(SELECT auth.uid())` em todas as policies (wrapper anti-cache)
- Edge Function valida JWT com `getUser()` (não `getSession()`) antes de processar

## Compliance (código segue os docs?)

### Design & UI

- [x] Tokens respeitados (font-heading, text-muted-foreground, size-\*, Plate, Eyebrow)
- [x] Mobile-first (grid-cols-2 → md:grid-cols-4, flex-col → sm:flex-row)
- [x] Estados vazios tratados em todas as listagens (analytics, statements, audit logs)
- [x] Loading states com Skeleton/Suspense em todas as páginas
- [x] Textos UI em pt-BR
- [ ] 🟡 W1: `<tr onClick>` em `audit-log-row.tsx:40` — sem `tabIndex`, `role="button"`, nem `onKeyDown`. Não acessível via teclado
- [ ] 🟡 W2: `<Badge onClick>` em `audit-log-filters.tsx:51` — componente não-interativo com handler de click. Deveria usar `<Button variant="outline">` ou adicionar role/keyboard handling

### Arquitetura

- [x] Estrutura de pastas conforme Architecture (actions/, validators/, components/domain/)
- [x] Server Components para data fetching, Client Components apenas onde necessário (period-selector, export-button, plan-card, audit-table)
- [x] `searchParams` awaited em Next.js 15+ (salao/page.tsx:80, analytics/page.tsx:80, audit/page.tsx:92)
- [x] Server Actions com `"use server"` em todos os action files
- [x] Código em inglês, UI em pt-BR
- [x] Nenhum `any`, nenhum `!` (non-null assertion)
- [x] `as unknown as TopItem[]` nas RPCs — aceitável dado que o retorno de JSON do Postgres não é tipável nativamente

### Banco de Dados

- [x] RLS habilitado em statements e audit_logs
- [x] Nomenclatura correta (snake_case, plural, inglês)
- [x] `(SELECT auth.uid())` wrapper — 10 ocorrências, todas com wrapper
- [x] SECURITY DEFINER + SET search_path em todas as 4 RPCs + fn_log_audit
- [x] ON DELETE CASCADE em statements.factory_id, ON DELETE SET NULL em audit_logs.actor_user_id
- [x] Índices nas colunas de policies (factory_id, period_start, table_name, actor_user_id)
- [x] Constraints CHECK em statements.status e audit_logs.operation
- [x] UNIQUE constraint (factory_id, period_start) em statements
- [x] ON CONFLICT DO NOTHING em fn_generate_monthly_statements (idempotente)
- [x] Triggers em 9 tabelas conforme data-architecture doc
- [x] audit_logs sem INSERT/UPDATE/DELETE policies para clients (imutável)
- [x] statements sem DELETE policy (imutável para registros financeiros)

## Qualidade de Código

### Code Smells

- [x] Sem duplicação significativa entre actions
- [ ] 🟡 W3: Páginas `salao/page.tsx` e `lojista/conta/analytics/page.tsx` chamam a RPC de analytics **duas vezes** — uma para KPIs (linha 36) e outra para TopLists (linha 65). Ambos os components async são Suspense-bounded separadamente, mas fazem a mesma query. A causa é que cada um é um Server Component isolado. Considerar: buscar uma vez na page e passar como prop, ou usar `cache()` do React para deduplicar automaticamente
- [ ] 🟢 S1: `TABLE_LABELS` está duplicado em `admin/page.tsx:101-111` e `admin/audit-log-row.tsx:13-21`. Extrair para shared constant

### Nomes e Legibilidade

- [x] Nomes auto-explicativos (getFactoryAnalytics, listAuditLogs, StatementStatusBadge)
- [x] Sem abreviações desnecessárias
- [x] Consistência entre naming: `get*` para fetches singulares, `list*` para coleções

### Complexidade

- [x] Todos os action files da S9 dentro dos limites (analytics 144L, statements 116L, audit-logs 95L, csv-export 57L, subscriptions-retailer 136L)
- [x] Componentes concisos (kpi-card 24L, top-list 62L, statement-row 47L)
- [x] RPCs SQL são longas mas inevitável dada a natureza de agregação — bem estruturadas com CTEs

### Performance

- [x] Sem queries N+1
- [ ] 🟡 W3 (vide acima): Chamada dupla à mesma RPC por página
- [x] Paginação em audit_logs (page + per_page)
- [x] Statements paginação implícita (factory só vê os seus)
- [x] Índices compostos para range queries (factory_id + created_at)

### React Patterns

- [x] Suspense boundaries em todas as páginas com data fetching
- [x] useTransition em RetailerPlanCard e AuditLogDetailDialog (UX correta)
- [x] Sem mutação direta de estado
- [x] Keys corretas (statement.id, log.id, plan.id, item.name)
- [ ] 🟡 W4: `ExportCsvButton` catch vazio (linha 46) — erro silencioso, nenhum feedback ao usuário. Toast.error deveria ser adicionado
- [x] PeriodSelector usa useCallback com deps corretas

### Acoplamento

- [x] Actions não importam React
- [x] Componentes não acessam Supabase diretamente — tudo via actions
- [x] Validators separados dos actions

## Segurança

- [x] RLS habilitado em todas as tabelas novas (statements, audit_logs)
- [x] service_role_key — zero ocorrências em /src (exceto admin.ts que é server-only e pré-existente)
- [x] Validação Zod server-side em todos os actions com input externo
- [x] Edge Function valida JWT com `getUser()` (linha 73-75) — correto
- [x] Edge Function verifica membership antes de exportar (linha 90-97) — sem leak cross-tenant
- [x] audit_logs imutável (sem policies de escrita para clients)
- [x] RPCs verificam ownership/membership antes de retornar dados
- [x] `USING(true)` — zero ocorrências nas 5 migrations
- [x] Console.log de tokens/passwords — zero ocorrências em edge functions
- [ ] 🟡 W5: `csv-export.ts:14` usa `getSession()` para obter o access token. O CLAUDE.md do projeto diz "Sessão verificada via `getUser()` (nunca `getSession()`)". Neste caso, o propósito é obter o JWT para o header Authorization (não para verificar identidade), mas o padrão do projeto deveria ser seguido. `getSession()` pode retornar token de cache não-verificado. Alternativa: extrair token de `getUser()` ou do cookie diretamente

### Double Submit

- [x] RetailerPlanCard desabilita botão durante transition (`disabled={isPending}`)
- [x] ExportCsvButton desabilita durante loading (`disabled={loading}`)

## Regressão

Regressão não aplicável — Sprint 9 cria tabelas e actions novos. Não modifica código de sprints anteriores.

## Auditoria Numérica de Segurança

| Grep                                                  | Resultado      |
| ----------------------------------------------------- | -------------- |
| `service_role` em src/ (exceto admin.ts)              | 0 matches      |
| `auth.uid()` sem `(SELECT)` wrapper nas 5 migrations  | 0 matches (\*) |
| `select("*")` em src/                                 | 0 matches      |
| `USING(true)` nas 5 migrations                        | 0 matches      |
| `console.log.*token\|password` em supabase/functions/ | 0 matches      |

(\*) `fn_log_audit` usa `auth.uid()` direto na linha de INSERT (migration 190004, linha 29), mas está **dentro de SECURITY DEFINER** como valor de coluna, não em policy — correto e esperado.

## Resumo de Problemas

### 🔴 Blockers (deve corrigir)

Nenhum.

### 🟡 Warnings (deveria corrigir)

1. **W1**: `<tr onClick>` em `src/components/domain/admin/audit-log-row.tsx:40` sem acessibilidade de teclado — adicionar `tabIndex={0}`, `role="button"`, `onKeyDown` para Enter/Space
2. **W2**: `<Badge onClick>` em `src/components/domain/admin/audit-log-filters.tsx:51` — usar `<Button>` ou adicionar role/keyboard
3. **W3**: Chamada dupla à mesma RPC em `src/app/(atelier)/atelier/salao/page.tsx` (linhas 36 + 65) e `src/app/(lojista)/lojista/conta/analytics/page.tsx` (linhas 34 + 65) — buscar uma vez ou usar `cache()` do React
4. **W4**: `catch {}` vazio em `src/components/domain/financeiro/export-csv-button.tsx:46` — erro silencioso, adicionar `toast.error()`
5. **W5**: `getSession()` em `src/lib/actions/csv-export.ts:14` — usar `getUser()` para seguir padrão do projeto. Nota: `getSession()` já era usado em admin-retailers.ts e factory-invitations.ts (pré-existentes), mas para novos actions deve seguir o padrão

### 🟢 Suggestions (poderia melhorar)

1. **S1**: `TABLE_LABELS` duplicado entre `src/app/(admin)/admin/page.tsx:101` e `src/components/domain/admin/audit-log-row.tsx:13` — extrair para constante shared
2. **S2**: `getStatement` em `src/lib/actions/statements.ts:95` usa `.lt("updated_at", "${period_end}T23:59:59.999")` — como `period_end` já é o primeiro dia do mês seguinte (vide RPC), o filtro correto seria `.lt("updated_at", "${period_end}T00:00:00")`. A query atual inclui ~24h a mais do que o período real. Não é blocker porque a probabilidade de delivered orders com updated_at no dia period_end é baixa, mas é uma inconsistência com a lógica da RPC
3. **S3**: Campo `table` no `auditLogFiltersSchema` aceita qualquer string (max 100). Usar `z.enum()` com valores conhecidos reduziria surface de input
4. **S4**: Campo `actor_email` em `AuditLogDetail` na verdade recebe `full_name` de profiles (audit-logs.ts:100) — naming inconsistente

## Veredicto

Code Review Sprint 9 aprovado com ressalvas. 5 warnings encontrados (0 blockers). Stack agent deve corrigir W1-W5 antes de avançar para o QA. Suggestions S1-S4 anotados como pendência técnica.

---

**ATRIBUICAO DE ORIGEM DOS PROBLEMAS:**

- W1 (a11y tr onClick): Ninguém — erro de implementação do Stack Agent. Padrão de a11y em elementos clicáveis não-nativos.
- W2 (a11y Badge onClick): Ninguém — erro de implementação do Stack Agent. Mesma categoria.
- W3 (chamada dupla RPC): Ninguém — erro de implementação do Stack Agent. Decisão de arquitetura de componentes que resulta em duplicação de query.
- W4 (catch vazio): Ninguém — erro de implementação do Stack Agent. Error handling incompleto.
- W5 (getSession vs getUser): Deveria ter sido pego por: Architect (o CLAUDE.md define `getUser()` como padrão, mas o Stack Agent usou `getSession()` para obter token).
- S2 (boundary date): Deveria ter sido pego por: Data Architect (a documentação define period_end como primeiro dia do mês seguinte, mas não especificou como o action deveria usar esse valor ao consultar orders).

Atribuição consolidada: planejamento adequado em geral — 4 de 5 warnings são erro de implementação, 1 warning (W5) é divergência do padrão definido.
