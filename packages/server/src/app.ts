import Fastify from 'fastify';
import cors from '@fastify/cors';
import { flowRoutes } from './routes/flows';
import { executionRoutes } from './routes/executions';
import { webhookRoutes } from './routes/webhooks';
import { createWorker } from './queue/flow-queue';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  await app.register(flowRoutes);
  await app.register(executionRoutes);
  await app.register(webhookRoutes);

  const worker = createWorker();
  app.addHook('onClose', async () => {
    await worker.close();
  });

  return app;
}
