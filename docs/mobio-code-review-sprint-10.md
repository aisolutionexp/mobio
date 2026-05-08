# Code Review: Sprint 10 — Polish + Observabilidade + Hardening Pre-Deploy

## Status: ⚠️ Aprovado com ressalvas

## Objetivo do Sprint

A11y, performance, SEO, LGPD, security headers (CSP enforce), Sentry, E2E Playwright, loading/error/empty states — hardening pre-deploy.

## Criterio de Saida

- [x] Skip-link presente
- [x] Landmarks (main, nav, aside) em route groups autenticados
- [x] aria-label em icon-only buttons
- [x] axe-core testes passando (5+ novos)
- [x] Preconnect Supabase
- [x] Metadata por rota publica
- [x] og:image dinamica em /fabrica/[slug]
- [x] sitemap.xml + robots.txt
- [x] robots.txt disallow areas autenticadas
- [x] Banner LGPD com localStorage
- [x] /politica-de-privacidade publica e no middleware
- [x] CSP enforce ativo
- [x] HSTS, X-Frame, nosniff, Referrer-Policy, Permissions-Policy
- [x] Sentry com tracesSampleRate condicional
- [x] Source maps upload + deleteSourcemapsAfterUpload
- [x] Tunnel route /monitoring
- [x] loading.tsx em route groups (atelier, lojista, admin, onboarding)
- [x] error.tsx com Sentry capture + retry button
- [x] 28 testes E2E em 5 specs
- [x] Build + lint + tsc verdes
- [x] Vitest 488 passando
- [x] Playwright 28 passando
- [x] .env.example atualizado

## Pontos Positivos

- Security headers excelentes — CSP enforce com diretivas restritivas (`frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`), HSTS com preload, X-Frame-Options DENY, nosniff, Referrer-Policy strict. Configuracao profissional
- Sentry bem integrado — tracesSampleRate condicional (0.1 prod / 1.0 dev), replays com amostragem, source maps com cleanup, tunnel route para bypass ad-blockers, captureRouterTransitionStart. Decisao de nao integrar em Edge Functions Deno documentada em decisions.md
- E2E com cobertura solida — 28 testes cobrindo auth flow, public pages, onboarding redirects, security headers e smoke. Mock de OTP inteligente sem depender de backend real
- Preconnect dinamico no layout — extrai hostname do Supabase URL via `new URL()` com fallback gracioso, evita hardcode
- Error boundaries com Sentry capture em todos os route groups + root — erro real do usuario eh capturado automaticamente
- Metadata completa com OG tags — root layout, home, auth pages, /fabrica/[slug] com generateMetadata dinamico e og:image condicional
- Sitemap dinamico com factories — busca factories ativas do Supabase com column selection precisa (`slug, updated_at`)
- Icon buttons consistentes — todos com `aria-label` ou `sr-only` (verificados: app-shell, conversation-view, quote-chat, attachment-picker, discover, document-list-row)
- Warnings da S9 corrigidos — `audit-log-row.tsx` agora tem `onKeyDown` + `aria-label` (era `<tr onClick>` sem keyboard support)

## Compliance (codigo segue os docs?)

### A. A11y

- [x] Skip-link presente em `src/components/shared/skip-link.tsx`, incluido no root layout
- [x] `id="main-content"` em `app-shell.tsx:244` (route groups autenticados)
- [x] Icon buttons com `aria-label` ou `sr-only` em todos os componentes verificados
- [x] Testes axe-core: button-a11y.test.tsx (3 testes) + skip-link.test.tsx (2 testes)
- [x] LGPD banner com `role="dialog"` e `aria-label="Consentimento de cookies"`
- [ ] 🟡 W1: Paginas publicas (home `page.tsx`, `/politica-de-privacidade/page.tsx`) e `design-system/layout.tsx` usam `<div>` ou `<main>` sem `id="main-content"` — skip-link (`href="#main-content"`) nao encontra target nessas paginas. Em route groups autenticados funciona (via AppShell)
- [ ] 🟡 W2: Textos UI sem acentos em multiplos arquivos visíveis ao usuario:
  - `skip-link.tsx:9` — "conteudo" → "conteúdo"
  - `lgpd-banner.tsx:38` — "experiencia" → "experiência", "voce" → "você"
  - `lgpd-banner.tsx:43` — "Politica de Privacidade" → "Política de Privacidade"
  - `politica-de-privacidade/page.tsx` — "Politica" → "Política", "Protecao" → "Proteção", "experiencia" → "experiência", "personalizacao" → "personalização", e mais ~20 palavras sem acento ao longo do texto
  - `lojista/favoritos/page.tsx:71` — "voce" → "você"
  - Regra do CLAUDE.md: "UI em pt-BR — todo texto visivel ao usuario em portugues". Acentuacao correta faz parte do pt-BR

### B. Performance

- [x] `next/image` usado em componentes com imagens: linesheet-item-card, public-linesheet-view, factory-authorized-view, featured-spread, product-gallery, board-item-card
- [x] Preconnect Supabase via `<link rel="preconnect">` + `dns-prefetch` no root layout (dinamico, extrai hostname)
- [x] Static metadata na maioria das rotas (sem dynamic blocking desnecessario)
- [x] generateMetadata dinamico apenas onde necessario (/fabrica/[slug])
- [x] Column selection precisa em todas as queries (zero `select('*')`)
- [x] Skeleton loading em route groups

### C. SEO

- [x] Metadata com title template `"%s | MOBIO"` no root layout
- [x] OG tags completas (type, locale, url, siteName) no root layout + home + auth pages
- [x] generateMetadata em `/fabrica/[slug]` com og:title, og:description, og:image condicional (logo_path)
- [x] Twitter card configurada
- [x] `sitemap.ts` com rotas estaticas + factories dinamicas
- [x] `robots.ts` com allow publico + disallow areas autenticadas (/atelier/_, /lojista/_, /admin/_, /api/_, /onboarding)
- [x] `metadataBase` configurado para resolucao de URLs relativas

### D. LGPD

- [x] Banner com localStorage (`mobio-lgpd-consent`)
- [x] Botoes "Aceitar" e "Recusar"
- [x] Link para /politica-de-privacidade no banner
- [x] Pagina /politica-de-privacidade completa (11 secoes: quem somos, dados coletados, finalidades, base legal, compartilhamento, direitos LGPD, retencao, seguranca, cookies, contato, alteracoes)
- [x] `/politica-de-privacidade` em PUBLIC_PATHS no middleware
- [x] Metadata com title e description na pagina

### E. Security Headers + CSP Enforce

- [x] CSP enforce ativo (`Content-Security-Policy`, nao `Report-Only`)
- [x] Diretivas: `default-src 'self'`, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`
- [x] HSTS: `max-age=63072000; includeSubDomains; preload` (2 anos, correto)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
- [ ] 🟢 S1: CSP inclui `'unsafe-inline' 'unsafe-eval'` em `script-src`. O `'unsafe-inline'` eh necessario para Next.js (inline scripts de hydration). O `'unsafe-eval'` pode ser necessario para dev mode e certas libs mas enfraquece a CSP em producao. Avaliar se eh possivel remover `'unsafe-eval'` quando o projeto estiver em producao e verificar se algo quebra. Nao eh blocker porque Next.js em producao pode precisar para funcionalidades internas

### F. Sentry

- [x] `initSentryServer()` com tracesSampleRate condicional (0.1 prod / 1.0 dev)
- [x] `initSentryClient()` com replaysSessionSampleRate + replaysOnErrorSampleRate
- [x] `instrumentation.ts` registra para nodejs + edge runtimes
- [x] `instrumentation-client.ts` com captureRouterTransitionStart
- [x] `withSentryConfig` em next.config.ts com sourcemaps upload + deleteSourcemapsAfterUpload
- [x] Tunnel route `/monitoring` configurado
- [x] SENTRY_DSN separado (server: `SENTRY_DSN`, client: `NEXT_PUBLIC_SENTRY_DSN`)
- [x] .env.example com `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` para CI
- [x] Alertas documentados como pendencia operacional em decisions.md

### G. E2E Playwright

- [x] 28 testes em 5 specs
- [x] `auth-flow.spec.ts` (8 testes): login form, signup fabrica/lojista, validacao, magic link com mock
- [x] `public-pages.spec.ts` (7 testes): home, politica privacidade, design-system, 404 fabrica, 404 linesheet, meta tags
- [x] `onboarding.spec.ts` (5 testes): redirect sem auth, rotas autenticadas protegidas
- [x] `security-headers.spec.ts` (7 testes): CSP enforce, diretivas, X-Frame, nosniff, HSTS, Referrer, Permissions
- [x] `smoke.spec.ts` (1 teste): home loads

### H. Loading/Error/Empty

- [x] `loading.tsx` em: (atelier), (lojista), (admin), onboarding + sub-rotas atelier (salao, catalogo, pedidos, financeiro)
- [x] `error.tsx` em: root, (atelier), (lojista), (admin), onboarding — todos com Sentry.captureException + botao retry
- [x] Empty states em listings (analytics, statements, audit logs, conversations, notifications, linesheets, quotes, showrooms, products, favoritos)

### I. Build/Lint/Test

- [x] `npm run build` verde
- [x] `npm run lint` zero new errors
- [x] `npx tsc --noEmit` zero errors
- [x] Vitest 488 passando
- [x] Playwright 28 passando

### J. Deploy Readiness

- [x] .env.example com todas as variaveis (Supabase, VAPID, Sentry)
- [x] Decisoes documentadas em decisions.md (Sentry alertas, Edge Functions Deno)
- [x] Pendencias operacionais listadas (Sentry alertas no painel, configuracao manual Supabase)
- [ ] 🟢 S2: Sem validacao de schema para variaveis de ambiente (`src/lib/env.ts` com `z.object({...}).parse(process.env)`). Env var faltando em producao causa crash silencioso. Recomendado mas nao bloqueante

## Qualidade de Codigo

### Code Smells

- [x] Sem duplicacao significativa nos arquivos da S10
- [x] Error boundaries seguem padrao consistente (Sentry capture + retry)
- [x] Loading skeletons seguem padrao consistente por route group

### Nomes e Legibilidade

- [x] Nomes auto-explicativos (SkipLink, LgpdBanner, initSentryServer, initSentryClient)
- [x] Funcoes descrevem o que fazem (getSupabaseHostname, isPublicPath, isStaticAsset)
- [x] Componentes descrevem o que renderizam

### Complexidade

- [x] Funcoes dentro do limite (nenhuma acima de 20 linhas neste sprint)
- [x] Arquivos dentro do limite (nenhum arquivo novo da S10 excede 200 linhas)
- [x] Niveis de indentacao dentro do aceitavel

### React Patterns

- [x] useEffect com deps corretas nos error boundaries (dependency: error)
- [x] useState + useEffect para consent state no LgpdBanner (correto — localStorage nao disponivel no SSR)
- [x] Sem mutacao direta de estado

### Acoplamento

- [x] Sentry init separado em modulos dedicados (`lib/sentry/server.ts`, `lib/sentry/client.ts`)
- [x] Instrumentation segue o padrao Next.js 15+ (instrumentation.ts + instrumentation-client.ts)

## Seguranca

- [x] CSP enforce com diretivas restritivas
- [x] HSTS com preload + max-age 2 anos
- [x] X-Frame-Options DENY (anti-clickjacking)
- [x] SERVICE_ROLE_KEY apenas em `lib/supabase/admin.ts` (server-only, usado por push service)
- [x] SENTRY_DSN do servidor nao exposto ao client (variaveis separadas)
- [x] Tunnel route evita leak de DSN nos headers
- [x] Permissions-Policy restritivo (camera, mic, geo desabilitados)
- [x] Sentry auth token apenas em CI/CD (SENTRY*AUTH_TOKEN nao eh NEXT_PUBLIC*)

## Regressao

- [x] Warnings S9 corrigidos: `audit-log-row.tsx` agora tem `onKeyDown` + `aria-label`
- [x] Middleware atualizado com `/politica-de-privacidade` em PUBLIC_PATHS sem quebrar rotas existentes
- [x] Root layout expandido com SkipLink + LgpdBanner sem afetar componentes existentes
- [x] next.config.ts expandido com headers sem afetar configuracoes existentes

## Resumo de Problemas

### 🔴 Blockers (deve corrigir)

Nenhum.

### 🟡 Warnings (deveria corrigir)

1. **W1: Skip-link sem target em paginas publicas** — Home (`src/app/page.tsx`), `/politica-de-privacidade/page.tsx` e `src/app/design-system/layout.tsx` nao tem `id="main-content"` no wrapper ou `<main>`. O skip-link aponta para `#main-content` mas nao encontra target nessas paginas. Correcao: usar `<main id="main-content">` como wrapper nessas paginas
2. **W2: Textos UI sem acentos** — Multiplos textos visiveis ao usuario estao sem acentuacao correta em pt-BR: `skip-link.tsx`, `lgpd-banner.tsx`, `politica-de-privacidade/page.tsx` (>20 palavras), `lojista/favoritos/page.tsx`. Isso afeta a qualidade profissional da UI. Correcao: adicionar acentos corretos em todas as strings de texto visivel

### 🟢 Suggestions (poderia melhorar)

1. **S1: CSP `'unsafe-eval'`** — Presente em `script-src` no `next.config.ts:6`. Avaliar remocao em producao quando o projeto estabilizar. Nao bloqueante porque Next.js pode precisar internamente
2. **S2: Validacao de schema para env vars** — Criar `src/lib/env.ts` com `z.object({...}).parse(process.env)` para falhar rapido se variavel faltando em deploy. Nao bloqueante mas previne crashes silenciosos

## Atribuicao de Origem dos Problemas

- **W1** (skip-link sem target em publicas): Ninguem — erro de implementacao do Stack Agent. O skip-link foi criado com `#main-content` mas as paginas publicas (que nao usam AppShell) nao receberam o `id` correspondente
- **W2** (textos sem acentos): Ninguem — erro de implementacao do Stack Agent. Strings de texto geradas sem acentuacao correta em pt-BR

Atribuicao: agentes de planejamento entregaram corretamente. Problemas sao de implementacao.

## Veredicto

Code Review Sprint 10 aprovado com ressalvas. 2 warnings encontrados (W1: skip-link, W2: acentuacao) — ambos corrigiveis rapidamente sem impacto arquitetural. Nenhum blocker.

A Sprint 10 entrega hardening solido: security headers profissionais, Sentry bem integrado, E2E com boa cobertura, LGPD funcional, e error boundaries em todos os route groups.

Apos correcao dos warnings, o projeto esta pronto para QA Final seguido de Security Audit Final pre-deploy.
