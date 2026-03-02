import { NextRequest, NextResponse } from "next/server";
import { Keypair, PublicKey } from "@solana/web3.js";
import { validateSolanaSession } from "@/lib/solana/session";
import {
  getBackendProgram,
  getBackendSigner,
} from "@/lib/solana/backend-signer";
import { getReadOnlyProgram } from "@/lib/solana/program";
import {
  findCoursePda,
  findEnrollmentPda,
  findConfigPda,
} from "@/lib/solana/pda";
import { MPL_CORE_PROGRAM_ID } from "@/lib/solana/constants";
import { parseAnchorError } from "@/lib/solana/errors";

interface IssueCredentialBody {
  courseId: string;
  credentialName: string;
  metadataUri: string;
  trackCollection: string;
  coursesCompleted: number;
  totalXp: number;
}

export async function POST(req: NextRequest) {
  const session = await validateSolanaSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IssueCredentialBody;
  try {
    body = (await req.json()) as IssueCredentialBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.courseId ||
    !body.credentialName ||
    !body.metadataUri ||
    !body.trackCollection
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
    const readProgram = getReadOnlyProgram();

    const [configPda] = findConfigPda();
    const [coursePda] = findCoursePda(body.courseId);
    const [enrollmentPda] = findEnrollmentPda(body.courseId, learner);

    const enrollmentAccount = await (
      readProgram.account as Record<
        string,
        { fetch: (addr: PublicKey) => Promise<Record<string, unknown>> }
      >
    )["enrollment"]!.fetch(enrollmentPda);
    if (!enrollmentAccount.completedAt) {
      return NextResponse.json(
        { error: "Course not finalized" },
        { status: 400 },
      );
    }
    if (enrollmentAccount.credentialAsset) {
      return NextResponse.json(
        { error: "Credential already issued" },
        { status: 409 },
      );
    }

    const credentialAsset = Keypair.generate();
    const trackCollection = new PublicKey(body.trackCollection);

    const signature = await program.methods["issue_credential"]!(
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
        credential_asset: credentialAsset.publicKey,
        track_collection: trackCollection,
        payer: backendSigner.publicKey,
        backend_signer: backendSigner.publicKey,
        mpl_core_program: MPL_CORE_PROGRAM_ID,
      })
      .signers([credentialAsset])
      .rpc();

    return NextResponse.json({
      success: true,
      signature,
      credentialAsset: credentialAsset.publicKey.toBase58(),
    });
  } catch (error) {
    const parsed = parseAnchorError(error);
    return NextResponse.json(
      { error: parsed.message, code: parsed.code },
      { status: parsed.status },
    );
  }
}
