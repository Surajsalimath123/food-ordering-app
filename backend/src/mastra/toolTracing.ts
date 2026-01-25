import { AsyncLocalStorage } from "node:async_hooks";

export type ToolTrace = {
  toolId: string;
  input: any;
  output?: any;
  error?: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
};

type TraceStore = { traces: ToolTrace[] };

export const traceStore = new AsyncLocalStorage<TraceStore>();

export function runWithTraces<T>(fn: () => Promise<T>) {
  return traceStore.run({ traces: [] }, fn);
}

export function getTraces(): ToolTrace[] {
  return traceStore.getStore()?.traces ?? [];
}

export function traceTool<TTool extends { id: string; execute: (input: any) => Promise<any> }>(
  tool: TTool
): TTool {
  const originalExecute = tool.execute.bind(tool);

  const wrapped = {
    ...tool,
    execute: async (input: any) => {
      const start = Date.now();
      const startedAt = new Date().toISOString();

      const trace: ToolTrace = {
        toolId: tool.id,
        input,
        startedAt,
        finishedAt: startedAt,
        durationMs: 0,
      };

      try {
        const output = await originalExecute(input);
        const end = Date.now();
        trace.output = output;
        trace.finishedAt = new Date().toISOString();
        trace.durationMs = end - start;

        traceStore.getStore()?.traces.push(trace);
        return output;
      } catch (e: any) {
        const end = Date.now();
        trace.error = e?.message ?? String(e);
        trace.finishedAt = new Date().toISOString();
        trace.durationMs = end - start;

        traceStore.getStore()?.traces.push(trace);
        throw e;
      }
    },
  };

  return wrapped as TTool;
}
