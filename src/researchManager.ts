import { Runner, generateTraceId, trace, setTraceContext } from './agents';
import { searchAgent } from './searchAgent';
import { plannerAgent } from './plannerAgent';
import { writerAgent } from './writerAgent';
import { emailAgent, sendEmail } from './emailAgent';
import { WebSearchPlan, WebSearchItem, ReportData } from './types';

export class ResearchManager {
  async* run(query: string): AsyncGenerator<string> {
    const traceId = generateTraceId();
    const traceSession = trace('Research Manager Full Flow', { traceId });
    
    // Set global trace context for all agents
    setTraceContext(traceId);
    
    try {
      console.log(`🔍 Research session started with trace ID: ${traceId}`);
      yield `🔍 Research session started with trace ID: ${traceId}`;
      
      traceSession.log('Starting research flow', { query });
      const searchPlan = await this.planSearches(query, traceId);
      yield 'Searches planned, starting to search...';
      
      const searchResults = await this.performSearches(searchPlan, traceId);
      yield 'Searches complete, writing report...';
      
      const report = await this.writeReport(query, searchResults, traceId);
      yield 'Report written, sending email...';
      
      await this.sendEmail(report, traceId);
      yield 'Email sent, research complete';
      yield report.markdownReport;
      
      traceSession.log('Research completed successfully');
    } catch (error) {
      traceSession.error(error as Error);
      throw error;
    } finally {
      traceSession.end();
    }
  }

  private async planSearches(query: string, traceId: string): Promise<WebSearchPlan> {
    const traceSession = trace('Planning Searches', { traceId });
    try {
      traceSession.log('Planning searches for query', { query });
      const result = await Runner.run(plannerAgent, `Query: ${query}`, traceId);
      const plan = result.finalOutput as WebSearchPlan;
      traceSession.log(`Planned ${plan.searches.length} searches`, { searches: plan.searches });
      console.log(`Will perform ${plan.searches.length} searches`);
      return plan;
    } finally {
      traceSession.end();
    }
  }

  private async performSearches(searchPlan: WebSearchPlan, traceId: string): Promise<string[]> {
    const traceSession = trace('Performing Web Searches', { traceId });
    try {
      traceSession.log(`Starting ${searchPlan.searches.length} searches`);
      let numCompleted = 0;
      const tasks = searchPlan.searches.map(item => this.search(item, traceId));
      const results: string[] = [];
      
      for (const task of tasks) {
        try {
          const result = await task;
          if (result !== null) {
            results.push(result);
          }
        } catch (error) {
          traceSession.error(error as Error);
          console.error('Search failed:', error);
        }
        numCompleted++;
        traceSession.log(`Search progress: ${numCompleted}/${tasks.length} completed`);
        console.log(`Searching... ${numCompleted}/${tasks.length} completed`);
      }
      
      traceSession.log('All searches completed', { resultsCount: results.length });
      console.log('Finished searching');
      return results;
    } finally {
      traceSession.end();
    }
  }

  private async search(item: WebSearchItem, traceId: string): Promise<string | null> {
    const traceSession = trace(`Search: ${item.query}`, { traceId });
    try {
      const input = `Search term: ${item.query}\nReason for searching: ${item.reason}`;
      traceSession.log('Executing search', { query: item.query, reason: item.reason });
      const result = await Runner.run(searchAgent, input, traceId);
      traceSession.log('Search completed successfully');
      return result.finalOutput as string;
    } catch (error) {
      traceSession.error(error as Error);
      console.error('Individual search failed:', error);
      return null;
    } finally {
      traceSession.end();
    }
  }

  private async writeReport(query: string, searchResults: string[], traceId: string): Promise<ReportData> {
    const traceSession = trace('Writing Report', { traceId });
    try {
      traceSession.log('Starting report generation', { 
        originalQuery: query, 
        searchResultsCount: searchResults.length 
      });
      console.log('Thinking about report...');
      const input = `Original query: ${query}\nSummarized search results: ${searchResults.join('\n\n')}`;
      const result = await Runner.run(writerAgent, input, traceId);
      
      traceSession.log('Report generated successfully');
      console.log('Finished writing report');
      return result.finalOutput as ReportData;
    } finally {
      traceSession.end();
    }
  }

  private async sendEmail(report: ReportData, traceId: string): Promise<void> {
    const traceSession = trace('Sending Email', { traceId });
    try {
      traceSession.log('Starting email composition and sending');
      console.log('Writing email...');
      const result = await Runner.run(emailAgent, report.markdownReport, traceId);
      traceSession.log('Email sent successfully');
      console.log('Email sent');
    } catch (error) {
      traceSession.error(error as Error);
      console.error('Email sending failed:', error);
    } finally {
      traceSession.end();
    }
  }
}
