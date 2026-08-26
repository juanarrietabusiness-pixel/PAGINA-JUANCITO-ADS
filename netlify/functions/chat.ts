import { planesMetaAds, planesRedes, planesWebNuevos, resultados, contacto, metricas, agenteCrm } from "../../src/data/site";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 500;

/*
  Tope de tiempo para TODA la respuesta, no para cada intento: los modelos de
  abajo se prueban dentro de este mismo presupuesto. El visitante espera 8
  segundos como mucho, se haya intentado con uno o con dos.
*/
const GROQ_TIMEOUT_MS = 8000;

/*
  Groq retira modelos con fecha, y llegada esa fecha la API deja de servirlos.
  `llama-3.3-70b-versatile`, el que movía este chat desde el 2026-07-20, se
  apagó el 2026-08-16 — y el sitio no se enteró: no hay error de build ni aviso
  en pantalla, la ventana de chat sigue abriéndose igual y cada pregunta se
  contesta con el mensaje de error genérico.

  Por eso el modelo ya no es una constante suelta sino una lista ordenada, con
  los dos reemplazos que la propia Groq recomienda para el modelo retirado. Si
  el primero falla por algo que puede depender del modelo (no existe, lo
  retiraron, está saturado), se prueba el siguiente dentro de la MISMA petición
  del visitante: la próxima retirada degrada el chat en vez de apagarlo.

  Para cambiar de modelo sin tocar código está `GROQ_MODEL` (ver
  `.env.example`), que se pone al frente de la lista. Puede tener valor por
  defecto porque el identificador de un modelo no es un secreto — la misma
  distinción del punto 20 del roadmap: `GROQ_API_KEY` no puede tenerlo nunca.
*/
const MODELOS = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b"];

/*
  Los dos modelos razonan antes de responder, y esos tokens de razonamiento
  salen del mismo presupuesto que la respuesta: con el tope de 400 que le
  bastaba a llama-3.3, una respuesta podía llegar cortada o directamente vacía.
  El largo lo sigue marcando el prompt ("respuestas cortas, 2-4 oraciones"), no
  este número — subirlo no alarga las respuestas, evita que se trunquen.
*/
const MAX_TOKENS = 1024;

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

  const planWebTexto = `Páginas Web profesionales de alto rendimiento, listas para vender. Carga en menos de 1 segundo, código tuyo entregado en GitHub. Plazos de entrega cortos.
Planes:
${planesWebNuevos.map(p => `- ${p.nombre}: ${p.precio} (${p.paraQuien}). Entrega: ${p.entrega}. Incluye: ${p.features.join(", ")}`).join("\n")}`;

  const resultadosTexto = resultados.map((r) => `- ${r.titulo}: ${r.descripcion}`).join("\n");

  /*
    El Agente CRM es el único servicio con costes que NO cobra Juancito Ads (el
    alojamiento y la llave de IA, ambos a nombre del cliente). Van dentro del
    conocimiento a propósito: si el asistente da el precio sin ellos, está
    dando un precio incompleto justo en el servicio donde más importa.
  */
  const agenteTexto = `${agenteCrm.nombre}: ${agenteCrm.precio} (${agenteCrm.nota}). Entrega en ${agenteCrm.entrega}, con ${agenteCrm.ajustes} de ajustes incluidos y carga inicial de hasta ${agenteCrm.topePreguntas} preguntas.
${agenteCrm.resumen}
Canales: ${agenteCrm.canales.join(", ")}.
Incluye: ${agenteCrm.incluye.join(", ")}.
Se paga aparte, a nombre del cliente y sin pasar por Juancito Ads: ${agenteCrm.costesAparte.join("; ")}.`;

  return `Sos el asistente de soporte de Juancito Ads, una agencia de marketing digital en Panamá especializada en Meta Ads e Inteligencia Artificial.

Respondé únicamente sobre los servicios, planes, precios y resultados de Juancito Ads, usando solo la información de abajo. Nunca inventes precios, plazos o servicios que no estén listados acá.

Tono: cercano, directo, en español, respuestas cortas (2-4 oraciones), sin tecnicismos innecesarios.

PLANES DE META ADS (solo campañas publicitarias, presupuesto de ads va aparte):
${planesMetaAdsTexto}

PLANES DE CAMPAÑAS + REDES SOCIALES (presupuesto de ads va aparte):
${planesRedesTexto}

PÁGINAS WEB (diseño a medida, rápidas, listas para vender):
${planWebTexto}

AGENTE CRM (atención automática y registro de clientes por WhatsApp, Instagram, Messenger y Telegram):
${agenteTexto}

EXPERIENCIA: ${metricas.inversionGestionada} ${metricas.inversionGestionadaDetalle}.

RESULTADOS / CASOS DE ÉXITO REALES EN PANAMÁ:
${resultadosTexto}

CONTACTO: WhatsApp ${contacto.whatsappDisplay}, email ${contacto.email}, Instagram ${contacto.instagram}.

Cuando el usuario muestre interés concreto en un plan o servicio de páginas web, recomendale ver todos los detalles en la ruta /servicios/paginas-web.
Cuando muestre interés en campañas de anuncios de Meta Ads, recomendale la ruta /servicios/campanas-ads.
Cuando muestre interés en campañas con gestión de redes sociales, recomendale la ruta /servicios/campanas-redes.
Cuando pregunte por el Agente CRM, por un bot, por automatizar respuestas o por atender mensajes fuera de horario, recomendale la ruta /servicios/agente-crm — y menciona siempre que el alojamiento y la llave de IA se pagan aparte.
Cuando la pregunta no pueda responderse con esta información, o cuando la pregunta no tenga relación con Juancito Ads: recomendale explícitamente continuar la conversación por WhatsApp, mencionando que hay un botón de WhatsApp en esta misma ventana de chat.`;
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

/*
  `GROQ_MODEL` manda si está puesta, pero no elimina a las demás: si el modelo
  elegido a mano tampoco sirve, la lista por defecto sigue detrás.
*/
function modelosAProbar(): string[] {
  const preferido = process.env.GROQ_MODEL?.trim();
  if (!preferido) return MODELOS;
  return [preferido, ...MODELOS.filter((m) => m !== preferido)];
}

/*
  Devuelve la respuesta del modelo, o `null` si este modelo no sirvió y le toca
  al siguiente. Los errores de red y el corte por tiempo sí se propagan: no
  dependen del modelo, y reintentar solo gastaría el presupuesto que queda.
*/
async function pedirRespuesta(
  modelo: string,
  apiKey: string,
  mensajes: ChatMessage[],
  signal: AbortSignal
): Promise<string | null> {
  const groqRes = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.4,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...mensajes],
    }),
    signal,
  });

  /*
    Un 401/403 es la llave, no el modelo: probar otro modelo con la misma llave
    daría el mismo error, así que se corta la cadena aquí.
  */
  if (groqRes.status === 401 || groqRes.status === 403) {
    console.error(`[chat] Groq rechazó la llave (${groqRes.status}): revisar GROQ_API_KEY en Netlify`);
    throw new Error("groq-auth");
  }

  /*
    El detalle va al log de Netlify, nunca al visitante. Es la única señal de
    que un modelo dejó de servir: sin esta línea, una retirada se ve exactamente
    igual que un fallo de red, que es lo que costó diez días de chat mudo.
  */
  if (!groqRes.ok) {
    console.error(`[chat] el modelo ${modelo} respondió ${groqRes.status}`);
    return null;
  }

  const data = await groqRes.json();
  const reply = data?.choices?.[0]?.message?.content;

  /*
    Un modelo que razona puede gastarse el presupuesto pensando y devolver
    `content` vacío con el razonamiento aparte. Una cadena vacía pasaría el
    `typeof` y pintaría una burbuja en blanco en el chat, que se lee como que el
    sitio está roto: cuenta como fallo y le toca al siguiente modelo.
  */
  if (typeof reply !== "string" || reply.trim().length === 0) {
    console.error(`[chat] el modelo ${modelo} devolvió una respuesta vacía`);
    return null;
  }

  return reply;
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
    for (const modelo of modelosAProbar()) {
      /* Si el primer intento se comió el presupuesto de tiempo, no se empieza otro. */
      if (controller.signal.aborted) break;

      const reply = await pedirRespuesta(modelo, apiKey, body.messages, controller.signal);

      if (reply) {
        return new Response(JSON.stringify({ reply }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "groq-error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    /*
      Aquí caen el corte por tiempo, los fallos de red y el rechazo de la llave.
      El visitante ve el mismo mensaje de siempre; el log es lo que distingue
      cuál de los tres fue.
    */
    console.error("[chat] la petición a Groq no llegó a completarse:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: "groq-error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }
};
