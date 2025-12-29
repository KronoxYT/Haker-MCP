/**
 * Filesystem Tools
 * 
 * Operaciones sobre archivos y directorios.
 */
import fs from "fs/promises";
import { ToolDefinition, ok, fail } from "../../types/tool.js";

export const readFile: ToolDefinition = {
    name: "leer_archivo",
    description: "Lee el contenido de un archivo de texto.",
    inputSchema: {
        type: "object",
        properties: { ruta: { type: "string", description: "Ruta absoluta del archivo" } },
        required: ["ruta"]
    },
    execute: async (input) => {
        try {
            const content = await fs.readFile(input.ruta as string, "utf-8");
            return ok(content);
        } catch (e: any) {
            return fail(`No se pudo leer: ${e.message}`);
        }
    }
};

export const writeFile: ToolDefinition = {
    name: "escribir_archivo",
    description: "Escribe contenido en un archivo. Crea el archivo si no existe.",
    inputSchema: {
        type: "object",
        properties: {
            ruta: { type: "string" },
            contenido: { type: "string" }
        },
        required: ["ruta", "contenido"]
    },
    execute: async (input) => {
        try {
            await fs.writeFile(input.ruta as string, input.contenido as string, "utf-8");
            return ok(`Archivo escrito: ${input.ruta}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const listDirectory: ToolDefinition = {
    name: "listar_directorio",
    description: "Lista archivos y subdirectorios en una ruta.",
    inputSchema: {
        type: "object",
        properties: { ruta: { type: "string" } },
        required: ["ruta"]
    },
    execute: async (input) => {
        try {
            const entries = await fs.readdir(input.ruta as string, { withFileTypes: true });
            const result = entries.map(e => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`).join("\n");
            return ok(result);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const filesystemTools: ToolDefinition[] = [readFile, writeFile, listDirectory];
