const BASE = (import.meta.env.VITE_API_BASE as string) || '';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opts.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
  });
  const ct = res.headers.get('content-type') || '';
  const body: unknown = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string'
        ? (body as { error: string }).error
        : res.statusText;
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

export async function uploadFiles(
  files: File[],
  auth = true,
): Promise<{ path: string; originalName: string }[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append(auth ? 'files' : 'file', f));
  const res = await fetch(`${BASE}/api/upload/${auth ? 'admin' : 'public'}`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = 'Грешка при прикачување';
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(msg, res.status);
  }
  const data = (await res.json()) as
    | { files: { path: string; originalName: string }[] }
    | { path: string; originalName: string };
  return 'files' in data ? data.files : [{ path: data.path, originalName: data.originalName }];
}
