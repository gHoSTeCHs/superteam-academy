import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { getServerSession } from "@/lib/auth-server";
import { validateSolanaSession } from "@/lib/solana/session";
import {
  getUserXpBalance,
  getActiveEnrollments,
  getRecentActivity,
} from "@/lib/services/learning-progress";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    const locale = await getLocale();
    return redirect({ href: "/sign-in", locale });
  }

  const solanaSession = await validateSolanaSession();
  const [xp, courses, activities] = await Promise.all([
    solanaSession
      ? getUserXpBalance(solanaSession.walletAddress)
      : Promise.resolve(0),
    getActiveEnrollments(session.user.id),
    getRecentActivity(session.user.id),
  ]);

  return (
    <DashboardClient
      userId={session.user.id}
      displayName={session.user.name ?? undefined}
      xp={xp}
      courses={courses}
      activities={activities}
    />
  );
}
