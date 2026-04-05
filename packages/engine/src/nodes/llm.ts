import OpenAI from 'openai';
import { BaseNode } from './base';
import type { ExecutionContext } from './base';
import type { FlowNode } from '@flowforge/shared';

export class LLMCallNode extends BaseNode {
  readonly type = 'llm' as const;

  async execute(node: FlowNode, _input: unknown, context: ExecutionContext): Promise<unknown> {
    const config = node.config;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const systemPrompt = config.systemPrompt
      ? context.resolveExpression(config.systemPrompt as string) as string
      : undefined;
    const userPrompt = context.resolveExpression(config.userPrompt as string) as string;

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    const response = await client.chat.completions.create({
      model: (config.model as string) || 'gpt-4o-mini',
      messages,
      temperature: (config.temperature as number) ?? 0.7,
      max_tokens: (config.maxTokens as number) ?? 1024,
    });

    const content = response.choices[0]?.message?.content ?? '';

    return {
      content,
      usage: response.usage,
      model: response.model,
    };
  }
}
