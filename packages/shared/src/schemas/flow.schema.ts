import { z } from 'zod';

export const FlowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['webhook', 'manual', 'http', 'llm', 'condition', 'loop', 'code', 'transform']),
  label: z.string(),
  config: z.record(z.unknown()),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const FlowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

export const FlowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nodes: z.array(FlowNodeSchema),
  edges: z.array(FlowEdgeSchema),
  active: z.boolean().default(false),
});

export type FlowInput = z.infer<typeof FlowSchema>;
