import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { PageHeader } from '../components/page-header';
import { useAuth } from '../features/auth/auth-context';
import { getProject, updateProject } from '../features/projects/projects-api';
import { projectSchema, type ProjectSchema } from '../features/projects/projects-validation';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectSchema>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(accessToken!, projectId!),
    enabled: Boolean(accessToken && projectId),
  });

  useEffect(() => {
    if (!projectQuery.data) {
      return;
    }
    reset({
      name: projectQuery.data.name,
      slug: projectQuery.data.slug,
      description: projectQuery.data.description ?? '',
    });
  }, [projectQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: ProjectSchema) => updateProject(accessToken!, projectId!, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return (
    <Stack spacing={3}>
      <PageHeader
        title={projectQuery.data?.name ?? 'Проект'}
      />

      {projectQuery.error ? (
        <Alert severity="error">
          {projectQuery.error instanceof Error ? projectQuery.error.message : 'Не удалось загрузить проект'}
        </Alert>
      ) : null}

      {updateMutation.error ? (
        <Alert severity="error">
          {updateMutation.error instanceof Error ? updateMutation.error.message : 'Не удалось сохранить изменения'}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Основная информация</Typography>
              {projectQuery.data ? <Chip size="small" label={projectQuery.data.slug} /> : null}
            </Stack>

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit(async (values) => updateMutation.mutateAsync(values))}>
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
                    helperText={errors.slug?.message}
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
                    minRows={6}
                    label="Описание"
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />

              <Box>
                <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={updateMutation.isPending}>
                  Сохранить изменения
                </Button>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
