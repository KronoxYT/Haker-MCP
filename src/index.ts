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
    version: "1.2.0",
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
        name: "ejecutar_comando",
        description: "Ejecuta un comando de shell en la maquina host. ULTRA POTENTE. Usar con precaucion.",
        inputSchema: {
          type: "object",
          properties: {
            comando: { type: "string", description: "El comando a ejecutar (ej: 'dir', 'ipconfig', 'npm install')" },
          },
          required: ["comando"],
        },
      },
      {
        name: "leer_archivo",
        description: "Lee el contenido de un archivo en cualquier ruta absoluta.",
        inputSchema: {
          type: "object",
          properties: { ruta: { type: "string", description: "Ruta absoluta del archivo" } },
          required: ["ruta"],
        },
      },
      {
        name: "escribir_archivo",
        description: "Escribe contenido en un archivo. Crea el archivo si no existe.",
        inputSchema: {
          type: "object",
          properties: {
            ruta: { type: "string", description: "Ruta absoluta del archivo" },
            contenido: { type: "string", description: "Contenido a escribir" }
          },
          required: ["ruta", "contenido"],
        },
      },
      {
        name: "listar_directorio",
        description: "Lista los archivos y carpetas en un directorio.",
        inputSchema: {
          type: "object",
          properties: { ruta: { type: "string", description: "Ruta del directorio a listar" } },
          required: ["ruta"],
        },
      },
      {
        name: "info_sistema",
        description: "Obtiene informacion basica y AVANZADA del sistema (Hardware, Red, OS).",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "abrir_navegador",
        description: "Abre una URL en un navegador especifico (Chrome, Edge, OperaGX, Brave).",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
            navegador: { type: "string", enum: ["chrome", "edge", "operagx", "brave", "default"], description: "Opcional. Por defecto usa el del sistema." },
          },
          required: ["url"],
        },
      },
      // --- NEW TOOLS ---
      {
        name: "captura_pantalla",
        description: "Toma una captura de pantalla del sistema y guarda la imagen.",
        inputSchema: {
          type: "object",
          properties: {
            ruta_destino: { type: "string", description: "Ruta absoluta donde guardar la imagen (ej: C:/tmp/screen.jpg). Opcional, por defecto crea un temp." },
          },
        },
      },
      {
        name: "leer_portapapeles",
        description: "Lee el contenido de texto actual del portapapeles.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "escribir_portapapeles",
        description: "Escribe texto en el portapapeles del sistema.",
        inputSchema: {
          type: "object",
          properties: { contenido: { type: "string", description: "Texto a copiar al clipboard" } },
          required: ["contenido"],
        },
      },
      {
        name: "matar_proceso",
        description: "Termina (MATA) un proceso por su ID (PID) o Nombre (ej: 'notepad.exe').",
        inputSchema: {
          type: "object",
          properties: {
            pid: { type: "number", description: "ID del proceso (opcional)" },
            nombre: { type: "string", description: "Nombre de la imagen del proceso (ej: chrome.exe) (opcional)" },
          },
        },
      },
      {
        name: "escanear_puertos",
        description: "Escanea puertos abiertos en localhost. Puede escanear un rango o una lista especifica.",
        inputSchema: {
          type: "object",
          properties: {
            puerto_inicio: { type: "number", description: "Puerto inicio del rango (defecto: buscar puertos comunes)" },
            puerto_fin: { type: "number", description: "Puerto fin del rango" },
            puertos_especificos: { type: "array", items: { type: "number" }, description: "Lista de puertos especificos a escanear" },
          },
        },
      },
      {
        name: "enviar_notificacion",
        description: "Muestra una notificacion nativa del sistema en el escritorio.",
        inputSchema: {
          type: "object",
          properties: {
            titulo: { type: "string", description: "Titulo de la alerta" },
            mensaje: { type: "string", description: "Mensaje de la alerta" },
          },
          required: ["titulo", "mensaje"],
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
      case "ejecutar_comando": {
        const { stdout, stderr } = await execAsync(getArg<string>("comando"));
        return { content: [{ type: "text", text: `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}` }] };
      }
      case "leer_archivo": {
        const data = await fs.readFile(getArg<string>("ruta"), "utf-8");
        return { content: [{ type: "text", text: data }] };
      }
      case "escribir_archivo": {
        await fs.writeFile(getArg<string>("ruta"), getArg<string>("contenido"), "utf-8");
        return { content: [{ type: "text", text: `Escrito: ${getArg<string>("ruta")}` }] };
      }
      case "listar_directorio": {
        const files = await fs.readdir(getArg<string>("ruta"), { withFileTypes: true });
        const summary = files.map(f => `${f.isDirectory() ? "[DIR]" : "[FILE]"} ${f.name}`).join("\n");
        return { content: [{ type: "text", text: summary }] };
      }
      case "info_sistema": {
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
      case "abrir_navegador": {
        const url = getArg<string>("url");
        const browser = getArg<string>("navegador") || "default";
        let cmd = `start "" "${url}"`;
        if (browser === "chrome") cmd = `start chrome "${url}"`;
        if (browser === "edge") cmd = `start msedge "${url}"`;
        if (browser === "brave") cmd = `start brave "${url}"`;
        if (browser === "operagx") cmd = `start "" "opera" "${url}" || start "" "operagx" "${url}"`;
        await execAsync(cmd);
        return { content: [{ type: "text", text: `Opened ${url} in ${browser}` }] };
      }

      // --- NEW IMPLEMENTATIONS ---

      case "captura_pantalla": {
        const customPath = getArg<string>("ruta_destino");
        const imgPath = customPath || path.join(os.tmpdir(), `screenshot_${Date.now()}.jpg`);
        await screenshot({ filename: imgPath, format: 'jpg' });
        return { content: [{ type: "text", text: `Captura guardada en: ${imgPath}` }] };
      }

      case "leer_portapapeles": {
        const text = await clipboardy.read();
        return { content: [{ type: "text", text: text }] };
      }

      case "escribir_portapapeles": {
        const content = getArg<string>("contenido");
        await clipboardy.write(content);
        return { content: [{ type: "text", text: "Portapapeles actualizado." }] };
      }

      case "matar_proceso": {
        const pid = getArg<number>("pid");
        const pName = getArg<string>("nombre");

        if (!pid && !pName) throw new Error("Debes proveer 'pid' o 'nombre'");

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

      case "enviar_notificacion": {
        const title = getArg<string>("titulo");
        const msg = getArg<string>("mensaje");
        notifier.notify({
          title: title,
          message: msg,
          sound: true,
          wait: false
        });
        return { content: [{ type: "text", text: `Notificacion enviada: "${title}"` }] };
      }

      case "escanear_puertos": {
        const start = getArg<number>("puerto_inicio");
        const end = getArg<number>("puerto_fin");
        const specific = getArg<number[]>("puertos_especificos");

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
        throw new Error(`Herramienta desconocida: ${name}`);
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
  console.error("Haker MCP Server v1.2.0 running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
