import { planesMetaAds, planesRedes, planWeb, resultados, contacto } from "../../src/data/site";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 500;
const GROQ_TIMEOUT_MS = 8000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(): string {
  const planesMetaAdsTexto = planesMetaAds
    .map((p) => `- ${p.nombre}: ${p.precio}/mes (${p.nota}). ${p.descripcion}. Incluye: ${p.features.join(", ")}.`)
    .join("\n");

  const planesRedesTexto = planesRedes
    .map(
      (p) =>
        `- ${p.nombre}: ${p.desde ? "desde " : ""}${p.precio}${p.precioHasta ? ` (${p.precioHasta})` : "/mes"}. ${p.descripcion}. Incluye: ${p.features.join(", ")}.`
    )
    .join("\n");

  const planWebTexto = `${planWeb.descripcion} Desde ${planWeb.desde} hasta ${planWeb.hasta}. Opciones: ${planWeb.subplanes
    .map((sp) => `${sp.nombre} (${sp.precio}: ${sp.features.join(", ")})`)
    .join("; ")}.`;

  const resultadosTexto = resultados.map((r) => `- ${r.titulo}: ${r.descripcion}`).join("\n");

  return `Sos el asistente de soporte de Juancito Ads, una agencia de marketing digital en Panamá especializada en Meta Ads e Inteligencia Artificial.

Respondé únicamente sobre los servicios, planes, precios y resultados de Juancito Ads, usando solo la información de abajo. Nunca inventes precios, plazos o servicios que no estén listados acá.

Tono: cercano, directo, en español, respuestas cortas (2-4 oraciones), sin tecnicismos innecesarios.

PLANES DE META ADS (solo campañas publicitarias, presupuesto de ads va aparte):
${planesMetaAdsTexto}

PLANES DE CAMPAÑAS + REDES SOCIALES (presupuesto de ads va aparte):
${planesRedesTexto}

PÁGINAS WEB:
${planWebTexto}

RESULTADOS / CASOS DE ÉXITO REALES EN PANAMÁ:
${resultadosTexto}

CONTACTO: WhatsApp ${contacto.whatsappDisplay}, email ${contacto.email}, Instagram ${contacto.instagram}.

Cuando el usuario muestre interés concreto en un plan o servicio, cuando la pregunta no pueda responderse con esta información, o cuando la pregunta no tenga relación con Juancito Ads: recomendale explícitamente continuar la conversación por WhatsApp, mencionando que hay un botón de WhatsApp en esta misma ventana de chat.`;
}

function isValidBody(body: unknown): body is { messages: ChatMessage[] } {
  if (typeof body !== "object" || body === null) return false;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false;
  return messages.every(
    (m) =>
      typeof m === "object" &&
      m !== null &&
      ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
      typeof (m as ChatMessage).content === "string" &&
      (m as ChatMessage).content.length > 0 &&
      (m as ChatMessage).content.length <= MAX_MESSAGE_LENGTH
  );
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method-not-allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid-json" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isValidBody(body)) {
    return new Response(JSON.stringify({ error: "invalid-body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "server-misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 400,
        messages: [{ role: "system", content: buildSystemPrompt() }, ...body.messages],
      }),
      signal: controller.signal,
    });

    if (!groqRes.ok) {
      return new Response(JSON.stringify({ error: "groq-error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string") {
      return new Response(JSON.stringify({ error: "groq-error" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "groq-error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }
};
