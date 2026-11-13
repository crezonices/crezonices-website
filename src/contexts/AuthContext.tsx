import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase/auth';
import { firebaseConfigurationError } from '../lib/firebase/firebase';

type AuthState = { user: User | null; loading: boolean; isAdmin: boolean; error?: string };
const AuthContext = createContext<AuthState>({ user: null, loading: false, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: !firebaseConfigurationError, isAdmin: false, error: firebaseConfigurationError });
  useEffect(() => {
    if (firebaseConfigurationError) return;
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        const token = user ? await user.getIdTokenResult(true) : undefined;
        setState({ user, loading: false, isAdmin: token?.claims.admin === true || token?.claims.role === 'admin' });
      });
    } catch (error) {
      setState({ user: null, loading: false, isAdmin: false, error: error instanceof Error ? error.message : 'Authentication unavailable' });
    }
    return unsubscribe;
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
