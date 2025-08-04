import { Agent, WebSearchTool, ModelSettings } from 'openai-agents';

const INSTRUCTIONS = `You are a research assistant. Given a search term, you search the web for that term and produce a concise summary of the results. The summary must 2-3 paragraphs and less than 300 words. Capture the main points. Write succintly, no need to have complete sentences or good grammar. This will be consumed by someone synthesizing a report, so its vital you capture the essence and ignore any fluff. Do not include any additional commentary other than the summary itself.`;

export const searchAgent = new Agent({
  name: "Search agent",
  instructions: INSTRUCTIONS,
  tools: [new WebSearchTool({ searchContextSize: "low" })],
  model: "gpt-4o-mini",
  modelSettings: new ModelSettings({ toolChoice: "required" }),
});
