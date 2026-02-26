import OpenAI from 'openai';

export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (...args: any[]) => Promise<string>;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: Tool[];
  model?: string;
  temperature?: number;
}

export class Agent {
  private tools: Map<string, Tool> = new Map();
  private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(
    private config: AgentConfig,
    private openai: OpenAI
  ) {
    // Register tools
    config.tools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // Add system message
    this.conversationHistory.push({
      role: 'system',
      content: config.systemPrompt
    });
  }

  async chat(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations) {
      iterations++;

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: this.conversationHistory,
        functions: Array.from(this.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        })),
        function_call: 'auto',
        temperature: this.config.temperature || 0.7,
      });

      const message = response.choices[0]?.message;
      if (!message) throw new Error('No response from model');
      this.conversationHistory.push(message);

      if (message.function_call) {
        // Execute tool
        const tool = this.tools.get(message.function_call.name);
        if (!tool) {
          throw new Error(`Tool ${message.function_call.name} not found`);
        }

        const args = JSON.parse(message.function_call.arguments);
        const result = await tool.execute(...Object.values(args));

        this.conversationHistory.push({
          role: 'function',
          name: message.function_call.name,
          content: result
        });
      } else {
        // Return final response
        return message.content || '';
      }
    }

    throw new Error('Max iterations reached');
  }

  getHistory(): OpenAI.Chat.ChatCompletionMessageParam[] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    const systemMsg = this.conversationHistory[0];
    if (systemMsg) {
      this.conversationHistory = [systemMsg];
    }
  }
}