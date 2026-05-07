# Design System — MOBIO

> B2B fashion marketplace. Estética editorial de revista de moda — clean, tipográfico, sofisticado.
> Este documento é especificação. Não contém código de implementação — apenas referências e contratos visuais.

---

## 1. Visão Geral

### 1.1 Conceito visual

MOBIO adota a linguagem de uma **revista de moda editorial** transposta para interface digital. O design privilegia tipografia sobre ornamento, espaço negativo sobre densidade, e linhas finas (réguas) sobre sombras. Cada tela é pensada como uma "página" de publicação: hierarquia clara, ritmo vertical, respiro generoso.

**Pilares:**

| Pilar     | Manifestação                                                                    |
| --------- | ------------------------------------------------------------------------------- |
| Editorial | Fraunces (serif optical) como display; eyebrows, pull quotes, numeração lateral |
| Minimal   | Sombras quase inexistentes; elevação via bordas finas e contraste de fundo      |
| Tonal     | Paleta warm-neutral (oklch hue 70-80) com accent dourado `oklch(0.72 0.1 75)`   |
| Funcional | Componentes shadcn base-nova como fundação; densidades adaptáveis por shell     |

### 1.2 Linguagem e tom

- **Tom:** Profissional-elegante, nunca informal demais. Frases curtas, assertivas.
- **Voz:** Terceira pessoa ou imperativo suave. "Explore novas coleções" ao invés de "Ei! Veja o que temos".
- **Idioma UI:** pt-BR em todo texto visível ao usuário.
- **Terminologia:** "Atelier" (não "fábrica" na UI), "Salão" (dashboard atelier), "Praça" (dashboard lojista), "Linesheet" (catálogo B2B).

---

## 2. Tokens

> Tokens já materializados em `src/app/globals.css` (oklch) e `src/config/brand.ts`.
> Esta seção referencia e documenta — não sobrescreve.

### 2.1 Cores

#### Paleta primária (oklch — definida em `globals.css`)

| Token                    | Light                       | Dark                        | Uso                                 |
| ------------------------ | --------------------------- | --------------------------- | ----------------------------------- |
| `--background`           | `oklch(0.978 0.003 80)`     | `oklch(0.185 0.02 270)`     | Fundo de página                     |
| `--foreground`           | `oklch(0.185 0.02 270)`     | `oklch(0.965 0.003 80)`     | Texto principal                     |
| `--primary`              | `oklch(0.185 0.02 270)`     | `oklch(0.918 0.01 70)`      | Botões primários, links             |
| `--primary-foreground`   | `oklch(0.965 0.003 80)`     | `oklch(0.185 0.02 270)`     | Texto sobre primary                 |
| `--secondary`            | `oklch(0.918 0.01 70)`      | `oklch(0.3 0.015 270)`      | Botões secundários, tags            |
| `--secondary-foreground` | `oklch(0.185 0.02 270)`     | `oklch(0.965 0.003 80)`     | Texto sobre secondary               |
| `--accent`               | `oklch(0.72 0.1 75)`        | `oklch(0.72 0.1 75)`        | Destaque editorial, accent dourado  |
| `--accent-foreground`    | `oklch(0.185 0.02 270)`     | `oklch(0.185 0.02 270)`     | Texto sobre accent                  |
| `--muted`                | `oklch(0.948 0.008 70)`     | `oklch(0.3 0.015 270)`      | Fundos suaves, inputs desabilitados |
| `--muted-foreground`     | `oklch(0.5 0.01 280)`       | `oklch(0.65 0.01 280)`      | Texto secundário, captions          |
| `--card`                 | `oklch(1 0 0)`              | `oklch(0.23 0.02 270)`      | Cards, popovers                     |
| `--card-foreground`      | `oklch(0.185 0.02 270)`     | `oklch(0.965 0.003 80)`     | Texto sobre card                    |
| `--border`               | `oklch(0.905 0.01 70)`      | `oklch(1 0 0 / 10%)`        | Bordas, separadores                 |
| `--input`                | `oklch(0.905 0.01 70)`      | `oklch(1 0 0 / 15%)`        | Borda de inputs                     |
| `--ring`                 | `oklch(0.72 0.1 75)`        | `oklch(0.72 0.1 75)`        | Focus ring (accent)                 |
| `--destructive`          | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Erros, ações destrutivas            |

#### Semáforo (a adicionar em globals.css)

| Token                  | Valor (light)           | Valor (dark)            | Uso                        |
| ---------------------- | ----------------------- | ----------------------- | -------------------------- |
| `--success`            | `oklch(0.65 0.17 145)`  | `oklch(0.72 0.17 145)`  | Confirmações, status ativo |
| `--success-foreground` | `oklch(1 0 0)`          | `oklch(0.185 0.02 270)` | Texto sobre success        |
| `--warning`            | `oklch(0.75 0.15 75)`   | `oklch(0.78 0.13 75)`   | Alertas, atenção           |
| `--warning-foreground` | `oklch(0.185 0.02 270)` | `oklch(0.185 0.02 270)` | Texto sobre warning        |
| `--info`               | `oklch(0.62 0.12 250)`  | `oklch(0.68 0.12 250)`  | Informacional              |
| `--info-foreground`    | `oklch(1 0 0)`          | `oklch(1 0 0)`          | Texto sobre info           |

#### Sidebar (já em globals.css)

Tokens `--sidebar-*` seguem a mesma paleta com variação sutil para a superfície lateral. Referência: linhas 77-84 (light) e 112-119 (dark) de `globals.css`.

### 2.2 Tipografia

#### Fontes (definidas em `src/config/fonts.ts`)

| Variável CSS     | Fonte    | Peso          | Uso                                                           |
| ---------------- | -------- | ------------- | ------------------------------------------------------------- |
| `--font-display` | Fraunces | 400, 600, 700 | Headlines (H1-H3), eyebrows, pull quotes, números decorativos |
| `--font-sans`    | Inter    | 400, 500, 600 | Body, labels, botões, captions, dados tabulares               |

Classe Tailwind: `font-heading` → Fraunces, `font-sans` → Inter (mapeado em `@theme inline` de globals.css).

#### Escala tipográfica

| Classe      | Tamanho         | Line-height | Tracking | Uso                                 |
| ----------- | --------------- | ----------- | -------- | ----------------------------------- |
| `text-xs`   | 0.75rem (12px)  | 1rem        | normal   | Caption, badge, metadado terciário  |
| `text-sm`   | 0.875rem (14px) | 1.25rem     | normal   | Label, texto auxiliar, link pequeno |
| `text-base` | 1rem (16px)     | 1.5rem      | normal   | Body padrão                         |
| `text-lg`   | 1.125rem (18px) | 1.75rem     | normal   | Body destaque, subtítulo leve       |
| `text-xl`   | 1.25rem (20px)  | 1.75rem     | -0.01em  | H4                                  |
| `text-2xl`  | 1.5rem (24px)   | 2rem        | -0.02em  | H3                                  |
| `text-3xl`  | 1.875rem (30px) | 2.25rem     | -0.02em  | H2 mobile                           |
| `text-4xl`  | 2.25rem (36px)  | 2.5rem      | -0.03em  | H1 mobile                           |
| `text-5xl`  | 3rem (48px)     | 1.1         | -0.03em  | H1 desktop, hero                    |
| `text-6xl`  | 3.75rem (60px)  | 1           | -0.04em  | Display editorial                   |

#### Pesos

| Classe          | Valor | Uso                          |
| --------------- | ----- | ---------------------------- |
| `font-normal`   | 400   | Body Inter, Fraunces regular |
| `font-medium`   | 500   | Label, botão outline         |
| `font-semibold` | 600   | Subtítulo, botão primary     |
| `font-bold`     | 700   | H1, H2, destaque Fraunces    |

#### Regra de uso de Fraunces

Fraunces é exclusivo para elementos editoriais de hierarquia alta:

- H1, H2, H3 (via classe `font-heading`)
- Eyebrow text
- Pull quotes
- Números decorativos (sidebar numerada, page indicators)
- Preço em destaque (opcional)

Nunca usar Fraunces em: body text, labels, botões, placeholders, badges, menus de navegação.

### 2.3 Espaçamento

Escala base-4 (1 unidade = 4px). Usar classes Tailwind padrão:

| Token    | Valor | Classe Tailwind  | Uso                                                           |
| -------- | ----- | ---------------- | ------------------------------------------------------------- |
| space-1  | 4px   | `p-1`, `gap-1`   | Dentro de badges, entre ícone e texto inline                  |
| space-2  | 8px   | `p-2`, `gap-2`   | Padding interno de botões pequenos, gap entre itens compactos |
| space-3  | 12px  | `p-3`, `gap-3`   | Padding de inputs, gap de form fields                         |
| space-4  | 16px  | `p-4`, `gap-4`   | Padding de cards, gap padrão entre seções menores             |
| space-6  | 24px  | `p-6`, `gap-6`   | Padding de containers, gap entre seções                       |
| space-8  | 32px  | `p-8`, `gap-8`   | Espaço entre blocos de conteúdo                               |
| space-12 | 48px  | `p-12`, `gap-12` | Margem entre seções de página                                 |
| space-16 | 64px  | `p-16`, `gap-16` | Topo de hero, espaço entre áreas visuais                      |
| space-24 | 96px  | `p-24`, `gap-24` | Separação entre grandes seções de página                      |

### 2.4 Raios de borda

Definidos via `--radius: 0.625rem` em globals.css com multiplicadores em `@theme inline`:

| Token          | Valor calculado | Classe         | Uso                    |
| -------------- | --------------- | -------------- | ---------------------- |
| `--radius-sm`  | 3.75px          | `rounded-sm`   | Badges, chips          |
| `--radius-md`  | 5px             | `rounded-md`   | Inputs, selects        |
| `--radius-lg`  | 10px            | `rounded-lg`   | Cards, botões (padrão) |
| `--radius-xl`  | 14px            | `rounded-xl`   | Containers, modais     |
| `--radius-2xl` | 18px            | `rounded-2xl`  | Cards grandes, sheets  |
| `full`         | 9999px          | `rounded-full` | Avatares, pills        |

### 2.5 Sombras

Estética editorial prefere linhas e bordas a sombras. Uso mínimo:

| Token         | Valor                            | Uso                                                      |
| ------------- | -------------------------------- | -------------------------------------------------------- |
| `shadow-none` | nenhuma                          | Padrão para a maioria dos cards (usar `border` ao invés) |
| `shadow-xs`   | `0 1px 2px oklch(0 0 0 / 0.04)`  | Input focus sutil                                        |
| `shadow-sm`   | `0 2px 4px oklch(0 0 0 / 0.06)`  | Dropdown, popover                                        |
| `shadow-md`   | `0 4px 12px oklch(0 0 0 / 0.08)` | Modal, dialog                                            |
| `shadow-lg`   | `0 8px 24px oklch(0 0 0 / 0.12)` | Sheet, drawer overlay                                    |

**Regra:** Cards de conteúdo usam `border border-border` ao invés de sombra. Sombra reservada para camadas sobrepostas (dropdown, modal, sheet).

### 2.6 Z-index

| Token  | Valor | Uso                             |
| ------ | ----- | ------------------------------- |
| `z-0`  | 0     | Conteúdo estático               |
| `z-10` | 10    | Tooltip inline, badge flutuante |
| `z-20` | 20    | Topbar sticky                   |
| `z-30` | 30    | Sidebar sticky                  |
| `z-40` | 40    | Dropdown, popover, select       |
| `z-50` | 50    | Modal backdrop                  |
| `z-60` | 60    | Modal, dialog, sheet, drawer    |
| `z-70` | 70    | Toast (sonner — acima de tudo)  |
| `z-80` | 80    | Onboarding overlay (futuro)     |

### 2.7 Animações e transições

| Token    | Duração | Easing                       | Uso                                           |
| -------- | ------- | ---------------------------- | --------------------------------------------- |
| `fade`   | 150ms   | ease-out                     | Hover de botão, aparição de tooltip           |
| `slide`  | 200ms   | ease-out                     | Abertura de dropdown, slide de sidebar mobile |
| `expand` | 250ms   | cubic-bezier(0.4, 0, 0.2, 1) | Expandir/colapsar accordions, tabs            |
| `page`   | 300ms   | cubic-bezier(0.4, 0, 0.2, 1) | Transição de rota (skeleton → conteúdo)       |

**Regra:** Toda animação respeita `prefers-reduced-motion: reduce`. Ao implementar, envolver com `motion-safe:` ou media query equivalente.

---

## 3. Primitivos UI

> Fundação: shadcn base-nova (@base-ui/react, CVA). Button já implementado em `src/components/ui/button.tsx`.

### 3.1 Button

**Arquivo existente:** `src/components/ui/button.tsx` — já implementado com @base-ui/react + CVA.

#### Props interface

```typescript
interface ButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  asChild?: boolean; // via base-ui render prop
  loading?: boolean; // exibe Loader2 spinner, desabilita
  leftIcon?: ReactNode; // ícone à esquerda (data-icon="inline-start")
  rightIcon?: ReactNode; // ícone à direita (data-icon="inline-end")
}
```

#### Variants

| Variant       | Visual (light)                         | Visual (dark)                          |
| ------------- | -------------------------------------- | -------------------------------------- |
| `default`     | bg-primary text-primary-foreground     | bg-primary text-primary-foreground     |
| `secondary`   | bg-secondary text-secondary-foreground | bg-secondary text-secondary-foreground |
| `outline`     | border-border bg-background            | border-input bg-input/30               |
| `ghost`       | transparente, hover bg-muted           | transparente, hover bg-muted/50        |
| `destructive` | bg-destructive/10 text-destructive     | bg-destructive/20 text-destructive     |
| `link`        | text-primary underline-offset-4        | text-primary underline                 |
| `accent`      | bg-accent text-accent-foreground       | bg-accent text-accent-foreground       |

**Nota:** Variant `accent` a ser adicionada — botão dourado para CTAs editoriais ("Ver Linesheet", "Abrir Showroom").

#### Sizes

| Size      | Altura     | Classe                                    |
| --------- | ---------- | ----------------------------------------- |
| `xs`      | 24px (h-6) | Ações inline em tabelas, badges clicáveis |
| `sm`      | 28px (h-7) | Toolbar, ações secundárias                |
| `default` | 32px (h-8) | Padrão geral                              |
| `lg`      | 36px (h-9) | CTAs, formulários                         |
| `icon`    | 32x32px    | Botão icon-only padrão                    |
| `icon-xs` | 24x24px    | Icon inline                               |
| `icon-sm` | 28x28px    | Icon em toolbar                           |
| `icon-lg` | 36x36px    | Icon em destaque                          |

#### Estados

| Estado        | Visual                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| default       | Conforme variant                                                               |
| hover         | opacity-90 ou bg ajustado (já no CVA)                                          |
| active        | `translate-y-px` (já implementado via `active:not-aria-[haspopup]`)            |
| focus-visible | `ring-3 ring-ring/50 border-ring`                                              |
| disabled      | `opacity-50 pointer-events-none`                                               |
| loading       | ícone `Loader2` animando (spin), texto mantido ou substituído por "Aguarde..." |

#### Acessibilidade

- `aria-label` obrigatório em sizes `icon*`
- `aria-busy="true"` quando `loading`
- `aria-disabled="true"` quando `disabled`
- Focus visible via `focus-visible:` (nunca `focus:`)
- Keyboard: Enter/Space ativa

---

### 3.2 Badge

#### Props interface

```typescript
interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  removable?: boolean; // exibe X para remover
  onRemove?: () => void;
  dot?: boolean; // dot indicador à esquerda
}
```

#### Variants

| Variant       | Visual                                                          | Uso                    |
| ------------- | --------------------------------------------------------------- | ---------------------- |
| `default`     | bg-primary text-primary-foreground                              | Tag genérica           |
| `secondary`   | bg-secondary text-secondary-foreground                          | Tag neutra             |
| `outline`     | border border-border text-foreground                            | Tag discreta           |
| `accent`      | bg-accent/15 text-accent-foreground border border-accent/30     | Destaque editorial     |
| `success`     | bg-success/15 text-success border border-success/30             | Status ativo, aprovado |
| `warning`     | bg-warning/15 text-warning-foreground border border-warning/30  | Pendente, atenção      |
| `destructive` | bg-destructive/15 text-destructive border border-destructive/30 | Erro, rejeitado        |
| `info`        | bg-info/15 text-info-foreground border border-info/30           | Informacional          |

#### Sizes

| Size      | Altura | Font                |
| --------- | ------ | ------------------- |
| `sm`      | h-5    | text-xs             |
| `default` | h-6    | text-xs font-medium |
| `lg`      | h-7    | text-sm             |

#### Anatomia

```
[dot?] [label] [removeButton?]
```

- `dot`: circle 6px com cor da variant, `aria-hidden="true"`
- `removeButton`: ícone X (12px), `aria-label="Remover [label]"`, touch target mínimo 24px

#### Acessibilidade

- Semântico: `<span>` com `role="status"` quando represente status dinâmico
- `removable`: botão interno com `aria-label` contextual

---

### 3.3 Tabs

#### Props interface

```typescript
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

interface TabsListProps {
  children: ReactNode;
  variant?: "default" | "underline" | "pill";
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
}
```

#### Variants visuais

| Variant     | Visual                                                          | Uso                                         |
| ----------- | --------------------------------------------------------------- | ------------------------------------------- |
| `default`   | bg-muted rounded-lg para list, bg-background para trigger ativo | Padrão geral                                |
| `underline` | border-b-2 no trigger ativo, sem background                     | Editorial, alinhado com estética de revista |
| `pill`      | bg-primary rounded-full no trigger ativo                        | Filtros compactos                           |

**Recomendação:** Usar `underline` como default no MOBIO — mais alinhado com a estética editorial.

#### Estados

| Estado               | Visual                                        |
| -------------------- | --------------------------------------------- |
| default (trigger)    | text-muted-foreground                         |
| hover                | text-foreground                               |
| active (selecionado) | text-foreground + indicador visual da variant |
| focus-visible        | ring-2 ring-ring ring-offset-2                |
| disabled             | opacity-50 cursor-not-allowed                 |

#### Acessibilidade

- `role="tablist"` no container, `role="tab"` nos triggers, `role="tabpanel"` no content
- `aria-selected="true"` no tab ativo
- `aria-controls` e `aria-labelledby` vinculando tab ↔ panel
- Keyboard: Arrow Left/Right navega entre tabs, Home/End vai para primeiro/último

---

### 3.4 Avatar

#### Props interface

```typescript
interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string; // 1-2 caracteres (iniciais)
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  status?: "online" | "offline" | "away" | "busy";
}
```

#### Sizes

| Size | Dimensão | Uso                     |
| ---- | -------- | ----------------------- |
| `xs` | 24px     | Inline em listas densas |
| `sm` | 32px     | Chat, menções           |
| `md` | 40px     | Topbar user menu, cards |
| `lg` | 56px     | Perfil, headers         |
| `xl` | 80px     | Página de perfil, hero  |

#### Shapes

- `circle` (default): `rounded-full` — para pessoas
- `square`: `rounded-lg` — para marcas/ateliers (logo)

#### Fallback (sem imagem)

- Exibir iniciais (1-2 chars) com `font-heading` (Fraunces) em `bg-muted text-muted-foreground`
- Tamanho da fonte proporcional ao size do avatar

#### Status indicator

- Dot 8px (12px em `lg`/`xl`) posicionado bottom-right
- Cores: online=success, offline=muted, away=warning, busy=destructive
- `aria-label` descrevendo o status: "Online", "Ausente", etc.

#### Acessibilidade

- `alt` obrigatório (descrição da imagem ou nome da pessoa)
- Fallback: `aria-label` com o nome completo
- Status dot: `aria-hidden="true"` (informação redundante com contexto)

---

### 3.5 Icon

> Biblioteca obrigatória: `lucide-react`. Nunca usar react-icons, heroicons ou SVGs avulsos.

#### Props interface

```typescript
interface IconProps {
  name: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  decorative?: boolean; // se true, aria-hidden="true"
}
```

#### Sizes

| Size | Dimensão | Uso                               |
| ---- | -------- | --------------------------------- |
| `xs` | 14px     | Dentro de badges, inline em texto |
| `sm` | 16px     | Input suffix, botão ghost pequeno |
| `md` | 20px     | Botão padrão, nav item (DEFAULT)  |
| `lg` | 24px     | Card header, ação primária        |
| `xl` | 32px     | Empty state, ícone de seção       |

#### Acessibilidade

- Ícone decorativo: `aria-hidden="true"` (default quando usado ao lado de texto)
- Ícone semântico (sem texto acompanhante): requer `aria-label` no container
- Ícones em botão icon-only: `aria-label` no `<Button>`, ícone com `aria-hidden="true"`

---

### 3.6 TextInput

**Arquivo existente:** `src/components/ui/input.tsx` — input nativo com estilos Tailwind.

#### Props interface (wrapper Field + Input)

```typescript
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string; // texto auxiliar abaixo do input
  error?: string; // mensagem de erro
  leftIcon?: LucideIcon; // ícone à esquerda dentro do input
  rightIcon?: LucideIcon; // ícone à direita
  rightElement?: ReactNode; // elemento customizado à direita (ex: botão show/hide password)
}
```

#### Estados

| Estado    | Visual                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| default   | border-input bg-transparent                                                                                  |
| hover     | border-foreground/20                                                                                         |
| focus     | ring-3 ring-ring/50 border-ring                                                                              |
| error     | border-destructive ring-3 ring-destructive/20 + ícone AlertCircle + texto de erro (text-sm text-destructive) |
| success   | border-success (validação inline quando necessário)                                                          |
| disabled  | opacity-50 bg-muted cursor-not-allowed                                                                       |
| read-only | bg-muted/50 cursor-default                                                                                   |

#### Anatomia

```
┌─────────────────────────────────────┐
│ [Label]                [description]│
│ ┌───────────────────────────────┐   │
│ │ [icon?] [input text] [right?] │   │
│ └───────────────────────────────┘   │
│ [error message?]                    │
└─────────────────────────────────────┘
```

#### Acessibilidade

- Label vinculado via `htmlFor`/`id`
- `aria-describedby` apontando para description e/ou error
- `aria-invalid="true"` quando em estado de erro
- Error: nunca apenas cor — sempre ícone AlertCircle + texto

---

### 3.7 Field

Wrapper compositional que agrupa Label + Input/Select/Textarea + mensagem de erro.

#### Props interface

```typescript
interface FieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode; // Input, Select ou Textarea
}
```

#### Anatomia

```
┌────────────────────────────────────┐
│ Label *                            │  ← font-medium text-sm
│ [children — Input/Select/Textarea] │
│ Description text auxiliar          │  ← text-xs text-muted-foreground
│ ⚠ Error message                   │  ← text-sm text-destructive + icon
└────────────────────────────────────┘
```

#### Acessibilidade

- `required`: exibe asterisco visual + `aria-required="true"` no input filho
- Error propagado via `aria-describedby` no input filho
- Descrição propagada via `aria-describedby` (combinado com error se ambos existem)

---

### 3.8 Select

#### Props interface

```typescript
interface SelectProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean; // habilita filtro por digitação
}
```

#### Anatomia

```
Trigger:
┌────────────────────────────────┐
│ [selected label]          [▼]  │
└────────────────────────────────┘

Dropdown (aberto):
┌────────────────────────────────┐
│ [search input?]                │  ← se searchable
├────────────────────────────────┤
│  Option 1                      │
│  Option 2 ✓                    │  ← check no selecionado
│  Option 3 (disabled)           │
└────────────────────────────────┘
```

#### Estados

| Estado   | Visual                                      |
| -------- | ------------------------------------------- |
| default  | Mesma borda de Input                        |
| open     | ring-3 ring-ring/50, dropdown com shadow-sm |
| disabled | opacity-50                                  |
| error    | border-destructive + ring destructive       |

#### Acessibilidade

- `role="listbox"` no dropdown
- `aria-expanded` no trigger
- Keyboard: Enter/Space abre, Arrow Up/Down navega, Escape fecha, letra inicial jump-to
- Se `searchable`: input com `role="combobox"`, `aria-autocomplete="list"`

---

### 3.9 Textarea

#### Props interface

```typescript
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  maxLength?: number; // exibe contador "[current]/[max]"
  autoResize?: boolean; // expande com conteúdo
}
```

#### Anatomia

```
┌────────────────────────────────────┐
│ [Label]                            │
│ ┌──────────────────────────────┐   │
│ │ Texto digitado pelo          │   │
│ │ usuário...                   │   │
│ │                              │   │
│ └──────────────────────────────┘   │
│ [error?]              [123/500]    │  ← contador de caracteres
└────────────────────────────────────┘
```

#### Estados

Mesmos do TextInput (default, hover, focus, error, disabled, read-only).

#### Acessibilidade

- `aria-describedby` para description + error + counter
- Counter: `aria-live="polite"` quando se aproximar do limite (>90%)
- `autoResize`: nunca menor que `min-h-[80px]`

---

## 4. Componentes Editoriais MOBIO

Componentes exclusivos que distinguem o MOBIO de um SaaS genérico. Inspirados em elementos de publicação impressa transposta para digital.

### 4.1 Eyebrow

Texto pequeno uppercase acima de headlines. Tipicamente marca de seção, categoria ou status.

#### Anatomia

```
NOVA COLEÇÃO                   ← Eyebrow
Primavera/Verão 2027           ← Headline que segue
```

#### Props

```typescript
interface EyebrowProps {
  children: ReactNode;
  variant?: "default" | "accent" | "muted";
  as?: "span" | "p" | "div";
}
```

#### Visual

- `font-sans text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground`
- Variant `accent`: `text-accent` (dourado)
- Variant `muted`: `text-muted-foreground/70`
- Espaço abaixo: `mb-2` (8px) antes da headline

---

### 4.2 Masthead

Header de página no estilo masthead de revista — usado em dashboards e páginas de seção.

#### Anatomia

```
┌──────────────────────────────────────────────────────────────┐
│ EYEBROW                                                       │
│                                                               │
│ Título Principal                               [actions]      │
│ em Fraunces bold                                              │
│                                                               │
│ Descrição curta em Inter regular text-muted-foreground        │
│──────────────────────────────────────────────────────────────│ ← régua
└──────────────────────────────────────────────────────────────┘
```

#### Props

```typescript
interface MastheadProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode; // botões de ação à direita
  withRule?: boolean; // régua abaixo (default: true)
}
```

#### Visual

- Title: `font-heading text-3xl md:text-4xl font-bold tracking-tight`
- Description: `text-base text-muted-foreground mt-2 max-w-2xl`
- Actions: alinhados à direita no desktop, abaixo do título no mobile
- Rule: `border-b border-border mt-6 mb-8`

---

### 4.3 Plate

Card editorial sem sombra. Container de conteúdo com borda fina, título e conteúdo composicional.

#### Anatomia

```
┌─────────────────────────────────────────────┐
│  EYEBROW (opcional)                          │
│  Título da Plate                             │ ← font-heading text-lg
│  ─────────────────────────────────           │ ← régua fina interna
│                                              │
│  [conteúdo — children]                       │
│                                              │
│  [footer — ações ou metadado]                │
└─────────────────────────────────────────────┘
```

#### Props

```typescript
interface PlateProps {
  eyebrow?: string;
  title?: string;
  footer?: ReactNode;
  padded?: boolean; // default: true (p-6)
  accent?: boolean; // borda accent dourada (top ou left)
  children: ReactNode;
}
```

#### Visual

- Container: `border border-border rounded-lg bg-card`
- Sem sombra (editorial rule)
- `accent`: `border-l-2 border-l-accent` ou `border-t-2 border-t-accent`
- Padding: `p-6` (padrão) ou `p-0` quando `padded={false}`

---

### 4.4 Régua (Rule)

Linha horizontal editorial com variações. Elemento de separação visual nobre.

#### Props

```typescript
interface RuleProps {
  variant?: "default" | "accent" | "thick" | "dashed" | "dotted";
  spacing?: "sm" | "md" | "lg";
  label?: string; // texto centralizado sobre a régua (ex: "ou", "seção")
}
```

#### Variants

| Variant   | Visual                                                             |
| --------- | ------------------------------------------------------------------ |
| `default` | `border-t border-border` — 1px sólida, cor de borda padrão         |
| `accent`  | `border-t-2 border-accent` — 2px dourada                           |
| `thick`   | `border-t-2 border-foreground` — 2px preta/branca (bold editorial) |
| `dashed`  | `border-t border-dashed border-border`                             |
| `dotted`  | `border-t border-dotted border-muted-foreground/30`                |

#### Spacing

| Size | Margin  | Uso                        |
| ---- | ------- | -------------------------- |
| `sm` | `my-4`  | Dentro de cards/plates     |
| `md` | `my-8`  | Entre seções de formulário |
| `lg` | `my-12` | Entre seções de página     |

#### Label

```
──────────── ou ────────────
```

Régua com label: `flex items-center gap-4`, texto em `text-xs text-muted-foreground uppercase tracking-wide`.

---

### 4.5 Sidebar Numerada (NumberedNav)

Navegação lateral com numeração editorial — números formatados em Fraunces, estilo índice de revista.

#### Anatomia

```
┌────────────────────────┐
│  MOBIO                 │ ← logo
│                        │
│  01  Salão         ●   │ ← item ativo (dot ou barra)
│  02  Coleções          │
│  03  Produtos          │
│  04  Linesheet         │
│  05  Pedidos           │
│  06  Showroom          │
│  07  Configurações     │
│                        │
│  ──────────────────    │ ← régua
│  [avatar] Nome         │ ← user footer
│  Atelier Name          │
└────────────────────────┘
```

#### Props

```typescript
interface NumberedNavProps {
  items: NavItem[];
  activeItem: string; // path ou id do item ativo
  header?: ReactNode; // logo ou nome no topo
  footer?: ReactNode; // user info no rodapé
}

interface NavItem {
  number: string; // "01", "02", etc.
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number; // notificação (ex: "3" pedidos)
}
```

#### Visual

- Número: `font-heading text-xs font-normal text-muted-foreground tracking-wider` — Fraunces para os dígitos
- Label: `font-sans text-sm font-medium`
- Item ativo: `text-foreground bg-sidebar-accent` + indicador visual:
  - Desktop: barra vertical `border-l-2 border-accent` à esquerda
  - Ou dot accent `●` à direita
- Item hover: `bg-sidebar-accent/50 text-foreground`
- Badge: `Badge variant="accent" size="sm"` — alinhado à direita
- Spacing: `gap-1` entre itens, `px-4 py-2` por item

#### Acessibilidade

- `<nav aria-label="Menu principal">`
- `aria-current="page"` no item ativo
- Keyboard: Tab navega entre itens, Enter ativa

---

### 4.6 Pull Quote

Citação editorial em destaque — usada em páginas de perfil, about, ou destaque de depoimento.

#### Anatomia

```
         ┌─── borda accent esquerda
         │
         │  "A moda não é apenas sobre roupas,
         │   é sobre contar histórias através
         │   dos tecidos."
         │
         │  — Maria Santos, Atelier Aurora
         │
```

#### Props

```typescript
interface PullQuoteProps {
  quote: string;
  attribution?: string; // "— Nome, Cargo"
  variant?: "default" | "centered" | "large";
}
```

#### Visual

- `default`: `border-l-2 border-accent pl-6 py-2`
- Quote text: `font-heading text-xl md:text-2xl italic text-foreground/90 leading-relaxed`
- Attribution: `font-sans text-sm text-muted-foreground mt-3`
- `centered`: sem borda esquerda, texto centralizado, aspas decorativas (Fraunces) acima
- `large`: `text-2xl md:text-3xl`, usado em hero de perfil

---

### 4.7 Page Number Indicator

Indicador editorial de posição/numeração — usado em carousels, listagens paginadas, ou como decoração de seção.

#### Anatomia

```
01 / 12          ← formato fração
──────●──────    ← progress bar (opcional)
```

#### Props

```typescript
interface PageNumberProps {
  current: number;
  total: number;
  variant?: "fraction" | "dot" | "bar";
  showProgress?: boolean;
}
```

#### Visual

- `fraction`: `font-heading text-sm text-muted-foreground` — números em Fraunces, barra "/" em Inter
- `dot`: dots inline, ativo preenchido com accent
- `bar`: progress bar fina, preenchimento proporcional com accent
- Números sempre formatados com zero-pad: "01", "02"

---

### 4.8 Featured Spread

Componente hero no estilo "spread" de revista — imagem grande com overlay de texto. Para coleções em destaque, banners, ou hero de página.

#### Anatomia

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│     bg-image (cover)                                          │
│                                                               │
│     ┌────────────────────────────────┐                        │
│     │  EYEBROW                       │                        │
│     │                                │                        │
│     │  Título Grande                 │                        │
│     │  em Fraunces                   │                        │
│     │                                │                        │
│     │  Descrição curta               │                        │
│     │                                │                        │
│     │  [CTA Button]                  │                        │
│     └────────────────────────────────┘                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### Props

```typescript
interface FeaturedSpreadProps {
  image: string; // URL da imagem de fundo
  imageAlt: string;
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
  overlay?: "dark" | "light" | "gradient";
  height?: "sm" | "md" | "lg" | "full";
  align?: "left" | "center";
}
```

#### Visual

- Container: `relative overflow-hidden rounded-xl`
- Imagem: `object-cover w-full h-full`
- Overlay `dark`: `bg-gradient-to-r from-foreground/70 to-foreground/20`
- Overlay `light`: `bg-gradient-to-r from-background/80 to-background/20`
- Overlay `gradient`: `bg-gradient-to-t from-foreground/60 to-transparent`
- Texto sobre overlay em cor contrastante
- Heights: `sm`=240px, `md`=360px, `lg`=480px, `full`=100vh

#### Acessibilidade

- Imagem de fundo: `role="img" aria-label="[imageAlt]"`
- Contraste do texto sobre overlay: verificar WCAG AA (4.5:1 mínimo)
- CTA: botão claro e focalizável

---

## 5. AppShells

### 5.1 AppShell Atelier

Layout para o shell da fábrica/atelier. Arquivo target: `src/app/(atelier)/layout.tsx`.

#### Estrutura

```
Desktop (≥ 1024px):
┌──────────┬────────────────────────────────────────────────────┐
│          │  [☰?] MOBIO    breadcrumb            🔔 [avatar▼] │ ← Topbar h-14
│  Side    ├────────────────────────────────────────────────────┤
│  bar     │                                                    │
│  240px   │         Conteúdo da página                         │
│          │         max-w-7xl mx-auto px-6                     │
│  01-07   │                                                    │
│          │                                                    │
│          │                                                    │
│          │                                                    │
└──────────┴────────────────────────────────────────────────────┘

Tablet (768px–1023px):
┌────┬──────────────────────────────────────────────────────────┐
│    │  MOBIO    breadcrumb                       🔔 [avatar▼] │
│ 64 ├──────────────────────────────────────────────────────────┤
│ px │                                                          │
│    │         Conteúdo (padding reduzido)                      │
│icon│                                                          │
│only│                                                          │
└────┴──────────────────────────────────────────────────────────┘

Mobile (< 768px):
┌──────────────────────────────────────────┐
│  ☰  MOBIO                    🔔 [AV]    │ ← Topbar h-14
├──────────────────────────────────────────┤
│                                          │
│    Conteúdo full-width px-4              │
│                                          │
│                                          │
└──────────────────────────────────────────┘
  ↓ ☰ abre Sheet (drawer) com sidebar completa
```

#### Sidebar Numerada — Itens Atelier

| Nº  | Label         | Rota             | Ícone (lucide)    |
| --- | ------------- | ---------------- | ----------------- |
| 01  | Salão         | `/salao`         | `LayoutDashboard` |
| 02  | Coleções      | `/colecoes`      | `Layers`          |
| 03  | Produtos      | `/produtos`      | `Package`         |
| 04  | Linesheet     | `/linesheet`     | `FileText`        |
| 05  | Pedidos       | `/pedidos`       | `ShoppingBag`     |
| 06  | Showroom      | `/showroom`      | `Monitor`         |
| 07  | Configurações | `/configuracoes` | `Settings`        |

#### Topbar

- **Desktop/Tablet:** Logo MOBIO à esquerda (texto "MOBIO" em `font-heading font-bold text-lg tracking-wider`) → Breadcrumb centralizado → Ícone notificações (Bell, badge count) → Avatar dropdown (nome, email, trocar tenant, sair)
- **Mobile:** Hamburger (☰) → Logo MOBIO → Notificações → Avatar (xs)
- Altura fixa: `h-14` (56px)
- `sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border`

#### Conteúdo

- `max-w-7xl mx-auto` em desktop
- Padding: `px-6 py-6` desktop, `px-4 py-4` mobile
- Largura total sem max-width em mobile

#### Comportamento Responsivo

| Componente | Mobile (<768)                  | Tablet (768-1023)                   | Desktop (≥1024)                    |
| ---------- | ------------------------------ | ----------------------------------- | ---------------------------------- |
| Sidebar    | Sheet (drawer esquerda, 280px) | Colapsada (64px, só ícones+números) | Expandida (240px)                  |
| Topbar     | Hamburger + logo + avatar      | Logo + breadcrumb + avatar          | Logo + breadcrumb + notif + avatar |
| Conteúdo   | full-width, px-4               | px-6                                | max-w-7xl, px-6                    |

---

### 5.2 AppShell Marketplace (Lojista)

Layout para o shell do lojista. Arquivo target: `src/app/(lojista)/layout.tsx`.

#### Estrutura

```
Desktop (≥ 1024px):
┌──────────┬────────────────────────────────────────────────────┐
│          │  MOBIO  [🔍 Buscar ateliês...   ]  [Linesheet] 🔔 [AV▼] │ ← Topbar h-14
│  Side    ├────────────────────────────────────────────────────┤
│  bar     │                                                    │
│  240px   │         Conteúdo da página                         │
│          │         max-w-7xl mx-auto px-6                     │
│  01-06   │                                                    │
│          │                                                    │
│          │                                                    │
└──────────┴────────────────────────────────────────────────────┘
```

#### Sidebar Numerada — Itens Lojista

| Nº  | Label     | Rota         | Ícone (lucide) |
| --- | --------- | ------------ | -------------- |
| 01  | Praça     | `/praca`     | `Store`        |
| 02  | Descobrir | `/descobrir` | `Compass`      |
| 03  | Boards    | `/boards`    | `LayoutGrid`   |
| 04  | Favoritos | `/favoritos` | `Heart`        |
| 05  | Pedidos   | `/pedidos`   | `ShoppingBag`  |
| 06  | Conta     | `/conta`     | `User`         |

#### Topbar — diferenças do Atelier

- **Search bar:** Campo de busca proeminente no centro da topbar (desktop/tablet). Placeholder: "Buscar ateliês, produtos, coleções..."
  - Mobile: ícone Search na topbar que expande em overlay full-width
- **Botão Linesheet:** `Button variant="accent" size="sm"` com ícone `FileText` — posicionado antes das notificações
  - Mobile: ícone-only na topbar
  - Desktop/Tablet: botão com label "Linesheet"
- O restante segue o mesmo padrão do AppShell Atelier (hamburger mobile, avatar dropdown, etc.)

#### Comportamento Responsivo

Mesmo padrão do Atelier: Sheet em mobile, sidebar colapsada em tablet, expandida em desktop.

---

## 6. Dashboards (Skeleton)

### 6.1 `/salao` — Dashboard Atelier

#### Wireframe Mobile

```
┌──────────────────────────────────────────┐
│  ☰  MOBIO                    🔔  [AV]   │
├──────────────────────────────────────────┤
│                                          │
│  BEM-VINDO AO SALÃO                      │ ← Eyebrow
│  Atelier Aurora                          │ ← font-heading text-2xl
│  Coleção ativa: P/V 2027 • 23 peças     │ ← text-sm text-muted-foreground
│                                          │
│  ──────────────────────────────────────  │ ← Rule
│                                          │
│  ┌────────────┐  ┌────────────┐          │
│  │ 47         │  │ 12         │          │ ← MetricCard (Plate)
│  │ Produtos   │  │ Lojistas   │          │    grid-cols-2
│  │ ativos     │  │ conectados │          │
│  └────────────┘  └────────────┘          │
│  ┌────────────┐  ┌────────────┐          │
│  │ 8          │  │ R$ 24.5k   │          │
│  │ Pedidos    │  │ Faturamento│          │
│  │ abertos    │  │ do mês     │          │
│  └────────────┘  └────────────┘          │
│                                          │
│  ATIVIDADE RECENTE                       │ ← Eyebrow
│  ──────────────────────────────────────  │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ [skeleton line]                  │    │ ← ActivityItem skeleton
│  │ [skeleton line]                  │    │
│  │ [skeleton line]                  │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

#### Wireframe Desktop

```
┌──────────┬────────────────────────────────────────────────────────┐
│          │  MOBIO    Salão > Visão Geral              🔔 [AV▼]   │
│  01 Salão├────────────────────────────────────────────────────────┤
│  02 ...  │                                                        │
│          │  BEM-VINDO AO SALÃO                                    │
│          │  Atelier Aurora                                        │
│          │  Coleção ativa: Primavera/Verão 2027 • 23 peças       │
│          │  ─────────────────────────────────────────────────     │
│          │                                                        │
│          │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│          │  │ 47   │  │ 12   │  │ 8    │  │R$24k │              │
│          │  │Prod. │  │Loj.  │  │Ped.  │  │Fatur.│  ← 4 cols   │
│          │  └──────┘  └──────┘  └──────┘  └──────┘              │
│          │                                                        │
│          │  ATIVIDADE RECENTE          ACESSO RÁPIDO              │
│          │  ─────────────────          ──────────────             │
│          │  [lista de atividades]      [links rápidos]            │
│          │                                                        │
└──────────┴────────────────────────────────────────────────────────┘
```

#### Composição

- **Hero:** Masthead com eyebrow "BEM-VINDO AO SALÃO", título = nome do atelier (font-heading), descrição = coleção ativa + count de peças
- **Métricas:** 4 Plates compactas (accent top-border) em grid: `grid-cols-2 md:grid-cols-4 gap-4`
  - Valor: `font-heading text-3xl font-bold`
  - Label: `text-sm text-muted-foreground`
  - Dados stub (hardcoded na Sprint 2)
- **Atividade recente:** Lista de ActivityItem (skeleton na Sprint 2, dados reais em sprint futura)
- **Acesso rápido (desktop only):** Links para ações frequentes (criar produto, ver pedidos)

---

### 6.2 `/praca` — Dashboard Lojista

#### Wireframe Mobile

```
┌──────────────────────────────────────────┐
│  ☰  MOBIO                    🔔  [AV]   │
├──────────────────────────────────────────┤
│                                          │
│  BOM DIA, NOME                           │ ← Eyebrow (horário dinâmico)
│  O que há de novo na Praça               │ ← font-heading text-2xl
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  NOVIDADES                               │ ← Eyebrow
│  ┌──────────────────────────────────┐    │
│  │  [FeaturedSpread — coleção dest] │    │ ← height="sm"
│  └──────────────────────────────────┘    │
│                                          │
│  ATELIÊS EM DESTAQUE                     │ ← Eyebrow
│  ┌────────┐ ┌────────┐ ┌────────┐        │ ← scroll horizontal
│  │ [logo] │ │ [logo] │ │ [logo] │        │
│  │ Nome   │ │ Nome   │ │ Nome   │        │
│  │ Região │ │ Região │ │ Região │        │
│  └────────┘ └────────┘ └────────┘        │
│                                          │
│  SEUS BOARDS                             │ ← Eyebrow
│  ┌──────────────────────────────────┐    │
│  │ [skeleton cards]                 │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
```

#### Wireframe Desktop

```
┌──────────┬────────────────────────────────────────────────────────────┐
│          │  MOBIO  [🔍 Buscar...]  [Linesheet]           🔔 [AV▼]   │
│  01 Praça├────────────────────────────────────────────────────────────┤
│  02 ...  │                                                            │
│          │  BOM DIA, NOME                                             │
│          │  O que há de novo na Praça                                 │
│          │  ───────────────────────────────────────────────────       │
│          │                                                            │
│          │  ┌──────────────────────────┐  ┌──────────────────┐       │
│          │  │                          │  │ ATELIÊS EM       │       │
│          │  │  FeaturedSpread          │  │ DESTAQUE         │       │
│          │  │  coleção destaque        │  │                  │       │
│          │  │                          │  │ [card] [card]    │       │
│          │  │                          │  │ [card] [card]    │       │
│          │  └──────────────────────────┘  └──────────────────┘       │
│          │                                                            │
│          │  SEUS BOARDS                                               │
│          │  ──────────────                                            │
│          │  [board card] [board card] [board card] [+ Criar]         │
│          │                                                            │
└──────────┴────────────────────────────────────────────────────────────┘
```

#### Composição

- **Hero:** Masthead com eyebrow dinâmico por horário ("BOM DIA" / "BOA TARDE" / "BOA NOITE"), título de convite editorial
- **Novidades:** FeaturedSpread com coleção em destaque (dados stub)
- **Ateliês em destaque:** Grid/scroll horizontal de cards de ateliê (Avatar square + nome + região) — stub
- **Boards recentes:** Cards de boards do lojista — skeleton na Sprint 2

---

## 7. Toast + Notificações Inline

### 7.1 Toast (Sonner)

**Já configurado:** `src/components/ui/toaster.tsx` com Sonner, `position="top-right"`, `richColors`.

#### Posicionamento

| Viewport        | Posição                                       |
| --------------- | --------------------------------------------- |
| Desktop         | `top-right` (padrão Sonner)                   |
| Mobile (<768px) | `top-center` — full-width com padding lateral |

#### Variants

| Variant   | Visual                                          | Uso                                               |
| --------- | ----------------------------------------------- | ------------------------------------------------- |
| `success` | Borda esquerda `success`, ícone CheckCircle     | Ação concluída: "Produto salvo", "Pedido enviado" |
| `error`   | Borda esquerda `destructive`, ícone AlertCircle | Falha: "Erro ao salvar", "Conexão perdida"        |
| `warning` | Borda esquerda `warning`, ícone AlertTriangle   | Atenção: "Limite próximo", "Dados incompletos"    |
| `info`    | Borda esquerda `info`, ícone Info               | Informação: "Nova versão disponível"              |

#### Comportamento

- Auto-dismiss: 5s (default), 8s para erros
- Dismiss manual: swipe ou botão X
- Máximo 3 toasts empilhados
- Z-index: 70 (acima de modais)
- Ação opcional: botão inline ("Desfazer", "Tentar novamente")

#### Acessibilidade

- `role="alert"` com `aria-live="assertive"` para erros
- `aria-live="polite"` para success/info
- Focalizável e dismissable via Escape

### 7.2 Notificações Inline (Banner)

Banners persistentes dentro do conteúdo — para informações que exigem atenção contínua.

#### Anatomia

```
┌────────────────────────────────────────────────────────────────┐
│ [icon]  Mensagem do banner com texto descritivo    [action?] [X] │
└────────────────────────────────────────────────────────────────┘
```

#### Props

```typescript
interface InlineBannerProps {
  variant: "info" | "warning" | "error" | "success";
  title?: string;
  description: string;
  action?: { label: string; onClick: () => void };
  dismissable?: boolean;
  onDismiss?: () => void;
}
```

#### Visual

- Container: `rounded-lg border px-4 py-3 flex items-start gap-3`
- Cores por variant: fundo e borda sutis da cor semântica (ex: `bg-warning/5 border-warning/20`)
- Ícone: mesma escala dos toasts (20px)
- Dismiss: ícone X à direita, `aria-label="Fechar notificação"`

---

## 8. Showcase `/_design-system`

Página interna de demonstração do design system — acessível apenas em ambiente de desenvolvimento.

### Guard

- Verificar `process.env.NODE_ENV === "development"` no server component
- Em produção: retornar `notFound()` (404)
- Rota: `src/app/_design-system/page.tsx` (prefixo `_` para não conflitar com rotas reais)

### Layout

```
Desktop:
┌────────────────┬──────────────────────────────────────────────┐
│                │                                              │
│  Navegação     │  Título da Seção                             │
│  por seção     │  ──────────────                              │
│                │                                              │
│  > Cores       │  [componentes renderizados com               │
│    Tipografia  │   todas as variants e estados]               │
│    Botões      │                                              │
│    Badges      │                                              │
│    Inputs      │                                              │
│    Tabs        │                                              │
│    Editoriais  │                                              │
│    Ícones      │                                              │
│                │                                              │
└────────────────┴──────────────────────────────────────────────┘

Mobile:
- Navegação por seção como Tabs horizontais (scroll) no topo
- Conteúdo abaixo em full-width
```

### Seções

| Seção      | Conteúdo                                                                           |
| ---------- | ---------------------------------------------------------------------------------- |
| Cores      | Swatches de toda a paleta (light + dark side-by-side), semáforo, sidebar tokens    |
| Tipografia | Escala completa (text-xs a text-6xl), ambas fontes, pesos                          |
| Botões     | Grid de todas variants x sizes, estados (hover, disabled, loading)                 |
| Badges     | Todas variants, sizes, com/sem dot, removable                                      |
| Inputs     | TextInput, Select, Textarea — todos estados (default, focus, error, disabled)      |
| Tabs       | Variants (default, underline, pill) com conteúdo exemplo                           |
| Avatares   | Todas sizes, shapes, com/sem status, fallback                                      |
| Editoriais | Eyebrow, Masthead, Plate, Rule, NumberedNav, PullQuote, PageNumber, FeaturedSpread |
| Ícones     | Grid dos ícones mais usados no projeto com sizes                                   |
| Toast      | Botões que disparam cada variant de toast                                          |
| Banners    | Inline banners em todas variants                                                   |

### Navegação

- Desktop: sidebar fixa com scroll-spy (`IntersectionObserver`), links que scrollam até a seção
- Mobile: tabs horizontais scrolláveis no topo (variant `underline`)

---

## 9. Página `/fabrica/[slug]`

Perfil público da fábrica/atelier — visível para lojistas. Estrutura inicial na Sprint 2, dados reais em sprints futuras.

### Rota

`src/app/(lojista)/fabrica/[slug]/page.tsx`

### Wireframe Mobile

```
┌──────────────────────────────────────────┐
│  ← Voltar                   [♡] [...]   │ ← Topbar com back
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐    │
│  │          [HERO IMAGE]            │    │ ← FeaturedSpread height="md"
│  │                                  │    │
│  │   [logo]  ATELIER AURORA         │    │
│  │           São Paulo, SP          │    │
│  │           ● Coleção ativa        │    │
│  └──────────────────────────────────┘    │
│                                          │
│  SOBRE                                   │ ← Eyebrow
│  ──────────────────────────────────────  │
│  "Descrição do atelier com texto         │
│   editorial curto, tom profissional."    │
│                                          │
│  COLEÇÕES                                │ ← Eyebrow
│  ──────────────────────────────────────  │
│  [placeholder — a ser implementado]      │
│                                          │
│  CONTATO                                 │ ← Eyebrow
│  ──────────────────────────────────────  │
│  [placeholder — a ser implementado]      │
│                                          │
└──────────────────────────────────────────┘
```

### Wireframe Desktop

```
┌──────────┬────────────────────────────────────────────────────────────────┐
│          │  MOBIO  [🔍 Buscar...]  [Linesheet]                🔔 [AV▼]  │
│  Sidebar ├────────────────────────────────────────────────────────────────┤
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────┐      │
│          │  │              HERO IMAGE (FeaturedSpread)             │      │
│          │  │                                                      │      │
│          │  │    [logo]  ATELIER AURORA                            │      │
│          │  │            São Paulo, SP • ● Coleção ativa          │      │
│          │  │                                           [♡] [...] │      │
│          │  └──────────────────────────────────────────────────────┘      │
│          │                                                                │
│          │  ┌───────────────────────────┐  ┌──────────────────────┐      │
│          │  │ SOBRE                     │  │ DADOS RÁPIDOS        │      │
│          │  │ ─────                     │  │ ──────────           │      │
│          │  │ Texto descritivo do       │  │ Fundação: 2019      │      │
│          │  │ atelier...                │  │ Peças: 120+         │      │
│          │  │                           │  │ Segmentos: Casual   │      │
│          │  │                           │  │ [Solicitar Catálogo]│      │
│          │  └───────────────────────────┘  └──────────────────────┘      │
│          │                                                                │
│          │  COLEÇÕES [placeholder]                                        │
│          │  CONTATO  [placeholder]                                        │
│          │                                                                │
└──────────┴────────────────────────────────────────────────────────────────┘
```

### Composição

- **Hero:** FeaturedSpread com imagem de capa do atelier, overlay gradient, logo (Avatar square lg) + nome + localização + status
- **Sobre:** Plate com descrição editorial (PullQuote opcional se tiver frase marcante)
- **Dados rápidos (desktop sidebar):** Plate accent com metadados (fundação, segmento, count de peças, CTA)
- **Coleções:** Placeholder — grid de coleções com imagens (Sprint 5)
- **Contato:** Placeholder — informações de contato (Sprint 5)

### Ações

- Favoritar (Heart icon toggle) — visível no hero
- Menu (...) — "Compartilhar", "Reportar" (futuro)
- "Solicitar Catálogo" — CTA accent (dados rápidos)

---

## 10. Estados

### 10.1 Skeleton (Loading)

| Tipo de conteúdo      | Padrão                                                                             | Comportamento                             |
| --------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| Texto (título, label) | Retângulo `bg-muted rounded-md animate-pulse`                                      | Largura proporcional ao esperado (60-80%) |
| Métrica numérica      | Retângulo `bg-muted rounded-md animate-pulse` h-8 w-16                             | Dimensão fixa do número                   |
| Card                  | Plate com 3-4 linhas skeleton internas                                             | Mantém a forma do card real               |
| Lista                 | 3-5 items skeleton empilhados                                                      | Padding e gap iguais à lista real         |
| Imagem                | Retângulo `bg-muted rounded-lg` com ícone Image centralizado (muted-foreground/30) | Mesma aspect-ratio da imagem real         |
| Avatar                | Círculo `bg-muted animate-pulse`                                                   | Mesmo size do avatar real                 |
| Gráfico               | Retângulo `bg-muted rounded-lg` h-48                                               | Placeholder genérico                      |

**Shimmer:** Usar `animate-pulse` do Tailwind (opacity pulse). Não usar shimmer horizontal — mantém visual mais limpo e editorial.

**Regra:** Header, sidebar e topbar renderizam imediatamente (SSR). Apenas o conteúdo dinâmico da área principal exibe skeleton.

### 10.2 Empty State

Tela sem dados — primeira vez ou após limpar dados.

#### Anatomia

```
┌──────────────────────────────────────────┐
│                                          │
│            [ícone lucide 48px]           │ ← text-muted-foreground
│                                          │
│        Nenhum produto ainda              │ ← font-heading text-xl
│                                          │
│   Comece adicionando seu primeiro        │ ← text-sm text-muted-foreground
│   produto ao catálogo.                   │
│                                          │
│         [+ Adicionar produto]            │ ← Button variant="default"
│                                          │
└──────────────────────────────────────────┘
```

#### Regras

- Ícone contextual (Package para produtos, ShoppingBag para pedidos, Layers para coleções)
- Título em Fraunces (`font-heading`), nunca genérico — sempre contextual à seção
- Descrição curta e orientativa (o que fazer a seguir)
- CTA primário quando houver ação possível
- Centralizado vertical e horizontalmente na área de conteúdo

### 10.3 Loading (ação)

Para ações de botão (submit, delete, etc.) — não confundir com skeleton de página.

| Contexto     | Padrão                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------ |
| Botão submit | `loading` prop: ícone Loader2 com `animate-spin`, texto "Salvando..." ou mantido, botão disabled |
| Botão delete | `loading` prop + confirmação prévia via Dialog                                                   |
| Navegação    | Skeleton da página de destino (não spinner full-screen)                                          |
| Upload       | Progress bar (futuro — Sprint 5+) com porcentagem                                                |

### 10.4 Error

#### Error de rede/servidor (dentro de página)

```
┌──────────────────────────────────────────┐
│                                          │
│           [ícone AlertCircle 32px]       │ ← text-destructive
│                                          │
│       Não foi possível carregar          │ ← text-lg font-medium
│                                          │
│   Verifique sua conexão e tente          │ ← text-sm text-muted-foreground
│   novamente.                             │
│                                          │
│         [Tentar novamente]               │ ← Button variant="outline"
│                                          │
└──────────────────────────────────────────┘
```

#### Error boundary (crash de componente)

- Capturado por `error.tsx` do route group
- Layout (sidebar, topbar) permanece intacto
- Apenas a área de conteúdo exibe a mensagem de erro
- Botão "Tentar novamente" chama `reset()` do error boundary
- Report automático ao Sentry

#### 404 — Página não encontrada

- Layout: sem sidebar (layout mínimo)
- Ícone: `FileQuestion` 64px `text-muted-foreground`
- Título: "Página não encontrada" (`font-heading text-2xl`)
- Descrição: "A página que você procura não existe ou foi movida."
- CTA: Button → "Voltar ao início"

#### 500 — Erro interno

- Layout: sem sidebar
- Ícone: `ServerCrash` 64px `text-destructive/70`
- Título: "Algo deu errado"
- Descrição: "Ocorreu um erro inesperado. Nossa equipe foi notificada."
- Ações: Button "Tentar novamente" (reload) + Link ghost "Voltar ao início"

---

## 11. Acessibilidade

### Requisitos globais (WCAG 2.1 AA)

| Requisito          | Implementação                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Contraste texto    | ≥ 4.5:1 texto normal, ≥ 3:1 texto grande (18px bold / 24px regular)                        |
| Contraste UI       | ≥ 3:1 para bordas de input, ícones funcionais, indicadores                                 |
| Cor como indicador | Nunca isolada — sempre acompanhada de ícone e/ou texto                                     |
| Focus visible      | `focus-visible:ring-3 focus-ring/50 focus-visible:border-ring` em todo elemento interativo |
| Touch targets      | Mínimo 44×44px em mobile, 32×32px em desktop                                               |
| Keyboard nav       | Tab navega sequencialmente, Escape fecha overlays, Arrow keys em listas/tabs               |
| Screen reader      | `aria-label` em botões icon-only, `aria-live` em conteúdo dinâmico                         |
| Reduced motion     | `motion-safe:` em todas as animações, ou media query `prefers-reduced-motion`              |

### Por componente

| Componente     | ARIA / Keyboard                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| Button         | `aria-label` em icon-only, `aria-busy` em loading, `aria-disabled` quando disabled |
| Badge          | `role="status"` quando dinâmico                                                    |
| Tabs           | `role="tablist/tab/tabpanel"`, Arrow Left/Right, Home/End                          |
| Avatar         | `alt` obrigatório, fallback com `aria-label`                                       |
| Select         | `role="listbox"`, `aria-expanded`, Arrow Up/Down, Enter, Escape, type-ahead        |
| Sidebar        | `<nav aria-label>`, `aria-current="page"` no ativo                                 |
| Toast          | `role="alert"` + `aria-live`, dismissable por Escape                               |
| Banner         | `role="alert"` ou `role="status"` conforme urgência                                |
| Modal/Dialog   | `aria-modal="true"`, focus trap, Escape fecha                                      |
| FeaturedSpread | Imagem com `role="img" aria-label`, CTA focalizável                                |

### Verificação

Ferramentas recomendadas para o Stack Agent:

- `eslint-plugin-jsx-a11y` (integrado ao lint)
- axe DevTools (validação no browser)
- Teste manual de keyboard navigation em cada shell

---

## 12. Mobile-First

### Princípios

1. **Projetar para 375px primeiro** — expandir com breakpoints `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
2. **Touch targets ≥ 44px** em todo elemento interativo mobile
3. **Ações primárias no thumb zone** — parte inferior da tela (CTAs, FABs)
4. **Sidebar → Sheet/Drawer** em telas < 768px
5. **Conteúdo nunca escondido** — repriorizado, reorganizado, mas não removido

### Breakpoints e adaptações globais

| Componente       | < 768px (Mobile)           | 768–1023px (Tablet)         | ≥ 1024px (Desktop)      |
| ---------------- | -------------------------- | --------------------------- | ----------------------- |
| Sidebar          | Sheet (drawer, 280px)      | Colapsada (64px, ícones)    | Expandida (240px)       |
| Topbar           | Hamburger + logo + avatar  | Logo + breadcrumb + avatar  | Completa                |
| Search (Lojista) | Ícone → overlay full-width | Inline na topbar (reduzida) | Inline na topbar (full) |
| Metric cards     | grid-cols-2                | grid-cols-4                 | grid-cols-4             |
| Atelier cards    | Scroll horizontal          | Grid 2-3 cols               | Grid 3-4 cols           |
| Board cards      | Empilhados                 | Grid 2 cols                 | Grid 3-4 cols           |
| FeaturedSpread   | height="sm" (240px)        | height="md" (360px)         | height="lg" (480px)     |
| Showcase nav     | Tabs horizontal scroll     | Sidebar fixa                | Sidebar fixa            |

### Tipografia responsiva

| Elemento      | Mobile             | Desktop            |
| ------------- | ------------------ | ------------------ |
| H1 (Masthead) | `text-2xl` (24px)  | `text-4xl` (36px)  |
| H2            | `text-xl` (20px)   | `text-2xl` (24px)  |
| Body          | `text-base` (16px) | `text-base` (16px) |
| Caption       | `text-xs` (12px)   | `text-xs` (12px)   |

---

## 13. Complementos Aprovados

| Lib              | Justificativa                                                 | Onde usar            |
| ---------------- | ------------------------------------------------------------- | -------------------- |
| **Sonner**       | Já instalado e configurado em `src/components/ui/toaster.tsx` | Toasts em todo o app |
| **lucide-react** | Biblioteca de ícones padrão do projeto                        | Todos os ícones      |

**Não recomendados para Sprint 2:**

- Tremor: desnecessário — métricas são simples (4 cards stub). Recharts quando houver gráficos reais
- TanStack Table: sem tabelas complexas na Sprint 2. Avaliar em sprint de Pedidos
- Vaul: Sheet do shadcn resolve a sidebar mobile. Reavaliar se surgir padrão bottom-sheet
- cmdk: sem command palette planejada. Avaliar para sprint de busca avançada

---

## Análise e Direção Visual

### Sinais derivados do projeto

| Sinal                                                    | Direção                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| B2B fashion marketplace                                  | Editorial, sofisticado, confiança                                   |
| Personas: donos de ateliê + compradores multimarca       | Profissional mas com senso estético apurado                         |
| Dois shells (Atelier + Lojista)                          | Design system unificado, shells diferenciados pela sidebar e topbar |
| Density: misto (dashboard = métricas, catálogo = visual) | Layouts adaptáveis por contexto                                     |

### Direção escolhida

**"Revista de Moda Editorial"** — confirmada desde Sprint 0. Paleta warm-neutral oklch com accent dourado, Fraunces como display serif, Inter para leitura. Sombras mínimas, elevação via bordas e réguas. Numeração lateral como assinatura visual.

### Referências

- Estética de revistas como Vogue, Harper's Bazaar transposta para dashboard SaaS
- Padrão clean de plataformas B2B como Faire, NuORDER (mas com personalidade editorial)

---

_Documento de especificação — Sprint 2 MOBIO. Não contém código de implementação._
_Tokens em `src/app/globals.css`, fontes em `src/config/fonts.ts`, brand em `src/config/brand.ts`._
