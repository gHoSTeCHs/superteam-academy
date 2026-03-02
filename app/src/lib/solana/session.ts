import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { account } from "@/db/schema/auth";
import { getServerSession } from "@/lib/auth-server";

export interface SolanaSession {
  userId: string;
  walletAddress: string;
}

export async function validateSolanaSession(): Promise<SolanaSession | null> {
  const session = await getServerSession();
  if (!session) return null;

  const accounts = await db
    .select({ accountId: account.accountId })
    .from(account)
    .where(
      and(
        eq(account.userId, session.user.id),
        eq(account.providerId, "solana"),
      ),
    )
    .limit(1);

  const acc = accounts[0];
  if (!acc) return null;

  return { userId: session.user.id, walletAddress: acc.accountId };
}
