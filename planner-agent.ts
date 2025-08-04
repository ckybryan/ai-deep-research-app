import { z } from 'zod';
import { Agent } from 'openai-agents';

const HOW_MANY_SEARCHES = 5;

const INSTRUCTIONS = `You are a helpful research assistant. Given a query, come up with a set of web searches to perform to best answer the query. Output ${HOW_MANY_SEARCHES} terms to query for.`;

// Zod schemas (equivalent to Pydantic models)
export const WebSearchItemSchema = z.object({
  reason: z.string().describe("Your reasoning for why this search is important to the query."),
  query: z.string().describe("The search term to use for the web search.")
});

export const WebSearchPlanSchema = z.object({
  searches: z.array(WebSearchItemSchema).describe("A list of web searches to perform to best answer the query.")
});

export type WebSearchItem = z.infer<typeof WebSearchItemSchema>;
export type WebSearchPlan = z.infer<typeof WebSearchPlanSchema>;

export const plannerAgent = new Agent({
  name: "PlannerAgent",
  instructions: INSTRUCTIONS,
  model: "gpt-4o-mini",
  outputSchema: WebSearchPlanSchema,
});
