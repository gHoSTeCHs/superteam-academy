import "server-only";
import { Keypair } from "@solana/web3.js";
import { type Program, type Idl } from "@coral-xyz/anchor";
import { getKeypairProgram } from "./program";

let _backendSigner: Keypair | undefined;

export function getBackendSigner(): Keypair {
  if (_backendSigner) return _backendSigner;

  const raw = process.env.BACKEND_SIGNER_KEYPAIR;
  if (!raw) throw new Error("BACKEND_SIGNER_KEYPAIR env var not set");

  const decoded = Buffer.from(raw, "base64").toString("utf-8");
  const bytes = new Uint8Array(JSON.parse(decoded) as number[]);
  _backendSigner = Keypair.fromSecretKey(bytes);
  return _backendSigner;
}

export function getBackendProgram(): Program<Idl> {
  return getKeypairProgram(getBackendSigner());
}
