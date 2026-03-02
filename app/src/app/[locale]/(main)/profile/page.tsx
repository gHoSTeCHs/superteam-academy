import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <ProfileClient
      userId={session.user.id}
      displayName={session.user.name ?? undefined}
    />
  );
}
