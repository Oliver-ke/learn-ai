import * as fs from 'fs/promises';
import * as path from 'path';

export class ConversationStorage {
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  async saveConversation(currentConversation: Conversation): Promise<void> {
    if (!currentConversation) return;

    const filename = path.join(
      this.dataDir,
      `${currentConversation.id}.json`,
    );

    await fs.writeFile(
      filename,
      JSON.stringify(currentConversation, null, 2),
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
        const data = await fs.readFile(path.join(this.dataDir, file), 'utf-8');
        conversations.push(JSON.parse(data));
      }
    }

    return conversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }
}
