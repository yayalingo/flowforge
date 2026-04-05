import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { createDefaultExecutor } from '@flowforge/engine';
import { prisma } from '../db/prisma';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const flowQueue = new Queue('flow-executions', { connection });

export function createWorker() {
  const engine = createDefaultExecutor();

  return new Worker('flow-executions', async (job) => {
    const jobId = job.id as string;
    const { flowId, input } = job.data;

    await prisma.execution.update({
      where: { id: jobId },
      data: { status: 'running' },
    });

    const flowRecord = await prisma.flow.findUnique({ where: { id: flowId } });
    if (!flowRecord) throw new Error(`Flow ${flowId} not found`);

    const flow = {
      ...flowRecord,
      nodes: flowRecord.nodes as any,
      edges: flowRecord.edges as any,
    };

    const result = await engine.execute(flow, input as any);

    
    await prisma.execution.update({
      where: { id: jobId },
      data: {
        status: result.status,
        steps: result.steps as any,
        output: result.output as any,
        error: result.error,
        finishedAt: result.finishedAt,
        duration: result.duration,
      },
    });

    return result;
  }, { connection });
}
