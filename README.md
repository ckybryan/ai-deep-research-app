# Deep Research AI - TypeScript Version

This is a TypeScript implementation of an AI-powered deep research application that performs comprehensive web research using specialized AI agents. The system uses multiple AI agents to plan, search, synthesize, and report on research topics automatically.

**Learning Project**: This project was created as part of learning from the Udemy course by [Ed Donner](https://www.linkedin.com/in/eddonner). You can find the course [here](https://www.udemy.com/share/10dasB3@zE174MbYSFUi3hhv6wzxhjI7IcgVciRBPeWv8_yvDdgUJOLW_Y-8FOATBFGTHIX-/).

## Features

- **Multi-Agent Research System**: Uses specialized AI agents for planning, searching, writing, and email notification
- **Web-based Interface**: Simple HTML interface for submitting research queries
- **Streaming Results**: Real-time updates as research progresses
- **Email Reports**: Automatically sends formatted research reports via SendGrid
- **Comprehensive Reports**: Generates detailed markdown reports with follow-up questions

## Architecture

The application consists of several specialized agents:

- **Planner Agent**: Creates a research plan with multiple search queries
- **Search Agent**: Performs web searches and summarizes results
- **Writer Agent**: Synthesizes search results into comprehensive reports
- **Email Agent**: Formats and sends email notifications

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Required:
   - `OPENAI_API_KEY`: Your OpenAI API key

   Optional (for email functionality):
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `FROM_EMAIL`: Verified sender email address
   - `TO_EMAIL`: Recipient email address

3. **Build the Project**:
   ```bash
   npm run build
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### CLI Mode
```bash
npm run cli "Your research query here"
```

The web application will be available at `http://localhost:3000`

## API Endpoints

- `GET /`: Web interface for submitting research queries
- `POST /research`: API endpoint for programmatic research requests
  ```json
  {
    "query": "Your research topic"
  }
  ```

## Project Structure

```
src/
├── index.ts              # Main application and web server
├── cli.ts               # Command-line interface
├── researchManager.ts    # Orchestrates the research process
├── agents.ts            # Base agent framework and utilities
├── plannerAgent.ts      # Creates research plans
├── searchAgent.ts       # Performs web searches
├── writerAgent.ts       # Writes comprehensive reports
├── emailAgent.ts        # Handles email notifications
└── types.ts            # TypeScript type definitions
```

## Dependencies

- **openai**: Official OpenAI client library
- **express**: Web framework for the interface
- **@sendgrid/mail**: Email delivery service
- **dotenv**: Environment variable management

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI agents | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No |
| `FROM_EMAIL` | Verified sender email address | No |
| `TO_EMAIL` | Recipient email address | No |
| `PORT` | Server port (default: 3000) | No |

## Notes

- The web search functionality in this implementation uses a mock search. In production, you would integrate with a real search API like Google Custom Search, Bing Search API, or similar.
- Email functionality requires a verified SendGrid account and sender verification.
- The application generates detailed research reports in markdown format.
- All AI interactions are traced for debugging and monitoring purposes.
