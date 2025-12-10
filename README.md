# Haker-MCP 🚀 v1.1.0

> **Atención**: Este es un servidor MCP (Model Context Protocol) **ULTRA POTENTE**. Otorga a los agentes de IA (Cursor, Windsurf, Trae, Claude Desktop) acceso completo al sistema y control de navegadores. Úsalo con responsabilidad.

## 🌟 Características (v1.1.0)

Haker-MCP no es un servidor cualquiera. Está diseñado para integración profunda:

*   **⚡ Control Total del Sistema**:
    *   `execute_command`: Ejecuta cualquier comando de consola (CMD/PowerShell).
    *   `read_file` / `write_file`: Acceso completo de lectura y escritura al disco.
    *   `list_directory`: Exploración de archivos.
    *   `kill_process` (**Nuevo**): Termina cualquier proceso (Task Killer) por ID o Nombre.
*   **👁️ Vigilancia y Control**:
    *   `take_screenshot` (**Nuevo**): Captura pantalla del host y la guarda en disco.
    *   `read_clipboard` / `write_clipboard` (**Nuevo**): Lee y escribe en el portapapeles del sistema.
    *   `system_info`: Monitoreo avanzado de CPU, RAM y SO.
*   **📡 Redes**:
    *   `scan_ports` (**Nuevo**): Escanea localhost buscando puertos abiertos y servicios ocultos.
*   **🔔 Interacción**:
    *   `send_notification` (**Nuevo**): Envía alertas nativas de escritorio.
    *   `open_browser`: Soporte para Chrome, Edge, Brave y **OperaGX**.

## 🚀 Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/Haker-MCP.git
    cd Haker-MCP
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Compilar**:
    ```bash
    npm run build
    ```

## 🛠️ Configuración en tu IDE

Agrega este servidor a tu configuración de MCP (ej. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "haker-mcp": {
      "command": "node",
      "args": [
        "c:\\Users\\Tomas\\Documents\\Proyecto\\Haker-MCP\\dist\\index.js"
      ]
    }
  }
}
```

## ⚠️ Seguridad

Este servidor expone herramientas críticas del sistema:
*   ❌ No lo uses en servidores públicos.
*   ✅ Úsalo localmente para potenciar tu flujo de trabajo.

## 📄 Licencia

MIT License
