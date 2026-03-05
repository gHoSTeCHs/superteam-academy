"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UserIcon, MailIcon, CameraIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AccountSettingsProps {
  displayName?: string;
  email?: string;
  onSave?: (data: { displayName: string; email: string }) => void;
  className?: string;
}

export function AccountSettings({
  displayName: nameProp = "",
  email: emailProp = "",
  onSave,
  className,
}: AccountSettingsProps) {
  const t = useTranslations("Settings");
  const [displayName, setDisplayName] = useState(nameProp);
  const [email, setEmail] = useState(emailProp);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave?.({ displayName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "U";

  return (
    <Card className={cn("px-6 py-5", className)}>
      <h3
        className="mb-1 text-[14px] font-semibold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("account")}
      </h3>
      <p
        className="mb-5 text-[13px] text-muted-foreground"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {t("manageProfile")}
      </p>

      <div className="mb-6 flex items-center gap-4">
        <div className="group relative">
          <div
            className="flex size-16 items-center justify-center rounded-full text-[18px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #2f6b3f 0%, #008c4c 100%)",
              fontFamily: "var(--font-display)",
            }}
          >
            {initials}
          </div>
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <CameraIcon className="size-5 text-white" />
          </button>
        </div>
        <div>
          <p
            className="text-[13px] font-semibold text-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("profilePhoto")}
          </p>
          <p
            className="text-[11px] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t("uploadAvatar")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <UserIcon className="size-3.5" />
            {t("displayName")}
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={t("displayNamePlaceholder")}
          />
        </div>

        <div>
          <label
            className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <MailIcon className="size-3.5" />
            {t("email")}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button variant="primary" size="sm" onClick={handleSave}>
            {saved ? t("saved") : t("saveChanges")}
          </Button>
          {saved && (
            <span
              className="text-[12px] font-medium text-primary"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t("changesSaved")}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
