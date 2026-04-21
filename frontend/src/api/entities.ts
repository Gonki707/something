import { api } from './client';

export const publicGet = <T = any>(entity: string) => api<T[]>(`/api/public/${entity}`);
export const publicGetOne = <T = any>(entity: string, id: number | string) =>
  api<T>(`/api/public/${entity}/${id}`);

export const adminList = <T = any>(entity: string) => api<T[]>(`/api/admin/${entity}`, { auth: true });
export const adminGet = <T = any>(entity: string, id: number | string) =>
  api<T>(`/api/admin/${entity}/${id}`, { auth: true });
export const adminCreate = <T = any>(entity: string, data: any) =>
  api<T>(`/api/admin/${entity}`, { method: 'POST', body: JSON.stringify(data), auth: true });
export const adminUpdate = <T = any>(entity: string, id: number | string, data: any) =>
  api<T>(`/api/admin/${entity}/${id}`, { method: 'PUT', body: JSON.stringify(data), auth: true });
export const adminDelete = (entity: string, id: number | string) =>
  api(`/api/admin/${entity}/${id}`, { method: 'DELETE', auth: true });

export const submitProblem = (data: any) =>
  api('/api/problems', { method: 'POST', body: JSON.stringify(data) });
