const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4001';

export type ApiOptions = RequestInit & {
  token?: string | null;
  subdomain?: string | null;
};

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (!headers.has('Content-Type') && opts.body && typeof opts.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (opts.token) headers.set('Authorization', `Bearer ${opts.token}`);
  if (opts.subdomain) headers.set('x-school-subdomain', opts.subdomain);

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
  });

  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText;
    throw new ApiError(Array.isArray(message) ? message.join(', ') : String(message), res.status, data);
  }
  return data as T;
}

function safeJson(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public payload?: any) {
    super(message);
  }
}

// --- session helpers (client side only) ---
export const session = {
  token: () => (typeof window === 'undefined' ? null : localStorage.getItem('ef.token')),
  user:  () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('ef.user');
    return raw ? JSON.parse(raw) : null;
  },
  subdomain: () => (typeof window === 'undefined' ? null : localStorage.getItem('ef.subdomain')),
  set: (token: string, user: any, subdomain?: string) => {
    localStorage.setItem('ef.token', token);
    localStorage.setItem('ef.user', JSON.stringify(user));
    if (subdomain) localStorage.setItem('ef.subdomain', subdomain);
  },
  clear: () => {
    localStorage.removeItem('ef.token');
    localStorage.removeItem('ef.user');
    localStorage.removeItem('ef.subdomain');
  },
};
