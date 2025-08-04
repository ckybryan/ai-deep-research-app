import OpenAI from 'openai';
import { AgentConfig, AgentResult } from './types';

// Global trace context
let currentTraceId: string | undefined;

export class Agent {
  private config: AgentConfig;
  private openai: OpenAI;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async run(input: string, traceId?: string): Promise<AgentResult> {
    try {
      // Set trace context if provided
      if (traceId) {
        currentTraceId = traceId;
      }

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

      // Log trace information before API call
      if (currentTraceId) {
        console.log(`[TRACE ${currentTraceId}] Starting OpenAI call for agent: ${this.config.name || 'unnamed'}`);
        console.log(`[TRACE ${currentTraceId}] Model: ${this.config.model}, Input length: ${input.length} chars`);
      }

      const completion = await this.openai.chat.completions.create(requestParams);

      // Log trace information after API call
      if (currentTraceId) {
        console.log(`[TRACE ${currentTraceId}] OpenAI call completed. Usage:`, completion.usage);
        console.log(`[TRACE ${currentTraceId}] Response ID: ${completion.id}`);
      }

      const message = completion.choices[0]?.message;
      
      if (message?.tool_calls && message.tool_calls.length > 0) {
        // Handle tool calls
        const toolCall = message.tool_calls[0];
        if (currentTraceId) {
          console.log(`[TRACE ${currentTraceId}] Tool call: ${toolCall.function.name}`);
        }
        
        if (toolCall.function.name === 'web_search') {
          const args = JSON.parse(toolCall.function.arguments);
          const searchResult = await this.performWebSearch(args.query);
          return { finalOutput: searchResult, traceId: currentTraceId };
        }
        if (toolCall.function.name === 'send_email') {
          const args = JSON.parse(toolCall.function.arguments);
          // Import dynamically to avoid circular dependency
          const { sendEmail } = await import('./emailAgent');
          const emailResult = await sendEmail(args.subject, args.htmlBody);
          return { finalOutput: emailResult, traceId: currentTraceId };
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

      if (currentTraceId) {
        console.log(`[TRACE ${currentTraceId}] Agent run completed successfully`);
      }

      return { finalOutput, traceId: currentTraceId };
    } catch (error) {
      if (currentTraceId) {
        console.error(`[TRACE ${currentTraceId}] Agent run error:`, error);
      }
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
  static async run(agent: Agent, input: string, traceId?: string): Promise<AgentResult> {
    return await agent.run(input, traceId);
  }
}

export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function trace(name: string, options?: { traceId?: string }) {
  const traceId = options?.traceId || generateTraceId();
  const startTime = Date.now();
  
  console.log(`🔍 [TRACE ${traceId}] Starting: ${name}`);
  
  return {
    traceId,
    end: (data?: any) => {
      const duration = Date.now() - startTime;
      console.log(`✅ [TRACE ${traceId}] Completed: ${name} (${duration}ms)`);
      if (data) {
        console.log(`📊 [TRACE ${traceId}] Result data:`, JSON.stringify(data, null, 2));
      }
    },
    log: (message: string, data?: any) => {
      console.log(`📝 [TRACE ${traceId}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    },
    error: (error: Error) => {
      console.error(`❌ [TRACE ${traceId}] Error in ${name}:`, error.message);
      console.error(`🔧 [TRACE ${traceId}] Stack trace:`, error.stack);
    }
  };
}

// Helper function to set global trace context
export function setTraceContext(traceId: string) {
  currentTraceId = traceId;
}

// Helper function to get current trace context
export function getTraceContext(): string | undefined {
  return currentTraceId;
}
