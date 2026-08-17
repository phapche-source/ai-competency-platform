const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

export interface Track {
  id: string;
  code: 'AI-HE' | 'AI-GV' | 'AI-VET' | 'AI-GVET';
  name: string;
  status: string;
}

export const api = {
  listTracks: (tenantId: string) => request<Track[]>(`/tracks?tenantId=${tenantId}`),
  createProfile: (payload: Record<string, unknown>) =>
    request('/profiles', { method: 'POST', body: JSON.stringify(payload) }),
  createRegistration: (payload: Record<string, unknown>) =>
    request('/registrations', { method: 'POST', body: JSON.stringify(payload) }),
  evaluateEligibility: (id: string) =>
    request(`/registrations/${id}/evaluate-eligibility`, { method: 'PATCH' }),
  schedule: (id: string, examEventId: string) =>
    request(`/registrations/${id}/schedule`, { method: 'PATCH', body: JSON.stringify({ examEventId }) }),
};
