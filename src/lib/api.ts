import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach accessToken to every outgoing request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 — but skip for auth endpoints (they aren't protected)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auth endpoints (login/register/refresh) shouldn't trigger token refresh
    if (originalRequest._skipRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { token: newAccessToken, refreshToken } =
          await refreshAccessToken();

        useAuthStore.getState().setUser(
          useAuthStore.getState().user!,
          newAccessToken,
          refreshToken,
        );

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

async function refreshAccessToken(): Promise<{
  token: string;
  refreshToken: string;
}> {
  const refreshToken = (useAuthStore.getState().user as { refreshToken?: string } | null)?.refreshToken;
  const { data } = await axios.post(
    "http://localhost:5000/api/auth/refresh",
    { refreshToken },
  );
  return data;
}
