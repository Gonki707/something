import { api } from './client';

export const publicGet = <T = unknown>(entity: string) => api<T[]>(`/api/public/${entity}`);
export const publicGetOne = <T = unknown>(entity: string, id: number | string) =>
  api<T>(`/api/public/${entity}/${id}`);

export const adminList = <T = unknown>(entity: string) => api<T[]>(`/api/admin/${entity}`);
export const adminGet = <T = unknown>(entity: string, id: number | string) =>
  api<T>(`/api/admin/${entity}/${id}`);
export const adminCreate = <T = unknown>(entity: string, data: unknown) =>
  api<T>(`/api/admin/${entity}`, { method: 'POST', body: JSON.stringify(data) });
export const adminUpdate = <T = unknown>(entity: string, id: number | string, data: unknown) =>
  api<T>(`/api/admin/${entity}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const adminDelete = (entity: string, id: number | string) =>
  api<{ ok: true }>(`/api/admin/${entity}/${id}`, { method: 'DELETE' });

export const submitProblem = (data: unknown) =>
  api<{ ok: true }>('/api/problems', { method: 'POST', body: JSON.stringify(data) });
