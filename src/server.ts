/**
 * Haker-MCP Server Factory
 * 
 * Crea y configura el servidor MCP con todas las tools registradas.
 * Separado del entry point para testabilidad.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { allTools, getToolByName } from "./registry/tools.js";

export function createServer(): Server {
    const server = new Server(
        { name: "haker-mcp", version: "4.0.0" },
        { capabilities: { tools: {} } }
    );

    // List all registered tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: allTools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema
        }))
    }));

    // Execute tool by name
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const tool = getToolByName(name);

        if (!tool) {
            return {
                content: [{ type: "text", text: `Tool not found: ${name}` }],
                isError: true
            };
        }

        const result = await tool.execute(args ?? {});

        return {
            content: [{
                type: "text",
                text: result.success
                    ? (typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2))
                    : `Error: ${result.error}`
            }],
            isError: !result.success
        };
    });

    return server;
}
