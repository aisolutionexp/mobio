import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  resolveShell,
  SHELL_HOME,
  type AppMetadata,
} from "@/lib/auth/permissions";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/entrar?error=invalid_link", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/entrar?error=invalid_link", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/entrar?error=invalid_link", origin));
  }

  const metadata = user.app_metadata as AppMetadata | undefined;
  const shell = resolveShell(metadata);

  if (shell) {
    return NextResponse.redirect(new URL(SHELL_HOME[shell], origin));
  }

  const activeRole = metadata?.active_role;
  if (
    activeRole === "admin" ||
    (!activeRole && metadata?.roles?.some((r) => r.role === "admin"))
  ) {
    return NextResponse.redirect(new URL("/admin", origin));
  }

  return NextResponse.redirect(new URL("/entrar", origin));
}
