export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('API request failed');
  }
  return (await res.json()) as T;
}
