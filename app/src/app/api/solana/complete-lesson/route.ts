import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { validateSolanaSession } from "@/lib/solana/session";
import {
  getBackendProgram,
  getBackendSigner,
} from "@/lib/solana/backend-signer";
import { getConnection } from "@/lib/solana/program";
import {
  findCoursePda,
  findEnrollmentPda,
  findConfigPda,
} from "@/lib/solana/pda";
import { XP_MINT, TOKEN_2022_PROGRAM_ID } from "@/lib/solana/constants";
import { parseAnchorError } from "@/lib/solana/errors";

interface CompleteLessonBody {
  courseId: string;
  lessonIndex: number;
}

export async function POST(req: NextRequest) {
  const session = await validateSolanaSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CompleteLessonBody;
  try {
    body = (await req.json()) as CompleteLessonBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.courseId || typeof body.lessonIndex !== "number") {
    return NextResponse.json(
      { error: "Missing courseId or lessonIndex" },
      { status: 400 },
    );
  }

  try {
    const learner = new PublicKey(session.walletAddress);
    const backendSigner = getBackendSigner();
    const program = getBackendProgram();
    const connection = getConnection();

    const [configPda] = findConfigPda();
    const [coursePda] = findCoursePda(body.courseId);
    const [enrollmentPda] = findEnrollmentPda(body.courseId, learner);

    const learnerAta = getAssociatedTokenAddressSync(
      XP_MINT,
      learner,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const ataInfo = await connection.getAccountInfo(learnerAta);
    const preInstructions = [];

    if (!ataInfo) {
      preInstructions.push(
        createAssociatedTokenAccountInstruction(
          backendSigner.publicKey,
          learnerAta,
          learner,
          XP_MINT,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }

    const signature = await program.methods["complete_lesson"]!(
      body.lessonIndex,
    )
      .accountsPartial({
        config: configPda,
        course: coursePda,
        enrollment: enrollmentPda,
        learner,
        learner_token_account: learnerAta,
        xp_mint: XP_MINT,
        backend_signer: backendSigner.publicKey,
        token_program: TOKEN_2022_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .rpc();

    return NextResponse.json({ success: true, signature });
  } catch (error) {
    const parsed = parseAnchorError(error);
    return NextResponse.json(
      { error: parsed.message, code: parsed.code },
      { status: parsed.status },
    );
  }
}
