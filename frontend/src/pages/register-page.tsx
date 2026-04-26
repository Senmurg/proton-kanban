import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth-layout';
import { useAuth } from '../features/auth/auth-context';
import { useI18n } from '../features/i18n/i18n-context';
import { createRegisterSchema, type RegisterSchema } from '../features/auth/auth-validation';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { copy } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const registerSchema = useMemo(() => createRegisterSchema(copy), [copy]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await register(values);
      navigate('/', { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.auth.register.fallbackError);
    }
  });

  return (
    <AuthLayout title={copy.auth.register.title} subtitle={copy.auth.register.subtitle}>
      <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Controller
          name="full_name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={copy.common.fullName}
              error={Boolean(errors.full_name)}
              helperText={errors.full_name?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={copy.common.email}
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={copy.common.password}
              type="password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />
          )}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {copy.auth.register.submit}
        </Button>

        <Link component={RouterLink} to="/login" underline="hover" sx={{ alignSelf: 'flex-start' }}>
          {copy.auth.register.switchLink}
        </Link>
      </Stack>
    </AuthLayout>
  );
}
