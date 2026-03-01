import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'ACADBRCB3zGvo1KSCbkztS33ZNzeBv2d7bqGceti3ucf',
);

export function findConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID);
}

export function findCoursePda(courseId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('course'), Buffer.from(courseId)],
    PROGRAM_ID,
  );
}

export function findEnrollmentPda(courseId: string, userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('enrollment'), Buffer.from(courseId), userPubkey.toBytes()],
    PROGRAM_ID,
  );
}

export function findMinterRolePda(minter: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('minter'), minter.toBytes()],
    PROGRAM_ID,
  );
}

export function findAchievementTypePda(achievementId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('achievement'), Buffer.from(achievementId)],
    PROGRAM_ID,
  );
}

export function findAchievementReceiptPda(
  achievementId: string,
  recipient: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('achievement_receipt'), Buffer.from(achievementId), recipient.toBytes()],
    PROGRAM_ID,
  );
}
