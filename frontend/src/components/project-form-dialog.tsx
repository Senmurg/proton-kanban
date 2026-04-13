import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { projectSchema, type ProjectSchema } from '../features/projects/projects-validation';
import type { Project } from '../features/projects/project-types';

interface ProjectFormDialogProps {
  open: boolean;
  initialValues?: Project | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectSchema) => Promise<void> | void;
}

const defaultValues: ProjectSchema = {
  name: '',
  slug: '',
  description: '',
};

export function ProjectFormDialog({
  open,
  initialValues,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectSchema>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name,
        slug: initialValues.slug,
        description: initialValues.description ?? '',
      });
      return;
    }
    reset(defaultValues);
  }, [initialValues, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValues ? 'Редактировать проект' : 'Новый проект'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Название"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Slug"
                error={Boolean(errors.slug)}
                helperText={errors.slug?.message ?? 'Например: proton-kanban'}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                minRows={4}
                label="Описание"
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button onClick={handleSubmit((values) => onSubmit(values))} variant="contained" disabled={isSubmitting}>
          {initialValues ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
