/**
 * Fetch helper that throws an Error with the API error message if the response is not ok.
 * Usage:
 *   const data = await apiFetch('/api/teachers', { method: 'POST', ... })
 */
export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  }
  return json as T;
}
