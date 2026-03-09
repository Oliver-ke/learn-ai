import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage } from '@langchain/core/messages';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * EXERCISE: Model Comparison Tool
 * 
 * Build a tool that:
 * 1. Takes a prompt
 * 2. Sends it to multiple models
 * 3. Compares responses
 * 4. Measures response time
 * 5. Estimates cost
 */

interface ModelResult {
  model: string;
  response: string;
  responseTime: number;
  estimatedCost: number;
}

class ModelComparison {
  private models: Map<string, any> = new Map();
  private pricing: Map<string, { input: number; output: number }> = new Map();

  constructor() {
    // Initialize models
    this.models.set('gpt-3.5-turbo', new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    }));

    this.models.set('gpt-4', new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
    }));

    this.models.set('claude-3-sonnet', new ChatAnthropic({
      modelName: 'claude-sonnet-4-6',
      temperature: 0.7,
    }));

    // Pricing per 1K tokens (approximate)
    this.pricing.set('gpt-3.5-turbo', { input: 0.0005, output: 0.0015 });
    this.pricing.set('gpt-4', { input: 0.03, output: 0.06 });
    this.pricing.set('claude-3-sonnet', { input: 0.003, output: 0.015 });
  }

  async compareModels(prompt: string): Promise<ModelResult[]> {
    const results: ModelResult[] = [];

    for (const [modelName, model] of this.models) {
      console.log(`\n🔄 Testing ${modelName}...`);

      const startTime = Date.now();

      try {
        const response = await model.invoke([new HumanMessage(prompt)]);
        const endTime = Date.now();

        const responseTime = endTime - startTime;
        const responseText = response.content.toString();

        // Rough token estimation (4 chars ≈ 1 token)
        const inputTokens = prompt.length / 4;
        const outputTokens = responseText.length / 4;

        const pricing = this.pricing.get(modelName)!;
        const estimatedCost = 
          (inputTokens / 1000) * pricing.input +
          (outputTokens / 1000) * pricing.output;

        results.push({
          model: modelName,
          response: responseText,
          responseTime,
          estimatedCost,
        });

        console.log(`✅ Completed in ${responseTime}ms`);
      } catch (error: any) {
        console.log(`❌ Error: ${error.message}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  printComparison(results: ModelResult[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MODEL COMPARISON RESULTS');
    console.log('='.repeat(80) + '\n');

    // Summary table
    console.log('Model'.padEnd(20) + 
                'Time (ms)'.padEnd(15) + 
                'Cost ($)'.padEnd(15) + 
                'Response Length');
    console.log('-'.repeat(80));

    results.forEach(result => {
      console.log(
        result.model.padEnd(20) +
        result.responseTime.toString().padEnd(15) +
        result.estimatedCost.toFixed(6).padEnd(15) +
        result.response.length
      );
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // Detailed responses
    results.forEach(result => {
      console.log(`\n🤖 ${result.model.toUpperCase()}`);
      console.log('-'.repeat(80));
      console.log(result.response);
      console.log('-'.repeat(80));
    });

    // Winner analysis
    const fastest = results.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );

    const cheapest = results.reduce((prev, current) =>
      prev.estimatedCost < current.estimatedCost ? prev : current
    );

    console.log('\n🏆 WINNERS:');
    console.log(`Fastest: ${fastest.model} (${fastest.responseTime}ms)`);
    console.log(`Cheapest: ${cheapest.model} ($${cheapest.estimatedCost.toFixed(6)})`);
  }
}

async function testComparison() {
  const comparison = new ModelComparison();

  const testPrompts = [
    'Explain the concept of recursion in programming with a simple example.',
    
    // 'Write a creative product description for an AI-powered plant watering system.',
    
    // 'Debug this code: function sum(arr) { return arr.reduce((a, b) => a + b); }',
  ];

  for (const prompt of testPrompts) {
    console.log('\n' + '='.repeat(80));
    console.log('📝 PROMPT:', prompt);
    console.log('='.repeat(80));

    const results = await comparison.compareModels(prompt);
    comparison.printComparison(results);

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testComparison().catch(console.error);