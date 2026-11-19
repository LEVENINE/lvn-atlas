import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";

import {
  ApiError,
  api,
  clearStoredToken,
  getStoredToken,
  storeToken,
  type LoginInput,
  type RegisterInput,
  type User,
} from "../lib/api";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getStoredToken() ? "loading" : "anonymous",
  );

  useEffect(() => {
    if (!getStoredToken()) {
      return;
    }

    let active = true;

    api
      .me()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) {
          clearStoredToken();
          setUser(null);
          setStatus("anonymous");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (input: LoginInput) => {
    const result = await api.login(input);

    storeToken(result.accessToken);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const result = await api.register(input);

    storeToken(result.accessToken);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <SessionSplash />;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

function SessionSplash() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950">
      <div className="flex flex-col items-center gap-4">
        <span className="h-2 w-2 animate-ping rounded-full bg-ember-400" />
        <p className="eyebrow">Restoring session</p>
      </div>
    </div>
  );
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
