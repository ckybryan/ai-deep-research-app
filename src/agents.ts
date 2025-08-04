import OpenAI from 'openai';
import { AgentConfig, AgentResult, OpenAIRequestParams } from './types';

type ToolHandler = (args: string) => Promise<AgentResult>;

export class Agent {
  private config: AgentConfig;
  private openai: OpenAI;
  private toolHandlers: Map<string, ToolHandler> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.initializeToolHandlers();
  }

  private initializeToolHandlers(): void {
    this.toolHandlers = new Map([
      ['web_search', this.handleWebSearch.bind(this)],
      ['send_email', this.handleEmailSend.bind(this)],
    ]);
  }

  async run(input: string): Promise<AgentResult> {
    try {
      const requestParams = this.buildRequestParams(input);
      const completion = await this.openai.chat.completions.create(requestParams);
      return await this.processResponse(completion);
    } catch (error) {
      console.error('Agent run error:', error);
      throw error;
    }
  }

  private buildRequestParams(input: string): OpenAIRequestParams {
    const requestParams: OpenAIRequestParams = {
      model: this.config.model,
      messages: [
        { role: 'system', content: this.config.instructions },
        { role: 'user', content: input }
      ],
    };

    this.configureTools(requestParams);
    this.configureStructuredOutput(requestParams);
    return requestParams;
  }

  private configureStructuredOutput(requestParams: OpenAIRequestParams): void {
    if (this.config.responseFormat) {
      requestParams.response_format = this.config.responseFormat;
    }
  }

  private configureTools(requestParams: OpenAIRequestParams): void {
    if (!this.hasTools()) return;
    
    requestParams.tools = this.config.tools;
    
    if (this.config.modelSettings?.toolChoice) {
      requestParams.tool_choice = this.getToolChoiceValue();
    }
  }

  private hasTools(): boolean {
    return Boolean(this.config.tools && this.config.tools.length > 0);
  }

  private getToolChoiceValue(): 'auto' | 'required' {
    return this.config.modelSettings?.toolChoice === 'auto' ? 'auto' : 'required';
  }

  private async processResponse(completion: any): Promise<AgentResult> {
    const message = completion.choices[0]?.message;
    
    if (message?.tool_calls && message.tool_calls.length > 0) {
      return await this.handleToolCall(message.tool_calls[0]);
    }

    return this.handleRegularResponse(message);
  }

  private async handleToolCall(toolCall: any): Promise<AgentResult> {
    const { name, arguments: args } = toolCall.function;
    
    const handler = this.toolHandlers.get(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    return await handler(args);
  }

  // Public method to register additional tool handlers
  public registerToolHandler(name: string, handler: ToolHandler): void {
    this.toolHandlers.set(name, handler);
  }

  private async handleWebSearch(args: string): Promise<AgentResult> {
    const { query } = JSON.parse(args);
    const searchResult = await this.performWebSearch(query);
    return { finalOutput: searchResult };
  }

  private async handleEmailSend(args: string): Promise<AgentResult> {
    const { subject, htmlBody } = JSON.parse(args);
    // Import dynamically to avoid circular dependency
    const { sendEmail } = await import('./emailAgent');
    const emailResult = await sendEmail(subject, htmlBody);
    return { finalOutput: emailResult };
  }

  private handleRegularResponse(message: any): AgentResult {
    let finalOutput = message?.content || '';
    
    // If we have structured output configured, the response should already be properly formatted JSON
    if (this.config.responseFormat) {
      try {
        finalOutput = JSON.parse(finalOutput);
      } catch (error) {
        console.error('Failed to parse structured output:', error);
        throw new Error('Received invalid JSON from structured output');
      }
    } else if (this.config.outputType && finalOutput) {
      // Fallback to the original JSON parsing logic for backward compatibility
      try {
        finalOutput = JSON.parse(finalOutput);
      } catch {
        // If parsing fails, keep as string
      }
    }

    return { finalOutput };
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
