import { NextRequest, NextResponse } from "next/server";
import { SystemProgram, Transaction, PublicKey } from "@solana/web3.js";
import { validateSolanaSession } from "@/lib/solana/session";
import { getReadOnlyProgram, getConnection } from "@/lib/solana/program";
import { findCoursePda, findEnrollmentPda } from "@/lib/solana/pda";
import { parseAnchorError } from "@/lib/solana/errors";

interface EnrollBody {
  courseId: string;
  prerequisiteCourseId?: string;
}

export async function POST(req: NextRequest) {
  const session = await validateSolanaSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: EnrollBody;
  try {
    body = (await req.json()) as EnrollBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  try {
    const learner = new PublicKey(session.walletAddress);
    const program = getReadOnlyProgram();
    const connection = getConnection();

    const [coursePda] = findCoursePda(body.courseId);
    const [enrollmentPda] = findEnrollmentPda(body.courseId, learner);

    const ixBuilder = program.methods["enroll"]!(body.courseId).accountsPartial(
      {
        course: coursePda,
        enrollment: enrollmentPda,
        learner,
        system_program: SystemProgram.programId,
      },
    );

    if (body.prerequisiteCourseId) {
      const [prereqCoursePda] = findCoursePda(body.prerequisiteCourseId);
      const [prereqEnrollmentPda] = findEnrollmentPda(
        body.prerequisiteCourseId,
        learner,
      );
      ixBuilder.remainingAccounts([
        { pubkey: prereqCoursePda, isWritable: false, isSigner: false },
        { pubkey: prereqEnrollmentPda, isWritable: false, isSigner: false },
      ]);
    }

    const ix = await ixBuilder.instruction();
    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: learner,
    }).add(ix);

    const serialized = Buffer.from(
      tx.serialize({ requireAllSignatures: false }),
    );

    return NextResponse.json({
      transaction: serialized.toString("base64"),
      enrollmentPda: enrollmentPda.toBase58(),
    });
  } catch (error) {
    const parsed = parseAnchorError(error);
    return NextResponse.json(
      { error: parsed.message, code: parsed.code },
      { status: parsed.status },
    );
  }
}
