import nacl from "tweetnacl";
import bs58 from "bs58";
import * as z from "zod";
import { createAuthEndpoint, APIError } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import type {
  BetterAuthPlugin,
  BetterAuthClientPlugin,
} from "better-auth/types";

const nonceBodySchema = z.object({
  walletAddress: z.string().min(32).max(44),
});

const verifyBodySchema = z.object({
  publicKey: z.string().min(32).max(44),
  signature: z.string().min(1),
  message: z.string().min(1),
});

function verifySolanaSignature(
  message: string,
  signature: string,
  publicKey: string,
): boolean {
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = Buffer.from(signature, "base64");
  const publicKeyBytes = bs58.decode(publicKey);

  return nacl.sign.detached.verify(
    messageBytes,
    signatureBytes,
    publicKeyBytes,
  );
}

function extractField(message: string, pattern: RegExp): string | null {
  const match = pattern.exec(message);
  return match?.[1] ?? null;
}

export function siwsPlugin(): BetterAuthPlugin {
  return {
    id: "siws",
    endpoints: {
      getSiwsNonce: createAuthEndpoint(
        "/siws/nonce",
        { method: "POST", body: nonceBodySchema },
        async (ctx) => {
          const { walletAddress } = ctx.body;

          const nonce = crypto.randomUUID();
          await ctx.context.internalAdapter.deleteVerificationByIdentifier(
            `siws:${walletAddress}`,
          );
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `siws:${walletAddress}`,
            value: nonce,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          });

          return ctx.json({ nonce });
        },
      ),

      verifySiwsMessage: createAuthEndpoint(
        "/siws/verify",
        { method: "POST", body: verifyBodySchema, requireRequest: true },
        async (ctx) => {
          const { publicKey, signature, message } = ctx.body;

          let valid: boolean;
          try {
            valid = verifySolanaSignature(message, signature, publicKey);
          } catch {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid signature",
              status: 401,
            });
          }

          if (!valid) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid signature",
              status: 401,
            });
          }

          const domain = extractField(message, /^(.+) wants you to sign in/m);
          const expectedHost = new URL(
            ctx.context.baseURL || "http://localhost:3000",
          ).host;

          if (!domain || domain !== expectedHost) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid domain",
              status: 400,
            });
          }

          const messageWallet = extractField(
            message,
            /wants you to sign in with your Solana account:\n(.+)/,
          );
          if (messageWallet !== publicKey) {
            throw new APIError("BAD_REQUEST", {
              message: "Wallet address mismatch",
              status: 400,
            });
          }

          const nonce = extractField(message, /^Nonce: (.+)$/m);
          if (!nonce) {
            throw new APIError("BAD_REQUEST", {
              message: "Missing nonce",
              status: 400,
            });
          }

          const issuedAtStr = extractField(message, /^Issued At: (.+)$/m);
          if (!issuedAtStr) {
            throw new APIError("BAD_REQUEST", {
              message: "Missing issuedAt",
              status: 400,
            });
          }

          const issuedAt = new Date(issuedAtStr);
          if (Date.now() - issuedAt.getTime() > 10 * 60 * 1000) {
            throw new APIError("BAD_REQUEST", {
              message: "Message too old",
              status: 400,
            });
          }

          const verification =
            await ctx.context.internalAdapter.findVerificationValue(
              `siws:${publicKey}`,
            );

          if (!verification || new Date() > verification.expiresAt) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid or expired nonce",
              status: 401,
            });
          }

          if (verification.value !== nonce) {
            throw new APIError("UNAUTHORIZED", {
              message: "Nonce mismatch",
              status: 401,
            });
          }

          await ctx.context.internalAdapter.deleteVerificationValue(
            verification.id,
          );

          const existingAccount = (await ctx.context.adapter.findOne({
            model: "account",
            where: [
              { field: "providerId", operator: "eq", value: "solana" },
              { field: "accountId", operator: "eq", value: publicKey },
            ],
          })) as { userId: string } | null;

          let user: {
            id: string;
            name: string;
            email: string;
            emailVerified: boolean;
            image?: string | null;
            createdAt: Date;
            updatedAt: Date;
          } | null = null;
          if (existingAccount) {
            user = (await ctx.context.adapter.findOne({
              model: "user",
              where: [
                { field: "id", operator: "eq", value: existingAccount.userId },
              ],
            })) as typeof user;
          }

          if (!user) {
            const displayName =
              publicKey.slice(0, 8) + "..." + publicKey.slice(-4);
            user = await ctx.context.internalAdapter.createUser({
              name: displayName,
              email: `${publicKey}@wallet.solana`,
            });

            await ctx.context.internalAdapter.createAccount({
              userId: user.id,
              providerId: "solana",
              accountId: publicKey,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          const session = await ctx.context.internalAdapter.createSession(
            user.id,
          );
          if (!session) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to create session",
              status: 500,
            });
          }

          await setSessionCookie(ctx, { session, user });

          return ctx.json({
            token: session.token,
            success: true,
            user: { id: user.id, walletAddress: publicKey },
          });
        },
      ),
    },
  };
}

export function siwsClientPlugin(): BetterAuthClientPlugin {
  return {
    id: "siws",
    $InferServerPlugin: {} as ReturnType<typeof siwsPlugin>,
  };
}
