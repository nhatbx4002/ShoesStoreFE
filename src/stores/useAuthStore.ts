import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token, refreshToken) =>
        set({ user: { ...user, refreshToken }, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "auth-storage" },
  ),
);
