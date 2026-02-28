import { NextRequest, NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

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
    const signatureBytes = bs58.decode(payload.signature);
    const publicKeyBytes = bs58.decode(payload.publicKey);

    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    return valid ? payload.publicKey : null;
  } catch {
    return null;
  }
}

export async function handleSiwsSignIn(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SiwsPayload;

    if (!body.publicKey || !body.signature || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const verified = verifySolanaSignature(body);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      publicKey: verified,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
