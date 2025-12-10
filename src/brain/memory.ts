import fs from "fs/promises";
import os from "os";
import path from "path";

const BRAIN_DIR = path.join(os.homedir(), ".haker_brain");
const MEMORY_FILE = path.join(BRAIN_DIR, "long_term_memory.json");
const CONSCIOUSNESS_FILE = path.join(BRAIN_DIR, "consciousness_log.md");

export async function initBrain() {
    try {
        await fs.mkdir(BRAIN_DIR, { recursive: true });
        try { await fs.access(MEMORY_FILE); }
        catch { await fs.writeFile(MEMORY_FILE, JSON.stringify({}, null, 2)); }
    } catch (e) { console.error("Error initializing brain:", e); }
}

export async function saveMemory(key: string, value: any) {
    const data = JSON.parse(await fs.readFile(MEMORY_FILE, "utf-8"));
    data[key] = { value, timestamp: new Date().toISOString() };
    await fs.writeFile(MEMORY_FILE, JSON.stringify(data, null, 2));
}

export async function loadMemory(key?: string) {
    const data = JSON.parse(await fs.readFile(MEMORY_FILE, "utf-8"));
    if (key) return data[key] || "No encontrado.";
    return data;
}

export async function logReflection(thought: string) {
    const entry = `\n## [${new Date().toISOString()}] Reflexión\n${thought}\n`;
    await fs.appendFile(CONSCIOUSNESS_FILE, entry);
}
