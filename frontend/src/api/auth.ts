import { api } from './client';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const r = await api<{ user: AdminUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return r.user;
}

export async function logout(): Promise<void> {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
}

/** Bootstrap session from the httpOnly auth cookie. Returns null if not logged in. */
export async function fetchCurrentUser(): Promise<AdminUser | null> {
  try {
    const r = await api<{ user: AdminUser }>('/api/auth/me');
    return r.user;
  } catch {
    return null;
  }
}
