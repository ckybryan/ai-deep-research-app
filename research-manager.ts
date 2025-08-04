import { Runner, trace, generateTraceId } from 'openai-agents';
import { searchAgent } from './search-agent';
import { plannerAgent } from './planner-agent';
import { writerAgent } from './writer-agent';
import { emailAgent } from './email-agent';
import { WebSearchItem, WebSearchPlan } from './planner-agent';
import { ReportData } from './writer-agent';

export class ResearchManager {
  
  async* run(query: string): AsyncGenerator<string, void, unknown> {
    const traceId = generateTraceId();
    
    console.log(`View trace: https://platform.openai.com/traces/trace?trace_id=${traceId}`);
    yield `View trace: https://platform.openai.com/traces/trace?trace_id=${traceId}`;
    
    console.log("Starting research...");
    const searchPlan = await this.planSearches(query);
    yield "Searches planned, starting to search...";
    
    const searchResults = await this.performSearches(searchPlan);
    yield "Searches complete, writing report...";
    
    const report = await this.writeReport(query, searchResults);
    yield "Report written, sending email...";
    
    await this.sendEmail(report);
    yield "Email sent, research complete";
    yield report.markdownReport;
  }

  private async planSearches(query: string): Promise<WebSearchPlan> {
    console.log("Planning searches...");
    const result = await Runner.run(plannerAgent, `Query: ${query}`);
    const searchPlan = result.finalOutput as WebSearchPlan;
    console.log(`Will perform ${searchPlan.searches.length} searches`);
    return searchPlan;
  }

  private async performSearches(searchPlan: WebSearchPlan): Promise<string[]> {
    console.log("Searching...");
    let numCompleted = 0;
    
    const tasks = searchPlan.searches.map((item: WebSearchItem) => this.search(item));
    const results: string[] = [];
    
    for await (const result of this.settledResults(tasks)) {
      if (result !== null && result !== undefined) {
        results.push(result);
      }
      numCompleted++;
      console.log(`Searching... ${numCompleted}/${tasks.length} completed`);
    }
    
    console.log("Finished searching");
    return results;
  }

  private async search(item: WebSearchItem): Promise<string | null> {
    const input = `Search term: ${item.query}\nReason for searching: ${item.reason}`;
    try {
      const result = await Runner.run(searchAgent, input);
      return String(result.finalOutput);
    } catch (error) {
      console.error('Search failed:', error);
      return null;
    }
  }

  private async writeReport(query: string, searchResults: string[]): Promise<ReportData> {
    console.log("Thinking about report...");
    const input = `Original query: ${query}\nSummarized search results: ${searchResults.join('\n\n')}`;
    const result = await Runner.run(writerAgent, input);
    
    console.log("Finished writing report");
    return result.finalOutput as ReportData;
  }

  private async sendEmail(report: ReportData): Promise<void> {
    console.log("Writing email...");
    await Runner.run(emailAgent, report.markdownReport);
    console.log("Email sent");
  }

  // Helper method to handle async iteration over promises
  private async* settledResults<T>(promises: Promise<T>[]): AsyncGenerator<T | null, void, unknown> {
    const settled = await Promise.allSettled(promises);
    for (const result of settled) {
      if (result.status === 'fulfilled') {
        yield result.value;
      } else {
        yield null;
      }
    }
  }
}
