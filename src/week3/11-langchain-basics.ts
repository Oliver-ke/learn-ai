import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// EXAMPLE 1: Basic Model Usage
// ============================================

async function basicModelUsage() {
  console.log('🤖 BASIC MODEL USAGE\n');
  console.log('='.repeat(80) + '\n');

  // Initialize models
  const openaiModel = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  const anthropicModel = new ChatAnthropic({
    modelName: 'claude-sonnet-4-6',
    temperature: 0.7,
  });

  // Simple invocation
  console.log('📝 OpenAI Response:\n');
  const openaiResponse = await openaiModel.invoke([
    new HumanMessage('Explain LangChain in one sentence.')
  ]);
  console.log(openaiResponse.content);

  console.log('\n📝 Anthropic Response:\n');
  const anthropicResponse = await anthropicModel.invoke([
    new HumanMessage('Explain LangChain in one sentence.')
  ]);
  console.log(anthropicResponse.content);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 2: Using Messages
// ============================================

async function usingMessages() {
  console.log('💬 USING MESSAGES\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  // Build conversation
  const messages = [
    new SystemMessage('You are a helpful AI assistant specializing in TypeScript.'),
    new HumanMessage('What is a Promise in TypeScript?'),
  ];

  console.log('User: What is a Promise in TypeScript?\n');
  
  const response = await model.invoke(messages);
  console.log('Assistant:', response.content);

  // Continue conversation
  messages.push(new AIMessage(response.content.toString()));
  messages.push(new HumanMessage('Can you show me an example?'));

  console.log('\nUser: Can you show me an example?\n');

  const response2 = await model.invoke(messages);
  console.log('Assistant:', response2.content);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 3: Streaming Responses
// ============================================

async function streamingResponses() {
  console.log('⚡ STREAMING RESPONSES\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    streaming: true,
  });

  console.log('User: Write a haiku about coding\n');
  console.log('Assistant: ');

  const stream = await model.stream([
    new HumanMessage('Write a haiku about coding')
  ]);

  for await (const chunk of stream) {
    process.stdout.write(chunk.content.toString());
  }

  console.log('\n\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 4: Simple Chain with Pipe
// ============================================

async function simpleChain() {
  console.log('🔗 SIMPLE CHAIN (LCEL)\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  const parser = new StringOutputParser();

  // Create chain using pipe operator (LCEL - LangChain Expression Language)
  const chain = model.pipe(parser);

  console.log('User: What is 2 + 2?\n');

  const result = await chain.invoke([
    new HumanMessage('What is 2 + 2? Explain briefly.')
  ]);

  console.log('Assistant:', result);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 5: Model Configuration
// ============================================

async function modelConfiguration() {
  console.log('⚙️  MODEL CONFIGURATION\n');
  console.log('='.repeat(80) + '\n');

  const configs = [
    { name: 'Creative (temp=1.0)', temperature: 1.0 },
    { name: 'Balanced (temp=0.7)', temperature: 0.7 },
    { name: 'Deterministic (temp=0)', temperature: 0 },
  ];

  const prompt = 'Write a creative product name for an AI-powered coffee maker.';

  console.log(`Prompt: ${prompt}\n`);

  for (const config of configs) {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: config.temperature,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);
    
    console.log(`${config.name}:`);
    console.log(`  ${response.content}\n`);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 6: Batch Processing
// ============================================

async function batchProcessing() {
  console.log('📦 BATCH PROCESSING\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  const questions = [
    'What is the capital of France?',
    'What is 15 * 24?',
    'What is the largest planet in our solar system?',
  ];

  console.log('Processing multiple questions in batch...\n');

  const results = await model.batch(
    questions.map(q => [new HumanMessage(q)])
  );

  results.forEach((result, index) => {
    console.log(`Q: ${questions[index]}`);
    console.log(`A: ${result.content}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 7: Error Handling
// ============================================

async function errorHandling() {
  console.log('🚨 ERROR HANDLING\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    maxRetries: 3,
    timeout: 10000,
  });

  try {
    const response = await model.invoke([
      new HumanMessage('This is a test message')
    ]);
    console.log('✅ Success:', response.content.toString().substring(0, 50) + '...');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    
    if (error.status === 429) {
      console.log('Rate limit hit. Implement exponential backoff.');
    } else if (error.status === 401) {
      console.log('Authentication failed. Check API key.');
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 8: Token Counting
// ============================================

async function tokenCounting() {
  console.log('🔢 TOKEN COUNTING\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
  });

  const messages = [
    new SystemMessage('You are a helpful assistant.'),
    new HumanMessage('Explain quantum computing in simple terms.')
  ];

  const response = await model.invoke(messages);

  // Note: Token counting requires additional setup
  // For now, we'll estimate based on response metadata
  console.log('Response:', response.content.toString().substring(0, 100) + '...');
  console.log('\nResponse metadata:');
  console.log(response.response_metadata);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 LANGCHAIN FUNDAMENTALS\n');
  console.log('='.repeat(80) + '\n');

//   await basicModelUsage();
//   await usingMessages();
//   await streamingResponses();
//   await simpleChain();
//   await modelConfiguration();
//   await batchProcessing();
//   await errorHandling();
  await tokenCounting();

  console.log('✅ All examples completed!');
}

main().catch(console.error);