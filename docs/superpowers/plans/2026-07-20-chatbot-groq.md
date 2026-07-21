# Chatbot de Soporte con Groq Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el botón flotante de WhatsApp por un widget de chat de soporte que responde preguntas frecuentes sobre Juancito Ads usando la API de Groq (modelo `llama-3.3-70b-versatile`), manteniendo la API key exclusivamente del lado servidor vía una Netlify Function.

**Architecture:** `ChatWidget.astro` (cliente) envía el historial de la conversación a `netlify/functions/chat.ts` (servidor), que arma un system prompt a partir de `src/data/site.ts` y llama a la API de Groq con la key guardada en una variable de entorno sin prefijo `PUBLIC_`. Ver `docs/superpowers/specs/2026-07-20-chatbot-groq-design.md` para el diseño completo aprobado.

**Tech Stack:** Astro 5 (static), Netlify Functions v2 (formato `export default (req: Request) => Response`, sin dependencias npm nuevas — usa `fetch`/`Request`/`Response` nativos de Node 22), lucide-astro para iconos.

## Global Constraints

- No usar `git add -A` / `git add .` / `git add --all` — siempre rutas exactas.
- La variable de entorno de la API key se llama `GROQ_API_KEY` (sin prefijo `PUBLIC_`) — nunca debe aparecer en ningún archivo bajo `src/` ni en código que se ejecute en el navegador.
- Criterio mínimo de aceptación para cambios en `src/`: `npm run build` sin errores.
- Criterio adicional para el archivo de la Netlify Function (`netlify/functions/chat.ts`, fuera de `src/` y por lo tanto NO cubierto por `npm run build`): `npm run check` debe pasar sin errores (el `tsconfig.json` de este proyecto incluye `**/*`, por lo que `astro check` también reporta errores de tipos en ese archivo). Si `npm run check` no reporta diagnósticos para ese archivo específico, usar `npx tsc --noEmit netlify/functions/chat.ts` como verificación alternativa.
- El proyecto no tiene suite de tests automatizada — la verificación funcional del chat es manual, documentada en cada tarea.
- Netlify CLI está disponible vía `npx netlify` (ya se descargó y verificó `netlify@26.2.0` en este entorno) — usarlo para pruebas locales de la Function con `npx netlify dev`.

---

### Task 1: Variable de entorno `GROQ_API_KEY`

**Files:**
- Modify: `.env.example`

**Interfaces:**
- Produce: la variable `GROQ_API_KEY` documentada, que la Task 2 leerá vía `process.env.GROQ_API_KEY`.

- [ ] **Step 1: Agregar la variable al archivo de ejemplo**

En `.env.example`, el contenido actual es:

```
# Meta (Facebook) Pixel ID — dashboard de Meta Events Manager
# Solo se dispara en build de produccion (import.meta.env.PROD), nunca en npm run dev
PUBLIC_FB_PIXEL_ID=
```

Agregar al final:

```
# Groq API key — usada SOLO por netlify/functions/chat.ts (lado servidor)
# NUNCA debe llevar el prefijo PUBLIC_ (eso la expondria en el HTML/JS del navegador)
# Configurar el valor real en: .env local (no se commitea) y en el dashboard de Netlify
# del proyecto "juancitoads" (Environment variables)
GROQ_API_KEY=
```

- [ ] **Step 2: Verificar que `.env` local tenga el valor real**

Este paso es manual, no de código: confirmar que el archivo `.env` (gitignored) del entorno de desarrollo tenga `GROQ_API_KEY=<valor real>` para que la Task 2 se pueda probar localmente con `npx netlify dev`. Si no está, pedir el valor al usuario antes de continuar a la Task 2.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: documentar variable de entorno GROQ_API_KEY para el chatbot"
```

---

### Task 2: Netlify Function `chat.ts` (proxy a Groq)

**Files:**
- Create: `netlify/functions/chat.ts`

**Interfaces:**
- Consume: `planesMetaAds`, `planesRedes`, `planWeb`, `resultados`, `contacto` — exportados desde `src/data/site.ts` (ya existen, no se modifican).
- Produce: endpoint HTTP `POST /.netlify/functions/chat` — recibe `{ messages: Array<{ role: "user" | "assistant"; content: string }> }`, responde `{ reply: string }` (200) o `{ error: string }` (400/405/500/502). La Task 3 (ChatWidget) consume este contrato exacto.

- [ ] **Step 1: Crear el archivo de la función**

Crear `netlify/functions/chat.ts` con este contenido exacto:

```typescript
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
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run check`
Expected: sin errores nuevos (el proyecto puede tener warnings pre-existentes no relacionados — solo verificar que no aparezcan errores en `netlify/functions/chat.ts`). Si `astro check` no reporta diagnósticos para archivos fuera de `src/`, correr en su lugar: `npx tsc --noEmit --esModuleInterop --module esnext --moduleResolution bundler --target es2022 netlify/functions/chat.ts` y confirmar que no haya errores de tipos propios del archivo (puede haber errores de resolución de módulos si se ejecuta aislado del proyecto — en ese caso, la verificación de Step 3 con `netlify dev` es la que manda).

- [ ] **Step 3: Probar la función localmente con Netlify CLI**

Run: `npx netlify dev`
Esto levanta el sitio Astro y las Functions juntos (normalmente en `http://localhost:8888`). Con el servidor corriendo, en otra terminal:

```bash
curl -X POST http://localhost:8888/.netlify/functions/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Cuanto cuesta el plan Emprendedor?"}]}'
```

Expected: respuesta JSON `{"reply": "..."}` con status 200, y el texto de `reply` debe mencionar "$150" (el precio real del plan Emprendedor en `site.ts`). Si `GROQ_API_KEY` no está seteada en `.env`, la respuesta esperada es `{"error":"server-misconfigured"}` con status 500 — en ese caso, detenerse y pedir la key antes de continuar.

Probar también un caso de validación:
```bash
curl -X POST http://localhost:8888/.netlify/functions/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[]}'
```
Expected: `{"error":"invalid-body"}` con status 400.

Detener `netlify dev` (Ctrl+C) al terminar.

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/chat.ts
git commit -m "feat: agregar Netlify Function proxy a Groq para el chatbot de soporte"
```

---

### Task 3: Componente `ChatWidget.astro`

**Files:**
- Create: `src/components/ChatWidget.astro`

**Interfaces:**
- Consume: `waLink` desde `src/data/site.ts` (ya existe); endpoint `POST /.netlify/functions/chat` de la Task 2, contrato `{ messages: [...] }` → `{ reply: string }` o `{ error: string }`.
- Produce: el componente `<ChatWidget />`, que la Task 4 monta en `Layout.astro`.

- [ ] **Step 1: Crear el componente**

Crear `src/components/ChatWidget.astro` con este contenido exacto:

```astro
---
import { MessageCircle, X, Send } from "lucide-astro";
import { waLink } from "../data/site";
---

<div id="chatWidget" class="fixed bottom-6 right-6 z-[900]">
  <button
    id="chatToggle"
    class="w-[58px] h-[58px] rounded-full bg-blue-neon flex items-center justify-center shadow-glow-blue hover:scale-110 transition-transform"
    aria-label="Abrir chat de soporte"
    aria-expanded="false"
  >
    <MessageCircle id="chatIconOpen" class="w-7 h-7 text-white" />
    <X id="chatIconClose" class="hidden w-7 h-7 text-white" />
  </button>

  <div
    id="chatPanel"
    class="hidden flex-col absolute bottom-[70px] right-0 w-[340px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[70vh] bg-bg-alt border border-blue-neon/30 rounded-lg shadow-glow-blue overflow-hidden"
  >
    <div class="flex items-center justify-between px-4 py-3 bg-bg-deep border-b border-blue-neon/20">
      <span class="text-sm font-bold text-white">Asistente Juancito Ads</span>
    </div>

    <div id="chatMessages" class="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 text-sm"></div>

    <div class="px-4 py-2 border-t border-blue-neon/20">
      <a
        href={waLink("Hola Juancito Ads, vengo del chat del sitio y quiero más información.")}
        target="_blank"
        rel="noopener"
        class="flex items-center justify-center gap-2 text-xs font-semibold text-[#25D366] hover:text-white transition-colors"
      >
        Prefiero escribir por WhatsApp
      </a>
    </div>

    <form id="chatForm" class="flex items-center gap-2 px-3 py-3 border-t border-blue-neon/20">
      <input
        id="chatInput"
        type="text"
        maxlength="500"
        placeholder="Escribí tu pregunta..."
        autocomplete="off"
        class="flex-1 bg-bg-deep border border-blue-neon/30 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-neon focus:outline-none transition-all"
      />
      <button
        type="submit"
        aria-label="Enviar mensaje"
        class="w-9 h-9 shrink-0 rounded-lg bg-blue-neon flex items-center justify-center hover:bg-blue-dark transition-colors"
      >
        <Send class="w-4 h-4 text-white" />
      </button>
    </form>
  </div>
</div>

<script>
  interface ChatMessage {
    role: "user" | "assistant";
    content: string;
  }

  function initChatWidget() {
    const toggle = document.getElementById("chatToggle");
    const panel = document.getElementById("chatPanel");
    const iconOpen = document.getElementById("chatIconOpen");
    const iconClose = document.getElementById("chatIconClose");
    const messagesEl = document.getElementById("chatMessages");
    const form = document.getElementById("chatForm") as HTMLFormElement | null;
    const input = document.getElementById("chatInput") as HTMLInputElement | null;

    if (!toggle || !panel || !messagesEl || !form || !input) return;

    const MAX_HISTORY_SENT = 12;
    const history: ChatMessage[] = [];
    let open = false;
    let welcomed = false;
    let sending = false;

    function renderMessage(role: "user" | "assistant", content: string) {
      const bubble = document.createElement("div");
      bubble.className =
        role === "user"
          ? "self-end max-w-[85%] bg-blue-neon/20 border border-blue-neon/30 rounded-lg px-3 py-2 text-white"
          : "self-start max-w-[85%] bg-white/5 border border-blue-neon/20 rounded-lg px-3 py-2 text-text-sec";
      bubble.textContent = content;
      messagesEl!.appendChild(bubble);
      messagesEl!.scrollTop = messagesEl!.scrollHeight;
    }

    function renderTyping(): HTMLElement {
      const bubble = document.createElement("div");
      bubble.className =
        "self-start max-w-[85%] bg-white/5 border border-blue-neon/20 rounded-lg px-3 py-2 text-text-sec text-xs italic";
      bubble.textContent = "Escribiendo...";
      messagesEl!.appendChild(bubble);
      messagesEl!.scrollTop = messagesEl!.scrollHeight;
      return bubble;
    }

    function setOpen(value: boolean) {
      open = value;
      panel!.classList.toggle("hidden", !open);
      panel!.classList.toggle("flex", open);
      toggle!.setAttribute("aria-expanded", String(open));
      iconOpen?.classList.toggle("hidden", open);
      iconClose?.classList.toggle("hidden", !open);

      if (open && !welcomed) {
        welcomed = true;
        renderMessage(
          "assistant",
          "¡Hola! Soy el asistente de Juancito Ads. Preguntame sobre nuestros planes, precios o resultados."
        );
      }
    }

    toggle.addEventListener("click", () => setOpen(!open));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (sending) return;

      const text = input.value.trim();
      if (!text) return;

      input.value = "";
      renderMessage("user", text);
      history.push({ role: "user", content: text });

      sending = true;
      const typingBubble = renderTyping();

      try {
        const res = await fetch("/.netlify/functions/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-MAX_HISTORY_SENT) }),
        });

        typingBubble.remove();

        if (!res.ok) {
          renderMessage("assistant", "No pude responder ahora mismo. Escribinos por WhatsApp con el botón de acá arriba.");
          return;
        }

        const data = await res.json();
        const reply = typeof data?.reply === "string" ? data.reply : null;

        if (!reply) {
          renderMessage("assistant", "No pude responder ahora mismo. Escribinos por WhatsApp con el botón de acá arriba.");
          return;
        }

        renderMessage("assistant", reply);
        history.push({ role: "assistant", content: reply });
      } catch {
        typingBubble.remove();
        renderMessage("assistant", "No pude responder ahora mismo. Escribinos por WhatsApp con el botón de acá arriba.");
      } finally {
        sending = false;
      }
    });
  }

  initChatWidget();
</script>
```

- [ ] **Step 2: Verificar tipos y build**

Run: `npm run check`
Expected: sin errores nuevos en `src/components/ChatWidget.astro`.

Este componente todavía no está montado en ninguna página (eso es la Task 4), así que `npm run build` no lo va a incluir en el HTML generado todavía — no falla, simplemente no aparece en el output. Confirmar solo que `npm run check` no reporte errores de tipos.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatWidget.astro
git commit -m "feat: agregar componente ChatWidget con historial en memoria y CTA de WhatsApp"
```

---

### Task 4: Reemplazar `WhatsAppFloat` por `ChatWidget` en el layout

**Files:**
- Modify: `src/layouts/Layout.astro`
- Delete: `src/components/WhatsAppFloat.astro`

**Interfaces:**
- Consume: `<ChatWidget />` de la Task 3.

- [ ] **Step 1: Confirmar que `WhatsAppFloat` no se usa en ningún otro lugar**

Run: `grep -r "WhatsAppFloat" src/ --include="*.astro"`
Expected: solo debe aparecer en `src/layouts/Layout.astro` (import y uso). Si aparece en algún otro archivo, detenerse y reportar — no continuar con el borrado hasta confirmar.

- [ ] **Step 2: Reemplazar el import y el uso en el layout**

En `src/layouts/Layout.astro`, reemplazar:

```astro
import WhatsAppFloat from "../components/WhatsAppFloat.astro";
```

por:

```astro
import ChatWidget from "../components/ChatWidget.astro";
```

Y reemplazar:

```astro
    <WhatsAppFloat />
```

por:

```astro
    <ChatWidget />
```

(Mismo lugar en el árbol de componentes, al final del `<body>`, junto a `<Footer />` y antes del `<script>` de scroll-reveal — no mover la posición relativa a esos otros elementos.)

- [ ] **Step 3: Eliminar el archivo `WhatsAppFloat.astro`**

```bash
git rm src/components/WhatsAppFloat.astro
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build sin errores, 5 páginas generadas.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: reemplazar boton flotante de WhatsApp por ChatWidget en el layout"
```

(Nota: `git rm` del Step 3 ya dejó `WhatsAppFloat.astro` en stage; el `git add` de este paso solo agrega `Layout.astro`. Confirmar con `git status` antes del commit que ambos cambios — la modificación y el borrado — queden en el mismo commit.)

---

### Task 5: Verificación end-to-end y documentación

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** Ninguna nueva — esta tarea es verificación + documentación del feature completo (Tasks 1-4).

- [ ] **Step 1: Build de producción**

Run: `npm run build`
Expected: build sin errores, sin referencias a `WhatsAppFloat` en el HTML generado (`grep -r "WhatsAppFloat" dist/` no debe encontrar nada).

- [ ] **Step 2: Prueba funcional completa con `netlify dev`**

Run: `npx netlify dev`

Abrir el sitio local (normalmente `http://localhost:8888`) en el navegador y probar en al menos 2 páginas distintas:
- El botón flotante ahora es el ícono de chat (no WhatsApp) en la esquina inferior derecha.
- Al abrir el chat aparece el mensaje de bienvenida.
- Preguntar algo respondible con los datos del sitio (ej. "¿cuánto cuesta el plan Negocio?") — la respuesta debe mencionar "$250" y sonar coherente con `site.ts`.
- Preguntar algo fuera de alcance (ej. "¿qué clima hace hoy?") — la respuesta debe redirigir a WhatsApp sin inventar información.
- Click en "Prefiero escribir por WhatsApp" dentro del chat — debe abrir WhatsApp Web/app con el mensaje predefinido.
- Verificar que `/contacto` sigue mostrando su CTA de WhatsApp (vía `CTAFinal`) sin cambios.
- Abrir la consola del navegador (DevTools) y confirmar que no hay errores de JavaScript.

- [ ] **Step 3: Actualizar `CLAUDE.md`**

Agregar a la sección "Fases pendientes del roadmap" (o donde corresponda tras las tareas ya completadas) una entrada marcando el chatbot como implementado, mencionando: que `GROQ_API_KEY` debe configurarse en el dashboard de Netlify del proyecto `juancitoads` (Environment variables, sin prefijo `PUBLIC_`) para que funcione en producción, y que las Netlify Functions se prueban localmente con `npx netlify dev` (no con `npm run dev`, que solo levanta Astro sin Functions).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: documentar chatbot de Groq implementado y configuracion de GROQ_API_KEY en Netlify"
```

---

## Self-Review

**Cobertura del spec (`docs/superpowers/specs/2026-07-20-chatbot-groq-design.md`):**
1. Widget flotante que reemplaza WhatsAppFloat → Tasks 3, 4. ✅
2. Netlify Function proxy con system prompt desde `site.ts` → Task 2. ✅
3. API key solo del lado servidor (`GROQ_API_KEY` sin prefijo `PUBLIC_`) → Tasks 1, 2. ✅
4. Botón de WhatsApp siempre visible dentro del chat → Task 3. ✅
5. CTA de WhatsApp en `/contacto` sin cambios → verificado explícitamente en Task 5, Step 2 (no se toca ningún archivo de esa página en este plan). ✅
6. Manejo de errores (validación, timeout, error de Groq) → Task 2. ✅
7. Sin captura de leads, sin rate limiting, sin persistencia entre recargas → decisiones de alcance respetadas, ningún task las contradice. ✅

**Fuera de alcance de este plan (decisión consciente, no omisión):** rate limiting por IP, persistencia de historial en `localStorage`, captura de nombre/WhatsApp del visitante dentro del chat — todos explícitamente descartados en el spec.
