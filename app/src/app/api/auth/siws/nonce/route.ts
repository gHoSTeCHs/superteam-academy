import { NextResponse } from "next/server";
import { db } from "@/db";
import { siwsNonce } from "@/db/schema/custom";

export async function GET() {
  const nonce = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  await db.insert(siwsNonce).values({
    id: crypto.randomUUID(),
    nonce,
    expiresAt,
    createdAt: now,
  });

  return NextResponse.json({ nonce, expiresAt });
}
