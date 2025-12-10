
import { exec } from "child_process";

export const funTools = [
    {
        name: "reproducir_sonido",
        description: "Reproduce un archivo de audio (MP3/WAV) usando el reproductor predeterminado del sistema.",
        inputSchema: {
            type: "object",
            properties: { ruta: { type: "string" } },
            required: ["ruta"]
        },
        handler: async (args: any) => {
            // Windows specific
            exec(`start "" "${args.ruta}"`);
            return `Reproduciendo: ${args.ruta}`;
        }
    },
    {
        name: "chiste_hacker",
        description: "Cuenta un chiste de programación.",
        inputSchema: { type: "object", properties: {} },
        handler: async () => {
            const jokes = [
                "¿Por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los bugs.",
                "¡Hay 10 tipos de personas en el mundo: las que entienden binario y las que no!",
                "Un SQL entra en un bar, se acerca a dos mesas y pregunta: '¿Me puedo unir?' (JOIN)",
                "Git commit suicide: No lo hagas.",
                "¿Cuál es el animal favorito de un hacker? El pinguino."
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
    }
];
