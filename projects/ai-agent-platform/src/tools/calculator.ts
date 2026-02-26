import { Tool } from '../core/agent';

export const calculatorTool: Tool = {
  name: 'calculate',
  description:
    'Evaluates mathematical expressions. Supports arithmetic (+, -, *, /), percentages, and standard Math functions: sqrt, pow, abs, floor, ceil, round, log, log10, sin, cos, tan, min, max, PI, E.',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description:
          'Math expression to evaluate, e.g. "2 + 3 * 4", "Math.sqrt(16)", "100 * 0.15", "Math.pow(2, 10)"',
      },
    },
    required: ['expression'],
  },
  execute: async (expression: string): Promise<string> => {
    try {
      // Run in isolated Function scope with only Math available
      const fn = new Function('Math', `"use strict"; return (${expression});`);
      const result = fn(Math);
      if (result === undefined || result === null) return 'Result: undefined';
      return `Result: ${result}`;
    } catch (error) {
      return `Error evaluating "${expression}": ${error instanceof Error ? error.message : 'Invalid expression'}`;
    }
  },
};
