import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const prompt = "Write a creative story about a robot learning to cook.";

async function testTemperature() {
  console.log('🌡️  Testing Temperature Effects\n');
  
  const temperatures = [0.0, 0.5, 1.0, 1.5, 2.0];
  
  for (const temp of temperatures) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: temp,
      max_tokens: 150,
    });
    
    console.log(`Temperature ${temp}:`);
    const choice = completion.choices[0];
    console.log(choice ? choice.message.content : 'No response');
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testTopP() {
  console.log('🎯 Testing Top_P (Nucleus Sampling)\n');
  
  const topPValues = [0.1, 0.5, 0.9, 1.0];
  
  for (const topP of topPValues) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      top_p: topP,
      temperature: 1.0,
      max_tokens: 150,
    });
    
    console.log(`Top_P ${topP}:`);
    const choice = completion.choices[0];
    console.log(choice ? choice.message.content : 'No response');
    console.log('\n' + '='.repeat(80) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testPenalties() {
  console.log('🚫 Testing Frequency & Presence Penalties\n');
  
  const testPrompt = "List 10 creative pizza toppings:";
  
  const scenarios = [
    { name: 'No Penalties', freq: 0, pres: 0 },
    { name: 'High Frequency Penalty', freq: 2.0, pres: 0 },
    { name: 'High Presence Penalty', freq: 0, pres: 2.0 },
  ];
  
  for (const scenario of scenarios) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: testPrompt }],
      frequency_penalty: scenario.freq,
      presence_penalty: scenario.pres,
      max_tokens: 200,
    });
    
    console.log(scenario.name);
    const choice = completion.choices[0];
    console.log(choice ? choice.message.content : 'No response');
    console.log('\n' + '='.repeat(80) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
    // uncomment the tests you want to run
//   await testTemperature();
//   await testTopP();
  await testPenalties();
}

main().catch(console.error);