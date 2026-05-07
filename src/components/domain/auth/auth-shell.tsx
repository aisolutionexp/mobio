import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            MOBIO
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Fashion marketplace B2B
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

export function AuthFooterLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
