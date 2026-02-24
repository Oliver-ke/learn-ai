import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// PLANNING AGENT ARCHITECTURE
// ============================================

interface Plan {
  goal: string;
  steps: PlanStep[];
  currentStep: number;
  status: 'planning' | 'executing' | 'completed' | 'failed';
}

interface PlanStep {
  id: number;
  action: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

class PlanningAgent {
  private plan: Plan | null = null;
  private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(private openai: OpenAI) {}

  async createPlan(goal: string): Promise<Plan> {
    console.log(`\n📋 Creating plan for: "${goal}"\n`);

    const planningPrompt = `You are a planning AI. Break down the following goal into clear, actionable steps.

Goal: ${goal}

Create a detailed plan with 3-7 steps. Each step should be specific and achievable.

Respond in this JSON format:
{
  "steps": [
    {
      "id": 1,
      "action": "action_name",
      "description": "what to do"
    }
  ]
}

Available actions: search, calculate, create_content, review, finalize

JSON:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: planningPrompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const planData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

    const steps: PlanStep[] = planData.steps.map((step: any) => ({
      ...step,
      status: 'pending' as const
    }));

    this.plan = {
      goal,
      steps,
      currentStep: 0,
      status: 'executing'
    };

    console.log('✅ Plan created:\n');
    steps.forEach(step => {
      console.log(`   ${step.id}. ${step.description}`);
    });
    console.log('');

    return this.plan;
  }

  async executeStep(stepIndex: number): Promise<string> {
    if (!this.plan || stepIndex >= this.plan.steps.length) {
      throw new Error('Invalid step index or no plan');
    }

    const step = this.plan.steps[stepIndex];
    step.status = 'in-progress';

    console.log(`\n🔄 Executing Step ${step.id}: ${step.description}`);
    console.log(`   Action: ${step.action}\n`);

    const executionPrompt = `You are executing a step in a larger plan.

Overall Goal: ${this.plan.goal}

Current Step:
- Action: ${step.action}
- Description: ${step.description}

Previous Steps Completed:
${this.plan.steps.slice(0, stepIndex).map(s => 
  `${s.id}. ${s.description}\n   Result: ${s.result || 'N/A'}`
).join('\n')}

Execute this step and provide a detailed result. Be specific about what you accomplished.

Result:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: executionPrompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = response.choices[0].message.content || '';
    
    step.result = result;
    step.status = 'completed';

    console.log(`✅ Step ${step.id} completed`);
    console.log(`   Result: ${result.substring(0, 100)}...`);

    return result;
  }

  async executePlan(): Promise<void> {
    if (!this.plan) {
      throw new Error('No plan to execute');
    }

    console.log('\n🚀 Starting plan execution...\n');
    console.log('='.repeat(80));

    for (let i = 0; i < this.plan.steps.length; i++) {
      try {
        await this.executeStep(i);
        this.plan.currentStep = i + 1;
        
        // Brief pause between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`❌ Step ${i + 1} failed:`, error.message);
        this.plan.steps[i].status = 'failed';
        this.plan.steps[i].error = error.message;
        this.plan.status = 'failed';
        return;
      }
    }

    this.plan.status = 'completed';
    console.log('\n' + '='.repeat(80));
    console.log('✅ All steps completed successfully!\n');
  }

  async summarizeResults(): Promise<string> {
    if (!this.plan) {
      return 'No plan to summarize';
    }

    const summaryPrompt = `Summarize the results of this completed plan:

Goal: ${this.plan.goal}

Steps and Results:
${this.plan.steps.map(step => 
  `${step.id}. ${step.description}\n   Result: ${step.result || 'Not completed'}`
).join('\n\n')}

Provide a concise summary of what was accomplished and the overall outcome.

Summary:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: summaryPrompt }],
      temperature: 0.5,
    });

    const summary = response.choices[0].message.content || '';
    
    console.log('\n📊 PLAN SUMMARY\n');
    console.log(summary);
    console.log('');

    return summary;
  }

  getPlan(): Plan | null {
    return this.plan;
  }
}

// ============================================
// SELF-CORRECTING AGENT
// ============================================

class SelfCorrectingAgent {
  constructor(private openai: OpenAI) {}

  async solve(task: string, maxAttempts: number = 3): Promise<string> {
    console.log(`\n🎯 Task: ${task}\n`);
    console.log('='.repeat(80) + '\n');

    let attempt = 0;
    let solution = '';
    let feedback = '';

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`\n--- Attempt ${attempt} ---\n`);

      // Generate solution
      const solvePrompt = attempt === 1 
        ? `Task: ${task}\n\nProvide a solution:`
        : `Task: ${task}\n\nPrevious attempt:\n${solution}\n\nFeedback:\n${feedback}\n\nProvide an improved solution:`;

      const solveResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: solvePrompt }],
        temperature: 0.7,
      });

      solution = solveResponse.choices[0].message.content || '';
      console.log('💡 Solution:');
      console.log(solution);
      console.log('');

      // Evaluate solution
      const evaluatePrompt = `Evaluate this solution to the task:

Task: ${task}

Solution: ${solution}

Provide:
1. Score (0-10)
2. What's good
3. What needs improvement
4. Whether this is acceptable (yes/no)

Evaluation:`;

      const evalResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: evaluatePrompt }],
        temperature: 0.3,
      });

      const evaluation = evalResponse.choices[0].message.content || '';
      console.log('📝 Evaluation:');
      console.log(evaluation);

      // Check if acceptable
      if (evaluation.toLowerCase().includes('acceptable: yes') || 
          evaluation.includes('Score: 10') ||
          evaluation.includes('Score: 9')) {
        console.log('\n✅ Solution accepted!\n');
        return solution;
      }

      feedback = evaluation;
      console.log('\n🔄 Refining solution...\n');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n⚠️  Max attempts reached. Using best solution.\n');
    return solution;
  }
}

// ============================================
// HIERARCHICAL TASK DECOMPOSITION
// ============================================

interface TaskNode {
  id: string;
  description: string;
  subtasks: TaskNode[];
  status: 'pending' | 'in-progress' | 'completed';
  result?: string;
}

class HierarchicalAgent {
  constructor(private openai: OpenAI) {}

  async decompose(task: string, depth: number = 0, maxDepth: number = 2): Promise<TaskNode> {
    const taskId = `task-${Date.now()}-${Math.random()}`;
    
    if (depth >= maxDepth) {
      return {
        id: taskId,
        description: task,
        subtasks: [],
        status: 'pending'
      };
    }

    console.log(`${'  '.repeat(depth)}📌 Decomposing: ${task}`);

    const decomposePrompt = `Break down this task into 2-4 smaller, concrete subtasks:

Task: ${task}

Respond with a JSON array of subtask descriptions:
["subtask 1", "subtask 2", "subtask 3"]

If the task is already atomic and cannot be broken down further, respond with an empty array: []

JSON:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: decomposePrompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const subtaskDescriptions: string[] = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');

    const subtasks: TaskNode[] = [];

    if (subtaskDescriptions.length > 0) {
      for (const subtask of subtaskDescriptions) {
        const subtaskNode = await this.decompose(subtask, depth + 1, maxDepth);
        subtasks.push(subtaskNode);
      }
    }

    return {
      id: taskId,
      description: task,
      subtasks,
      status: 'pending'
    };
  }

  async executeTaskTree(taskNode: TaskNode): Promise<void> {
    console.log(`\n▶️  ${taskNode.description}`);

    if (taskNode.subtasks.length === 0) {
      // Leaf node - execute
      taskNode.status = 'in-progress';
      
      const executePrompt = `Execute this task and provide the result:\n\n${taskNode.description}\n\nResult:`;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: executePrompt }],
        max_tokens: 300,
      });

      taskNode.result = response.choices[0].message.content || '';
      taskNode.status = 'completed';
      
      console.log(`✅ Completed: ${taskNode.result?.substring(0, 80)}...`);
    } else {
      // Parent node - execute children first
      taskNode.status = 'in-progress';
      
      for (const subtask of taskNode.subtasks) {
        await this.executeTaskTree(subtask);
      }

      // Aggregate results
      const childResults = taskNode.subtasks
        .map(st => `- ${st.description}: ${st.result}`)
        .join('\n');

      taskNode.result = `Completed all subtasks:\n${childResults}`;
      taskNode.status = 'completed';
      
      console.log(`✅ Aggregated: ${taskNode.description}`);
    }
  }
}

// ============================================
// DEMO: Test All Agent Types
// ============================================

async function testPlanningAgent() {
  console.log('\n🧠 PLANNING AGENT TEST\n');
  console.log('='.repeat(80));

  const agent = new PlanningAgent(openai);
  
  await agent.createPlan('Write and publish a blog post about AI orchestration');
  await agent.executePlan();
  await agent.summarizeResults();
}

async function testSelfCorrectingAgent() {
  console.log('\n🔄 SELF-CORRECTING AGENT TEST\n');
  console.log('='.repeat(80));

  const agent = new SelfCorrectingAgent(openai);
  
  await agent.solve('Write a haiku about programming that is both technically accurate and poetic');
}

async function testHierarchicalAgent() {
  console.log('\n🌳 HIERARCHICAL AGENT TEST\n');
  console.log('='.repeat(80) + '\n');

  const agent = new HierarchicalAgent(openai);
  
  const taskTree = await agent.decompose(
    'Plan and execute a successful product launch',
    0,
    2
  );

  console.log('\n📊 Task Decomposition Complete\n');
  console.log('='.repeat(80));

  await agent.executeTaskTree(taskTree);

  console.log('\n='.repeat(80));
  console.log('✅ Hierarchical execution complete\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  // Choose which agent to test
  
  // await testPlanningAgent();
  
  // await testSelfCorrectingAgent();
  
  await testHierarchicalAgent();
  
  console.log('\n✅ Agent workflow demos completed!');
}

main().catch(console.error);