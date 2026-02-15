import OpenAI from 'openai';
import { TokenTracker } from './token-tracker.js';
import { ConversationStorage } from './storage.js';

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
  private tokenTracker: TokenTracker;
  private conversationStorage: ConversationStorage;

  constructor(dataDir: string = './data/conversations') {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.tokenTracker = new TokenTracker(dataDir);
    this.conversationStorage = new ConversationStorage(dataDir);

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

  async startNewConversation(
    title: string,
    systemPrompt?: string,
  ): Promise<void> {
    const id = Date.now().toString();
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
        timestamp: new Date(),
      });
    }

    this.currentConversation = {
      id,
      title,
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalTokens: 0,
      estimatedCost: 0,
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
      timestamp: new Date(),
    };

    this.currentConversation.messages.push(userMessage);

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: this.currentConversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
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
      timestamp: new Date(),
    };

    this.currentConversation.messages.push(assistantMessage);
    this.updateStats();
    await this.saveConversation();

    return fullResponse;
  }

  private updateStats(): void {
    if (!this.currentConversation) return;

    const { totalTokens, estimatedCost } = this.tokenTracker.getMessageStats(
      this.currentConversation,
    );

    this.currentConversation.totalTokens = totalTokens;
    this.currentConversation.estimatedCost = estimatedCost;
    this.currentConversation.updatedAt = new Date();
  }

  async saveConversation(): Promise<void> {
    if (!this.currentConversation) return;
    return this.conversationStorage.saveConversation(this.currentConversation);
  }

  async loadConversation(id: string): Promise<void> {
    return this.conversationStorage.loadConversation(id);
  }

  async listConversations(): Promise<Conversation[]> {
    return this.conversationStorage.listConversations();
  }

  getCurrentStats(): { tokens: number; cost: number } | null {
    if (!this.currentConversation) return null;

    return {
      tokens: this.currentConversation.totalTokens,
      cost: this.currentConversation.estimatedCost,
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
      `${this.currentConversation.id}.md`,
    );
    await fs.writeFile(filename, markdown);

    return filename;
  }

  cleanup(): void {
    this.encoder.free();
  }
}
