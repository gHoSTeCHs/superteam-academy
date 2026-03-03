export interface RunResult {
  passed: boolean;
  results: TestResult[];
  error?: string;
  executionTimeMs?: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface CodeRunner {
  run(
    code: string,
    language: string,
    testCases: TestCaseInput[],
  ): Promise<RunResult>;
  dispose?(): void;
}

export interface TestCaseInput {
  name: string;
  input?: string;
  expectedOutput?: string;
  assertionCode?: string;
}
