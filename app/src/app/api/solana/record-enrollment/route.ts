import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { validateSolanaSession } from "@/lib/solana/session";
import { getConnection } from "@/lib/solana/program";
import { findEnrollmentPda } from "@/lib/solana/pda";
import { parseAnchorError } from "@/lib/solana/errors";
import { db } from "@/db";
import { enrollment } from "@/db/schema/custom";

interface RecordEnrollmentBody {
  courseId: string;
  enrollmentPda: string;
  signature: string;
}

export async function POST(req: NextRequest) {
  const session = await validateSolanaSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RecordEnrollmentBody;
  try {
    body = (await req.json()) as RecordEnrollmentBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.courseId || !body.enrollmentPda || !body.signature) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const learner = new PublicKey(session.walletAddress);
    const [expectedPda] = findEnrollmentPda(body.courseId, learner);

    if (expectedPda.toBase58() !== body.enrollmentPda) {
      return NextResponse.json(
        { error: "Invalid enrollment PDA" },
        { status: 400 },
      );
    }

    const connection = getConnection();
    const pdaAccount = await connection.getAccountInfo(expectedPda);
    if (!pdaAccount) {
      return NextResponse.json(
        { error: "Enrollment not confirmed on-chain" },
        { status: 400 },
      );
    }

    await db.insert(enrollment).values({
      id: crypto.randomUUID(),
      userId: session.userId,
      sanityCourseId: body.courseId,
      walletAddress: session.walletAddress,
      enrollmentPda: body.enrollmentPda,
      enrolledAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const parsed = parseAnchorError(error);
    return NextResponse.json(
      { error: parsed.message, code: parsed.code },
      { status: parsed.status },
    );
  }
}
