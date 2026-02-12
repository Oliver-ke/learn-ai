import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    maxTokens: number = 3000, // Reserve space for completion
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
      const msg = this.messages[i] as Message;
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

  public addMessageToHistory(summary: string): void {
    this.messages = [
      this.messages[0] as Message, // Keep system message
      { role: 'system', content: `Previous conversation summary: ${summary}` },
    ];
  }

  async addUserMessage(content: string): Promise<string> {
    this.messages.push({ role: 'user', content });
    this.pruneMessages();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: this.messages,
    });

    const assistantMessage = completion.choices[0]?.message.content || '';
    this.messages.push({ role: 'assistant', content: assistantMessage });

    console.log(
      `📊 Context: ${this.messages.length} messages, ${this.countTokens(this.messages)} tokens`,
    );

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
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const summaryPrompt = `Summarize this conversation concisely, preserving key points and context:
                            ${historyText} 
                            Summary:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: summaryPrompt }],
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message.content || '';

    // Replace history with summary
    this.addMessageToHistory(summary)
    console.log('✅ History compressed to summary');
  }
}

async function testContextManagement() {
  const manager = new ContextManager(
    'You are a helpful AI assistant with knowledge of programming.',
    2000, // Small token limit to trigger pruning
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

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n📋 Final conversation history:');
  console.log(manager.getConversationHistory());

  manager.cleanup();
}

async function testSummarization() {
  const manager = new SummarizingContextManager(
    'You are a helpful travel assistant.',
    5000,
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

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  manager.cleanup();
}

async function main() {
//   await testContextManagement();
  await testSummarization(); // Uncomment to test
}

main().catch(console.error);
