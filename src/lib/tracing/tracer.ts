import fs from 'fs';
import path from 'path';

export type TraceEvent = {
  type: 'start' | 'success' | 'error';
  command: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

const TRACE_DIR = path.join(process.cwd(), 'cache', 'traces');
const TRACE_FILE = path.join(TRACE_DIR, 'events.jsonl');

function ensureTraceDir(): void {
  if (!fs.existsSync(TRACE_DIR)) {
    fs.mkdirSync(TRACE_DIR, {recursive: true});
  }
}

export class Tracer {
  private enabled = false;

  constructor() {
    ensureTraceDir();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    if (!this.enabled) return false;
    if (process.env.MASTRA_TRACING_ENABLED) {
      const raw = process.env.MASTRA_TRACING_ENABLED.toLowerCase();
      return raw === '1' || raw === 'true';
    }
    return true;
  }

  record(event: TraceEvent): void {
    if (!this.isEnabled()) return;
    const normalized: TraceEvent = {
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
    };
    fs.appendFileSync(TRACE_FILE, `${JSON.stringify(normalized)}\n`, 'utf8');
  }

  start(command: string, data?: Record<string, unknown>): () => void {
    const startTime = new Date();
    this.record({type: 'start', command, timestamp: startTime.toISOString(), data});
    return () => {
      const elapsed = Date.now() - startTime.getTime();
      this.record({type: 'success', command, timestamp: new Date().toISOString(), data: {elapsedMs: elapsed}});
    };
  }

  error(command: string, error: Error): void {
    this.record({
      type: 'error',
      command,
      timestamp: new Date().toISOString(),
      data: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
}

export const tracer = new Tracer();
