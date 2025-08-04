import OpenAI from 'openai';
import { AgentConfig, AgentResult } from './types';

export class Agent {
  private config: AgentConfig;
  private openai: OpenAI;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async run(input: string): Promise<AgentResult> {
    try {
      const requestParams: any = {
        model: this.config.model,
        messages: [
          { role: 'system', content: this.config.instructions },
          { role: 'user', content: input }
        ],
      };

      if (this.config.tools && this.config.tools.length > 0) {
        requestParams.tools = this.config.tools;
        if (this.config.modelSettings?.toolChoice) {
          requestParams.tool_choice = this.config.modelSettings.toolChoice === 'auto' ? 'auto' : 'required';
        }
      }

      const completion = await this.openai.chat.completions.create(requestParams);

      const message = completion.choices[0]?.message;
      
      if (message?.tool_calls && message.tool_calls.length > 0) {
        // Handle tool calls
        const toolCall = message.tool_calls[0];
        if (toolCall.function.name === 'web_search') {
          const args = JSON.parse(toolCall.function.arguments);
          const searchResult = await this.performWebSearch(args.query);
          return { finalOutput: searchResult };
        }
        if (toolCall.function.name === 'send_email') {
          const args = JSON.parse(toolCall.function.arguments);
          // Import dynamically to avoid circular dependency
          const { sendEmail } = await import('./emailAgent');
          const emailResult = await sendEmail(args.subject, args.htmlBody);
          return { finalOutput: emailResult };
        }
      }

      let finalOutput = message?.content || '';
      
      // If outputType is specified, try to parse as JSON
      if (this.config.outputType && finalOutput) {
        try {
          finalOutput = JSON.parse(finalOutput);
        } catch {
          // If parsing fails, keep as string
        }
      }

      return { finalOutput };
    } catch (error) {
      console.error('Agent run error:', error);
      throw error;
    }
  }

  private async performWebSearch(query: string): Promise<string> {
    // Placeholder for web search functionality
    // In a real implementation, you would integrate with a search API
    console.log(`Performing web search for: ${query}`);
    return `Search results for "${query}": This is a mock search result. In a real implementation, this would connect to a search API like Google Custom Search, Bing Search API, or similar.`;
  }
}

export class Runner {
  static async run(agent: Agent, input: string): Promise<AgentResult> {
    return await agent.run(input);
  }
}

export function generateTraceId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function trace(name: string, options?: { traceId?: string }) {
  const traceId = options?.traceId || generateTraceId();
  console.log(`Starting trace: ${name} (ID: ${traceId})`);
  return {
    traceId,
    end: () => console.log(`Ending trace: ${name}`)
  };
}
