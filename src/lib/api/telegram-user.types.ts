import { z } from 'zod'

export const TelegramUserCreateSchema = z.object({
  telegram_id: z.number().int().positive(),
  username: z.string().max(32).optional(),
  first_name: z.string().max(64),
  last_name: z.string().max(64).optional(),
  language_code: z.string().max(10).optional(),
  is_active: z.boolean().optional(),
  is_bot: z.boolean().optional(),
})

export const TelegramUserUpdateSchema = z.object({
  username: z.string().max(32).optional(),
  first_name: z.string().max(64).optional(),
  last_name: z.string().max(64).optional(),
  language_code: z.string().max(10).optional(),
  is_active: z.boolean().optional(),
  is_bot: z.boolean().optional(),
})

export const TelegramUserReadSchema = z.object({
  id: z.number(),
  telegram_id: z.number(),
  username: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string().nullable(),
  language_code: z.string().nullable(),
  is_active: z.boolean(),
  is_bot: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  last_interaction_at: z.string().nullable(),
})

export type TelegramUserCreate = z.infer<typeof TelegramUserCreateSchema>
export type TelegramUserUpdate = z.infer<typeof TelegramUserUpdateSchema>
export type TelegramUserRead = z.infer<typeof TelegramUserReadSchema>
