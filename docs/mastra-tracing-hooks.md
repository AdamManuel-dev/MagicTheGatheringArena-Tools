# Mastra tracing hooks
Purpose: integrate Mastra tracing with CLI command lifecycle (start, success, failure).

## Hook lifecycle
1. Command start: emit `trace.start` with command name, flags, session ID
2. Workflow invocation: wrap Mastra agent calls in tracer capturing prompt/response metadata
3. Command success: emit `trace.success` with duration, key metrics
4. Command failure: emit `trace.error` with error code, stack (scrub sensitive data)

## Implementation outline
- Decorate oclif commands via base class overriding `run`
- Use Mastra tracing API to create spans
- Correlate CLI spans with agent/tool spans using shared trace ID

## Configuration
- Controlled via config flag `tracing.enabled`
- Respect telemetry opt-in; default disabled
- Provide `--trace` CLI flag to force enable per command

## Storage
- Local JSONL file with rotation (max 10 MB)
- Optional upload endpoint for GA (future)

## Testing
- Unit tests verifying tracer invoked on success/failure
- Integration test simulating command error to ensure trace flushes
