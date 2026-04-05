/**
 * Evaluates a simple expression string against a context object.
 * Supports: comparisons, property access, basic operators.
 * {{step1.status}} == "success"
 * {{step1.count}} > 5
 */
export function evaluateExpression(expr: string, context: Record<string, unknown>): boolean {
  // Resolve {{...}} placeholders first
  const resolved = expr.replace(/\{\{([^}]+)\}\}/g, (_match, path: string) => {
    const value = resolvePath(context, path.trim());
    return JSON.stringify(value);
  });

  // Safe eval via Function constructor (MVP - sandbox later)
  try {
    return new Function(`"use strict"; return (${resolved})`)();
  } catch {
    return false;
  }
}

function resolvePath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}
