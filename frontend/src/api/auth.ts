import { api } from './client';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export async function login(email: string, password: string) {
  const r = await api<{ token: string; user: AdminUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('admin_token', r.token);
  localStorage.setItem('admin_user', JSON.stringify(r.user));
  return r;
}

export async function logout() {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
}

export function getCurrentUser(): AdminUser | null {
  const raw = localStorage.getItem('admin_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('admin_token');
}
