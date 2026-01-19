import { z } from 'zod'

export const SurveyCreateSchema = z.object({
  user_id: z.number().int().positive(),
  full_name: z.record(z.string(), z.string()).optional().nullable(),
  super_powers: z.array(z.string()).optional().nullable(),
  birth_date: z.string().min(1),
  traits_to_improve: z.array(z.string()).optional().nullable(),
  to_buy: z.array(z.string()).optional().nullable(),
  to_sell: z.array(z.string()).optional().nullable(),
  service: z.string().nullable().optional(),
  material_goal: z.string().nullable().optional(),
  social_goal: z.string().nullable().optional(),
  spiritual_goal: z.string().nullable().optional(),
})

export const SurveyUpdateSchema = z.object({
  full_name: z.record(z.string(), z.string()).optional().nullable(),
  super_powers: z.array(z.string()).optional().nullable(),
  birth_date: z.string().optional(),
  traits_to_improve: z.array(z.string()).optional().nullable(),
  to_buy: z.array(z.string()).optional().nullable(),
  to_sell: z.array(z.string()).optional().nullable(),
  service: z.string().nullable().optional(),
  material_goal: z.string().nullable().optional(),
  social_goal: z.string().nullable().optional(),
  spiritual_goal: z.string().nullable().optional(),
})

export const SurveyReadSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  full_name: z.record(z.string(), z.string()),
  super_powers: z.array(z.string()),
  birth_date: z.string(),
  traits_to_improve: z.array(z.string()),
  to_buy: z.array(z.string()),
  to_sell: z.array(z.string()),
  service: z.string().nullable(),
  material_goal: z.string().nullable(),
  social_goal: z.string().nullable(),
  spiritual_goal: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type SurveyCreate = z.infer<typeof SurveyCreateSchema>
export type SurveyUpdate = z.infer<typeof SurveyUpdateSchema>
export type SurveyRead = z.infer<typeof SurveyReadSchema>
