import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getServerSession } from "@/lib/auth-server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    const locale = await getLocale();
    return redirect({ href: "/sign-in", locale });
  }

  return (
    <SettingsClient
      displayName={session.user.name ?? undefined}
      email={session.user.email ?? undefined}
    />
  );
}
