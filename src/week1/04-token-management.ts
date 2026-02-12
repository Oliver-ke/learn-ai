import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Pricing per 1K tokens (as of Dec 2024)
const PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

class TokenManager {
  private encoder: any;

  constructor(model: string = 'gpt-3.5-turbo') {
    this.encoder = encoding_for_model(model as any);
  }

  countTokens(text: string): number {
    const tokens = this.encoder.encode(text);
    return tokens.length;
  }

  countMessageTokens(messages: any[]): number {
    let totalTokens = 0;
    
    for (const message of messages) {
      // Every message follows <im_start>{role/name}\n{content}<im_end>\n
      totalTokens += 4; // Message formatting overhead
      totalTokens += this.countTokens(message.content);
      
      if (message.name) {
        totalTokens += this.countTokens(message.name);
        totalTokens -= 1; // Role is omitted if name is present
      }
    }
    
    totalTokens += 2; // Every reply is primed with <im_start>assistant
    return totalTokens;
  }

  calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: keyof typeof PRICING
  ): number {
    const pricing = PRICING[model];
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }

  cleanup() {
    this.encoder.free();
  }
}

async function demonstrateTokenCounting() {
  const tokenManager = new TokenManager('gpt-3.5-turbo');

  console.log('🔢 Token Counting Examples\n');

  const examples = [
    'Hello, world!',
    'The quick brown fox jumps over the lazy dog.',
    'console.log("Hello, world!");',
    `
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    `
  ];

  examples.forEach(text => {
    const tokens = tokenManager.countTokens(text);
    console.log(`Text: "${text.trim()}"`);
    console.log(`Tokens: ${tokens}`);
    console.log(`Chars: ${text.length}`);
    console.log(`Chars/Token: ${(text.length / tokens).toFixed(2)}\n`);
  });

  // Test with actual API call
  console.log('💰 Cost Calculation Example\n');

  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain quantum computing in simple terms.' }
  ];

  const inputTokens = tokenManager.countMessageTokens(messages);
  console.log(`Estimated input tokens: ${inputTokens}`);

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages as any,
  });

  const actualInputTokens = completion.usage?.prompt_tokens || 0;
  const outputTokens = completion.usage?.completion_tokens || 0;
  const totalTokens = completion.usage?.total_tokens || 0;

  console.log(`Actual input tokens: ${actualInputTokens}`);
  console.log(`Output tokens: ${outputTokens}`);
  console.log(`Total tokens: ${totalTokens}`);

  const cost = tokenManager.calculateCost(
    actualInputTokens,
    outputTokens,
    'gpt-3.5-turbo'
  );

  console.log(`\nEstimated cost: $${cost.toFixed(6)}`);
  const choice = completion.choices[0] 
  console.log(`Response: ${choice?.message.content}\n`);

  tokenManager.cleanup();
}

// Token optimization strategies
async function demonstrateOptimization() {
  const tokenManager = new TokenManager('gpt-3.5-turbo');

  console.log('🎯 Token Optimization Strategies\n');

  // Strategy 1: Shorter prompts
  const verbosePrompt = `
    I would like you to please provide me with a comprehensive 
    explanation of what artificial intelligence is, including all 
    the major concepts and ideas that are important to understand.
  `;

  const concisePrompt = `
    Explain artificial intelligence concisely.
  `;

  console.log('Verbose prompt tokens:', tokenManager.countTokens(verbosePrompt));
  console.log('Concise prompt tokens:', tokenManager.countTokens(concisePrompt));
  console.log('Savings:', 
    tokenManager.countTokens(verbosePrompt) - tokenManager.countTokens(concisePrompt),
    'tokens\n'
  );

  // Strategy 2: Use system messages for reused instructions
  const repetitiveMessages = [
    { role: 'user', content: 'Translate to French: Hello' },
    { role: 'user', content: 'Translate to French: Goodbye' },
    { role: 'user', content: 'Translate to French: Thank you' },
  ];

  const optimizedMessages = [
    { role: 'system', content: 'Translate to French.' },
    { role: 'user', content: 'Hello' },
    { role: 'user', content: 'Goodbye' },
    { role: 'user', content: 'Thank you' },
  ];

  console.log('Repetitive approach tokens:', 
    tokenManager.countMessageTokens(repetitiveMessages)
  );
  console.log('Optimized approach tokens:', 
    tokenManager.countMessageTokens(optimizedMessages)
  );

  tokenManager.cleanup();
}

async function main() {
//   await demonstrateTokenCounting();
  await demonstrateOptimization();
}

main().catch(console.error);