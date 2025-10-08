# Tracing strategy
Purpose: explain why the CLI wraps commands with tracing utilities and how spans flow.

## Goals addressed by tracing
- Surface latency for Scryfall lookups, log parsing, and file writes without invasive logs
- Provide structured breadcrumbs when commands run under feature flags or automation
- Allow optional integration with external observability tools via adapters

## Architecture
`TracedCommand` extends the base oclif `Command`, instantiating a `Tracer` that wraps the
`execute` method. Each command emits a root span (`collection:export`, `matches:stats`, and so
on) with child spans for major phases, such as reading logs, resolving cards, or rendering.

The tracer persists JSON span buffers under `cache/tracing` when enabled. The default mode
disables emission to keep the CLI silent unless the user opts in via environment variables
or configuration profiles.

## Configuration sources
- Environment variables resolve through `resolveEnv()` to toggle tracing providers.
- Profile definitions in the config layer specify exporters or redactors per command.
- Commands may call `this.withSpan('phase', fn)` to nest spans without exposing tracer
  internals to consumers.

## Benefits and trade-offs
- **Benefit:** Diagnostic clarity when bulk mode degrades, because span durations highlight
  slow filesystem or network operations.
- **Benefit:** Minimal runtime overhead when disabled; tracer stubs short-circuit.
- **Trade-off:** Additional code paths to maintain; misuse could leak card identifiers if
  exporters are misconfigured. Documentation emphasizes default-off posture to mitigate risk.

## Extensibility outlook
Future work could connect the tracer to OpenTelemetry exporters, allow CLI flags for
ad-hoc span capture, and attach correlation identifiers so log snapshots align with span
batches during support investigations.
