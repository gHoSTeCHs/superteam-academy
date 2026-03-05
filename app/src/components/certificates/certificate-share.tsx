"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShareIcon, CopyIcon, CheckIcon, DownloadIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CertificateShareProps {
  courseName: string;
  mintAddress: string;
  shareUrl?: string;
  onDownload?: () => void;
  className?: string;
}

export function CertificateShare({
  courseName,
  mintAddress,
  shareUrl,
  onDownload,
  className,
}: CertificateShareProps) {
  const t = useTranslations("Certificates");
  const [copied, setCopied] = useState(false);

  const url =
    shareUrl ?? `https://academy.superteam.fun/certificates/${mintAddress}`;
  const tweetText = encodeURIComponent(
    `I just earned my "${courseName}" credential on @SuperteamDAO Academy! 🎓\n\nVerify on-chain: ${url}`,
  );
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className={cn("px-6 py-5", className)}>
      <div className="mb-4 flex items-center gap-2">
        <ShareIcon className="size-4 text-primary" />
        <h3
          className="text-[14px] font-semibold text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("shareCredential")}
        </h3>
      </div>

      <div className="space-y-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-[#1DA1F2]/10">
            <svg className="size-4" viewBox="0 0 24 24" fill="#1DA1F2">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div className="flex-1">
            <p
              className="text-[13px] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t("shareOnTwitter")}
            </p>
            <p
              className="text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t("postAchievement")}
            </p>
          </div>
        </a>

        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-[#0A66C2]/10">
            <svg className="size-4" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </div>
          <div className="flex-1">
            <p
              className="text-[13px] font-semibold text-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t("shareOnLinkedIn")}
            </p>
            <p
              className="text-[11px] text-muted-foreground"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t("addToProfile")}
            </p>
          </div>
        </a>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex-1 gap-1.5 text-[12px]"
          >
            {copied ? (
              <>
                <CheckIcon className="size-3.5 text-primary" />
                {t("copied")}
              </>
            ) : (
              <>
                <CopyIcon className="size-3.5" />
                {t("copyLink")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="flex-1 gap-1.5 text-[12px]"
          >
            <DownloadIcon className="size-3.5" />
            {t("downloadImage")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
