const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.errors?.[0]?.message || 'Request failed');
  }
  return data.data as T;
}

export const api = {
  // Assignments
  getAssignments: () => apiFetch<import('@/types').Assignment[]>('/api/assignments'),

  createAssignment: (formData: FormData) =>
    fetch(`${BASE}/api/assignments`, { method: 'POST', body: formData })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) throw new Error(d.message || d.errors?.[0]?.message || 'Failed');
        return d.data;
      }),

  getAssignment: (id: string) => apiFetch<import('@/types').Assignment>(`/api/assignments/${id}`),

  getPaper: (id: string) =>
    apiFetch<import('@/types').GeneratedPaper>(`/api/assignments/${id}/paper`),

  deleteAssignment: (id: string) =>
    apiFetch<void>(`/api/assignments/${id}`, { method: 'DELETE' }),

  regenerate: (id: string) =>
    apiFetch<{ jobId: string }>(`/api/assignments/${id}/regenerate`, { method: 'POST' }),
};