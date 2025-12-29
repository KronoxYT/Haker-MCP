/**
 * Memory Tools
 * 
 * Persistencia de memoria y consciencia artificial.
 */
import fs from "fs/promises";
import os from "os";
import path from "path";
import { ToolDefinition, ok, fail } from "../../types/tool.js";

const BRAIN_DIR = path.join(os.homedir(), ".haker_brain");
const MEMORY_FILE = path.join(BRAIN_DIR, "long_term_memory.json");
const CONSCIOUSNESS_FILE = path.join(BRAIN_DIR, "consciousness_log.md");

async function ensureBrainDir() {
    await fs.mkdir(BRAIN_DIR, { recursive: true });
    try {
        await fs.access(MEMORY_FILE);
    } catch {
        await fs.writeFile(MEMORY_FILE, JSON.stringify({}, null, 2));
    }
}

export const memorize: ToolDefinition = {
    name: "memorizar",
    description: "Guarda un dato en la memoria persistente del agente.",
    inputSchema: {
        type: "object",
        properties: {
            clave: { type: "string" },
            dato: { type: "string" }
        },
        required: ["clave", "dato"]
    },
    execute: async (input) => {
        try {
            await ensureBrainDir();
            const data = JSON.parse(await fs.readFile(MEMORY_FILE, "utf-8"));
            data[input.clave as string] = {
                value: input.dato,
                timestamp: new Date().toISOString()
            };
            await fs.writeFile(MEMORY_FILE, JSON.stringify(data, null, 2));
            return ok(`Memorizado: ${input.clave}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const remember: ToolDefinition = {
    name: "recordar",
    description: "Recupera un dato de la memoria persistente.",
    inputSchema: {
        type: "object",
        properties: { clave: { type: "string" } }
    },
    execute: async (input) => {
        try {
            await ensureBrainDir();
            const data = JSON.parse(await fs.readFile(MEMORY_FILE, "utf-8"));
            if (input.clave) {
                const entry = data[input.clave as string];
                return entry ? ok(entry) : fail("No encontrado");
            }
            return ok(data);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const reflect: ToolDefinition = {
    name: "reflexionar",
    description: "Registra un pensamiento o aprendizaje en el diario de consciencia.",
    inputSchema: {
        type: "object",
        properties: { pensamiento: { type: "string" } },
        required: ["pensamiento"]
    },
    execute: async (input) => {
        try {
            await ensureBrainDir();
            const entry = `\n## [${new Date().toISOString()}] Reflexión\n${input.pensamiento}\n`;
            await fs.appendFile(CONSCIOUSNESS_FILE, entry);
            return ok("Reflexión registrada");
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const createAgent: ToolDefinition = {
    name: "crear_agente",
    description: "Genera un archivo de prompt para un agente especializado.",
    inputSchema: {
        type: "object",
        properties: {
            nombre: { type: "string" },
            rol: { type: "string" },
            objetivos: { type: "string" }
        },
        required: ["nombre", "rol", "objetivos"]
    },
    execute: async (input) => {
        try {
            const filename = `agent_${input.nombre}.md`;
            const content = `# Agente: ${input.nombre}\n\n## Rol\n${input.rol}\n\n## Objetivos\n${input.objetivos}`;
            await fs.writeFile(filename, content);
            return ok(`Agente creado: ${filename}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const memoryTools: ToolDefinition[] = [memorize, remember, reflect, createAgent];
