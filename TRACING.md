# Application Tracing & Monitoring

This project includes a comprehensive tracing and monitoring system that allows you to track and debug AI agent interactions throughout the research workflow.

## Features

### 🔍 Comprehensive Activity Logging
- **Trace ID Generation**: Unique identifiers for each research session
- **Agent-Level Tracking**: Each agent call is logged with detailed context
- **Performance Monitoring**: Duration tracking for all operations
- **Hierarchical Logging**: Nested traces for complex workflows

### 📊 Information Captured
- **Request Details**: Model, input length, agent configuration
- **Response Metadata**: OpenAI response ID, token usage statistics
- **Tool Calls**: Function calls and their parameters
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Metrics**: Execution time for each operation

### 🛠 Usage Examples

#### Basic Tracing
```typescript
import { trace, generateTraceId } from './agents';

const traceId = generateTraceId();
const session = trace('My Operation', { traceId });

session.log('Starting operation', { data: 'some context' });
// ... your code here ...
session.end({ result: 'success' });
```

#### Agent Tracing
```typescript
import { Runner, generateTraceId, setTraceContext } from './agents';
import { plannerAgent } from './plannerAgent';

const traceId = generateTraceId();
setTraceContext(traceId); // Set global trace context

const result = await Runner.run(plannerAgent, 'Your query', traceId);
console.log('Trace ID:', result.traceId);
```

#### Full Research Flow Tracing
```typescript
const manager = new ResearchManager();
for await (const chunk of manager.run('Your research question')) {
  console.log(chunk);
}
// Automatically includes comprehensive tracing throughout the flow
```

## Trace Output Format

All trace logs follow this format with emojis for easy visual scanning:
```
🔍 [TRACE {traceId}] Starting: {operation_name}
📝 [TRACE {traceId}] {message} {optional_data}
✅ [TRACE {traceId}] Completed: {operation_name} ({duration}ms)
❌ [TRACE {traceId}] Error in {operation_name}: {error_message}
```

Example output:
```
🔍 [TRACE trace_1754330604982_abc123] Starting: OpenAI call for agent: planner
📝 [TRACE trace_1754330604982_abc123] Model: gpt-4o-mini, Input length: 245 chars
📝 [TRACE trace_1754330604982_abc123] OpenAI call completed. Usage: { prompt_tokens: 180, completion_tokens: 120 }
📝 [TRACE trace_1754330604982_abc123] Response ID: chatcmpl-abc123xyz
✅ [TRACE trace_1754330604982_abc123] Completed: OpenAI call for agent: planner (1250ms)
```

## Monitoring Dashboard

While this system doesn't integrate with external tracing platforms, it provides comprehensive console logging that can be:

- **Exported to Files**: Redirect console output to log files for persistence
- **Integrated with Log Aggregators**: Use with tools like Winston, Pino, or cloud logging
- **Monitored in Real-time**: Watch console output during development and testing
- **Parsed for Analytics**: Extract performance metrics and error patterns

### Log Analysis Tips
- **Search by Trace ID**: Filter logs for specific research sessions
- **Performance Analysis**: Look for duration patterns in completed operations
- **Error Investigation**: Stack traces provide detailed debugging information
- **Token Usage Tracking**: Monitor OpenAI API costs and usage patterns

## Testing Tracing

Run the tracing test to verify functionality:
```bash
npm run test-trace
```

This will:
1. Generate a unique trace ID
2. Execute a sample agent call with tracing
3. Display trace output and verification
4. Provide a link to view the trace in OpenAI Platform

## Configuration

Tracing is automatically enabled when:
- Agents are called with trace context
- ResearchManager runs (automatically generates trace IDs)
- Any trace function is called

### Technical Details
- **Unique IDs**: Each trace session gets a timestamp-based unique identifier
- **Performance Tracking**: All operations measure execution time
- **Error Handling**: Comprehensive error logging with stack traces
- **Memory Efficient**: Traces are logged immediately, not stored in memory

### Integration Options
```typescript
// File logging
const fs = require('fs');
const originalLog = console.log;
console.log = (message) => {
  fs.appendFileSync('trace.log', message + '\n');
  originalLog(message);
};

// External logging service
import winston from 'winston';
const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'app.log' })]
});
```

No additional configuration required for basic console logging!
