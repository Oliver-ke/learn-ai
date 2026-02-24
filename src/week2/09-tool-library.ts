import OpenAI from 'openai';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// TOOL 1: Web Search (using API)
// ============================================

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

async function webSearch(
  query: string,
  numResults: number = 5,
): Promise<string> {
  try {
    // Using DuckDuckGo Instant Answer API (free, no key needed)
    // For production, use Google Custom Search API
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1,
      },
      timeout: 5000,
    });

    const results: SearchResult[] = [];

    // Extract abstract
    if (response.data.AbstractText) {
      results.push({
        title: response.data.Heading || query,
        link: response.data.AbstractURL || '',
        snippet: response.data.AbstractText,
      });
    }

    // Extract related topics
    if (response.data.RelatedTopics) {
      response.data.RelatedTopics.slice(0, numResults - 1).forEach(
        (topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || '',
              link: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        },
      );
    }

    return JSON.stringify({
      query,
      results,
      count: results.length,
    });
  } catch (error: any) {
    return JSON.stringify({
      error: 'Search failed',
      message: error.message,
    });
  }
}

const webSearchTool = {
  name: 'web_search',
  description:
    'Search the web for current information. Use this when you need up-to-date facts, news, or information not in your training data.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query',
      },
      numResults: {
        type: 'number',
        description: 'Number of results to return (default: 5)',
        default: 5,
      },
    },
    required: ['query'],
  },
};

// ============================================
// TOOL 2: Weather API (OpenWeatherMap)
// ============================================

async function getWeather(
  location: string,
  units: string = 'metric',
): Promise<string> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return JSON.stringify({
        error: 'API key not configured',
        message: 'Set OPENWEATHER_API_KEY in .env file',
      });
    }

    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          q: location,
          appid: apiKey,
          units: units,
        },
        timeout: 5000,
      },
    );

    const data = response.data;

    return JSON.stringify({
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      conditions: data.weather[0].description,
      wind_speed: data.wind.speed,
      units: units === 'metric' ? 'Celsius' : 'Fahrenheit',
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return JSON.stringify({ error: 'Location not found' });
    }
    return JSON.stringify({
      error: 'Weather API error',
      message: error.message,
    });
  }
}

const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather information for a specific location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or city, country code (e.g., "London,UK")',
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        description:
          'Temperature units (metric for Celsius, imperial for Fahrenheit)',
        default: 'metric',
      },
    },
    required: ['location'],
  },
};

// ============================================
// TOOL 3: Database Query (simulated)
// ============================================

interface DatabaseRecord {
  id: string;
  [key: string]: any;
}

class SimpleDatabase {
  private tables: Map<string, DatabaseRecord[]> = new Map();

  constructor() {
    // Initialize with sample data
    this.tables.set('users', [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'admin',
      },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
      {
        id: '3',
        name: 'Carol White',
        email: 'carol@example.com',
        role: 'user',
      },
    ]);

    this.tables.set('orders', [
      {
        id: '101',
        user_id: '1',
        product: 'Laptop',
        amount: 1200,
        status: 'delivered',
      },
      {
        id: '102',
        user_id: '2',
        product: 'Mouse',
        amount: 25,
        status: 'pending',
      },
      {
        id: '103',
        user_id: '1',
        product: 'Keyboard',
        amount: 80,
        status: 'shipped',
      },
    ]);
  }

  query(table: string, filters?: Record<string, any>): DatabaseRecord[] {
    const records = this.tables.get(table) || [];

    if (!filters) {
      return records;
    }

    return records.filter((record) => {
      return Object.entries(filters).every(([key, value]) => {
        return record[key] === value;
      });
    });
  }
}

const db = new SimpleDatabase();

async function queryDatabase(
  table: string,
  filters?: Record<string, any>,
): Promise<string> {
  try {
    const results = db.query(table, filters);
    return JSON.stringify({
      table,
      filters,
      count: results.length,
      results,
    });
  } catch (error: any) {
    return JSON.stringify({
      error: 'Database query failed',
      message: error.message,
    });
  }
}

const databaseTool = {
  name: 'query_database',
  description: 'Query the database for user or order information',
  parameters: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        enum: ['users', 'orders'],
        description: 'The database table to query',
      },
      filters: {
        type: 'object',
        description:
          'Optional filters as key-value pairs (e.g., {"role": "admin"})',
        additionalProperties: true,
      },
    },
    required: ['table'],
  },
};

// ============================================
// TOOL 4: Email Sender
// ============================================

async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<string> {
  try {
    // Configure nodemailer (use environment variables in production)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // For demo purposes, we'll just simulate sending
    // In production, uncomment the actual send
    /*
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      text: body,
      html: `<p>${body}</p>`
    });
    */

    return JSON.stringify({
      success: true,
      message: 'Email sent successfully (simulated)',
      to,
      subject,
      // messageId: info.messageId
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: 'Failed to send email',
      message: error.message,
    });
  }
}

const emailTool = {
  name: 'send_email',
  description:
    'Send an email to a recipient. Use this for notifications, confirmations, or communication.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient email address',
      },
      subject: {
        type: 'string',
        description: 'Email subject line',
      },
      body: {
        type: 'string',
        description: 'Email body text',
      },
    },
    required: ['to', 'subject', 'body'],
  },
};

// ============================================
// TOOL 5: Calculator (for complex math)
// ============================================

async function calculate(expression: string): Promise<string> {
  try {
    // In production, use a safe math evaluation library like math.js
    // NEVER use eval() with user input in production!

    // For demo, we'll use a simple parser
    // Install: npm install mathjs
    // import { evaluate } from 'mathjs';

    // Simulate calculation
    const sanitizedExpr = expression.replace(/[^0-9+\-*/().\s]/g, '');
    const result = eval(sanitizedExpr); // DEMO ONLY - unsafe!

    return JSON.stringify({
      expression,
      result,
      formatted: `${expression} = ${result}`,
    });
  } catch (error: any) {
    return JSON.stringify({
      error: 'Calculation failed',
      message: error.message,
      expression,
    });
  }
}

const calculatorTool = {
  name: 'calculate',
  description:
    'Perform mathematical calculations. Supports basic arithmetic and expressions.',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description:
          'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "(10 * 5) / 2")',
      },
    },
    required: ['expression'],
  },
};

// ============================================
// TOOL 6: Code Executor (sandboxed)
// ============================================

async function executeCode(language: string, code: string): Promise<string> {
  try {
    if (language !== 'javascript') {
      return JSON.stringify({
        error: 'Unsupported language',
        message: 'Only JavaScript is supported in this demo',
      });
    }

    // In production, use a proper sandbox like vm2 or isolated-vm
    // This is UNSAFE - for demo only

    let output = '';
    const customConsole = {
      log: (...args: any[]) => {
        output += args.join(' ') + '\n';
      },
    };

    // Create a sandboxed function
    const func = new Function('console', code);
    func(customConsole);

    return JSON.stringify({
      success: true,
      language,
      output: output || 'Code executed successfully (no output)',
    });
  } catch (error: any) {
    return JSON.stringify({
      success: false,
      error: 'Code execution failed',
      message: error.message,
    });
  }
}

const codeExecutorTool = {
  name: 'execute_code',
  description:
    'Execute code snippets in a sandboxed environment. Use for testing small code samples.',
  parameters: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        enum: ['javascript'],
        description: 'Programming language',
      },
      code: {
        type: 'string',
        description: 'Code to execute',
      },
    },
    required: ['language', 'code'],
  },
};

// ============================================
// Tool Registry & Agent
// ============================================

interface Tool {
  name: string;
  description: string;
  parameters: any;
}

interface ToolFunction {
  (...args: any[]): Promise<string>;
}

class ToolAgent {
  private tools: Map<string, ToolFunction> = new Map();
  private toolDefinitions: Tool[] = [];

  constructor(private openai: OpenAI) {}

  registerTool(definition: Tool, implementation: ToolFunction) {
    this.tools.set(definition.name, implementation);
    this.toolDefinitions.push(definition);
    console.log(`✅ Registered tool: ${definition.name}`);
  }

  async chat(userMessage: string): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant with access to various tools. Use them when needed to help users.',
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log(`\n👤 User: ${userMessage}\n`);

    let iteration = 0;
    const maxIterations = 10;

    while (iteration < maxIterations) {
      iteration++;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        functions: this.toolDefinitions,
        function_call: 'auto',
      });

      const responseMessage = response.choices[0]?.message || {
        role: 'assistant',
        content: '',
        function_call: { name: '', arguments: '' },
      };
      messages.push(responseMessage);

      // Check if function call is needed
      if (responseMessage?.function_call) {
        const functionName = responseMessage.function_call.name;
        const functionArgs = JSON.parse(
          responseMessage.function_call.arguments,
        );

        console.log(`🔧 Tool: ${functionName}`);
        console.log(`📥 Args:`, JSON.stringify(functionArgs, null, 2));

        // Execute the tool
        const toolFunction = this.tools.get(functionName);
        if (!toolFunction) {
          throw new Error(`Tool ${functionName} not found`);
        }

        const result = await toolFunction(...Object.values(functionArgs));

        console.log(`📤 Result:`, result);
        console.log('');

        // Add function result to messages
        messages.push({
          role: 'function',
          name: functionName,
          content: result,
        });
      } else {
        // No more function calls, return final answer
        console.log(`🤖 Assistant: ${responseMessage.content}\n`);
        return responseMessage.content || '';
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return 'Maximum iterations reached';
  }
}

// ============================================
// Demo: Using the Tool Agent
// ============================================

async function demoToolAgent() {
  console.log('🚀 TOOL AGENT DEMO\n');
  console.log('='.repeat(80) + '\n');

  const agent = new ToolAgent(openai);

  // Register all tools
  agent.registerTool(webSearchTool, webSearch);
  agent.registerTool(weatherTool, getWeather);
  agent.registerTool(databaseTool, queryDatabase);
  agent.registerTool(emailTool, sendEmail);
  agent.registerTool(calculatorTool, calculate);
  agent.registerTool(codeExecutorTool, executeCode);

  console.log('\n' + '='.repeat(80) + '\n');

  // Test queries
  const queries = [
    // "What's the weather like in Tokyo?",

    'Find all admin users in the database and tell me their names',

    // "Calculate the total value of all pending orders in the database",

    // "Search for information about TypeScript and summarize what you find",
  ];

  for (const query of queries) {
    await agent.chat(query);
    console.log('='.repeat(80) + '\n');
  }
}

// ============================================
// Main execution
// ============================================

async function main() {
  // Install required packages first
  console.log('📦 Make sure to install: npm install axios nodemailer\n');

  await demoToolAgent();

  console.log('\n✅ Tool library demo completed!');
}

main().catch(console.error);
