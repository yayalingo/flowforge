export class FlowExecutionContext {
  private stepOutputs = new Map<string, unknown>();

  getStepOutput(nodeId: string): unknown {
    return this.stepOutputs.get(nodeId);
  }

  setStepOutput(nodeId: string, output: unknown): void {
    this.stepOutputs.set(nodeId, output);
  }

  getAllOutputs(): Record<string, unknown> {
    return Object.fromEntries(this.stepOutputs);
  }

  resolveExpression(value: unknown): unknown {
    if (typeof value !== 'string') return value;

    // Match {{path.to.value}} patterns
    const exprRegex = /\{\{([^}]+)\}\}/g;
    return value.replace(exprRegex, (_match, path: string) => {
      const resolved = this.resolvePath(path.trim());
      return resolved !== undefined ? String(resolved) : '';
    });
  }

  private resolvePath(path: string): unknown {
    // Format: nodeId.output.field or prev.field
    const parts = path.split('.');
    const nodeId = parts[0];
    const value = this.stepOutputs.get(nodeId);
    if (value === undefined) return undefined;
    if (parts.length === 1) return value;

    return this.deepGet(value, parts.slice(1));
  }

  private deepGet(obj: unknown, pathParts: string[]): unknown {
    let current: any = obj;
    for (const part of pathParts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  }
}
