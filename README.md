# FlowForge

A visual workflow automation platform for AI agent orchestration — a lightweight, open-source alternative to Make.com.

## Features

- **Visual Flow Builder** — Drag-and-drop canvas powered by ReactFlow for designing workflows visually
- **8 Node Types** — Webhook, Manual Trigger, HTTP Request, AI/LLM Call, Condition, Loop, Code, Transform
- **Expression System** — Pass data between nodes using `{{node.output.field}}` templating
- **Async Execution Engine** — Queue-based processing with Redis + BullMQ for reliable, scalable execution
- **AI/LLM Integration** — Call any OpenAI-compatible LLM (OpenAI, Anthropic via proxy, local models, etc.)
- **Conditional Branching** — True/false paths for dynamic flow control
- **Execution History** — Track every run with step-by-step input/output inspection
- **Webhook Triggers** — Trigger workflows from external systems via HTTP

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, ReactFlow, Zustand, TanStack Query, TailwindCSS, Vite |
| **Backend** | Node.js, TypeScript, Fastify, Prisma ORM |
| **Execution** | Custom DAG traversal engine with node registry pattern |
| **Queue** | Redis + BullMQ |
| **Database** | PostgreSQL |
| **DevOps** | Docker Compose, Turbo (monorepo), pnpm workspaces |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Web (React)                     │
│  ┌──────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │NodePalette│→│ FlowBuilder │→│ ConfigPanel   │  │
│  └──────────┘  │ (ReactFlow) │  └───────────────┘  │
│                └─────────────┘                     │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────┐
│                  Server (Fastify)                    │
│  ┌──────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │Flow CRUD │  │Exec Routes  │  │Webhook Routes │  │
│  └────┬─────┘  └──────┬──────┘  └───────┬───────┘  │
│       └───────────────┼─────────────────┘           │
│                  ┌────▼─────┐                        │
│                  │ BullMQ   │                        │
│                  │  Queue   │                        │
│                  └────┬─────┘                        │
└───────────────────────┼─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│               Engine (Execution)                     │
│  ┌─────────────────────────────────────────────┐    │
│  │           FlowExecutor (DAG)                │    │
│  │  ┌──────┐ ┌────┐ ┌─────┐ ┌────┐ ┌───────┐  │    │
│  │  │HTTP  │→│LLM │→│Cond │→│Code│→│Xform  │  │    │
│  │  └──────┘ └────┘ └─────┘ └────┘ └───────┘  │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              PostgreSQL + Redis                      │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose v2

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/flowforge.git
cd flowforge

# 2. Install dependencies
pnpm install

# 3. Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# 4. Run database migrations
pnpm db:migrate

# 5. Start development servers
pnpm dev
```

Open **http://localhost:5173** to access the visual flow builder.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://flowforge:flowforge@localhost:5432/flowforge
REDIS_URL=redis://localhost:6379
SERVER_PORT=3001
OPENAI_API_KEY=sk-...          # Required for LLM nodes
OPENAI_BASE_URL=https://api.openai.com/v1  # Change for compatible providers
```

### Docker Deployment

```bash
docker compose up -d
```

This starts the full stack: PostgreSQL, Redis, API server (port 3001), and web UI (port 80).

## Usage

### Creating a Flow

1. **Drag nodes** from the left palette onto the canvas
2. **Connect nodes** by dragging from output handles to input handles
3. **Configure nodes** by clicking on them — the right panel opens with settings
4. **Save** your flow using the toolbar
5. **Run** manually or trigger via webhook

### Node Types

| Node | Category | Description |
|---|---|---|
| **Webhook** | Trigger | Receives HTTP POST requests to start a flow |
| **Manual** | Trigger | Start a flow manually from the UI |
| **HTTP Request** | Action | Make API calls to any service |
| **AI / LLM Call** | Action | Call OpenAI-compatible language models |
| **Condition** | Logic | Branch flow based on expressions |
| **Code** | Action | Run custom JavaScript |
| **Transform** | Action | Map, filter, or set data |
| **Loop** | Logic | Iterate over array items |

### Expression Syntax

Reference outputs from previous nodes using `{{nodeId.output.field}}`:

```
{{node_abc123.output.content}}
{{node_def456.output.status}} == "success"
{{node_ghi789.output.data.items}}
```

## Project Structure

```
flowforge/
├── packages/
│   ├── shared/          # Shared types, Zod schemas, node definitions
│   ├── engine/          # Flow execution engine (DAG traversal, node handlers)
│   ├── server/          # Fastify API, Prisma, BullMQ queue
│   └── web/             # React frontend (ReactFlow builder)
├── docker-compose.yml   # Full stack deployment
├── turbo.json           # Monorepo task orchestration
└── pnpm-workspace.yaml  # pnpm workspace config
```

## API Reference

### Flows

```bash
# List all flows
GET /api/flows

# Get a flow
GET /api/flows/:id

# Create a flow
POST /api/flows
{ "name": "My Flow", "nodes": [...], "edges": [...] }

# Update a flow
PUT /api/flows/:id

# Delete a flow
DELETE /api/flows/:id
```

### Executions

```bash
# Run a flow manually
POST /api/flows/:id/run
{ "input": { "key": "value" } }

# Get execution history
GET /api/flows/:id/runs

# Get a specific execution
GET /api/runs/:executionId
```

### Webhooks

```bash
# Trigger a flow via webhook
POST /api/webhooks/:flowId
```

## Development

```bash
# Build all packages
pnpm build

# Run all dev servers
pnpm dev

# Database commands
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema to database
```

## Roadmap

- [ ] Authentication & multi-user support
- [ ] OAuth2 connection management for integrations
- [ ] Sandboxed code execution (V8 isolates)
- [ ] Loop iteration with nested sub-flows
- [ ] Per-step error handling (retry, continue on failure)
- [ ] Flow templates & marketplace
- [ ] Real-time execution progress (WebSocket)
- [ ] 280+ integration nodes (Slack, Gmail, GitHub, etc.)
- [ ] Environment variables & secrets management
- [ ] Git sync & versioning

## License

MIT
