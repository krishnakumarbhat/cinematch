import { RecommendResponse } from '../types';

const API_BASE = '';

const parseError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data?.error || `Request failed: ${res.status}`;
  } catch {
    return `Request failed: ${res.status}`;
  }
};

export const register = async (username: string, password: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
};

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
};

export const getRecommendations = async (
  watchedTitles: string[],
  token?: string,
): Promise<RecommendResponse> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token?.trim()) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ watched_titles: watchedTitles }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
};
