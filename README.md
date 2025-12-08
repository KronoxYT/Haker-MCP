# Haker-MCP 🚀

> **Atención**: Este es un servidor MCP (Model Context Protocol) **ULTRA POTENTE**. Otorga a los agentes de IA (Cursor, Windsurf, Trae, Claude Desktop) acceso completo al sistema y control de navegadores. Úsalo con responsabilidad.

## 🌟 Características

Haker-MCP no es un servidor cualquiera. Está diseñado para integración profunda:

*   **⚡ Control Total del Sistema**:
    *   `execute_command`: Ejecuta cualquier comando de consola (CMD/PowerShell).
    *   `read_file` / `write_file`: Acceso completo de lectura y escritura al disco.
    *   `list_directory`: Exploración de archivos.
*   **🖥️ Información Avanzada**:
    *   `system_info`: Monitoreo de CPU, RAM, Redes y procesos en tiempo real.
*   **🌐 Control de Navegador**:
    *   `open_browser`: Abre enlaces automáticamente en tu navegador favorito.
    *   **Soporte Multi-Browser**: Chrome, Edge, Brave, y **OperaGX**.

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
        "C:\\Ruta\\Absoluta\\A\\Haker-MCP\\dist\\index.js"
      ]
    }
  }
}
```

## ⚠️ Seguridad

Este servidor expone herramientas críticas del sistema (`child_process.exec`, `fs`).
*   ❌ No lo uses en servidores públicos expuestos a internet.
*   ✅ Úsalo localmente para potenciar tu flujo de trabajo de desarrollo con IA.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
