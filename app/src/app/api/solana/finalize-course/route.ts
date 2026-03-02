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
import { getConnection, getReadOnlyProgram } from "@/lib/solana/program";
import {
  findCoursePda,
  findEnrollmentPda,
  findConfigPda,
} from "@/lib/solana/pda";
import { XP_MINT, TOKEN_2022_PROGRAM_ID } from "@/lib/solana/constants";
import { parseAnchorError } from "@/lib/solana/errors";

interface FinalizeBody {
  courseId: string;
}

export async function POST(req: NextRequest) {
  const session = await validateSolanaSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: FinalizeBody;
  try {
    body = (await req.json()) as FinalizeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  try {
    const learner = new PublicKey(session.walletAddress);
    const backendSigner = getBackendSigner();
    const program = getBackendProgram();
    const connection = getConnection();
    const readProgram = getReadOnlyProgram();

    const [configPda] = findConfigPda();
    const [coursePda] = findCoursePda(body.courseId);
    const [enrollmentPda] = findEnrollmentPda(body.courseId, learner);

    const courseAccount = await (
      readProgram.account as Record<
        string,
        { fetch: (addr: PublicKey) => Promise<Record<string, unknown>> }
      >
    )["course"]!.fetch(coursePda);
    const creator = courseAccount.creator as PublicKey;

    const learnerAta = getAssociatedTokenAddressSync(
      XP_MINT,
      learner,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const creatorAta = getAssociatedTokenAddressSync(
      XP_MINT,
      creator,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const preInstructions = [];

    const creatorAtaInfo = await connection.getAccountInfo(creatorAta);
    if (!creatorAtaInfo) {
      preInstructions.push(
        createAssociatedTokenAccountInstruction(
          backendSigner.publicKey,
          creatorAta,
          creator,
          XP_MINT,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ),
      );
    }

    const signature = await program.methods["finalize_course"]!()
      .accountsPartial({
        config: configPda,
        course: coursePda,
        enrollment: enrollmentPda,
        learner,
        learner_token_account: learnerAta,
        creator_token_account: creatorAta,
        creator,
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
