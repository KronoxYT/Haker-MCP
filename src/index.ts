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

const execAsync = promisify(exec);

// Create server instance
const server = new Server(
    {
        name: "haker-mcp",
        version: "1.0.0",
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
                        command: {
                            type: "string",
                            description: "El comando a ejecutar (ej: 'dir', 'ipconfig', 'npm install')",
                        },
                    },
                    required: ["command"],
                },
            },
            {
                name: "read_file",
                description: "Lee el contenido de un archivo en cualquier ruta absoluta.",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "Ruta absoluta del archivo a leer",
                        },
                    },
                    required: ["path"],
                },
            },
            {
                name: "write_file",
                description: "Escribe contenido en un archivo. Crea el archivo si no existe.",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "Ruta absoluta del archivo",
                        },
                        content: {
                            type: "string",
                            description: "Contenido a escribir",
                        },
                    },
                    required: ["path", "content"],
                },
            },
            {
                name: "list_directory",
                description: "Lista los archivos y carpetas en un directorio.",
                inputSchema: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "Ruta del directorio a listar",
                        },
                    },
                    required: ["path"],
                },
            },
            {
                name: "system_info",
                description: "Obtiene informacion basica y AVANZADA del sistema (Hardware, Red, OS).",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "open_browser",
                description: "Abre una URL en un navegador especifico o el predeterminado. Soporta Chrome, Edge, OperaGX, Brave.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "La URL a abrir (ej: https://google.com)",
                        },
                        browser: {
                            type: "string",
                            enum: ["chrome", "edge", "operagx", "brave", "default"],
                            description: "Navegador a usar. Por defecto usa el del sistema.",
                        },
                    },
                    required: ["url"],
                },
            },
        ],
    };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        switch (name) {
            case "execute_command": {
                const { command } = args as { command: string };
                const { stdout, stderr } = await execAsync(command);
                return {
                    content: [
                        {
                            type: "text",
                            text: `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
                        },
                    ],
                };
            }

            case "read_file": {
                const { path: filePath } = args as { path: string };
                const data = await fs.readFile(filePath, "utf-8");
                return {
                    content: [{ type: "text", text: data }],
                };
            }

            case "write_file": {
                const { path: filePath, content } = args as { path: string; content: string };
                await fs.writeFile(filePath, content, "utf-8");
                return {
                    content: [{ type: "text", text: `Archivo escrito exitosamente en: ${filePath}` }],
                };
            }

            case "list_directory": {
                const { path: dirPath } = args as { path: string };
                const files = await fs.readdir(dirPath, { withFileTypes: true });
                const summary = files.map((f) =>
                    `${f.isDirectory() ? "[DIR]" : "[FILE]"} ${f.name}`
                ).join("\n");
                return {
                    content: [{ type: "text", text: summary }],
                };
            }

            case "system_info": {
                const cpus = os.cpus();
                const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
                const memFree = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
                const networks = os.networkInterfaces();

                let netInfo = "";
                for (const [name, nets] of Object.entries(networks)) {
                    if (nets) {
                        netInfo += `Interface: ${name}\n`;
                        nets.forEach(net => {
                            netInfo += `  - ${net.family} Address: ${net.address} (${net.mac})\n`;
                        });
                    }
                }

                const info = `
--- SYSTEM INFO ---
Hostname: ${os.hostname()}
OS: ${os.type()} ${os.release()} (${os.platform()} ${os.arch()})
Uptime: ${formatUptime(os.uptime())}
User: ${os.userInfo().username}

--- HARDWARE ---
Memory: ${memFree} GB free / ${memTotal} GB total
CPUs: ${cpus.length} x ${cpus[0].model}
Load Avg: ${os.loadavg().join(", ")}

--- NETWORK ---
${netInfo}
        `;
                return {
                    content: [{ type: "text", text: info.trim() }],
                };
            }

            case "open_browser": {
                const { url, browser = "default" } = args as { url: string; browser?: string };

                let startCommand = `start "${url}"`; // Default windows start

                // Custom browser logic for Windows
                switch (browser?.toLowerCase()) {
                    case "chrome":
                        startCommand = `start chrome "${url}"`;
                        break;
                    case "edge":
                        startCommand = `start msedge "${url}"`;
                        break;
                    case "operagx":
                        startCommand = `start "" "opera" "${url}" || start "" "operagx" "${url}"`;
                        break;
                    case "brave":
                        startCommand = `start brave "${url}"`;
                        break;
                    case "default":
                    default:
                        startCommand = `start "" "${url}"`;
                        break;
                }

                await execAsync(startCommand);

                return {
                    content: [{ type: "text", text: `Abriendo ${url} en ${browser}` }],
                };
            }

            default:
                throw new Error(`Herramienta desconocida: ${name}`);
        }
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error ejecutando herramienta ${request.params.name}: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Haker MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
