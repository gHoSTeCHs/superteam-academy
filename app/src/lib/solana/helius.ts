import "server-only";
import { PublicKey } from "@solana/web3.js";
import { XP_MINT, HELIUS_RPC_URL } from "./constants";
import { getConnection } from "./program";
import { getXpAta } from "./pda";
import { getXpLevel } from "@/lib/streaks";
import type { XpBalance, DasCredential, LeaderboardEntry } from "./types";

export async function getXpBalance(wallet: PublicKey): Promise<XpBalance> {
  const ata = getXpAta(wallet);
  const connection = getConnection();
  try {
    const info = await connection.getTokenAccountBalance(ata);
    const amount = Number(info.value.amount);
    const decimals = info.value.decimals;
    const { level, currentXp, nextLevelXp, progress } = getXpLevel(amount);
    return { amount, decimals, level, currentXp, nextLevelXp, progress };
  } catch {
    return {
      amount: 0,
      decimals: 0,
      level: 0,
      currentXp: 0,
      nextLevelXp: 100,
      progress: 0,
    };
  }
}

async function dasRpc<T>(method: string, params: unknown): Promise<T> {
  if (!HELIUS_RPC_URL) throw new Error("HELIUS_RPC_URL not configured");

  const res = await fetch(HELIUS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  const json = (await res.json()) as {
    result?: T;
    error?: { message: string };
  };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

interface DasAsset {
  id: string;
  content?: {
    metadata?: { name?: string };
    json_uri?: string;
    links?: { image?: string };
  };
  grouping?: Array<{ group_key: string; group_value: string }>;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface DasAssetList {
  items: DasAsset[];
  total: number;
}

export async function getCredentialsByOwner(
  wallet: PublicKey,
): Promise<DasCredential[]> {
  const result = await dasRpc<DasAssetList>("getAssetsByOwner", {
    ownerAddress: wallet.toBase58(),
    displayOptions: { showCollectionMetadata: true },
  });

  return result.items
    .filter((a) => a.grouping?.some((g) => g.group_key === "collection"))
    .map((a) => ({
      id: a.id,
      name: a.content?.metadata?.name ?? "",
      uri: a.content?.json_uri ?? "",
      image: a.content?.links?.image ?? "",
      collection:
        a.grouping?.find((g) => g.group_key === "collection")?.group_value ??
        "",
      attributes: Object.fromEntries(
        (a.attributes ?? []).map((attr) => [attr.trait_type, attr.value]),
      ),
    }));
}

interface DasTokenAccount {
  owner: string;
  amount: number;
}

interface DasTokenAccountList {
  token_accounts: DasTokenAccount[];
}

export async function getXpLeaderboard(
  limit: number = 20,
): Promise<LeaderboardEntry[]> {
  const result = await dasRpc<DasTokenAccountList>("getTokenAccounts", {
    mint: XP_MINT.toBase58(),
    limit,
    options: { showZeroBalance: false },
  });

  return result.token_accounts
    .sort((a, b) => b.amount - a.amount)
    .map((ta) => ({
      wallet: ta.owner,
      amount: ta.amount,
      level: getXpLevel(ta.amount).level,
    }));
}
