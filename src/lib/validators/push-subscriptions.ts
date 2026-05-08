import { z } from "zod";

export const subscriptionIdSchema = z.string().uuid("Assinatura inválida");

export const subscribeToPushSchema = z.object({
  endpoint: z.string().url("Endpoint inválido"),
  p256dh: z.string().min(1, "Chave p256dh é obrigatória"),
  auth: z.string().min(1, "Chave auth é obrigatória"),
  user_agent: z.string().max(500).optional(),
});

export type SubscribeToPushInput = z.infer<typeof subscribeToPushSchema>;
