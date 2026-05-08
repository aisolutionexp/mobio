import { z } from "zod";

export const notificationIdSchema = z.string().uuid("Notificação inválida");

export const listNotificationsSchema = z.object({
  unreadOnly: z.boolean().optional(),
  page: z.coerce.number().int().min(0).optional(),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
