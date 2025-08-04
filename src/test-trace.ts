#!/usr/bin/env node

import * as dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ override: true });

import { trace, generateTraceId, setTraceContext, Runner } from './agents';
import { plannerAgent } from './plannerAgent';

async function testTracing() {
  // Generate a trace ID for this test session
  const traceId = generateTraceId();
  console.log(`🔍 Test trace ID: ${traceId}`);
  console.log(`📊 Console logs will be tagged with this trace ID for easy filtering`);
  
  // Set global trace context
  setTraceContext(traceId);
  
  // Create a trace session for the entire test
  const mainTrace = trace('Test Tracing System', { traceId });
  
  try {
    mainTrace.log('Starting trace test');
    
    // Test agent with tracing
    const testQuery = "What are the latest developments in AI?";
    mainTrace.log('Testing agent with trace', { query: testQuery });
    
    const result = await Runner.run(plannerAgent, `Query: ${testQuery}`, traceId);
    
    mainTrace.log('Agent completed successfully', {
      resultType: typeof result.finalOutput,
      hasTraceId: !!result.traceId
    });
    
    console.log('✅ Tracing test completed successfully!');
    console.log('📋 Result:', result.finalOutput);
    
  } catch (error) {
    mainTrace.error(error as Error);
    console.error('❌ Tracing test failed:', error);
  } finally {
    mainTrace.end();
  }
}

// Run the test
testTracing().catch(console.error);
