import type { CodeRunner, RunResult, TestCaseInput, TestResult } from '@/types/code-runner';

const EXECUTION_TIMEOUT_MS = 5000;

export class TypeScriptRunner implements CodeRunner {
  private iframe: HTMLIFrameElement | null = null;

  async run(code: string, _language: string, testCases: TestCaseInput[]): Promise<RunResult> {
    this.dispose();

    const startTime = performance.now();

    return new Promise<RunResult>((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.sandbox.add('allow-scripts');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      this.iframe = iframe;

      const timeoutId = setTimeout(() => {
        cleanup();
        resolve({
          passed: false,
          results: [],
          error: 'Execution timed out after 5 seconds.',
          executionTimeMs: EXECUTION_TIMEOUT_MS,
        });
      }, EXECUTION_TIMEOUT_MS);

      const onMessage = (event: MessageEvent) => {
        if (event.source !== iframe.contentWindow) return;

        const data = event.data as {
          type: string;
          results?: TestResult[];
          error?: string;
        };

        if (data.type !== 'test-results') return;

        cleanup();

        const executionTimeMs = Math.round(performance.now() - startTime);

        if (data.error) {
          resolve({
            passed: false,
            results: [],
            error: data.error,
            executionTimeMs,
          });
          return;
        }

        const results = data.results ?? [];
        const passed = results.length > 0 && results.every((r) => r.passed);

        resolve({ passed, results, executionTimeMs });
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('message', onMessage);
        this.dispose();
      };

      window.addEventListener('message', onMessage);

      const testCaseJSON = JSON.stringify(testCases);
      const escapedCode = code
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');

      const html = buildSandboxHTML(escapedCode, testCaseJSON);

      iframe.srcdoc = html;
    });
  }

  dispose(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
}

function buildSandboxHTML(escapedCode: string, testCaseJSON: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
(function() {
  var testCases = ${testCaseJSON};
  var results = [];
  var originalLog = console.log;
  var capturedOutput = [];

  console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    capturedOutput.push(args.map(function(a) { return String(a); }).join(' '));
  };

  try {
    eval(\`${escapedCode}\`);

    for (var i = 0; i < testCases.length; i++) {
      var tc = testCases[i];
      var passed = false;
      var message = '';

      try {
        if (tc.assertionCode) {
          eval(tc.assertionCode);
          passed = true;
          message = 'Assertion passed.';
        } else if (tc.expectedOutput !== undefined) {
          var actual = capturedOutput.join('\\n').trim();
          var expected = tc.expectedOutput.trim();
          passed = actual === expected;
          message = passed
            ? 'Output matched expected value.'
            : 'Expected: ' + JSON.stringify(expected) + ', Got: ' + JSON.stringify(actual);
        } else {
          passed = true;
          message = 'No assertion defined; code executed without error.';
        }
      } catch (assertErr) {
        passed = false;
        message = String(assertErr.message || assertErr);
      }

      results.push({ name: tc.name, passed: passed, message: message });
    }

    parent.postMessage({ type: 'test-results', results: results }, '*');
  } catch (err) {
    parent.postMessage({ type: 'test-results', error: String(err.message || err) }, '*');
  }
})();
</script>
</body>
</html>`;
}
