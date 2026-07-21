# Chatbot de soporte con Groq — Design Spec

**Fecha:** 2026-07-20
**Estado:** Aprobado por el usuario, pendiente de plan de implementación

## Contexto y motivación

Juancito Ads (agencia de marketing digital en Panamá) es un sitio estático Astro 5, desplegado en Netlify. El usuario generó una API key de Groq (`gsk_...`) para alimentar un chatbot de soporte que responda preguntas de visitantes sobre los servicios, precios y portafolio de la agencia, reduciendo la fricción antes de que un visitante decida escribir por WhatsApp.

**Nota de seguridad heredada de la sesión anterior:** la API key fue pegada en texto plano en el chat de esta sesión y el usuario decidió conscientemente no rotarla. Este spec no depende de ese hecho, pero el diseño exige que la key nunca llegue al navegador — ver sección "Seguridad de la API key".

## Alcance

**Dentro de alcance:**
- Un widget de chat flotante, visible en las 5 páginas del sitio, que **reemplaza** el botón flotante de WhatsApp actual (`WhatsAppFloat.astro`, montado hoy en `Layout.astro`).
- El chatbot responde preguntas frecuentes sobre: planes y precios (Meta Ads, Redes Sociales, Páginas Web), resultados/casos de éxito, portafolio, metodología de trabajo — basándose exclusivamente en el contenido ya existente en `src/data/site.ts`.
- El chatbot recomienda activamente continuar por WhatsApp cuando: (a) el usuario muestra intención de compra/contratación, (b) la pregunta excede lo que el bot puede responder con certeza, o (c) la pregunta no tiene relación con Juancito Ads.
- Dentro de la ventana de chat hay un botón de WhatsApp siempre visible (no depende de que el modelo genere un link en su texto).
- Backend: una Netlify Function que hace de proxy hacia la API de Groq, manteniendo la API key exclusivamente del lado servidor.

**Fuera de alcance (decisión explícita del usuario):**
- Captura de leads (nombre/WhatsApp del visitante) dentro del chat — el bot NO pide ni guarda datos de contacto. Eso sigue siendo el trabajo del formulario de `/contacto` y del botón de WhatsApp.
- Límite de uso / rate limiting por IP — se decidió no implementarlo en esta primera versión. Riesgo aceptado conscientemente: un visitante podría generar múltiples requests a la API paga de Groq sin restricción del lado servidor más allá de la validación básica de forma del request.
- Persistencia del historial de conversación entre recargas de página (usa memoria del navegador únicamente, se pierde al recargar).
- El botón/CTA de WhatsApp existente en `/contacto` (vía `CTAFinal.astro`) y en el resto del sitio (Hero, NavBar, CTAFinal) — estos NO se tocan, siguen funcionando igual que hoy.

## Arquitectura

```
Visitante (navegador)
   │
   │ 1. Escribe un mensaje en el widget
   ▼
ChatWidget.astro (cliente, vanilla JS/TS)
   │
   │ 2. POST /.netlify/functions/chat
   │    body: { messages: [{role, content}, ...] }
   ▼
netlify/functions/chat.ts (servidor, Netlify Function)
   │
   │ 3. Prepende system prompt (generado desde src/data/site.ts)
   │    a los messages recibidos
   │
   │ 4. POST https://api.groq.com/openai/v1/chat/completions
   │    Authorization: Bearer ${GROQ_API_KEY}  (env var de SERVIDOR, sin prefijo PUBLIC_)
   │    model: "llama-3.3-70b-versatile"
   ▼
Groq API
   │
   │ 5. Respuesta del modelo
   ▼
netlify/functions/chat.ts
   │
   │ 6. Devuelve { reply: string } al cliente
   ▼
ChatWidget.astro renderiza la respuesta en la conversación
```

**Por qué una Netlify Function y no llamar a Groq directo desde el navegador:** este proyecto es un sitio Astro con `output: "static"` (ver `astro.config.mjs`) — cualquier variable de entorno con prefijo `PUBLIC_` se inyecta literalmente en el HTML/JS que se sirve al navegador (así funciona `PUBLIC_FB_PIXEL_ID` del Meta Pixel, por diseño, porque ese valor es público). La API key de Groq NO debe seguir ese camino. Las Netlify Functions corren en un entorno Node del lado servidor, separado del build estático de Astro — pueden leer variables de entorno normales (sin prefijo `PUBLIC_`) que nunca se exponen al cliente. Netlify sirve funciones en `/.netlify/functions/<nombre>` automáticamente si existen en `netlify/functions/`, sin configuración adicional en `netlify.toml`.

## Componentes

### 1. `netlify/functions/chat.ts` (nuevo)

Función serverless en TypeScript (Netlify soporta TS nativamente en `netlify/functions/`, compila en build time). Responsabilidades:
- Recibir POST con body `{ messages: Array<{ role: "user" | "assistant"; content: string }> }`.
- Validar la forma del body: `messages` debe ser un array no vacío, cada `content` debe ser un string no vacío de máximo 500 caracteres, el array completo no debe superar 20 mensajes (limita el tamaño del historial que un cliente malicioso podría inflar). Si la validación falla, responde 400 con un mensaje de error genérico.
- Construir el system prompt (ver sección "Contenido del system prompt") a partir de datos importados de `src/data/site.ts`.
- Llamar a la API de Groq (`https://api.groq.com/openai/v1/chat/completions`) con `model: "llama-3.3-70b-versatile"`, `temperature: 0.4` (respuestas consistentes, no creativas), `max_tokens: 400` (limita costo y evita respuestas excesivamente largas para un chat de soporte).
- Si Groq responde con error (4xx/5xx) o la request hace timeout, responder 502 con `{ error: "no-disponible" }` — nunca reenviar el error crudo de Groq al cliente.
- Si todo sale bien, responder 200 con `{ reply: string }` (el contenido del mensaje del asistente).

**No requiere librería cliente de Groq** — Groq expone una API compatible con el formato de OpenAI, así que un `fetch()` nativo a su endpoint HTTP es suficiente, sin agregar una dependencia npm nueva.

### 2. `src/components/ChatWidget.astro` (nuevo)

Componente Astro con `<script>` cliente (mismo patrón que `NavBar.astro`, `Portafolio.astro`, etc. — sin framework de UI adicional). Responsabilidades:
- Renderiza un botón flotante en la esquina inferior derecha (la posición que hoy ocupa `WhatsAppFloat`), con un ícono de chat (`MessageCircle` de `lucide-astro`), estilo visual coherente con la paleta tech-neón (glow azul, igual que otros CTAs del sitio).
- Al hacer clic, abre/cierra una ventana de chat (panel flotante, similar en estructura a `Lightbox.astro`/`VideoModal.astro` en cuanto a mostrar/ocultar con clases).
- La ventana de chat tiene: un header con título ("Asistente Juancito Ads") y botón de cerrar, el área de mensajes (scroll), un input de texto + botón de enviar, y **un botón de WhatsApp siempre visible** (usa `waLink()` de `src/data/site.ts` con un mensaje predefinido tipo "Hola Juancito Ads, vengo del chat del sitio y quiero más información").
- Mantiene el array de mensajes de la conversación en una variable JS en memoria (no `localStorage`, se pierde al recargar — decisión explícita de "fuera de alcance").
- Al enviar un mensaje: lo agrega a la lista visible, hace `POST` a `/.netlify/functions/chat` con el historial completo, muestra un indicador de "escribiendo..." mientras espera, y agrega la respuesta cuando llega.
- Manejo de error de red/servidor: si el `fetch` falla o la Function responde con error, muestra un mensaje en el chat tipo "No pude responder ahora mismo. Escribinos por WhatsApp" (con el link ya visible en el botón fijo) — nunca un error técnico crudo.
- Primer mensaje de bienvenida (hardcodeado en el cliente, no requiere llamar a Groq): algo como "¡Hola! Soy el asistente de Juancito Ads. Preguntame sobre nuestros planes, precios o resultados." — ahorra una llamada a la API al abrir el chat.

### 3. `src/layouts/Layout.astro` (modificar)

- Eliminar el import y el uso de `<WhatsAppFloat />`.
- Agregar el import y uso de `<ChatWidget />` en su lugar (misma posición en el árbol de componentes, al final del `<body>`).
- `WhatsAppFloat.astro` como archivo se elimina del proyecto (ya no se usa en ningún lado — confirmar con un grep antes de borrarlo, por si quedó referenciado en otro lugar).

## Contenido del system prompt

Generado en `netlify/functions/chat.ts` a partir de los datos ya existentes en `src/data/site.ts` (no se duplica información a mano — se importa `planesMetaAds`, `planesRedes`, `planWeb`, `resultados`, `contacto` y se arma el texto del prompt interpolando esos valores). Instrucciones clave que debe incluir el prompt:

1. Identidad: "Sos el asistente de soporte de Juancito Ads, una agencia de marketing digital en Panamá especializada en Meta Ads e Inteligencia Artificial."
2. Alcance: responder únicamente sobre los servicios, planes, precios y resultados de Juancito Ads, usando solo la información provista en este prompt — nunca inventar precios, plazos o servicios que no estén listados.
3. Tono: cercano, directo, en español, respuestas cortas (2-4 oraciones), sin tecnicismos innecesarios.
4. Cierre proactivo: cuando el usuario muestre interés concreto en un plan o servicio, o cuando la pregunta no pueda responderse con la información disponible, o cuando la pregunta no tenga relación con Juancito Ads — recomendar explícitamente continuar la conversación por WhatsApp (mencionar que hay un botón de WhatsApp en la ventana de chat).
5. Los datos de planes/precios/resultados actuales de `src/data/site.ts`, interpolados como texto plano al momento de invocar la función (no como JSON crudo, para que el modelo los lea naturalmente).

## Seguridad de la API key

- La variable de entorno se llama `GROQ_API_KEY` (sin prefijo `PUBLIC_`, a diferencia de `PUBLIC_FB_PIXEL_ID`) — esto es intencional y crítico: Astro solo expone al cliente las variables prefijadas `PUBLIC_`. Al no llevar ese prefijo, la variable es invisible para el build estático y solo la puede leer el entorno Node de la Netlify Function.
- Se agrega `GROQ_API_KEY` a `.env.example` (sin el valor real) y se documenta en `CLAUDE.md` que debe configurarse en el dashboard de Netlify del proyecto `juancitoads` (mismo proceso ya hecho para `PUBLIC_FB_PIXEL_ID`).
- El `.env` local (gitignored) del desarrollador debe tener `GROQ_API_KEY=<valor real>` para poder probar la función en local con `netlify dev` (Astro por sí solo con `npm run dev` no ejecuta Netlify Functions — se necesita el CLI de Netlify para probar la función localmente; esto se documenta en la fase de implementación).

## Manejo de errores (resumen)

| Escenario | Comportamiento |
|---|---|
| Usuario manda mensaje vacío | Botón de enviar deshabilitado / no hace nada |
| Mensaje excede 500 caracteres | Se trunca en el cliente antes de enviar, o se bloquea el envío con un aviso corto |
| Función responde 400 (validación) | Widget muestra "No pude procesar tu mensaje, intentá de nuevo" |
| Función responde 502 (Groq falló/timeout) | Widget muestra "No pude responder ahora mismo. Escribinos por WhatsApp" |
| Fetch falla (sin red) | Mismo mensaje que el caso anterior |
| Groq tarda mucho | Timeout explícito de 8s en el `fetch` a Groq dentro de la Function (vía `AbortController`), por debajo del límite de 10s que Netlify impone a Functions síncronas — así la Function siempre responde un error controlado en vez de que Netlify la corte de golpe |

## Testing

Este proyecto no tiene suite de tests automatizada (criterio de aceptación establecido: `npm run build` sin errores). Para este feature, además del build, la verificación es manual:
- Probar la Function en local con `netlify dev` (o documentar que se prueba en un deploy preview de Netlify si el usuario no quiere instalar el CLI).
- Conversación de prueba cubriendo: una pregunta de precio válida, una pregunta fuera de alcance (ej. "¿qué clima hace hoy?"), un mensaje vacío, y verificar que el botón de WhatsApp del chat funciona.
- Confirmar visualmente que `WhatsAppFloat` ya no aparece flotando y que `ChatWidget` ocupa su lugar, en las 5 páginas.
- Confirmar que `/contacto` sigue mostrando su CTA de WhatsApp normalmente (sin cambios ahí).

## Riesgos conocidos y aceptados

1. **Sin rate limiting** — costo de la API de Groq no está protegido contra un actor malicioso que mande muchos mensajes. Aceptado por el usuario para esta primera versión.
2. **Historial en memoria únicamente** — si el usuario recarga la página pierde la conversación. Aceptado, fuera de alcance.
3. **API key ya expuesta en el historial de esta sesión de chat** — el usuario decidió no rotarla. No es un riesgo introducido por este spec, pero queda documentado.
