import { z } from 'zod';

import type { AppCopy } from '../i18n/i18n-copy';

export function createLoginSchema(copy: AppCopy) {
  return z.object({
    email: z.string().email(copy.validation.emailInvalid),
    password: z.string().min(8, copy.validation.passwordMin),
  });
}

export function createRegisterSchema(copy: AppCopy) {
  return createLoginSchema(copy).extend({
    full_name: z.string().min(2, copy.validation.min2).max(255, copy.validation.max255),
  });
}

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;
