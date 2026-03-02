import BN from "bn.js";

/**
 * Enrollment uses a 4×u64 bitmap (256 bits) to track lesson completion.
 * Anchor deserializes each u64 as a BN. These helpers operate on that array.
 */

export function isLessonComplete(
  lessonFlags: BN[],
  lessonIndex: number,
): boolean {
  const wordIndex = Math.floor(lessonIndex / 64);
  const bitIndex = lessonIndex % 64;
  const word = lessonFlags[wordIndex];
  if (!word) return false;
  return !word.shrn(bitIndex).and(new BN(1)).isZero();
}

export function countCompletedLessons(
  lessonFlags: BN[],
  lessonCount: number,
): number {
  let count = 0;
  for (let i = 0; i < lessonCount; i++) {
    if (isLessonComplete(lessonFlags, i)) count++;
  }
  return count;
}

export function getCompletedLessonIndices(
  lessonFlags: BN[],
  lessonCount: number,
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < lessonCount; i++) {
    if (isLessonComplete(lessonFlags, i)) indices.push(i);
  }
  return indices;
}
