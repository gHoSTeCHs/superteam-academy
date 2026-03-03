import type { RunResult, TestCaseInput } from "@/types/code-runner";

export interface CodeRunnerBackend {
  execute(
    code: string,
    language: string,
    testCases: TestCaseInput[],
  ): Promise<RunResult>;
}
