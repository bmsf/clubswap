import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(8, 'Passord må være minst 8 tegn'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Ugyldig e-postadresse'),
    password: z.string().min(8, 'Passord må være minst 8 tegn'),
    confirm_password: z.string(),
    username: z
      .string()
      .min(3, 'Brukernavn må være minst 3 tegn')
      .max(30)
      .regex(/^[a-z0-9_-]+$/, 'Kun bokstaver, tall, bindestrek og understrek'),
    full_name: z.string().min(2, 'Navn må være minst 2 tegn').max(100),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passordene stemmer ikke overens',
    path: ['confirm_password'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
