import { NextRequest, NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { user, account, session } from "@/db/schema/auth";

interface SiwsPayload {
  publicKey: string;
  signature: string;
  message: string;
}

/**
 * Verify an Ed25519 signature from a Solana wallet.
 * Returns the public key string if valid, null otherwise.
 */
export function verifySolanaSignature(payload: SiwsPayload): string | null {
  try {
    const messageBytes = new TextEncoder().encode(payload.message);
    const signatureBytes = Buffer.from(payload.signature, "base64");
    const publicKeyBytes = bs58.decode(payload.publicKey);

    const valid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );
    return valid ? payload.publicKey : null;
  } catch {
    return null;
  }
}

async function findOrCreateWalletUser(publicKey: string): Promise<string> {
  const existing = await db
    .select({ userId: account.userId })
    .from(account)
    .where(
      and(eq(account.providerId, "solana"), eq(account.accountId, publicKey)),
    )
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    return existing[0].userId;
  }

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const now = new Date();

  await db.insert(user).values({
    id: userId,
    name: publicKey.slice(0, 8) + "..." + publicKey.slice(-4),
    email: `${publicKey}@wallet.solana`,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: publicKey,
    providerId: "solana",
    userId,
    createdAt: now,
    updatedAt: now,
  });

  return userId;
}

export async function handleSiwsSignIn(
  req: NextRequest,
): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SiwsPayload;

    if (!body.publicKey || !body.signature || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const verified = verifySolanaSignature(body);
    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const userId = await findOrCreateWalletUser(verified);

    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(session).values({
      id: crypto.randomUUID(),
      token,
      userId,
      expiresAt,
      ipAddress:
        req.headers.get("x-forwarded-for") ??
        req.headers.get("x-real-ip") ??
        null,
      userAgent: req.headers.get("user-agent") ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction
      ? "__Secure-better-auth.session_token"
      : "better-auth.session_token";

    const response = NextResponse.json({ success: true, publicKey: verified });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
