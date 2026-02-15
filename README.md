# Learn AI — AI Orchestration Study Plan

A hands-on, 8-week study curriculum for learning AI orchestration, covering LLM fundamentals, prompt engineering, RAG systems, agents, and production deployment. Built with TypeScript.

## Structure

```
src/
  week1/   – LLM basics, streaming, token management, context management
  week2/   – (Upcoming) LangChain & orchestration frameworks
  week3/   – (Upcoming) Advanced orchestration & LangGraph
  week4/   – (Upcoming) Production deployment & MLOps
projects/
  chatbot/ – Conversational chatbot with context & token tracking
  rag-system/    – (Upcoming) RAG pipeline
  agent-platform/ – (Upcoming) Multi-agent orchestration
  capstone1/     – Capstone project
```

Each week has its own README with detailed daily instructions and exercises:

- [Week 1](./src/week1/README.md) – LLM Fundamentals & API Mastery
- [Week 2](./src/week2/README.md) – Advanced Prompt Engineering & Function Calling
- [Week 3](./src/week3/README.md) – Advanced Orchestration & LangGraph
- [Week 4](./src/week4/README.md) – Production Deployment & MLOps

## Getting Started

```bash
# Install dependencies
npm install

# Copy env and add your API keys
cp .env.example .env

# Run a week 1 exercise (e.g., hello LLM)
npm run week1:1
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `week1:1` | Hello LLM — first API call |
| `week1:2` | Parameter playground |
| `week1:3` | Streaming chat |
| `week1:3b` | Retry logic |
| `week1:4` | Token management |
| `week1:5` | Context manager |

## Tech Stack

- **Runtime:** Node.js + TypeScript (tsx)
- **LLM Providers:** OpenAI, Anthropic (Claude)
- **Tokenizer:** tiktoken

## Curriculum

See [base-curriculum.md](./base-curriculum.md) for the full 8-week study plan, resources, and project details.
