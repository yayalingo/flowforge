import axios from 'axios';
import { BaseNode } from './base';
import type { ExecutionContext } from './base';
import type { FlowNode } from '@flowforge/shared';

export class HttpRequestNode extends BaseNode {
  readonly type = 'http' as const;

  async execute(node: FlowNode, _input: unknown, context: ExecutionContext): Promise<unknown> {
    const config = node.config;
    const url = context.resolveExpression(config.url as string) as string;
    const method = (config.method as string) || 'GET';
    const headers = typeof config.headers === 'string'
      ? JSON.parse(config.headers)
      : (config.headers as Record<string, string> || {});
    const body = config.body;

    const resolvedBody = body
      ? (typeof body === 'string' ? context.resolveExpression(body) : body)
      : undefined;

    const response = await axios({
      url,
      method,
      headers: typeof headers === 'string' ? JSON.parse(headers) : headers,
      data: resolvedBody,
      validateStatus: () => true,
    });

    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
    };
  }
}
