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
  traceId?: string;
}

export interface ModelSettings {
  toolChoice?: string;
}

export interface AgentConfig {
  name: string;
  instructions: string;
  model: string;
  tools?: any[];
  outputType?: any;
  modelSettings?: ModelSettings;
}
