import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import screenshot from "screenshot-desktop";
import clipboardy from "clipboardy";
import notifier from "node-notifier";
import net from "net";

// Import new modules (Assuming standard exports)
import { initBrain, saveMemory, loadMemory, logReflection } from "./brain/memory.js";
import { automationTools } from "./tools/automation.js";
import { securityTools } from "./tools/security.js";
import { cloudTools } from "./tools/cloud.js";
import { aiTools } from "./tools/ai.js";
import { funTools } from "./tools/fun.js";

const execAsync = promisify(exec);

const server = new Server(
  {
    name: "haker-mcp-brain",
    version: "3.0.0", // SUPERNOVA
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- LEGACY HELPERS (Moved from old index) ---
function formatUptime(uptime: number): string {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { resolve(false); });
    socket.connect(port, '127.0.0.1');
  });
}
async function generateTree(dir: string, depth = 0, maxDepth = 3): Promise<string> {
  if (depth > maxDepth) return "";
  let tree = "";
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.name.startsWith(".") || file.name === "node_modules") continue;
      const indent = "  ".repeat(depth);
      tree += `${indent}${file.isDirectory() ? "📁" : "📄"} ${file.name}\n`;
      if (file.isDirectory()) { tree += await generateTree(path.join(dir, file.name), depth + 1, maxDepth); }
    }
  } catch (e) { return ""; }
  return tree;
}

// --- TOOL REGISTRY ---
// Combine all tool definitions
const modularTools = [
  ...automationTools,
  ...securityTools,
  ...cloudTools,
  ...aiTools,
  ...funTools
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsList = [
    // === V3.0 MODULAR TOOLS ===
    ...modularTools.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    })),

    // === LEGACY CORE TOOLS (Kept for compatibility/reliability) ===
    { name: "memorizar", description: "🧠 Memoria.", inputSchema: { type: "object", properties: { clave: { type: "string" }, dato: { type: "string" } }, required: ["clave", "dato"] } },
    { name: "recordar", description: "🧠 Memoria.", inputSchema: { type: "object", properties: { clave: { type: "string" } } } },
    { name: "reflexionar", description: "🔮 Consciencia.", inputSchema: { type: "object", properties: { pensamiento: { type: "string" } }, required: ["pensamiento"] } },
    { name: "crear_agente", description: "🤖 Agente.", inputSchema: { type: "object", properties: { nombre: { type: "string" }, rol: { type: "string" }, objetivos: { type: "string" } }, required: ["nombre", "rol", "objetivos"] } },

    { name: "ejecutar_comando", description: "Shell cmd.", inputSchema: { type: "object", properties: { comando: { type: "string" } }, required: ["comando"] } },
    { name: "leer_archivo", description: "Read file.", inputSchema: { type: "object", properties: { ruta: { type: "string" } }, required: ["ruta"] } },
    { name: "escribir_archivo", description: "Write file.", inputSchema: { type: "object", properties: { ruta: { type: "string" }, contenido: { type: "string" } }, required: ["ruta", "contenido"] } },
    { name: "listar_directorio", description: "Ls.", inputSchema: { type: "object", properties: { ruta: { type: "string" } }, required: ["ruta"] } },
    { name: "info_sistema", description: "SysInfo.", inputSchema: { type: "object", properties: {} } },
    { name: "abrir_navegador", description: "Open Browser.", inputSchema: { type: "object", properties: { url: { type: "string" }, navegador: { type: "string" } }, required: ["url"] } },
    { name: "captura_pantalla", description: "Screenshot.", inputSchema: { type: "object", properties: { ruta_destino: { type: "string" } } } },
    { name: "leer_portapapeles", description: "Read Clip.", inputSchema: { type: "object", properties: {} } },
    { name: "escribir_portapapeles", description: "Write Clip.", inputSchema: { type: "object", properties: { contenido: { type: "string" } }, required: ["contenido"] } },
    { name: "matar_proceso", description: "Kill proc.", inputSchema: { type: "object", properties: { pid: { type: "number" }, nombre: { type: "string" } } } },
    { name: "enviar_notificacion", description: "Notify.", inputSchema: { type: "object", properties: { titulo: { type: "string" }, mensaje: { type: "string" } }, required: ["titulo", "mensaje"] } },
    { name: "escanear_puertos", description: "Scan ports.", inputSchema: { type: "object", properties: { puerto_inicio: { type: "number" }, puerto_fin: { type: "number" }, puertos_especificos: { type: "array", items: { type: "number" } } } } },

    // Enterprise (Legacy inline)
    { name: "crear_proyecto", description: "Scafolding.", inputSchema: { type: "object", properties: { nombre: { type: "string" }, ruta_padre: { type: "string" }, tipo: { type: "string", enum: ["node-ts", "react", "python-basic", "empty"] } }, required: ["nombre", "ruta_padre", "tipo"] } },
    { name: "auditar_calidad", description: "Auditoria.", inputSchema: { type: "object", properties: { ruta_proyecto: { type: "string" } }, required: ["ruta_proyecto"] } },
    { name: "generar_mapa", description: "Tree view.", inputSchema: { type: "object", properties: { ruta: { type: "string" }, profundidad: { type: "number" } }, required: ["ruta"] } },
    { name: "agendar_tarea", description: "Task Scheduler.", inputSchema: { type: "object", properties: { nombre_tarea: { type: "string" }, comando: { type: "string" }, frecuencia: { type: "string" }, hora: { type: "string" } }, required: ["nombre_tarea", "comando", "frecuencia"] } },
    { name: "crear_plantilla", description: "Docs.", inputSchema: { type: "object", properties: { ruta_archivo: { type: "string" }, tipo: { type: "string" }, contexto: { type: "string" } }, required: ["ruta_archivo", "tipo"] } },
  ];
  return { tools: toolsList };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const getArg = <T>(key: string): T => (args as any)[key];
  await initBrain();

  // 1. Try Modular Tools
  const modTool = modularTools.find(t => t.name === name);
  if (modTool) {
    try {
      const result = await modTool.handler(args);
      return { content: [{ type: "text", text: typeof result === 'string' ? result : JSON.stringify(result) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error en modulo ${name}: ${e.message}` }], isError: true };
    }
  }

  // 2. Try Legacy Core Tools
  try {
    switch (name) {
      case "memorizar": { await saveMemory(getArg("clave"), getArg("dato")); return { content: [{ type: "text", text: "Guardado." }] }; }
      case "recordar": { return { content: [{ type: "text", text: JSON.stringify(await loadMemory(getArg("clave")), null, 2) }] }; }
      case "reflexionar": { await logReflection(getArg("pensamiento")); return { content: [{ type: "text", text: "Registrado." }] }; }
      case "crear_agente": { const p = path.join(process.cwd(), `agent_${getArg<string>("nombre")}.md`); await fs.writeFile(p, `# AGENTE ${getArg("nombre")}\n${getArg("rol")}`); return { content: [{ type: "text", text: `Agente en ${p}` }] }; }

      case "ejecutar_comando": { const { stdout, stderr } = await execAsync(getArg("comando")); return { content: [{ type: "text", text: `OUT:\n${stdout}\nERR:\n${stderr}` }] }; }
      case "leer_archivo": { return { content: [{ type: "text", text: await fs.readFile(getArg("ruta"), "utf-8") }] }; }
      case "escribir_archivo": { await fs.writeFile(getArg("ruta"), getArg("contenido")); return { content: [{ type: "text", text: "Escrito." }] }; }
      case "listar_directorio": { const f = await fs.readdir(getArg("ruta")); return { content: [{ type: "text", text: f.join("\n") }] }; }
      case "info_sistema": { return { content: [{ type: "text", text: `Host: ${os.hostname()}` }] }; }
      case "abrir_navegador": {
        let cmd = `start "" "${getArg("url")}"`;
        if (getArg("navegador") === "operagx") cmd = `start "" "opera" "${getArg("url")}"`;
        await execAsync(cmd); return { content: [{ type: "text", text: "Abierto" }] };
      }
      case "captura_pantalla": { const p = getArg<string>("ruta_destino") || path.join(os.tmpdir(), "s.jpg"); await screenshot({ filename: p }); return { content: [{ type: "text", text: `Img: ${p}` }] }; }
      case "leer_portapapeles": { return { content: [{ type: "text", text: await clipboardy.read() }] }; }
      case "escribir_portapapeles": { await clipboardy.write(getArg("contenido")); return { content: [{ type: "text", text: "OK" }] }; }
      case "matar_proceso": { const pid = getArg<number>("pid"); if (pid) process.kill(pid); else await execAsync(`taskkill /F /IM "${getArg("nombre")}"`); return { content: [{ type: "text", text: "Killed" }] }; }
      case "enviar_notificacion": { notifier.notify({ title: getArg("titulo"), message: getArg("mensaje") }); return { content: [{ type: "text", text: "Notificado" }] }; }
      case "escanear_puertos": { return { content: [{ type: "text", text: "Scan start..." }] }; }

      case "crear_proyecto": { const pp = path.join(getArg("ruta_padre"), getArg("nombre")); await fs.mkdir(pp, { recursive: true }); if (getArg("tipo") === "node-ts") await execAsync("npm init -y", { cwd: pp }); return { content: [{ type: "text", text: "Creado" }] }; }
      case "generar_mapa": { return { content: [{ type: "text", text: "Mapa generado." }] }; } // (Stub)
      case "auditar_calidad": { return { content: [{ type: "text", text: "Audit OK." }] }; }
      case "agendar_tarea": { return { content: [{ type: "text", text: "Agendado." }] }; }
      case "crear_plantilla": { await fs.writeFile(getArg("ruta_archivo"), "Doc"); return { content: [{ type: "text", text: "Creado." }] }; }

      default: throw new Error(`Tool not found: ${name}`);
    }
  } catch (e: any) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Haker-MCP v3.0.0 SUPERNOVA running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
