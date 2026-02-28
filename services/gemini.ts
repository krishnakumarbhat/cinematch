import { AuthLoginResponse, RecommendResponse } from '../types';

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
const API_BASE = viteEnv?.VITE_API_BASE_URL || '';

const parseError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data?.error || `Request failed: ${response.status}`;
  } catch {
    return `Request failed: ${response.status}`;
  }
};

export const register = async (username: string, password: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
};

export const login = async (username: string, password: string): Promise<AuthLoginResponse> => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<AuthLoginResponse>;
};

export const getRecommendations = async (
  watchedTitles: string[],
  token?: string,
): Promise<RecommendResponse> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token?.trim()) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/recommend`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ watched_titles: watchedTitles }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<RecommendResponse>;
};