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

      if (params.system) {
        messages.push({ role: "system", content: params.system });
      }
      for (const msg of params.messages) {
        messages.push({ role: msg.role, content: msg.content });
      }

      const res = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          max_tokens: params.max_tokens,
          temperature: params.temperature ?? 0.7,
          messages,
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