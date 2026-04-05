import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface Flow {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  flowId: string;
  status: string;
  steps: any[];
  input: unknown;
  output: unknown;
  error?: string;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
}

export const flowsApi = {
  getAll: () => api.get<Flow[]>('/flows'),
  getById: (id: string) => api.get<Flow>(`/flows/${id}`),
  create: (data: { name: string; nodes: any[]; edges: any[] }) => api.post<Flow>('/flows', data),
  update: (id: string, data: Partial<Flow>) => api.put<Flow>(`/flows/${id}`, data),
  delete: (id: string) => api.delete(`/flows/${id}`),
  run: (id: string, input?: unknown) => api.post<Execution>(`/flows/${id}/run`, { input }),
  getRuns: (id: string) => api.get<Execution[]>(`/flows/${id}/runs`),
  getRun: (runId: string) => api.get<Execution>(`/runs/${runId}`),
};
