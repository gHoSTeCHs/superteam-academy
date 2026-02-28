import type { CodeRunner, RunResult, TestCaseInput } from '@/types/code-runner';
import type { ValidationRule } from '@/types/content';

export class StructuralValidator implements CodeRunner {
  private validationRules: ValidationRule[];

  constructor(validationRules: ValidationRule[] = []) {
    this.validationRules = validationRules;
  }

  async run(code: string, _language: string, testCases: TestCaseInput[]): Promise<RunResult> {
    const startTime = performance.now();
    const results: { name: string; passed: boolean; message: string }[] = [];

    for (const testCase of testCases) {
      if (!testCase.assertionCode) {
        results.push({
          name: testCase.name,
          passed: true,
          message: 'No pattern to validate.',
        });
        continue;
      }

      try {
        const regex = new RegExp(testCase.assertionCode);
        const matched = regex.test(code);

        results.push({
          name: testCase.name,
          passed: matched,
          message: matched
            ? 'Pattern matched successfully.'
            : `Code did not match expected pattern: ${testCase.assertionCode}`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({
          name: testCase.name,
          passed: false,
          message: `Invalid regex pattern: ${errorMessage}`,
        });
      }
    }

    for (const rule of this.validationRules) {
      try {
        const regex = new RegExp(rule.pattern);
        const matched = regex.test(code);

        results.push({
          name: rule.message,
          passed: matched,
          message: matched ? 'Validation passed.' : rule.message,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({
          name: rule.message,
          passed: false,
          message: `Invalid validation rule pattern: ${errorMessage}`,
        });
      }
    }

    const executionTimeMs = Math.round(performance.now() - startTime);
    const passed = results.length > 0 && results.every((r) => r.passed);

    return { passed, results, executionTimeMs };
  }

  dispose(): void {
    /* no resources to release */
  }
}
