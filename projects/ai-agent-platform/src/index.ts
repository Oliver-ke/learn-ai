import * as readline from 'readline';
import { Agent } from './core/agent';
import { createPlanningAgent } from './agents/planning-agent';
import { createResearchAgent } from './agents/research-agent';
import { createCodingAgent } from './agents/coding-agent';
import { createGeneralAssistant } from './agents/general-assistant';

const AGENTS: Record<string, { label: string; factory: () => Agent }> = {
  planning: {
    label: 'Planning  — breaks goals into structured, trackable plans',
    factory: createPlanningAgent,
  },
  research: {
    label: 'Research  — searches the web and synthesizes information',
    factory: createResearchAgent,
  },
  coding: {
    label: 'Coding    — writes, runs, and explains code',
    factory: createCodingAgent,
  },
  general: {
    label: 'General   — all-purpose assistant with every tool available',
    factory: createGeneralAssistant,
  },
};

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n╔══════════════════════════════╗');
  console.log('║     AI Agent Platform CLI    ║');
  console.log('╚══════════════════════════════╝\n');
  console.log('Available agents:');
  Object.entries(AGENTS).forEach(([key, { label }], idx) => {
    console.log(`${idx + 1}. ${key.padEnd(10)} — ${label.split('—')[1]?.trim()}`);
  });
  console.log();

  const choice = (await prompt(rl, 'Select agent: ')).trim().toLowerCase();

  const choiceKey = Object.keys(AGENTS)[parseInt(choice) - 1] || choice;
  const entry = AGENTS[choiceKey];
  if (!entry) {
    console.error(`Unknown agent "${choice}". Choose from: ${Object.keys(AGENTS).join(', ')}`);
    rl.close();
    process.exit(1);
  }

  const agent = entry.factory();
  console.log(`\nStarted ${choiceKey} agent. Commands: "clear" (reset history), "exit" (quit)\n`);

  while (true) {
    const input = await prompt(rl, 'You: ');
    const trimmed = input.trim();

    if (!trimmed) continue;
    if (trimmed.toLowerCase() === 'exit') break;
    if (trimmed.toLowerCase() === 'clear') {
      agent.clearHistory();
      console.log('[history cleared]\n');
      continue;
    }

    try {
      process.stdout.write('Agent: ...thinking...\n');
      const response = await agent.chat(trimmed);
      console.log(response + '\n');
    } catch (error) {
      console.error(
        `[error] ${error instanceof Error ? error.message : 'Unknown error'}\n`,
      );
    }
  }

  console.log('Goodbye!');
  rl.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
