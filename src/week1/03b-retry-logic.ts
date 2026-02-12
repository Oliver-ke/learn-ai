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

      const choice = completion.choices[0];
      return choice?.message.content || '';

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