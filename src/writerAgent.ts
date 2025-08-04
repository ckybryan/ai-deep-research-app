import { Agent } from './agents';
import { ReportData } from './types';

const INSTRUCTIONS = `You are a senior researcher tasked with writing a cohesive report for a research query. ` +
  `You will be provided with the original query, and some initial research done by a research assistant.\n` +
  `You should first come up with an outline for the report that describes the structure and ` +
  `flow of the report. Then, generate the report and return that as your final output.\n` +
  `The final output should be in markdown format, and it should be lengthy and detailed. Aim ` +
  `for 5-10 pages of content, at least 1000 words. ` +
  `Return your response as a JSON object with the following structure: ` +
  `{"shortSummary": "brief summary", "markdownReport": "full report in markdown", "followUpQuestions": ["question1", "question2"]}`;

export const writerAgent = new Agent({
  name: 'WriterAgent',
  instructions: INSTRUCTIONS,
  model: 'gpt-4o-mini',
  outputType: 'json'
});
