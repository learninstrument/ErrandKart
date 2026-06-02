type StoredSession = {
  accessToken?: string;
  access_token?: string;
};

export const getAccessToken = () => {
  const raw = localStorage.getItem('errandkart_session');
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as StoredSession;
    return session.accessToken ?? session.access_token ?? null;
  } catch {
    return null;
  }
};

export const buildAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const clearSession = () => {
  localStorage.removeItem('errandkart_session');
};

export const logout = async (apiBaseUrl: string) => {
  const headers = buildAuthHeaders();
  if (headers) {
    const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: 'POST',
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message ?? 'Logout failed');
    }
  }
  clearSession();
};
