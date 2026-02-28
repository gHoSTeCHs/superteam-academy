import type { CodeRunner, RunResult, TestCaseInput } from '@/types/code-runner';

interface ErrorResponseBody {
  error?: string;
}

export class ServerSideRunner implements CodeRunner {
  async run(code: string, language: string, testCases: TestCaseInput[]): Promise<RunResult> {
    const response = await fetch('/api/run-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, testCases }),
    });

    if (!response.ok) {
      const errorData: ErrorResponseBody = await response
        .json()
        .catch(() => ({ error: 'Server error' })) as ErrorResponseBody;

      return {
        passed: false,
        results: [],
        error: errorData.error ?? `Server returned ${response.status}`,
      };
    }

    return response.json() as Promise<RunResult>;
  }

  dispose(): void {
    /* no client-side resources to clean up */
  }
}
