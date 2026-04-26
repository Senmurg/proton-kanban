import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth-layout';
import { useAuth } from '../features/auth/auth-context';
import { useI18n } from '../features/i18n/i18n-context';
import { createLoginSchema, type LoginSchema } from '../features/auth/auth-validation';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { copy } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const loginSchema = useMemo(() => createLoginSchema(copy), [copy]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin12345',
    },
  });

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.auth.login.fallbackError);
    }
  });

  return (
    <AuthLayout title={copy.auth.login.title} subtitle={copy.auth.login.subtitle}>
      <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
        {error ? <Alert severity="error">{error}</Alert> : null}

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
          {copy.auth.login.submit}
        </Button>

        <Link component={RouterLink} to="/register" underline="hover" sx={{ alignSelf: 'flex-start' }}>
          {copy.auth.login.switchLink}
        </Link>
      </Stack>
    </AuthLayout>
  );
}
