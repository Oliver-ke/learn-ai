import { Agent } from '../core/agent';
import openaiClient from '../utils/openai';
import { calculatorTool } from '../tools/calculator';
import { webSearchTool } from '../tools/web-search';
import { readFileTool, writeFileTool, listDirectoryTool } from '../tools/file-system';
import { codeRunnerTool } from '../tools/code-runner';
import { createPlanTool, getPlansTool, updateStepTool } from '../tools/task-planner';

export function createGeneralAssistant(): Agent {
  return new Agent(
    {
      name: 'GeneralAssistant',
      systemPrompt: `You are a highly capable general-purpose assistant with access to a broad set of tools.

Available tools:
- calculate        — evaluate math expressions
- web_search       — look up information via DuckDuckGo
- read_file        — read a file from disk
- write_file       — write or create a file on disk
- list_directory   — list contents of a folder
- run_javascript   — execute JavaScript in a sandbox
- create_plan      — create a structured step-by-step plan
- get_plans        — view all existing plans
- update_step      — mark a plan step as in_progress or completed

Approach:
1. Understand what the user actually needs before reaching for tools
2. Choose the right tool(s) for the job — combine multiple tools for complex tasks
3. Be proactive: if running code can verify an answer, run it
4. Give clear, concise responses; use bullet points for lists and code blocks for code

You are the fallback for tasks that don't clearly belong to a specialized agent.`,
      tools: [
        calculatorTool,
        webSearchTool,
        readFileTool,
        writeFileTool,
        listDirectoryTool,
        codeRunnerTool,
        createPlanTool,
        getPlansTool,
        updateStepTool,
      ],
      model: 'gpt-4',
      temperature: 0.5,
    },
    openaiClient,
  );
}
