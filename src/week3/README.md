# Week 3: LangChain & RAG Systems

**Target Outcome:** Master LangChain framework and build production-ready RAG (Retrieval Augmented Generation) systems

---

## 📅 Week Overview

```
Day 11 (Mon):  LangChain Fundamentals & Architecture
Day 12 (Tue):  Chains, Prompts & Output Parsers
Day 13 (Wed):  Vector Databases & Embeddings
Day 14 (Thu):  Building RAG Systems
Day 15 (Fri):  Advanced RAG Techniques
Weekend:       Project - Document QA System with RAG
```

**Daily Commitment:** 4-5 hours  
**Weekend Project:** 12-16 hours

---

## Day 11 (Monday): LangChain Fundamentals & Architecture

### 🎯 Day Goal
Understand LangChain architecture and build your first chains

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Official Documentation:**
   - [LangChain.js Introduction](https://js.langchain.com/docs/get_started/introduction)
   - [LangChain Concepts](https://js.langchain.com/docs/concepts)
   - [LangChain Architecture Overview](https://blog.langchain.dev/langchain-architecture/)

2. **Core Concepts to Understand:**
   - **Models:** LLMs, Chat Models, Text Embedding Models
   - **Prompts:** Prompt Templates, Example Selectors
   - **Chains:** Sequential chains, Router chains
   - **Memory:** Conversation buffer, Summary memory
   - **Agents:** Tool-using autonomous agents
   - **Callbacks:** Streaming, logging, monitoring

3. **Video Learning (60 min):**
   - [LangChain Crash Course](https://www.youtube.com/watch?v=LbT1yp6quS8) - Watch first 30min
   - Search YouTube: "LangChain.js tutorial 2024"

**Key Architecture Concepts:**

```
┌─────────────────────────────────────────────┐
│           LangChain Architecture            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐      ┌──────────┐            │
│  │  Models  │─────▶│ Prompts  │            │
│  └──────────┘      └──────────┘            │
│       │                  │                  │
│       ▼                  ▼                  │
│  ┌────────────────────────────┐            │
│  │         Chains             │            │
│  └────────────────────────────┘            │
│       │                  │                  │
│       ▼                  ▼                  │
│  ┌──────────┐      ┌──────────┐            │
│  │  Memory  │      │  Agents  │            │
│  └──────────┘      └──────────┘            │
│                         │                   │
│                         ▼                   │
│                   ┌──────────┐             │
│                   │  Tools   │             │
│                   └──────────┘             │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Evening Session (2 hours)

**Setup & First Examples**

**Install LangChain:**
```bash
cd src/week3
npm install langchain @langchain/openai @langchain/anthropic
npm install @langchain/community
```

**Create `src/week3/11-langchain-basics.ts`:**

```typescript
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
    modelName: 'claude-3-5-sonnet-20241022',
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

  await basicModelUsage();
  await usingMessages();
  await streamingResponses();
  await simpleChain();
  await modelConfiguration();
  await batchProcessing();
  await errorHandling();
  await tokenCounting();

  console.log('✅ All examples completed!');
}

main().catch(console.error);
```

**Run the examples:**
```bash
npx ts-node src/week3/11-langchain-basics.ts
```

---

### **Practical Exercise: Build a Multi-Model Comparison Tool**

Create `src/week3/11-exercise.ts`:

```typescript
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
      modelName: 'claude-3-5-sonnet-20241022',
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
```

**Run the exercise:**
```bash
npx ts-node src/week3/11-exercise.ts
```

---

### **✅ Day 11 Checklist:**
- [ ] Understand LangChain architecture
- [ ] Initialize models (OpenAI, Anthropic)
- [ ] Use messages and conversations
- [ ] Implement streaming responses
- [ ] Create simple chains with LCEL
- [ ] Handle errors and retries
- [ ] Build model comparison tool
- [ ] Document learnings in notes

---

## Day 12 (Tuesday): Chains, Prompts & Output Parsers

### 🎯 Day Goal
Master LangChain's prompt templates, chains, and structured output parsing

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Prompt Templates:**
   - [LangChain Prompt Templates](https://js.langchain.com/docs/modules/model_io/prompts/)
   - [Few-shot Prompt Templates](https://js.langchain.com/docs/modules/model_io/prompts/few_shot)
   - [Chat Prompt Templates](https://js.langchain.com/docs/modules/model_io/prompts/chat)

2. **Chains:**
   - [LangChain Chains](https://js.langchain.com/docs/modules/chains/)
   - [LCEL (LangChain Expression Language)](https://js.langchain.com/docs/expression_language/)
   - [Sequential Chains](https://js.langchain.com/docs/modules/chains/sequential_chain)

3. **Output Parsers:**
   - [Output Parsers Overview](https://js.langchain.com/docs/modules/model_io/output_parsers/)
   - [Structured Output Parser](https://js.langchain.com/docs/modules/model_io/output_parsers/structured)

**Video Learning (60 min):**
- Search: "LangChain prompt templates tutorial"
- "LCEL LangChain expression language"

---

### Evening Session (2 hours)

**Build: Advanced Chains & Parsers**

Create `src/week3/12-prompts-chains.ts`:

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { 
  PromptTemplate,
  ChatPromptTemplate,
  MessagesPlaceholder,
  FewShotPromptTemplate,
} from '@langchain/core/prompts';
import {
  StringOutputParser,
  StructuredOutputParser,
  CommaSeparatedListOutputParser,
} from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// EXAMPLE 1: Basic Prompt Templates
// ============================================

async function basicPromptTemplates() {
  console.log('📝 BASIC PROMPT TEMPLATES\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  // Simple string template
  const promptTemplate = PromptTemplate.fromTemplate(
    'Tell me a {adjective} joke about {topic}.'
  );

  const formattedPrompt = await promptTemplate.format({
    adjective: 'funny',
    topic: 'programming'
  });

  console.log('Formatted Prompt:', formattedPrompt);

  const response = await model.invoke(formattedPrompt);
  console.log('\nResponse:', response.content);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 2: Chat Prompt Templates
// ============================================

async function chatPromptTemplates() {
  console.log('💬 CHAT PROMPT TEMPLATES\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  // Chat template with system, human, and AI messages
  const chatPrompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant that translates {input_language} to {output_language}.'],
    ['human', '{text}'],
  ]);

  const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    input_language: 'English',
    output_language: 'French',
    text: 'Hello, how are you?'
  });

  console.log('Translation:', result);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 3: Few-Shot Prompt Templates
// ============================================

async function fewShotPromptTemplates() {
  console.log('🎯 FEW-SHOT PROMPT TEMPLATES\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  // Define examples
  const examples = [
    { input: 'happy', output: 'sad' },
    { input: 'tall', output: 'short' },
    { input: 'hot', output: 'cold' },
  ];

  // Create example template
  const examplePrompt = PromptTemplate.fromTemplate(
    'Input: {input}\nOutput: {output}'
  );

  // Create few-shot template
  const fewShotPrompt = new FewShotPromptTemplate({
    examples,
    examplePrompt,
    prefix: 'Give the antonym of every input\n',
    suffix: 'Input: {adjective}\nOutput:',
    inputVariables: ['adjective'],
  });

  const formattedPrompt = await fewShotPrompt.format({ adjective: 'big' });
  console.log('Formatted Prompt:\n', formattedPrompt);

  const response = await model.invoke(formattedPrompt);
  console.log('\nResponse:', response.content);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 4: Output Parsers
// ============================================

async function outputParsers() {
  console.log('🔍 OUTPUT PARSERS\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  // 1. Comma Separated List Parser
  console.log('1️⃣ Comma Separated List Parser:\n');

  const listParser = new CommaSeparatedListOutputParser();

  const listPrompt = PromptTemplate.fromTemplate(
    'List 5 {subject}.\n{format_instructions}'
  );

  const listChain = listPrompt.pipe(model).pipe(listParser);

  const listResult = await listChain.invoke({
    subject: 'programming languages',
    format_instructions: listParser.getFormatInstructions(),
  });

  console.log('Parsed list:', listResult);
  console.log('Type:', typeof listResult, '\n');

  // 2. Structured Output Parser (using Zod)
  console.log('2️⃣ Structured Output Parser:\n');

  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      name: z.string().describe('Name of the person'),
      age: z.number().describe('Age of the person'),
      occupation: z.string().describe('Occupation'),
      skills: z.array(z.string()).describe('List of skills'),
    })
  );

  const structuredPrompt = PromptTemplate.fromTemplate(
    `Extract information about a person from the following text.

{format_instructions}

Text: {text}

JSON:`
  );

  const structuredChain = structuredPrompt.pipe(model).pipe(parser);

  const structuredResult = await structuredChain.invoke({
    text: 'John is a 30-year-old software engineer. He knows Python, TypeScript, and React.',
    format_instructions: parser.getFormatInstructions(),
  });

  console.log('Parsed object:', structuredResult);
  console.log('Type:', typeof structuredResult);
  console.log('Name:', structuredResult.name);
  console.log('Skills:', structuredResult.skills);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 5: Sequential Chains
// ============================================

async function sequentialChains() {
  console.log('🔗 SEQUENTIAL CHAINS\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  // Chain 1: Generate a topic
  const topicPrompt = PromptTemplate.fromTemplate(
    'Generate a creative {subject} topic for a blog post.'
  );

  const topicChain = topicPrompt.pipe(model).pipe(new StringOutputParser());

  // Chain 2: Write an outline
  const outlinePrompt = PromptTemplate.fromTemplate(
    `Create a blog post outline for this topic:

Topic: {topic}

Outline:`
  );

  const outlineChain = outlinePrompt.pipe(model).pipe(new StringOutputParser());

  // Chain 3: Write introduction
  const introPrompt = PromptTemplate.fromTemplate(
    `Write an engaging introduction paragraph for this blog post:

Topic: {topic}
Outline: {outline}

Introduction:`
  );

  const introChain = introPrompt.pipe(model).pipe(new StringOutputParser());

  // Execute chains sequentially
  console.log('🔄 Step 1: Generating topic...\n');
  const topic = await topicChain.invoke({ subject: 'AI technology' });
  console.log('Topic:', topic);

  console.log('\n🔄 Step 2: Creating outline...\n');
  const outline = await outlineChain.invoke({ topic });
  console.log('Outline:\n', outline);

  console.log('\n🔄 Step 3: Writing introduction...\n');
  const introduction = await introChain.invoke({ topic, outline });
  console.log('Introduction:\n', introduction);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 6: LCEL (LangChain Expression Language)
// ============================================

async function lcelChains() {
  console.log('⚡ LCEL CHAINS\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
  });

  // Complex chain with branching logic
  const translationPrompt = ChatPromptTemplate.fromMessages([
    ['system', 'Translate the following text to {language}:'],
    ['human', '{text}'],
  ]);

  const summaryPrompt = ChatPromptTemplate.fromMessages([
    ['system', 'Summarize the following text in one sentence:'],
    ['human', '{text}'],
  ]);

  // Create parallel chains
  const translationChain = translationPrompt.pipe(model).pipe(new StringOutputParser());
  const summaryChain = summaryPrompt.pipe(model).pipe(new StringOutputParser());

  const text = 'Artificial Intelligence is transforming how we interact with technology. Machine learning algorithms can now understand natural language, recognize images, and even create art. The future of AI looks incredibly promising.';

  console.log('Original text:', text, '\n');

  // Run in parallel
  const [translation, summary] = await Promise.all([
    translationChain.invoke({ text, language: 'Spanish' }),
    summaryChain.invoke({ text }),
  ]);

  console.log('Translation (Spanish):', translation);
  console.log('\nSummary:', summary);

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 7: Custom Chain with Transform
// ============================================

async function customChains() {
  console.log('🛠️  CUSTOM CHAINS WITH TRANSFORM\n');
  console.log('='.repeat(80) + '\n');

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  // Chain that processes data through multiple steps
  const chain = RunnableSequence.from([
    // Step 1: Format prompt
    async (input: { code: string }) => {
      return {
        code: input.code,
        prompt: `Review this code and provide:\n1. Bug analysis\n2. Suggestions\n\nCode:\n${input.code}`
      };
    },
    
    // Step 2: Get LLM response
    async (input: { code: string; prompt: string }) => {
      const response = await model.invoke(input.prompt);
      return {
        code: input.code,
        review: response.content.toString()
      };
    },
    
    // Step 3: Format output
    async (input: { code: string; review: string }) => {
      return {
        original_code: input.code,
        code_review: input.review,
        timestamp: new Date().toISOString(),
        reviewed_by: 'AI Code Reviewer'
      };
    }
  ]);

  const result = await chain.invoke({
    code: `function divide(a, b) {
  return a / b;
}`
  });

  console.log('Review Result:');
  console.log(JSON.stringify(result, null, 2));

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 CHAINS, PROMPTS & OUTPUT PARSERS\n');
  console.log('='.repeat(80) + '\n');

  await basicPromptTemplates();
  await chatPromptTemplates();
  await fewShotPromptTemplates();
  await outputParsers();
  await sequentialChains();
  await lcelChains();
  await customChains();

  console.log('✅ All examples completed!');
}

main().catch(console.error);
```

**Install Zod for schema validation:**
```bash
npm install zod
```

**Run the examples:**
```bash
npx ts-node src/week3/12-prompts-chains.ts
```

---

### **Practical Exercise: Build a Content Pipeline**

Create `src/week3/12-exercise.ts`:

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser, StructuredOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * EXERCISE: Automated Content Creation Pipeline
 * 
 * Build a system that:
 * 1. Generates blog post ideas
 * 2. Creates an outline
 * 3. Writes sections
 * 4. Reviews and edits
 * 5. Formats as Markdown
 * 6. Saves to file
 */

class ContentPipeline {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });
  }

  async generateIdea(topic: string): Promise<{ title: string; description: string }> {
    console.log('💡 Step 1: Generating blog post idea...\n');

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        title: z.string().describe('Catchy blog post title'),
        description: z.string().describe('Brief description of the post'),
      })
    );

    const prompt = PromptTemplate.fromTemplate(
      `Generate a creative blog post idea about {topic}.

{format_instructions}

JSON:`
    );

    const chain = prompt.pipe(this.model).pipe(parser);

    const result = await chain.invoke({
      topic,
      format_instructions: parser.getFormatInstructions(),
    });

    console.log('Title:', result.title);
    console.log('Description:', result.description);
    console.log('');

    return result;
  }

  async createOutline(title: string, description: string): Promise<string[]> {
    console.log('📋 Step 2: Creating outline...\n');

    const prompt = PromptTemplate.fromTemplate(
      `Create a blog post outline for:

Title: {title}
Description: {description}

Provide 4-6 section headings. Return as a comma-separated list.

Sections:`
    );

    const parser = new StringOutputParser();
    const chain = prompt.pipe(this.model).pipe(parser);

    const result = await chain.invoke({ title, description });
    const sections = result.split(',').map(s => s.trim());

    console.log('Sections:');
    sections.forEach((section, index) => {
      console.log(`${index + 1}. ${section}`);
    });
    console.log('');

    return sections;
  }

  async writeSection(title: string, sectionHeading: string, context: string): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(
      `Write a detailed section for a blog post.

Blog Post Title: {title}
Section Heading: {heading}
Context: {context}

Write 2-3 paragraphs for this section. Be informative and engaging.

Content:`
    );

    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const content = await chain.invoke({
      title,
      heading: sectionHeading,
      context,
    });

    return content;
  }

  async writeSections(title: string, description: string, sections: string[]): Promise<Map<string, string>> {
    console.log('✍️  Step 3: Writing sections...\n');

    const sectionContent = new Map<string, string>();

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`Writing: ${section}...`);

      const content = await this.writeSection(
        title,
        section,
        `This is part ${i + 1} of ${sections.length}. ${description}`
      );

      sectionContent.set(section, content);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ All sections written\n');
    return sectionContent;
  }

  async review(content: string): Promise<{ score: number; feedback: string; improved: string }> {
    console.log('🔍 Step 4: Reviewing content...\n');

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        score: z.number().describe('Quality score 1-10'),
        feedback: z.string().describe('Constructive feedback'),
        improved: z.string().describe('Improved version of the content'),
      })
    );

    const prompt = PromptTemplate.fromTemplate(
      `Review and improve this blog post content:

{content}

Provide a quality score, feedback, and an improved version.

{format_instructions}

JSON:`
    );

    const chain = prompt.pipe(this.model).pipe(parser);

    const result = await chain.invoke({
      content: content.substring(0, 2000), // Limit length
      format_instructions: parser.getFormatInstructions(),
    });

    console.log(`Score: ${result.score}/10`);
    console.log(`Feedback: ${result.feedback}\n`);

    return result;
  }

  formatAsMarkdown(
    title: string,
    description: string,
    sections: Map<string, string>
  ): string {
    let markdown = `# ${title}\n\n`;
    markdown += `> ${description}\n\n`;
    markdown += `*Published: ${new Date().toLocaleDateString()}*\n\n`;
    markdown += '---\n\n';

    for (const [heading, content] of sections) {
      markdown += `## ${heading}\n\n`;
      markdown += `${content}\n\n`;
    }

    markdown += '---\n\n';
    markdown += '*Generated by AI Content Pipeline*\n';

    return markdown;
  }

  async createBlogPost(topic: string): Promise<string> {
    console.log('🚀 STARTING CONTENT PIPELINE\n');
    console.log('='.repeat(80) + '\n');

    // Step 1: Generate idea
    const idea = await this.generateIdea(topic);

    // Step 2: Create outline
    const sections = await this.createOutline(idea.title, idea.description);

    // Step 3: Write sections
    const sectionContent = await this.writeSections(idea.title, idea.description, sections);

    // Step 4: Format as markdown
    console.log('📄 Step 5: Formatting as Markdown...\n');
    const markdown = this.formatAsMarkdown(idea.title, idea.description, sectionContent);

    // Step 5: Save to file
    const filename = `blog_${Date.now()}.md`;
    await fs.writeFile(filename, markdown);
    console.log(`✅ Blog post saved to: ${filename}\n`);

    console.log('='.repeat(80));
    console.log('✅ PIPELINE COMPLETE!\n');

    return filename;
  }
}

async function testPipeline() {
  const pipeline = new ContentPipeline();

  const topics = [
    'AI Orchestration in Modern Applications',
    // 'Building Scalable Microservices with Node.js',
  ];

  for (const topic of topics) {
    await pipeline.createBlogPost(topic);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testPipeline().catch(console.error);
```

**Run the exercise:**
```bash
npx ts-node src/week3/12-exercise.ts
```

---

### **✅ Day 12 Checklist:**
- [ ] Master prompt templates (basic, chat, few-shot)
- [ ] Understand output parsers (string, list, structured)
- [ ] Build sequential chains
- [ ] Use LCEL for complex workflows
- [ ] Create content pipeline
- [ ] Save generated content to files

---

# Week 3 Continued: Days 13-15 & Weekend Project

---

## Day 13 (Wednesday): Vector Databases & Embeddings

### 🎯 Day Goal
Master embeddings, vector databases, and semantic search fundamentals

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Embeddings Fundamentals:**
   - [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
   - [Understanding Vector Embeddings](https://www.pinecone.io/learn/vector-embeddings/)
   - [What are Embeddings?](https://vickiboykis.com/what_are_embeddings/)

2. **Vector Databases:**
   - [Pinecone Documentation](https://docs.pinecone.io/docs/overview)
   - [Chroma Documentation](https://docs.trychroma.com/)
   - [Vector Database Comparison](https://github.com/erikbern/ann-benchmarks)

3. **Key Concepts:**
   - **Embeddings:** Dense vector representations of text
   - **Similarity Search:** Finding similar vectors using cosine similarity
   - **Vector Dimensions:** 1536 for OpenAI, 768 for sentence-transformers
   - **Indexing:** HNSW, IVF for fast retrieval
   - **Metadata Filtering:** Combining vector search with filters

**Video Learning (60 min):**
- Search YouTube: "Vector embeddings explained"
- "How vector databases work"
- "Semantic search with embeddings"

**Visual Understanding:**

```
Text → Embedding Model → Vector [0.234, -0.123, ..., 0.567]
                              ↓
                        Vector Database
                              ↓
                     Similarity Search ← Query Vector
                              ↓
                     Ranked Results
```

---

### Evening Session (2 hours)

**Setup Vector Databases:**

```bash
# Install dependencies
npm install @langchain/openai @langchain/pinecone @langchain/community
npm install @pinecone-database/pinecone chromadb
npm install pdf-parse  # For PDF processing
```

**Sign up for services:**
1. **Pinecone:** https://www.pinecone.io/ (Free tier: 1 index, 100K vectors)
2. Add to `.env`:
```bash
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=langchain-demo
```

---

**Build: Embeddings & Vector Search**

Create `src/week3/13-embeddings-vectors.ts`:

```typescript
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// EXAMPLE 1: Understanding Embeddings
// ============================================

async function understandingEmbeddings() {
  console.log('🧮 UNDERSTANDING EMBEDDINGS\n');
  console.log('='.repeat(80) + '\n');

  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small', // 1536 dimensions, cheaper
  });

  // Generate embeddings for different texts
  const texts = [
    'The cat sits on the mat',
    'A feline rests on a rug',
    'Dogs are great pets',
    'Python is a programming language',
  ];

  console.log('Generating embeddings for texts...\n');

  const vectors = await embeddings.embedDocuments(texts);

  console.log(`Generated ${vectors.length} embeddings`);
  console.log(`Dimensions: ${vectors[0].length}`);
  console.log(`Sample vector (first 10 dims):`, vectors[0].slice(0, 10));

  // Calculate cosine similarity
  function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  console.log('\n📊 Similarity Scores:\n');

  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const similarity = cosineSimilarity(vectors[i], vectors[j]);
      console.log(`"${texts[i]}" ↔ "${texts[j]}"`);
      console.log(`Similarity: ${similarity.toFixed(4)}\n`);
    }
  }

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 2: Memory Vector Store (In-Memory)
// ============================================

async function memoryVectorStore() {
  console.log('💾 MEMORY VECTOR STORE\n');
  console.log('='.repeat(80) + '\n');

  const embeddings = new OpenAIEmbeddings();

  // Create documents
  const documents = [
    new Document({
      pageContent: 'LangChain is a framework for developing applications powered by language models.',
      metadata: { source: 'langchain-docs', category: 'overview' }
    }),
    new Document({
      pageContent: 'Vector databases store embeddings and enable semantic search.',
      metadata: { source: 'vector-db-guide', category: 'technology' }
    }),
    new Document({
      pageContent: 'RAG combines retrieval with generation for better AI responses.',
      metadata: { source: 'rag-tutorial', category: 'technique' }
    }),
    new Document({
      pageContent: 'Embeddings are dense vector representations of text.',
      metadata: { source: 'embeddings-101', category: 'fundamentals' }
    }),
    new Document({
      pageContent: 'TypeScript is a typed superset of JavaScript.',
      metadata: { source: 'typescript-docs', category: 'programming' }
    }),
  ];

  console.log('Creating vector store from documents...\n');

  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings
  );

  console.log(`✅ Stored ${documents.length} documents\n`);

  // Perform similarity search
  const query = 'What is LangChain?';
  console.log(`Query: "${query}"\n`);

  const results = await vectorStore.similaritySearch(query, 3);

  console.log('Top 3 Results:\n');
  results.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}`);
    console.log(`   Source: ${doc.metadata.source}`);
    console.log(`   Category: ${doc.metadata.category}\n`);
  });

  // Similarity search with scores
  console.log('With Similarity Scores:\n');
  
  const resultsWithScores = await vectorStore.similaritySearchWithScore(query, 3);
  
  resultsWithScores.forEach(([doc, score], index) => {
    console.log(`${index + 1}. Score: ${score.toFixed(4)}`);
    console.log(`   ${doc.pageContent}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 3: Pinecone Vector Store
// ============================================

async function pineconeVectorStore() {
  console.log('📌 PINECONE VECTOR STORE\n');
  console.log('='.repeat(80) + '\n');

  // Initialize Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const indexName = process.env.PINECONE_INDEX_NAME || 'langchain-demo';

  console.log(`Using Pinecone index: ${indexName}\n`);

  // Check if index exists, create if not
  const existingIndexes = await pinecone.listIndexes();
  const indexExists = existingIndexes.indexes?.some(idx => idx.name === indexName);

  if (!indexExists) {
    console.log('Creating new index...');
    
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI embedding dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log('✅ Index created\n');
    
    // Wait for index to be ready
    console.log('Waiting for index to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  const index = pinecone.Index(indexName);
  const embeddings = new OpenAIEmbeddings();

  // Sample documents
  const documents = [
    new Document({
      pageContent: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine.',
      metadata: { topic: 'backend', difficulty: 'beginner' }
    }),
    new Document({
      pageContent: 'React is a JavaScript library for building user interfaces.',
      metadata: { topic: 'frontend', difficulty: 'intermediate' }
    }),
    new Document({
      pageContent: 'PostgreSQL is a powerful open-source relational database.',
      metadata: { topic: 'database', difficulty: 'intermediate' }
    }),
    new Document({
      pageContent: 'Docker containers package software and dependencies together.',
      metadata: { topic: 'devops', difficulty: 'intermediate' }
    }),
    new Document({
      pageContent: 'AWS Lambda lets you run code without managing servers.',
      metadata: { topic: 'cloud', difficulty: 'beginner' }
    }),
  ];

  console.log('Upserting documents to Pinecone...\n');

  await PineconeStore.fromDocuments(
    documents,
    embeddings,
    {
      pineconeIndex: index,
      namespace: 'tech-docs',
    }
  );

  console.log('✅ Documents upserted\n');

  // Create vector store for querying
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex: index,
      namespace: 'tech-docs',
    }
  );

  // Query
  const query = 'How do I build web applications?';
  console.log(`Query: "${query}"\n`);

  const results = await vectorStore.similaritySearch(query, 3);

  console.log('Results:\n');
  results.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}`);
    console.log(`   Topic: ${doc.metadata.topic}`);
    console.log(`   Difficulty: ${doc.metadata.difficulty}\n`);
  });

  // Filtered search
  console.log('Filtered Search (frontend only):\n');
  
  const filteredResults = await vectorStore.similaritySearch(
    query,
    2,
    { topic: 'frontend' }
  );

  filteredResults.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 4: Chroma Vector Store
// ============================================

async function chromaVectorStore() {
  console.log('🎨 CHROMA VECTOR STORE\n');
  console.log('='.repeat(80) + '\n');

  const embeddings = new OpenAIEmbeddings();

  const documents = [
    new Document({
      pageContent: 'Machine learning models learn patterns from data.',
      metadata: { category: 'ML', year: '2024' }
    }),
    new Document({
      pageContent: 'Deep learning uses neural networks with multiple layers.',
      metadata: { category: 'DL', year: '2024' }
    }),
    new Document({
      pageContent: 'Natural language processing enables computers to understand human language.',
      metadata: { category: 'NLP', year: '2024' }
    }),
  ];

  console.log('Creating Chroma collection...\n');

  const vectorStore = await Chroma.fromDocuments(
    documents,
    embeddings,
    {
      collectionName: 'ai-concepts',
      url: 'http://localhost:8000', // Default Chroma server
    }
  );

  console.log('✅ Collection created\n');

  const query = 'What is deep learning?';
  console.log(`Query: "${query}"\n`);

  const results = await vectorStore.similaritySearch(query, 2);

  console.log('Results:\n');
  results.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}`);
    console.log(`   Category: ${doc.metadata.category}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 5: Metadata Filtering
// ============================================

async function metadataFiltering() {
  console.log('🔍 METADATA FILTERING\n');
  console.log('='.repeat(80) + '\n');

  const embeddings = new OpenAIEmbeddings();

  const documents = [
    new Document({
      pageContent: 'Introduction to Python programming for beginners.',
      metadata: { language: 'python', level: 'beginner', year: 2024 }
    }),
    new Document({
      pageContent: 'Advanced Python: metaclasses and decorators.',
      metadata: { language: 'python', level: 'advanced', year: 2024 }
    }),
    new Document({
      pageContent: 'JavaScript fundamentals: variables and functions.',
      metadata: { language: 'javascript', level: 'beginner', year: 2024 }
    }),
    new Document({
      pageContent: 'TypeScript generics and advanced types.',
      metadata: { language: 'typescript', level: 'advanced', year: 2024 }
    }),
    new Document({
      pageContent: 'React hooks: useState and useEffect explained.',
      metadata: { language: 'javascript', level: 'intermediate', year: 2024 }
    }),
  ];

  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings
  );

  console.log('Scenario 1: Find beginner-level content\n');
  
  const beginnerQuery = 'I want to learn programming';
  const beginnerResults = await vectorStore.similaritySearch(
    beginnerQuery,
    5,
    (doc) => doc.metadata.level === 'beginner'
  );

  beginnerResults.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}`);
    console.log(`   ${doc.metadata.language} - ${doc.metadata.level}\n`);
  });

  console.log('Scenario 2: Find Python advanced content\n');
  
  const pythonQuery = 'advanced Python features';
  const pythonResults = await vectorStore.similaritySearch(
    pythonQuery,
    5,
    (doc) => doc.metadata.language === 'python' && doc.metadata.level === 'advanced'
  );

  pythonResults.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 6: Maximal Marginal Relevance (MMR)
// ============================================

async function maximalMarginalRelevance() {
  console.log('🎯 MAXIMAL MARGINAL RELEVANCE (MMR)\n');
  console.log('='.repeat(80) + '\n');

  const embeddings = new OpenAIEmbeddings();

  const documents = [
    new Document({ pageContent: 'Paris is the capital of France.' }),
    new Document({ pageContent: 'Paris is known for the Eiffel Tower.' }),
    new Document({ pageContent: 'Paris has amazing museums like the Louvre.' }),
    new Document({ pageContent: 'London is the capital of the United Kingdom.' }),
    new Document({ pageContent: 'Tokyo is the capital of Japan.' }),
    new Document({ pageContent: 'Berlin is the capital of Germany.' }),
  ];

  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings
  );

  const query = 'Tell me about Paris';

  console.log(`Query: "${query}"\n`);

  // Regular similarity search (might return redundant results)
  console.log('Regular Similarity Search:\n');
  const similarityResults = await vectorStore.similaritySearch(query, 3);
  similarityResults.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}`);
  });

  console.log('\nMMR Search (diverse results):\n');
  
  // MMR search (returns diverse results)
  const mmrResults = await vectorStore.maxMarginalRelevanceSearch(query, {
    k: 3,
    fetchK: 6, // Fetch more candidates before diversity filtering
  });

  mmrResults.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.pageContent}`);
  });

  console.log('\n='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 EMBEDDINGS & VECTOR DATABASES\n');
  console.log('='.repeat(80) + '\n');

  await understandingEmbeddings();
  await memoryVectorStore();
  
  // Pinecone requires API key
  if (process.env.PINECONE_API_KEY) {
    await pineconeVectorStore();
  } else {
    console.log('⚠️  Skipping Pinecone (no API key)\n');
  }

  // Chroma requires local server
  // await chromaVectorStore(); // Uncomment if Chroma server is running
  
  await metadataFiltering();
  await maximalMarginalRelevance();

  console.log('✅ All examples completed!');
}

main().catch(console.error);
```

**Run the examples:**
```bash
npx ts-node src/week3/13-embeddings-vectors.ts
```

---

### **Practical Exercise: Build a Semantic Search Engine**

Create `src/week3/13-exercise.ts`:

```typescript
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * EXERCISE: Semantic Search Engine for Code Snippets
 * 
 * Build a system that:
 * 1. Stores code snippets with descriptions
 * 2. Performs semantic search to find relevant snippets
 * 3. Filters by programming language and difficulty
 * 4. Returns formatted results with syntax highlighting
 */

interface CodeSnippet {
  title: string;
  description: string;
  code: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

class CodeSearchEngine {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private snippets: Map<string, CodeSnippet> = new Map();

  constructor() {
    this.embeddings = new OpenAIEmbeddings();
  }

  async addSnippet(snippet: CodeSnippet): Promise<void> {
    const id = `snippet-${this.snippets.size + 1}`;
    this.snippets.set(id, snippet);

    // Create searchable text combining title, description, and tags
    const searchableText = `${snippet.title}. ${snippet.description}. Tags: ${snippet.tags.join(', ')}`;

    const document = new Document({
      pageContent: searchableText,
      metadata: {
        id,
        language: snippet.language,
        difficulty: snippet.difficulty,
        tags: snippet.tags.join(','),
      }
    });

    if (!this.vectorStore) {
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        [document],
        this.embeddings
      );
    } else {
      await this.vectorStore.addDocuments([document]);
    }
  }

  async search(
    query: string,
    options: {
      limit?: number;
      language?: string;
      difficulty?: string;
      tag?: string;
    } = {}
  ): Promise<Array<{ snippet: CodeSnippet; score: number }>> {
    if (!this.vectorStore) {
      return [];
    }

    const { limit = 5, language, difficulty, tag } = options;

    // Build filter function
    const filter = (doc: Document) => {
      if (language && doc.metadata.language !== language) return false;
      if (difficulty && doc.metadata.difficulty !== difficulty) return false;
      if (tag && !doc.metadata.tags.includes(tag)) return false;
      return true;
    };

    const results = await this.vectorStore.similaritySearchWithScore(
      query,
      limit,
      filter
    );

    return results.map(([doc, score]) => ({
      snippet: this.snippets.get(doc.metadata.id)!,
      score
    }));
  }

  printResults(results: Array<{ snippet: CodeSnippet; score: number }>): void {
    if (results.length === 0) {
      console.log('No results found.\n');
      return;
    }

    results.forEach((result, index) => {
      const { snippet, score } = result;
      
      console.log(`\n${index + 1}. ${snippet.title}`);
      console.log(`   Score: ${score.toFixed(4)} | Language: ${snippet.language} | Difficulty: ${snippet.difficulty}`);
      console.log(`   ${snippet.description}`);
      console.log(`   Tags: ${snippet.tags.join(', ')}`);
      console.log('\n   Code:');
      console.log('   ' + '-'.repeat(60));
      console.log(snippet.code.split('\n').map(line => '   ' + line).join('\n'));
      console.log('   ' + '-'.repeat(60));
    });
  }

  async saveToFile(filename: string): Promise<void> {
    const data = {
      snippets: Array.from(this.snippets.entries()).map(([id, snippet]) => ({
        id,
        ...snippet
      }))
    };

    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`\n✅ Saved ${this.snippets.size} snippets to ${filename}`);
  }

  async loadFromFile(filename: string): Promise<void> {
    const data = JSON.parse(await fs.readFile(filename, 'utf-8'));
    
    for (const item of data.snippets) {
      const { id, ...snippet } = item;
      await this.addSnippet(snippet);
    }

    console.log(`\n✅ Loaded ${this.snippets.size} snippets from ${filename}`);
  }
}

async function demoSearchEngine() {
  console.log('🔍 CODE SNIPPET SEARCH ENGINE\n');
  console.log('='.repeat(80) + '\n');

  const engine = new CodeSearchEngine();

  // Add sample snippets
  const snippets: CodeSnippet[] = [
    {
      title: 'Quick Sort Implementation',
      description: 'Efficient sorting algorithm using divide and conquer',
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x < pivot);
  const right = arr.slice(1).filter(x => x >= pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
      language: 'javascript',
      difficulty: 'intermediate',
      tags: ['sorting', 'algorithm', 'recursion']
    },
    {
      title: 'Async/Await Example',
      description: 'Fetch data from API using async/await pattern',
      code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}`,
      language: 'javascript',
      difficulty: 'beginner',
      tags: ['async', 'fetch', 'api', 'promises']
    },
    {
      title: 'React Custom Hook',
      description: 'Custom hook for managing local storage state',
      code: `function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`,
      language: 'javascript',
      difficulty: 'intermediate',
      tags: ['react', 'hooks', 'storage', 'custom-hook']
    },
    {
      title: 'Binary Search',
      description: 'Efficient search in sorted array',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
      language: 'python',
      difficulty: 'beginner',
      tags: ['search', 'algorithm', 'binary-search']
    },
    {
      title: 'Promise.all Pattern',
      description: 'Execute multiple async operations in parallel',
      code: `async function fetchMultiple(urls) {
  const promises = urls.map(url => fetch(url).then(r => r.json()));
  
  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('One or more requests failed:', error);
    throw error;
  }
}`,
      language: 'javascript',
      difficulty: 'intermediate',
      tags: ['promises', 'async', 'parallel', 'fetch']
    },
    {
      title: 'Debounce Function',
      description: 'Limit how often a function can be called',
      code: `function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}`,
      language: 'javascript',
      difficulty: 'intermediate',
      tags: ['performance', 'optimization', 'utility']
    },
  ];

  console.log('📝 Adding snippets to search engine...\n');

  for (const snippet of snippets) {
    await engine.addSnippet(snippet);
  }

  console.log(`✅ Added ${snippets.length} snippets\n`);
  console.log('='.repeat(80) + '\n');

  // Test searches
  const searches = [
    {
      description: 'Finding sorting algorithms',
      query: 'How do I sort an array efficiently?',
      options: {}
    },
    {
      description: 'Finding async patterns',
      query: 'How to handle multiple API calls?',
      options: { language: 'javascript' }
    },
    {
      description: 'Finding beginner content',
      query: 'Simple search algorithm',
      options: { difficulty: 'beginner' }
    },
    {
      description: 'Finding React hooks',
      query: 'state management in React',
      options: { tag: 'react' }
    },
  ];

  for (const search of searches) {
    console.log(`\n🔎 ${search.description}`);
    console.log(`Query: "${search.query}"`);
    if (Object.keys(search.options).length > 0) {
      console.log(`Filters:`, search.options);
    }
    console.log('-'.repeat(80));

    const results = await engine.search(search.query, search.options);
    engine.printResults(results.slice(0, 2)); // Show top 2

    console.log('\n' + '='.repeat(80));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Save to file
  await engine.saveToFile('code-snippets-db.json');
}

demoSearchEngine().catch(console.error);
```

**Run the exercise:**
```bash
npx ts-node src/week3/13-exercise.ts
```

---

### **✅ Day 13 Checklist:**
- [ ] Understand embeddings and vector representations
- [ ] Calculate cosine similarity
- [ ] Use MemoryVectorStore for local storage
- [ ] Integrate Pinecone for persistent storage
- [ ] Implement metadata filtering
- [ ] Use MMR for diverse results
- [ ] Build semantic search engine

---

## Day 14 (Thursday): Building RAG Systems

### 🎯 Day Goal
Build production-ready Retrieval Augmented Generation (RAG) systems

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **RAG Fundamentals:**
   - [What is RAG?](https://www.pinecone.io/learn/retrieval-augmented-generation/)
   - [LangChain RAG Guide](https://js.langchain.com/docs/use_cases/question_answering/)
   - [RAG Best Practices](https://www.rungalileo.io/blog/mastering-rag)

2. **Document Processing:**
   - [Document Loaders](https://js.langchain.com/docs/modules/data_connection/document_loaders/)
   - [Text Splitters](https://js.langchain.com/docs/modules/data_connection/document_transformers/)
   - [Recursive Character Text Splitter](https://js.langchain.com/docs/modules/data_connection/document_transformers/recursive_text_splitter)

3. **Key Concepts:**
   - **Ingestion:** Load → Split → Embed → Store
   - **Retrieval:** Query → Embed → Search → Rank
   - **Generation:** Context + Query → LLM → Answer
   - **Chunk Size:** Balance between context and precision
   - **Chunk Overlap:** Maintain context continuity

**RAG Architecture:**

```
┌─────────────────────────────────────────────┐
│              RAG PIPELINE                    │
├─────────────────────────────────────────────┤
│                                             │
│  INGESTION PHASE:                           │
│  Documents → Loader → Text Splitter         │
│       ↓                                      │
│  Chunks → Embeddings → Vector DB            │
│                                             │
│  QUERY PHASE:                                │
│  User Query → Embedding                     │
│       ↓                                      │
│  Vector Search → Top-K Chunks               │
│       ↓                                      │
│  Chunks + Query → LLM → Answer              │
│                                             │
└─────────────────────────────────────────────┘
```

**Video Learning (60 min):**
- Search: "Building RAG systems with LangChain"
- "Document chunking strategies"

---

### Evening Session (2 hours)

**Install additional dependencies:**
```bash
npm install cheerio  # For HTML parsing
npm install pdf-parse  # For PDF processing
```

**Build: Complete RAG System**

Create `src/week3/14-rag-system.ts`:

```typescript
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// EXAMPLE 1: Basic RAG Pipeline
// ============================================

async function basicRAG() {
  console.log('📚 BASIC RAG PIPELINE\n');
  console.log('='.repeat(80) + '\n');

  // Step 1: Prepare documents
  const documents = [
    new Document({
      pageContent: `LangChain is a framework for developing applications powered by language models. 
      It provides tools for prompt management, chains, data augmented generation, agents, and memory.`,
      metadata: { source: 'langchain-intro' }
    }),
    new Document({
      pageContent: `Vector databases store embeddings and enable semantic search. 
      Popular options include Pinecone, Weaviate, and Chroma. They use similarity metrics 
      like cosine similarity to find relevant documents.`,
      metadata: { source: 'vector-db-guide' }
    }),
    new Document({
      pageContent: `RAG (Retrieval Augmented Generation) combines retrieval with generation. 
      It retrieves relevant documents and uses them as context for the LLM to generate better answers.
      This reduces hallucination and enables LLMs to access external knowledge.`,
      metadata: { source: 'rag-tutorial' }
    }),
    new Document({
      pageContent: `Text splitters break documents into chunks. The RecursiveCharacterTextSplitter 
      splits text recursively using different separators. Chunk size and overlap are important parameters.`,
      metadata: { source: 'text-splitting' }
    }),
  ];

  console.log(`📄 Loaded ${documents.length} documents\n`);

  // Step 2: Create embeddings and vector store
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(
    documents,
    embeddings
  );

  console.log('✅ Vector store created\n');

  // Step 3: Create retriever
  const retriever = vectorStore.asRetriever({
    k: 2, // Return top 2 most relevant documents
  });

  // Step 4: Create prompt template
  const prompt = PromptTemplate.fromTemplate(
    `Answer the question based only on the following context:

Context: {context}

Question: {question}

Answer:`
  );

  // Step 5: Create LLM
  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  // Step 6: Create RAG chain
  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map(doc => doc.pageContent).join('\n\n');
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  // Step 7: Ask questions
  const questions = [
    'What is LangChain?',
    'How do vector databases work?',
    'What is RAG and why is it useful?',
  ];

  for (const question of questions) {
    console.log(`\n❓ Question: ${question}\n`);

    const answer = await chain.invoke({ question });

    console.log(`💡 Answer: ${answer}\n`);
    console.log('-'.repeat(80));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 2: RAG with Text Splitting
// ============================================

async function ragWithTextSplitting() {
  console.log('✂️  RAG WITH TEXT SPLITTING\n');
  console.log('='.repeat(80) + '\n');

  // Long document
  const longDocument = `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Supervised Learning

Supervised learning uses labeled training data to learn a mapping from inputs to outputs. Common algorithms include:
- Linear Regression: Predicts continuous values
- Logistic Regression: Binary classification
- Decision Trees: Tree-based classification and regression
- Random Forests: Ensemble of decision trees
- Support Vector Machines: Find optimal decision boundaries
- Neural Networks: Multi-layer perceptron models

## Unsupervised Learning

Unsupervised learning finds patterns in unlabeled data. Key techniques include:
- K-Means Clustering: Groups similar data points
- Hierarchical Clustering: Creates tree of clusters
- Principal Component Analysis (PCA): Dimensionality reduction
- Autoencoders: Neural network-based feature learning

## Reinforcement Learning

Reinforcement learning trains agents to make decisions by rewarding desired behaviors. Components include:
- Agent: The learner or decision maker
- Environment: What the agent interacts with
- State: Current situation of the agent
- Action: What the agent can do
- Reward: Feedback from the environment
- Policy: Strategy for choosing actions

## Deep Learning

Deep learning uses neural networks with many layers. Key architectures include:
- Convolutional Neural Networks (CNN): For image processing
- Recurrent Neural Networks (RNN): For sequential data
- Long Short-Term Memory (LSTM): Advanced RNN variant
- Transformers: Modern architecture for NLP
- Generative Adversarial Networks (GAN): For generative tasks

## Model Evaluation

Evaluating machine learning models involves various metrics:
- Accuracy: Percentage of correct predictions
- Precision: True positives / (True positives + False positives)
- Recall: True positives / (True positives + False negatives)
- F1 Score: Harmonic mean of precision and recall
- ROC-AUC: Area under the receiver operating characteristic curve
- Cross-Validation: Technique to assess model generalization
`;

  console.log('📄 Document length:', longDocument.length, 'characters\n');

  // Create text splitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const docs = await textSplitter.createDocuments([longDocument]);

  console.log(`✂️  Split into ${docs.length} chunks\n`);

  // Show first few chunks
  console.log('Sample chunks:\n');
  docs.slice(0, 3).forEach((doc, index) => {
    console.log(`Chunk ${index + 1} (${doc.pageContent.length} chars):`);
    console.log(doc.pageContent.substring(0, 100) + '...\n');
  });

  // Create vector store
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

  console.log('✅ Vector store created with chunks\n');
  console.log('='.repeat(80) + '\n');

  // Create RAG chain
  const retriever = vectorStore.asRetriever({ k: 3 });

  const prompt = PromptTemplate.fromTemplate(
    `Use the following pieces of context to answer the question. If you don't know the answer, say so.

Context:
{context}

Question: {question}

Answer:`
  );

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map(doc => doc.pageContent).join('\n\n');
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  // Ask questions
  const questions = [
    'What are the main types of machine learning?',
    'Explain what supervised learning is.',
    'What metrics are used to evaluate models?',
  ];

  for (const question of questions) {
    console.log(`\n❓ ${question}\n`);

    const answer = await chain.invoke({ question });

    console.log(`💡 ${answer}\n`);
    console.log('-'.repeat(80));

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 3: RAG with Source Citations
// ============================================

async function ragWithCitations() {
  console.log('📎 RAG WITH SOURCE CITATIONS\n');
  console.log('='.repeat(80) + '\n');

  const documents = [
    new Document({
      pageContent: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
      metadata: { source: 'TypeScript Handbook', page: 1 }
    }),
    new Document({
      pageContent: 'React is a JavaScript library for building user interfaces, maintained by Facebook.',
      metadata: { source: 'React Documentation', page: 1 }
    }),
    new Document({
      pageContent: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
      metadata: { source: 'Node.js About', page: 1 }
    }),
    new Document({
      pageContent: 'Express is a minimal and flexible Node.js web application framework.',
      metadata: { source: 'Express Guide', page: 1 }
    }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const retriever = vectorStore.asRetriever({ k: 2 });

  // Modified prompt to include sources
  const prompt = PromptTemplate.fromTemplate(
    `Answer the question based on the context below. Include source citations in your answer.

Context:
{context}

Question: {question}

Provide your answer and cite sources like [Source Name].

Answer:`
  );

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  const chain = RunnableSequence.from([
    {
      context: async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return docs.map(doc => 
          `[${doc.metadata.source}]: ${doc.pageContent}`
        ).join('\n\n');
      },
      question: (input: { question: string }) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const question = 'What is TypeScript and how is it different from JavaScript?';
  console.log(`❓ ${question}\n`);

  const answer = await chain.invoke({ question });
  console.log(`💡 ${answer}\n`);

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 4: Multi-Query RAG
// ============================================

async function multiQueryRAG() {
  console.log('🔍 MULTI-QUERY RAG\n');
  console.log('='.repeat(80) + '\n');

  const documents = [
    new Document({
      pageContent: 'AWS Lambda is a serverless compute service that runs code in response to events.'
    }),
    new Document({
      pageContent: 'Amazon S3 is an object storage service offering scalability, data availability, and security.'
    }),
    new Document({
      pageContent: 'Amazon DynamoDB is a fully managed NoSQL database service.'
    }),
    new Document({
      pageContent: 'Amazon RDS provides managed relational databases including MySQL, PostgreSQL, and more.'
    }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const model = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0 });

  // Generate multiple query variations
  const queryGenerationPrompt = PromptTemplate.fromTemplate(
    `Generate 3 different versions of the question to retrieve relevant documents.

Original question: {question}

Provide 3 variations as a comma-separated list:

Variations:`
  );

  const originalQuestion = 'What AWS services can I use for databases?';
  console.log(`❓ Original Question: ${originalQuestion}\n`);

  const variationsResponse = await queryGenerationPrompt
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({ question: originalQuestion });

  const variations = variationsResponse
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0);

  console.log('Generated query variations:');
  variations.forEach((v, i) => console.log(`${i + 1}. ${v}`));
  console.log('');

  // Retrieve documents for each variation
  const allDocs: Document[] = [];
  const retriever = vectorStore.asRetriever({ k: 2 });

  for (const variation of variations) {
    const docs = await retriever.getRelevantDocuments(variation);
    allDocs.push(...docs);
  }

  // Deduplicate documents
  const uniqueDocs = Array.from(
    new Map(allDocs.map(doc => [doc.pageContent, doc])).values()
  );

  console.log(`Retrieved ${uniqueDocs.length} unique documents\n`);

  // Generate answer
  const answerPrompt = PromptTemplate.fromTemplate(
    `Answer the question based on the following context:

Context:
{context}

Question: {question}

Answer:`
  );

  const answer = await answerPrompt
    .pipe(model)
    .pipe(new StringOutputParser())
    .invoke({
      context: uniqueDocs.map(doc => doc.pageContent).join('\n\n'),
      question: originalQuestion,
    });

  console.log(`💡 Answer: ${answer}\n`);

  console.log('='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 RAG SYSTEMS\n');
  console.log('='.repeat(80) + '\n');

  await basicRAG();
  await ragWithTextSplitting();
  await ragWithCitations();
  await multiQueryRAG();

  console.log('✅ All examples completed!');
}

main().catch(console.error);
```

**Run the examples:**
```bash
npx ts-node src/week3/14-rag-system.ts
```

---

### **✅ Day 14 Checklist:**
- [ ] Understand RAG architecture
- [ ] Implement document loading and splitting
- [ ] Build basic RAG pipeline
- [ ] Add source citations
- [ ] Implement multi-query RAG
- [ ] Test with different chunk sizes

---
# Week 3 Continued: Day 15 & Weekend Project

---

## Day 15 (Friday): Advanced RAG Techniques

### 🎯 Day Goal
Master advanced RAG patterns including hybrid search, re-ranking, and contextual compression

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Advanced RAG Patterns:**
   - [Advanced RAG Techniques](https://www.rungalileo.io/blog/mastering-rag)
   - [Contextual Compression](https://js.langchain.com/docs/modules/data_connection/retrievers/contextual_compression)
   - [Multi-Vector Retriever](https://js.langchain.com/docs/modules/data_connection/retrievers/multi-vector-retriever)

2. **Optimization Techniques:**
   - **Hybrid Search:** Combining semantic + keyword search
   - **Re-ranking:** Re-score retrieved documents
   - **Contextual Compression:** Extract only relevant parts
   - **Parent Document Retriever:** Retrieve small chunks, return larger context
   - **Self-Query:** Extract metadata filters from natural language

3. **Video Learning (60 min):**
   - Search: "Advanced RAG techniques"
   - "Improving RAG performance"
   - "RAG evaluation metrics"

**Key Optimization Strategies:**

```
┌─────────────────────────────────────────────┐
│         ADVANCED RAG PIPELINE               │
├─────────────────────────────────────────────┤
│                                             │
│  Query → Query Expansion                    │
│       ↓                                      │
│  Multiple Queries → Hybrid Search           │
│       ↓                                      │
│  Retrieved Docs → Re-ranking                │
│       ↓                                      │
│  Top Docs → Contextual Compression          │
│       ↓                                      │
│  Compressed Context + Query → LLM           │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Evening Session (2 hours)

**Build: Advanced RAG Implementations**

Create `src/week3/15-advanced-rag.ts`:

```typescript
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression';
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// EXAMPLE 1: Contextual Compression
// ============================================

async function contextualCompression() {
  console.log('🗜️  CONTEXTUAL COMPRESSION\n');
  console.log('='.repeat(80) + '\n');

  // Create sample documents with extra context
  const documents = [
    new Document({
      pageContent: `The Amazon rainforest, also known as Amazonia, is a moist broadleaf tropical rainforest in the Amazon biome that covers most of the Amazon basin of South America. This basin encompasses 7,000,000 km2, of which 5,500,000 km2 are covered by the rainforest. The forest contains approximately 390 billion individual trees divided into 16,000 species. It represents over half of the planet's remaining rainforests.`,
    }),
    new Document({
      pageContent: `The Great Barrier Reef is the world's largest coral reef system composed of over 2,900 individual reefs and 900 islands stretching for over 2,300 kilometres. The reef is located in the Coral Sea, off the coast of Queensland, Australia. It supports a wide diversity of life and was selected as a World Heritage Site in 1981. Climate change and coral bleaching are major threats to the reef.`,
    }),
    new Document({
      pageContent: `Mount Everest is Earth's highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas. The China–Nepal border runs across its summit point. Its elevation of 8,848.86 m was most recently established in 2020 by the Chinese and Nepali authorities. The mountain attracts many climbers, including highly experienced mountaineers.`,
    }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  // Standard retriever
  const baseRetriever = vectorStore.asRetriever({ k: 2 });

  // Compression retriever
  const compressorLLM = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  const compressor = LLMChainExtractor.fromLLM(compressorLLM);

  const compressionRetriever = new ContextualCompressionRetriever({
    baseCompressor: compressor,
    baseRetriever: baseRetriever,
  });

  const query = 'What is the size of the Amazon rainforest?';
  console.log(`❓ Query: ${query}\n`);

  // Compare standard vs compressed retrieval
  console.log('📄 STANDARD RETRIEVAL:\n');
  const standardDocs = await baseRetriever.getRelevantDocuments(query);
  standardDocs.forEach((doc, i) => {
    console.log(`Document ${i + 1}:`);
    console.log(doc.pageContent);
    console.log(`Length: ${doc.pageContent.length} characters\n`);
  });

  console.log('🗜️  COMPRESSED RETRIEVAL:\n');
  const compressedDocs = await compressionRetriever.getRelevantDocuments(query);
  compressedDocs.forEach((doc, i) => {
    console.log(`Document ${i + 1}:`);
    console.log(doc.pageContent);
    console.log(`Length: ${doc.pageContent.length} characters\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 2: Query Expansion
// ============================================

async function queryExpansion() {
  console.log('🔎 QUERY EXPANSION\n');
  console.log('='.repeat(80) + '\n');

  const documents = [
    new Document({ pageContent: 'Python is a high-level programming language known for simplicity.' }),
    new Document({ pageContent: 'JavaScript is primarily used for web development and runs in browsers.' }),
    new Document({ pageContent: 'TypeScript adds static typing to JavaScript for better development.' }),
    new Document({ pageContent: 'Java is a class-based, object-oriented programming language.' }),
    new Document({ pageContent: 'Rust is a systems programming language focused on safety and performance.' }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.7 });

  // Generate query variations
  const expansionPrompt = PromptTemplate.fromTemplate(
    `You are an AI assistant helping to improve search queries.
Generate 3 alternative phrasings of this question to help find relevant information.
Keep each variation concise.

Original question: {question}

Alternative phrasings (one per line):`
  );

  const originalQuery = 'What language is good for web development?';
  console.log(`❓ Original Query: ${originalQuery}\n`);

  const expansionChain = expansionPrompt.pipe(llm).pipe(new StringOutputParser());
  const expansions = await expansionChain.invoke({ question: originalQuery });

  const queries = [originalQuery, ...expansions.split('\n').filter(q => q.trim())];

  console.log('🔄 Expanded Queries:\n');
  queries.forEach((q, i) => console.log(`${i + 1}. ${q.trim()}`));
  console.log('');

  // Retrieve documents for all queries
  const allResults: Document[] = [];
  const retriever = vectorStore.asRetriever({ k: 2 });

  for (const query of queries.slice(0, 3)) { // Limit to avoid too many calls
    const results = await retriever.getRelevantDocuments(query.trim());
    allResults.push(...results);
  }

  // Deduplicate and show results
  const uniqueResults = Array.from(
    new Map(allResults.map(doc => [doc.pageContent, doc])).values()
  );

  console.log(`📚 Retrieved ${uniqueResults.length} unique documents:\n`);
  uniqueResults.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.pageContent}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 3: Hypothetical Document Embeddings (HyDE)
// ============================================

async function hypotheticalDocumentEmbeddings() {
  console.log('💭 HYPOTHETICAL DOCUMENT EMBEDDINGS (HyDE)\n');
  console.log('='.repeat(80) + '\n');

  const documents = [
    new Document({
      pageContent: 'React hooks allow you to use state and lifecycle features in functional components. Common hooks include useState, useEffect, and useContext.',
    }),
    new Document({
      pageContent: 'Vue.js uses a template syntax that allows you to declaratively bind data to the DOM. The reactivity system automatically updates the view when data changes.',
    }),
    new Document({
      pageContent: 'Angular uses TypeScript and dependency injection. Components are the basic building blocks, and services provide reusable functionality.',
    }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.7 });

  const query = 'How do I manage state in a component?';
  console.log(`❓ Query: ${query}\n`);

  // Generate hypothetical answer
  const hydePrompt = PromptTemplate.fromTemplate(
    `Write a paragraph that would answer this question:

Question: {question}

Hypothetical answer:`
  );

  console.log('💭 Generating hypothetical answer...\n');

  const hypotheticalAnswer = await hydePrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    .invoke({ question: query });

  console.log('Hypothetical Answer:');
  console.log(hypotheticalAnswer);
  console.log('');

  // Search using hypothetical answer instead of query
  const hydeResults = await vectorStore.similaritySearch(hypotheticalAnswer, 2);

  console.log('📚 Results using HyDE:\n');
  hydeResults.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.pageContent}\n`);
  });

  // Compare with direct query search
  console.log('📚 Results using direct query:\n');
  const directResults = await vectorStore.similaritySearch(query, 2);
  directResults.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.pageContent}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 4: Self-Querying Retriever
// ============================================

async function selfQueryingRetriever() {
  console.log('🤔 SELF-QUERYING RETRIEVER\n');
  console.log('='.repeat(80) + '\n');

  const documents = [
    new Document({
      pageContent: 'Introduction to machine learning algorithms',
      metadata: { category: 'AI', difficulty: 'beginner', year: 2024 }
    }),
    new Document({
      pageContent: 'Advanced deep learning architectures',
      metadata: { category: 'AI', difficulty: 'advanced', year: 2024 }
    }),
    new Document({
      pageContent: 'Web development with React',
      metadata: { category: 'WebDev', difficulty: 'intermediate', year: 2024 }
    }),
    new Document({
      pageContent: 'Cloud computing fundamentals',
      metadata: { category: 'Cloud', difficulty: 'beginner', year: 2024 }
    }),
    new Document({
      pageContent: 'Kubernetes orchestration patterns',
      metadata: { category: 'Cloud', difficulty: 'advanced', year: 2024 }
    }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0 });

  // Extract filters from natural language query
  const filterExtractionPrompt = PromptTemplate.fromTemplate(
    `Extract search filters from this query. Return as JSON.

Query: {query}

Available filters:
- category: AI, WebDev, Cloud
- difficulty: beginner, intermediate, advanced
- year: number

If no specific filter is mentioned, omit it.

JSON:`
  );

  const naturalQuery = 'I want beginner-friendly content about cloud computing';
  console.log(`❓ Natural Language Query: ${naturalQuery}\n`);

  console.log('🔍 Extracting filters...\n');

  const filtersJson = await filterExtractionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    .invoke({ query: naturalQuery });

  console.log('Extracted filters:', filtersJson);

  let filters: any = {};
  try {
    const jsonMatch = filtersJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      filters = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.log('Could not parse filters, using empty filter');
  }

  console.log('');

  // Apply filters to search
  const filterFn = (doc: Document) => {
    let matches = true;
    if (filters.category && doc.metadata.category !== filters.category) {
      matches = false;
    }
    if (filters.difficulty && doc.metadata.difficulty !== filters.difficulty) {
      matches = false;
    }
    return matches;
  };

  const results = await vectorStore.similaritySearch(
    naturalQuery,
    5,
    filterFn
  );

  console.log('📚 Filtered Results:\n');
  results.forEach((doc, i) => {
    console.log(`${i + 1}. ${doc.pageContent}`);
    console.log(`   Metadata:`, doc.metadata);
    console.log('');
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 5: Parent Document Retriever Pattern
// ============================================

async function parentDocumentRetriever() {
  console.log('📑 PARENT DOCUMENT RETRIEVER PATTERN\n');
  console.log('='.repeat(80) + '\n');

  // Simulate parent-child document relationship
  const parentDocs = new Map<string, string>();

  parentDocs.set('doc1', `
Complete Guide to React Hooks

React Hooks are functions that let you use state and other React features in functional components.

useState Hook:
The useState hook allows you to add state to functional components. It returns an array with the current state value and a function to update it.

useEffect Hook:
The useEffect hook lets you perform side effects in functional components. It runs after every render by default, but you can control when it runs.

useContext Hook:
The useContext hook allows you to consume context in functional components without nesting consumers.

Custom Hooks:
You can create your own hooks to reuse stateful logic between components. Custom hooks are JavaScript functions that can call other hooks.
`);

  // Create small chunks for searching
  const childChunks = [
    new Document({
      pageContent: 'useState hook allows you to add state to functional components',
      metadata: { parentId: 'doc1', section: 'useState' }
    }),
    new Document({
      pageContent: 'useEffect hook lets you perform side effects in functional components',
      metadata: { parentId: 'doc1', section: 'useEffect' }
    }),
    new Document({
      pageContent: 'useContext hook allows you to consume context without nesting',
      metadata: { parentId: 'doc1', section: 'useContext' }
    }),
    new Document({
      pageContent: 'Custom hooks let you reuse stateful logic between components',
      metadata: { parentId: 'doc1', section: 'custom' }
    }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(childChunks, embeddings);

  const query = 'How do I manage side effects in React?';
  console.log(`❓ Query: ${query}\n`);

  // Search small chunks
  const relevantChunks = await vectorStore.similaritySearch(query, 1);

  console.log('🔍 Most Relevant Chunk:\n');
  console.log(relevantChunks[0].pageContent);
  console.log('\nMetadata:', relevantChunks[0].metadata);
  console.log('');

  // Retrieve full parent document
  const parentId = relevantChunks[0].metadata.parentId;
  const parentDoc = parentDocs.get(parentId);

  console.log('📄 Full Parent Document:\n');
  console.log(parentDoc);

  console.log('\n💡 Benefit: Search on small chunks for precision, return large context for completeness\n');

  console.log('='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 6: RAG Fusion (Reciprocal Rank Fusion)
// ============================================

async function ragFusion() {
  console.log('🔀 RAG FUSION (Reciprocal Rank Fusion)\n');
  console.log('='.repeat(80) + '\n');

  const documents = [
    new Document({ pageContent: 'Python is widely used for data science and machine learning.' }),
    new Document({ pageContent: 'JavaScript is the primary language for web development.' }),
    new Document({ pageContent: 'Python has excellent libraries like pandas and scikit-learn for ML.' }),
    new Document({ pageContent: 'TypeScript adds type safety to JavaScript projects.' }),
    new Document({ pageContent: 'R is popular among statisticians for data analysis.' }),
  ];

  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  const llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.7 });

  const originalQuery = 'What is the best language for data analysis?';
  console.log(`❓ Original Query: ${originalQuery}\n`);

  // Generate query variations
  const queryGenPrompt = PromptTemplate.fromTemplate(
    `Generate 2 alternative versions of this search query:

Original: {query}

Alternatives (one per line):`
  );

  const variations = await queryGenPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    .invoke({ query: originalQuery });

  const queries = [
    originalQuery,
    ...variations.split('\n').filter(q => q.trim()).slice(0, 2)
  ];

  console.log('🔄 Query Variations:\n');
  queries.forEach((q, i) => console.log(`${i + 1}. ${q.trim()}`));
  console.log('');

  // Retrieve documents for each query and track rankings
  const documentScores = new Map<string, number>();

  for (let queryIndex = 0; queryIndex < queries.length; queryIndex++) {
    const results = await vectorStore.similaritySearchWithScore(
      queries[queryIndex].trim(),
      5
    );

    results.forEach(([doc, score], rank) => {
      const content = doc.pageContent;
      // Reciprocal Rank Fusion: 1 / (rank + k) where k=60 is common
      const rrfScore = 1 / (rank + 60);
      const currentScore = documentScores.get(content) || 0;
      documentScores.set(content, currentScore + rrfScore);
    });
  }

  // Sort by fused scores
  const rankedDocs = Array.from(documentScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  console.log('🏆 Top Results (After Fusion):\n');
  rankedDocs.forEach(([content, score], i) => {
    console.log(`${i + 1}. Score: ${score.toFixed(4)}`);
    console.log(`   ${content}\n`);
  });

  console.log('='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 ADVANCED RAG TECHNIQUES\n');
  console.log('='.repeat(80) + '\n');

  await contextualCompression();
  await queryExpansion();
  await hypotheticalDocumentEmbeddings();
  await selfQueryingRetriever();
  await parentDocumentRetriever();
  await ragFusion();

  console.log('✅ All examples completed!');
}

main().catch(console.error);
```

**Run the examples:**
```bash
npx ts-node src/week3/15-advanced-rag.ts
```

---

### **Practical Exercise: Build an Optimized RAG System**

Create `src/week3/15-exercise.ts`:

```typescript
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * EXERCISE: Production-Ready RAG System
 * 
 * Implement a complete RAG system with:
 * 1. Document ingestion with chunking
 * 2. Query expansion
 * 3. Hybrid retrieval (multiple strategies)
 * 4. Re-ranking
 * 5. Answer generation with citations
 * 6. Evaluation metrics
 */

class ProductionRAG {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;
  private documents: Document[] = [];

  constructor() {
    this.embeddings = new OpenAIEmbeddings();
    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    });
  }

  async ingestDocuments(texts: string[]): Promise<void> {
    console.log('📥 Ingesting documents...\n');

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    for (let i = 0; i < texts.length; i++) {
      const chunks = await textSplitter.createDocuments([texts[i]], [
        { sourceId: `doc-${i}`, chunkIndex: 0 }
      ]);

      chunks.forEach((chunk, idx) => {
        chunk.metadata.chunkIndex = idx;
        chunk.metadata.totalChunks = chunks.length;
      });

      this.documents.push(...chunks);
    }

    console.log(`✅ Created ${this.documents.length} chunks from ${texts.length} documents\n`);

    this.vectorStore = await MemoryVectorStore.fromDocuments(
      this.documents,
      this.embeddings
    );

    console.log('✅ Vector store created\n');
  }

  async expandQuery(query: string): Promise<string[]> {
    const expansionPrompt = PromptTemplate.fromTemplate(
      `Generate 2 alternative phrasings of this question to improve search coverage.

Question: {query}

Alternatives (one per line):`
    );

    const result = await expansionPrompt
      .pipe(this.llm)
      .pipe(new StringOutputParser())
      .invoke({ query });

    const alternatives = result.split('\n').filter(q => q.trim());
    return [query, ...alternatives.slice(0, 2)];
  }

  async retrieve(query: string, k: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('No documents ingested');
    }

    console.log('🔍 Expanding query...\n');
    const queries = await this.expandQuery(query);

    console.log('Query variations:');
    queries.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    console.log('');

    // Retrieve documents for all query variations
    const allDocs: Array<{ doc: Document; score: number }> = [];

    for (const q of queries) {
      const results = await this.vectorStore.similaritySearchWithScore(q, k);
      results.forEach(([doc, score]) => {
        allDocs.push({ doc, score });
      });
    }

    // Deduplicate and re-rank using average score
    const docMap = new Map<string, { doc: Document; scores: number[] }>();

    allDocs.forEach(({ doc, score }) => {
      const key = doc.pageContent;
      if (!docMap.has(key)) {
        docMap.set(key, { doc, scores: [] });
      }
      docMap.get(key)!.scores.push(score);
    });

    // Calculate average score for each document
    const rankedDocs = Array.from(docMap.values())
      .map(({ doc, scores }) => ({
        doc,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        appearances: scores.length,
      }))
      .sort((a, b) => {
        // Sort by appearances first (documents that appear in multiple queries)
        if (b.appearances !== a.appearances) {
          return b.appearances - a.appearances;
        }
        // Then by average score
        return a.avgScore - b.avgScore; // Lower score is better
      })
      .slice(0, k);

    console.log('📊 Retrieved and ranked documents:\n');
    rankedDocs.forEach((item, i) => {
      console.log(`${i + 1}. Score: ${item.avgScore.toFixed(4)} | Appearances: ${item.appearances}`);
      console.log(`   ${item.doc.pageContent.substring(0, 100)}...`);
      console.log('');
    });

    return rankedDocs.map(item => item.doc);
  }

  async generateAnswer(
    query: string,
    context: Document[]
  ): Promise<{ answer: string; sources: string[] }> {
    const answerPrompt = PromptTemplate.fromTemplate(
      `Answer the question based on the following context. Be concise and accurate.
If the context doesn't contain relevant information, say so.

Context:
{context}

Question: {question}

Provide:
1. A clear answer
2. List the source document IDs used

Answer:`
    );

    const contextText = context
      .map((doc, i) => `[Source ${doc.metadata.sourceId}]:\n${doc.pageContent}`)
      .join('\n\n');

    const response = await answerPrompt
      .pipe(this.llm)
      .pipe(new StringOutputParser())
      .invoke({
        context: contextText,
        question: query,
      });

    const sources = Array.from(
      new Set(context.map(doc => doc.metadata.sourceId))
    );

    return {
      answer: response,
      sources,
    };
  }

  async query(question: string): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log(`❓ Question: ${question}`);
    console.log('='.repeat(80) + '\n');

    const startTime = Date.now();

    // Retrieve relevant documents
    const relevantDocs = await this.retrieve(question, 3);

    // Generate answer
    console.log('💡 Generating answer...\n');
    const { answer, sources } = await this.generateAnswer(question, relevantDocs);

    const endTime = Date.now();

    console.log('Answer:');
    console.log(answer);
    console.log('\nSources:', sources.join(', '));
    console.log(`\n⏱️  Time: ${endTime - startTime}ms`);
    console.log('='.repeat(80) + '\n');
  }

  async evaluateRetrieval(
    question: string,
    relevantDocIds: string[]
  ): Promise<{ precision: number; recall: number }> {
    const retrieved = await this.retrieve(question, 5);
    const retrievedIds = new Set(retrieved.map(doc => doc.metadata.sourceId));

    const relevantSet = new Set(relevantDocIds);
    const intersection = new Set(
      [...retrievedIds].filter(id => relevantSet.has(id))
    );

    const precision = intersection.size / retrievedIds.size;
    const recall = intersection.size / relevantSet.size;

    return { precision, recall };
  }
}

async function demo() {
  console.log('🏗️  PRODUCTION RAG SYSTEM DEMO\n');
  console.log('='.repeat(80) + '\n');

  const rag = new ProductionRAG();

  // Sample documents about web development
  const documents = [
    `React is a JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Meta and a community of developers. React uses a component-based architecture where UIs are built from reusable components. The virtual DOM makes React efficient by minimizing direct manipulation of the actual DOM. React hooks like useState and useEffect allow functional components to have state and side effects.`,

    `Vue.js is a progressive JavaScript framework for building user interfaces. Created by Evan You, Vue is designed to be incrementally adoptable. The core library focuses on the view layer only, making it easy to integrate with other libraries. Vue uses a template syntax that feels natural to HTML developers. The reactivity system automatically tracks dependencies and updates the view when data changes. Vue 3 introduced the Composition API for better code organization.`,

    `Angular is a platform and framework for building single-page client applications using HTML and TypeScript. Developed by Google, Angular is a complete rewrite of AngularJS. It uses TypeScript as its primary language and provides a comprehensive solution including routing, forms, HTTP client, and more. Angular uses dependency injection extensively and follows the MVC pattern. Components are the basic building blocks, and services provide reusable business logic.`,

    `Next.js is a React framework that enables server-side rendering and static site generation. Built on top of React, it provides features like automatic code splitting, optimized prefetching, and API routes. Next.js makes it easy to build production-ready applications with excellent performance. The framework supports both static generation and server-side rendering, allowing developers to choose the best approach per page. Version 13 introduced the App Router with React Server Components.`,

    `TypeScript is a strongly typed programming language that builds on JavaScript. Developed by Microsoft, TypeScript adds optional static typing to JavaScript. The type system helps catch errors early and improves code quality. TypeScript compiles to plain JavaScript and can be used anywhere JavaScript runs. It supports modern JavaScript features and adds additional capabilities like interfaces, generics, and enums. The tooling support with IntelliSense makes development more productive.`,
  ];

  await rag.ingestDocuments(documents);

  // Test queries
  const queries = [
    'What is React and how does it work?',
    'How does Vue.js handle reactivity?',
    'What are the benefits of using TypeScript?',
  ];

  for (const query of queries) {
    await rag.query(query);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Evaluate retrieval quality
  console.log('📊 EVALUATION\n');
  console.log('='.repeat(80) + '\n');

  const evalQuery = 'Tell me about React hooks';
  const relevantDocs = ['doc-0']; // React document

  const metrics = await rag.evaluateRetrieval(evalQuery, relevantDocs);

  console.log(`Query: "${evalQuery}"`);
  console.log(`Relevant documents: ${relevantDocs.join(', ')}`);
  console.log(`\nMetrics:`);
  console.log(`Precision: ${(metrics.precision * 100).toFixed(1)}%`);
  console.log(`Recall: ${(metrics.recall * 100).toFixed(1)}%`);
  console.log('');

  console.log('='.repeat(80) + '\n');
  console.log('✅ Demo completed!');
}

demo().catch(console.error);
```

**Run the exercise:**
```bash
npx ts-node src/week3/15-exercise.ts
```

---

### **✅ Day 15 Checklist:**
- [ ] Implement contextual compression
- [ ] Build query expansion
- [ ] Use HyDE (Hypothetical Document Embeddings)
- [ ] Implement self-querying
- [ ] Build parent document retriever pattern
- [ ] Implement RAG Fusion
- [ ] Create production-ready RAG system
- [ ] Add evaluation metrics

---

## Weekend Project: Production Document QA System

### 🎯 Project Goal
Build a comprehensive, production-ready document Q&A system with web interface

**Time Allocation:** 12-16 hours
- Saturday: 6-8 hours (Backend & RAG pipeline)
- Sunday: 6-8 hours (Frontend, optimization, deployment)

---

### **Project Specifications**

```
projects/document-qa-system/
├── backend/
│   ├── src/
│   │   ├── ingestion/
│   │   │   ├── loaders.ts
│   │   │   ├── splitter.ts
│   │   │   └── pipeline.ts
│   │   ├── retrieval/
│   │   │   ├── vectorstore.ts
│   │   │   ├── retriever.ts
│   │   │   └── reranker.ts
│   │   ├── generation/
│   │   │   ├── chains.ts
│   │   │   └── prompts.ts
│   │   ├── api/
│   │   │   ├── server.ts
│   │   │   └── routes.ts
│   │   └── index.ts
│   ├── data/
│   │   └── documents/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── index.html
├── docs/
├── README.md
└── .env
```

---

### **Implementation: Backend**

Create `projects/document-qa-system/backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { DocumentQASystem } from './qa-system';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const qaSystem = new DocumentQASystem();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Upload document
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await qaSystem.ingestDocument(req.file.path, req.file.originalname);

    res.json({
      success: true,
      message: 'Document uploaded and processed',
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Query documents
app.post('/api/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await qaSystem.query(question);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List documents
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await qaSystem.listDocuments();
    res.json({ documents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    await qaSystem.deleteDocument(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

Create `projects/document-qa-system/backend/src/qa-system.ts`:

```typescript
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface QueryResult {
  answer: string;
  sources: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  queryExpansions: string[];
  processingTime: number;
}

export class DocumentQASystem {
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;
  private documents: Map<string, Document[]> = new Map();

  constructor() {
    this.embeddings = new OpenAIEmbeddings();
    this.llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
    });
  }

  async ingestDocument(
    filePath: string,
    fileName: string
  ): Promise<{ docId: string; chunks: number }> {
    // Read file
    const content = await fs.readFile(filePath, 'utf-8');

    // Split into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docId = `doc-${Date.now()}`;
    const chunks = await textSplitter.createDocuments([content], [
      { docId, fileName, uploadedAt: new Date().toISOString() }
    ]);

    // Store chunks
    this.documents.set(docId, chunks);

    // Add to vector store
    if (!this.vectorStore) {
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        chunks,
        this.embeddings
      );
    } else {
      await this.vectorStore.addDocuments(chunks);
    }

    // Clean up uploaded file
    await fs.unlink(filePath);

    return {
      docId,
      chunks: chunks.length,
    };
  }

  async query(question: string): Promise<QueryResult> {
    const startTime = Date.now();

    if (!this.vectorStore) {
      throw new Error('No documents loaded');
    }

    // Expand query
    const queryExpansions = await this.expandQuery(question);

    // Retrieve documents
    const relevantDocs = await this.retrieve(question, queryExpansions);

    // Generate answer
    const answer = await this.generateAnswer(question, relevantDocs);

    const processingTime = Date.now() - startTime;

    return {
      answer,
      sources: relevantDocs.map((doc, score) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score: score || 0,
      })),
      queryExpansions,
      processingTime,
    };
  }

  private async expandQuery(query: string): Promise<string[]> {
    const prompt = PromptTemplate.fromTemplate(
      `Generate 2 alternative phrasings for: {query}\nAlternatives:`
    );

    const result = await prompt
      .pipe(this.llm)
      .pipe(new StringOutputParser())
      .invoke({ query });

    return [query, ...result.split('\n').filter(q => q.trim()).slice(0, 2)];
  }

  private async retrieve(
    query: string,
    expansions: string[]
  ): Promise<Document[]> {
    if (!this.vectorStore) return [];

    const allDocs: Array<[Document, number]> = [];

    for (const q of expansions.slice(0, 3)) {
      const results = await this.vectorStore.similaritySearchWithScore(q, 3);
      allDocs.push(...results);
    }

    // Deduplicate and rank
    const docMap = new Map<string, { doc: Document; scores: number[] }>();

    allDocs.forEach(([doc, score]) => {
      const key = doc.pageContent;
      if (!docMap.has(key)) {
        docMap.set(key, { doc, scores: [] });
      }
      docMap.get(key)!.scores.push(score);
    });

    return Array.from(docMap.values())
      .map(({ doc, scores }) => ({
        doc,
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3)
      .map(item => item.doc);
  }

  private async generateAnswer(
    question: string,
    context: Document[]
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(
      `Answer the question based on this context. Be concise and cite sources.

Context:
{context}

Question: {question}

Answer:`
    );

    const contextText = context
      .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
      .join('\n\n');

    return await prompt
      .pipe(this.llm)
      .pipe(new StringOutputParser())
      .invoke({ context: contextText, question });
  }

  async listDocuments(): Promise<Array<{ docId: string; fileName: string; chunks: number }>> {
    return Array.from(this.documents.entries()).map(([docId, chunks]) => ({
      docId,
      fileName: chunks[0]?.metadata.fileName || 'Unknown',
      chunks: chunks.length,
    }));
  }

  async deleteDocument(docId: string): Promise<void> {
    this.documents.delete(docId);
    // Note: Vector store deletion would require rebuilding
    // In production, use a vector DB that supports deletion
  }
}
```

---

### **Weekend Deliverables**

**✅ Core Features:**
- [ ] Document upload (TXT, PDF, Markdown)
- [ ] Text chunking and embedding
- [ ] Vector storage (Pinecone or local)
- [ ] Query expansion
- [ ] Advanced retrieval (fusion, re-ranking)
- [ ] Answer generation with citations
- [ ] REST API
- [ ] React frontend
- [ ] Streaming responses
- [ ] Document management

**🌟 Bonus Features:**
- [ ] PDF parsing
- [ ] Multiple document sources
- [ ] Chat history
- [ ] Export answers
- [ ] Analytics dashboard
- [ ] Docker deployment

---

## 🎯 Week 3 Summary

**Skills Mastered:**
✅ LangChain fundamentals  
✅ Prompt templates & chains  
✅ Vector databases  
✅ Embeddings  
✅ RAG systems  
✅ Advanced RAG techniques  
✅ Production deployment

**Projects Completed:**
1. Model comparison tool
2. Content pipeline
3. Code search engine
4. Basic RAG system
5. Advanced RAG system
6. Document QA platform