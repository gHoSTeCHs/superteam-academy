import type { CodeRunnerBackend } from "./types";
import type { RunResult, TestCaseInput, TestResult } from "@/types/code-runner";

const MOCK_DISCLAIMER =
  "Mock backend: structural validation only. Set CODE_RUNNER_BACKEND=judge0 for real compilation.";

const SOLANA_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /#\[program\]/, label: "#[program] attribute" },
  { pattern: /#\[derive\(Accounts\)\]/, label: "#[derive(Accounts)]" },
  { pattern: /pub\s+fn\s+\w+/, label: "public function declaration" },
  { pattern: /Context</, label: "Context<T> parameter" },
  { pattern: /msg!\s*\(/, label: "msg! macro" },
  { pattern: /#\[account\s*\(/, label: "#[account(...)] attribute" },
];

function simulateDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * 150) + 50;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function checkBraceBalance(code: string): boolean {
  let depth = 0;
  for (const ch of code) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function checkFnSignatures(code: string): boolean {
  const fnPattern = /fn\s+\w+\s*(<[^>]*>)?\s*\(/g;
  return fnPattern.test(code);
}

function checkUseStatements(code: string): boolean {
  const usePattern = /use\s+[\w:]+/;
  return usePattern.test(code);
}

function validateRustStructure(code: string): string[] {
  const issues: string[] = [];

  if (!checkBraceBalance(code)) {
    issues.push("Mismatched braces detected.");
  }

  if (!checkFnSignatures(code)) {
    issues.push("No valid function signatures found.");
  }

  if (!checkUseStatements(code)) {
    issues.push(
      "No use statements found. Anchor programs typically import from anchor_lang.",
    );
  }

  return issues;
}

function detectSolanaPatterns(code: string): string[] {
  const found: string[] = [];
  for (const entry of SOLANA_PATTERNS) {
    if (entry.pattern.test(code)) {
      found.push(entry.label);
    }
  }
  return found;
}

function evaluateRustTestCase(
  code: string,
  testCase: TestCaseInput,
): TestResult {
  if (testCase.assertionCode) {
    try {
      const regex = new RegExp(testCase.assertionCode);
      const matched = regex.test(code);
      return {
        name: testCase.name,
        passed: matched,
        message: matched
          ? `Pattern matched successfully. (${MOCK_DISCLAIMER})`
          : `Code did not match expected pattern: ${testCase.assertionCode}. (${MOCK_DISCLAIMER})`,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        name: testCase.name,
        passed: false,
        message: `Invalid regex pattern: ${errorMessage}`,
      };
    }
  }

  if (testCase.expectedOutput !== undefined) {
    return {
      name: testCase.name,
      passed: false,
      message: `Output matching requires real compilation. (${MOCK_DISCLAIMER})`,
    };
  }

  const structuralIssues = validateRustStructure(code);
  if (structuralIssues.length > 0) {
    return {
      name: testCase.name,
      passed: false,
      message: `Structural issues: ${structuralIssues.join(" ")} (${MOCK_DISCLAIMER})`,
    };
  }

  return {
    name: testCase.name,
    passed: true,
    message: `Code structure looks valid. (${MOCK_DISCLAIMER})`,
  };
}

function evaluateJsTestCase(code: string, testCase: TestCaseInput): TestResult {
  if (testCase.assertionCode) {
    try {
      const regex = new RegExp(testCase.assertionCode);
      const matched = regex.test(code);
      return {
        name: testCase.name,
        passed: matched,
        message: matched
          ? `Pattern matched successfully. (${MOCK_DISCLAIMER})`
          : `Code did not match expected pattern: ${testCase.assertionCode}. (${MOCK_DISCLAIMER})`,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        name: testCase.name,
        passed: false,
        message: `Invalid regex pattern: ${errorMessage}`,
      };
    }
  }

  return {
    name: testCase.name,
    passed: true,
    message: `No server-side assertion defined; structural check passed. (${MOCK_DISCLAIMER})`,
  };
}

export class MockBackend implements CodeRunnerBackend {
  async execute(
    code: string,
    language: string,
    testCases: TestCaseInput[],
  ): Promise<RunResult> {
    await simulateDelay();
    const startTime = Date.now();

    const isRust = language === "rust";
    const results: TestResult[] = [];

    if (isRust) {
      const solanaPatterns = detectSolanaPatterns(code);
      if (solanaPatterns.length > 0 && testCases.length > 0) {
        results.push({
          name: "Solana/Anchor pattern detection",
          passed: true,
          message: `Detected patterns: ${solanaPatterns.join(", ")}. (${MOCK_DISCLAIMER})`,
        });
      }
    }

    for (const testCase of testCases) {
      if (isRust) {
        results.push(evaluateRustTestCase(code, testCase));
      } else {
        results.push(evaluateJsTestCase(code, testCase));
      }
    }

    const executionTimeMs = Date.now() - startTime;
    const passed = results.length > 0 && results.every((r) => r.passed);

    return { passed, results, executionTimeMs };
  }
}
