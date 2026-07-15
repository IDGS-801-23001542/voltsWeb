export interface EtlLog {
  id: string;
  processName: string;
  source: string;
  destination: string;
  status: string;
  startedAt: string;
  finishedAt?: string | null;
  recordsRead: number;
  recordsProcessed: number;
  recordsRejected: number;
  phases: string[];
  findings: string[];
  errorMessage?: string | null;
}
