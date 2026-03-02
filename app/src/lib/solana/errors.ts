const ANCHOR_ERROR_CODES: Record<number, { message: string; status: number }> =
  {
    6000: { message: "Unauthorized signer", status: 403 },
    6001: { message: "Course not active", status: 400 },
    6002: { message: "Lesson index out of bounds", status: 400 },
    6003: { message: "Lesson already completed", status: 409 },
    6004: { message: "Not all lessons completed", status: 400 },
    6005: { message: "Course already finalized", status: 409 },
    6006: { message: "Course not finalized", status: 400 },
    6007: { message: "Prerequisite not met", status: 403 },
    6008: { message: "Close cooldown not met (24h)", status: 429 },
    6009: { message: "Enrollment/course mismatch", status: 400 },
    6010: { message: "Arithmetic overflow", status: 500 },
    6011: { message: "Course ID is empty", status: 400 },
    6012: { message: "Course ID exceeds max length", status: 400 },
    6013: { message: "Lesson count must be at least 1", status: 400 },
    6014: { message: "Difficulty must be 1, 2, or 3", status: 400 },
    6015: {
      message: "Credential asset does not match enrollment record",
      status: 400,
    },
    6016: {
      message: "Credential already issued for this enrollment",
      status: 409,
    },
    6017: { message: "Minter role is not active", status: 403 },
    6018: { message: "Amount exceeds minter per-call limit", status: 400 },
    6019: { message: "Minter label exceeds max length", status: 400 },
    6020: { message: "Achievement type is not active", status: 400 },
    6021: { message: "Achievement max supply reached", status: 409 },
    6022: { message: "Achievement ID exceeds max length", status: 400 },
    6023: { message: "Achievement name exceeds max length", status: 400 },
    6024: { message: "Achievement URI exceeds max length", status: 400 },
    6025: { message: "Amount must be greater than zero", status: 400 },
    6026: { message: "XP reward must be greater than zero", status: 400 },
  };

export interface ParsedAnchorError {
  code: number;
  message: string;
  status: number;
}

export function parseAnchorError(error: unknown): ParsedAnchorError {
  const err = error as {
    code?: number;
    error?: { errorCode?: { number: number } };
    message?: string;
  };

  const code =
    err?.error?.errorCode?.number ??
    err?.code ??
    extractCodeFromMessage(err?.message);

  if (code !== undefined) {
    const known = ANCHOR_ERROR_CODES[code];
    if (known) return { code, ...known };
  }

  return {
    code: code ?? -1,
    message: err?.message ?? "Unknown program error",
    status: 500,
  };
}

function extractCodeFromMessage(message?: string): number | undefined {
  if (!message) return undefined;
  const match = message.match(/custom program error: 0x([0-9a-fA-F]+)/);
  if (match?.[1]) return parseInt(match[1], 16);
  return undefined;
}
