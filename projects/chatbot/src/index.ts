import { ChatManager } from './chat-manager.js';
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

  const commands = {
    NEW_CONVERSATION: '/new',
    LIST_CONVERSATIONS: '/list',
    LOAD_CONVERSATION: '/load',
    SHOW_STATS: '/stats',
    EXPORT_MARKDOWN: '/export',
    QUIT: '/quit'
  }

  console.log('🤖 Sonac Chatbot');
  console.log('Commands:');

  console.log(`  ${commands.NEW_CONVERSATION} - Start new conversation`);
  console.log(`  ${commands.LIST_CONVERSATIONS} - List conversations`);
  console.log(`  ${commands.LOAD_CONVERSATION} <id> - Load conversation`);
  console.log(`  ${commands.SHOW_STATS} - Show current stats`);
  console.log(`  ${commands.EXPORT_MARKDOWN} - Export to Markdown`);
  console.log(`  ${commands.QUIT} - Exit`);

  console.log('='.repeat(50) + '\n');

  let running = true;

  while (running) {
    const input = await question('Prompt> ');

    if (input.startsWith('/')) {
      const [command, ...args] = input.split(' ');

      switch (command) {
        case commands.NEW_CONVERSATION: {
          const title = await question('Conversation title: ');
          const systemPrompt = await question('System prompt (optional): ');
          await chatManager.startNewConversation(
            title,
            systemPrompt || undefined
          );
          console.log('✅ New conversation started\n');
          break;
        }

        case commands.LIST_CONVERSATIONS: {
          const conversations = await chatManager.listConversations();
          console.log('\n📋 Conversations:\n');
          conversations.forEach((conv, idx) => {
            console.log(`${idx + 1}. ${conv.title} (ID: ${conv.id})`);
            console.log(`   Updated: ${new Date(conv.updatedAt).toLocaleString()}`);
            console.log(`   Tokens: ${conv.totalTokens}, Cost: $${conv.estimatedCost.toFixed(4)}\n`);
          });
          break;
        }

        case commands.LOAD_CONVERSATION: {
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

        case commands.SHOW_STATS: {
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

        case commands.EXPORT_MARKDOWN: {
          try {
            const filename = await chatManager.exportToMarkdown();
            console.log(`✅ Exported to: ${filename}\n`);
          } catch (error) {
            console.log('❌ Error exporting:', error);
          }
          break;
        }

        case commands.QUIT:
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