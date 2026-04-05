import type { Flow } from '@flowforge/shared';
import { prisma } from '../db/prisma';

export async function getAllFlows(): Promise<Flow[]> {
  const flows = await prisma.flow.findMany({ orderBy: { updatedAt: 'desc' } });
  return flows.map((f) => ({
    ...f,
    nodes: f.nodes as any,
    edges: f.edges as any,
  }));
}

export async function getFlow(id: string): Promise<Flow | null> {
  const flow = await prisma.flow.findUnique({ where: { id } });
  if (!flow) return null;
  return { ...flow, nodes: flow.nodes as any, edges: flow.edges as any };
}

export async function createFlow(data: { name: string; nodes: any[]; edges: any[] }): Promise<Flow> {
  const flow = await prisma.flow.create({ data });
  return { ...flow, nodes: flow.nodes as any, edges: flow.edges as any };
}

export async function updateFlow(
  id: string,
  data: Partial<{ name: string; nodes: any[]; edges: any[]; active: boolean }>,
): Promise<Flow> {
  const flow = await prisma.flow.update({ where: { id }, data });
  return { ...flow, nodes: flow.nodes as any, edges: flow.edges as any };
}

export async function deleteFlow(id: string): Promise<void> {
  await prisma.flow.delete({ where: { id } });
}
