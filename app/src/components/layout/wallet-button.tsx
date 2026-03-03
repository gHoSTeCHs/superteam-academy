"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  className?: string;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletButton({ className }: WalletButtonProps) {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, signOut } = useAuth();

  if (publicKey) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2 font-mono text-[12px]", className)}
        onClick={() => {
          if (isAuthenticated) {
            signOut();
          }
        }}
      >
        <span className="size-2 rounded-full bg-emerald-500" />
        {truncateAddress(publicKey.toBase58())}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      className={cn("gap-2", className)}
      onClick={() => setVisible(true)}
    >
      <WalletIcon className="size-4" />
      <span style={{ fontFamily: "var(--font-body)" }}>Connect Wallet</span>
    </Button>
  );
}
