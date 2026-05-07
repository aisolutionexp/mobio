import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  resolveShell,
  ROLE_PATH_PREFIXES,
  SHELL_HOME,
  type AppMetadata,
  type Role,
} from "@/lib/auth/permissions";

const PUBLIC_PATHS = [
  "/",
  "/entrar",
  "/cadastro/fabrica",
  "/cadastro/lojista",
  "/auth/callback",
  "/api/health",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/.test(pathname)
  );
}

function isRoleAllowedOnPath(role: Role, pathname: string): boolean {
  const allowed = ROLE_PATH_PREFIXES[role];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }
    return new NextResponse("Service unavailable", { status: 500 });
  }

  const { response, user } = await updateSession(request);

  if (!user) {
    if (isPublicPath(pathname)) {
      return response;
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/entrar";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const metadata = user.app_metadata as AppMetadata | undefined;
  const shell = resolveShell(metadata);
  const activeRole = metadata?.active_role;

  if (isPublicPath(pathname)) {
    if (shell) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = SHELL_HOME[shell];
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  if (!shell || !activeRole) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/entrar";
    return NextResponse.redirect(redirectUrl);
  }

  if (!isRoleAllowedOnPath(activeRole, pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = SHELL_HOME[shell];
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_vercel|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
