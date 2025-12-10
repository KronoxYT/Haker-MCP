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

const execAsync = promisify(exec);

// Create server instance
const server = new Server(
  {
    name: "haker-mcp",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper to format system uptime
function formatUptime(uptime: number): string {
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${hours}h ${minutes}m ${seconds}s`;
}

// Helper: Scan a single port
function checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(400); // 400ms timeout per port
        socket.on('connect', () => {
            socket.destroy();
            resolve(true); // Open
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
             resolve(false);
        });
        socket.connect(port, '127.0.0.1');
    });
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_command",
        description: "Ejecuta un comando de shell en la maquina host. ULTRA POTENTE. Usar con precaucion.",
        inputSchema: {
          type: "object",
          properties: {
            command: { type: "string", description: "El comando a ejecutar (ej: 'dir', 'ipconfig', 'npm install')" },
          },
          required: ["command"],
        },
      },
      {
        name: "read_file",
        description: "Lee el contenido de un archivo en cualquier ruta absoluta.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
      {
        name: "write_file",
        description: "Escribe contenido en un archivo. Crea el archivo si no existe.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" }, content: { type: "string" } },
          required: ["path", "content"],
        },
      },
      {
        name: "list_directory",
        description: "Lista los archivos y carpetas en un directorio.",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
      {
        name: "system_info",
        description: "Obtiene informacion basica y AVANZADA del sistema (Hardware, Red, OS).",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "open_browser",
        description: "Abre una URL en un navegador especifico (Chrome, Edge, OperaGX, Brave).",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
            browser: { type: "string", enum: ["chrome", "edge", "operagx", "brave", "default"] },
          },
          required: ["url"],
        },
      },
      // --- NEW TOOLS ---
      {
        name: "take_screenshot",
        description: "Toma una captura de pantalla del sistema y guarda la imagen.",
        inputSchema: {
          type: "object",
          properties: {
            output_path: { type: "string", description: "Ruta absoluta donde guardar la imagen (ej: C:/tmp/screen.jpg). Opcional, por defecto crea un temp." },
          },
        },
      },
      {
        name: "read_clipboard",
        description: "Lee el contenido de texto actual del portapapeles.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "write_clipboard",
        description: "Escribe texto en el portapapeles del sistema.",
        inputSchema: {
          type: "object",
          properties: { content: { type: "string", description: "Texto a copiar al clipboard" } },
          required: ["content"],
        },
      },
      {
        name: "kill_process",
        description: "Termina (MATA) un proceso por su ID (PID) o Nombre (ej: 'notepad.exe').",
        inputSchema: {
          type: "object",
          properties: {
            pid: { type: "number", description: "ID del proceso (opcional)" },
            name: { type: "string", description: "Nombre de la imagen del proceso (ej: chrome.exe) (opcional)" },
          },
        },
      },
      {
        name: "scan_ports",
        description: "Escanea puertos abiertos en localhost. Puede escanear un rango o una lista especifica.",
        inputSchema: {
          type: "object",
          properties: {
            startPort: { type: "number", description: "Puerto inicio del rango (defecto: buscar puertos comunes)" },
            endPort: { type: "number", description: "Puerto fin del rango" },
            specificPorts: { type: "array", items: { type: "number" }, description: "Lista de puertos especificos a escanear" },
          },
        },
      },
      {
        name: "send_notification",
        description: "Muestra una notificacion nativa del sistema en el escritorio.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titulo de la alerta" },
            message: { type: "string", description: "Mensaje de la alerta" },
          },
          required: ["title", "message"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    // Type casting helper
    const getArg = <T>(key: string): T => (args as any)[key];

    switch (name) {
      case "execute_command": {
        const { stdout, stderr } = await execAsync(getArg<string>("command"));
        return { content: [{ type: "text", text: `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}` }] };
      }
      case "read_file": {
        const data = await fs.readFile(getArg<string>("path"), "utf-8");
        return { content: [{ type: "text", text: data }] };
      }
      case "write_file": {
        await fs.writeFile(getArg<string>("path"), getArg<string>("content"), "utf-8");
        return { content: [{ type: "text", text: `Escrito: ${getArg<string>("path")}` }] };
      }
      case "list_directory": {
        const files = await fs.readdir(getArg<string>("path"), { withFileTypes: true });
        const summary = files.map(f => `${f.isDirectory() ? "[DIR]" : "[FILE]"} ${f.name}`).join("\n");
        return { content: [{ type: "text", text: summary }] };
      }
      case "system_info": {
        const cpus = os.cpus();
        const memFree = (os.freemem() / 1024 ** 3).toFixed(2);
        const memTotal = (os.totalmem() / 1024 ** 3).toFixed(2);
        const info = `
--- SYSTEM INFO ---
Hostname: ${os.hostname()}
OS: ${os.type()} ${os.release()} (${os.arch()})
Uptime: ${formatUptime(os.uptime())}
User: ${os.userInfo().username}
Mem: ${memFree}/${memTotal} GB
CPUs: ${cpus.length} x ${cpus[0].model}
        `;
        return { content: [{ type: "text", text: info.trim() }] };
      }
      case "open_browser": {
        const url = getArg<string>("url");
        const browser = getArg<string>("browser") || "default";
        let cmd = `start "" "${url}"`;
        if (browser === "chrome") cmd = `start chrome "${url}"`;
        if (browser === "edge") cmd = `start msedge "${url}"`;
        if (browser === "brave") cmd = `start brave "${url}"`;
        if (browser === "operagx") cmd = `start "" "opera" "${url}" || start "" "operagx" "${url}"`;
        await execAsync(cmd);
        return { content: [{ type: "text", text: `Opened ${url} in ${browser}` }] };
      }
      
      // --- NEW IMPLEMENTATIONS ---

      case "take_screenshot": {
        const customPath = getArg<string>("output_path");
        const imgPath = customPath || path.join(os.tmpdir(), `screenshot_${Date.now()}.jpg`);
        await screenshot({ filename: imgPath, format: 'jpg' });
        return { content: [{ type: "text", text: `Captura guardada en: ${imgPath}` }] };
      }

      case "read_clipboard": {
        const text = await clipboardy.read();
        return { content: [{ type: "text", text: text }] };
      }

      case "write_clipboard": {
        const content = getArg<string>("content");
        await clipboardy.write(content);
        return { content: [{ type: "text", text: "Portapapeles actualizado." }] };
      }

      case "kill_process": {
        const pid = getArg<number>("pid");
        const pName = getArg<string>("name");
        
        if (!pid && !pName) throw new Error("Debes proveer 'pid' o 'name'");

        if (pid) {
             // Basic process kill
             process.kill(pid);
             return { content: [{ type: "text", text: `Proceso PID ${pid} terminado.` }] };
        } else {
             // Force kill by name (Windows specific usually, but works via taskkill)
             const cmd = process.platform === "win32" 
                ? `taskkill /F /IM "${pName}"` 
                : `pkill -f "${pName}"`;
             await execAsync(cmd);
             return { content: [{ type: "text", text: `Procesos con nombre '${pName}' terminados.` }] };
        }
      }

      case "send_notification": {
         const title = getArg<string>("title");
         const msg = getArg<string>("message");
         notifier.notify({
            title: title,
            message: msg,
            sound: true,
            wait: false
         });
         return { content: [{ type: "text", text: `Notificacion enviada: "${title}"` }] };
      }

      case "scan_ports": {
        const start = getArg<number>("startPort");
        const end = getArg<number>("endPort");
        const specific = getArg<number[]>("specificPorts");

        let portsToScan: number[] = [];
        
        if (specific && specific.length > 0) {
            portsToScan = specific;
        } else if (start && end) {
            for (let i = start; i <= end; i++) portsToScan.push(i);
        } else {
            // Default common ports
            portsToScan = [21, 22, 23, 25, 53, 80, 110, 135, 139, 443, 445, 1433, 3000, 3306, 3389, 5432, 8000, 8080];
        }

        const openPorts: number[] = [];
        const closedPorts: number[] = []; // Opcional, maybe too spammy

        // Parallel scanning with limit? simple Promise.all is fast enough for small lists
        // For ranges, chunking is better, but let's keep it simple for now (User said "scan ports")
        // If range is huge, this might timeout.
        if (portsToScan.length > 500) throw new Error("Rango demasiado amplio. max 500 puertos.");
        
        const results = await Promise.all(portsToScan.map(async p => {
            const isOpen = await checkPort(p);
            return { port: p, open: isOpen };
        }));

        const open = results.filter(r => r.open).map(r => r.port);
        
        return { 
            content: [{ type: "text", text: `Puertos Abiertos en localhost:\n${open.join(", ") || "Ninguno encontrado en la lista escaneada."}` }] 
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Haker MCP Server v1.1.0 running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
