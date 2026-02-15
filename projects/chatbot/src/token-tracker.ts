import { encoding_for_model } from 'tiktoken';

export class TokenTracker {
  dataDir: string;
  private encoder: any;
  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.encoder = encoding_for_model('gpt-3.5-turbo');
  }

  public getMessageStats(
    conversation: Conversation,
  ): Promise<{ totalTokens: number; estimatedCost: number }> {
    let totalTokens = 0;
    for (const msg of conversation.messages) {
      totalTokens += this.encoder.encode(msg.content).length + 4;
    }

    const estimatedCost = (totalTokens / 1000) * 0.002;
    return { totalTokens, estimatedCost };
  }
}
