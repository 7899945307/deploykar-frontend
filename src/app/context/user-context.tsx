import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  name: string;
  email: string;
  id?: string;
  plan?: string;
  organizationName?: string;
  slug?: string;
  teamId?: string;
  accessToken?: string;
  refreshToken?: string;
  role?: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER' | 'INDIVIDUAL';
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const token = localStorage.getItem('deploykar_token');
    const refresh = localStorage.getItem('deploykar_refresh');
    return token ? { name: '', email: '', accessToken: token, refreshToken: refresh || undefined } : null;
  });

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser?.accessToken) {
      localStorage.setItem('deploykar_token', newUser.accessToken);
    } else {
      localStorage.removeItem('deploykar_token');
    }
    if (newUser?.refreshToken) {
      localStorage.setItem('deploykar_refresh', newUser.refreshToken);
    } else {
      localStorage.removeItem('deploykar_refresh');
    }
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('deploykar_token');
    localStorage.removeItem('deploykar_refresh');
  };

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refresh = user?.refreshToken || localStorage.getItem('deploykar_refresh');
    if (!refresh) return null;
    try {
      const res = await api.refreshToken(refresh);
      const newUser = { ...user, name: user?.name || '', email: user?.email || '', accessToken: res.access_token, refreshToken: res.refresh_token };
      setUserState(newUser);
      localStorage.setItem('deploykar_token', res.access_token);
      localStorage.setItem('deploykar_refresh', res.refresh_token);
      return res.access_token;
    } catch {
      logout();
      return null;
    }
  }, [user]);

  // Auto-refresh token 1 minute before expiry (29 min after login)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (!user?.accessToken || !user?.refreshToken) return;

    // Decode token to get expiry
    try {
      const payload = JSON.parse(atob(user.accessToken.split('.')[1]));
      const expiresAt = payload.exp * 1000; // ms
      const now = Date.now();
      const refreshIn = expiresAt - now - 60000; // 1 min before expiry

      if (refreshIn > 0) {
        refreshTimerRef.current = setTimeout(() => {
          refreshAccessToken();
        }, refreshIn);
      }
    } catch {}

    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [user?.accessToken]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshAccessToken }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
