import { NextRequest, NextResponse } from "next/server";
import { SystemProgram, PublicKey } from "@solana/web3.js";
import { validateSolanaSession } from "@/lib/solana/session";
import {
  getBackendProgram,
  getBackendSigner,
} from "@/lib/solana/backend-signer";
import {
  findConfigPda,
  findCoursePda,
  findEnrollmentPda,
} from "@/lib/solana/pda";
import { MPL_CORE_PROGRAM_ID } from "@/lib/solana/constants";
import { parseAnchorError } from "@/lib/solana/errors";

interface UpgradeCredentialBody {
  courseId: string;
  credentialName: string;
  metadataUri: string;
  coursesCompleted: number;
  totalXp: number;
  credentialAsset: string;
  trackCollection: string;
}

export async function POST(req: NextRequest) {
  const session = await validateSolanaSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpgradeCredentialBody;
  try {
    body = (await req.json()) as UpgradeCredentialBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.courseId ||
    !body.credentialName ||
    !body.metadataUri ||
    !body.credentialAsset ||
    !body.trackCollection ||
    typeof body.coursesCompleted !== "number" ||
    !Number.isInteger(body.coursesCompleted) ||
    body.coursesCompleted < 0 ||
    typeof body.totalXp !== "number" ||
    !Number.isInteger(body.totalXp) ||
    body.totalXp < 0
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const learner = new PublicKey(session.walletAddress);
    const backendSigner = getBackendSigner();
    const program = getBackendProgram();

    const [configPda] = findConfigPda();
    const [coursePda] = findCoursePda(body.courseId);
    const [enrollmentPda] = findEnrollmentPda(body.courseId, learner);

    const signature = await program.methods["upgrade_credential"]!(
      body.credentialName,
      body.metadataUri,
      body.coursesCompleted,
      BigInt(body.totalXp),
    )
      .accountsPartial({
        config: configPda,
        course: coursePda,
        enrollment: enrollmentPda,
        learner,
        credential_asset: new PublicKey(body.credentialAsset),
        track_collection: new PublicKey(body.trackCollection),
        payer: backendSigner.publicKey,
        backend_signer: backendSigner.publicKey,
        mpl_core_program: MPL_CORE_PROGRAM_ID,
        system_program: SystemProgram.programId,
      })
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
