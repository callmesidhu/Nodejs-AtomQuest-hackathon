import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";
import type { User } from "../types/domain";

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("goalsync.user");
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password) {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("goalsync.accessToken", data.accessToken);
      localStorage.setItem("goalsync.refreshToken", data.refreshToken);
      localStorage.setItem("goalsync.user", JSON.stringify(data.user));
      setUser(data.user);
    },
    logout() {
      localStorage.removeItem("goalsync.accessToken");
      localStorage.removeItem("goalsync.refreshToken");
      localStorage.removeItem("goalsync.user");
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
