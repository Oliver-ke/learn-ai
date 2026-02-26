
import * as dotenv from 'dotenv';
import openai = require('openai');

dotenv.config();

const openaiClient = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export default openaiClient;