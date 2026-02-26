import * as vm from 'vm';
import { Tool } from '../core/agent';

export const codeRunnerTool: Tool = {
  name: 'run_javascript',
  description:
    'Execute a JavaScript code snippet in a sandboxed Node.js vm. Use console.log to produce output. Useful for testing algorithms, calculations, and data processing.',
  parameters: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'JavaScript code to execute',
      },
    },
    required: ['code'],
  },
  execute: async (code: string): Promise<string> => {
    const output: string[] = [];

    const sandbox: Record<string, unknown> = {
      console: {
        log: (...args: unknown[]) => output.push(args.map(String).join(' ')),
        error: (...args: unknown[]) =>
          output.push('[error] ' + args.map(String).join(' ')),
        warn: (...args: unknown[]) =>
          output.push('[warn] ' + args.map(String).join(' ')),
        info: (...args: unknown[]) => output.push(args.map(String).join(' ')),
      },
      Math,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      undefined,
      NaN,
      Infinity,
      setTimeout: undefined,
      setInterval: undefined,
      require: undefined,
      process: undefined,
    };

    try {
      vm.createContext(sandbox);
      const result = vm.runInContext(code, sandbox, { timeout: 5000 });

      const parts: string[] = [];
      if (output.length > 0) parts.push('Output:\n' + output.join('\n'));
      if (result !== undefined)
        parts.push(`Return value: ${JSON.stringify(result, null, 2)}`);

      return parts.length > 0
        ? parts.join('\n\n')
        : 'Code executed successfully (no output)';
    } catch (error) {
      const partial = output.length > 0 ? '\nOutput so far:\n' + output.join('\n') : '';
      return `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}${partial}`;
    }
  },
};
