import { notFound } from "next/navigation";

const SECTIONS = [
  { id: "tokens", label: "Tokens" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "tabs", label: "Tabs" },
  { id: "avatars", label: "Avatars" },
  { id: "icons", label: "Icons" },
  { id: "inputs", label: "Inputs" },
  { id: "editorial", label: "Editoriais" },
  { id: "states", label: "Estados" },
  { id: "appshell", label: "AppShell" },
  { id: "toasts", label: "Toasts" },
];

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="border-border bg-card sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r p-6 lg:block">
        <h2 className="font-heading mb-4 text-lg font-bold">Design System</h2>
        <nav aria-label="Seções do design system">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-3 py-1.5 text-sm transition-colors"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main id="main-content" className="flex-1 px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
