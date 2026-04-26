import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Card, CardContent, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageHeader } from '../components/page-header';
import { updateCurrentUser } from '../features/auth/auth-api';
import { useAuth } from '../features/auth/auth-context';
import { useI18n } from '../features/i18n/i18n-context';

type ProfileSchema = {
  full_name: string;
};

export function ProfilePage() {
  const { accessToken, user, refreshUser } = useAuth();
  const { copy } = useI18n();
  const profileSchema = useMemo(() => z.object({
    full_name: z.string().min(2, copy.validation.min2).max(255, copy.validation.max255),
  }), [copy]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
    },
  });

  useEffect(() => {
    reset({ full_name: user?.full_name ?? '' });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileSchema) => updateCurrentUser(accessToken!, values),
    onSuccess: async () => {
      await refreshUser();
    },
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          maxWidth: 720,
          width: '100%',
          mx: 'auto',
        }}
      >
        <Stack spacing={3}>
          <PageHeader title={copy.profile.title} subtitle={copy.profile.subtitle} />

          {mutation.error ? (
            <Alert severity="error">
              {mutation.error instanceof Error ? mutation.error.message : copy.profile.updateFailed}
            </Alert>
          ) : null}

          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                component="form"
                spacing={2.5}
                onSubmit={handleSubmit(async (values) => mutation.mutateAsync(values))}
              >
                <TextField
                  label={copy.common.email}
                  value={user?.email ?? ''}
                  disabled
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Controller
                  name="full_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={copy.common.fullName}
                      fullWidth
                      error={Boolean(errors.full_name)}
                      helperText={errors.full_name?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={mutation.isPending}
                  sx={{
                    alignSelf: 'flex-start',
                    minWidth: 220,
                    borderRadius: 3,
                    px: 3,
                    py: 1.25,
                    textTransform: 'none',
                  }}
                >
                  {copy.profile.save}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
