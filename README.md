# Haker-MCP 🚀 v1.2.0

> **Atención**: Este es un servidor MCP (Model Context Protocol) **ULTRA POTENTE**. Otorga a los agentes de IA (Cursor, Windsurf, Trae, Claude Desktop) acceso completo al sistema y control de navegadores. Úsalo con responsabilidad.

## 🌟 Características y Herramientas (En Español)

Este servidor expone herramientas potentes con nombres intuitivos para que tu Agente las entienda mejor:

### ⚡ Control del Sistema
*   `ejecutar_comando`: Ejecuta cualquier comando de consola (CMD/PowerShell).
    *   *Params*: `comando`
*   `leer_archivo` / `escribir_archivo`: Acceso completo al disco.
    *   *Params*: `ruta`, `contenido`
*   `listar_directorio`: Ver archivos en una carpeta.
    *   *Params*: `ruta`
*   `matar_proceso`: Termina un proceso por ID o Nombre.
    *   *Params*: `pid` o `nombre`

### 👁️ Vigilancia y Control
*   `captura_pantalla`: Toma una foto de tu escritorio.
    *   *Params*: `ruta_destino` (Opcional)
*   `leer_portapapeles` / `escribir_portapapeles`: Control del clipboard.
*   `info_sistema`: Datos de CPU, RAM, IP.

### 🌐 Navegación y Redes
*   `abrir_navegador`: Abre enlaces en tu navegador favorito (Soporta Chrome, Edge, Brave, **OperaGX**).
    *   *Params*: `url`, `navegador` (opcional: 'operagx', 'chrome', etc)
*   `escanear_puertos`: Busca puertos abiertos en tu PC.
    *   *Params*: `puerto_inicio`, `puerto_fin` o `puertos_especificos`

### 🔔 Notificaciones
*   `enviar_notificacion`: Te avisa con una alerta de escritorio.
    *   *Params*: `titulo`, `mensaje`

## 🚀 Instalación y Uso

1.  **Clonar y Construir**:
    ```bash
    git clone https://github.com/tu-usuario/Haker-MCP.git
    cd Haker-MCP
    npm install
    npm run build
    ```

2.  **Configuración en IDE** (Cursor/Claude/Windsurf):
    Agrega esto a tu config de MCP (`claude_desktop_config.json`):

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

Este servidor otorga control total. Úsalo solo en entornos de confianza.

## 📄 Licencia

MIT License
