import express, { Request, Response } from 'express';
import { ResearchManager } from './research-manager';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ override: true });

const app = express();
const port = Number(process.env.PORT) || 3000;

// Enable JSON parsing and serve static files
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

const researchManager = new ResearchManager();

// Serve the main page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Research endpoint with streaming
app.post('/research', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Stream research updates
    for await (const update of researchManager.run(query)) {
      res.write(`data: ${JSON.stringify({ update })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Research error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Research failed' })}\n\n`);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Deep Research server running at http://localhost:${port}`);
});
