"use client";

import {
  Package,
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Heart,
  Star,
  Layers,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { TextInput } from "@/components/ui/text-input";
import {
  Field,
  FieldLabel,
  FieldControl,
  FieldHint,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Eyebrow } from "@/components/editorial/eyebrow";
import { Masthead } from "@/components/editorial/masthead";
import { Plate } from "@/components/editorial/plate";
import { Rule } from "@/components/editorial/rule";
import { NumberedNav } from "@/components/editorial/numbered-nav";
import { PullQuote } from "@/components/editorial/pull-quote";
import { PageNumber } from "@/components/editorial/page-number";
import { FeaturedSpread } from "@/components/editorial/featured-spread";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-6 py-8">
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      <Rule spacing="sm" variant="accent" />
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`border-border size-12 rounded-lg border ${className}`} />
      <span className="text-muted-foreground text-xs">{name}</span>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-0">
      <Masthead
        eyebrow="MOBIO"
        title="Design System"
        description="Showcase visual de todos os componentes, tokens e padrões do MOBIO."
      />

      {/* 1. Tokens */}
      <Section id="tokens" title="1. Tokens">
        <div className="space-y-6">
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Cores
            </h3>
            <div className="flex flex-wrap gap-4">
              <Swatch name="Background" className="bg-background" />
              <Swatch name="Foreground" className="bg-foreground" />
              <Swatch name="Primary" className="bg-primary" />
              <Swatch name="Secondary" className="bg-secondary" />
              <Swatch name="Accent" className="bg-accent" />
              <Swatch name="Muted" className="bg-muted" />
              <Swatch name="Card" className="bg-card" />
              <Swatch name="Destructive" className="bg-destructive" />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Tipografia
            </h3>
            <div className="space-y-2">
              <p className="font-heading text-5xl font-bold tracking-tight">
                Fraunces Display (5xl)
              </p>
              <p className="font-heading text-4xl font-bold tracking-tight">
                Fraunces H1 (4xl)
              </p>
              <p className="font-heading text-3xl font-bold">
                Fraunces H2 (3xl)
              </p>
              <p className="font-heading text-2xl font-semibold">
                Fraunces H3 (2xl)
              </p>
              <p className="text-xl font-medium">Inter H4 (xl)</p>
              <p className="text-lg">Inter body large (lg)</p>
              <p className="text-base">Inter body (base)</p>
              <p className="text-muted-foreground text-sm">
                Inter auxiliar (sm)
              </p>
              <p className="text-muted-foreground text-xs">
                Inter caption (xs)
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Espaçamento (base-4)
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div
                    className="bg-accent"
                    style={{ width: n * 4, height: n * 4 }}
                  />
                  <span className="text-muted-foreground text-xs">
                    {n * 4}px
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Buttons */}
      <Section id="buttons" title="2. Buttons">
        <div className="space-y-6">
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Variants
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button variant="accent">Accent</Button>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Sizes
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Buscar">
                <Search />
              </Button>
              <Button size="icon-sm" aria-label="Buscar">
                <Search />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              States
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button variant="accent">
                <ArrowRight data-icon="inline-end" />
                Com ícone
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Badges */}
      <Section id="badges" title="3. Badges">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge dot>Com dot</Badge>
            <Badge variant="accent" size="lg">
              Large
            </Badge>
            <Badge variant="success" size="sm">
              Small
            </Badge>
          </div>
        </div>
      </Section>

      {/* 4. Tabs */}
      <Section id="tabs" title="4. Tabs">
        <div className="space-y-6">
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Default
            </h3>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Geral</TabsTrigger>
                <TabsTrigger value="tab2">Detalhes</TabsTrigger>
                <TabsTrigger value="tab3">Configurações</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p className="text-muted-foreground py-4 text-sm">
                  Conteúdo da aba Geral
                </p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="text-muted-foreground py-4 text-sm">
                  Conteúdo da aba Detalhes
                </p>
              </TabsContent>
              <TabsContent value="tab3">
                <p className="text-muted-foreground py-4 text-sm">
                  Conteúdo da aba Configurações
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Underline
            </h3>
            <Tabs defaultValue="tab1">
              <TabsList variant="underline">
                <TabsTrigger value="tab1">Produtos</TabsTrigger>
                <TabsTrigger value="tab2">Pedidos</TabsTrigger>
                <TabsTrigger value="tab3" disabled>
                  Relatórios
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <p className="text-muted-foreground py-4 text-sm">
                  Conteúdo Produtos
                </p>
              </TabsContent>
              <TabsContent value="tab2">
                <p className="text-muted-foreground py-4 text-sm">
                  Conteúdo Pedidos
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Pill
            </h3>
            <Tabs defaultValue="all">
              <TabsList variant="pill">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="draft">Rascunho</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <p className="text-muted-foreground py-4 text-sm">Todos</p>
              </TabsContent>
              <TabsContent value="active">
                <p className="text-muted-foreground py-4 text-sm">Ativos</p>
              </TabsContent>
              <TabsContent value="draft">
                <p className="text-muted-foreground py-4 text-sm">Rascunho</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Section>

      {/* 5. Avatars */}
      <Section id="avatars" title="5. Avatars">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <Avatar alt="Ana" fallback="A" size="xs" />
            <Avatar alt="Bruno" fallback="B" size="sm" />
            <Avatar alt="Carlos" fallback="C" size="md" />
            <Avatar alt="Diana" fallback="D" size="lg" />
            <Avatar alt="Eduardo" fallback="E" size="xl" />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Avatar
              alt="Atelier Aurora"
              fallback="AA"
              size="lg"
              shape="square"
            />
            <Avatar alt="Online" fallback="ON" size="md" status="online" />
            <Avatar alt="Away" fallback="AW" size="md" status="away" />
            <Avatar alt="Busy" fallback="BU" size="md" status="busy" />
            <Avatar alt="Offline" fallback="OF" size="md" status="offline" />
          </div>
        </div>
      </Section>

      {/* 6. Icons */}
      <Section id="icons" title="6. Icons">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col items-center gap-1">
            <Icon name={Package} size="xs" />
            <span className="text-muted-foreground text-xs">xs</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name={Search} size="sm" />
            <span className="text-muted-foreground text-xs">sm</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name={Heart} size="md" />
            <span className="text-muted-foreground text-xs">md</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name={Star} size="lg" />
            <span className="text-muted-foreground text-xs">lg</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Icon name={Layers} size="xl" />
            <span className="text-muted-foreground text-xs">xl</span>
          </div>
        </div>
      </Section>

      {/* 7. Inputs */}
      <Section id="inputs" title="7. Inputs">
        <div className="max-w-md space-y-6">
          <TextInput label="Nome completo" placeholder="Digite seu nome" />
          <TextInput
            label="E-mail"
            placeholder="email@exemplo.com"
            leftIcon={Search}
          />
          <TextInput
            label="Com erro"
            placeholder="Campo obrigatório"
            error="Este campo é obrigatório"
          />
          <TextInput label="Desabilitado" placeholder="Não editável" disabled />

          <Rule spacing="sm" />

          <Field>
            <FieldLabel>Campo com Field wrapper</FieldLabel>
            <FieldControl>
              <Input placeholder="Input dentro de Field" />
            </FieldControl>
            <FieldHint>Texto auxiliar abaixo do campo</FieldHint>
          </Field>

          <Field>
            <FieldLabel>Campo com erro</FieldLabel>
            <FieldControl>
              <Input placeholder="Valor inválido" aria-invalid="true" />
            </FieldControl>
            <FieldError>Mensagem de erro de validação</FieldError>
          </Field>

          <Rule spacing="sm" />

          <Select
            options={[
              { value: "sp", label: "São Paulo" },
              { value: "rj", label: "Rio de Janeiro" },
              { value: "mg", label: "Minas Gerais" },
            ]}
            placeholder="Selecione um estado"
          />

          <Rule spacing="sm" />

          <Textarea placeholder="Escreva uma descrição..." />
          <Textarea placeholder="Com contador" maxLength={200} />
        </div>
      </Section>

      {/* 8. Editorial */}
      <Section id="editorial" title="8. Componentes Editoriais">
        <div className="space-y-8">
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Eyebrow
            </h3>
            <div className="space-y-2">
              <Eyebrow>Default</Eyebrow>
              <br />
              <Eyebrow variant="accent">Accent</Eyebrow>
              <br />
              <Eyebrow variant="muted">Muted</Eyebrow>
              <br />
              <Eyebrow withRule>Com régua</Eyebrow>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Masthead
            </h3>
            <Masthead
              eyebrow="Nova Coleção"
              title="Primavera/Verão 2027"
              description="Explore as últimas tendências em tecidos sustentáveis."
              actions={<Button variant="accent">Ver coleção</Button>}
            />
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Plate
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Plate eyebrow="Estatística" title="Produtos ativos">
                <p className="font-heading text-3xl font-bold">47</p>
              </Plate>
              <Plate accent title="Com accent border">
                <p className="text-muted-foreground text-sm">
                  Card com borda dourada lateral.
                </p>
              </Plate>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Réguas (Rule)
            </h3>
            <div className="space-y-2">
              <Rule variant="default" spacing="sm" />
              <Rule variant="accent" spacing="sm" />
              <Rule variant="thick" spacing="sm" />
              <Rule variant="dashed" spacing="sm" />
              <Rule variant="dotted" spacing="sm" />
              <Rule variant="default" spacing="sm" label="ou" />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Pull Quote
            </h3>
            <PullQuote
              quote="A moda não é apenas sobre roupas, é sobre contar histórias através dos tecidos."
              attribution="Maria Santos, Atelier Aurora"
            />
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Page Number
            </h3>
            <div className="flex flex-wrap gap-6">
              <PageNumber current={1} total={12} variant="fraction" />
              <PageNumber current={3} total={5} variant="dot" />
              <PageNumber current={7} total={12} variant="bar" showProgress />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Numbered Nav (preview)
            </h3>
            <div className="border-border bg-sidebar w-60 rounded-lg border p-2">
              <NumberedNav
                items={[
                  {
                    number: "01",
                    label: "Salão",
                    href: "#",
                    icon: LayoutDashboard,
                  },
                  {
                    number: "02",
                    label: "Coleções",
                    href: "#colecoes",
                    icon: Layers,
                  },
                  {
                    number: "03",
                    label: "Produtos",
                    href: "#produtos",
                    icon: Package,
                  },
                ]}
                activeHref="#"
              />
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              FeaturedSpread
            </h3>
            <div className="space-y-6">
              <FeaturedSpread
                image="/globe.svg"
                imageAlt="Coleção Primavera/Verão"
                eyebrow="Destaque"
                title="Coleção Primavera/Verão 2027"
                description="Tecidos sustentáveis com design contemporâneo."
                overlay="dark"
                height="sm"
                cta={{ label: "Ver coleção", href: "#" }}
              />
              <FeaturedSpread
                image="/next.svg"
                imageAlt="Novos tecidos"
                eyebrow="Lançamento"
                title="Novos Tecidos Italianos"
                description="Importação direta com exclusividade para ateliês parceiros."
                overlay="light"
                height="sm"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* 9. States */}
      <Section id="states" title="9. Estados">
        <div className="space-y-6">
          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Skeleton (Loading)
            </h3>
            <Plate>
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            </Plate>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Empty State
            </h3>
            <Plate className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <Package className="text-muted-foreground size-12" />
                <p className="font-heading text-xl font-semibold">
                  Nenhum produto ainda
                </p>
                <p className="text-muted-foreground max-w-xs text-sm">
                  Comece adicionando seu primeiro produto ao catálogo.
                </p>
                <Button className="mt-2">Adicionar produto</Button>
              </div>
            </Plate>
          </div>

          <div>
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
              Error State
            </h3>
            <Plate className="py-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="text-destructive size-10" />
                <p className="font-heading text-lg font-semibold">
                  Algo deu errado
                </p>
                <p className="text-muted-foreground max-w-xs text-sm">
                  Não foi possível carregar os dados. Tente novamente.
                </p>
                <Button variant="outline" className="mt-2">
                  Tentar novamente
                </Button>
              </div>
            </Plate>
          </div>
        </div>
      </Section>

      {/* 10. AppShell */}
      <Section id="appshell" title="10. AppShell (Preview)">
        <Plate>
          <p className="text-muted-foreground text-sm">
            Os AppShells Atelier e Marketplace estão implementados nos layouts
            de rota:
          </p>
          <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm">
            <li>
              <code className="text-xs">/atelier/*</code> — Sidebar 01-07,
              topbar com breadcrumb
            </li>
            <li>
              <code className="text-xs">/lojista/*</code> — Sidebar 01-06,
              topbar com busca + Linesheet
            </li>
          </ul>
        </Plate>
      </Section>

      {/* 11. Toasts */}
      <Section id="toasts" title="11. Toasts e Notificações">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            onClick={() => toast.success("Produto salvo com sucesso")}
          >
            <CheckCircle data-icon="inline-start" className="size-3.5" />
            Toast Success
          </Button>
          <Button
            variant="destructive"
            onClick={() => toast.error("Erro ao salvar produto")}
          >
            <AlertCircle data-icon="inline-start" className="size-3.5" />
            Toast Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Dados incompletos")}
          >
            <AlertTriangle data-icon="inline-start" className="size-3.5" />
            Toast Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.info("Nova versão disponível")}
          >
            <Info data-icon="inline-start" className="size-3.5" />
            Toast Info
          </Button>
        </div>
      </Section>
    </div>
  );
}
