// Cliente de IA — usa Groq con Zero Data Retention.
// Mantiene la misma interfaz que el SDK de Anthropic.

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_BASE = "https://api.groq.com/openai/v1";

export interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

interface CreateParams {
  model: string;
  max_tokens: number;
  system?: string;
  messages: MessageParam[];
  temperature?: number;
}

interface ContentBlock {
  type: string;
  text: string;
}

interface CreateResponse {
  content: ContentBlock[];
}

export const anthropic = {
  messages: {
    async create(params: CreateParams): Promise<CreateResponse> {
      const messages: { role: string; content: string }[] = [];

      // Para modelos de clasificación como prompt-guard, Groq exige un único mensaje de usuario
      const textoCombinado = [
        params.system ? `[Instrucciones]:\n${params.system}\n` : "",
        ...params.messages.map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
      ].filter(Boolean).join("\n\n");

      const res = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-prompt-guard-2-22m",
          max_tokens: Math.min(params.max_tokens, 512),
          temperature: params.temperature ?? 0.7,
          messages: [{ role: "user", content: textoCombinado }],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content ?? "";
      return { content: [{ type: "text", text }] };
    },
  },
};   