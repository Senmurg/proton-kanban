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
import { useI18n } from '../features/i18n/i18n-context';
import { createProject, deleteProject, listProjects, updateProject } from '../features/projects/projects-api';
import type { Project } from '../features/projects/project-types';
import type { ProjectSchema } from '../features/projects/projects-validation';

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const { copy, language } = useI18n();
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
        title={copy.projects.title}
        subtitle={copy.projects.subtitle}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditingProject(null);
              setDialogOpen(true);
            }}
          >
            {copy.projects.newProject}
          </Button>
        }
      />

      {mutationError ? (
        <Alert severity="error">
          {mutationError instanceof Error ? mutationError.message : copy.projects.actionFailed}
        </Alert>
      ) : null}

      {projectsQuery.error ? (
        <Alert severity="error">
          {projectsQuery.error instanceof Error ? projectsQuery.error.message : copy.projects.loadFailed}
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
                    <Chip size="small" color="primary" variant="outlined" label={copy.roles[project.current_user_role]} />
                  </Stack>
                  <Typography sx={{ mt: 1 }} color="text.secondary">
                    {project.description || copy.projects.noDescription}
                  </Typography>
                  <Typography sx={{ mt: 1.5 }} variant="body2" color="text.secondary">
                    {copy.projects.updatedAt}: {new Date(project.updated_at).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title={copy.projects.open}>
                    <IconButton onClick={() => navigate(`/projects/${project.id}`)}>
                      <VisibilityRoundedIcon />
                    </IconButton>
                  </Tooltip>

                  {project.permissions.can_update ? (
                    <Tooltip title={copy.projects.edit}>
                      <IconButton
                        onClick={() => {
                          setEditingProject(project);
                          setDialogOpen(true);
                        }}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null}

                  {project.permissions.can_delete ? (
                    <Tooltip title={copy.projects.delete}>
                      <IconButton color="error" onClick={() => deleteMutation.mutate(project.id)}>
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {!projectsQuery.isLoading && (projectsQuery.data?.length ?? 0) === 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">{copy.projects.emptyTitle}</Typography>
                <Typography color="text.secondary">
                  {copy.projects.emptyDescription}
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
