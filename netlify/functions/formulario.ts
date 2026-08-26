/**
 * Envío de los formularios del sitio por correo, vía Resend.
 *
 * Por qué existe: los dos formularios del sitio (`/contacto` y el de cotización
 * de `/servicios/paginas-web`) llegaban solo al panel de Netlify Forms, es decir,
 * a un sitio donde hay que entrar a mirar. Un formulario de captación que nadie
 * mira a tiempo es un cliente perdido, así que ahora el envío también sale como
 * correo a la bandeja del negocio, en el momento.
 *
 * Netlify Forms NO se quitó: sigue siendo la red de seguridad. Si esta función
 * falla o el visitante no tiene JavaScript, el navegador manda el formulario por
 * la vía nativa de siempre y el dato queda guardado igual. Ver
 * `src/scripts/formulario.ts`.
 *
 * La llave de Resend (`RESEND_API_KEY`) vive SOLO aquí, del lado del servidor, y
 * nunca lleva prefijo `PUBLIC_` — igual que `GROQ_API_KEY` en `chat.ts`. El
 * remitente y el destinatario sí pueden tener valor por defecto: no son secretos.
 *
 * Instrucciones de configuración (Resend + Netlify): `docs/resend-setup.md`.
 */
import { contacto } from "../../src/data/site";

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_TIMEOUT_MS = 8000;

/**
 * Remitente: tiene que ser una dirección del dominio verificado en Resend.
 * Si en Resend se verificó un subdominio (por ejemplo `send.juancitoads.com`),
 * hay que sobrescribirlo con la variable `RESEND_FROM` en Netlify.
 */
const REMITENTE_POR_DEFECTO = "Juancito Ads <formularios@juancitoads.com>";

interface CampoDef {
  nombre: string;
  etiqueta: string;
  requerido: boolean;
  max: number;
}

interface FormularioDef {
  etiqueta: string;
  asunto: (campos: Record<string, string>) => string;
  campos: CampoDef[];
}

/**
 * Lista blanca de formularios y de sus campos.
 *
 * Nada que no esté aquí entra en el correo: si mañana alguien manda un POST a
 * mano con veinte campos inventados, se descartan todos. Al añadir un campo a un
 * formulario del sitio hay que añadirlo también aquí, o no viajará.
 */
const FORMULARIOS: Record<string, FormularioDef> = {
  contacto: {
    etiqueta: "Formulario de contacto",
    asunto: (c) => `Nuevo contacto: ${c.nombre}${c.negocio ? ` — ${c.negocio}` : ""}`,
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true, max: 120 },
      { nombre: "negocio", etiqueta: "Negocio", requerido: true, max: 120 },
      { nombre: "whatsapp", etiqueta: "WhatsApp", requerido: true, max: 40 },
      { nombre: "email", etiqueta: "Email", requerido: false, max: 160 },
      { nombre: "mensaje", etiqueta: "Mensaje", requerido: true, max: 2000 },
    ],
  },
  "cotizacion-web": {
    etiqueta: "Cotización de página web",
    asunto: (c) => `Cotización web: ${c.nombre} — ${c["plan-interes"]}`,
    campos: [
      { nombre: "nombre", etiqueta: "Nombre", requerido: true, max: 120 },
      { nombre: "whatsapp", etiqueta: "WhatsApp", requerido: true, max: 40 },
      { nombre: "plan-interes", etiqueta: "Tipo de proyecto", requerido: true, max: 60 },
    ],
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** El asunto no puede llevar saltos de línea ni crecer sin tope. */
function limpiarAsunto(asunto: string): string {
  return asunto.replace(/\s+/g, " ").trim().slice(0, 150);
}

/**
 * Enlace de WhatsApp con el número que dejó la persona, para responder desde el
 * propio correo sin copiar y pegar. Panamá son 8 dígitos, así que a un número de
 * 8 se le antepone el 507; cualquier otra cosa se deja tal cual si tiene pinta de
 * llevar código de país, y si no, no se genera enlace (mejor ninguno que uno roto).
 */
function enlaceWhatsApp(numero: string): string | null {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length === 8) return `https://wa.me/507${digitos}`;
  if (digitos.length >= 10 && digitos.length <= 15) return `https://wa.me/${digitos}`;
  return null;
}

interface Validacion {
  ok: boolean;
  error?: string;
  def?: FormularioDef;
  campos?: Record<string, string>;
}

function validar(body: unknown): Validacion {
  if (typeof body !== "object" || body === null) return { ok: false, error: "invalid-body" };

  const { formulario, campos, "bot-field": honeypot } = body as {
    formulario?: unknown;
    campos?: unknown;
    "bot-field"?: unknown;
  };

  /*
    Honeypot: el campo va oculto en el HTML, así que solo lo rellena un robot.
    Se responde 200 a propósito — un 400 le confirma al robot que lo detectamos y
    le dice exactamente qué cambiar en el siguiente intento.
  */
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: false, error: "bot" };
  }

  if (typeof formulario !== "string" || !(formulario in FORMULARIOS)) {
    return { ok: false, error: "formulario-desconocido" };
  }
  if (typeof campos !== "object" || campos === null) return { ok: false, error: "invalid-body" };

  const def = FORMULARIOS[formulario]!;
  const entrada = campos as Record<string, unknown>;
  const limpios: Record<string, string> = {};

  for (const campo of def.campos) {
    const valor = entrada[campo.nombre];
    const texto = typeof valor === "string" ? valor.trim() : "";

    if (!texto) {
      if (campo.requerido) return { ok: false, error: "campo-faltante" };
      continue;
    }
    if (texto.length > campo.max) return { ok: false, error: "campo-demasiado-largo" };
    if (campo.nombre === "email" && !EMAIL_RE.test(texto)) return { ok: false, error: "email-invalido" };

    limpios[campo.nombre] = texto;
  }

  return { ok: true, def, campos: limpios };
}

function construirCorreo(def: FormularioDef, campos: Record<string, string>) {
  const filas = def.campos
    .filter((campo) => campos[campo.nombre])
    .map((campo) => ({ etiqueta: campo.etiqueta, valor: campos[campo.nombre]! }));

  const wa = campos.whatsapp ? enlaceWhatsApp(campos.whatsapp) : null;

  const texto = [
    def.etiqueta,
    "",
    ...filas.map((fila) => `${fila.etiqueta}: ${fila.valor}`),
    ...(wa ? ["", `Responder por WhatsApp: ${wa}`] : []),
  ].join("\n");

  const filasHtml = filas
    .map(
      (fila) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e6e8ec;color:#5b6472;font-size:13px;font-weight:600;white-space:nowrap;vertical-align:top;">${escaparHtml(fila.etiqueta)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #e6e8ec;color:#111827;font-size:15px;white-space:pre-wrap;">${escaparHtml(fila.valor)}</td>
        </tr>`
    )
    .join("");

  const botonWa = wa
    ? `<p style="margin:22px 0 0;">
         <a href="${wa}" style="display:inline-block;background:#F5A623;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:999px;">Responder por WhatsApp</a>
       </p>`
    : "";

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e8ec;">
      <div style="background:#050F1A;padding:20px 24px;">
        <p style="margin:0;color:#ffffff;font-size:17px;font-weight:800;">Juancito Ads</p>
        <p style="margin:4px 0 0;color:#9aa7b8;font-size:13px;">${escaparHtml(def.etiqueta)}</p>
      </div>
      <div style="padding:24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          ${filasHtml}
        </table>
        ${botonWa}
      </div>
    </div>
  </body>
</html>`;

  return { texto, html };
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

  const validacion = validar(body);

  // Al robot se le responde que todo fue bien, pero no se envía nada.
  if (!validacion.ok && validacion.error === "bot") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!validacion.ok) {
    return new Response(JSON.stringify({ error: validacion.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[formulario] Falta RESEND_API_KEY en las variables de entorno.");
    return new Response(JSON.stringify({ error: "server-misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const def = validacion.def!;
  const campos = validacion.campos!;
  const { texto, html } = construirCorreo(def, campos);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

  try {
    const resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || REMITENTE_POR_DEFECTO,
        to: [process.env.RESEND_TO || contacto.email],
        subject: limpiarAsunto(def.asunto(campos)),
        html,
        text: texto,
        // Responder al correo contesta a la persona, no a nosotros mismos.
        ...(campos.email ? { reply_to: campos.email } : {}),
      }),
      signal: controller.signal,
    });

    if (!resendRes.ok) {
      /*
        El detalle de Resend va al log de la función, nunca a la respuesta: dice
        cosas como qué dominio no está verificado, y eso no le importa al visitante.
        Se lee en Netlify → Logs → Functions → formulario.
      */
      console.error("[formulario] Resend respondió", resendRes.status, await resendRes.text());
      return new Response(JSON.stringify({ error: "envio-fallido" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[formulario] No se pudo contactar con Resend:", error);
    return new Response(JSON.stringify({ error: "envio-fallido" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }
};
