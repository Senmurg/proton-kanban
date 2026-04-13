import { apiRequest, apiRequestWithToken } from '../../lib/api';
import type { CurrentUser, LoginFormValues, RegisterFormValues, TokenResponse } from './auth-types';

function buildLoginForm(values: LoginFormValues): URLSearchParams {
  const form = new URLSearchParams();
  form.set('username', values.email);
  form.set('password', values.password);
  return form;
}

export async function registerUser(values: RegisterFormValues): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

export async function loginUser(values: LoginFormValues): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: buildLoginForm(values).toString(),
  });
}

export async function fetchCurrentUser(token: string): Promise<CurrentUser> {
  return apiRequestWithToken<CurrentUser>('/api/v1/users/me', token);
}

export async function updateCurrentUser(token: string, payload: Pick<CurrentUser, 'full_name'>): Promise<CurrentUser> {
  return apiRequestWithToken<CurrentUser>('/api/v1/users/me', token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
