import { prisma } from '../db/prisma';
import { flowQueue } from '../queue/flow-queue';

export async function runFlow(flowId: string, input?: unknown) {
  const execution = await prisma.execution.create({
    data: {
      flowId,
      status: 'pending',
      input: input as any,
    },
  });

  await flowQueue.add('execute', { flowId, input }, { jobId: execution.id as string });

  return execution;
}

export async function getExecution(id: string) {
  return prisma.execution.findUnique({ where: { id } });
}

export async function getFlowExecutions(flowId: string) {
  return prisma.execution.findMany({
    where: { flowId },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });
}
