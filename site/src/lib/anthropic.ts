import Anthropic from "@anthropic-ai/sdk";

// Cliente del SDK de Anthropic — solo se usa en el backend (rutas /api/*).
// Lee la clave de ANTHROPIC_API_KEY en .env.local automáticamente.
export const anthropic = new Anthropic();
