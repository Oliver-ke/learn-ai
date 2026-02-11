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