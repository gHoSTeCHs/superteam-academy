"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  WalletIcon,
  Loader2Icon,
  CheckCircle2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type WalletStep =
  | "idle"
  | "connecting"
  | "signing"
  | "verifying"
  | "authenticated";

interface WalletSignInProps {
  onAuthenticated?: (wallet: string) => void;
  className?: string;
}

function truncateWallet(wallet: string): string {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function WalletSignIn({
  onAuthenticated,
  className,
}: WalletSignInProps) {
  const [step, setStep] = useState<WalletStep>("idle");
  const { publicKey, signMessage, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated } = useAuth();
  const signingRef = useRef(false);
  const t = useTranslations("Auth");
  const router = useRouter();

  const performSign = useCallback(async () => {
    if (!publicKey || !signMessage || signingRef.current) return;

    signingRef.current = true;
    try {
      setStep("signing");
      const walletAddress = publicKey.toBase58();
      const domain = window.location.host;

      const nonceRes = await fetch("/api/auth/siws/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!nonceRes.ok) {
        setStep("idle");
        return;
      }

      const { nonce } = (await nonceRes.json()) as { nonce: string };
      const issuedAt = new Date().toISOString();

      const message = [
        `${domain} wants you to sign in with your Solana account:`,
        walletAddress,
        "",
        "Sign in to Superteam Academy",
        "",
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
      ].join("\n");

      const encoded = new TextEncoder().encode(message);
      const signature = await signMessage(encoded);

      setStep("verifying");
      const response = await fetch("/api/auth/siws/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: walletAddress,
          signature: btoa(String.fromCharCode(...signature)),
          message,
        }),
      });

      if (response.ok) {
        setStep("authenticated");
        router.refresh();
        onAuthenticated?.(walletAddress);
      } else {
        setStep("idle");
      }
    } catch {
      setStep("idle");
    } finally {
      signingRef.current = false;
    }
  }, [publicKey, signMessage, onAuthenticated, router]);

  useEffect(() => {
    if (connected && step === "connecting") {
      performSign();
    }
  }, [connected, step, performSign]);

  const handleConnect = useCallback(async () => {
    if (connected) {
      await performSign();
      return;
    }

    setStep("connecting");
    setVisible(true);
  }, [connected, performSign, setVisible]);

  if (isAuthenticated && publicKey) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-5",
          className,
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2Icon className="size-6 text-primary" />
        </div>
        <p
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("walletConnected")}
        </p>
        <p className="font-mono text-[12px] text-muted-foreground">
          {truncateWallet(publicKey.toBase58())}
        </p>
      </div>
    );
  }

  if (step === "authenticated" && publicKey) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-5",
          className,
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2Icon className="size-6 text-primary" />
        </div>
        <p
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("walletConnected")}
        </p>
        <p className="font-mono text-[12px] text-muted-foreground">
          {truncateWallet(publicKey.toBase58())}
        </p>
      </div>
    );
  }

  const isLoading = step !== "idle";

  const stepLabels: Record<WalletStep, string> = {
    idle: connected ? t("signInWithWallet") : t("connectWallet"),
    connecting: t("connecting"),
    signing: t("signingMessage"),
    verifying: t("verifyingSignature"),
    authenticated: t("authenticated"),
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Button
        variant="primary"
        size="lg"
        className="w-full gap-2.5"
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2Icon className="size-5 animate-spin" />
        ) : (
          <WalletIcon className="size-5" />
        )}
        <span style={{ fontFamily: "var(--font-body)" }}>
          {stepLabels[step]}
        </span>
      </Button>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5">
          <div className="flex gap-1">
            {(["connecting", "signing", "verifying"] as WalletStep[]).map(
              (s) => {
                const active = s === step;
                const done =
                  (
                    [
                      "connecting",
                      "signing",
                      "verifying",
                      "authenticated",
                    ] as WalletStep[]
                  ).indexOf(step) >
                  (
                    [
                      "connecting",
                      "signing",
                      "verifying",
                      "authenticated",
                    ] as WalletStep[]
                  ).indexOf(s);
                return (
                  <div
                    key={s}
                    className={cn(
                      "size-2 rounded-full transition-all",
                      active && "scale-125 bg-primary",
                      done && "bg-primary/40",
                      !active && !done && "bg-muted-foreground/20",
                    )}
                  />
                );
              },
            )}
          </div>
          <span
            className="text-[12px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {stepLabels[step]}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheckIcon className="size-3" />
        <span style={{ fontFamily: "var(--font-body)" }}>
          {t("siwsNotice")}
        </span>
      </div>
    </div>
  );
}
