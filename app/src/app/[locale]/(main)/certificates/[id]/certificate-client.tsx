"use client";

import { useAuth } from "@/providers/auth-provider";
import {
  CertificateDisplay,
  type CertificateData,
} from "@/components/certificates/certificate-display";
import { CertificateShare } from "@/components/certificates/certificate-share";
import { OnChainProof } from "@/components/certificates/on-chain-proof";

interface CertificateClientProps {
  mintAddress: string;
}

export function CertificateClient({ mintAddress }: CertificateClientProps) {
  const { walletAddress } = useAuth();

  const certificate: CertificateData = {
    courseName: "Certificate",
    trackName: "Solana",
    recipientWallet: walletAddress ?? "",
    completionDate: new Date().toISOString(),
    totalXp: 0,
    level: 0,
    lessonsCompleted: 0,
    mintAddress,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <CertificateDisplay certificate={certificate} />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <CertificateShare
          courseName={certificate.courseName}
          mintAddress={mintAddress}
        />
        <OnChainProof
          mintAddress={mintAddress}
          ownerAddress={walletAddress ?? ""}
          network="devnet"
        />
      </div>
    </div>
  );
}
