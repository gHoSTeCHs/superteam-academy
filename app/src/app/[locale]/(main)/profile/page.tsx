import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getServerSession } from "@/lib/auth-server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    const locale = await getLocale();
    return redirect({ href: "/sign-in", locale });
  }

  return (
    <ProfileClient
      userId={session.user.id}
      displayName={session.user.name ?? undefined}
    />
  );
}
