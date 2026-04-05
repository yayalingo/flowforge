import type { FastifyInstance } from 'fastify';
import * as executionService from '../services/execution.service';

export async function executionRoutes(app: FastifyInstance) {
  app.post('/api/flows/:id/run', async (req) => {
    const flowId = (req.params as any).id;
    const input = (req.body as any)?.input;
    return executionService.runFlow(flowId, input);
  });

  app.get('/api/flows/:id/runs', async (req) => {
    const flowId = (req.params as any).id;
    return executionService.getFlowExecutions(flowId);
  });

  app.get('/api/runs/:id', async (req) => {
    const id = (req.params as any).id;
    return executionService.getExecution(id);
  });
}
