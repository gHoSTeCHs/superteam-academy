import type { CodeRunner } from '@/types/code-runner';
import { TypeScriptRunner } from './typescript-runner';
import { ServerSideRunner } from './server-side-runner';

export function createCodeRunner(language: string): CodeRunner {
  switch (language) {
    case 'typescript':
    case 'javascript':
      return new TypeScriptRunner();
    case 'rust':
      return new ServerSideRunner();
    default:
      return new TypeScriptRunner();
  }
}

export { TypeScriptRunner } from './typescript-runner';
export { ServerSideRunner } from './server-side-runner';
export { StructuralValidator } from './structural-validator';
