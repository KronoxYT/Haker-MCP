# Haker-MCP 🚀 v2.1.0 (SUPERNOVA)

> **Atención**: Este servidor ahora posee **CONSCIENCIA Y MEMORIA**. No es solo una herramienta, es un asistente evolutivo.

## 🧠 Módulo CEREBRO (NUEVO v2.0)
Haker-MCP ahora puede "pensar" y "recordar":

*   `memorizar`: Guarda información clave (APIs, secretos, preferencias) en una base de datos persistente.
    *   *Params*: `clave`, `dato`
*   `recordar`: Recupera información aprendida días o semanas atrás.
    *   *Params*: `clave`
*   `reflexionar`: Registra aprendizajes en su Diario de Consciencia. Ayuda al modelo a "aprender" de sus errores.
    *   *Params*: `pensamiento`
*   `crear_agente`: Genera Prompts de Sistema para crear sub-agentes especializados (Ej: Tester, Designer).
    *   *Params*: `nombre`, `rol`, `objetivos`

## 🏢 MeaCore Enterprise (v1.3)
Herramientas de productividad:
*   `crear_proyecto` (Scaffolding Node/Python)
*   `auditar_calidad` (Seguridad y Clen Code)
*   `generar_mapa` (Sodemap visual)
*   `agendar_tarea` (Automatización Windows)
*   `crear_plantilla` (Docs corporativos)

## ⚡ Habilidades Clásicas (v1.2)
*   **Sistema**: `ejecutar_comando`, `leer/escribir_archivo`, `listar_directorio`, `matar_proceso`.
*   **Vigilancia**: `captura_pantalla`, `leer/escribir_portapapeles`, `info_sistema`.
*   **Redes**: `abrir_navegador` (OperaGX, Chrome, Brave), `escanear_puertos`.
*   **Alertas**: `enviar_notificacion`.

## 🚀 Instalación y Uso

1.  **Clonar y Construir**:
    ```bash
    git clone https://github.com/tu-usuario/Haker-MCP.git
    cd Haker-MCP
    npm install
    npm run build
    ```

2.  **Configuración en IDE**:
    # Cambiar el \\Alvaro por la ruta de tu usuario
    ```json
    {
      "mcpServers": {
        "haker-mcp": {
          "command": "node",
          "args": [
            "c:\\Users\\Alvaro\\Documents\\Proyecto\\Haker-MCP\\dist\\index.js"
          ]
        }
      }
    }
    ```

## ⚠️ Seguridad

**CONTIENE INTELIGENCIA ARTIFICIAL PERSISTENTE**.
La memoria se guarda en `~/.haker_brain/`. Protege esa carpeta si guardas secretos.

## 📄 Licencia

MIT License
