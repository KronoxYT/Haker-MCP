/**
 * Fun Tools
 * 
 * Herramientas de entretenimiento.
 */
import { exec } from "child_process";
import { ToolDefinition, ok } from "../../types/tool.js";

export const playSound: ToolDefinition = {
    name: "reproducir_sonido",
    description: "Reproduce un archivo de audio (MP3/WAV).",
    inputSchema: {
        type: "object",
        properties: { ruta: { type: "string" } },
        required: ["ruta"]
    },
    execute: async (input) => {
        exec(`start "" "${input.ruta}"`);
        return ok(`Reproduciendo: ${input.ruta}`);
    }
};

export const hackerJoke: ToolDefinition = {
    name: "chiste_hacker",
    description: "Cuenta un chiste de programación.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
        const jokes = [
            "¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los bugs.",
            "¡Hay 10 tipos de personas en el mundo: las que entienden binario y las que no!",
            "Un SQL entra en un bar, se acerca a dos mesas y pregunta: '¿Me puedo unir?' (JOIN)",
            "¿Cuál es el animal favorito de un hacker? El pingüino."
        ];
        return ok(jokes[Math.floor(Math.random() * jokes.length)]);
    }
};

export const funToolsV4: ToolDefinition[] = [playSound, hackerJoke];
