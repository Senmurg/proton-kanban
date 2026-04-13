import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Card, CardContent, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageHeader } from '../components/page-header';
import { useAuth } from '../features/auth/auth-context';
import { updateCurrentUser } from '../features/auth/auth-api';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Минимум 2 символа').max(255, 'Слишком длинное имя'),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { accessToken, user, refreshUser } = useAuth();

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

          {mutation.error ? (
            <Alert severity="error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Не удалось обновить профиль'}
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
                  label="Email"
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
                      label="Имя"
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
                  Сохранить профиль
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}