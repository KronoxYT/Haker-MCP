/**
 * Haker-MCP v4.0
 * 
 * Entry point mínimo. Solo bootstrap.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Haker-MCP v4.0.0 running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
