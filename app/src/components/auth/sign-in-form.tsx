"use client";

import { GithubIcon, AwardIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletSignIn } from "@/components/auth/wallet-sign-in";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SignInFormProps {
  onWalletAuth?: (wallet: string) => void;
  onGoogleAuth?: () => void;
  onGithubAuth?: () => void;
  className?: string;
}

export function SignInForm({
  onWalletAuth,
  onGoogleAuth,
  onGithubAuth,
  className,
}: SignInFormProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  function handleWalletAuth(wallet: string) {
    onWalletAuth?.(wallet);
  }

  function handleGoogle() {
    onGoogleAuth?.();
    authClient.signIn.social({ provider: "google" });
  }

  function handleGitHub() {
    onGithubAuth?.();
    authClient.signIn.social({ provider: "github" });
  }

  return (
    <Card className={cn("mx-auto w-full max-w-md overflow-hidden", className)}>
      <div
        className="px-8 py-6 text-center"
        style={{
          background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
        }}
      >
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <AwardIcon className="size-6" style={{ color: "#ffd23f" }} />
        </div>
        <h2
          className="mb-1 text-[20px] font-bold text-white"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome to Superteam Academy
        </h2>
        <p
          className="text-[13px]"
          style={{
            fontFamily: "var(--font-body)",
            color: "rgba(247, 234, 203, 0.7)",
          }}
        >
          Sign in to start learning and earning on-chain credentials
        </p>
      </div>

      <div className="space-y-5 px-8 py-6">
        <div>
          <p
            className="mb-3 text-center text-[12px] font-semibold uppercase tracking-widest text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Connect your wallet
          </p>
          <WalletSignIn onAuthenticated={handleWalletAuth} />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span
            className="text-[11px] font-medium text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            or continue with
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2.5">
          <Button
            variant="outline"
            size="md"
            className="w-full gap-3"
            onClick={handleGoogle}
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span style={{ fontFamily: "var(--font-body)" }}>
              Sign in with Google
            </span>
          </Button>

          <Button
            variant="outline"
            size="md"
            className="w-full gap-3"
            onClick={handleGitHub}
          >
            <GithubIcon className="size-4" />
            <span style={{ fontFamily: "var(--font-body)" }}>
              Sign in with GitHub
            </span>
          </Button>
        </div>

        <p
          className="text-center text-[11px] text-muted-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Card>
  );
}
