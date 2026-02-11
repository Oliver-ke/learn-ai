## Week 1: LLM Fundamentals & API Mastery

### 🎯 Week Goal
Understand how LLMs work and build your first AI-powered applications using direct API calls.

---

### **Day 1 (Monday): Environment Setup & LLM Architecture Basics**

#### Morning Session (2.5 hours)

**Theory Study (90 min):**
1. Read: [Attention Is All You Need - Illustrated Guide](https://jalammar.github.io/illustrated-transformer/) (60 min)
2. Watch: [3Blue1Brown - Transformers Visualized](https://www.youtube.com/watch?v=wjZofJX0v4M) (30 min)

**Key Concepts to Understand:**
- What are tokens and why they matter
- Self-attention mechanism (high-level)
- Context windows (2K to 200K tokens)
- Temperature and sampling parameters

**Documentation Reading (30 min):**
- [OpenAI Models Overview](https://platform.openai.com/docs/models)
- [Anthropic Claude Models](https://docs.anthropic.com/claude/docs/models-overview)

#### Evening Session (2 hours)

**Environment Setup (60 min):**

```bash
# Create project directory
mkdir ai-orchestration-bootcamp
cd ai-orchestration-bootcamp

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install openai anthropic dotenv
npm install -D typescript @types/node ts-node nodemon

# Initialize TypeScript
npx tsc --init

# Create folder structure
mkdir -p src/{week1,week2,week3,week4}
mkdir -p projects/{chatbot,rag-system,agent-platform}
touch .env .gitignore README.md
```

**.env file:**
```bash
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

**.gitignore:**
```
node_modules/
.env
dist/
*.log
.DS_Store
```

**Account Setup:**
- [ ] Create OpenAI account → Add $10 credit
- [ ] Create Anthropic account → Get API key
- [ ] Create GitHub repo for bootcamp projects
- [ ] Set up VS Code with Copilot (optional but recommended)

**First Code - Hello LLM (60 min):**

Create `src/week1/01-hello-llm.ts`:

```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Anthropic Setup
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testOpenAI() {
  console.log('🤖 Testing OpenAI...\n');
  
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Explain what a token is in LLMs in one sentence." }
    ],
    temperature: 0.7,
  });
  
  console.log('Response:', completion.choices[0].message.content);
  console.log('Tokens used:', completion.usage);
}

async function testAnthropic() {
  console.log('\n🤖 Testing Anthropic Claude...\n');
  
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      { role: "user", content: "Explain what a token is in LLMs in one sentence." }
    ],
  });
  
  console.log('Response:', message.content[0].text);
  console.log('Tokens used:', message.usage);
}

async function main() {
  await testOpenAI();
  await testAnthropic();
}

main().catch(console.error);
```

**Run it:**
```bash
npx ts-node src/week1/01-hello-llm.ts
```

**✅ Day 1 Checklist:**
- [ ] Understand transformer architecture at high level
- [ ] Set up development environment
- [ ] Successfully call both OpenAI and Anthropic APIs
- [ ] Understand token usage and pricing

**📝 Day 1 Journal Prompt:**
Write 200 words explaining tokens and context windows in your own words.

---

### **Day 2 (Tuesday): Deep Dive into API Parameters**

#### Morning Session (2.5 hours)

**Documentation Study (90 min):**
1. [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat) - Read thoroughly
2. [Anthropic API Reference](https://docs.anthropic.com/claude/reference/messages_post) - Read thoroughly

**Key Parameters to Master:**
- `temperature` (0.0 - 2.0): Creativity vs consistency
- `max_tokens`: Output length control
- `top_p`: Nucleus sampling
- `frequency_penalty` & `presence_penalty`: Repetition control
- `stop` sequences: Control output termination

**Video Learning (60 min):**
- [OpenAI API Complete Guide](https://www.youtube.com/watch?v=c-g6epk3fFE) (or similar)
- [Understanding Temperature and Top_P](https://www.youtube.com/results?search_query=llm+temperature+top_p)

#### Evening Session (2 hours)

**Hands-on: Parameter Playground**

Create `src/week1/02-parameter-playground.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const prompt = "Write a creative story about a robot learning to cook.";

async function testTemperature() {
  console.log('🌡️  Testing Temperature Effects\n');
  
  const temperatures = [0.0, 0.5, 1.0, 1.5, 2.0];
  
  for (const temp of temperatures) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: temp,
      max_tokens: 150,
    });
    
    console.log(`Temperature ${temp}:`);
    console.log(completion.choices[0].message.content);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testTopP() {
  console.log('🎯 Testing Top_P (Nucleus Sampling)\n');
  
  const topPValues = [0.1, 0.5, 0.9, 1.0];
  
  for (const topP of topPValues) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      top_p: topP,
      temperature: 1.0,
      max_tokens: 150,
    });
    
    console.log(`Top_P ${topP}:`);
    console.log(completion.choices[0].message.content);
    console.log('\n' + '='.repeat(80) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testPenalties() {
  console.log('🚫 Testing Frequency & Presence Penalties\n');
  
  const testPrompt = "List 10 creative pizza toppings:";
  
  const scenarios = [
    { name: 'No Penalties', freq: 0, pres: 0 },
    { name: 'High Frequency Penalty', freq: 2.0, pres: 0 },
    { name: 'High Presence Penalty', freq: 0, pres: 2.0 },
  ];
  
  for (const scenario of scenarios) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: testPrompt }],
      frequency_penalty: scenario.freq,
      presence_penalty: scenario.pres,
      max_tokens: 200,
    });
    
    console.log(scenario.name);
    console.log(completion.choices[0].message.content);
    console.log('\n' + '='.repeat(80) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  await testTemperature();
  // await testTopP(); // Uncomment to test
  // await testPenalties(); // Uncomment to test
}

main().catch(console.error);
```

**Experiment Log:**
Create `docs/parameter-experiments.md` and document:
- Which temperature works best for factual responses?
- Which for creative writing?
- How do penalties affect output?

**✅ Day 2 Checklist:**
- [ ] Understand all major API parameters
- [ ] Run 15+ API calls with different parameters
- [ ] Document findings in experiment log
- [ ] Calculate approximate cost per 1K tokens

**💰 Cost Tracking:**
Start a spreadsheet to track API costs. GPT-3.5-Turbo is ~$0.0015/1K tokens.

---

### **Day 3 (Wednesday): Streaming & Error Handling**

#### Morning Session (2.5 hours)

**Study Materials (90 min):**
1. [OpenAI Streaming Guide](https://platform.openai.com/docs/api-reference/streaming)
2. [Error Handling Best Practices](https://platform.openai.com/docs/guides/error-codes)
3. Read about rate limits and quota management

**Video (60 min):**
- Search YouTube: "OpenAI streaming responses Node.js"
- Study async/await patterns and event streams

#### Evening Session (2 hours)

**Build: Streaming Chat Interface**

Create `src/week1/03-streaming-chat.ts`:

```typescript
import OpenAI from 'openai';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class StreamingChat {
  private messages: Message[] = [];
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // System message
    this.messages.push({
      role: 'system',
      content: 'You are a helpful AI assistant. Be concise and friendly.'
    });
  }

  async chat() {
    console.log('🤖 Streaming Chat Started (type "exit" to quit)\n');

    const askQuestion = () => {
      this.rl.question('You: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          console.log('\nGoodbye! 👋');
          this.rl.close();
          return;
        }

        // Add user message
        this.messages.push({ role: 'user', content: input });

        try {
          await this.streamResponse();
        } catch (error) {
          this.handleError(error);
        }

        askQuestion();
      });
    };

    askQuestion();
  }

  async streamResponse() {
    process.stdout.write('\nAssistant: ');

    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: this.messages,
      stream: true,
      temperature: 0.7,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
      fullResponse += content;
    }

    console.log('\n');

    // Add assistant response to history
    this.messages.push({ role: 'assistant', content: fullResponse });
  }

  handleError(error: any) {
    if (error instanceof OpenAI.APIError) {
      console.error('\n❌ API Error:');
      console.error(`Status: ${error.status}`);
      console.error(`Message: ${error.message}`);
      console.error(`Type: ${error.type}\n`);
      
      // Handle specific errors
      if (error.status === 429) {
        console.log('Rate limit hit. Waiting before retry...');
      } else if (error.status === 401) {
        console.log('Authentication failed. Check your API key.');
        process.exit(1);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

const chat = new StreamingChat();
chat.chat();
```

**Advanced: Retry Logic with Exponential Backoff**

Create `src/week1/03b-retry-logic.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxRetries}...`);

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      });

      return completion.choices[0].message.content || '';

    } catch (error: any) {
      lastError = error;

      if (error instanceof OpenAI.APIError) {
        // Don't retry on authentication errors
        if (error.status === 401 || error.status === 403) {
          throw error;
        }

        // Exponential backoff for rate limits and server errors
        if (error.status === 429 || error.status >= 500) {
          const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Rate limited. Waiting ${delayMs}ms...`);
          await sleep(delayMs);
          continue;
        }
      }

      // For other errors, wait briefly and retry
      await sleep(1000);
    }
  }

  throw lastError;
}

async function main() {
  try {
    const response = await callWithRetry(
      'What is the capital of France?'
    );
    console.log('\n✅ Success:', response);
  } catch (error) {
    console.error('\n❌ Failed after retries:', error);
  }
}

main();
```

**✅ Day 3 Checklist:**
- [ ] Build working streaming chat
- [ ] Implement error handling
- [ ] Implement retry logic with exponential backoff
- [ ] Test rate limiting behavior

---

### **Day 4 (Thursday): Token Management & Cost Optimization**

#### Morning Session (2.5 hours)

**Study Materials (90 min):**
1. [OpenAI Tokenizer](https://platform.openai.com/tokenizer) - Interactive tool
2. [tiktoken library](https://github.com/openai/tiktoken) - Study documentation
3. Read: [Token optimization strategies](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api)

**Understanding Tokenization:**
- "Hello, world!" ≈ 4 tokens
- Code is more token-heavy than natural language
- Different models use different tokenizers

**Video (60 min):**
- Watch: Token counting and optimization tutorials

#### Evening Session (2 hours)

**Build: Token Counter & Cost Calculator**

Create `src/week1/04-token-management.ts`:

```typescript
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
  console.log(`Response: ${completion.choices[0].message.content}\n`);

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
  await demonstrateTokenCounting();
  await demonstrateOptimization();
}

main().catch(console.error);
```

**Install tiktoken:**
```bash
npm install tiktoken
```

**✅ Day 4 Checklist:**
- [ ] Understand how tokenization works
- [ ] Build token counter and cost calculator
- [ ] Learn 3+ optimization strategies
- [ ] Calculate costs for various use cases

---

### **Day 5 (Friday): Context Window Management**

#### Morning Session (2.5 hours)

**Study Materials (90 min):**
1. Understanding context windows: GPT-3.5 (16K), GPT-4 (128K), Claude (200K)
2. [Managing conversation history](https://platform.openai.com/docs/guides/chat)
3. Strategies for long conversations

**Key Concepts:**
- Sliding window approach
- Summarization for history compression
- Selective context retention

**Video (60 min):**
- Search: "Managing long conversations with LLMs"
- Study memory patterns

#### Evening Session (2 hours)

**Build: Conversation Manager with Context Pruning**

Create `src/week1/05-context-manager.ts`:

```typescript
import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class ContextManager {
  private messages: Message[] = [];
  private encoder: any;
  private maxTokens: number;
  private systemMessage: Message;

  constructor(
    systemPrompt: string,
    maxTokens: number = 3000 // Reserve space for completion
  ) {
    this.encoder = encoding_for_model('gpt-3.5-turbo');
    this.maxTokens = maxTokens;
    this.systemMessage = { role: 'system', content: systemPrompt };
    this.messages.push(this.systemMessage);
  }

  private countTokens(messages: Message[]): number {
    let total = 0;
    for (const msg of messages) {
      total += 4; // Message overhead
      total += this.encoder.encode(msg.content).length;
    }
    total += 2; // Reply priming
    return total;
  }

  private pruneMessages(): void {
    // Always keep system message
    let currentMessages = [this.systemMessage];
    let currentTokens = this.countTokens([this.systemMessage]);

    // Add messages from most recent backwards
    for (let i = this.messages.length - 1; i > 0; i--) {
      const msg = this.messages[i];
      const msgTokens = this.countTokens([msg]);

      if (currentTokens + msgTokens > this.maxTokens) {
        console.log(`⚠️  Context pruned. Removed ${i} old messages.`);
        break;
      }

      currentMessages.unshift(msg);
      currentTokens += msgTokens;
    }

    this.messages = currentMessages;
  }

  async addUserMessage(content: string): Promise<string> {
    this.messages.push({ role: 'user', content });
    this.pruneMessages();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: this.messages,
    });

    const assistantMessage = completion.choices[0].message.content || '';
    this.messages.push({ role: 'assistant', content: assistantMessage });

    console.log(`📊 Context: ${this.messages.length} messages, ${this.countTokens(this.messages)} tokens`);

    return assistantMessage;
  }

  getConversationHistory(): Message[] {
    return this.messages.slice(1); // Exclude system message
  }

  cleanup() {
    this.encoder.free();
  }
}

// Advanced: Summarization-based context compression
class SummarizingContextManager extends ContextManager {
  private summaryThreshold: number = 10; // Summarize after 10 messages

  async addUserMessage(content: string): Promise<string> {
    // Check if we need to summarize
    if (this.getConversationHistory().length >= this.summaryThreshold) {
      await this.compressHistory();
    }

    return super.addUserMessage(content);
  }

  private async compressHistory(): Promise<void> {
    console.log('🔄 Compressing conversation history...');

    const history = this.getConversationHistory();
    const historyText = history
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const summaryPrompt = `Summarize this conversation concisely, preserving key points and context:

${historyText}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 500,
    });

    const summary = completion.choices[0].message.content || '';

    // Replace history with summary
    this.messages = [
      this.messages[0], // Keep system message
      { role: 'system', content: `Previous conversation summary: ${summary}` }
    ];

    console.log('✅ History compressed to summary');
  }
}

async function testContextManagement() {
  const manager = new ContextManager(
    'You are a helpful AI assistant with knowledge of programming.',
    2000 // Small token limit to trigger pruning
  );

  console.log('🧪 Testing Context Management\n');

  const questions = [
    'What is TypeScript?',
    'How does it differ from JavaScript?',
    'What are the benefits?',
    'Can you show me a simple example?',
    'What about interfaces?',
    'How do generics work?',
    'What is the difference between type and interface?',
    'Can you explain decorators?',
  ];

  for (const question of questions) {
    console.log(`\nUser: ${question}`);
    const response = await manager.addUserMessage(question);
    console.log(`Assistant: ${response.substring(0, 100)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📋 Final conversation history:');
  console.log(manager.getConversationHistory());

  manager.cleanup();
}

async function testSummarization() {
  const manager = new SummarizingContextManager(
    'You are a helpful travel assistant.',
    5000
  );

  console.log('\n🧪 Testing Summarization-based Context\n');

  const travelQuestions = [
    'I want to plan a trip to Japan',
    'What cities should I visit?',
    'Tell me about Tokyo',
    'What about Kyoto?',
    'How long should I stay in each city?',
    'What is the best time to visit?',
    'What about food recommendations?',
    'How much should I budget?',
    'Do I need a visa?',
    'What about transportation?',
    'Should I rent a car?',
    'What are the must-see attractions in Tokyo?',
  ];

  for (const question of travelQuestions) {
    console.log(`\nUser: ${question}`);
    const response = await manager.addUserMessage(question);
    console.log(`Assistant: ${response.substring(0, 100)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  manager.cleanup();
}

async function main() {
  await testContextManagement();
  // await testSummarization(); // Uncomment to test
}

main().catch(console.error);
```

**✅ Day 5 Checklist:**
- [ ] Understand context window limitations
- [ ] Implement sliding window context
- [ ] Implement summarization-based compression
- [ ] Test with long conversations

---

### **Weekend Project 1: Complete Chatbot Application**

#### Saturday-Sunday (12-16 hours total)

**🎯 Project Goal:** Build a production-ready chatbot with CLI and potential web interface

**Features to Implement:**
1. ✅ Streaming responses
2. ✅ Context management
3. ✅ Conversation history persistence
4. ✅ Token/cost tracking
5. ✅ Error handling with retries
6. ✅ Multiple conversation sessions
7. ✅ Export chat history

**Project Structure:**
```
projects/chatbot/
├── src/
│   ├── index.ts
│   ├── chat-manager.ts
│   ├── context-manager.ts
│   ├── token-tracker.ts
│   └── storage.ts
├── data/
│   └── conversations/
├── package.json
└── README.md
```

**Implementation:**

Create `projects/chatbot/src/chat-manager.ts`:

```typescript
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { encoding_for_model } from 'tiktoken';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  totalTokens: number;
  estimatedCost: number;
}

export class ChatManager {
  private openai: OpenAI;
  private encoder: any;
  private currentConversation: Conversation | null = null;
  private dataDir: string;

  constructor(dataDir: string = './data/conversations') {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.encoder = encoding_for_model('gpt-3.5-turbo');
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  async startNewConversation(title: string, systemPrompt?: string): Promise<void> {
    const id = Date.now().toString();
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
        timestamp: new Date()
      });
    }

    this.currentConversation = {
      id,
      title,
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTokens: 0,
      estimatedCost: 0
    };

    await this.saveConversation();
  }

  async sendMessage(content: string): Promise<string> {
    if (!this.currentConversation) {
      throw new Error('No active conversation');
    }

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    this.currentConversation.messages.push(userMessage);

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: this.currentConversation.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      stream: true,
    });

    let fullResponse = '';
    process.stdout.write('\nAssistant: ');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
      fullResponse += content;
    }

    console.log('\n');

    const assistantMessage: Message = {
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date()
    };

    this.currentConversation.messages.push(assistantMessage);
    this.updateStats();
    await this.saveConversation();

    return fullResponse;
  }

  private updateStats(): void {
    if (!this.currentConversation) return;

    let totalTokens = 0;
    for (const msg of this.currentConversation.messages) {
      totalTokens += this.encoder.encode(msg.content).length + 4;
    }

    this.currentConversation.totalTokens = totalTokens;
    this.currentConversation.estimatedCost = (totalTokens / 1000) * 0.002;
    this.currentConversation.updatedAt = new Date();
  }

  async saveConversation(): Promise<void> {
    if (!this.currentConversation) return;

    const filename = path.join(
      this.dataDir,
      `${this.currentConversation.id}.json`
    );

    await fs.writeFile(
      filename,
      JSON.stringify(this.currentConversation, null, 2)
    );
  }

  async loadConversation(id: string): Promise<void> {
    const filename = path.join(this.dataDir, `${id}.json`);
    const data = await fs.readFile(filename, 'utf-8');
    this.currentConversation = JSON.parse(data);
  }

  async listConversations(): Promise<Conversation[]> {
    const files = await fs.readdir(this.dataDir);
    const conversations: Conversation[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(
          path.join(this.dataDir, file),
          'utf-8'
        );
        conversations.push(JSON.parse(data));
      }
    }

    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getCurrentStats(): { tokens: number; cost: number } | null {
    if (!this.currentConversation) return null;

    return {
      tokens: this.currentConversation.totalTokens,
      cost: this.currentConversation.estimatedCost
    };
  }

  async exportToMarkdown(): Promise<string> {
    if (!this.currentConversation) {
      throw new Error('No active conversation');
    }

    let markdown = `# ${this.currentConversation.title}\n\n`;
    markdown += `Created: ${this.currentConversation.createdAt.toLocaleString()}\n`;
    markdown += `Total Tokens: ${this.currentConversation.totalTokens}\n`;
    markdown += `Estimated Cost: $${this.currentConversation.estimatedCost.toFixed(4)}\n\n`;
    markdown += '---\n\n';

    for (const msg of this.currentConversation.messages) {
      if (msg.role === 'system') continue;

      markdown += `### ${msg.role === 'user' ? '👤 User' : '🤖 Assistant'}\n`;
      if (msg.timestamp) {
        markdown += `*${new Date(msg.timestamp).toLocaleTimeString()}*\n\n`;
      }
      markdown += `${msg.content}\n\n`;
    }

    const filename = path.join(
      this.dataDir,
      `${this.currentConversation.id}.md`
    );
    await fs.writeFile(filename, markdown);

    return filename;
  }

  cleanup(): void {
    this.encoder.free();
  }
}
```

Create `projects/chatbot/src/index.ts`:

```typescript
import { ChatManager } from './chat-manager';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const chatManager = new ChatManager();

  console.log('🤖 AI Chatbot');
  console.log('='.repeat(50));
  console.log('Commands:');
  console.log('  /new - Start new conversation');
  console.log('  /list - List conversations');
  console.log('  /load <id> - Load conversation');
  console.log('  /stats - Show current stats');
  console.log('  /export - Export to Markdown');
  console.log('  /quit - Exit');
  console.log('='.repeat(50) + '\n');

  let running = true;

  while (running) {
    const input = await question('> ');

    if (input.startsWith('/')) {
      const [command, ...args] = input.split(' ');

      switch (command) {
        case '/new': {
          const title = await question('Conversation title: ');
          const systemPrompt = await question('System prompt (optional): ');
          await chatManager.startNewConversation(
            title,
            systemPrompt || undefined
          );
          console.log('✅ New conversation started\n');
          break;
        }

        case '/list': {
          const conversations = await chatManager.listConversations();
          console.log('\n📋 Conversations:\n');
          conversations.forEach((conv, idx) => {
            console.log(`${idx + 1}. ${conv.title} (ID: ${conv.id})`);
            console.log(`   Updated: ${new Date(conv.updatedAt).toLocaleString()}`);
            console.log(`   Tokens: ${conv.totalTokens}, Cost: $${conv.estimatedCost.toFixed(4)}\n`);
          });
          break;
        }

        case '/load': {
          const id = args[0];
          if (!id) {
            console.log('❌ Usage: /load <conversation_id>');
            break;
          }
          try {
            await chatManager.loadConversation(id);
            console.log('✅ Conversation loaded\n');
          } catch (error) {
            console.log('❌ Error loading conversation:', error);
          }
          break;
        }

        case '/stats': {
          const stats = chatManager.getCurrentStats();
          if (stats) {
            console.log('\n📊 Current Stats:');
            console.log(`Tokens: ${stats.tokens}`);
            console.log(`Cost: $${stats.cost.toFixed(4)}\n`);
          } else {
            console.log('❌ No active conversation\n');
          }
          break;
        }

        case '/export': {
          try {
            const filename = await chatManager.exportToMarkdown();
            console.log(`✅ Exported to: ${filename}\n`);
          } catch (error) {
            console.log('❌ Error exporting:', error);
          }
          break;
        }

        case '/quit':
          running = false;
          break;

        default:
          console.log('❌ Unknown command\n');
      }
    } else {
      try {
        await chatManager.sendMessage(input);
        const stats = chatManager.getCurrentStats();
        if (stats) {
          console.log(`📊 [Tokens: ${stats.tokens}, Cost: $${stats.cost.toFixed(4)}]\n`);
        }
      } catch (error: any) {
        console.log('❌ Error:', error.message, '\n');
      }
    }
  }

  chatManager.cleanup();
  rl.close();
  console.log('\nGoodbye! 👋');
}

main().catch(console.error);
```

**Run the chatbot:**
```bash
cd projects/chatbot
npm install
npx ts-node src/index.ts
```

**✅ Weekend Checklist:**
- [ ] Complete chatbot with all features
- [ ] Test with 10+ conversations
- [ ] Export conversations to Markdown
- [ ] Calculate total costs
- [ ] Document code
- [ ] Create README with usage instructions

**📝 Weekend Reflection:**
Write a blog post (500-1000 words): "Building My First AI Chatbot: Week 1 Journey"

---

## 🎯 Week 1 Summary & Assessment

**Skills Acquired:**
✅ LLM API integration (OpenAI, Anthropic)  
✅ Streaming responses  
✅ Error handling and retries  
✅ Token management and optimization  
✅ Context window management  
✅ Cost tracking and optimization  
✅ Production-ready chatbot development

**Deliverables:**
1. ✅ Working chatbot application
2. ✅ Token counter/cost calculator
3. ✅ Documentation and code samples
4. ✅ Blog post (optional but recommended)

**Self-Assessment Questions:**
1. Can you explain how tokens work and why they matter?
2. Can you handle rate limiting gracefully?
3. Can you build a chatbot from scratch in under 2 hours?
4. Do you understand the cost implications of different models?

**Next Week Preview:**
Week 2 focuses on **advanced prompt engineering** and **function calling**, setting you up for AI agent development.
