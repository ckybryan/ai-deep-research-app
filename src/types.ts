export interface WebSearchItem {
  reason: string;
  query: string;
}

export interface WebSearchPlan {
  searches: WebSearchItem[];
}

export interface ReportData {
  shortSummary: string;
  markdownReport: string;
  followUpQuestions: string[];
}

export interface AgentResult<T = any> {
  finalOutput: T;
}

export interface ModelSettings {
  toolChoice?: string;
}

export interface ToolFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface Tool {
  type: 'function';
  function: ToolFunction;
}

export interface AgentConfig {
  name: string;
  instructions: string;
  model: string;
  tools?: Tool[];
  outputType?: any;
  modelSettings?: ModelSettings;
}

export interface OpenAIRequestParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  tools?: Tool[];
  tool_choice?: 'auto' | 'required';
}
