import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// EXAMPLE 1: Simple Function Calling
// ============================================

// Define available functions
const functions = [
  {
    name: 'get_current_weather',
    description: 'Get the current weather in a given location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The temperature unit to use'
        },
      },
      required: ['location'],
    },
  },
];

// Implement the actual function
function getCurrentWeather(location: string, unit: string = 'fahrenheit'): string {
  // This would call a real weather API in production
  const weatherData: Record<string, any> = {
    'San Francisco, CA': { temp: 65, condition: 'Sunny' },
    'New York, NY': { temp: 45, condition: 'Cloudy' },
    'Tokyo, Japan': { temp: 10, condition: 'Rainy' },
  };

  const weather = weatherData[location] || { temp: 70, condition: 'Unknown' };
  
  return JSON.stringify({
    location,
    temperature: unit === 'celsius' ? (weather.temp - 32) * 5/9 : weather.temp,
    unit,
    condition: weather.condition
  });
}

async function simpleFunctionCalling() {
  console.log('🌤️  SIMPLE FUNCTION CALLING\n');

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'user', content: 'What\'s the weather like in San Francisco?' }
  ];

  console.log('User:', messages[0]?.content);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
    functions: functions,
    function_call: 'auto',
  });

  const responseMessage = response.choices[0].message;

  // Check if the model wants to call a function
  if (responseMessage.function_call) {
    console.log('\n🔧 Function Call Detected:');
    console.log('Function:', responseMessage.function_call.name);
    console.log('Arguments:', responseMessage.function_call.arguments);

    // Parse function arguments
    const functionArgs = JSON.parse(responseMessage.function_call.arguments);

    // Call the actual function
    const functionResponse = getCurrentWeather(
      functionArgs.location,
      functionArgs.unit
    );

    console.log('\n📡 Function Response:', functionResponse);

    // Send function response back to model
    messages.push(responseMessage);
    messages.push({
      role: 'function',
      name: responseMessage.function_call.name,
      content: functionResponse,
    });

    // Get final response from model
    const secondResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    console.log('\n🤖 Final Response:', secondResponse.choices[0].message.content);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 2: Multiple Functions
// ============================================

const multipleFunctions = [
  {
    name: 'search_products',
    description: 'Search for products in the database',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for products'
        },
        category: {
          type: 'string',
          enum: ['electronics', 'clothing', 'books', 'all'],
          description: 'Product category to search in'
        },
        maxPrice: {
          type: 'number',
          description: 'Maximum price filter'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_product_details',
    description: 'Get detailed information about a specific product',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The unique product ID'
        }
      },
      required: ['productId']
    }
  },
  {
    name: 'check_inventory',
    description: 'Check if a product is in stock',
    parameters: {
      type: 'object',
      properties: {
        productId: {
          type: 'string',
          description: 'The product ID to check'
        },
        location: {
          type: 'string',
          description: 'Store location'
        }
      },
      required: ['productId']
    }
  }
];

// Implement functions
function searchProducts(query: string, category: string = 'all', maxPrice?: number): string {
  const products = [
    { id: 'p1', name: 'Laptop Pro', category: 'electronics', price: 1200 },
    { id: 'p2', name: 'Wireless Mouse', category: 'electronics', price: 25 },
    { id: 'p3', name: 'TypeScript Book', category: 'books', price: 40 },
  ];

  let results = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) &&
    (category === 'all' || p.category === category) &&
    (!maxPrice || p.price <= maxPrice)
  );

  return JSON.stringify(results);
}

function getProductDetails(productId: string): string {
  const details: Record<string, any> = {
    'p1': { id: 'p1', name: 'Laptop Pro', specs: '16GB RAM, 512GB SSD', rating: 4.5 },
    'p2': { id: 'p2', name: 'Wireless Mouse', specs: 'Bluetooth 5.0', rating: 4.2 },
  };

  return JSON.stringify(details[productId] || { error: 'Product not found' });
}

function checkInventory(productId: string, location: string = 'main'): string {
  return JSON.stringify({
    productId,
    location,
    inStock: Math.random() > 0.3,
    quantity: Math.floor(Math.random() * 100)
  });
}

// Function executor
const availableFunctions: Record<string, Function> = {
  search_products: searchProducts,
  get_product_details: getProductDetails,
  check_inventory: checkInventory,
};

async function multipleFunctionCalling() {
  console.log('🛍️  MULTIPLE FUNCTION CALLING\n');

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: 'I\'m looking for an affordable laptop under $1000. Can you help me find one and check if it\'s in stock?'
    }
  ];

  console.log('User:', messages[0].content);
  console.log('\n' + '-'.repeat(80) + '\n');

  let continueLoop = true;
  let iterations = 0;
  const maxIterations = 5;

  while (continueLoop && iterations < maxIterations) {
    iterations++;
    console.log(`\n--- Iteration ${iterations} ---\n`);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      functions: multipleFunctions,
      function_call: 'auto',
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);

      console.log(`🔧 Calling: ${functionName}`);
      console.log(`📥 Arguments:`, JSON.stringify(functionArgs, null, 2));

      // Execute the function
      const functionToCall = availableFunctions[functionName];
      const functionResponse = functionToCall(...Object.values(functionArgs));

      console.log(`📤 Response:`, functionResponse);

      messages.push({
        role: 'function',
        name: functionName,
        content: functionResponse,
      });
    } else {
      // No more function calls, we have the final answer
      console.log('\n🤖 Final Response:', responseMessage.content);
      continueLoop = false;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// EXAMPLE 3: Parallel Function Calling
// ============================================

async function parallelFunctionCalling() {
  console.log('⚡ PARALLEL FUNCTION CALLING\n');

  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'get_current_weather',
        description: 'Get the current weather',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string' },
          },
          required: ['location']
        }
      }
    }
  ];

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: 'What\'s the weather in San Francisco, New York, and Tokyo?'
    }
  ];

  console.log('User:', messages[0].content);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
    tools: tools,
    tool_choice: 'auto',
  });

  const responseMessage = response.choices[0].message;

  if (responseMessage.tool_calls) {
    console.log(`\n🔧 ${responseMessage.tool_calls.length} Parallel Function Calls:\n`);

    messages.push(responseMessage);

    // Execute all functions in parallel
    const functionPromises = responseMessage.tool_calls.map(async (toolCall) => {
      const functionArgs = JSON.parse(toolCall.function.arguments);
      console.log(`Calling: ${toolCall.function.name} with args:`, functionArgs);
      
      const result = getCurrentWeather(functionArgs.location);
      
      return {
        tool_call_id: toolCall.id,
        role: 'tool' as const,
        name: toolCall.function.name,
        content: result,
      };
    });

    const functionResponses = await Promise.all(functionPromises);
    messages.push(...functionResponses);

    console.log('\n📡 All Function Responses Received\n');

    // Get final response
    const secondResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    console.log('🤖 Final Response:', secondResponse.choices[0]?.message.content);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 FUNCTION CALLING EXAMPLES\n');
  console.log('='.repeat(80) + '\n');

//   await simpleFunctionCalling();
//   await multipleFunctionCalling();
  await parallelFunctionCalling();

  console.log('\n✅ All examples completed!');
}

main().catch(console.error);