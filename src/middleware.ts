import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // TODO Sprint 1: extract active_role from JWT app_metadata
  // TODO Sprint 1: route to correct shell based on role
  // TODO Sprint 1: redirect unauthenticated users to /login
  // TODO Sprint 1: block access to unauthorized route groups

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
