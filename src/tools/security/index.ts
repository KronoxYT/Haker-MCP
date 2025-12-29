/**
 * Security Tools
 * 
 * Herramientas de seguridad y análisis.
 */
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";
import fs from "fs/promises";
import { ToolDefinition, ok, fail } from "../../types/tool.js";

const execAsync = promisify(exec);

export const generateHash: ToolDefinition = {
    name: "generar_hash",
    description: "Calcula el hash (MD5/SHA256) de un archivo.",
    inputSchema: {
        type: "object",
        properties: {
            ruta: { type: "string" },
            algoritmo: { type: "string", enum: ["md5", "sha256", "sha1"] }
        },
        required: ["ruta"]
    },
    execute: async (input) => {
        try {
            const algo = (input.algoritmo as string) || "sha256";
            const content = await fs.readFile(input.ruta as string);
            const hash = crypto.createHash(algo).update(content).digest("hex");
            return ok({ algorithm: algo, hash });
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const whoisLookup: ToolDefinition = {
    name: "quien_es_whois",
    description: "Consulta WHOIS de un dominio.",
    inputSchema: {
        type: "object",
        properties: { dominio: { type: "string" } },
        required: ["dominio"]
    },
    execute: async (input) => {
        try {
            const { stdout } = await execAsync(`whois ${input.dominio}`);
            return ok(stdout);
        } catch {
            return fail("Comando whois no encontrado. Instala Sysinternals o habilítalo.");
        }
    }
};

export const scanNetwork: ToolDefinition = {
    name: "escanear_red_completa",
    description: "Escaneo ARP básico de la red local.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
        try {
            const { stdout } = await execAsync("arp -a");
            return ok(`Tabla ARP:\n${stdout}`);
        } catch (e: any) {
            return fail(e.message);
        }
    }
};

export const securityToolsV4: ToolDefinition[] = [generateHash, whoisLookup, scanNetwork];
