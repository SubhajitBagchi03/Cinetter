import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 20000, // increased from 10s to 20s
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — refresh on 401, retry on network errors
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Handle 401 — try token refresh once
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Don't redirect — just reject so the page can handle it gracefully
        return Promise.reject(error);
      }
    }

    // Retry on network errors or 5xx — up to 2 extra attempts with delay
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;
    original._retryCount = original._retryCount || 0;

    if ((isNetworkError || isServerError) && original._retryCount < 2 && !original._noRetry) {
      original._retryCount += 1;
      const delay = original._retryCount * 800; // 800ms, 1600ms
      await new Promise(r => setTimeout(r, delay));
      return api(original);
    }

    return Promise.reject(error);
  }
);

export default api;
