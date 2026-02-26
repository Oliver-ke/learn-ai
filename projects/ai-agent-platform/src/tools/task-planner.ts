import { Tool } from '../core/agent';

type StepStatus = 'pending' | 'in_progress' | 'completed';

interface Step {
  description: string;
  status: StepStatus;
}

interface Plan {
  id: string;
  goal: string;
  steps: Step[];
  createdAt: string;
}

// Module-level in-memory store shared across all uses within a session
const plans = new Map<string, Plan>();

export const createPlanTool: Tool = {
  name: 'create_plan',
  description:
    'Create a structured plan with a goal and a list of ordered steps. Returns the plan ID and a formatted checklist.',
  parameters: {
    type: 'object',
    properties: {
      goal: {
        type: 'string',
        description: 'The main objective of the plan',
      },
      steps: {
        type: 'array',
        items: { type: 'string' },
        description: 'Ordered list of steps to achieve the goal',
      },
    },
    required: ['goal', 'steps'],
  },
  execute: async (goal: string, steps: string[]): Promise<string> => {
    const id = `plan_${Date.now()}`;
    const plan: Plan = {
      id,
      goal,
      steps: steps.map(s => ({ description: s, status: 'pending' })),
      createdAt: new Date().toISOString(),
    };
    plans.set(id, plan);

    const lines = [
      `Plan created (ID: ${id})`,
      `Goal: ${goal}`,
      `Steps:`,
      ...plan.steps.map((s, i) => `  ${i + 1}. [ ] ${s.description}`),
    ];
    return lines.join('\n');
  },
};

export const getPlansTool: Tool = {
  name: 'get_plans',
  description: 'Retrieve all existing plans and their step-by-step progress.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (): Promise<string> => {
    if (plans.size === 0) return 'No plans have been created yet.';

    const lines: string[] = [];
    plans.forEach(plan => {
      const done = plan.steps.filter(s => s.status === 'completed').length;
      lines.push(`\nPlan ${plan.id}`);
      lines.push(`Goal: ${plan.goal}`);
      lines.push(`Progress: ${done}/${plan.steps.length} steps completed`);
      plan.steps.forEach((s, i) => {
        const marker =
          s.status === 'completed' ? '[x]' : s.status === 'in_progress' ? '[~]' : '[ ]';
        lines.push(`  ${i + 1}. ${marker} ${s.description}`);
      });
    });
    return lines.join('\n');
  },
};

export const updateStepTool: Tool = {
  name: 'update_step',
  description: 'Update the status of a step in an existing plan.',
  parameters: {
    type: 'object',
    properties: {
      plan_id: {
        type: 'string',
        description: 'The ID of the plan (e.g. "plan_1234567890")',
      },
      step_index: {
        type: 'number',
        description: 'Zero-based index of the step to update',
      },
      status: {
        type: 'string',
        enum: ['pending', 'in_progress', 'completed'],
        description: 'New status for the step',
      },
    },
    required: ['plan_id', 'step_index', 'status'],
  },
  execute: async (
    plan_id: string,
    step_index: number,
    status: StepStatus,
  ): Promise<string> => {
    const plan = plans.get(plan_id);
    if (!plan) return `Plan "${plan_id}" not found.`;

    const step = plan.steps[step_index];
    if (!step) return `Step ${step_index} does not exist in plan "${plan_id}".`;

    step.status = status;
    return `Step ${step_index + 1} of "${plan.goal}" is now "${status}": ${step.description}`;
  },
};
