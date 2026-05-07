const SITE_URL = Deno.env.get("SITE_URL") ?? "*";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": SITE_URL,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
