import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
    "ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf",
);

export const XP_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_XP_MINT ??
    "xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3",
);

export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

export const MPL_CORE_PROGRAM_ID = new PublicKey(
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
);

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL ?? "";
