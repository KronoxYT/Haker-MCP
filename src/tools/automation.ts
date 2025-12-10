// src/tools/automation.ts
import fs from "fs/promises";
import path from "path";
import os from "os";
// import xlsx from "xlsx"; // Will import dynamically or use require if needed, but in ESM "import" is static. 
// We wait for install to complete for types, but we can write code now.
// For robustness, I'll use standard imports assuming install succeeds.
import * as xlsx from "xlsx";
import { exec } from "child_process";
import { promisify } from "util";
// import pdf from "pdf-parse"; // TS might complain without @types/pdf-parse. I added it to install list? No types for pdf-parse in command?
// actually I added pdf-parse but not types. might need 'require' or ignore ts error.
// For now, let's keep it simple.

const execAsync = promisify(exec);
// @ts-ignore
import pdf from "pdf-parse";

export const automationTools = [
    {
        name: "leer_pdf",
        description: "Extrae texto de un archivo PDF.",
        inputSchema: {
            type: "object",
            properties: { ruta: { type: "string" } },
            required: ["ruta"]
        },
        handler: async (args: any) => {
            const dataBuffer = await fs.readFile(args.ruta);
            const data = await pdf(dataBuffer);
            return data.text;
        }
    },
    {
        name: "generar_excel",
        description: "Crea un archivo Excel (.xlsx) a partir de datos JSON.",
        inputSchema: {
            type: "object",
            properties: {
                ruta_destino: { type: "string" },
                datos_json: { type: "string", description: "Array de objetos JSON stringified" },
                nombre_hoja: { type: "string" }
            },
            required: ["ruta_destino", "datos_json"]
        },
        handler: async (args: any) => {
            const { ruta_destino, datos_json, nombre_hoja = "Hoja1" } = args;
            const data = JSON.parse(datos_json);
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet(data);
            xlsx.utils.book_append_sheet(wb, ws, nombre_hoja);
            xlsx.writeFile(wb, ruta_destino);
            return `Excel guardado en: ${ruta_destino}`;
        }
    },
    {
        name: "organizar_escritorio",
        description: "Mueve archivos del escritorio a carpetas por extension (Img, Docs, Soft).",
        inputSchema: {
            type: "object",
            properties: { ruta_escritorio: { type: "string", description: "Opcional. Por defecto busca desktop." } }
        },
        handler: async (args: any) => {
            const desktop = args.ruta_escritorio || path.join(os.homedir(), "Desktop");
            const files = await fs.readdir(desktop);

            const cats: any = {
                "Imagenes": [".jpg", ".png", ".gif", ".jpeg", ".svg"],
                "Documentos": [".pdf", ".docx", ".txt", ".md", ".xlsx"],
                "Ejecutables": [".exe", ".msi"],
                "Comprimidos": [".zip", ".rar", ".7z"]
            };

            let movedCount = 0;
            for (const file of files) {
                const ext = path.extname(file).toLowerCase();
                for (const [cat, exts] of Object.entries(cats)) {
                    if ((exts as string[]).includes(ext)) {
                        const targetDir = path.join(desktop, cat);
                        await fs.mkdir(targetDir, { recursive: true });
                        await fs.rename(path.join(desktop, file), path.join(targetDir, file));
                        movedCount++;
                    }
                }
            }
            return `Organizados ${movedCount} archivos en el escritorio.`;
        }
    },
    {
        name: "leer_email_simulado",
        description: "Lee ultimos emails (Simulado/Local por ahora).",
        inputSchema: { type: "object", properties: {} },
        handler: async () => {
            return "Esta funcion requiere configurar credenciales IMAP (Pendiente v3.1).";
        }
    },
    {
        name: "enviar_email_simulado",
        description: "Envia email (Simulado).",
        inputSchema: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } } },
        handler: async (args: any) => {
            return `[Simulacion] Email enviado a ${args.to}: ${args.subject}`;
        }
    }
];
