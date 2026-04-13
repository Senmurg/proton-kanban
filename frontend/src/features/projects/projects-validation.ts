import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(255, 'Слишком длинное имя'),
  slug: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(255, 'Слишком длинный slug')
    .regex(/^[a-z0-9-]+$/, 'Только строчные латинские буквы, цифры и дефис'),
  description: z.string().max(5000, 'Слишком длинное описание').optional().nullable(),
});

export type ProjectSchema = z.infer<typeof projectSchema>;
