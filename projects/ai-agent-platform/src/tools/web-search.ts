import { Tool } from '../core/agent';

interface DuckDuckGoResponse {
  Abstract: string;
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  Answer: string;
  AnswerType: string;
  RelatedTopics: Array<{
    FirstURL?: string;
    Text?: string;
    Topics?: Array<{ Text?: string; FirstURL?: string }>;
  }>;
  Results: Array<{ FirstURL: string; Text: string }>;
}

export const webSearchTool: Tool = {
  name: 'web_search',
  description:
    'Search the web for information on a topic using DuckDuckGo Instant Answers. Returns a summary and related topics.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query',
      },
    },
    required: ['query'],
  },
  execute: async (query: string): Promise<string> => {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
      const response = await fetch(url);

      if (!response.ok) {
        return `Search failed with HTTP ${response.status}`;
      }

      const data = (await response.json()) as DuckDuckGoResponse;
      const parts: string[] = [];

      if (data.Answer) {
        parts.push(`Answer: ${data.Answer}`);
      }

      if (data.AbstractText) {
        const source = data.AbstractSource ? ` (Source: ${data.AbstractSource})` : '';
        parts.push(`Summary: ${data.AbstractText}${source}`);
        if (data.AbstractURL) parts.push(`URL: ${data.AbstractURL}`);
      }

      const topics = (data.RelatedTopics ?? []).filter(t => t.Text).slice(0, 5);
      if (topics.length > 0) {
        parts.push('\nRelated topics:');
        topics.forEach((t, i) => {
          if (t.Text) parts.push(`  ${i + 1}. ${t.Text}`);
        });
      }

      if (parts.length === 0) {
        return `No instant answer found for "${query}". The model's own knowledge can supplement this result.`;
      }

      return parts.join('\n');
    } catch (error) {
      return `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};
