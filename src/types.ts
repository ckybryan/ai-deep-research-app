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

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: {
    name: string;
    schema: Record<string, any>;
    strict?: boolean;
  };
}

export interface AgentConfig {
  name: string;
  instructions: string;
  model: string;
  tools?: Tool[];
  outputType?: any;
  responseFormat?: ResponseFormat;
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
  response_format?: ResponseFormat;
}

// Utility function to create structured output schemas
export const createStructuredOutputSchema = {
  ReportData: (): ResponseFormat => ({
    type: 'json_schema',
    json_schema: {
      name: 'report_data',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          shortSummary: {
            type: 'string',
            description: 'A brief summary of the report'
          },
          markdownReport: {
            type: 'string',
            description: 'The full report content in markdown format'
          },
          followUpQuestions: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of follow-up questions related to the research'
          }
        },
        required: ['shortSummary', 'markdownReport', 'followUpQuestions'],
        additionalProperties: false
      }
    }
  }),

  WebSearchPlan: (): ResponseFormat => ({
    type: 'json_schema',
    json_schema: {
      name: 'web_search_plan',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          searches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                reason: {
                  type: 'string',
                  description: 'Reason for this search'
                },
                query: {
                  type: 'string',
                  description: 'Search query'
                }
              },
              required: ['reason', 'query'],
              additionalProperties: false
            }
          }
        },
        required: ['searches'],
        additionalProperties: false
      }
    }
  })
};
