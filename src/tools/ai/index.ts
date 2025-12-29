/**
 * AI Tools
 * 
 * Stubs para integración con LLMs y RAG.
 */
import { ToolDefinition, ok } from "../../types/tool.js";

export const queryLlm: ToolDefinition = {
    name: "consultar_llm",
    description: "Consulta a un modelo de lenguaje (Stub - configurar API keys).",
    inputSchema: {
        type: "object",
        properties: {
            prompt: { type: "string" },
            modelo: { type: "string" }
        },
        required: ["prompt"]
    },
    execute: async (input) => {
        const model = (input.modelo as string) || "default";
        return ok(`[Stub] Respuesta simulada del modelo ${model} al prompt: "${input.prompt}"`);
    }
};

export const ragSearch: ToolDefinition = {
    name: "rag_simple",
    description: "Búsqueda RAG en documentos locales (Stub).",
    inputSchema: {
        type: "object",
        properties: {
            consulta: { type: "string" },
            directorio: { type: "string" }
        },
        required: ["consulta"]
    },
    execute: async (input) => {
        return ok(`[Stub] Resultados RAG para: "${input.consulta}" (Requiere base vectorial)`);
    }
};

export const aiToolsV4: ToolDefinition[] = [queryLlm, ragSearch];
