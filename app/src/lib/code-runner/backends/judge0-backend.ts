import type { CodeRunnerBackend } from './types';
import type { RunResult, TestCaseInput, TestResult } from '@/types/code-runner';

const LANGUAGE_IDS: Record<string, number> = {
  rust: 73,
  typescript: 74,
  javascript: 63,
  python: 71,
};

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit: number;
  memory_limit: number;
}

interface Judge0Response {
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  token?: string;
}

interface Judge0BatchResponse {
  submissions: Judge0Response[];
}

const STATUS_ACCEPTED = 3;
const STATUS_WRONG_ANSWER = 4;
const STATUS_TIME_LIMIT = 5;
const STATUS_COMPILATION_ERROR = 6;
const STATUS_RUNTIME_ERROR_START = 11;
const STATUS_RUNTIME_ERROR_END = 12;

function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function fromBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf-8');
}

function getStatusMessage(statusId: number, statusDescription: string): string {
  if (statusId === STATUS_ACCEPTED) return 'Accepted';
  if (statusId === STATUS_WRONG_ANSWER) return 'Wrong Answer';
  if (statusId === STATUS_TIME_LIMIT) return 'Time Limit Exceeded';
  if (statusId === STATUS_COMPILATION_ERROR) return 'Compilation Error';
  if (statusId >= STATUS_RUNTIME_ERROR_START && statusId <= STATUS_RUNTIME_ERROR_END) {
    return 'Runtime Error';
  }
  return statusDescription;
}

function wrapRustCode(studentCode: string, assertionCode: string | undefined): string {
  if (!assertionCode) {
    return `${studentCode}\n\nfn main() {\n    println!("OK");\n}\n`;
  }

  return `${studentCode}\n\nfn main() {\n    ${assertionCode}\n    println!("OK");\n}\n`;
}

function buildSubmission(
  code: string,
  language: string,
  languageId: number,
  testCase: TestCaseInput,
): Judge0Submission {
  let sourceCode = code;

  if (language === 'rust') {
    sourceCode = wrapRustCode(code, testCase.assertionCode);
  } else if (testCase.assertionCode) {
    sourceCode = `${code}\n\n${testCase.assertionCode}\n`;
  }

  const submission: Judge0Submission = {
    source_code: toBase64(sourceCode),
    language_id: languageId,
    cpu_time_limit: 10,
    memory_limit: 128000,
  };

  if (testCase.input !== undefined) {
    submission.stdin = toBase64(testCase.input);
  }

  if (testCase.expectedOutput !== undefined) {
    submission.expected_output = toBase64(testCase.expectedOutput);
  }

  return submission;
}

function mapResponseToTestResult(
  response: Judge0Response,
  testCaseName: string,
): TestResult {
  const statusId = response.status.id;
  const statusMessage = getStatusMessage(statusId, response.status.description);
  const passed = statusId === STATUS_ACCEPTED;

  let message = statusMessage;

  if (response.compile_output) {
    message += `\n${fromBase64(response.compile_output)}`;
  }

  if (!passed && response.stderr) {
    message += `\n${fromBase64(response.stderr)}`;
  }

  if (!passed && response.stdout) {
    message += `\nOutput: ${fromBase64(response.stdout)}`;
  }

  return { name: testCaseName, passed, message };
}

function getJudge0Url(): string {
  const url = process.env.JUDGE0_URL;
  if (!url) {
    throw new Error(
      'Judge0 backend requires JUDGE0_URL environment variable. See docs/setup.md for instructions.',
    );
  }
  return url;
}

async function submitBatch(
  judge0Url: string,
  submissions: Judge0Submission[],
): Promise<Judge0Response[]> {
  const response = await fetch(
    `${judge0Url}/submissions/batch?base64_encoded=true&wait=true`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Judge0 batch submission failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as Judge0BatchResponse;
  return data.submissions;
}

async function submitSingle(
  judge0Url: string,
  submission: Judge0Submission,
): Promise<Judge0Response> {
  const response = await fetch(
    `${judge0Url}/submissions?base64_encoded=true&wait=true`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Judge0 submission failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as Judge0Response;
}

export class Judge0Backend implements CodeRunnerBackend {
  async execute(code: string, language: string, testCases: TestCaseInput[]): Promise<RunResult> {
    const judge0Url = getJudge0Url();
    const languageId = LANGUAGE_IDS[language];

    if (languageId === undefined) {
      return {
        passed: false,
        results: [],
        error: `Unsupported language for Judge0: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}`,
      };
    }

    if (testCases.length === 0) {
      return { passed: true, results: [], executionTimeMs: 0 };
    }

    const submissions = testCases.map((tc) => buildSubmission(code, language, languageId, tc));

    let responses: Judge0Response[];

    if (submissions.length === 1) {
      const singleSubmission = submissions[0];
      if (!singleSubmission) {
        return { passed: false, results: [], error: 'Failed to build submission.' };
      }
      const singleResponse = await submitSingle(judge0Url, singleSubmission);
      responses = [singleResponse];
    } else {
      responses = await submitBatch(judge0Url, submissions);
    }

    const results: TestResult[] = [];
    let totalTimeMs = 0;

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      const testCase = testCases[i];

      if (!response || !testCase) continue;

      results.push(mapResponseToTestResult(response, testCase.name));

      if (response.time) {
        totalTimeMs += Math.round(parseFloat(response.time) * 1000);
      }
    }

    const passed = results.length > 0 && results.every((r) => r.passed);
    return { passed, results, executionTimeMs: totalTimeMs };
  }
}
