import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Participant, Group, Session } from '../types';

const STORAGE_KEY = 'dive-participant';

interface AuthState {
  participant: Participant | null;
  group: Group | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (participant: Participant, group: Group, session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    participant: null,
    group: null,
    session: null,
    isLoading: true,
  });

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { participant, group, session } = JSON.parse(raw);
        if (participant && group && session) {
          setState({ participant, group, session, isLoading: false });
          return;
        }
      }
    } catch { /* corrupted storage */ }
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  const login = (participant: Participant, group: Group, session: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ participant, group, session }));
    setState({ participant, group, session, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ participant: null, group: null, session: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
