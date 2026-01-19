import { z } from 'zod'

export const TokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
})

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
})

export const UserResponseSchema = z.object({
  username: z.string(),
})

export type Token = z.infer<typeof TokenSchema>
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
