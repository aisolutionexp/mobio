import { z } from "zod";

export const showroomIdSchema = z.string().uuid("Showroom inválido");
export const slotIdSchema = z.string().uuid("Slot inválido");
export const bookingIdSchema = z.string().uuid("Reserva inválida");

export const createShowroomSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Máximo 100 caracteres"),
  type: z.enum(["physical", "virtual"], {
    message: "Tipo deve ser physical ou virtual",
  }),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  event_date: z.string().datetime({ offset: true }).optional(),
  location: z.string().max(200, "Máximo 200 caracteres").optional(),
  capacity: z.coerce
    .number()
    .int()
    .positive("Capacidade deve ser positiva")
    .optional(),
});

export const updateShowroomSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100).optional(),
  type: z.enum(["physical", "virtual"]).optional(),
  description: z.string().max(500).optional().nullable(),
  event_date: z.string().datetime({ offset: true }).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  status: z
    .enum(["draft", "published", "active", "ended", "cancelled"])
    .optional(),
});

export const createSlotSchema = z
  .object({
    starts_at: z
      .string()
      .datetime({ offset: true, message: "Data de início inválida" }),
    ends_at: z
      .string()
      .datetime({ offset: true, message: "Data de término inválida" }),
    max_attendees: z.coerce
      .number()
      .int()
      .positive("Deve ter ao menos 1 participante")
      .default(1),
    location_details: z.string().max(300, "Máximo 300 caracteres").optional(),
  })
  .refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
    message: "Data de término deve ser posterior à data de início",
    path: ["ends_at"],
  });

export const updateSlotSchema = z
  .object({
    starts_at: z.string().datetime({ offset: true }).optional(),
    ends_at: z.string().datetime({ offset: true }).optional(),
    max_attendees: z.coerce.number().int().positive().optional(),
    location_details: z.string().max(300).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) > new Date(data.starts_at);
      }
      return true;
    },
    {
      message: "Data de término deve ser posterior à data de início",
      path: ["ends_at"],
    },
  );

export const bookSlotSchema = z.object({
  notes: z.string().max(300, "Máximo 300 caracteres").optional(),
});

export type CreateShowroomInput = z.infer<typeof createShowroomSchema>;
export type UpdateShowroomInput = z.infer<typeof updateShowroomSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type BookSlotInput = z.infer<typeof bookSlotSchema>;
