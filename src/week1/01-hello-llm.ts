import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic Setup
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testOpenAI() {
  console.log('🤖 Testing OpenAI...\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: 'Explain what a token is in LLMs in one sentence.',
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0];
    console.log('Response:', response ?? 'No response');
    console.log('Tokens used:', completion.usage);
  } catch (error) {
    console.error('Error testing OpenAI:', error);
  }
}

async function testAnthropic() {
  console.log('\n🤖 Testing Anthropic Claude...\n');
  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Explain what a token is in LLMs in one sentence.',
        },
      ],
    });

    const response =
      message.content[0]?.type === 'text' ? message.content[0].text : null;
    console.log('Response:', response ?? 'No response');
    console.log('Tokens used:', message.usage);
  } catch (error) {
    console.error('Error testing Anthropic:', error);
  }
}

async function main() {
  await testOpenAI();
  await testAnthropic();
}

main().catch(console.error);
