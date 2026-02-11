# Week 2: Advanced Prompt Engineering & Function Calling

**Target Outcome:** Master prompt engineering techniques and build AI agents that can interact with external tools and APIs

---

## 📅 Week Overview

```
Day 6 (Mon):   Advanced Prompt Engineering Techniques
Day 7 (Tue):   Chain-of-Thought & ReAct Prompting
Day 8 (Wed):   Function Calling Fundamentals
Day 9 (Thu):   Building Custom Tools & APIs
Day 10 (Fri):  Multi-Step Agent Workflows
Weekend:       Project - AI Agent with Multiple Tools
```

**Daily Commitment:** 4-5 hours  
**Weekend Project:** 12-16 hours

---

## Day 6 (Monday): Advanced Prompt Engineering Techniques

### 🎯 Day Goal
Master advanced prompting strategies including few-shot learning, role prompting, and output formatting

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Read: Comprehensive Guides**
   - [Prompt Engineering Guide](https://www.promptingguide.ai/) - Read sections on:
     - Zero-shot prompting
     - Few-shot prompting
     - Role prompting
     - Delimiters and formatting

2. **OpenAI Advanced Techniques**
   - [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
   - [GPT Best Practices](https://platform.openai.com/docs/guides/gpt-best-practices)

3. **Anthropic Claude Techniques**
   - [Prompt Engineering with Claude](https://docs.anthropic.com/claude/docs/prompt-engineering)
   - [Claude Prompt Library](https://docs.anthropic.com/claude/page/prompts)

**Video Learning (60 min):**
- [Andrew Ng - ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/) - Watch lessons 1-3
- YouTube: "Advanced prompt engineering techniques 2024"

**Key Concepts to Master:**
- **Zero-shot:** No examples, just instructions
- **Few-shot:** Provide examples of desired behavior
- **Chain-of-thought:** Guide reasoning process
- **Role prompting:** Assign expertise/persona
- **Delimiters:** Use XML tags, triple quotes, etc.
- **Output formatting:** JSON, structured data

---

### Evening Session (2 hours)

**Build: Prompt Engineering Toolkit**

Create `src/week2/06-prompt-techniques.ts`:

```typescript
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
  console.log('\nResponse:', completion.choices[0].message.content);
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
  console.log('\nResponse:', completion.choices[0].message.content);
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
      user: 'Explain quantum computing.'
    },
    {
      name: 'Expert Physicist',
      system: 'You are a Nobel Prize-winning physicist specializing in quantum mechanics. Explain concepts with technical precision but clear analogies.',
      user: 'Explain quantum computing.'
    },
    {
      name: 'ELI5 Teacher',
      system: 'You are a elementary school teacher who excels at explaining complex topics to 5-year-olds using simple language and fun analogies.',
      user: 'Explain quantum computing.'
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n🎬 ${scenario.name}:`);
    console.log(`System: ${scenario.system}\n`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: scenario.system },
        { role: 'user', content: scenario.user }
      ],
      max_tokens: 150,
    });

    console.log('Response:', completion.choices[0].message.content);
    console.log('\n' + '-'.repeat(80));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  console.log(completion.choices[0].message.content);
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
  console.log(completion.choices[0].message.content);

  // Parse and validate
  try {
    const json = JSON.parse(completion.choices[0].message.content || '{}');
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
    messages: [{ role: 'user', content: prompt }]
  });

  console.log('Claude Response:');
  console.log(message.content[0].text);
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
  console.log(completion.choices[0].message.content);
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
      prompt: 'Explain how to make a website secure.'
    },
    {
      name: 'With negative instructions',
      prompt: `Explain how to make a website secure.

IMPORTANT CONSTRAINTS:
- Do NOT mention specific product names or vendors
- Do NOT provide code examples (just concepts)
- Do NOT make it overly technical
- Do NOT exceed 100 words`
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📝 ${scenario.name}:\n`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: scenario.prompt }],
    });

    console.log(completion.choices[0].message.content);
    console.log('\n' + '-'.repeat(80));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
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
  await fewShotExample();
  await rolePromptingExample();
  await delimiterExample();
  await jsonOutputExample();
  await claudeXMLExample();
  await instructionHierarchyExample();
  await negativePromptingExample();

  console.log('\n✅ All examples completed!');
}

main().catch(console.error);
```

**Practical Exercise:**

Create `src/week2/06-exercise.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * EXERCISE: Build a Product Review Analyzer
 * 
 * Requirements:
 * 1. Extract structured data from unstructured reviews
 * 2. Use few-shot examples for consistency
 * 3. Return JSON format
 * 4. Handle edge cases
 */

interface ReviewAnalysis {
  product: string;
  rating: number; // 1-5
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  targetAudience?: string;
}

async function analyzeReview(review: string): Promise<ReviewAnalysis> {
  const prompt = `You are an expert product review analyzer. Extract structured information from customer reviews.

EXAMPLES:

Review: "The AirPods Pro are fantastic! Sound quality is amazing and noise cancellation works perfectly. A bit expensive at $249 but worth every penny. Great for commuters!"
Analysis:
{
  "product": "AirPods Pro",
  "rating": 5,
  "sentiment": "positive",
  "pros": ["Amazing sound quality", "Perfect noise cancellation", "Good value"],
  "cons": ["Expensive"],
  "wouldRecommend": true,
  "targetAudience": "Commuters"
}

Review: "The laptop is okay. Screen is nice but battery life is terrible - only 3 hours. For $1200 I expected better. Maybe good for desktop replacement?"
Analysis:
{
  "product": "Laptop",
  "rating": 3,
  "sentiment": "mixed",
  "pros": ["Nice screen"],
  "cons": ["Terrible battery life", "Overpriced"],
  "wouldRecommend": false,
  "targetAudience": "Desktop replacement users"
}

NOW ANALYZE THIS REVIEW:

Review: "${review}"

Analysis (JSON only, no explanation):`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  const responseText = completion.choices[0].message.content || '{}';
  
  // Extract JSON if wrapped in markdown
  const jsonMatch = responseText.match(/```json\n(.*)\n```/s) || 
                    responseText.match(/```\n(.*)\n```/s);
  const jsonText = jsonMatch ? jsonMatch[1] : responseText;

  return JSON.parse(jsonText);
}

async function testReviewAnalyzer() {
  const testReviews = [
    "The Quantum Blender 3000 is a game changer! Blends anything in seconds. Yes, it's loud and costs $350, but the power and quality are unmatched. Perfect for smoothie lovers!",
    
    "Disappointed with the SmartWatch X. Battery dies in 6 hours, screen is dim, and it's bulky. Not worth $200. Maybe okay for basic fitness tracking if you charge it constantly.",
    
    "The book was interesting but felt repetitive. Some good insights on productivity but could have been half the length. Decent read for beginners in the field.",
  ];

  console.log('🧪 TESTING REVIEW ANALYZER\n');
  console.log('='.repeat(80) + '\n');

  for (const review of testReviews) {
    console.log('Review:', review);
    console.log('\nAnalysis:');
    
    try {
      const analysis = await analyzeReview(review);
      console.log(JSON.stringify(analysis, null, 2));
      
      console.log('\n✅ Successfully parsed');
    } catch (error) {
      console.log('\n❌ Failed to parse:', error);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testReviewAnalyzer().catch(console.error);
```

**Run the examples:**
```bash
npx ts-node src/week2/06-prompt-techniques.ts
npx ts-node src/week2/06-exercise.ts
```

---

### **📝 Day 6 Assignments**

1. **Prompt Collection:**
   - Create `docs/prompt-library.md`
   - Document 10+ prompts you create today
   - Categorize by technique used

2. **A/B Testing:**
   - Take 3 tasks (e.g., summarization, classification, extraction)
   - Test zero-shot vs few-shot
   - Document accuracy differences

3. **Template Building:**
   - Create reusable prompt templates for:
     - Product review analysis
     - Code review
     - Email classification
     - Content moderation

**✅ Day 6 Checklist:**
- [ ] Understand 7+ prompt engineering techniques
- [ ] Run all example code successfully
- [ ] Complete review analyzer exercise
- [ ] Build prompt library with 10+ examples
- [ ] Document best practices learned

---

## Day 7 (Tuesday): Chain-of-Thought & ReAct Prompting

### 🎯 Day Goal
Master advanced reasoning techniques that enable LLMs to solve complex problems step-by-step

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Research Papers (skim key sections):**
   - [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903) - Original paper
   - [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629)
   - [Tree of Thoughts](https://arxiv.org/abs/2305.10601) (advanced)

2. **Practical Guides:**
   - [Prompt Engineering Guide - CoT](https://www.promptingguide.ai/techniques/cot)
   - [OpenAI - Tactic: Instruct the model to work out its own solution](https://platform.openai.com/docs/guides/gpt-best-practices/strategy-give-gpts-time-to-think)

3. **Video Learning:**
   - Search YouTube: "Chain of thought prompting explained"
   - "ReAct prompting tutorial"

**Key Concepts:**
- **Chain-of-Thought (CoT):** Guide model through reasoning steps
- **Zero-shot CoT:** Just add "Let's think step by step"
- **Few-shot CoT:** Provide examples with reasoning
- **ReAct:** Reason (thoughts) + Act (actions) in a loop
- **Self-Consistency:** Generate multiple reasoning paths

---

### Evening Session (2 hours)

**Build: Chain-of-Thought & ReAct Implementations**

Create `src/week2/07-cot-react.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// CHAIN-OF-THOUGHT (CoT) EXAMPLES
// ============================================

async function standardPrompting() {
  console.log('📝 STANDARD PROMPTING (No CoT)\n');

  const problem = `A store has 12 apples. They sell 5 apples and then receive a shipment of 3 times the amount they sold. How many apples do they have now?`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: problem + '\n\nAnswer:' }
    ],
    temperature: 0,
  });

  console.log('Problem:', problem);
  console.log('\nResponse:', completion.choices[0].message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function zeroShotCoT() {
  console.log('🧠 ZERO-SHOT CHAIN-OF-THOUGHT\n');

  const problem = `A store has 12 apples. They sell 5 apples and then receive a shipment of 3 times the amount they sold. How many apples do they have now?`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { 
        role: 'user', 
        content: problem + '\n\nLet\'s think step by step:' 
      }
    ],
    temperature: 0,
  });

  console.log('Problem:', problem);
  console.log('\nResponse:', completion.choices[0].message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function fewShotCoT() {
  console.log('🎯 FEW-SHOT CHAIN-OF-THOUGHT\n');

  const prompt = `Solve these math word problems by thinking step by step.

Example 1:
Problem: A baker made 24 cookies. He sold 8 and then made 12 more. How many cookies does he have?
Reasoning:
1. Started with: 24 cookies
2. After selling 8: 24 - 8 = 16 cookies
3. After making 12 more: 16 + 12 = 28 cookies
Answer: 28 cookies

Example 2:
Problem: Sarah has $50. She buys 2 books for $12 each. How much money does she have left?
Reasoning:
1. Started with: $50
2. Cost of 2 books: 2 × $12 = $24
3. Money left: $50 - $24 = $26
Answer: $26

Now solve this problem:
Problem: A store has 12 apples. They sell 5 apples and then receive a shipment of 3 times the amount they sold. How many apples do they have now?
Reasoning:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  console.log('Response:', completion.choices[0].message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// SELF-CONSISTENCY CoT
// ============================================

async function selfConsistencyCoT() {
  console.log('🔄 SELF-CONSISTENCY CoT (Multiple Reasoning Paths)\n');

  const problem = `If there are 3 cars in the parking lot and 2 more cars arrive, how many cars are in the parking lot now? Each car has 4 wheels. How many wheels are there in total?`;

  const prompt = problem + '\n\nLet\'s think step by step:';

  // Generate multiple reasoning paths
  const numPaths = 5;
  const answers: string[] = [];

  console.log(`Generating ${numPaths} reasoning paths...\n`);

  for (let i = 0; i < numPaths; i++) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, // Higher temperature for diversity
    });

    const response = completion.choices[0].message.content || '';
    console.log(`Path ${i + 1}:`);
    console.log(response);
    console.log('\n' + '-'.repeat(80) + '\n');

    // Extract final answer
    const answerMatch = response.match(/(\d+)\s*wheels?/i);
    if (answerMatch) {
      answers.push(answerMatch[1]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Find most common answer
  const answerCounts = answers.reduce((acc, ans) => {
    acc[ans] = (acc[ans] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommon = Object.entries(answerCounts)
    .sort((a, b) => b[1] - a[1])[0];

  console.log('📊 Answer Distribution:', answerCounts);
  console.log(`✅ Most Consistent Answer: ${mostCommon[0]} wheels (${mostCommon[1]}/${numPaths} paths)`);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// ReAct PROMPTING
// ============================================

async function reactPrompting() {
  console.log('🎬 ReAct PROMPTING (Reasoning + Acting)\n');

  const prompt = `You are an AI assistant that can reason and take actions. Use this format:

Thought: [Your reasoning about what to do next]
Action: [The action to take - one of: Search, Calculate, Finish]
Action Input: [Input for the action]
Observation: [Result of the action]
... (repeat Thought/Action/Observation as needed)
Thought: [Final reasoning]
Action: Finish
Action Input: [Final answer]

Available actions:
- Search: Search for information (simulate with your knowledge)
- Calculate: Perform a calculation
- Finish: Provide the final answer

Question: What is the square root of the sum of 144 and 256?

Let's begin:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 500,
  });

  console.log(completion.choices[0].message.content);
  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// ReAct with actual tools (simulated)
// ============================================

interface ReActStep {
  thought: string;
  action: string;
  actionInput: string;
  observation?: string;
}

class ReActAgent {
  private steps: ReActStep[] = [];

  constructor(private openai: OpenAI) {}

  // Simulated tools
  async search(query: string): Promise<string> {
    console.log(`🔍 Searching for: "${query}"`);
    // Simulate search with GPT
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Provide a brief, factual answer to: ${query}`
      }],
      max_tokens: 100,
    });
    return completion.choices[0].message.content || 'No results found';
  }

  async calculate(expression: string): Promise<string> {
    console.log(`🧮 Calculating: ${expression}`);
    try {
      // Simple eval for demonstration (use math.js in production!)
      const result = eval(expression);
      return `${result}`;
    } catch (error) {
      return 'Error in calculation';
    }
  }

  async solve(question: string): Promise<string> {
    console.log(`\n❓ Question: ${question}\n`);

    let iteration = 0;
    const maxIterations = 5;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n--- Iteration ${iteration} ---\n`);

      // Build conversation history
      let history = `Question: ${question}\n\n`;
      
      for (const step of this.steps) {
        history += `Thought: ${step.thought}\n`;
        history += `Action: ${step.action}\n`;
        history += `Action Input: ${step.actionInput}\n`;
        if (step.observation) {
          history += `Observation: ${step.observation}\n\n`;
        }
      }

      // Get next step from model
      const prompt = `${history}What should you do next? Respond in this format:
Thought: [your reasoning]
Action: [Search, Calculate, or Finish]
Action Input: [input for the action]`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that uses tools to answer questions. Think step by step and use the tools when needed.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
      });

      const response = completion.choices[0].message.content || '';
      
      // Parse response
      const thoughtMatch = response.match(/Thought: (.+)/);
      const actionMatch = response.match(/Action: (.+)/);
      const inputMatch = response.match(/Action Input: (.+)/);

      if (!thoughtMatch || !actionMatch || !inputMatch) {
        console.log('❌ Failed to parse response');
        break;
      }

      const step: ReActStep = {
        thought: thoughtMatch[1].trim(),
        action: actionMatch[1].trim(),
        actionInput: inputMatch[1].trim(),
      };

      console.log(`💭 Thought: ${step.thought}`);
      console.log(`🎯 Action: ${step.action}`);
      console.log(`📥 Input: ${step.actionInput}`);

      // Execute action
      if (step.action.toLowerCase().includes('finish')) {
        console.log(`\n✅ Final Answer: ${step.actionInput}\n`);
        return step.actionInput;
      } else if (step.action.toLowerCase().includes('search')) {
        step.observation = await this.search(step.actionInput);
        console.log(`👁️  Observation: ${step.observation}`);
      } else if (step.action.toLowerCase().includes('calculate')) {
        step.observation = await this.calculate(step.actionInput);
        console.log(`👁️  Observation: ${step.observation}`);
      }

      this.steps.push(step);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return 'Maximum iterations reached';
  }
}

async function testReActAgent() {
  console.log('🤖 ReAct AGENT WITH TOOLS\n');
  console.log('='.repeat(80));

  const agent = new ReActAgent(openai);

  const questions = [
    'What is the population of Tokyo multiplied by 2?',
    // 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
  ];

  for (const question of questions) {
    const answer = await agent.solve(question);
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 CHAIN-OF-THOUGHT & ReAct PROMPTING\n');
  console.log('='.repeat(80) + '\n');

  await standardPrompting();
  await zeroShotCoT();
  await fewShotCoT();
  // await selfConsistencyCoT(); // Uses more tokens
  await reactPrompting();
  await testReActAgent();

  console.log('\n✅ All examples completed!');
}

main().catch(console.error);
```

**Practical Exercise: Build a Math Word Problem Solver**

Create `src/week2/07-exercise.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * EXERCISE: Math Word Problem Solver using CoT
 */

async function solveMathProblem(problem: string): Promise<{
  reasoning: string;
  answer: number | string;
}> {
  const prompt = `Solve this math word problem step by step.

Problem: ${problem}

Instructions:
1. Break down the problem into steps
2. Show all calculations
3. Provide the final answer

Solution:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  const response = completion.choices[0].message.content || '';
  
  // Extract numerical answer
  const answerMatch = response.match(/(?:answer|result):\s*(\d+(?:\.\d+)?)/i);
  const answer = answerMatch ? parseFloat(answerMatch[1]) : response;

  return {
    reasoning: response,
    answer: answer
  };
}

async function testProblems() {
  const problems = [
    "A train travels 60 miles per hour for 2.5 hours. How far does it travel?",
    "If eggs cost $3 per dozen and you buy 30 eggs, how much do you pay?",
    "A rectangle has length 12 cm and width 5 cm. What is its area and perimeter?",
  ];

  for (const problem of problems) {
    console.log('\n' + '='.repeat(80));
    console.log('Problem:', problem);
    console.log('='.repeat(80) + '\n');

    const solution = await solveMathProblem(problem);
    console.log(solution.reasoning);
    console.log('\n📊 Extracted Answer:', solution.answer);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testProblems().catch(console.error);
```

**✅ Day 7 Checklist:**
- [ ] Understand CoT prompting (zero-shot and few-shot)
- [ ] Implement ReAct pattern
- [ ] Build math problem solver
- [ ] Test self-consistency approach
- [ ] Document when to use each technique

---

## Day 8 (Wednesday): Function Calling Fundamentals

### 🎯 Day Goal
Master OpenAI function calling to enable AI to interact with external tools and APIs

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Official Documentation:**
   - [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
   - [Function Calling Examples](https://cookbook.openai.com/examples/how_to_call_functions_with_chat_models)
   - [JSON Schema Reference](https://json-schema.org/learn/getting-started-step-by-step)

2. **Anthropic Tool Use:**
   - [Claude Tool Use Documentation](https://docs.anthropic.com/claude/docs/tool-use)

3. **Video Learning:**
   - Search YouTube: "OpenAI function calling tutorial"
   - "Building AI agents with function calling"

**Key Concepts:**
- Function declarations and JSON Schema
- Automatic function call detection
- Parallel function calling
- Tool choice: `auto`, `none`, specific function
- Response parsing and execution

---

### Evening Session (2 hours)

**Build: Function Calling System**

Create `src/week2/08-function-calling.ts`:

```typescript
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

  console.log('User:', messages[0].content);

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

    console.log('🤖 Final Response:', secondResponse.choices[0].message.content);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  console.log('🚀 FUNCTION CALLING EXAMPLES\n');
  console.log('='.repeat(80) + '\n');

  await simpleFunctionCalling();
  await multipleFunctionCalling();
  await parallelFunctionCalling();

  console.log('\n✅ All examples completed!');
}

main().catch(console.error);
```

**Run the examples:**
```bash
npx ts-node src/week2/08-function-calling.ts
```

**✅ Day 8 Checklist:**
- [ ] Understand function calling mechanics
- [ ] Define functions with JSON Schema
- [ ] Implement function execution
- [ ] Handle parallel function calls
- [ ] Build multi-function agent

---
# Week 2 Continued: Days 9-10 & Weekend Project

---

## Day 9 (Thursday): Building Custom Tools & APIs

### 🎯 Day Goal
Create reusable tools and integrate real APIs into your AI agents

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **API Integration Patterns:**
   - [Best Practices for API Integration](https://restfulapi.net/)
   - Study popular APIs: Weather, Database, Email, Search
   - Error handling in API calls

2. **Tool Design Principles:**
   - Single responsibility per tool
   - Clear parameter definitions
   - Robust error handling
   - Rate limiting considerations

3. **Video Learning:**
   - Search YouTube: "Building tools for AI agents"
   - "API integration best practices"

**Popular APIs to Study:**
- **OpenWeatherMap** - Weather data
- **Google Custom Search** - Web search
- **SendGrid** - Email sending
- **Stripe** - Payment processing
- **GitHub API** - Code repository management

---

### Evening Session (2 hours)

**Build: Comprehensive Tool Library**

Create `src/week2/09-tool-library.ts`:

```typescript
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

async function webSearch(query: string, numResults: number = 5): Promise<string> {
  try {
    // Using DuckDuckGo Instant Answer API (free, no key needed)
    // For production, use Google Custom Search API
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      },
      timeout: 5000
    });

    const results: SearchResult[] = [];
    
    // Extract abstract
    if (response.data.AbstractText) {
      results.push({
        title: response.data.Heading || query,
        link: response.data.AbstractURL || '',
        snippet: response.data.AbstractText
      });
    }

    // Extract related topics
    if (response.data.RelatedTopics) {
      response.data.RelatedTopics.slice(0, numResults - 1).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || '',
            link: topic.FirstURL,
            snippet: topic.Text
          });
        }
      });
    }

    return JSON.stringify({
      query,
      results,
      count: results.length
    });
  } catch (error: any) {
    return JSON.stringify({
      error: 'Search failed',
      message: error.message
    });
  }
}

const webSearchTool = {
  name: 'web_search',
  description: 'Search the web for current information. Use this when you need up-to-date facts, news, or information not in your training data.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      },
      numResults: {
        type: 'number',
        description: 'Number of results to return (default: 5)',
        default: 5
      }
    },
    required: ['query']
  }
};

// ============================================
// TOOL 2: Weather API (OpenWeatherMap)
// ============================================

async function getWeather(location: string, units: string = 'metric'): Promise<string> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      return JSON.stringify({
        error: 'API key not configured',
        message: 'Set OPENWEATHER_API_KEY in .env file'
      });
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: apiKey,
        units: units
      },
      timeout: 5000
    });

    const data = response.data;
    
    return JSON.stringify({
      location: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      conditions: data.weather[0].description,
      wind_speed: data.wind.speed,
      units: units === 'metric' ? 'Celsius' : 'Fahrenheit'
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return JSON.stringify({ error: 'Location not found' });
    }
    return JSON.stringify({
      error: 'Weather API error',
      message: error.message
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
        description: 'City name or city, country code (e.g., "London,UK")'
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        description: 'Temperature units (metric for Celsius, imperial for Fahrenheit)',
        default: 'metric'
      }
    },
    required: ['location']
  }
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
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
      { id: '3', name: 'Carol White', email: 'carol@example.com', role: 'user' }
    ]);

    this.tables.set('orders', [
      { id: '101', user_id: '1', product: 'Laptop', amount: 1200, status: 'delivered' },
      { id: '102', user_id: '2', product: 'Mouse', amount: 25, status: 'pending' },
      { id: '103', user_id: '1', product: 'Keyboard', amount: 80, status: 'shipped' }
    ]);
  }

  query(table: string, filters?: Record<string, any>): DatabaseRecord[] {
    const records = this.tables.get(table) || [];
    
    if (!filters) {
      return records;
    }

    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        return record[key] === value;
      });
    });
  }
}

const db = new SimpleDatabase();

async function queryDatabase(
  table: string,
  filters?: Record<string, any>
): Promise<string> {
  try {
    const results = db.query(table, filters);
    return JSON.stringify({
      table,
      filters,
      count: results.length,
      results
    });
  } catch (error: any) {
    return JSON.stringify({
      error: 'Database query failed',
      message: error.message
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
        description: 'The database table to query'
      },
      filters: {
        type: 'object',
        description: 'Optional filters as key-value pairs (e.g., {"role": "admin"})',
        additionalProperties: true
      }
    },
    required: ['table']
  }
};

// ============================================
// TOOL 4: Email Sender
// ============================================

async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<string> {
  try {
    // Configure nodemailer (use environment variables in production)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
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
      message: error.message
    });
  }
}

const emailTool = {
  name: 'send_email',
  description: 'Send an email to a recipient. Use this for notifications, confirmations, or communication.',
  parameters: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient email address'
      },
      subject: {
        type: 'string',
        description: 'Email subject line'
      },
      body: {
        type: 'string',
        description: 'Email body text'
      }
    },
    required: ['to', 'subject', 'body']
  }
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
      formatted: `${expression} = ${result}`
    });
  } catch (error: any) {
    return JSON.stringify({
      error: 'Calculation failed',
      message: error.message,
      expression
    });
  }
}

const calculatorTool = {
  name: 'calculate',
  description: 'Perform mathematical calculations. Supports basic arithmetic and expressions.',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "(10 * 5) / 2")'
      }
    },
    required: ['expression']
  }
};

// ============================================
// TOOL 6: Code Executor (sandboxed)
// ============================================

async function executeCode(
  language: string,
  code: string
): Promise<string> {
  try {
    if (language !== 'javascript') {
      return JSON.stringify({
        error: 'Unsupported language',
        message: 'Only JavaScript is supported in this demo'
      });
    }

    // In production, use a proper sandbox like vm2 or isolated-vm
    // This is UNSAFE - for demo only
    
    let output = '';
    const customConsole = {
      log: (...args: any[]) => {
        output += args.join(' ') + '\n';
      }
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
      message: error.message
    });
  }
}

const codeExecutorTool = {
  name: 'execute_code',
  description: 'Execute code snippets in a sandboxed environment. Use for testing small code samples.',
  parameters: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        enum: ['javascript'],
        description: 'Programming language'
      },
      code: {
        type: 'string',
        description: 'Code to execute'
      }
    },
    required: ['language', 'code']
  }
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
        content: 'You are a helpful AI assistant with access to various tools. Use them when needed to help users.'
      },
      {
        role: 'user',
        content: userMessage
      }
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

      const responseMessage = response.choices[0].message;
      messages.push(responseMessage);

      // Check if function call is needed
      if (responseMessage.function_call) {
        const functionName = responseMessage.function_call.name;
        const functionArgs = JSON.parse(responseMessage.function_call.arguments);

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
          content: result
        });
      } else {
        // No more function calls, return final answer
        console.log(`🤖 Assistant: ${responseMessage.content}\n`);
        return responseMessage.content || '';
      }

      await new Promise(resolve => setTimeout(resolve, 500));
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
    
    "Find all admin users in the database and tell me their names",
    
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
```

**Install dependencies:**
```bash
npm install axios nodemailer
npm install -D @types/nodemailer
```

**Create `.env` additions:**
```bash
# Optional: OpenWeatherMap API (free tier available)
OPENWEATHER_API_KEY=your_key_here

# Optional: SMTP for email (use Ethereal for testing)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_user
SMTP_PASS=your_ethereal_pass
SMTP_FROM=noreply@example.com
```

---

### **Practical Exercise: Build Custom Tools**

Create `src/week2/09-custom-tools.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * EXERCISE: Build a Task Management System with Tools
 * 
 * Implement these tools:
 * 1. create_task - Add new task
 * 2. list_tasks - List all tasks (with optional filter)
 * 3. update_task - Update task status
 * 4. delete_task - Remove task
 * 5. search_tasks - Search by keyword
 */

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

class TaskManager {
  private tasks: Task[] = [];
  private nextId = 1;

  createTask(
    title: string,
    description: string,
    priority: Task['priority'] = 'medium',
    dueDate?: string
  ): string {
    const task: Task = {
      id: `task-${this.nextId++}`,
      title,
      description,
      status: 'todo',
      priority,
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined
    };

    this.tasks.push(task);

    return JSON.stringify({
      success: true,
      message: 'Task created successfully',
      task
    });
  }

  listTasks(status?: Task['status'], priority?: Task['priority']): string {
    let filtered = this.tasks;

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }

    if (priority) {
      filtered = filtered.filter(t => t.priority === priority);
    }

    return JSON.stringify({
      count: filtered.length,
      tasks: filtered
    });
  }

  updateTask(id: string, status: Task['status']): string {
    const task = this.tasks.find(t => t.id === id);

    if (!task) {
      return JSON.stringify({
        success: false,
        error: 'Task not found'
      });
    }

    task.status = status;

    return JSON.stringify({
      success: true,
      message: 'Task updated successfully',
      task
    });
  }

  deleteTask(id: string): string {
    const index = this.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return JSON.stringify({
        success: false,
        error: 'Task not found'
      });
    }

    const deleted = this.tasks.splice(index, 1)[0];

    return JSON.stringify({
      success: true,
      message: 'Task deleted successfully',
      task: deleted
    });
  }

  searchTasks(keyword: string): string {
    const results = this.tasks.filter(t =>
      t.title.toLowerCase().includes(keyword.toLowerCase()) ||
      t.description.toLowerCase().includes(keyword.toLowerCase())
    );

    return JSON.stringify({
      count: results.length,
      tasks: results
    });
  }
}

// Tool definitions
const taskTools = [
  {
    name: 'create_task',
    description: 'Create a new task in the task management system',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Task priority'
        },
        dueDate: {
          type: 'string',
          description: 'Due date in ISO format (optional)'
        }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'list_tasks',
    description: 'List all tasks, optionally filtered by status or priority',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['todo', 'in-progress', 'done'],
          description: 'Filter by status'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority'
        }
      }
    }
  },
  {
    name: 'update_task',
    description: 'Update the status of a task',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID' },
        status: {
          type: 'string',
          enum: ['todo', 'in-progress', 'done'],
          description: 'New status'
        }
      },
      required: ['id', 'status']
    }
  },
  {
    name: 'delete_task',
    description: 'Delete a task by ID',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Task ID to delete' }
      },
      required: ['id']
    }
  },
  {
    name: 'search_tasks',
    description: 'Search tasks by keyword in title or description',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Search keyword' }
      },
      required: ['keyword']
    }
  }
];

async function testTaskManagementAgent() {
  const taskManager = new TaskManager();
  
  const toolFunctions: Record<string, Function> = {
    create_task: (...args: any[]) => taskManager.createTask(...args),
    list_tasks: (...args: any[]) => taskManager.listTasks(...args),
    update_task: (...args: any[]) => taskManager.updateTask(...args),
    delete_task: (...args: any[]) => taskManager.deleteTask(...args),
    search_tasks: (...args: any[]) => taskManager.searchTasks(...args),
  };

  const queries = [
    "Create a high priority task called 'Finish AI bootcamp' with description 'Complete all week 2 exercises'",
    "Create another task called 'Buy groceries' with low priority",
    "Show me all my tasks",
    "Mark the AI bootcamp task as in-progress",
    "What tasks do I have in progress?",
  ];

  for (const query of queries) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`👤 User: ${query}`);
    console.log('='.repeat(80) + '\n');

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a task management assistant. Help users manage their tasks.' },
      { role: 'user', content: query }
    ];

    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      iterations++;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        functions: taskTools,
        function_call: 'auto',
      });

      const responseMessage = response.choices[0].message;
      messages.push(responseMessage);

      if (responseMessage.function_call) {
        const funcName = responseMessage.function_call.name;
        const funcArgs = JSON.parse(responseMessage.function_call.arguments);

        console.log(`🔧 ${funcName}(${JSON.stringify(funcArgs)})`);

        const result = toolFunctions[funcName](...Object.values(funcArgs));
        console.log(`📤 ${result}\n`);

        messages.push({
          role: 'function',
          name: funcName,
          content: result
        });
      } else {
        console.log(`🤖 ${responseMessage.content}\n`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

testTaskManagementAgent().catch(console.error);
```

**✅ Day 9 Checklist:**
- [ ] Build 6+ custom tools
- [ ] Integrate at least 1 real API
- [ ] Create tool registry system
- [ ] Build task management agent
- [ ] Handle errors gracefully
- [ ] Test tool agent with complex queries

---

## Day 10 (Friday): Multi-Step Agent Workflows

### 🎯 Day Goal
Build sophisticated agents that can plan, execute multi-step workflows, and handle complex tasks

---

### Morning Session (2.5 hours)

**Study Materials (90 min):**

1. **Agent Architecture Patterns:**
   - [LangChain Agent Types](https://python.langchain.com/docs/modules/agents/agent_types/)
   - [AutoGPT Architecture](https://github.com/Significant-Gravitas/AutoGPT) - Study the pattern
   - Planning and execution loops

2. **Advanced Concepts:**
   - Task decomposition
   - Sub-goal creation
   - Memory and state management
   - Error recovery strategies

3. **Video Learning:**
   - Search YouTube: "Building autonomous AI agents"
   - "Multi-step reasoning in LLMs"

**Key Patterns:**
- **ReAct Loop:** Observe → Think → Act → Repeat
- **Plan-and-Execute:** Plan all steps → Execute sequentially
- **Hierarchical Planning:** Break complex tasks into subtasks
- **Self-Correction:** Agent evaluates and improves its output

---

### Evening Session (2 hours)

**Build: Multi-Step Planning Agent**

Create `src/week2/10-planning-agent.ts`:

```typescript
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// PLANNING AGENT ARCHITECTURE
// ============================================

interface Plan {
  goal: string;
  steps: PlanStep[];
  currentStep: number;
  status: 'planning' | 'executing' | 'completed' | 'failed';
}

interface PlanStep {
  id: number;
  action: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

class PlanningAgent {
  private plan: Plan | null = null;
  private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(private openai: OpenAI) {}

  async createPlan(goal: string): Promise<Plan> {
    console.log(`\n📋 Creating plan for: "${goal}"\n`);

    const planningPrompt = `You are a planning AI. Break down the following goal into clear, actionable steps.

Goal: ${goal}

Create a detailed plan with 3-7 steps. Each step should be specific and achievable.

Respond in this JSON format:
{
  "steps": [
    {
      "id": 1,
      "action": "action_name",
      "description": "what to do"
    }
  ]
}

Available actions: search, calculate, create_content, review, finalize

JSON:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: planningPrompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const planData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

    const steps: PlanStep[] = planData.steps.map((step: any) => ({
      ...step,
      status: 'pending' as const
    }));

    this.plan = {
      goal,
      steps,
      currentStep: 0,
      status: 'executing'
    };

    console.log('✅ Plan created:\n');
    steps.forEach(step => {
      console.log(`   ${step.id}. ${step.description}`);
    });
    console.log('');

    return this.plan;
  }

  async executeStep(stepIndex: number): Promise<string> {
    if (!this.plan || stepIndex >= this.plan.steps.length) {
      throw new Error('Invalid step index or no plan');
    }

    const step = this.plan.steps[stepIndex];
    step.status = 'in-progress';

    console.log(`\n🔄 Executing Step ${step.id}: ${step.description}`);
    console.log(`   Action: ${step.action}\n`);

    const executionPrompt = `You are executing a step in a larger plan.

Overall Goal: ${this.plan.goal}

Current Step:
- Action: ${step.action}
- Description: ${step.description}

Previous Steps Completed:
${this.plan.steps.slice(0, stepIndex).map(s => 
  `${s.id}. ${s.description}\n   Result: ${s.result || 'N/A'}`
).join('\n')}

Execute this step and provide a detailed result. Be specific about what you accomplished.

Result:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: executionPrompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = response.choices[0].message.content || '';
    
    step.result = result;
    step.status = 'completed';

    console.log(`✅ Step ${step.id} completed`);
    console.log(`   Result: ${result.substring(0, 100)}...`);

    return result;
  }

  async executePlan(): Promise<void> {
    if (!this.plan) {
      throw new Error('No plan to execute');
    }

    console.log('\n🚀 Starting plan execution...\n');
    console.log('='.repeat(80));

    for (let i = 0; i < this.plan.steps.length; i++) {
      try {
        await this.executeStep(i);
        this.plan.currentStep = i + 1;
        
        // Brief pause between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`❌ Step ${i + 1} failed:`, error.message);
        this.plan.steps[i].status = 'failed';
        this.plan.steps[i].error = error.message;
        this.plan.status = 'failed';
        return;
      }
    }

    this.plan.status = 'completed';
    console.log('\n' + '='.repeat(80));
    console.log('✅ All steps completed successfully!\n');
  }

  async summarizeResults(): Promise<string> {
    if (!this.plan) {
      return 'No plan to summarize';
    }

    const summaryPrompt = `Summarize the results of this completed plan:

Goal: ${this.plan.goal}

Steps and Results:
${this.plan.steps.map(step => 
  `${step.id}. ${step.description}\n   Result: ${step.result || 'Not completed'}`
).join('\n\n')}

Provide a concise summary of what was accomplished and the overall outcome.

Summary:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: summaryPrompt }],
      temperature: 0.5,
    });

    const summary = response.choices[0].message.content || '';
    
    console.log('\n📊 PLAN SUMMARY\n');
    console.log(summary);
    console.log('');

    return summary;
  }

  getPlan(): Plan | null {
    return this.plan;
  }
}

// ============================================
// SELF-CORRECTING AGENT
// ============================================

class SelfCorrectingAgent {
  constructor(private openai: OpenAI) {}

  async solve(task: string, maxAttempts: number = 3): Promise<string> {
    console.log(`\n🎯 Task: ${task}\n`);
    console.log('='.repeat(80) + '\n');

    let attempt = 0;
    let solution = '';
    let feedback = '';

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`\n--- Attempt ${attempt} ---\n`);

      // Generate solution
      const solvePrompt = attempt === 1 
        ? `Task: ${task}\n\nProvide a solution:`
        : `Task: ${task}\n\nPrevious attempt:\n${solution}\n\nFeedback:\n${feedback}\n\nProvide an improved solution:`;

      const solveResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: solvePrompt }],
        temperature: 0.7,
      });

      solution = solveResponse.choices[0].message.content || '';
      console.log('💡 Solution:');
      console.log(solution);
      console.log('');

      // Evaluate solution
      const evaluatePrompt = `Evaluate this solution to the task:

Task: ${task}

Solution: ${solution}

Provide:
1. Score (0-10)
2. What's good
3. What needs improvement
4. Whether this is acceptable (yes/no)

Evaluation:`;

      const evalResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: evaluatePrompt }],
        temperature: 0.3,
      });

      const evaluation = evalResponse.choices[0].message.content || '';
      console.log('📝 Evaluation:');
      console.log(evaluation);

      // Check if acceptable
      if (evaluation.toLowerCase().includes('acceptable: yes') || 
          evaluation.includes('Score: 10') ||
          evaluation.includes('Score: 9')) {
        console.log('\n✅ Solution accepted!\n');
        return solution;
      }

      feedback = evaluation;
      console.log('\n🔄 Refining solution...\n');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n⚠️  Max attempts reached. Using best solution.\n');
    return solution;
  }
}

// ============================================
// HIERARCHICAL TASK DECOMPOSITION
// ============================================

interface TaskNode {
  id: string;
  description: string;
  subtasks: TaskNode[];
  status: 'pending' | 'in-progress' | 'completed';
  result?: string;
}

class HierarchicalAgent {
  constructor(private openai: OpenAI) {}

  async decompose(task: string, depth: number = 0, maxDepth: number = 2): Promise<TaskNode> {
    const taskId = `task-${Date.now()}-${Math.random()}`;
    
    if (depth >= maxDepth) {
      return {
        id: taskId,
        description: task,
        subtasks: [],
        status: 'pending'
      };
    }

    console.log(`${'  '.repeat(depth)}📌 Decomposing: ${task}`);

    const decomposePrompt = `Break down this task into 2-4 smaller, concrete subtasks:

Task: ${task}

Respond with a JSON array of subtask descriptions:
["subtask 1", "subtask 2", "subtask 3"]

If the task is already atomic and cannot be broken down further, respond with an empty array: []

JSON:`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: decomposePrompt }],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const subtaskDescriptions: string[] = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');

    const subtasks: TaskNode[] = [];

    if (subtaskDescriptions.length > 0) {
      for (const subtask of subtaskDescriptions) {
        const subtaskNode = await this.decompose(subtask, depth + 1, maxDepth);
        subtasks.push(subtaskNode);
      }
    }

    return {
      id: taskId,
      description: task,
      subtasks,
      status: 'pending'
    };
  }

  async executeTaskTree(taskNode: TaskNode): Promise<void> {
    console.log(`\n▶️  ${taskNode.description}`);

    if (taskNode.subtasks.length === 0) {
      // Leaf node - execute
      taskNode.status = 'in-progress';
      
      const executePrompt = `Execute this task and provide the result:\n\n${taskNode.description}\n\nResult:`;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: executePrompt }],
        max_tokens: 300,
      });

      taskNode.result = response.choices[0].message.content || '';
      taskNode.status = 'completed';
      
      console.log(`✅ Completed: ${taskNode.result?.substring(0, 80)}...`);
    } else {
      // Parent node - execute children first
      taskNode.status = 'in-progress';
      
      for (const subtask of taskNode.subtasks) {
        await this.executeTaskTree(subtask);
      }

      // Aggregate results
      const childResults = taskNode.subtasks
        .map(st => `- ${st.description}: ${st.result}`)
        .join('\n');

      taskNode.result = `Completed all subtasks:\n${childResults}`;
      taskNode.status = 'completed';
      
      console.log(`✅ Aggregated: ${taskNode.description}`);
    }
  }
}

// ============================================
// DEMO: Test All Agent Types
// ============================================

async function testPlanningAgent() {
  console.log('\n🧠 PLANNING AGENT TEST\n');
  console.log('='.repeat(80));

  const agent = new PlanningAgent(openai);
  
  await agent.createPlan('Write and publish a blog post about AI orchestration');
  await agent.executePlan();
  await agent.summarizeResults();
}

async function testSelfCorrectingAgent() {
  console.log('\n🔄 SELF-CORRECTING AGENT TEST\n');
  console.log('='.repeat(80));

  const agent = new SelfCorrectingAgent(openai);
  
  await agent.solve('Write a haiku about programming that is both technically accurate and poetic');
}

async function testHierarchicalAgent() {
  console.log('\n🌳 HIERARCHICAL AGENT TEST\n');
  console.log('='.repeat(80) + '\n');

  const agent = new HierarchicalAgent(openai);
  
  const taskTree = await agent.decompose(
    'Plan and execute a successful product launch',
    0,
    2
  );

  console.log('\n📊 Task Decomposition Complete\n');
  console.log('='.repeat(80));

  await agent.executeTaskTree(taskTree);

  console.log('\n='.repeat(80));
  console.log('✅ Hierarchical execution complete\n');
}

// ============================================
// Main execution
// ============================================

async function main() {
  // Choose which agent to test
  
  await testPlanningAgent();
  
  // await testSelfCorrectingAgent();
  
  // await testHierarchicalAgent();
  
  console.log('\n✅ Agent workflow demos completed!');
}

main().catch(console.error);
```

**✅ Day 10 Checklist:**
- [ ] Understand planning agent architecture
- [ ] Build multi-step plan execution
- [ ] Implement self-correction loop
- [ ] Create hierarchical task decomposition
- [ ] Test with complex multi-step tasks

---

## Weekend Project: Advanced AI Agent Platform

### 🎯 Project Goal
Build a comprehensive AI agent platform that combines all Week 2 concepts

**Time Allocation:** 12-16 hours total
- Saturday: 6-8 hours (Core functionality)
- Sunday: 6-8 hours (Advanced features + documentation)

---

### **Project Specifications**

Create `projects/ai-agent-platform/`:

```
ai-agent-platform/
├── src/
│   ├── core/
│   │   ├── agent.ts           # Main agent orchestrator
│   │   ├── tools.ts           # Tool registry
│   │   └── memory.ts          # Conversation memory
│   ├── tools/
│   │   ├── search.ts          # Web search tool
│   │   ├── calculator.ts      # Math calculations
│   │   ├── database.ts        # Data queries
│   │   ├── email.ts           # Email sender
│   │   └── codeExecutor.ts    # Code execution
│   ├── agents/
│   │   ├── planning.ts        # Planning agent
│   │   ├── research.ts        # Research agent
│   │   └── coding.ts          # Coding assistant
│   ├── ui/
│   │   ├── cli.ts             # Command-line interface
│   │   └── server.ts          # Express API server
│   └── index.ts
├── tests/
├── data/
├── docs/
├── package.json
└── README.md
```

**Core Features to Implement:**

1. **Multi-Agent System**
   - Planning Agent
   - Research Agent
   - Coding Agent
   - General Assistant

2. **Tool Ecosystem**
   - Minimum 5 integrated tools
   - Custom tool registration
   - Error handling and retries

3. **Memory & Context**
   - Conversation history
   - Long-term memory with summarization
   - Context-aware responses

4. **Planning & Execution**
   - Multi-step plan creation
   - Progress tracking
   - Sub-goal decomposition

5. **User Interfaces**
   - CLI for interactive chat
   - REST API for programmatic access
   - Web dashboard (optional, bonus)

---

### **Implementation Guide**

**Saturday Morning (3-4 hours): Core Agent & Tools**

Create `projects/ai-agent-platform/src/core/agent.ts`:

```typescript
import OpenAI from 'openai';

export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (...args: any[]) => Promise<string>;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: Tool[];
  model?: string;
  temperature?: number;
}

export class Agent {
  private tools: Map<string, Tool> = new Map();
  private conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  constructor(
    private config: AgentConfig,
    private openai: OpenAI
  ) {
    // Register tools
    config.tools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // Add system message
    this.conversationHistory.push({
      role: 'system',
      content: config.systemPrompt
    });
  }

  async chat(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations) {
      iterations++;

      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: this.conversationHistory,
        functions: Array.from(this.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        })),
        function_call: 'auto',
        temperature: this.config.temperature || 0.7,
      });

      const message = response.choices[0].message;
      this.conversationHistory.push(message);

      if (message.function_call) {
        // Execute tool
        const tool = this.tools.get(message.function_call.name);
        if (!tool) {
          throw new Error(`Tool ${message.function_call.name} not found`);
        }

        const args = JSON.parse(message.function_call.arguments);
        const result = await tool.execute(...Object.values(args));

        this.conversationHistory.push({
          role: 'function',
          name: message.function_call.name,
          content: result
        });
      } else {
        // Return final response
        return message.content || '';
      }
    }

    throw new Error('Max iterations reached');
  }

  getHistory(): OpenAI.Chat.ChatCompletionMessageParam[] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    const systemMsg = this.conversationHistory[0];
    this.conversationHistory = [systemMsg];
  }
}
```

**Continue building tools, memory system, and UI...**

---

### **Weekend Deliverables**

**✅ Minimum Requirements:**
- [ ] Multi-agent system with 3+ specialized agents
- [ ] 5+ working tools
- [ ] Memory and context management
- [ ] CLI interface
- [ ] Planning and execution workflow
- [ ] Comprehensive README with examples
- [ ] Test suite for core functionality

**🌟 Bonus Features:**
- [ ] REST API server
- [ ] React web dashboard
- [ ] Streaming responses in UI
- [ ] Agent collaboration (agents calling other agents)
- [ ] Persistent storage (SQLite/PostgreSQL)
- [ ] Rate limiting and cost tracking
- [ ] Deployment to AWS Lambda

---

### **Testing Scenarios**

Test your platform with these complex tasks:

1. **Research Task:**
   - "Research the top 3 programming languages in 2024, summarize their strengths, and recommend one for building web applications"

2. **Planning Task:**
   - "Plan a week-long trip to Japan including flights, hotels, activities, and budget"

3. **Coding Task:**
   - "Build a REST API endpoint that accepts user data, validates it, stores in database, and sends confirmation email"

4. **Data Analysis:**
   - "Analyze the sales data, calculate trends, and create a summary report with recommendations"

---

### **Documentation Requirements**

Create comprehensive documentation:

**README.md:**
```markdown
# AI Agent Platform

## Features
- Multi-agent orchestration
- 5+ integrated tools
- Memory management
- Planning & execution

## Installation
...

## Usage Examples
...

## Architecture
...

## API Reference
...
```

**Blog Post:**
Write 1000+ words: "Building an AI Agent Platform: Week 2 Journey"

---

## 🎯 Week 2 Summary & Assessment

### **Skills Acquired:**
✅ Advanced prompt engineering (7+ techniques)
✅ Chain-of-thought & ReAct prompting  
✅ Function calling mastery  
✅ Custom tool development  
✅ Multi-step agent workflows  
✅ Planning and execution patterns  
✅ Self-correcting agents  
✅ Hierarchical task decomposition

### **Deliverables:**
1. ✅ Review analyzer (Day 6)
2. ✅ Math problem solver (Day 7)
3. ✅ Function calling examples (Day 8)
4. ✅ Tool library (Day 9)
5. ✅ Planning agents (Day 10)
6. ✅ AI Agent Platform (Weekend)

### **Self-Assessment Questions:**

1. Can you explain when to use zero-shot vs few-shot prompting?
2. Can you implement ReAct pattern from scratch?
3. Can you design and implement custom tools?
4. Can you build a multi-step planning agent?
5. Can you handle errors and retries in agent workflows?
6. Can you optimize prompts for cost and accuracy?

**If yes to all: Ready for Week 3 (LangChain & RAG systems)!**

---

### **Cost Tracking**

Week 2 API usage estimate:
- OpenAI GPT-4: ~100K tokens ≈ $3-5
- OpenAI GPT-3.5: ~500K tokens ≈ $1-2
- **Total:** ~$5-10 for all exercises

Track actual costs in your spreadsheet!

---

### **Next Steps**

**Before Week 3:**
- [ ] Review all Week 2 code
- [ ] Ensure AI Agent Platform works end-to-end
- [ ] Write blog post documenting learnings
- [ ] Update GitHub with all projects
- [ ] Complete self-assessment
- [ ] Set up LangChain environment

**Week 3 Preview:**
- LangChain.js fundamentals
- Building RAG systems
- Vector databases (Pinecone, Chroma)
- Document loaders and text splitters
- Advanced memory patterns