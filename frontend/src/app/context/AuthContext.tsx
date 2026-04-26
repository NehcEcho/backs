import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { clearStoredToken, clearStoredUsername, getStoredToken, getStoredUsername, setStoredToken, setStoredUsername } from "@/app/lib/api";

interface AuthContextValue {
  token: string;
  username: string;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getStoredToken());
  const [username, setUsername] = useState(getStoredUsername());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      username,
      isAuthenticated: Boolean(token),
      login(nextToken, nextUsername) {
        setStoredToken(nextToken);
        setStoredUsername(nextUsername);
        setToken(nextToken);
        setUsername(nextUsername);
      },
      logout() {
        clearStoredToken();
        clearStoredUsername();
        setToken("");
        setUsername("管理员");
      },
    }),
    [token, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
