import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '../components/page-header';
import { useAuth } from '../features/auth/auth-context';
import { useI18n } from '../features/i18n/i18n-context';
import {
  addProjectMember,
  getProject,
  listProjectMembers,
  removeProjectMember,
  updateProject,
  updateProjectMemberRole,
} from '../features/projects/projects-api';
import {
  canManageMemberRole,
  canRemoveMember,
  getAssignableRoles,
} from '../features/projects/project-rbac';
import type { ProjectMember, ProjectRole } from '../features/projects/project-types';
import { createProjectSchema, type ProjectSchema } from '../features/projects/projects-validation';

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuth();
  const { copy } = useI18n();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Exclude<ProjectRole, 'owner'>>('member');
  const projectSchema = useMemo(() => createProjectSchema(copy), [copy]);
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

  const membersQuery = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => listProjectMembers(accessToken!, projectId!),
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

  const assignableRoles = useMemo(() => {
    return getAssignableRoles(projectQuery.data?.current_user_role);
  }, [projectQuery.data?.current_user_role]);

  useEffect(() => {
    if (assignableRoles.length === 0) {
      return;
    }
    if (!assignableRoles.includes(inviteRole)) {
      setInviteRole(assignableRoles[0]);
    }
  }, [assignableRoles, inviteRole]);

  const updateMutation = useMutation({
    mutationFn: (values: ProjectSchema) => updateProject(accessToken!, projectId!, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: () => addProjectMember(accessToken!, projectId!, { email: inviteEmail.trim(), role: inviteRole }),
    onSuccess: () => {
      setInviteEmail('');
      void queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Exclude<ProjectRole, 'owner'> }) =>
      updateProjectMemberRole(accessToken!, projectId!, memberId, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (member: ProjectMember) => removeProjectMember(accessToken!, projectId!, member.id),
    onSuccess: (_, member) => {
      void queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (member.user.id === user?.id) {
        navigate('/projects');
      }
    },
  });

  const membershipMutationError = useMemo(() => {
    return addMemberMutation.error ?? updateMemberMutation.error ?? removeMemberMutation.error;
  }, [addMemberMutation.error, updateMemberMutation.error, removeMemberMutation.error]);

  const project = projectQuery.data;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={project?.name ?? copy.projectDetail.titleFallback}
        subtitle={project ? copy.projectDetail.roleSubtitle(copy.roles[project.current_user_role]) : undefined}
      />

      {projectQuery.error ? (
        <Alert severity="error">
          {projectQuery.error instanceof Error ? projectQuery.error.message : copy.projectDetail.loadFailed}
        </Alert>
      ) : null}

      {updateMutation.error ? (
        <Alert severity="error">
          {updateMutation.error instanceof Error ? updateMutation.error.message : copy.projectDetail.saveFailed}
        </Alert>
      ) : null}

      {membershipMutationError ? (
        <Alert severity="error">
          {membershipMutationError instanceof Error ? membershipMutationError.message : copy.projectDetail.membersFailed}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6">{copy.projectDetail.settingsTitle}</Typography>
              {project ? <Chip size="small" label={project.slug} /> : null}
              {project ? <Chip size="small" color="primary" variant="outlined" label={copy.roles[project.current_user_role]} /> : null}
            </Stack>

            {!project?.permissions.can_update ? (
              <Alert severity="info">{copy.projectDetail.readonlyInfo}</Alert>
            ) : null}

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit(async (values) => updateMutation.mutateAsync(values))}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={copy.common.name}
                    disabled={!project?.permissions.can_update}
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
                    label={copy.common.slug}
                    disabled={!project?.permissions.can_update}
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
                    label={copy.common.description}
                    disabled={!project?.permissions.can_update}
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />

              {project?.permissions.can_update ? (
                <Box>
                  <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={updateMutation.isPending}>
                    {copy.projectDetail.saveChanges}
                  </Button>
                </Box>
              ) : null}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={0.5}>
              <Typography variant="h6">{copy.projectDetail.membersTitle}</Typography>
              <Typography color="text.secondary">
                {copy.projectDetail.membersSubtitle}
              </Typography>
            </Stack>

            {project?.permissions.can_manage_members ? (
              <Stack
                component="form"
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                onSubmit={(event) => {
                  event.preventDefault();
                  void addMemberMutation.mutateAsync();
                }}
              >
                <TextField
                  label={copy.projectDetail.userEmailLabel}
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  select
                  label={copy.common.role}
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as Exclude<ProjectRole, 'owner'>)}
                  sx={{ minWidth: 180 }}
                >
                  {assignableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {copy.roles[role]}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addMemberMutation.isPending || inviteEmail.trim().length === 0}
                >
                  {copy.projectDetail.addMember}
                </Button>
              </Stack>
            ) : null}

            {membersQuery.error ? (
              <Alert severity="error">
                {membersQuery.error instanceof Error ? membersQuery.error.message : copy.projectDetail.loadMembersFailed}
              </Alert>
            ) : null}

            <Stack divider={<Divider flexItem />} spacing={2}>
              {(membersQuery.data ?? []).map((member) => {
                const actorRole = project?.current_user_role;
                const isSelf = member.user.id === user?.id;
                const canEditRole = actorRole ? canManageMemberRole(actorRole, member.role) : false;
                const canRemove = actorRole ? canRemoveMember(actorRole, member.role, isSelf) : false;

                return (
                  <Stack
                    key={member.id}
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1">
                          {member.user.full_name || member.user.email}
                        </Typography>
                        <Chip size="small" label={copy.roles[member.role]} />
                        {!member.user.is_active ? <Chip size="small" color="warning" label={copy.projectDetail.inactive} /> : null}
                        {isSelf ? <Chip size="small" variant="outlined" label={copy.projectDetail.you} /> : null}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {member.user.email}
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                      {canEditRole ? (
                        <TextField
                          select
                          size="small"
                          label={copy.common.role}
                          value={member.role}
                          onChange={(event) =>
                            updateMemberMutation.mutate({
                              memberId: member.id,
                              role: event.target.value as Exclude<ProjectRole, 'owner'>,
                            })
                          }
                          disabled={updateMemberMutation.isPending}
                          sx={{ minWidth: 160 }}
                        >
                          {assignableRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                              {copy.roles[role]}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : null}

                      {canRemove ? (
                        <Button
                          color="error"
                          variant="text"
                          startIcon={<DeleteOutlineRoundedIcon />}
                          onClick={() => removeMemberMutation.mutate(member)}
                          disabled={removeMemberMutation.isPending}
                        >
                          {isSelf ? copy.projectDetail.leaveProject : copy.projectDetail.remove}
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
