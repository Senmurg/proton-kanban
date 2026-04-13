import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../components/page-header';
import { ProjectFormDialog } from '../components/project-form-dialog';
import { useAuth } from '../features/auth/auth-context';
import { createProject, deleteProject, listProjects, updateProject } from '../features/projects/projects-api';
import type { Project } from '../features/projects/project-types';
import type { ProjectSchema } from '../features/projects/projects-validation';

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects(accessToken!),
    enabled: Boolean(accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (values: ProjectSchema) => createProject(accessToken!, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ projectId, values }: { projectId: string; values: ProjectSchema }) =>
      updateProject(accessToken!, projectId, values),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      setEditingProject(null);
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProject(accessToken!, projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const mutationError = useMemo(() => {
    return createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  }, [createMutation.error, updateMutation.error, deleteMutation.error]);

  const handleSubmit = async (values: ProjectSchema) => {
    if (editingProject) {
      await updateMutation.mutateAsync({ projectId: editingProject.id, values });
      return;
    }
    await createMutation.mutateAsync(values);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditingProject(null);
              setDialogOpen(true);
            }}
          >
            Новый проект
          </Button>
        }
      />

      {mutationError ? (
        <Alert severity="error">
          {mutationError instanceof Error ? mutationError.message : 'Не удалось выполнить действие'}
        </Alert>
      ) : null}

      {projectsQuery.error ? (
        <Alert severity="error">
          {projectsQuery.error instanceof Error ? projectsQuery.error.message : 'Не удалось загрузить проекты'}
        </Alert>
      ) : null}

      <Stack spacing={2}>
        {(projectsQuery.data ?? []).map((project) => (
          <Card key={project.id}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip size="small" label={project.slug} />
                  </Stack>
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    {project.description || 'Пока без описания'}
                  </Typography>
                  <Typography sx={{ mt: 1.5 }} variant="body2" color="text.secondary">
                    Обновлено: {new Date(project.updated_at).toLocaleString('ru-RU')}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Открыть">
                    <IconButton onClick={() => navigate(`/projects/${project.id}`)}>
                      <VisibilityRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редактировать">
                    <IconButton
                      onClick={() => {
                        setEditingProject(project);
                        setDialogOpen(true);
                      }}
                    >
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton color="error" onClick={() => deleteMutation.mutate(project.id)}>
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {!projectsQuery.isLoading && (projectsQuery.data?.length ?? 0) === 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">Пока нет проектов</Typography>
                <Typography color="text.secondary">
                  Создай первый проект и мы уже сможем строить поверх него задачи, роли и доски.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Stack>

      <ProjectFormDialog
        open={dialogOpen}
        initialValues={editingProject}
        onClose={() => {
          setDialogOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </Stack>
  );
}
