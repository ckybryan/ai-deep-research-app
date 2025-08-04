# Deep Research TypeScript

A TypeScript implementation of the deep research AI agents system using the OpenAI Agents JS SDK.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key_here
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your_verified_sender_email@example.com
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Usage

1. Open your browser to `http://localhost:3000`
2. Enter a research query
3. Watch as the AI agents collaborate to:
   - Plan the research strategy
   - Search for relevant information
   - Synthesize findings into a comprehensive report
   - Email the results (if configured)

## Architecture

The system consists of several specialized agents:

- **Planner Agent**: Creates a strategic web search plan
- **Search Agent**: Executes searches and summarizes findings
- **Writer Agent**: Synthesizes research into comprehensive reports
- **Email Agent**: Sends formatted results via email
- **Research Manager**: Orchestrates the entire workflow

## Features

- Real-time streaming updates
- Web-based interface
- Multi-agent collaboration
- Email delivery of results
- Comprehensive research reports

## Requirements

- Node.js 18+ 
- OpenAI API key
- SendGrid API key (optional, for email functionality)
