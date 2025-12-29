/**
 * Cloud Tools
 * 
 * Docker y servicios cloud.
 */
import { exec } from "child_process";
import { promisify } from "util";
import { ToolDefinition, ok, fail } from "../../types/tool.js";

const execAsync = promisify(exec);

export const dockerList: ToolDefinition = {
    name: "docker_listar",
    description: "Lista contenedores Docker activos.",
    inputSchema: {
        type: "object",
        properties: { all: { type: "boolean" } }
    },
    execute: async (input) => {
        try {
            const cmd = input.all ? "docker ps -a" : "docker ps";
            const { stdout } = await execAsync(cmd);
            return ok(stdout);
        } catch (e: any) {
            return fail(`Docker error: ${e.message}`);
        }
    }
};

export const dockerLogs: ToolDefinition = {
    name: "docker_logs",
    description: "Obtiene logs de un contenedor.",
    inputSchema: {
        type: "object",
        properties: {
            container_id: { type: "string" },
            lines: { type: "number" }
        },
        required: ["container_id"]
    },
    execute: async (input) => {
        try {
            const n = (input.lines as number) || 50;
            const { stdout } = await execAsync(`docker logs --tail ${n} ${input.container_id}`);
            return ok(stdout);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const cloudToolsV4: ToolDefinition[] = [dockerList, dockerLogs];
