import { api } from "../lib/api";
import { useAuthStore } from "../stores/useAuthStore";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
  };
}

export const authApi = {
  register: async (body: RegisterBody): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", body, {
      _skipRefresh: true,
    } as Record<string, unknown>);
    return data;
  },

  login: async (body: LoginBody): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", body, {
      _skipRefresh: true,
    } as Record<string, unknown>);
    return data;
  },

  logout: (): void => {
    useAuthStore.getState().logout();
  },
};
