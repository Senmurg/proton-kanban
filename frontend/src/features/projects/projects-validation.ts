import { z } from 'zod';

import type { AppCopy } from '../i18n/i18n-copy';

export function createProjectSchema(copy: AppCopy) {
  return z.object({
    name: z.string().min(2, copy.validation.min2).max(255, copy.validation.max255),
    slug: z
      .string()
      .min(2, copy.validation.min2)
      .max(255, copy.validation.slugMax)
      .regex(/^[a-z0-9-]+$/, copy.validation.slugPattern),
    description: z.string().max(5000, copy.validation.descriptionMax).optional().nullable(),
  });
}

export type ProjectSchema = z.infer<ReturnType<typeof createProjectSchema>>;
