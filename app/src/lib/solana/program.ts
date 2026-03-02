import {
  Program,
  AnchorProvider,
  type Wallet,
  type Idl,
} from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { IDL_JSON } from "./idl";
import { SOLANA_RPC_URL } from "./constants";

let _connection: Connection | undefined;

function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(SOLANA_RPC_URL, "confirmed");
  }
  return _connection;
}

const DUMMY_KEYPAIR = Keypair.generate();

const dummyWallet: Wallet = {
  publicKey: DUMMY_KEYPAIR.publicKey,
  signTransaction: () =>
    Promise.reject(new Error("Read-only wallet cannot sign")),
  signAllTransactions: () =>
    Promise.reject(new Error("Read-only wallet cannot sign")),
  payer: DUMMY_KEYPAIR,
};

export function getReadOnlyProgram(): Program<Idl> {
  const provider = new AnchorProvider(getConnection(), dummyWallet, {
    commitment: "confirmed",
  });
  return new Program(IDL_JSON, provider);
}

export function getWalletProgram(wallet: Wallet): Program<Idl> {
  const provider = new AnchorProvider(getConnection(), wallet, {
    commitment: "confirmed",
  });
  return new Program(IDL_JSON, provider);
}

export function getKeypairProgram(keypair: Keypair): Program<Idl> {
  const provider = new AnchorProvider(
    getConnection(),
    { publicKey: keypair.publicKey, payer: keypair } as Wallet,
    { commitment: "confirmed" },
  );
  return new Program(IDL_JSON, provider);
}

export { getConnection };
