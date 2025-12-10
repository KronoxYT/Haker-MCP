// src/tools/cloud.ts
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const cloudTools = [
    {
        name: "docker_listar",
        description: "Lista contenedores Docker activos.",
        inputSchema: { type: "object", properties: { all: { type: "boolean" } } },
        handler: async (args: any) => {
            const cmd = args.all ? "docker ps -a" : "docker ps";
            try {
                const { stdout } = await execAsync(cmd);
                return stdout;
            } catch (e: any) { return `Error Docker: ${e.message}`; }
        }
    },
    {
        name: "docker_logs",
        description: "Obtiene logs de un contenedor.",
        inputSchema: { type: "object", properties: { container_id: { type: "string" }, lines: { type: "number" } }, required: ["container_id"] },
        handler: async (args: any) => {
            const n = args.lines || 50;
            try {
                const { stdout } = await execAsync(`docker logs --tail ${n} ${args.container_id}`);
                return stdout;
            } catch (e: any) { return `Error: ${e.message}`; }
        }
    },
    {
        name: "github_issues",
        description: "Stub: Obtener issues de GitHub (Requiere token en v3.1).",
        inputSchema: { type: "object", properties: { repo: { type: "string" } } },
        handler: async () => { return "GitHub API Integration not configured yet (Pending credentials)."; }
    }
];
