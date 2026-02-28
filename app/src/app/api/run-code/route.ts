import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCodeRunnerBackend } from '@/lib/code-runner/backends';
import type { TestCaseInput } from '@/types/code-runner';

interface RunCodeRequestBody {
  code: string;
  language: string;
  testCases: TestCaseInput[];
}

function isValidRequestBody(body: unknown): body is RunCodeRequestBody {
  if (typeof body !== 'object' || body === null) return false;

  const obj = body as Record<string, unknown>;

  if (typeof obj.code !== 'string' || obj.code.length === 0) return false;
  if (typeof obj.language !== 'string' || obj.language.length === 0) return false;
  if (!Array.isArray(obj.testCases)) return false;

  return true;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required fields: code (string), language (string), testCases (array).' },
        { status: 400 },
      );
    }

    const backend = getCodeRunnerBackend();
    const result = await backend.execute(body.code, body.language, body.testCases);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
