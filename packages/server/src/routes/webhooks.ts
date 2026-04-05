import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma';
import { flowQueue } from '../queue/flow-queue';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/:flowId', async (req, reply) => {
    const { flowId } = req.params as { flowId: string };

    const flow = await prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow) return reply.code(404).send({ error: 'Flow not found' });

    const webhookNode = (flow.nodes as any[]).find((n) => n.type === 'webhook');
    if (!webhookNode) return reply.code(400).send({ error: 'No webhook trigger configured' });

    const execution = await prisma.execution.create({
      data: {
        flowId,
        status: 'pending',
        input: {
          body: req.body,
          headers: req.headers,
          query: req.query,
        } as any,
      },
    });

    await flowQueue.add('execute', {
      flowId,
      input: { body: req.body, headers: req.headers, query: req.query },
    }, { jobId: execution.id });

    return { executionId: execution.id, status: 'queued' };
  });
}
