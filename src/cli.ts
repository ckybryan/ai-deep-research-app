#!/usr/bin/env node

import * as dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config({ override: true });

import { ResearchManager } from './researchManager';

async function main() {
  const query = process.argv[2];
  
  if (!query) {
    console.log('Usage: npm run cli "Your research query"');
    process.exit(1);
  }

  console.log(`Starting research for: "${query}"`);
  console.log('---');

  try {
    const manager = new ResearchManager();
    for await (const chunk of manager.run(query)) {
      console.log(chunk);
    }
  } catch (error) {
    console.error('Research failed:', error);
    process.exit(1);
  }
}

main();
