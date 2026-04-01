import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

type AuthContextValue = {
  user: { id: number; name: string; email: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jbb_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("jbb_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const response = await api.login({ email, password });
    localStorage.setItem("jbb_token", response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("jbb_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
