/**
 * Haker-MCP Tool Contract
 * 
 * Define el contrato que toda tool debe cumplir.
 * Zero magic, máxima claridad.
 */

export interface ToolInput {
  [key: string]: unknown;
}

export interface ToolResult {
  success: boolean;
  data?: string | object;
  error?: string;
}

export interface ToolSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

export interface ToolDefinition {
  /** Nombre único de la tool (ej: "leer_archivo") */
  name: string;
  
  /** Descripción breve para el LLM */
  description: string;
  
  /** JSON Schema de los argumentos */
  inputSchema: ToolSchema;
  
  /** Función de ejecución. Recibe input validado, retorna resultado estructurado. */
  execute: (input: ToolInput) => Promise<ToolResult>;
}

/**
 * Helper para crear ToolResult exitoso
 */
export function ok(data: string | object): ToolResult {
  return { success: true, data };
}

/**
 * Helper para crear ToolResult de error
 */
export function fail(error: string): ToolResult {
  return { success: false, error };
}
