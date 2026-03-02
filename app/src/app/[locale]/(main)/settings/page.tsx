import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SettingsClient
      displayName={session.user.name ?? undefined}
      email={session.user.email ?? undefined}
    />
  );
}
