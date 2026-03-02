import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DashboardClient
      userId={session.user.id}
      displayName={session.user.name ?? undefined}
    />
  );
}
