# Solana Development Guide — Superteam Academy

A detailed reference for understanding the Solana development work done on this project. Written to be self-contained — if you're explaining this to bounty judges or reviewing it later, everything you need is here.

---

## Table of Contents

1. [Solana Fundamentals](#1-solana-fundamentals)
2. [Our Technology Stack](#2-our-technology-stack)
3. [The On-Chain Program](#3-the-on-chain-program)
4. [Token Standards We Use](#4-token-standards-we-use)
5. [PDAs (Program Derived Addresses)](#5-pdas-program-derived-addresses)
6. [The Anchor Framework](#6-the-anchor-framework)
7. [Tooling Setup — What We Installed and Why](#7-tooling-setup)
8. [Keypairs and Wallets](#8-keypairs-and-wallets)
9. [The IDL (Interface Definition Language)](#9-the-idl)
10. [Frontend Integration Architecture](#10-frontend-integration-architecture)
11. [Helius DAS API](#11-helius-das-api)
12. [Backend Signer Pattern](#12-backend-signer-pattern)
13. [Environment Variables Reference](#13-environment-variables-reference)
14. [Commands Reference](#14-commands-reference)
15. [Glossary](#15-glossary)

---

## 1. Solana Fundamentals

### What is Solana?

Solana is a high-performance Layer 1 blockchain. Transactions confirm in ~400ms and cost fractions of a cent. Programs (smart contracts) are deployed on-chain and executed by the Solana runtime.

### Clusters (Networks)

Solana runs three separate networks:

| Cluster          | URL                                   | Purpose                                            | SOL is real?         |
| ---------------- | ------------------------------------- | -------------------------------------------------- | -------------------- |
| **Mainnet-Beta** | `https://api.mainnet-beta.solana.com` | Production — real users, real money                | Yes                  |
| **Devnet**       | `https://api.devnet.solana.com`       | Developer testing — identical behavior to mainnet  | No — free via faucet |
| **Testnet**      | `https://api.testnet.solana.com`      | Validator stress testing — rarely used by app devs | No                   |

**Our program is deployed on Devnet.** This means:

- The program behaves exactly like it would on mainnet
- Users connect real wallets (Phantom, Solflare, etc.)
- Transactions are real and verifiable on Solana Explorer
- SOL used for transaction fees is free (airdropped from faucet)
- No real money is at risk

For the bounty, judges test on devnet. "Devnet program integration" means the frontend sends real transactions to our deployed program on devnet.

### Accounts

Everything on Solana is an account. Programs, tokens, user data — all accounts. Each account has:

- **Address** (public key) — 32-byte identifier
- **Owner** — the program that controls it
- **Lamports** — SOL balance (1 SOL = 1,000,000,000 lamports)
- **Data** — arbitrary bytes (programs store state here)
- **Executable** — whether this account is a program

### Transactions

A transaction contains one or more instructions. Each instruction specifies:

- Which program to call
- Which accounts to pass
- Instruction data (serialized arguments)

Transactions require signatures from relevant accounts. Transaction fees are ~0.000005 SOL (~$0.001).

### Compute Units (CU)

Each instruction has a compute budget. Simple operations use ~200K CU. Our most expensive operation (`award_achievement`) uses ~80K CU — well within limits.

---

## 2. Our Technology Stack

| Component         | Technology                   | Why                                                                                                  |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| On-chain program  | Anchor 0.31.1 (Rust)         | Industry-standard Solana framework — generates IDL, handles serialization, account validation        |
| XP tokens         | Token-2022 (SPL)             | Supports extensions: `NonTransferable` (soulbound) + `PermanentDelegate` (no self-burn)              |
| Credential NFTs   | Metaplex Core                | Modern NFT standard — plugins for `PermanentFreezeDelegate` (soulbound), in-place attribute upgrades |
| Frontend          | Next.js 16 + React 19        | Server Components for on-chain reads, API routes for backend signing                                 |
| Wallet connection | @solana/wallet-adapter-react | Standard library — supports Phantom, Solflare, Coinbase, Ledger, Trust                               |
| On-chain reads    | @coral-xyz/anchor            | Deserializes program accounts using the IDL                                                          |
| NFT/token queries | Helius DAS API               | Digital Asset Standard — efficient queries for token holders, NFT ownership                          |
| RPC provider      | Helius                       | Enhanced Solana RPC with DAS extensions                                                              |

---

## 3. The On-Chain Program

**Program ID:** `ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf`
**Source:** `onchain-academy/programs/onchain-academy/src/`

The program has **16 instructions** organized into 5 groups:

### Platform Management (2 instructions)

| Instruction     | Who Signs | What It Does                                                                                                         |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `initialize`    | authority | One-time setup: creates the Config PDA, creates the Token-2022 XP mint, registers the backend signer as a MinterRole |
| `update_config` | authority | Rotates the backend signer public key stored in Config; can deactivate old MinterRole                                |

### Course Management (2 instructions)

| Instruction     | Who Signs | What It Does                                                                                      |
| --------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `create_course` | authority | Creates a Course PDA with lesson count, XP amounts, difficulty, track info, optional prerequisite |
| `update_course` | authority | Updates course content, XP reward, active status, or creator reward amount                        |

### Enrollment & Progress (5 instructions)

| Instruction          | Who Signs          | What It Does                                                                                           |
| -------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| `enroll`             | **learner**        | Creates an Enrollment PDA — checks course is active and prerequisite is met                            |
| `complete_lesson`    | **backend_signer** | Flips a bit in the lesson bitmap + mints XP tokens to the learner                                      |
| `finalize_course`    | **backend_signer** | Verifies all lessons complete via bitmap, mints completion bonus + creator reward, sets `completed_at` |
| `issue_credential`   | **backend_signer** | Creates a Metaplex Core credential NFT for the learner (first completion)                              |
| `upgrade_credential` | **backend_signer** | Updates an existing credential NFT's metadata and attributes (subsequent completions)                  |
| `close_enrollment`   | **learner**        | Closes the Enrollment PDA and reclaims rent SOL; 24h cooldown if course not completed                  |

### Minter System (3 instructions)

| Instruction       | Who Signs | What It Does                                                                   |
| ----------------- | --------- | ------------------------------------------------------------------------------ |
| `register_minter` | authority | Creates a MinterRole PDA — allows an address to mint XP and award achievements |
| `revoke_minter`   | authority | Closes the MinterRole PDA, revoking permissions                                |
| `reward_xp`       | minter    | Mints arbitrary XP to a recipient, capped by MinterRole settings               |

### Achievements (3 instructions)

| Instruction                   | Who Signs | What It Does                                                      |
| ----------------------------- | --------- | ----------------------------------------------------------------- |
| `create_achievement_type`     | authority | Defines an achievement with name, metadata, supply cap, XP reward |
| `award_achievement`           | minter    | Mints an achievement NFT + XP to a recipient                      |
| `deactivate_achievement_type` | authority | Disables future awards for an achievement type                    |

### Who Signs What — The Key Pattern

```
Learner wallet signs:     enroll, close_enrollment
Backend server signs:     complete_lesson, finalize_course, issue_credential, upgrade_credential
Platform authority signs: initialize, update_config, create_course, update_course,
                         register_minter, revoke_minter, create_achievement_type,
                         deactivate_achievement_type
Registered minter signs:  reward_xp, award_achievement
```

The learner signs their own enrollment (they pay the rent for the Enrollment PDA). The backend server signs everything related to progress — this is the anti-cheat mechanism. The platform authority (a Squads multisig on mainnet) manages courses and configuration.

---

## 4. Token Standards We Use

### XP Token — Token-2022 (SPL Token Extensions)

Token-2022 is the newer SPL token program that supports extensions. We use two:

- **NonTransferable**: The XP token cannot be sent to another wallet. It's soulbound to the learner who earned it. This prevents XP trading or buying your way up the leaderboard.
- **PermanentDelegate**: The mint authority (our Config PDA) is the permanent delegate. This means learners cannot burn their own XP. Only the program can mint it; nobody can destroy it.

**Technical details:**

- 0 decimals (XP is always a whole number)
- Mint authority: Config PDA (the program controls minting)
- Each learner has an Associated Token Account (ATA) derived from their wallet + the XP mint address
- Token program ID: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` (Token-2022, not the legacy `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)

### Credential NFTs — Metaplex Core

Metaplex Core is the modern NFT standard on Solana (replaces Token Metadata / Bubblegum). We use it for course completion credentials:

- **PermanentFreezeDelegate plugin**: The NFT is frozen permanently — it cannot be transferred. This makes credentials soulbound.
- **Attributes plugin**: Stores structured metadata on-chain (`courses_completed`, `total_xp`). When a learner completes more courses in a track, the credential NFT is upgraded in-place — same address, updated attributes.
- **One credential per learner per track**: The credential address never changes. The program checks `enrollment.credential_asset` to decide between `issue_credential` (first time) and `upgrade_credential` (subsequent).

### Achievement NFTs — Metaplex Core

Same standard as credentials. One NFT per achievement per recipient. Double-award prevention uses PDA collision: the `AchievementReceipt` PDA is derived from `[achievement_id, recipient]` — trying to init the same PDA twice fails.

---

## 5. PDAs (Program Derived Addresses)

A PDA is a deterministic account address derived from seeds + a program ID. PDAs are the backbone of Solana program state.

**Why PDAs?** Instead of storing a database, Solana programs derive account addresses from known inputs. If you know the course ID, you can compute the Course PDA address without any lookup.

### Our 6 PDA Types

| PDA                    | Seeds                                                     | What It Stores                                                           |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Config**             | `["config"]`                                              | Authority pubkey, backend signer pubkey, XP mint address, course counter |
| **Course**             | `["course", courseId]`                                    | Course metadata, lesson count, XP amounts, track info, active status     |
| **Enrollment**         | `["enrollment", courseId, learnerPubkey]`                 | Lesson completion bitmap (256-bit), timestamps, credential asset address |
| **MinterRole**         | `["minter", minterPubkey]`                                | Label, XP cap per call, active flag                                      |
| **AchievementType**    | `["achievement", achievementId]`                          | Name, metadata URI, supply cap, XP reward, awarded count                 |
| **AchievementReceipt** | `["achievement_receipt", achievementId, recipientPubkey]` | Awarded timestamp (existence = awarded)                                  |

### How PDA Derivation Works

```typescript
const [coursePda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("course"), Buffer.from("intro-to-solana")],
  PROGRAM_ID,
);
```

This always produces the same address for the same inputs. The `bump` is a single byte that makes the address fall off the Ed25519 curve (so it can't have a private key — only the program can sign for it).

### Lesson Completion Bitmap

Each Enrollment stores lesson progress as 4 × u64 integers = 256 bits. Each bit represents one lesson:

```
Bit 0 = lesson 0, Bit 1 = lesson 1, ..., Bit 255 = lesson 255
```

To check if lesson N is complete:

```typescript
const wordIndex = Math.floor(lessonIndex / 64);
const bitIndex = lessonIndex % 64;
const isComplete = (lessonFlags[wordIndex] >> bitIndex) & 1n;
```

This is a space-efficient way to track up to 256 lessons per course using only 32 bytes.

---

## 6. The Anchor Framework

Anchor is the standard framework for Solana program development. It provides:

- **IDL generation**: Automatically produces a JSON schema of all instructions, accounts, and types
- **Account validation**: `#[account]` macros generate validation code (owner checks, PDA derivation, size allocation)
- **Serialization**: Borsh serialization/deserialization handled automatically
- **Error handling**: Typed errors with codes
- **Event emission**: Typed events for indexing

**Our program uses Anchor 0.31.1** (defined in `Cargo.toml`). The CLI we installed is 0.32.1 — the version mismatch produces a warning but works fine for building.

### Key Anchor Concepts

**`declare_id!`**: Sets the program ID. Must match the deployed program address.

**`#[program]`**: Marks the module containing instruction handlers.

**`#[derive(Accounts)]`**: Defines the account context for an instruction — which accounts are required, their constraints, and validation rules.

**`#[account]`**: Marks a struct as a program account (PDA state).

---

## 7. Tooling Setup

### What We Installed

All tooling runs inside **WSL (Windows Subsystem for Linux)** because Solana's toolchain is Linux-native.

#### Installation Command

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

**What this installs:**

| Tool                  | Version     | Purpose                                                                                       |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `solana` (Solana CLI) | 3.0.15      | Interact with the Solana network — send transactions, check balances, manage keypairs         |
| `anchor` (Anchor CLI) | 0.32.1      | Build Anchor programs, generate IDLs, run tests, deploy                                       |
| `cargo-build-sbf`     | (bundled)   | Compiles Rust to SBF (Solana Bytecode Format) — the instruction set Solana validators execute |
| Rust toolchain        | 1.84.1-sbpf | Solana-specific Rust compiler fork that targets the SBF backend                               |
| `surfpool`            | (bundled)   | Local Solana validator for testing                                                            |

#### Why WSL?

Solana's compiler toolchain (`cargo-build-sbf`) cross-compiles Rust to SBF bytecode using a custom LLVM backend. This toolchain only runs on Linux and macOS. On Windows, WSL provides a native Linux environment.

### Building the Program

```bash
cd onchain-academy && anchor build
```

**What this does:**

1. `anchor build` invokes `cargo-build-sbf`, which:
   - Downloads all Rust crate dependencies (~300+ crates on first build)
   - Compiles everything to SBF (Solana Bytecode Format)
   - Produces the deployable binary: `target/deploy/onchain_academy.so`
   - Generates the IDL: `target/idl/onchain_academy.json`
2. First build takes 5–10 minutes (compiling all dependencies)
3. Subsequent builds take seconds (only recompiles changed code)
4. The `target/` directory caches all compiled artifacts

---

## 8. Keypairs and Wallets

### What is a Keypair?

A Solana keypair is an Ed25519 key pair:

- **Public key** (32 bytes): The account address — visible to everyone
- **Secret key** (64 bytes): Used to sign transactions — must be kept secret

### Keypairs in This Project

| Keypair         | File                           | Purpose                                                          |
| --------------- | ------------------------------ | ---------------------------------------------------------------- |
| Authority/Payer | `wallets/signer.json`          | Platform authority — signs admin instructions, pays deploy fees  |
| Program         | `wallets/program-keypair.json` | Determines the program ID (`ACAD...`)                            |
| XP Mint         | `wallets/xp-mint-keypair.json` | Determines the XP token mint address (`xpXP...`)                 |
| Backend Signer  | `~/backend-signer.json` (WSL)  | Signs lesson completions and credential issuance from the server |

### Generating the Backend Signer

```bash
solana-keygen new --outfile ~/backend-signer.json --no-bip39-passphrase
```

**What this does:**

- `solana-keygen new` — generates a new Ed25519 keypair
- `--outfile ~/backend-signer.json` — saves it as a JSON array of bytes
- `--no-bip39-passphrase` — skips the optional encryption passphrase (for automation)

**Output:**

```
pubkey: 3ANb7MLvELoALnezhketfVBcNM48weM9SffmbsBjVQRg
```

This public key is what we store in `BACKEND_SIGNER_PUBKEY`. It must match what's registered in the on-chain Config PDA.

### Funding with Devnet SOL

```bash
solana airdrop 2 3ANb7MLvELoALnezhketfVBcNM48weM9SffmbsBjVQRg --url devnet
```

**What this does:**

- Requests 2 SOL from the devnet faucet
- The backend signer needs SOL to pay transaction fees when signing `complete_lesson`, `finalize_course`, etc.
- Devnet SOL is free and has no real value
- Alternative: use https://faucet.solana.com (web UI) if CLI faucet is rate-limited

### Base64 Encoding for Environment Variable

```bash
cat ~/backend-signer.json | base64 -w 0
```

**What this does:**

- Reads the JSON keypair file (a byte array like `[230,3,199,113,...]`)
- Encodes it as base64 for safe storage in an environment variable
- `-w 0` disables line wrapping (single-line output)
- The server-side code decodes this back to the original byte array at runtime

---

## 9. The IDL (Interface Definition Language)

### What is the IDL?

The IDL is the API specification for the on-chain program. It's a JSON file that describes:

- Every instruction (name, arguments, accounts)
- Every account struct (fields, types, sizes)
- Every custom type (enums, structs)
- Every error code
- Every event

Think of it as an OpenAPI/Swagger spec, but for a Solana program instead of a REST API.

### Where It Comes From

```bash
anchor build
```

This generates two files:

| File                              | Format     | Used For                                       |
| --------------------------------- | ---------- | ---------------------------------------------- |
| `target/idl/onchain_academy.json` | Raw JSON   | Direct program interaction, IDL upload         |
| `target/types/onchain_academy.ts` | TypeScript | Type-safe client code with `@coral-xyz/anchor` |

### How It's Used in the Frontend

The IDL is copied into `app/src/lib/solana/idl.ts`. The Anchor TypeScript client uses it to:

1. **Serialize instruction data**: `program.methods.enroll("intro-to-solana").accounts({...}).rpc()` — Anchor reads the IDL to know how to serialize `"intro-to-solana"` into the correct byte format
2. **Deserialize account data**: `program.account.enrollment.fetch(enrollmentPda)` — Anchor reads the IDL to parse the raw bytes into a typed JavaScript object
3. **Validate at compile time**: TypeScript types generated from the IDL catch mismatched arguments, missing accounts, and wrong types before the code even runs

Without the IDL, you'd need to manually serialize/deserialize every instruction and account — hundreds of lines of error-prone boilerplate.

---

## 10. Frontend Integration Architecture

### The Three Layers

```
┌─────────────────────────┐
│   React Components      │  User-facing UI
│   (client-side)         │
├─────────────────────────┤
│   Next.js API Routes    │  Server-side: backend signer,
│   (server-side)         │  session validation, RPC calls
├─────────────────────────┤
│   Solana Service Layer  │  PDA derivation, Anchor client,
│   (shared utilities)    │  Helius DAS, bitmap helpers
└─────────────────────────┘
```

### What the Learner's Wallet Signs

The learner connects their wallet (Phantom, Solflare, etc.) and signs:

- **`enroll`**: Creating their Enrollment PDA (they pay ~0.002 SOL rent)
- **`close_enrollment`**: Closing their Enrollment PDA (they get the rent back)

These transactions are built client-side and sent directly from the browser.

### What the Backend Server Signs

The backend server holds the `BACKEND_SIGNER_KEYPAIR` and signs:

- **`complete_lesson`**: Marks a lesson as done + mints XP
- **`finalize_course`**: Verifies all lessons done + mints bonus XP
- **`issue_credential`**: Creates the credential NFT
- **`upgrade_credential`**: Updates an existing credential NFT

These go through Next.js API routes (`/api/solana/complete-lesson`, etc.). The flow:

1. User completes a lesson in the UI
2. Frontend calls `POST /api/solana/complete-lesson` with `{ courseId, lessonIndex, learnerWallet }`
3. API route validates the user's auth session
4. API route builds the instruction, signs with backend keypair
5. API route sends the transaction to Solana
6. Returns `{ txSignature }` to the frontend

This pattern prevents cheating — learners can't call `complete_lesson` directly because they don't have the backend signer's private key.

### Read Operations (No Signing Needed)

Reading on-chain data requires no wallet or signing:

- Fetch a Course PDA to show course details
- Fetch an Enrollment PDA to show lesson progress
- Query XP balance via Token-2022 ATA
- Query credentials via Helius DAS

These can run server-side (in Server Components or API routes) or client-side.

---

## 11. Helius DAS API

### What is DAS?

DAS (Digital Asset Standard) is a Solana API for querying tokens and NFTs efficiently. Instead of scanning the entire blockchain, DAS indexes everything and provides optimized endpoints.

### Why Not Just Use Standard RPC?

Standard Solana RPC can fetch individual accounts by address. But:

- "Show me all NFTs owned by wallet X" — standard RPC can't do this
- "Show me the top 100 XP holders" — standard RPC can't do this
- "Find all credentials in a collection" — standard RPC can't do this

DAS provides these query patterns natively.

### How We Use It

| DAS Method         | What We Query                                 | Frontend Feature              |
| ------------------ | --------------------------------------------- | ----------------------------- |
| `getTokenAccounts` | All holders of the XP mint, sorted by balance | Leaderboard page              |
| `getAssetsByOwner` | All Metaplex Core NFTs owned by a wallet      | Credentials/certificates page |
| `getAsset`         | Single NFT details (metadata, attributes)     | Certificate detail page       |

### Helius Endpoint

```
https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

Get an API key at https://dev.helius.xyz. The devnet endpoint is free.

---

## 12. Backend Signer Pattern

### Why a Backend Signer?

The core anti-cheat mechanism. If learners could call `complete_lesson` directly, they could:

- Complete lessons without actually doing them
- Skip prerequisites
- Farm XP with automated scripts

By requiring the backend server to co-sign these transactions, we ensure:

1. The server verified the learner actually completed the lesson content
2. The server validated their quiz answers or code challenge results
3. The bitmap update and XP minting are atomic (can't happen without server approval)

### How It Works On-Chain

The Config PDA stores `backend_signer: Pubkey`. Every instruction that requires backend signing has this constraint:

```rust
#[account(constraint = backend_signer.key() == config.backend_signer)]
pub backend_signer: Signer<'info>,
```

If the transaction isn't signed by the exact public key stored in Config, it fails.

### Key Rotation

The backend signer can be rotated without a program upgrade:

```rust
program.methods.updateConfig({ newBackendSigner: newPubkey }).rpc();
```

This updates the Config PDA. Old signer immediately loses access. Recommended for production: store the key in AWS KMS and rotate periodically.

---

## 13. Environment Variables Reference

### Client-Side (NEXT*PUBLIC* prefix — visible in browser)

| Variable                     | Value                                          | Purpose                                |
| ---------------------------- | ---------------------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com`                | Solana RPC endpoint for wallet adapter |
| `NEXT_PUBLIC_PROGRAM_ID`     | `ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf` | On-chain program address               |
| `NEXT_PUBLIC_XP_MINT`        | `xpXPUjkfk7t4AJF1tYUoyAYxzuM5DhinZWS1WjfjAu3`  | XP token mint address                  |

### Server-Side Only (never exposed to browser)

| Variable                 | Value                                          | Purpose                                            |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------- |
| `HELIUS_RPC_URL`         | `https://devnet.helius-rpc.com/?api-key=...`   | Helius DAS API endpoint                            |
| `BACKEND_SIGNER_KEYPAIR` | Base64-encoded JSON byte array                 | Backend authority keypair for signing transactions |
| `BACKEND_SIGNER_PUBKEY`  | `3ANb7MLvELoALnezhketfVBcNM48weM9SffmbsBjVQRg` | Public key of the backend signer                   |

### Why Separate?

`NEXT_PUBLIC_` variables are bundled into the client JavaScript — anyone can see them in the browser. The program ID and XP mint are public information (anyone can look them up on Solana Explorer). But the backend signer keypair is a secret — if exposed, anyone could sign lesson completions and mint XP.

---

## 14. Commands Reference

### Solana CLI

```bash
solana --version
```

Print the installed Solana CLI version.

```bash
solana-keygen new --outfile <path> --no-bip39-passphrase
```

Generate a new Ed25519 keypair. `--outfile` specifies where to save. `--no-bip39-passphrase` skips the optional encryption.

```bash
solana address -k <keypair-file>
```

Print the public key (address) from a keypair file.

```bash
solana balance <address> --url devnet
```

Check the SOL balance of an address on devnet.

```bash
solana airdrop <amount> <address> --url devnet
```

Request free devnet SOL from the faucet. Rate-limited; use https://faucet.solana.com as fallback.

### Anchor CLI

```bash
anchor build
```

Compile the Solana program. Produces:

- `target/deploy/onchain_academy.so` — deployable program binary
- `target/idl/onchain_academy.json` — IDL (JSON)
- `target/types/onchain_academy.ts` — TypeScript types

```bash
anchor deploy --provider.cluster devnet --program-keypair <path>
```

Deploy the compiled program to devnet. The program keypair determines the program ID.

```bash
anchor test
```

Run the TypeScript integration tests against a local validator.

```bash
anchor idl fetch <program-id> --provider.cluster devnet
```

Download the IDL from an on-chain program (if it was uploaded during deployment).

### Utility

```bash
cat <keypair-file> | base64 -w 0
```

Base64-encode a keypair file for storage in an environment variable. `-w 0` outputs on a single line.

---

## 15. Glossary

| Term              | Definition                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account**       | A data structure on Solana with an address, owner, and data. Everything is an account.                                                                           |
| **ATA**           | Associated Token Account — a deterministic token account address derived from a wallet + mint. Each wallet has exactly one ATA per token.                        |
| **Anchor**        | The standard Rust framework for Solana programs. Handles serialization, account validation, and IDL generation.                                                  |
| **Bitmap**        | A bit array where each bit represents a boolean. We use 256 bits (4 × u64) to track which lessons are completed.                                                 |
| **Bump**          | A single byte appended to PDA seeds to push the derived address off the Ed25519 curve. Stored on-chain to avoid recomputation.                                   |
| **CPI**           | Cross-Program Invocation — when one program calls another. Our program CPIs into Token-2022 (to mint XP) and Metaplex Core (to create/update NFTs).              |
| **CU**            | Compute Units — Solana's measure of instruction complexity. Each transaction has a CU budget.                                                                    |
| **DAS**           | Digital Asset Standard — an indexed API for querying tokens and NFTs efficiently. Provided by Helius.                                                            |
| **Devnet**        | Solana's developer network. Identical to mainnet but with free SOL.                                                                                              |
| **IDL**           | Interface Definition Language — the JSON specification of a program's instructions, accounts, and types. Like OpenAPI for Solana.                                |
| **Instruction**   | A single operation within a transaction. Specifies program, accounts, and data.                                                                                  |
| **Keypair**       | An Ed25519 public/secret key pair. The public key is the address; the secret key signs transactions.                                                             |
| **Lamports**      | The smallest unit of SOL. 1 SOL = 1,000,000,000 lamports.                                                                                                        |
| **Mainnet**       | Solana's production network. Real SOL, real money.                                                                                                               |
| **Metaplex Core** | The modern NFT standard on Solana. Supports plugins for freeze, attributes, and royalties.                                                                       |
| **Mint**          | A token definition — specifies decimals, supply, and authority. Our XP token is a single mint.                                                                   |
| **MinterRole**    | A PDA that grants an address permission to mint XP and award achievements.                                                                                       |
| **PDA**           | Program Derived Address — a deterministic account address derived from seeds + program ID. Cannot have a private key.                                            |
| **Rent**          | SOL deposit required to keep an account alive on Solana. Returned when the account is closed. ~0.002 SOL for our Enrollment PDA.                                 |
| **SBF**           | Solana Bytecode Format — the instruction set executed by Solana validators. Rust compiles to SBF via `cargo-build-sbf`.                                          |
| **Soulbound**     | A token or NFT that cannot be transferred. Permanently tied to the wallet that received it.                                                                      |
| **SPL**           | Solana Program Library — standard programs for tokens, governance, etc.                                                                                          |
| **Token-2022**    | The newer SPL token program supporting extensions (NonTransferable, PermanentDelegate, etc.).                                                                    |
| **Transaction**   | A signed message containing one or more instructions. Confirmed in ~400ms on Solana.                                                                             |
| **WSL**           | Windows Subsystem for Linux — runs a real Linux kernel inside Windows. Required for Solana tooling on Windows.                                                   |
| **XP**            | Experience Points — soulbound Token-2022 tokens earned by completing lessons. Used for leaderboard ranking and level calculation. Level = floor(sqrt(xp / 100)). |
