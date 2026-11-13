import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase/auth';
import { firebaseConfigurationError } from '../lib/firebase/firebase';

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  refreshClaims: () => Promise<void>;
  error?: string;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: false,
  isAdmin: false,
  mustChangePassword: false,
  refreshClaims: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: !firebaseConfigurationError,
    isAdmin: false,
    mustChangePassword: false,
    refreshClaims: async () => {},
    error: firebaseConfigurationError,
  });

  const checkUserClaims = async (user: User | null) => {
    if (!user) {
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
        isAdmin: false,
        mustChangePassword: false,
      }));
      return;
    }
    try {
      const token = await user.getIdTokenResult(true);
      const isAdmin = token.claims.admin === true || token.claims.role === 'admin';
      const mustChangePassword = token.claims.tempPassword === true;
      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAdmin,
        mustChangePassword,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isAdmin: false,
        mustChangePassword: false,
      }));
    }
  };

  useEffect(() => {
    if (firebaseConfigurationError) return;
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
        await checkUserClaims(user);
      });
    } catch (error) {
      setState({
        user: null,
        loading: false,
        isAdmin: false,
        mustChangePassword: false,
        refreshClaims: async () => {},
        error: error instanceof Error ? error.message : 'Authentication unavailable',
      });
    }
    return unsubscribe;
  }, []);

  const refreshClaims = async () => {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
      await checkUserClaims(auth.currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, refreshClaims }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
