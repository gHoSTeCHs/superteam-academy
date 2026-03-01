# Phase 2: Solana Service Layer

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete Solana read/write service layer — PDA utilities, bitmap helpers, on-chain data fetching via Anchor + Helius DAS, and backend-signed API routes for lesson completion and credential issuance.

**Architecture:** Server-side Anchor program reads (no wallet needed). Backend signer keypair loaded from env var. Helius DAS for token account queries and NFT asset fetches. All write operations go through Next.js API routes that sign server-side.

**Tech Stack:** @solana/web3.js, @coral-xyz/anchor, @solana/spl-token, Helius DAS API (devnet), BN.js.

**Prerequisites:** Phase 1 complete. All env vars set including `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_PROGRAM_ID`, `NEXT_PUBLIC_XP_MINT`.

**External accounts needed before starting:**
- Helius API key from https://dev.helius.xyz — add `HELIUS_API_KEY` to `.env.local`
- Backend signer keypair — generate with `solana-keygen new --outfile wallets/backend-signer.json`, fund with devnet SOL (`solana airdrop 2 <pubkey> --url devnet`), then base64-encode: `cat wallets/backend-signer.json | base64`
- The Anchor IDL — copy from `onchain-academy/target/types/onchain_academy.ts` into `app/src/lib/solana/idl.ts`

---

## Task 7: Create Solana Service Interfaces and PDA Utilities

**Files:**
- Create: `app/src/lib/solana/constants.ts`
- Create: `app/src/lib/solana/pda.ts`
- Create: `app/src/lib/solana/bitmap.ts`
- Create: `app/src/lib/solana/types.ts`
- Create: `app/src/lib/services/learning-progress.ts`

**Step 1: Create constants**

Create `app/src/lib/solana/constants.ts`:
```typescript
import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
export const XP_MINT = new PublicKey(process.env.NEXT_PUBLIC_XP_MINT!);
export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
export const MPL_CORE_PROGRAM_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d');
```

**Step 2: Create PDA derivation helpers**

Create `app/src/lib/solana/pda.ts`:
- `getConfigPda()` → `["config"]`
- `getCoursePda(courseId)` → `["course", courseId]`
- `getEnrollmentPda(courseId, learner)` → `["enrollment", courseId, learner]`
- `getMinterRolePda(minter)` → `["minter", minter]`
- `getAchievementTypePda(achievementId)` → `["achievement", achievementId]`
- `getAchievementReceiptPda(achievementId, recipient)` → `["achievement_receipt", achievementId, recipient]`

All use `PublicKey.findProgramAddressSync`.

**Step 3: Create bitmap utilities**

Create `app/src/lib/solana/bitmap.ts`:
- `isLessonComplete(lessonFlags: BN[], lessonIndex: number): boolean`
- `countCompletedLessons(lessonFlags: BN[]): number`
- `getCompletedLessonIndices(lessonFlags: BN[], lessonCount: number): number[]`

Copy directly from the INTEGRATION.md reference.

**Step 4: Create service types**

Create `app/src/lib/solana/types.ts`:
```typescript
export interface CourseOnChain {
  courseId: string;
  creator: string;
  lessonCount: number;
  difficulty: number;
  xpPerLesson: number;
  trackId: number;
  trackLevel: number;
  isActive: boolean;
  totalCompletions: number;
}

export interface EnrollmentOnChain {
  lessonFlags: BN[];
  enrolledAt: number;
  completedAt: number | null;
  credentialAsset: string | null;
}

export interface LeaderboardEntry {
  walletAddress: string;
  xpBalance: number;
  level: number;
  rank: number;
}

export interface CredentialNft {
  mint: string;
  name: string;
  uri: string;
  trackId: number;
  coursesCompleted: number;
  totalXp: number;
  collection: string;
}
```

**Step 5: Create LearningProgressService interface**

Create `app/src/lib/services/learning-progress.ts`:
```typescript
export interface LearningProgressService {
  getXpBalance(walletAddress: string): Promise<number>;
  getLevel(walletAddress: string): Promise<number>;
  getEnrollment(courseId: string, walletAddress: string): Promise<EnrollmentOnChain | null>;
  getLeaderboard(timeframe: 'weekly' | 'monthly' | 'all-time'): Promise<LeaderboardEntry[]>;
  getCredentials(walletAddress: string): Promise<CredentialNft[]>;
  getAllCourses(): Promise<CourseOnChain[]>;
}
```

**Step 6: Verify**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Solana PDA utilities, bitmap helpers, and service interfaces"
```

---

## Task 8: Implement Solana Read Service

**Files:**
- Create: `app/src/lib/solana/idl.ts`
- Create: `app/src/lib/solana/program.ts`
- Create: `app/src/lib/solana/helius.ts`
- Create: `app/src/lib/services/solana-progress-service.ts`

**Step 1: Copy IDL**

Copy `onchain-academy/target/types/onchain_academy.ts` (or the JSON equivalent) into `app/src/lib/solana/idl.ts`. This file contains the complete Anchor IDL for the on-chain program.

**Step 2: Create program accessor**

Create `app/src/lib/solana/program.ts`:
- Initializes `Program<OnchainAcademy>` with the IDL
- Exports a `getProgram(connection)` function
- Works server-side (no wallet needed for reads)

**Step 3: Create Helius DAS client**

Create `app/src/lib/solana/helius.ts`:
- `getXpHolders()` — calls `getTokenAccounts` on XP mint, returns sorted by balance
- `getCredentialsByOwner(walletAddress)` — calls `getAssetsByOwner`, filters by track collection
- `getCredentialByMint(mint)` — calls `getAsset` for single credential details

Uses `HELIUS_API_KEY` env var. Endpoint: `https://devnet.helius-rpc.com/?api-key=...`

**Step 4: Implement SolanaProgressService**

Create `app/src/lib/services/solana-progress-service.ts`:
- `getXpBalance` → `getTokenAccountBalance` on Token-2022 ATA
- `getLevel` → `Math.floor(Math.sqrt(xp / 100))`
- `getEnrollment` → `program.account.enrollment.fetchNullable(enrollmentPda)`
- `getLeaderboard` → Helius `getXpHolders()`, derive level, sort by XP
- `getCredentials` → Helius `getCredentialsByOwner()`, parse attributes
- `getAllCourses` → `program.account.course.all()`, filter active

**Step 5: Verify**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: implement Solana read service with Helius DAS integration"
```

---

## Task 9: Backend Signing API Routes

**Files:**
- Create: `app/src/app/api/solana/complete-lesson/route.ts`
- Create: `app/src/app/api/solana/finalize-course/route.ts`
- Create: `app/src/app/api/solana/issue-credential/route.ts`
- Create: `app/src/lib/solana/backend-signer.ts`

**Step 1: Create backend signer utility**

Create `app/src/lib/solana/backend-signer.ts`:
- Loads backend signer keypair from `BACKEND_SIGNER_KEYPAIR` env var (base64 encoded secret key)
- Exports `getBackendSigner(): Keypair`
- Server-side only — never imported from client code

**Step 2: Create complete-lesson API route**

`POST /api/solana/complete-lesson`

Body: `{ courseId: string, lessonIndex: number, learnerWallet: string }`

Flow:
1. Verify auth session (user is authenticated)
2. Verify learner wallet matches session user's linked wallet
3. Derive PDAs (config, course, enrollment)
4. Get or create learner's Token-2022 ATA
5. Build `completeLesson(lessonIndex)` instruction
6. Sign with backend signer
7. Send transaction
8. Return `{ txSignature: string }`

**Step 3: Create finalize-course API route**

`POST /api/solana/finalize-course`

Body: `{ courseId: string, learnerWallet: string }`

Similar flow — verifies all lessons complete via bitmap before signing.

**Step 4: Create issue-credential API route**

`POST /api/solana/issue-credential`

Body: `{ courseId: string, learnerWallet: string, credentialName: string, metadataUri: string }`

Flow:
1. Verify course is finalized (check `enrollment.completedAt`)
2. Check if credential already issued (`enrollment.credentialAsset`)
3. If not issued: call `issueCredential` with new Keypair for asset
4. If already issued: call `upgradeCredential` with existing asset pubkey
5. Return `{ txSignature: string, assetAddress: string }`

**Step 5: Add env vars**

```
BACKEND_SIGNER_KEYPAIR=<base64 encoded secret key>
HELIUS_API_KEY=...
```

**Step 6: Verify**

Run: `npx tsc --noEmit`

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add backend signing API routes for lesson completion and credentials"
```

---

## Phase Gate — Must Pass Before Starting Phase 3

All of the following must be true before proceeding:

- [ ] `cd app && npx tsc --noEmit` exits with code 0 — no type errors in any Solana service file
- [ ] `cd app && npx next build` exits with code 0
- [ ] `app/src/lib/solana/idl.ts` exists and contains the full Anchor IDL (not a placeholder)
- [ ] `BACKEND_SIGNER_KEYPAIR` and `HELIUS_API_KEY` are set in `.env.local`
- [ ] Backend signer wallet is funded: run `solana balance <pubkey> --url devnet` — should show > 0.5 SOL
- [ ] `POST http://localhost:3000/api/solana/complete-lesson` with invalid session returns 401 (not 500) — auth gate works

**Verification note:** There is no student-facing UI to test in this phase. Full integration (calling `getEnrollment`, executing `complete-lesson`) is tested end-to-end in Phase 4 when the lesson page is wired up. The gate here is type correctness and build passing only.
