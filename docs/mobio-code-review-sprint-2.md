# Code Review: Sprint 2 — Design System + AppShells + Showcase

## Status: APROVADO COM RESSALVAS

---

## Objetivo do Sprint

Implementar o design system MOBIO (tokens, primitivos UI, componentes editoriais), os AppShells Atelier e Marketplace com sidebar numerada, dashboards skeleton (/salao e /praca), showcase /design-system, página pública /fabrica/[slug], e toast responsivo.

## Critério de Saída

- [x] 9 primitivos UI funcionais (Button, Badge, Tabs, Avatar, Icon, TextInput, Field, Select, Textarea)
- [x] 8 editoriais implementados (Eyebrow, Masthead, Plate, Rule, NumberedNav, PullQuote, PageNumber, FeaturedSpread)
- [x] AppShell Atelier (sidebar 01-07 + topbar) — desktop, tablet, mobile
- [x] AppShell Marketplace (sidebar 01-06 + topbar com busca + Linesheet) — desktop, tablet, mobile
- [x] Dashboard /salao com Masthead + 4 métricas + atividade recente (skeleton)
- [x] Dashboard /praca com saudação + novidades + ateliês + boards (skeleton)
- [x] Showcase /design-system com guard de produção + 11 seções
- [x] /fabrica/[slug] com hero + sobre + coleções + contato
- [x] Tokens semáforo (success, warning, info) no globals.css
- [x] Variant accent no Button
- [x] Toast responsivo (top-center mobile, top-right desktop)
- [x] Build sem erros, lint limpo, tsc limpo, testes passando

## Tasks Validadas

| Task                        | Status   | Observação                                                                         |
| --------------------------- | -------- | ---------------------------------------------------------------------------------- |
| Skeleton component UI       | OK       | Componente simples, correto                                                        |
| AppShell Atelier layout     | OK       | Server layout + Client shell, 3 breakpoints                                        |
| AppShell Marketplace layout | OK       | Topbar com busca e Linesheet, correto                                              |
| Dashboard /salao            | OK       | Masthead + 4 métricas + atividade skeleton                                         |
| Dashboard /praca            | OK       | Saudação dinâmica + ateliês destaque + boards skeleton                             |
| Toast position responsivo   | OK       | useSyncExternalStore com matchMedia                                                |
| Showcase /design-system     | Ressalva | Falta seção FeaturedSpread; Textarea sem showCount                                 |
| /fabrica/[slug]             | Ressalva | Rota em /fabrica (público) em vez de /(lojista)/fabrica (spec) — decisão aceitável |
| Middleware rotas públicas   | OK       | /fabrica e /design-system adicionados                                              |

## Critérios de Aceite das Stories

- [x] Primitivos UI com CVA variants + props conforme spec
- [x] Editoriais com estética editorial (Fraunces, réguas, eyebrows)
- [x] Sidebar numerada com aria-current="page"
- [x] Mobile drawer com overlay
- [x] Tablet sidebar colapsada (icons only)
- [x] Tokens semáforo (success/warning/info) em light e dark
- [x] Guard production no /design-system
- [ ] FeaturedSpread demonstrado no showcase
- [ ] Button com props loading/leftIcon/rightIcon conforme spec

## Pontos Positivos

- **Separação Server/Client exemplar**: Layouts `(atelier)/layout.tsx` e `(lojista)/layout.tsx` são Server Components que fazem auth check via `getUser()`, enquanto os shells client ficam em arquivos separados (`atelier-shell.tsx`, `lojista-shell.tsx`). Defense in depth com middleware + layout.
- **Acessibilidade consistente nos editoriais**: NumberedNav com `aria-current="page"`, `<nav aria-label>`, badges com `aria-label` contextual no remove button, Icon com `aria-hidden` por default. PageNumber com `role="status"` e `aria-label` descritivo.
- **Zero cores hardcoded nos componentes**: Grep por hex codes nos componentes retorna zero matches — tudo via tokens Tailwind.
- **Zero console.log, zero TODO/FIXME no código da sprint**: Código limpo sem artefatos de debug.
- **Toast responsivo com abordagem moderna**: `useSyncExternalStore` para detectar mobile vs desktop sem useEffect desnecessário — SSR-safe.
- **Textarea com aria-live condicional**: Contador de caracteres com `aria-live="polite"` apenas quando próximo do limite (>90%) — excelente a11y.
- **TypeScript impecável**: tsc --noEmit com 0 erros, sem `any`, sem `as Type` sem justificativa, sem `!` non-null assertions.

---

## Compliance (código segue os docs?)

### Design & UI

- [x] Tokens primários (oklch) conforme spec — light e dark
- [x] Tokens semáforo (success, warning, info) com foreground — light e dark
- [x] Tokens sidebar conforme spec
- [x] Fraunces para headlines/editoriais, Inter para body — correto
- [x] font-heading mapeado para Fraunces no @theme inline
- [x] Escala base-4 de espaçamento seguida
- [x] Raios de borda via --radius com multiplicadores
- [x] CVA variants em Button, Badge, Tabs, Eyebrow, Rule, PullQuote, PageNumber, Avatar, Icon
- [x] Mobile-first: grids 2-col mobile → 4-col desktop nos dashboards
- [x] Touch targets adequados (buttons h-6 mínimo, links com py-2)
- [x] Acessibilidade: Button (aria-label em icon sizes, focus-visible), Badge (dot aria-hidden, remove button com aria-label), Avatar (alt obrigatório, status aria-hidden), Icon (decorative default)
- [ ] Button falta props `loading`, `leftIcon`, `rightIcon` definidas na spec 3.1

### Arquitetura

- [x] Estrutura de pastas: `ui/` para primitivos, `editorial/` para editoriais, `shared/` para compostos
- [x] Index files re-exportando corretamente (ui/index.ts, editorial/index.ts)
- [x] Server Components nos layouts, Client Components apenas nos shells + textarea/tabs/select (interatividade)
- [x] Supabase acessado via `createClient()` de server.ts no /fabrica/[slug]
- [x] Path alias @/ consistente em todos os arquivos
- [x] Naming: kebab-case em arquivos, PascalCase em componentes
- [x] Nenhum arquivo acima de 200 linhas (app-shell.tsx é o maior com 196 linhas)
- [x] `params` sendo awaited no /fabrica/[slug] (Next.js 15+ compat)
- [x] Código em inglês, UI em pt-BR

### Banco de Dados

- [x] Query no /fabrica/[slug] com column selection precisa (não `select('*')`)
- [x] `.single()` para registro único
- [x] Filtro `is_active: true` na query

### Padrões

- [x] shadcn/ui como fundação (base-nova com @base-ui/react)
- [x] lucide-react para ícones (import individual, tree-shakable)
- [x] CVA para variants
- [x] cn() de @/lib/utils para merge de classes
- [x] sonner para toasts
- [x] Sem libs substituídas ou adicionadas fora do padrão

---

## Qualidade de Código

### Code Smells

- [x] Sem duplicação significativa
- [x] Sem god components
- [x] Responsabilidades bem separadas (AppShell compõe NumberedNav + Avatar + Button)

### Nomes e Legibilidade

- [x] Nomes auto-explicativos (ATELIER_NAV, LOJISTA_NAV, FEATURED_ATELIERS, METRICS)
- [x] Componentes descrevem o que renderizam (Masthead, Plate, Eyebrow, FeaturedSpread, NumberedNav)
- [x] Variáveis de estado claras (drawerOpen, charCount, nearLimit)

### Complexidade

- [x] Funções dentro dos limites
- [x] Máximo 3 níveis de indentação
- [x] Componentes com responsabilidade única
- [x] Rule.tsx com label usa ternários encadeados (5 níveis) para variantes de borda — aceitável por ser mapeamento direto de variantes, mas poderia ser simplificado com um record

### Performance

- [x] Sem queries N+1
- [x] Imports tree-shakable de lucide-react (icons individuais)
- [x] Skeleton components para evitar layout shift nos dashboards
- [x] next/image no FeaturedSpread com priority e sizes="100vw"
- [x] Backdrop-blur no topbar com bg-background/80

### React Patterns

- [x] useEffect com cleanup no AppShell (body overflow reset)
- [x] useCallback para closeDrawer (estável para onClickCapture)
- [x] useSyncExternalStore no Toaster (correto para media queries)
- [x] Textarea com ref forwarding correto (setRefs callback)
- [x] Tabs com forwardRef em todos os sub-componentes
- [x] Nenhuma mutação direta de estado

### Acoplamento

- [x] Componentes UI não dependem de Supabase
- [x] Componentes editoriais não dependem de contexto de auth
- [x] AppShell recebe items como prop (desacoplado do shell específico)
- [x] Server-only Supabase access no layout e /fabrica/[slug]

---

## Segurança

- [x] RLS: query no /fabrica/[slug] usa anon key via `createClient()` (não service_role)
- [x] Sem SERVICE_ROLE_KEY no frontend (grep retorna 0 matches)
- [x] Auth verificada via `getUser()` nos layouts (nunca getSession)
- [x] Guard de produção no /design-system: `if (process.env.NODE_ENV === "production") { notFound(); }`
- [x] Middleware valida role via `isRoleAllowedOnPath` antes de permitir acesso
- [x] Defense in depth: middleware redireciona + layout revalida auth

---

## Resumo de Problemas

### Blockers (deve corrigir)

Nenhum.

### Warnings (deveria corrigir)

1. **AppShell mobile drawer sem semântica de dialog** — `src/components/shared/app-shell.tsx:104-134`
   - O drawer mobile abre um overlay com aside, mas não tem `role="dialog"`, `aria-modal="true"`, focus trap, nem keyboard dismiss (Escape).
   - WCAG 2.1 SC 2.1.2 exige que drawers/modals tenham keyboard dismiss e focus containment.
   - **Recomendação**: Adicionar `role="dialog"` e `aria-modal="true"` no container do drawer, implementar Escape para fechar, e considerar focus trap (pode usar `@base-ui/react` Dialog primitivo ou implementação manual com `useEffect` no keydown + `tabIndex`).

2. **Button falta props loading/leftIcon/rightIcon definidas na spec** — `src/components/ui/button.tsx`
   - A spec 3.1 do design-system define `loading?: boolean` (com spinner Loader2 e `aria-busy`), `leftIcon?: ReactNode` e `rightIcon?: ReactNode` (com `data-icon`). O componente não implementa essas props.
   - O showcase demonstra ícones via children com `data-icon` manualmente, mas a API de props não existe.
   - **Recomendação**: Implementar as 3 props conforme spec. O `loading` é especialmente importante para mutations futuras (double-submit prevention).

3. **Showcase /design-system não demonstra FeaturedSpread** — `src/app/design-system/page.tsx`
   - A spec seção 8 ("Showcase") lista "Editoriais" como seção que deve incluir "Eyebrow, Masthead, Plate, Rule, NumberedNav, PullQuote, PageNumber, **FeaturedSpread**". O FeaturedSpread não aparece na seção editorial do showcase.
   - **Recomendação**: Adicionar demo do FeaturedSpread na seção editorial com pelo menos as variantes `dark` e `light` de overlay.

### Suggestions (poderia melhorar)

1. **Textarea showcase sem `showCount`** — `src/app/design-system/page.tsx:410-415`
   - O Textarea com `maxLength={200}` no showcase não passa `showCount`, então o contador de caracteres (feature implementada no componente) não é demonstrado.
   - **Recomendação**: Alterar para `<Textarea placeholder="Com contador" maxLength={200} showCount />`.

2. **Rule.tsx com ternários encadeados** — `src/components/editorial/rule.tsx:44-55` e `62-70`
   - A resolução de classes de borda quando `label` está presente usa 5 níveis de ternários encadeados, duplicados nos dois lados do label. Poderia usar um record de mapeamento.
   - **Recomendação**: Extrair um `const borderClasses: Record<string, string>` para mapear variant → classes, eliminando a duplicação.

3. **`/fabrica/[slug]` como rota pública em vez de dentro de `(lojista)`** — `src/app/fabrica/[slug]/page.tsx`
   - Spec seção 9 define rota como `src/app/(lojista)/fabrica/[slug]/page.tsx`. A implementação colocou em `src/app/fabrica/[slug]/page.tsx` (rota pública). Decisão válida (páginas de fábricas podem ser acessíveis sem auth), mas diverge do spec.
   - **Recomendação**: Documentar a decisão em `docs/decisions.md`. Se manter como pública, verificar se SEO metadata está presente (`generateMetadata`).

4. **AppShell tablet sidebar sem label nos itens** — `src/components/shared/app-shell.tsx:72-98`
   - A sidebar colapsada (tablet) mostra apenas ícones ou números. Usa `title` para tooltip nativo, mas não tem `aria-label` explícito nos links.
   - **Recomendação**: Adicionar `aria-label={item.label}` nos links da sidebar tablet para screen readers.

---

## Areas Cobertas

| Area                    | Status  | Observação                                                     |
| ----------------------- | ------- | -------------------------------------------------------------- |
| A. Aderência à spec     | OK      | 9 primitivos + 8 editoriais + AppShells + tokens conforme spec |
| B. Acessibilidade       | Warning | Drawer mobile sem role="dialog"/focus trap                     |
| C. Server vs Client     | OK      | Separação correta em todos os arquivos                         |
| D. Performance          | OK      | Tree-shaking, Skeleton, next/image                             |
| E. Convenções           | OK      | kebab-case, PascalCase, index files, @/ alias                  |
| F. Tailwind v4          | OK      | Tokens via classes, cn(), CVA, zero hardcoded                  |
| G. Auth + RBAC          | OK      | Server auth + middleware defense in depth                      |
| H. Build/Test           | OK      | Build verde, lint 0, tsc 0, tests 4/4                          |
| I. Guard /design-system | OK      | notFound() em produção                                         |

---

## Veredicto

Code Review Sprint 2 **aprovado com ressalvas**. Há 3 warnings que devem ser corrigidos antes de avançar para o QA:

1. Drawer mobile do AppShell precisa de semântica de dialog + keyboard dismiss
2. Button precisa das props loading/leftIcon/rightIcon da spec
3. FeaturedSpread ausente do showcase

As 4 suggestions são pendências técnicas que não bloqueiam o avanço.
