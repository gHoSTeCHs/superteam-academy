"use client";

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { authClient } from "@/lib/auth-client";

interface AuthContextValue {
  user: Record<string, unknown> | null;
  session: Record<string, unknown> | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const { publicKey, connected, disconnect } = useWallet();
  const prevConnectedRef = useRef(connected);

  const walletAddress = publicKey?.toBase58() ?? null;

  const signOut = useCallback(async () => {
    await authClient.signOut();
    if (connected) {
      await disconnect();
    }
  }, [connected, disconnect]);

  useEffect(() => {
    const wasConnected = prevConnectedRef.current;
    prevConnectedRef.current = connected;

    if (wasConnected && !connected && data?.user) {
      authClient.signOut();
    }
  }, [connected, data?.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: (data?.user as Record<string, unknown>) ?? null,
      session: (data?.session as Record<string, unknown>) ?? null,
      walletAddress,
      isAuthenticated: !!data?.user,
      isLoading: isPending,
      signOut,
    }),
    [data, walletAddress, isPending, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
