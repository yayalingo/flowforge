import type { FastifyInstance } from 'fastify';
import * as flowService from '../services/flow.service';

export async function flowRoutes(app: FastifyInstance) {
  app.get('/api/flows', async () => flowService.getAllFlows());
  app.get('/api/flows/:id', async (req) => flowService.getFlow((req.params as any).id));
  app.post('/api/flows', async (req) => flowService.createFlow(req.body as any));
  app.put('/api/flows/:id', async (req) => flowService.updateFlow((req.params as any).id, req.body as any));
  app.delete('/api/flows/:id', async (req) => flowService.deleteFlow((req.params as any).id));
}
