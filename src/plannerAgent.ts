import { Agent } from './agents';
import { WebSearchPlan } from './types';

const HOW_MANY_SEARCHES = 5;

const INSTRUCTIONS = `You are a helpful research assistant. Given a query, come up with a set of web searches ` +
  `to perform to best answer the query. Output ${HOW_MANY_SEARCHES} terms to query for. ` +
  `Return your response as a JSON object with the following structure: ` +
  `{"searches": [{"reason": "explanation", "query": "search term"}, ...]}`;

export const plannerAgent = new Agent({
  name: 'PlannerAgent',
  instructions: INSTRUCTIONS,
  model: 'gpt-4o-mini',
  outputType: 'json'
});
