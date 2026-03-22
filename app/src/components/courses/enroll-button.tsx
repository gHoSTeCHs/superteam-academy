"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { RocketIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./progress-bar";
import { cn } from "@/lib/utils";

type EnrollmentStatus = "unenrolled" | "enrolling" | "enrolled" | "completed";

interface EnrollButtonProps {
  courseId?: string;
  status?: EnrollmentStatus;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  onEnroll?: () => void;
  onContinue?: () => void;
  onViewCredential?: () => void;
  className?: string;
}

export function EnrollButton({
  courseId,
  status: initialStatus = "unenrolled",
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  onEnroll,
  onContinue,
  onViewCredential,
  className,
}: EnrollButtonProps) {
  const t = useTranslations("Courses");
  const [status, setStatus] = useState<EnrollmentStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const { signTransaction } = useWallet();
  const { connection } = useConnection();

  async function handleEnroll() {
    if (!courseId || !signTransaction) return;

    setStatus("enrolling");
    setError(null);

    try {
      const enrollRes = await fetch("/api/solana/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (!enrollRes.ok) {
        const err = await enrollRes.json();
        throw new Error(err.error ?? "Failed to create enrollment transaction");
      }

      const { transaction: txBase64, enrollmentPda } = await enrollRes.json();
      const tx = Transaction.from(Buffer.from(txBase64, "base64"));
      const signedTx = await signTransaction(tx);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
      );
      await connection.confirmTransaction(signature, "confirmed");

      const recordRes = await fetch("/api/solana/record-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, enrollmentPda, signature }),
      });

      if (!recordRes.ok) {
        const err = await recordRes.json();
        throw new Error(err.error ?? "Failed to record enrollment");
      }

      setStatus("enrolled");
      onEnroll?.();
    } catch (err) {
      setStatus("unenrolled");
      setError(err instanceof Error ? err.message : "Enrollment failed");
    }
  }

  if (status === "completed") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <CheckCircle2Icon className="size-5 text-primary" />
          <span
            className="text-[14px] font-semibold text-primary"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("courseCompleted")}
          </span>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={onViewCredential}
          className="w-full"
        >
          {t("viewCredential")}
        </Button>
      </div>
    );
  }

  if (status === "enrolled") {
    return (
      <div className={cn("space-y-3", className)}>
        <ProgressBar
          value={progress}
          label={t("lessonsProgress", {
            completed: completedLessons,
            total: totalLessons,
          })}
        />
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          className="w-full"
        >
          {t("continueLearning")}
        </Button>
      </div>
    );
  }

  if (status === "enrolling") {
    return (
      <Button
        variant="primary"
        size="md"
        disabled
        className={cn("w-full", className)}
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span style={{ fontFamily: "var(--font-body)" }}>
          {t("signingTransaction")}
        </span>
      </Button>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant="primary"
        size="lg"
        onClick={handleEnroll}
        disabled={!courseId || !signTransaction}
        className="w-full gap-2"
      >
        <RocketIcon className="size-4" />
        <span style={{ fontFamily: "var(--font-body)" }}>{t("enrollNow")}</span>
      </Button>
      {error && (
        <p className="text-center text-[13px] text-destructive">{error}</p>
      )}
    </div>
  );
}
