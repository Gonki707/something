import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type AdminUser, fetchCurrentUser } from '../api/auth';

interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  setUser: (u: AdminUser | null) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const u = await fetchCurrentUser();
    setUser(u);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
