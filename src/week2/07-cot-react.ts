import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// CHAIN-OF-THOUGHT (CoT) EXAMPLES
// ============================================

async function standardPrompting() {
  console.log('📝 STANDARD PROMPTING (No CoT)\n');

  const problem = `A store has 12 apples. They sell 5 apples and then receive a shipment of 3 times the amount they sold. How many apples do they have now?`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: problem + '\n\nAnswer:' }
    ],
    temperature: 0,
  });

  console.log('Problem:', problem);
  console.log('\nResponse:', completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function zeroShotCoT() {
  console.log('🧠 ZERO-SHOT CHAIN-OF-THOUGHT\n');

  const problem = `A store has 12 apples. They sell 5 apples and then receive a shipment of 3 times the amount they sold. How many apples do they have now?`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { 
        role: 'user', 
        content: problem + '\n\nLet\'s think step by step:' 
      }
    ],
    temperature: 0,
  });

  console.log('Problem:', problem);
  console.log('\nResponse:', completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function fewShotCoT() {
  console.log('🎯 FEW-SHOT CHAIN-OF-THOUGHT\n');

  const prompt = `Solve these math word problems by thinking step by step.

Example 1:
Problem: A baker made 24 cookies. He sold 8 and then made 12 more. How many cookies does he have?
Reasoning:
1. Started with: 24 cookies
2. After selling 8: 24 - 8 = 16 cookies
3. After making 12 more: 16 + 12 = 28 cookies
Answer: 28 cookies

Example 2:
Problem: Sarah has $50. She buys 2 books for $12 each. How much money does she have left?
Reasoning:
1. Started with: $50
2. Cost of 2 books: 2 × $12 = $24
3. Money left: $50 - $24 = $26
Answer: $26

Now solve this problem:
Problem: A store has 12 apples. They sell 5 apples and then receive a shipment of 3 times the amount they sold. How many apples do they have now?
Reasoning:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  console.log('Response:', completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// SELF-CONSISTENCY CoT
// ============================================

async function selfConsistencyCoT() {
  console.log('🔄 SELF-CONSISTENCY CoT (Multiple Reasoning Paths)\n');

  const problem = `If there are 3 cars in the parking lot and 2 more cars arrive, how many cars are in the parking lot now? Each car has 4 wheels. How many wheels are there in total?`;

  const prompt = problem + '\n\nLet\'s think step by step:';

  // Generate multiple reasoning paths
  const numPaths = 5;
  const answers: string[] = [];

  console.log(`Generating ${numPaths} reasoning paths...\n`);

  for (let i = 0; i < numPaths; i++) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, // Higher temperature for diversity
    });

    const response = completion.choices[0]?.message.content || '';
    console.log(`Path ${i + 1}:`);
    console.log(response);
    console.log('\n' + '-'.repeat(80) + '\n');

    // Extract final answer
    const answerMatch = response.match(/(\d+)\s*wheels?/i);
    if (answerMatch?.[1]) {
      answers.push(answerMatch[1]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Find most common answer
  const answerCounts = answers.reduce((acc, ans) => {
    acc[ans] = (acc[ans] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommon = Object.entries(answerCounts)
    .sort((a, b) => b[1] - a[1])[0];

  console.log('📊 Answer Distribution:', answerCounts);
  if (mostCommon) {
    console.log(`✅ Most Consistent Answer: ${mostCommon[0]} wheels (${mostCommon[1]}/${numPaths} paths)`);
  }
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// ReAct PROMPTING
// ============================================

async function reactPrompting() {
  console.log('🎬 ReAct PROMPTING (Reasoning + Acting)\n');

  const prompt = `You are an AI assistant that can reason and take actions. Use this format:

Thought: [Your reasoning about what to do next]
Action: [The action to take - one of: Search, Calculate, Finish]
Action Input: [Input for the action]
Observation: [Result of the action]
... (repeat Thought/Action/Observation as needed)
Thought: [Final reasoning]
Action: Finish
Action Input: [Final answer]

Available actions:
- Search: Search for information (simulate with your knowledge)
- Calculate: Perform a calculation
- Finish: Provide the final answer

Question: What is the square root of the sum of 144 and 256?

Let's begin:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 500,
  });

  console.log(completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// ReAct with actual tools (simulated)
// ============================================

interface ReActStep {
  thought: string;
  action: string;
  actionInput: string;
  observation?: string;
}

class ReActAgent {
  private steps: ReActStep[] = [];

  constructor(private openai: OpenAI) {}

  // Simulated tools
  async search(query: string): Promise<string> {
    console.log(`🔍 Searching for: "${query}"`);
    // Simulate search with GPT
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Provide a brief, factual answer to: ${query}`
      }],
      max_tokens: 100,
    });
    return completion.choices[0]?.message.content || 'No results found';
  }

  async calculate(expression: string): Promise<string> {
    console.log(`🧮 Calculating: ${expression}`);
    try {
      // Simple eval for demonstration (use math.js in production!)
      const result = eval(expression);
      return `${result}`;
    } catch (error) {
      return 'Error in calculation';
    }
  }

  async solve(question: string): Promise<string> {
    console.log(`\n❓ Question: ${question}\n`);

    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n--- Iteration ${iteration} ---\n`);

      // Build conversation history
      let history = `Question: ${question}\n\n`;
      
      for (const step of this.steps) {
        history += `Thought: ${step.thought}\n`;
        history += `Action: ${step.action}\n`;
        history += `Action Input: ${step.actionInput}\n`;
        if (step.observation) {
          history += `Observation: ${step.observation}\n\n`;
        }
      }

      // Get next step from model
      const prompt = `${history}What should you do next? Respond in this format:
Thought: [your reasoning]
Action: [Search, Calculate, or Finish]
Action Input: [input for the action]`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that uses tools to answer questions. Think step by step and use the tools when needed.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
      });

      const response = completion.choices[0]?.message.content || '';
      
      // Parse response
      const thoughtMatch = response.match(/Thought: (.+)/);
      const actionMatch = response.match(/Action: (.+)/);
      const inputMatch = response.match(/Action Input: (.+)/);

      if (!thoughtMatch || !actionMatch || !inputMatch) {
        console.log('❌ Failed to parse response');
        break;
      }

      const step: ReActStep = {
        thought: thoughtMatch[1]!.trim(),
        action: actionMatch[1]!.trim(),
        actionInput: inputMatch[1]!.trim(),
      };

      console.log(`💭 Thought: ${step.thought}`);
      console.log(`🎯 Action: ${step.action}`);
      console.log(`📥 Input: ${step.actionInput}`);

      // Execute action
      if (step.action.toLowerCase().includes('finish')) {
        console.log(`\n✅ Final Answer: ${step.actionInput}\n`);
        return step.actionInput;
      } else if (step.action.toLowerCase().includes('search')) {
        step.observation = await this.search(step.actionInput);
        console.log(`👁️  Observation: ${step.observation}`);
      } else if (step.action.toLowerCase().includes('calculate')) {
        step.observation = await this.calculate(step.actionInput);
        console.log(`👁️  Observation: ${step.observation}`);
      }

      this.steps.push(step);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return 'Maximum iterations reached';
  }
}

async function testReActAgent() {
  console.log('🤖 ReAct AGENT WITH TOOLS\n');
  console.log('='.repeat(80));

  const agent = new ReActAgent(openai);

  const questions = [
    'What is the population of Tokyo multiplied by 2?',
    // 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
  ];

  for (const question of questions) {
    await agent.solve(question);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 CHAIN-OF-THOUGHT & ReAct PROMPTING\n');
  console.log('='.repeat(80) + '\n');

  // await standardPrompting();
  // await zeroShotCoT();
  // await fewShotCoT();
  // await selfConsistencyCoT(); // Uses more tokens
  // await reactPrompting();
  await testReActAgent();

  console.log('\n✅ All examples completed!');
}

main().catch(console.error);