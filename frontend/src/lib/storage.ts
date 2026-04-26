const ACCESS_TOKEN_KEY = 'proton-kanban.access-token';
const LANGUAGE_KEY = 'proton-kanban.language';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredLanguage(): string | null {
  return localStorage.getItem(LANGUAGE_KEY);
}

export function setStoredLanguage(language: string): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}
