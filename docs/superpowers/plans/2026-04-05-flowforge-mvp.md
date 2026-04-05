# FlowForge - AI Agent Workflow Automation Platform (MVP)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal visual workflow automation platform (Make.com clone) with a React drag-and-drop flow builder, Node.js execution engine, and AI-focused node types (LLM, HTTP, conditional, loop).

**Architecture:** Monorepo with 4 packages: `web` (React + Vite + ReactFlow for visual builder), `server` (Fastify REST API), `engine` (flow execution engine), `shared` (TypeScript types/utilities). PostgreSQL for persistence, Redis + BullMQ for async job queue. Docker Compose for local dev.

**Tech Stack:** TypeScript, React, ReactFlow, Vite, Fastify, PostgreSQL, Redis, BullMQ, Docker Compose, Prisma ORM, React Query, TailwindCSS, Zod.

---

## Project Structure

```
flowforge/
├── docker-compose.yml
├── package.json              # Root workspace (pnpm/npm)
├── turbo.json                # Task runner
├── .env.example
├── packages/
│   ├── shared/               # Shared types, schemas, constants
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types/
│   │       │   ├── flow.ts         # Flow, Node, Edge, Connection types
│   │       │   ├── execution.ts    # Run, StepOutput, ExecutionStatus
│   │       │   ├── node.ts         # Node type registry, NodeConfig
│   │       │   └── trigger.ts      # Trigger types
│   │       └── schemas/
│   │           └── flow.schema.ts  # Zod validation for flows
│   ├── web/                  # React frontend
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── api/
│   │       │   └── client.ts         # Axios/fetch API client
│   │       ├── components/
│   │       │   ├── FlowBuilder.tsx   # Main ReactFlow canvas
│   │       │   ├── NodePalette.tsx   # Draggable node sidebar
│   │       │   ├── NodeWrapper.tsx   # ReactFlow custom node wrapper
│   │       │   ├── NodeTypes/
│   │       │   │   ├── TriggerNode.tsx
│   │       │   │   ├── ActionNode.tsx
│   │       │   │   ├── ConditionNode.tsx
│   │       │   │   └── LLMNode.tsx
│   │       │   ├── EdgeTypes/
│   │       │   │   └── CustomEdge.tsx
│   │       │   ├── NodeConfigPanel.tsx  # Side panel for node config
│   │       │   └── ExecutionLog.tsx     # Run history viewer
│   │       ├── hooks/
│   │       │   ├── useFlow.ts          # Flow CRUD operations
│   │       │   └── useExecution.ts     # Run execution, poll status
│   │       └── stores/
│   │           └── flowStore.ts        # Zustand store for canvas state
│   ├── server/               # Fastify API server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts              # Fastify app bootstrap
│   │       ├── app.ts                # App setup (plugins, routes)
│   │       ├── db/
│   │       │   ├── prisma.ts         # Prisma client singleton
│   │       │   └── schema.prisma     # Database schema
│   │       ├── routes/
│   │       │   ├── flows.ts          # GET/POST/PUT/DELETE /flows
│   │       │   ├── executions.ts     # POST /flows/:id/run, GET /runs
│   │       │   └── webhooks.ts       # POST /webhooks/:flowId/*
│   │       ├── services/
│   │       │   ├── flow.service.ts   # Flow CRUD business logic
│   │       │   └── execution.service.ts  # Queue job, check status
│   │       └── queue/
│   │           └── flow-queue.ts     # BullMQ queue setup, worker
│   └── engine/               # Flow execution engine
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts              # Engine entry point
│           ├── executor.ts           # Main FlowExecutor class
│           ├── step-executor.ts      # Individual step execution
│           ├── nodes/
│           │   ├── base.ts           # BaseNode abstract class
│           │   ├── trigger.ts        # WebhookTrigger, ManualTrigger
│           │   ├── http.ts           # HttpRequest action
│           │   ├── llm.ts            # LLMCall action (OpenAI-compatible)
│           │   ├── condition.ts      # Condition (if/else branch)
│           │   ├── loop.ts           # LoopOverItems
│           │   ├── code.ts           # CodeExecution (eval in context)
│           │   └── transform.ts      # DataTransform (map/filter/set)
│           ├── context.ts            # ExecutionContext (step outputs)
│           ├── expression.ts         # Expression resolver {{step1.output}}
│           └── registry.ts           # Node type registry
├── prisma/
│   └── schema.prisma         # (Symlink or copy from server)
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-04-05-flowforge-mvp.md  # This file
```

---

## Phase 1: Foundation & Infrastructure

### Task 1: Project Scaffolding & Monorepo Setup

**Files:**
- Create: `flowforge/package.json`, `flowforge/turbo.json`, `flowforge/docker-compose.yml`, `flowforge/.env.example`
- Create: `flowforge/packages/shared/package.json`, `flowforge/packages/shared/tsconfig.json`
- Create: `flowforge/packages/server/package.json`, `flowforge/packages/server/tsconfig.json`
- Create: `flowforge/packages/engine/package.json`, `flowforge/packages/engine/tsconfig.json`
- Create: `flowforge/packages/web/package.json`, `flowforge/packages/web/vite.config.ts`, `flowforge/packages/web/tsconfig.json`, `flowforge/packages/web/tailwind.config.ts`, `flowforge/packages/web/index.html`

- [ ] **Step 1: Create root package.json with workspace config**

```json
{
  "name": "flowforge",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "db:generate": "pnpm --filter @flowforge/server exec prisma generate",
    "db:migrate": "pnpm --filter @flowforge/server exec prisma migrate dev",
    "db:push": "pnpm --filter @flowforge/server exec prisma db push"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

- [ ] **Step 3: Create docker-compose.yml**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: flowforge
      POSTGRES_PASSWORD: flowforge
      POSTGRES_DB: flowforge
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  pgdata:
```

- [ ] **Step 4: Create .env.example**

```
DATABASE_URL=postgresql://flowforge:flowforge@localhost:5432/flowforge
REDIS_URL=redis://localhost:6379
SERVER_PORT=3001
WEB_PORT=5173
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
```

- [ ] **Step 5: Create shared package**

`packages/shared/package.json`:
```json
{
  "name": "@flowforge/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

`packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create server package**

`packages/server/package.json`:
```json
{
  "name": "@flowforge/server",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@flowforge/shared": "workspace:*",
    "@flowforge/engine": "workspace:*",
    "@prisma/client": "^5.14.0",
    "bullmq": "^5.7.0",
    "fastify": "^4.27.0",
    "@fastify/cors": "^9.0.0",
    "ioredis": "^5.4.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "prisma": "^5.14.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 7: Create engine package**

`packages/engine/package.json`:
```json
{
  "name": "@flowforge/engine",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@flowforge/shared": "workspace:*",
    "openai": "^4.47.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 8: Create web package**

`packages/web/package.json`:
```json
{
  "name": "@flowforge/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@flowforge/shared": "workspace:*",
    "@xyflow/react": "^12.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.40.0",
    "axios": "^1.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

`packages/web/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

`packages/web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

`packages/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
```

`packages/web/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FlowForge - AI Workflow Automation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Verify build**

Run: `pnpm install && pnpm build`
Expected: All packages compile without errors.

---

### Task 2: Shared Types & Schemas

**Files:**
- Create: `packages/shared/src/types/flow.ts`
- Create: `packages/shared/src/types/execution.ts`
- Create: `packages/shared/src/types/node.ts`
- Create: `packages/shared/src/types/trigger.ts`
- Create: `packages/shared/src/schemas/flow.schema.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create flow types**

`packages/shared/src/types/flow.ts`:
```typescript
export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number }; // UI only
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // 'true' | 'false' for condition nodes
  targetHandle?: string;
}

export type NodeType =
  | 'webhook'
  | 'manual'
  | 'http'
  | 'llm'
  | 'condition'
  | 'loop'
  | 'code'
  | 'transform';
```

- [ ] **Step 2: Create execution types**

`packages/shared/src/types/execution.ts`:
```typescript
export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'timeout';

export interface Execution {
  id: string;
  flowId: string;
  status: ExecutionStatus;
  steps: StepOutput[];
  input: unknown;
  output: unknown;
  error?: string;
  startedAt: Date;
  finishedAt?: Date;
  duration?: number;
}

export interface StepOutput {
  nodeId: string;
  nodeType: NodeType;
  status: 'success' | 'failed' | 'skipped';
  input: unknown;
  output: unknown;
  error?: string;
  duration?: number;
}

export type { NodeType } from './flow';
```

- [ ] **Step 3: Create node config types**

`packages/shared/src/types/node.ts`:
```typescript
import type { NodeType } from './flow';

export interface NodeDefinition {
  type: NodeType;
  label: string;
  category: 'trigger' | 'action' | 'logic';
  description: string;
  icon: string;
  configSchema: Record<string, NodeProperty>;
}

export interface NodeProperty {
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'json';
  label: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  webhook: {
    type: 'webhook',
    label: 'Webhook',
    category: 'trigger',
    description: 'Trigger flow via HTTP webhook',
    icon: 'webhook',
    configSchema: {
      path: { type: 'text', label: 'Path', required: true, placeholder: '/my-webhook' },
      method: { type: 'select', label: 'Method', defaultValue: 'POST', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
      ]},
    },
  },
  manual: {
    type: 'manual',
    label: 'Manual Trigger',
    category: 'trigger',
    description: 'Trigger flow manually',
    icon: 'play',
    configSchema: {},
  },
  http: {
    type: 'http',
    label: 'HTTP Request',
    category: 'action',
    description: 'Make HTTP requests to any API',
    icon: 'globe',
    configSchema: {
      url: { type: 'text', label: 'URL', required: true, placeholder: 'https://api.example.com' },
      method: { type: 'select', label: 'Method', defaultValue: 'GET', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' },
      ]},
      headers: { type: 'json', label: 'Headers', defaultValue: '{}' },
      body: { type: 'json', label: 'Body' },
    },
  },
  llm: {
    type: 'llm',
    label: 'AI / LLM Call',
    category: 'action',
    description: 'Call any OpenAI-compatible LLM',
    icon: 'brain',
    configSchema: {
      model: { type: 'text', label: 'Model', defaultValue: 'gpt-4o-mini' },
      systemPrompt: { type: 'textarea', label: 'System Prompt' },
      userPrompt: { type: 'textarea', label: 'User Prompt', required: true },
      temperature: { type: 'number', label: 'Temperature', defaultValue: 0.7 },
      maxTokens: { type: 'number', label: 'Max Tokens', defaultValue: 1024 },
    },
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    category: 'logic',
    description: 'Branch flow based on condition',
    icon: 'git-branch',
    configSchema: {
      expression: { type: 'text', label: 'Expression', required: true, placeholder: '{{step1.output.status}} == "success"' },
    },
  },
  loop: {
    type: 'loop',
    label: 'Loop',
    category: 'logic',
    description: 'Iterate over array items',
    icon: 'repeat',
    configSchema: {
      items: { type: 'text', label: 'Array Expression', required: true, placeholder: '{{step1.output.items}}' },
    },
  },
  code: {
    type: 'code',
    label: 'Code',
    category: 'action',
    description: 'Run custom JavaScript',
    icon: 'code',
    configSchema: {
      code: { type: 'textarea', label: 'JavaScript', required: true, placeholder: 'return { result: input.data }' },
    },
  },
  transform: {
    type: 'transform',
    label: 'Transform',
    category: 'action',
    description: 'Map, filter, or set data',
    icon: 'shuffle',
    configSchema: {
      operation: { type: 'select', label: 'Operation', required: true, options: [
        { label: 'Map', value: 'map' },
        { label: 'Filter', value: 'filter' },
        { label: 'Set', value: 'set' },
      ]},
      expression: { type: 'textarea', label: 'Expression', required: true },
    },
  },
};
```

- [ ] **Step 4: Create trigger types**

`packages/shared/src/types/trigger.ts`:
```typescript
export interface WebhookPayload {
  flowId: string;
  data: unknown;
  headers: Record<string, string>;
  query: Record<string, string>;
  timestamp: Date;
}

export interface ManualTriggerInput {
  flowId: string;
  input?: unknown;
}
```

- [ ] **Step 5: Create Zod schemas**

`packages/shared/src/schemas/flow.schema.ts`:
```typescript
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
```

- [ ] **Step 6: Create barrel export**

`packages/shared/src/index.ts`:
```typescript
export * from './types/flow';
export * from './types/execution';
export * from './types/node';
export * from './types/trigger';
export * from './schemas/flow.schema';
```

- [ ] **Step 7: Verify build**

Run: `pnpm --filter @flowforge/shared build`
Expected: Compiles cleanly, types exported correctly.

---

### Task 3: Database Schema & Prisma Setup

**Files:**
- Create: `packages/server/prisma/schema.prisma`
- Create: `packages/server/src/db/prisma.ts`

- [ ] **Step 1: Create Prisma schema**

`packages/server/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Flow {
  id        String   @id @default(uuid())
  name      String
  nodes     Json
  edges     Json
  active    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  runs      Execution[]
}

model Execution {
  id         String   @id @default(uuid())
  flowId     String
  status     String   @default("pending")
  steps      Json     @default("[]")
  input      Json?
  output     Json?
  error      String?
  startedAt  DateTime @default(now())
  finishedAt DateTime?
  duration   Int?
  flow       Flow     @relation(fields: [flowId], references: [id], onDelete: Cascade)

  @@index([flowId])
  @@index([status])
}
```

- [ ] **Step 2: Create Prisma client singleton**

`packages/server/src/db/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Generate Prisma client**

Run: `cd packages/server && npx prisma generate`
Run: `docker compose up -d` (ensure postgres running)
Run: `cd packages/server && npx prisma migrate dev --name init`
Expected: Migration created and applied.

---

## Phase 2: Execution Engine

### Task 4: Engine Core - Base Node, Registry, Context

**Files:**
- Create: `packages/engine/src/nodes/base.ts`
- Create: `packages/engine/src/registry.ts`
- Create: `packages/engine/src/context.ts`
- Create: `packages/engine/src/expression.ts`
- Create: `packages/engine/src/index.ts`

- [ ] **Step 1: Create base node class**

`packages/engine/src/nodes/base.ts`:
```typescript
import type { FlowNode, StepOutput, NodeType } from '@flowforge/shared';

export abstract class BaseNode {
  abstract readonly type: NodeType;

  abstract execute(
    node: FlowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<unknown>;

  protected async runWithTiming(
    node: FlowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<StepOutput> {
    const start = Date.now();
    try {
      const output = await this.execute(node, input, context);
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'success',
        input,
        output,
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        nodeType: node.type,
        status: 'failed',
        input,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - start,
      };
    }
  }
}

// ExecutionContext imported from context.ts - avoid circular by defining here
import type { FlowNode as FN } from '@flowforge/shared';
export interface ExecutionContext {
  getStepOutput(nodeId: string): unknown;
  setStepOutput(nodeId: string, output: unknown): void;
  resolveExpression(expr: string): unknown;
}
```

- [ ] **Step 2: Create node registry**

`packages/engine/src/registry.ts`:
```typescript
import type { BaseNode } from './nodes/base';
import type { NodeType } from '@flowforge/shared';

export class NodeRegistry {
  private nodes = new Map<NodeType, BaseNode>();

  register(node: BaseNode): void {
    this.nodes.set(node.type, node);
  }

  get(type: NodeType): BaseNode {
    const handler = this.nodes.get(type);
    if (!handler) throw new Error(`Unknown node type: ${type}`);
    return handler;
  }

  has(type: NodeType): boolean {
    return this.nodes.has(type);
  }
}
```

- [ ] **Step 3: Create execution context**

`packages/engine/src/context.ts`:
```typescript
import type { StepOutput } from '@flowforge/shared';

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
```

- [ ] **Step 4: Create expression resolver (standalone)**

`packages/engine/src/expression.ts`:
```typescript
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
```

- [ ] **Step 5: Create engine barrel export**

`packages/engine/src/index.ts`:
```typescript
export * from './executor';
export * from './registry';
export * from './context';
export * from './nodes/base';
```

- [ ] **Step 6: Verify build**

Run: `pnpm --filter @flowforge/engine build`
Expected: Compiles cleanly.

---

### Task 5: Node Implementations (HTTP, LLM, Condition, Code, Transform, Trigger)

**Files:**
- Create: `packages/engine/src/nodes/trigger.ts`
- Create: `packages/engine/src/nodes/http.ts`
- Create: `packages/engine/src/nodes/llm.ts`
- Create: `packages/engine/src/nodes/condition.ts`
- Create: `packages/engine/src/nodes/code.ts`
- Create: `packages/engine/src/nodes/transform.ts`

- [ ] **Step 1: Implement trigger nodes**

`packages/engine/src/nodes/trigger.ts`:
```typescript
import { BaseNode } from './base';
import type { FlowNode, ExecutionContext } from './base';

export class WebhookTrigger extends BaseNode {
  readonly type = 'webhook' as const;

  async execute(node: FlowNode, input: unknown, _context: ExecutionContext): Promise<unknown> {
    // Webhook trigger just passes through the webhook payload
    return input;
  }
}

export class ManualTrigger extends BaseNode {
  readonly type = 'manual' as const;

  async execute(_node: FlowNode, input: unknown, _context: ExecutionContext): Promise<unknown> {
    return input ?? {};
  }
}
```

- [ ] **Step 2: Implement HTTP request node**

`packages/engine/src/nodes/http.ts`:
```typescript
import axios from 'axios';
import { BaseNode, type ExecutionContext, type FlowNode } from './base';

export class HttpRequestNode extends BaseNode {
  readonly type = 'http' as const;

  async execute(node: FlowNode, _input: unknown, context: ExecutionContext): Promise<unknown> {
    const config = node.config;
    const url = context.resolveExpression(config.url as string) as string;
    const method = (config.method as string) || 'GET';
    const headers = typeof config.headers === 'string'
      ? JSON.parse(config.headers)
      : (config.headers as Record<string, string> || {});
    const body = config.body ? context.resolveExpression(JSON.stringify(config.body)) : undefined;

    const response = await axios({
      url,
      method,
      headers: typeof headers === 'string' ? JSON.parse(headers) : headers,
      data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
      validateStatus: () => true, // Don't throw on error status
    });

    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
    };
  }
}
```

- [ ] **Step 3: Implement LLM node**

`packages/engine/src/nodes/llm.ts`:
```typescript
import OpenAI from 'openai';
import { BaseNode, type ExecutionContext, type FlowNode } from './base';

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
```

- [ ] **Step 4: Implement condition node**

`packages/engine/src/nodes/condition.ts`:
```typescript
import { evaluateExpression } from '../expression';
import { BaseNode, type ExecutionContext, type FlowNode } from './base';

export class ConditionNode extends BaseNode {
  readonly type = 'condition' as const;

  async execute(node: FlowNode, _input: unknown, context: ExecutionContext): Promise<unknown> {
    const expression = context.resolveExpression(node.config.expression as string) as string;
    const allOutputs = (context as any).getAllOutputs?.() ?? {};
    const result = evaluateExpression(expression, allOutputs);
    return { result };
  }
}
```

- [ ] **Step 5: Implement code node**

`packages/engine/src/nodes/code.ts`:
```typescript
import { BaseNode, type ExecutionContext, type FlowNode } from './base';

export class CodeExecutionNode extends BaseNode {
  readonly type = 'code' as const;

  async execute(node: FlowNode, input: unknown, context: ExecutionContext): Promise<unknown> {
    const code = node.config.code as string;
    if (!code) throw new Error('No code provided');

    // MVP: direct eval. TODO: sandbox with V8 isolates
    const allOutputs = (context as any).getAllOutputs?.() ?? {};
    const fn = new Function('input', 'context', `"use strict"; ${code}`);
    return fn(input, { outputs: allOutputs });
  }
}
```

- [ ] **Step 6: Implement transform node**

`packages/engine/src/nodes/transform.ts`:
```typescript
import { BaseNode, type ExecutionContext, type FlowNode } from './base';

export class TransformNode extends BaseNode {
  readonly type = 'transform' as const;

  async execute(node: FlowNode, input: unknown, context: ExecutionContext): Promise<unknown> {
    const operation = node.config.operation as string;
    const expression = node.config.expression as string;

    switch (operation) {
      case 'set': {
        return context.resolveExpression(expression);
      }
      case 'map': {
        if (!Array.isArray(input)) throw new Error('Map requires array input');
        const fn = new Function('item', 'index', `"use strict"; return ${expression}`);
        return input.map(fn);
      }
      case 'filter': {
        if (!Array.isArray(input)) throw new Error('Filter requires array input');
        const fn = new Function('item', 'index', `"use strict"; return ${expression}`);
        return input.filter(fn);
      }
      default:
        throw new Error(`Unknown transform operation: ${operation}`);
    }
  }
}
```

- [ ] **Step 7: Verify build**

Run: `pnpm --filter @flowforge/engine build`
Expected: All node implementations compile.

---

### Task 6: Flow Executor (DAG Traversal & Execution)

**Files:**
- Create: `packages/engine/src/executor.ts`
- Modify: `packages/engine/src/index.ts` (add executor export)

- [ ] **Step 1: Implement FlowExecutor**

`packages/engine/src/executor.ts`:
```typescript
import type { Flow, FlowNode, FlowEdge, StepOutput, Execution } from '@flowforge/shared';
import { NodeRegistry } from './registry';
import { FlowExecutionContext } from './context';

export class FlowExecutor {
  constructor(private registry: NodeRegistry) {}

  async execute(
    flow: Flow,
    input: unknown,
    startNodeId?: string,
  ): Promise<Omit<Execution, 'id' | 'flowId'>> {
    const context = new FlowExecutionContext();
    const steps: StepOutput[] = [];
    const startedAt = new Date();

    // Find start node (first trigger, or specified node)
    const triggerNode = startNodeId
      ? flow.nodes.find(n => n.id === startNodeId)
      : flow.nodes.find(n => ['webhook', 'manual'].includes(n.type));

    if (!triggerNode) {
      throw new Error('No trigger node found');
    }

    // Execute trigger
    const triggerHandler = this.registry.get(triggerNode.type);
    const triggerResult = await triggerHandler['runWithTiming'](triggerNode, input, context);
    steps.push(triggerResult);
    if (triggerResult.status === 'failed') {
      return this.buildResult(steps, startedAt, triggerResult.error);
    }

    // BFS through the DAG
    const visited = new Set<string>([triggerNode.id]);
    const queue = this.getOutgoingEdges(flow.edges, triggerNode.id).map(e => e.target);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      const node = flow.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Gather inputs from all incoming edges
      const incomingEdges = flow.edges.filter(e => e.target === nodeId);
      const nodeInput = incomingEdges.length > 0
        ? context.getStepOutput(incomingEdges[0].source)
        : input;

      // Special handling for condition nodes
      if (node.type === 'condition') {
        const handler = this.registry.get(node.type);
        const result = await handler['runWithTiming'](node, nodeInput, context);
        steps.push(result);

        if (result.status === 'failed') {
          return this.buildResult(steps, startedAt, result.error);
        }

        const conditionResult = (result.output as any)?.result;
        const outgoingEdges = flow.edges.filter(e => e.source === nodeId);
        for (const edge of outgoingEdges) {
          const shouldTraverse = conditionResult
            ? edge.sourceHandle !== 'false'
            : edge.sourceHandle === 'false';
          if (shouldTraverse) {
            queue.push(edge.target);
          }
        }
        visited.add(nodeId);
        continue;
      }

      // Normal node execution
      const handler = this.registry.get(node.type);
      const result = await handler['runWithTiming'](node, nodeInput, context);
      steps.push(result);

      if (result.status === 'failed') {
        return this.buildResult(steps, startedAt, result.error);
      }

      // Add outgoing edges to queue
      const outgoingEdges = flow.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      }

      visited.add(nodeId);
    }

    return this.buildResult(steps, startedAt);
  }

  private getOutgoingEdges(edges: FlowEdge[], nodeId: string): FlowEdge[] {
    return edges.filter(e => e.source === nodeId);
  }

  private buildResult(
    steps: StepOutput[],
    startedAt: Date,
    error?: string,
  ): Omit<Execution, 'id' | 'flowId'> {
    const finishedAt = new Date();
    const lastStep = steps[steps.length - 1];
    return {
      status: error ? 'failed' : 'success',
      steps,
      input: null,
      output: lastStep?.status === 'success' ? lastStep.output : null,
      error,
      startedAt,
      finishedAt,
      duration: finishedAt.getTime() - startedAt.getTime(),
    };
  }
}
```

- [ ] **Step 2: Create engine entry point with default registry**

`packages/engine/src/index.ts` (update):
```typescript
export * from './executor';
export * from './registry';
export * from './context';
export * from './nodes/base';

// Default registry setup
import { NodeRegistry } from './registry';
import { FlowExecutor } from './executor';
import { WebhookTrigger, ManualTrigger } from './nodes/trigger';
import { HttpRequestNode } from './nodes/http';
import { LLMCallNode } from './nodes/llm';
import { ConditionNode } from './nodes/condition';
import { CodeExecutionNode } from './nodes/code';
import { TransformNode } from './nodes/transform';

export function createDefaultExecutor(): FlowExecutor {
  const registry = new NodeRegistry();
  registry.register(new WebhookTrigger());
  registry.register(new ManualTrigger());
  registry.register(new HttpRequestNode());
  registry.register(new LLMCallNode());
  registry.register(new ConditionNode());
  registry.register(new CodeExecutionNode());
  registry.register(new TransformNode());
  return new FlowExecutor(registry);
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm --filter @flowforge/engine build`
Expected: Clean build.

---

## Phase 3: API Server

### Task 7: Fastify Server Setup & Flow Routes

**Files:**
- Create: `packages/server/src/app.ts`
- Create: `packages/server/src/index.ts`
- Create: `packages/server/src/routes/flows.ts`
- Create: `packages/server/src/services/flow.service.ts`

- [ ] **Step 1: Create flow service**

`packages/server/src/services/flow.service.ts`:
```typescript
import { prisma } from '../db/prisma';
import type { Flow } from '@flowforge/shared';

export async function getAllFlows(): Promise<Flow[]> {
  const flows = await prisma.flow.findMany({ orderBy: { updatedAt: 'desc' } });
  return flows.map(f => ({
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

export async function updateFlow(id: string, data: Partial<{ name: string; nodes: any[]; edges: any[]; active: boolean }>): Promise<Flow> {
  const flow = await prisma.flow.update({ where: { id }, data });
  return { ...flow, nodes: flow.nodes as any, edges: flow.edges as any };
}

export async function deleteFlow(id: string): Promise<void> {
  await prisma.flow.delete({ where: { id } });
}
```

- [ ] **Step 2: Create flow routes**

`packages/server/src/routes/flows.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import * as flowService from '../services/flow.service';

export async function flowRoutes(app: FastifyInstance) {
  app.get('/api/flows', async () => flowService.getAllFlows());
  app.get('/api/flows/:id', async (req) => flowService.getFlow((req.params as any).id));
  app.post('/api/flows', async (req) => flowService.createFlow(req.body as any));
  app.put('/api/flows/:id', async (req) => flowService.updateFlow((req.params as any).id, req.body as any));
  app.delete('/api/flows/:id', async (req) => flowService.deleteFlow((req.params as any).id));
}
```

- [ ] **Step 3: Create app bootstrap**

`packages/server/src/app.ts`:
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { flowRoutes } from './routes/flows';
import { executionRoutes } from './routes/executions';
import { webhookRoutes } from './routes/webhooks';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  await app.register(flowRoutes);
  await app.register(executionRoutes);
  await app.register(webhookRoutes);

  return app;
}
```

- [ ] **Step 4: Create server entry point**

`packages/server/src/index.ts`:
```typescript
import { buildApp } from './app';

const port = parseInt(process.env.SERVER_PORT || '3001', 10);

async main() {
  const app = await buildApp();
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`FlowForge server running on port ${port}`);
}

main().catch(console.error);
```

- [ ] **Step 5: Verify server starts**

Run: `cd packages/server && npx tsx src/index.ts`
Expected: Server starts on port 3001, logs "FlowForge server running".

---

### Task 8: Execution Routes & Queue Integration

**Files:**
- Create: `packages/server/src/routes/executions.ts`
- Create: `packages/server/src/services/execution.service.ts`
- Create: `packages/server/src/queue/flow-queue.ts`

- [ ] **Step 1: Create BullMQ queue setup**

`packages/server/src/queue/flow-queue.ts`:
```typescript
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
    const { flowId, input } = job.data;

    // Update status to running
    await prisma.execution.update({
      where: { id: job.id },
      data: { status: 'running' },
    });

    // Get flow definition
    const flowRecord = await prisma.flow.findUnique({ where: { id: flowId } });
    if (!flowRecord) throw new Error(`Flow ${flowId} not found`);

    const flow = {
      ...flowRecord,
      nodes: flowRecord.nodes as any,
      edges: flowRecord.edges as any,
    };

    // Execute
    const result = await engine.execute(flow, input);

    // Save result
    await prisma.execution.update({
      where: { id: job.id },
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
```

- [ ] **Step 2: Create execution service**

`packages/server/src/services/execution.service.ts`:
```typescript
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

  await flowQueue.add('execute', { flowId, input }, { jobId: execution.id });

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
```

- [ ] **Step 3: Create execution routes**

`packages/server/src/routes/executions.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import * as executionService from '../services/execution.service';

export async function executionRoutes(app: FastifyInstance) {
  app.post('/api/flows/:id/run', async (req) => {
    const flowId = (req.params as any).id;
    const input = (req.body as any)?.input;
    return executionService.runFlow(flowId, input);
  });

  app.get('/api/flows/:id/runs', async (req) => {
    const flowId = (req.params as any).id;
    return executionService.getFlowExecutions(flowId);
  });

  app.get('/api/runs/:id', async (req) => {
    const id = (req.params as any).id;
    return executionService.getExecution(id);
  });
}
```

- [ ] **Step 4: Update app.ts to start worker**

Update `packages/server/src/app.ts` to include:
```typescript
import { createWorker } from './queue/flow-queue';

// After registering routes:
const worker = createWorker();
app.addHook('onClose', async () => {
  await worker.close();
});
```

- [ ] **Step 5: Verify execution**

Run: `docker compose up -d` (ensure Redis running)
Run: `cd packages/server && npx tsx src/index.ts`
Test: `curl -X POST http://localhost:3001/api/flows -H 'Content-Type: application/json' -d '{"name":"Test","nodes":[{"id":"t1","type":"manual","label":"Manual","config":{}}],"edges":[]}'`
Expected: Flow created. Then trigger it and check execution.

---

### Task 9: Webhook Routes

**Files:**
- Create: `packages/server/src/routes/webhooks.ts`

- [ ] **Step 1: Create webhook handler**

`packages/server/src/routes/webhooks.ts`:
```typescript
import type { FastifyInstance } from 'fastify';
import { prisma } from '../db/prisma';
import { flowQueue } from '../queue/flow-queue';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/:flowId', async (req, reply) => {
    const { flowId } = req.params as { flowId: string };

    const flow = await prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow) return reply.code(404).send({ error: 'Flow not found' });

    const webhookNode = (flow.nodes as any[]).find(
      (n: any) => n.type === 'webhook'
    );
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
```

---

## Phase 4: Frontend - Visual Flow Builder

### Task 10: React App Shell & API Client

**Files:**
- Create: `packages/web/src/main.tsx`
- Create: `packages/web/src/App.tsx`
- Create: `packages/web/src/api/client.ts`
- Create: `packages/web/src/stores/flowStore.ts`
- Create: `packages/web/src/hooks/useFlow.ts`
- Create: `packages/web/src/hooks/useExecution.ts`

- [ ] **Step 1: Create API client**

`packages/web/src/api/client.ts`:
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface Flow {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  flowId: string;
  status: string;
  steps: any[];
  input: unknown;
  output: unknown;
  error?: string;
  startedAt: string;
  finishedAt?: string;
  duration?: number;
}

export const flowsApi = {
  getAll: () => api.get<Flow[]>('/flows'),
  getById: (id: string) => api.get<Flow>(`/flows/${id}`),
  create: (data: { name: string; nodes: any[]; edges: any[] }) => api.post<Flow>('/flows', data),
  update: (id: string, data: Partial<Flow>) => api.put<Flow>(`/flows/${id}`, data),
  delete: (id: string) => api.delete(`/flows/${id}`),
  run: (id: string, input?: unknown) => api.post<Execution>(`/flows/${id}/run`, { input }),
  getRuns: (id: string) => api.get<Execution[]>(`/flows/${id}/runs`),
  getRun: (runId: string) => api.get<Execution>(`/runs/${runId}`),
};
```

- [ ] **Step 2: Create Zustand store**

`packages/web/src/stores/flowStore.ts`:
```typescript
import { create } from 'zustand';
import type { ReactFlowJsonObject } from '@xyflow/react';

interface FlowState {
  nodes: any[];
  edges: any[];
  selectedNode: string | null;
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  setSelectedNode: (id: string | null) => void;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: any) => void;
}

export const useFlowStore = create<FlowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (id) => set({ selectedNode: id }),
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },
}));

// Re-export ReactFlow helpers
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
```

- [ ] **Step 3: Create hooks**

`packages/web/src/hooks/useFlow.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowsApi } from '../api/client';

export function useFlows() {
  return useQuery({ queryKey: ['flows'], queryFn: () => flowsApi.getAll().then(r => r.data) });
}

export function useFlow(id: string) {
  return useQuery({
    queryKey: ['flow', id],
    queryFn: () => flowsApi.getById(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: flowsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flows'] }),
  });
}

export function useUpdateFlow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => flowsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flow', id] });
      qc.invalidateQueries({ queryKey: ['flows'] });
    },
  });
}
```

`packages/web/src/hooks/useExecution.ts`:
```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { flowsApi } from '../api/client';

export function useRunFlow(flowId: string) {
  return useMutation({
    mutationFn: (input?: unknown) => flowsApi.run(flowId, input),
  });
}

export function useFlowRuns(flowId: string) {
  return useQuery({
    queryKey: ['runs', flowId],
    queryFn: () => flowsApi.getRuns(flowId).then(r => r.data),
    refetchInterval: 3000,
  });
}
```

- [ ] **Step 4: Create App shell**

`packages/web/src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

`packages/web/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}
```

`packages/web/src/App.tsx`:
```typescript
import { useState } from 'react';
import { FlowBuilder } from './components/FlowBuilder';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { useFlowStore } from './stores/flowStore';

export default function App() {
  const selectedNode = useFlowStore(s => s.selectedNode);

  return (
    <div className="flex h-screen w-screen">
      <NodePalette />
      <div className="flex-1 relative">
        <FlowBuilder />
      </div>
      {selectedNode && <NodeConfigPanel nodeId={selectedNode} />}
    </div>
  );
}
```

- [ ] **Step 5: Verify dev server**

Run: `pnpm --filter @flowforge/web dev`
Expected: Vite starts on port 5173, shows blank canvas.

---

### Task 11: Flow Builder Canvas (ReactFlow)

**Files:**
- Create: `packages/web/src/components/FlowBuilder.tsx`
- Create: `packages/web/src/components/NodePalette.tsx`
- Create: `packages/web/src/components/NodeWrapper.tsx`
- Create: `packages/web/src/components/NodeTypes/TriggerNode.tsx`
- Create: `packages/web/src/components/NodeTypes/ActionNode.tsx`
- Create: `packages/web/src/components/NodeTypes/ConditionNode.tsx`
- Create: `packages/web/src/components/NodeTypes/LLMNode.tsx`

- [ ] **Step 1: Create custom node components**

`packages/web/src/components/NodeTypes/TriggerNode.tsx`:
```typescript
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

export function TriggerNode({ data }: any) {
  return (
    <div className="px-4 py-2 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-600" />
        <span className="font-semibold text-sm text-amber-900">{data.label}</span>
      </div>
      <span className="text-xs text-amber-600">{data.type}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
    </div>
  );
}
```

`packages/web/src/components/NodeTypes/ActionNode.tsx`:
```typescript
import { Handle, Position } from '@xyflow/react';
import { Globe, Code, Shuffle } from 'lucide-react';

const iconMap: Record<string, any> = {
  http: Globe,
  code: Code,
  transform: Shuffle,
};

export function ActionNode({ data }: any) {
  const Icon = iconMap[data.type] || Globe;
  return (
    <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="font-semibold text-sm text-blue-900">{data.label}</span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
    </div>
  );
}
```

`packages/web/src/components/NodeTypes/ConditionNode.tsx`:
```typescript
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionNode({ data }: any) {
  return (
    <div className="px-4 py-3 bg-purple-50 border-2 border-purple-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2 justify-center">
        <GitBranch className="w-4 h-4 text-purple-600" />
        <span className="font-semibold text-sm text-purple-900">{data.label}</span>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <Handle type="source" position={Position.Bottom} id="true" className="!left-1/4 !bg-green-400" />
      <span className="absolute bottom-[-18px] left-1/4 text-[10px] text-green-600">True</span>
      <Handle type="source" position={Position.Bottom} id="false" className="!left-3/4 !bg-red-400" />
      <span className="absolute bottom-[-18px] left-3/4 text-[10px] text-red-600">False</span>
    </div>
  );
}
```

`packages/web/src/components/NodeTypes/LLMNode.tsx`:
```typescript
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

export function LLMNode({ data }: any) {
  return (
    <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-300 rounded-lg shadow-sm min-w-[180px]">
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-emerald-600" />
        <span className="font-semibold text-sm text-emerald-900">{data.label}</span>
      </div>
      <span className="text-xs text-emerald-600">{data.config?.model || 'gpt-4o-mini'}</span>
      <Handle type="target" position={Position.Top} className="!bg-emerald-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400" />
    </div>
  );
}
```

- [ ] **Step 2: Create node type map**

`packages/web/src/components/NodeWrapper.tsx`:
```typescript
import { TriggerNode } from './NodeTypes/TriggerNode';
import { ActionNode } from './NodeTypes/ActionNode';
import { ConditionNode } from './NodeTypes/ConditionNode';
import { LLMNode } from './NodeTypes/LLMNode';

export const nodeTypes = {
  webhook: TriggerNode,
  manual: TriggerNode,
  http: ActionNode,
  code: ActionNode,
  transform: ActionNode,
  condition: ConditionNode,
  llm: LLMNode,
  loop: ActionNode,
};
```

- [ ] **Step 3: Create FlowBuilder**

`packages/web/src/components/FlowBuilder.tsx`:
```typescript
import { useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './NodeWrapper';
import { useFlowStore } from '../stores/flowStore';

export function FlowBuilder() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode } = useFlowStore();

  const [rfNodes, setRfNodes] = useNodesState(nodes.map(n => ({
    id: n.id,
    type: n.type,
    position: n.position || { x: 0, y: 0 },
    data: n,
  })));

  const [rfEdges, setRfEdges] = useEdgesState(edges);

  const handleConnect = useCallback(
    (params: any) => {
      onConnect(params);
      setRfEdges((eds) => addEdge(params, eds));
    },
    [onConnect, setRfEdges],
  );

  const onNodeClick = useCallback(
    (_: any, node: any) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onNodeClick={onNodeClick}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

- [ ] **Step 4: Create NodePalette (draggable sidebar)**

`packages/web/src/components/NodePalette.tsx`:
```typescript
import { NODE_DEFINITIONS } from '@flowforge/shared';
import { useFlowStore } from '../stores/flowStore';

const nodeOrder: Array<'trigger' | 'action' | 'logic'> = ['trigger', 'action', 'logic'];

export function NodePalette() {
  const { nodes, setNodes } = useFlowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const def = NODE_DEFINITIONS[type as keyof typeof NODE_DEFINITIONS];
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      label: def.label,
      config: {},
      position,
    };

    setNodes([...nodes, newNode]);
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-bold text-gray-700 mb-4">Nodes</h2>
      {nodeOrder.map(category => (
        <div key={category} className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h3>
          <div className="space-y-2">
            {Object.values(NODE_DEFINITIONS)
              .filter(def => def.category === category)
              .map(def => (
                <div
                  key={def.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, def.type)}
                  className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded cursor-grab hover:bg-gray-100 text-sm"
                >
                  <span>{def.label}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create NodeConfigPanel**

`packages/web/src/components/NodeConfigPanel.tsx`:
```typescript
import { NODE_DEFINITIONS } from '@flowforge/shared';
import { useFlowStore } from '../stores/flowStore';
import { useUpdateFlow } from '../hooks/useFlow';

interface Props {
  nodeId: string;
}

export function NodeConfigPanel({ nodeId }: Props) {
  const { nodes, setNodes, setSelectedNode } = useFlowStore();
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const def = NODE_DEFINITIONS[node.type as keyof typeof NODE_DEFINITIONS];

  const updateField = (field: string, value: unknown) => {
    const updated = nodes.map(n =>
      n.id === nodeId ? { ...n, config: { ...n.config, [field]: value } } : n
    );
    setNodes(updated);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{def.label}</h2>
        <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{def.description}</p>

      {Object.entries(def.configSchema).map(([key, prop]) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {prop.label} {prop.required && <span className="text-red-500">*</span>}
          </label>
          {prop.type === 'textarea' ? (
            <textarea
              value={(node.config[key] as string) || ''}
              onChange={e => updateField(key, e.target.value)}
              placeholder={prop.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
              rows={4}
            />
          ) : prop.type === 'select' ? (
            <select
              value={(node.config[key] as string) || (prop.defaultValue as string) || ''}
              onChange={e => updateField(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {prop.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : prop.type === 'number' ? (
            <input
              type="number"
              value={(node.config[key] as number) ?? (prop.defaultValue as number) ?? ''}
              onChange={e => updateField(key, parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          ) : prop.type === 'json' ? (
            <textarea
              value={typeof node.config[key] === 'string' ? node.config[key] : JSON.stringify(node.config[key] || prop.defaultValue, null, 2)}
              onChange={e => {
                try { updateField(key, JSON.parse(e.target.value)); } catch { updateField(key, e.target.value); }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono resize-none"
              rows={4}
            />
          ) : (
            <input
              type="text"
              value={(node.config[key] as string) || ''}
              onChange={e => updateField(key, e.target.value)}
              placeholder={prop.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Verify frontend**

Run: `pnpm --filter @flowforge/web dev`
Expected: Shows sidebar with draggable nodes, canvas, and config panel on click.

---

### Task 12: Save/Load Flows & Run Execution UI

**Files:**
- Modify: `packages/web/src/App.tsx` (add save button, run button)
- Create: `packages/web/src/components/ExecutionLog.tsx`
- Create: `packages/web/src/components/Toolbar.tsx`

- [ ] **Step 1: Create Toolbar component**

`packages/web/src/components/Toolbar.tsx`:
```typescript
import { useFlowStore } from '../stores/flowStore';
import { useCreateFlow, useUpdateFlow } from '../hooks/useFlow';
import { useRunFlow } from '../hooks/useExecution';
import { Play, Save, Plus } from 'lucide-react';

interface Props {
  flowId?: string;
}

export function Toolbar({ flowId }: Props) {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const createFlow = useCreateFlow();
  const updateFlow = useUpdateFlow(flowId || '');
  const runFlow = useRunFlow(flowId || '');

  const handleSave = async () => {
    const data = {
      name: 'My Flow',
      nodes: nodes.map(({ position, ...rest }) => rest),
      edges,
    };

    if (flowId) {
      await updateFlow.mutateAsync(data);
    } else {
      const result = await createFlow.mutateAsync(data);
      window.history.pushState({}, '', `?flow=${result.data.id}`);
    }
  };

  const handleRun = async () => {
    await runFlow.mutateAsync();
  };

  const handleNew = () => {
    setNodes([]);
    setEdges([]);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <button onClick={handleNew} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
        <Plus className="w-4 h-4" /> New
      </button>
      <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded">
        <Save className="w-4 h-4" /> Save
      </button>
      {flowId && (
        <button onClick={handleRun} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded">
          <Play className="w-4 h-4" /> Run
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ExecutionLog**

`packages/web/src/components/ExecutionLog.tsx`:
```typescript
import { useFlowRuns } from '../hooks/useExecution';

interface Props {
  flowId: string;
}

export function ExecutionLog({ flowId }: Props) {
  const { data: runs, isLoading } = useFlowRuns(flowId);

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading runs...</div>;
  if (!runs?.length) return <div className="p-4 text-sm text-gray-500">No executions yet</div>;

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-sm text-gray-700">Recent Executions</h3>
      {runs.map(run => (
        <div key={run.id} className={`p-3 rounded border text-sm ${
          run.status === 'success' ? 'bg-green-50 border-green-200' :
          run.status === 'failed' ? 'bg-red-50 border-red-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex justify-between">
            <span className="font-mono text-xs">{run.id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              run.status === 'success' ? 'bg-green-200 text-green-800' :
              run.status === 'failed' ? 'bg-red-200 text-red-800' :
              'bg-yellow-200 text-yellow-800'
            }`}>{run.status}</span>
          </div>
          {run.duration && <span className="text-xs text-gray-500">{run.duration}ms</span>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update App.tsx**

Update `packages/web/src/App.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { FlowBuilder } from './components/FlowBuilder';
import { NodePalette } from './components/NodePalette';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { Toolbar } from './components/Toolbar';
import { ExecutionLog } from './components/ExecutionLog';
import { useFlowStore } from './stores/flowStore';
import { useFlow } from './hooks/useFlow';

function FlowForgeApp() {
  const [flowId, setFlowId] = useState<string | undefined>();
  const selectedNode = useFlowStore(s => s.selectedNode);
  const { data: flow } = useFlow(flowId || '');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('flow');
    if (id) setFlowId(id);
  }, []);

  useEffect(() => {
    if (flow) {
      useFlowStore.getState().setNodes(
        (flow.nodes as any[]).map((n: any) => ({
          ...n,
          position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
        }))
      );
      useFlowStore.getState().setEdges(flow.edges || []);
    }
  }, [flow]);

  return (
    <div className="flex h-screen w-screen">
      <NodePalette />
      <div className="flex-1 relative">
        <Toolbar flowId={flowId} />
        <FlowBuilder />
        {flowId && (
          <div className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-10">
            <ExecutionLog flowId={flowId} />
          </div>
        )}
      </div>
      {selectedNode && <NodeConfigPanel nodeId={selectedNode} />}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowForgeApp />
    </ReactFlowProvider>
  );
}
```

- [ ] **Step 4: Full integration test**

1. `docker compose up -d`
2. `pnpm dev`
3. Open http://localhost:5173
4. Drag nodes onto canvas, connect them, configure, save, run
5. Check execution log for results

---

## Phase 5: Polish & Docker

### Task 13: Docker Compose for Full Stack

**Files:**
- Update: `docker-compose.yml`
- Create: `packages/server/Dockerfile`
- Create: `packages/web/Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Update docker-compose.yml for full stack**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: flowforge
      POSTGRES_PASSWORD: flowforge
      POSTGRES_DB: flowforge
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U flowforge']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://flowforge:flowforge@postgres:5432/flowforge
      REDIS_URL: redis://redis:6379
      SERVER_PORT: '3001'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: packages/web/Dockerfile
    ports:
      - '80:80'
    depends_on:
      - server

volumes:
  pgdata:
```

- [ ] **Step 2: Create server Dockerfile**

`packages/server/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @flowforge/shared build
RUN pnpm --filter @flowforge/engine build
RUN pnpm --filter @flowforge/server build
RUN cd packages/server && npx prisma generate

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/package.json ./
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

- [ ] **Step 3: Create web Dockerfile**

`packages/web/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @flowforge/shared build
RUN pnpm --filter @flowforge/web build

FROM nginx:alpine
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 4: Create nginx config for web**

`packages/web/nginx.conf`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://server:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 5: Create .dockerignore**

```
node_modules
dist
.git
*.md
.env
```

---

## Summary of What This MVP Delivers

| Feature | Status |
|---|---|
| Visual drag-and-drop flow builder | ✅ |
| 8 node types (webhook, manual, HTTP, LLM, condition, loop, code, transform) | ✅ |
| Expression system (`{{node.output.field}}`) | ✅ |
| Flow save/load from PostgreSQL | ✅ |
| Async execution via Redis queue | ✅ |
| Execution history & status | ✅ |
| OpenAI-compatible LLM calls | ✅ |
| Webhook triggers | ✅ |
| Docker Compose deployment | ✅ |
| Conditional branching (true/false) | ✅ |

## What's NOT in MVP (Future Phases)

- Authentication / multi-user
- OAuth2 connection management for integrations
- Sandboxed code execution (V8 isolates)
- Loop iteration (nested sub-flows)
- Error handling per step (retry, continue)
- Flow templates
- Real-time execution progress (WebSocket)
- 280+ integration nodes
- API rate limiting
- Environment variables / secrets management
- Git sync / versioning
