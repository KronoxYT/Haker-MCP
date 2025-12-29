# Haker-MCP

MCP server framework for exposing real system capabilities to AI agents.

## Problem

Integrating LLMs with real tools (APIs, filesystem, system commands) typically produces:

- Rigid, tightly coupled code
- Tools mixed with transport logic
- No clear contract for tool definitions
- Difficult to test and extend

Haker-MCP solves this by providing a **typed tool contract** and **unified registry** that decouples tool implementation from the MCP runtime.

## Architecture

```
src/
├── index.ts              # Bootstrap only (18 lines)
├── server.ts             # MCP server factory
├── types/tool.ts         # ToolDefinition contract
├── registry/tools.ts     # Single source of truth for all tools
└── tools/
    ├── filesystem/       # File operations
    ├── system/           # Shell, clipboard, notifications
    ├── memory/           # Persistent agent memory
    └── ...               # Your custom domains
```

**Key difference**: Adding a tool requires zero changes to `index.ts` or `server.ts`.

## Tool Contract

Every tool implements `ToolDefinition`:

```typescript
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  execute: (input: ToolInput) => Promise<ToolResult>;
}

interface ToolResult {
  success: boolean;
  data?: string | object;
  error?: string;
}
```

Helpers `ok()` and `fail()` simplify result creation.

## Installation

```bash
git clone https://github.com/KronoxYT/Haker-MCP.git
cd Haker-MCP
npm install
npm run build
```

Configure your MCP client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "haker-mcp": {
      "command": "node",
      "args": ["<path-to-project>/dist/index.js"]
    }
  }
}
```

## Use Case: Exposing Your SaaS to an AI Agent

Scenario: You have a SaaS with internal APIs. You want an AI agent to invoke them via MCP.

### 1. Define the Tool

```typescript
// src/tools/saas/index.ts
import { ToolDefinition, ok, fail } from "../../types/tool.js";

export const getUserStats: ToolDefinition = {
  name: "get_user_stats",
  description: "Fetches usage statistics for a user from the SaaS API.",
  inputSchema: {
    type: "object",
    properties: {
      user_id: { type: "string" }
    },
    required: ["user_id"]
  },
  execute: async (input) => {
    try {
      const res = await fetch(`https://api.your-saas.com/users/${input.user_id}/stats`);
      if (!res.ok) return fail(`API error: ${res.status}`);
      return ok(await res.json());
    } catch (e: any) {
      return fail(e.message);
    }
  }
};

export const saasTools: ToolDefinition[] = [getUserStats];
```

### 2. Register It

```typescript
// src/registry/tools.ts
import { saasTools } from "../tools/saas/index.js";

export const allTools: ToolDefinition[] = [
  ...filesystemTools,
  ...systemTools,
  ...saasTools  // Add your domain here
];
```

### 3. Rebuild

```bash
npm run build
```

The agent can now invoke `get_user_stats` without any changes to the MCP runtime.

## Built-in Tools

| Domain | Tools |
|:-------|:------|
| **filesystem** | `leer_archivo`, `escribir_archivo`, `listar_directorio` |
| **system** | `ejecutar_comando`, `info_sistema`, `captura_pantalla`, `abrir_navegador`, `leer_portapapeles`, `escribir_portapapeles`, `matar_proceso`, `enviar_notificacion` |
| **memory** | `memorizar`, `recordar`, `reflexionar`, `crear_agente` |
| **automation** | `generar_excel`, `leer_pdf`, `organizar_escritorio` |
| **security** | `generar_hash`, `quien_es_whois`, `escanear_red_completa` |
| **cloud** | `docker_listar`, `docker_logs` |

## Extending

1. Create `src/tools/<domain>/index.ts`
2. Export a `ToolDefinition[]`
3. Import and spread into `allTools` in `registry/tools.ts`
4. Run `npm run build`

No core files touched.

## Security

- `ejecutar_comando` runs arbitrary shell commands. Use with caution.
- Agent memory persists in `~/.haker_brain/`. Protect this directory.

## License

MIT
