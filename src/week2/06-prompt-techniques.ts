import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ============================================
// TECHNIQUE 1: Zero-Shot vs Few-Shot
// ============================================

async function zeroShotExample() {
  console.log('🎯 ZERO-SHOT PROMPTING\n');

  const prompt = `Classify the sentiment of this review as positive, negative, or neutral:

Review: "The product arrived late and the quality was disappointing."

Sentiment:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0, // Deterministic for classification
  });

  console.log('Prompt:', prompt);
  console.log('\nResponse:', completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function fewShotExample() {
  console.log('🎯 FEW-SHOT PROMPTING\n');

  const prompt = `Classify the sentiment of reviews as positive, negative, or neutral.

Examples:
Review: "Best purchase ever! Highly recommend."
Sentiment: positive

Review: "It's okay, nothing special."
Sentiment: neutral

Review: "Terrible experience, waste of money."
Sentiment: negative

Now classify this review:
Review: "The product arrived late and the quality was disappointing."
Sentiment:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  console.log('Prompt:', prompt);
  console.log('\nResponse:', completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// TECHNIQUE 2: Role Prompting
// ============================================

async function rolePromptingExample() {
  console.log('🎭 ROLE PROMPTING\n');

  const scenarios = [
    {
      name: 'Generic Assistant',
      system: 'You are a helpful assistant.',
      user: 'Explain quantum computing.',
    },
    {
      name: 'Expert Physicist',
      system:
        'You are a Nobel Prize-winning physicist specializing in quantum mechanics. Explain concepts with technical precision but clear analogies.',
      user: 'Explain quantum computing.',
    },
    {
      name: 'ELI5 Teacher',
      system:
        'You are a elementary school teacher who excels at explaining complex topics to 5-year-olds using simple language and fun analogies.',
      user: 'Explain quantum computing.',
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n🎬 ${scenario.name}:`);
    console.log(`System: ${scenario.system}\n`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: scenario.system },
        { role: 'user', content: scenario.user },
      ],
      max_tokens: 150,
    });

    console.log('Response:', completion.choices[0]?.message.content);
    console.log('\n' + '-'.repeat(80));

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// TECHNIQUE 3: Delimiters & Structure
// ============================================

async function delimiterExample() {
  console.log('🏗️  USING DELIMITERS\n');

  // Poor: Ambiguous prompt
  const poorPrompt = `
Summarize the text and extract key points:
The company reported strong Q4 earnings with revenue up 25% YoY. 
However, the CEO announced layoffs affecting 10% of workforce. 
Stock price dropped 5% on the news despite positive earnings.
`;

  // Good: Clear structure with delimiters
  const goodPrompt = `
Analyze the following text and provide:
1. A one-sentence summary
2. Key positive points
3. Key negative points
4. Overall sentiment

Text to analyze:
"""
The company reported strong Q4 earnings with revenue up 25% YoY. 
However, the CEO announced layoffs affecting 10% of workforce. 
Stock price dropped 5% on the news despite positive earnings.
"""

Provide your analysis in this format:
Summary: [your summary]
Positive: [bullet points]
Negative: [bullet points]
Sentiment: [positive/negative/mixed]
`;

  console.log('Structured Prompt with Delimiters:');
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: goodPrompt }],
    temperature: 0,
  });

  console.log(completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// TECHNIQUE 4: Output Formatting (JSON)
// ============================================

async function jsonOutputExample() {
  console.log('📋 STRUCTURED JSON OUTPUT\n');

  const prompt = `Extract information from this product review and return as JSON.

Review: "The Quantum Blender 3000 is amazing! It blends smoothies perfectly in under 30 seconds. A bit pricey at $299 but worth it for the quality. The noise level is surprisingly low. Highly recommend for health enthusiasts!"

Return a JSON object with these fields:
{
  "product_name": "extracted product name",
  "rating": estimated rating out of 5,
  "pros": ["array", "of", "positive", "points"],
  "cons": ["array", "of", "negative", "points"],
  "price": extracted price as number,
  "recommended": true or false,
  "target_audience": "who is this for"
}

JSON:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  console.log('Extracted JSON:');
  console.log(completion.choices[0]?.message.content);

  // Parse and validate
  try {
    const json = JSON.parse(completion.choices[0]?.message.content || '{}');
    console.log('\n✅ Valid JSON parsed:', json);
  } catch (error) {
    console.log('\n❌ Invalid JSON');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// TECHNIQUE 5: Claude-specific XML Tags
// ============================================

async function claudeXMLExample() {
  console.log('📝 CLAUDE XML TAGS TECHNIQUE\n');

  const prompt = `Please analyze this customer support conversation and categorize it.

<conversation>
Customer: My order #12345 hasn't arrived yet. It's been 2 weeks!
Agent: I apologize for the delay. Let me check the status.
Agent: I see the package is stuck in customs. We'll expedite it and offer a 20% refund.
Customer: That works, thank you for your help!
</conversation>

<instructions>
Provide your analysis in this format:

<analysis>
  <category>Choose: complaint, inquiry, praise, or mixed</category>
  <sentiment>Choose: positive, negative, or neutral</sentiment>
  <resolution>Was the issue resolved? yes/no</resolution>
  <summary>Brief summary in one sentence</summary>
</analysis>
</instructions>`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  console.log('Claude Response:');
  console.log(message.content[0]);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// TECHNIQUE 6: Instruction Hierarchy
// ============================================

async function instructionHierarchyExample() {
  console.log('📊 INSTRUCTION HIERARCHY\n');

  const prompt = `# TASK
You are a code reviewer. Review the following Python code.

# CODE TO REVIEW
\`\`\`python
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total = total + num
    return total / len(numbers)
\`\`\`

# REVIEW CRITERIA
1. Code correctness
2. Edge cases handling
3. Performance considerations
4. Code style and readability

# OUTPUT FORMAT
For each criterion, provide:
- Status: ✅ Pass or ❌ Fail
- Explanation: Brief note
- Suggestion: Improvement if needed

# ADDITIONAL REQUIREMENTS
- Be constructive and specific
- Provide code examples for suggestions
- Rate overall quality: 1-10`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  console.log('Code Review:');
  console.log(completion.choices[0]?.message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// TECHNIQUE 7: Negative Prompting
// ============================================

async function negativePromptingExample() {
  console.log('🚫 NEGATIVE PROMPTING (What NOT to do)\n');

  const scenarios = [
    {
      name: 'Without negative instructions',
      prompt: 'Explain how to make a website secure.',
    },
    {
      name: 'With negative instructions',
      prompt: `Explain how to make a website secure.

IMPORTANT CONSTRAINTS:
- Do NOT mention specific product names or vendors
- Do NOT provide code examples (just concepts)
- Do NOT make it overly technical
- Do NOT exceed 100 words`,
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n📝 ${scenario.name}:\n`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: scenario.prompt }],
    });

    console.log(completion.choices[0]?.message.content);
    console.log('\n' + '-'.repeat(80));

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 ADVANCED PROMPT ENGINEERING TECHNIQUES\n');
  console.log('='.repeat(80) + '\n');

  await zeroShotExample();
//   await fewShotExample();
//   await rolePromptingExample();
//   await delimiterExample();
//   await jsonOutputExample();
//   await claudeXMLExample();
//   await instructionHierarchyExample();
//   await negativePromptingExample();

  console.log('\n✅ All examples completed!');
}

main().catch(console.error);
