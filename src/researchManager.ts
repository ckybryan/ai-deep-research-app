import { Runner } from './agents';
import { searchAgent } from './searchAgent';
import { plannerAgent } from './plannerAgent';
import { writerAgent } from './writerAgent';
import { emailAgent } from './emailAgent';
import { WebSearchPlan, WebSearchItem, ReportData } from './types';

export class ResearchManager {
  async* run(query: string): AsyncGenerator<string> {
    try {
      console.log('Starting research...');
      yield 'Starting research...';
      
      const searchPlan = await this.planSearches(query);
      yield 'Searches planned, starting to search...';
      
      const searchResults = await this.performSearches(searchPlan);
      yield 'Searches complete, writing report...';
      
      const report = await this.writeReport(query, searchResults);
      
      // Check if email should be sent
      if (process.env.SENDGRID_API_KEY) {
        yield 'Report written, sending email...';
        await this.sendEmail(report);
        yield 'Email sent, research complete';
      } else {
        yield 'Report written, email skipped (no SendGrid key)';
        yield 'Research complete';
      }
      
      yield report.markdownReport;
    } catch (error) {
      console.error('Research error:', error);
      throw error;
    }
  }

  private async planSearches(query: string): Promise<WebSearchPlan> {
    console.log('Planning searches...');
    const result = await Runner.run(plannerAgent, `Query: ${query}`);
    const plan = result.finalOutput as WebSearchPlan;
    console.log(`Will perform ${plan.searches.length} searches`);
    return plan;
  }

  private async performSearches(searchPlan: WebSearchPlan): Promise<string[]> {
    console.log('Searching...');
    let numCompleted = 0;
    const tasks = searchPlan.searches.map(item => this.search(item));
    const results: string[] = [];
    
    for (const task of tasks) {
      try {
        const result = await task;
        if (result !== null) {
          results.push(result);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
      numCompleted++;
      console.log(`Searching... ${numCompleted}/${tasks.length} completed`);
    }
    
    console.log('Finished searching');
    return results;
  }

  private async search(item: WebSearchItem): Promise<string | null> {
    const input = `Search term: ${item.query}\nReason for searching: ${item.reason}`;
    try {
      const result = await Runner.run(searchAgent, input);
      return result.finalOutput as string;
    } catch (error) {
      console.error('Individual search failed:', error);
      return null;
    }
  }

  private async writeReport(query: string, searchResults: string[]): Promise<ReportData> {
    console.log('Thinking about report...');
    const input = `Original query: ${query}\nSummarized search results: ${searchResults.join('\n\n')}`;
    const result = await Runner.run(writerAgent, input);
    
    console.log('Finished writing report');
    return result.finalOutput as ReportData;
  }

  private async sendEmail(report: ReportData): Promise<void> {
    // Skip email sending if SendGrid API key is not configured
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not found, skipping email phase');
      return;
    }

    console.log('Writing email...');
    try {
      const result = await Runner.run(emailAgent, report.markdownReport);
      console.log('Email sent');
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}
