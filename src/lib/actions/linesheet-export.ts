"use server";

import { z } from "zod";

import { requireRetailerAccess } from "@/lib/services/active-tenant";
import type { ActionResult } from "@/types/actions";

const uuidSchema = z.string().uuid();

export async function generateLinesheetPDF(
  linesheetId: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const parsed = uuidSchema.safeParse(linesheetId);
    if (!parsed.success) return { success: false, error: "ID inválido" };

    await requireRetailerAccess();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const url = `${baseUrl}/api/linesheets/${parsed.data}/pdf`;

    return { success: true, data: { url } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro interno do servidor";
    return { success: false, error: message };
  }
}
