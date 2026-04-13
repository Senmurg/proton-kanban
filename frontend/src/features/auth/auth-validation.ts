import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export const registerSchema = loginSchema.extend({
  full_name: z.string().min(2, 'Минимум 2 символа').max(255, 'Слишком длинное имя'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
