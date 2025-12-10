
import axios from "axios";

export const aiTools = [
    {
        name: "consultar_llm",
        description: "Consulta a un modelo de lenguaje (Simulado/Stub).",
        inputSchema: {
            type: "object",
            properties: {
                prompt: { type: "string" },
                modelo: { type: "string", description: "ej: 'gpt-4', 'local-llama'" }
            },
            required: ["prompt"]
        },
        handler: async (args: any) => {
            // Aquí iría la llamada real a OpenAI/Anthropic/LocalAI
            return `Respuesta simulada del modelo ${args.modelo || "default"} al prompt: "${args.prompt}"\n\n[Nota: Configura tus API KEYS en el entorno para activar este módulo realmente.]`;
        }
    },
    {
        name: "rag_simple",
        description: "Búsqueda con generación aumentada (RAG) en documentos locales.",
        inputSchema: {
            type: "object",
            properties: {
                consulta: { type: "string" },
                directorio: { type: "string" }
            },
            required: ["consulta"]
        },
        handler: async (args: any) => {
            return `Resultados de RAG para: "${args.consulta}" en ${args.directorio || "."} (No implementado: requiere base de datos vectorial local).`;
        }
    }
];
