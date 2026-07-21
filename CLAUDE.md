# CLAUDE.md — Juancito Ads

## Al iniciar cada sesión en este proyecto

**Lee `docs/errors-learned.md` completo ANTES de tocar cualquier código.** Es la bitácora de fallas ya encontradas y cómo se resolvieron — el objetivo es no reincidir en errores ya conocidos. Cada vez que se corrija un bug, un fallo de build, o un comportamiento inesperado que haya requerido investigación, se añade una entrada nueva al final de ese archivo (nunca se sobreescriben las existentes). Formato de entrada:

```markdown
## [YYYY-MM-DD] — Título breve del error

**Contexto:** Qué se estaba construyendo o modificando.
**Error:** Mensaje exacto o descripción del síntoma.
**Causa raíz:** Por qué ocurrió.
**Fix aplicado:** Qué cambio exacto resolvió el problema.
**Prevención:** Regla o patrón a seguir en el futuro.
**Archivos:** `ruta/archivo.ts:L42`
```

## Proyecto

Sitio web de Juancito Ads — agencia de marketing digital en Panamá (Meta Ads + IA). Landing profesional multi-página, migrada desde un prototipo single-file HTML (`DEMO.html`, ya eliminado — ver `docs/superpowers/specs/2026-07-20-fase1-arquitectura-astro-design.md` para el diseño de la migración y `docs/superpowers/plans/2026-07-20-fase1-arquitectura-astro.md` para el plan de implementación).

**Stack:** Astro 5 + Tailwind CSS v4 (configuración CSS-first vía `@theme` en `src/styles/global.css` — **no** usar `tailwind.config.js/mjs`). Iconos SVG nativos vía `lucide-astro` (nunca emojis como ícono funcional). Sin framework de UI adicional (no React/Vue).

**Estructura:**
- `src/pages/` — 5 rutas: `/`, `/servicios`, `/paquetes`, `/portafolio`, `/contacto`
- `src/components/` — componentes Astro, uno por sección/responsabilidad
- `src/data/site.ts` — **fuente única de verdad** para contacto, planes/precios, testimonios, portafolio. El número de WhatsApp y sus mensajes SIEMPRE se generan desde aquí (`waLink()`), nunca hardcodeados en un componente — incluye tanto el formato URL (`whatsappNumber`) como el formato visible (`whatsappDisplay`).
- `src/layouts/Layout.astro` — layout base (navbar, footer, ChatWidget flotante, scroll-reveal)
- `public/` — assets estáticos (imágenes, videos, logo, favicons)
- `netlify/functions/` — Netlify Functions (backend serverless). Único archivo hoy: `chat.ts`, proxy del chatbot de soporte hacia la API de Groq — ver punto 4 del roadmap.

**Despliegue:** Netlify, trabajando principalmente en local. Repositorio: `git@github.com:juanarrietabusiness-pixel/PAGINA-JUANCITO-ADS.git` (colaborador vía cuenta de GitHub de MIPC — el repo es de `juanarrietabusiness@gmail.com`). El usuario conectó **manualmente** un proyecto de Netlify a este repo el 2026-07-20 — **proyecto real confirmado:** `juancitoads` en la cuenta de Netlify de `juanarrietabusiness@gmail.com` (URL en vivo: `https://juancitoads.netlify.app`; dashboard: `https://app.netlify.com/projects/juancitoads`; esta integración MCP de Netlify no tiene acceso a esa cuenta, cualquier cambio ahí requiere login manual del usuario o navegador). **Ojo:** existe un proyecto Netlify huérfano llamado `juancito-ads` (con guión, site id `9b6b1677-4d5b-471c-a8b1-31781ac5eb70`, en OTRA cuenta/team) creado por error vía MCP durante la sesión del 2026-07-20 — **no es** el sitio real en producción, quedó vacío/sin deploy. No reutilizarlo asumiendo que es el sitio live.

**Comandos:**
- `npm run dev` — servidor local (solo Astro, **no** ejecuta las Netlify Functions)
- `npm run build` — build de producción (criterio mínimo de aceptación para cualquier cambio: build sin errores)
- `npm run preview` — sirve el build de producción localmente
- `npm run check` — type-check (`astro check`); el `tsconfig.json` incluye `**/*`, así que también cubre `netlify/functions/`
- `npx netlify dev` — levanta Astro **y** las Netlify Functions juntos (normalmente en `http://localhost:8888`) — necesario para probar `netlify/functions/chat.ts` localmente, ya que `npm run dev` no las carga

## Reglas aprendidas (ver bitácora para el contexto completo)

- **Nunca usar `git add -A` / `git add .` / `git add --all`** en este proyecto — usar siempre rutas exactas. (Motivo: ver entrada del 2026-07-20 en `docs/errors-learned.md`.)
- Al centralizar cualquier dato de contacto/precio en `src/data/site.ts`, enumerar explícitamente todas sus representaciones necesarias (URL, texto crudo, texto de display) — no asumir que una forma cubre todos los usos.

## Fases pendientes del roadmap

1. ~~Fase 1 — Arquitectura Astro~~ ✅ completa (fusionada a `main`)
2. ~~Meta Pixel~~ ✅ instalado y **verificado en producción** (2026-07-20). `src/components/MetaPixel.astro` (commit `278f0a9`), env-configurable, solo dispara en build de producción. Se agregó `PUBLIC_FB_PIXEL_ID=1501740081256808` en el proyecto Netlify real `juancitoads` (Environment variables, todos los scopes) y se forzó un redeploy — confirmado con `curl` que el HTML servido en `https://juancitoads.netlify.app` incluye el script `fbevents.js` con el pixel ID correcto embebido. Ver entrada del 2026-07-20 en `docs/errors-learned.md` sobre por qué Meta Pixel Helper no lo detectaba pese a estar bien instalado.
3. ~~Rediseño visual "Tech-Neón Refinado"~~ ✅ completo y fusionado a `main` (2026-07-20, commits `84b64d0`..`1ce88af` + `3a111eb`). Auditoría de diseño → 3 direcciones estéticas propuestas → usuario eligió "Tech-Neón Refinado" → plan en `docs/superpowers/plans/2026-07-20-rediseno-tech-neon.md` (7 tareas) ejecutado vía subagentes con revisión por tarea + revisión final de rama. Cambios: tipografía Inter → Bricolage Grotesque (display) + Hanken Grotesk (body); utilidad `.atmosphere` (textura/gradiente) en `global.css`; cards diferenciadas por sección (ProblemaGrid con acento lateral naranja, ResultadosGrid con degradado, Metodologia con intensidad progresiva, Testimonios como bloque editorial sin caja); Portafolio con primera imagen en layout masonry 2x2; micro-interacciones de hover reforzadas en WhatsAppFloat/NavBar CTA/ContactForm (nota: `WhatsAppFloat.astro` existía en ese momento — se eliminó después, ver punto 4). Pusheado a producción — verificar visualmente en `https://juancitoads.netlify.app` una vez complete el deploy de Netlify.
4. ~~Chatbot de soporte con Groq (IA)~~ ✅ completo (2026-07-20). Spec en `docs/superpowers/specs/2026-07-20-chatbot-groq-design.md`, plan en `docs/superpowers/plans/2026-07-20-chatbot-groq.md` (5 tareas, ejecutado vía subagentes). **Reemplaza** el botón flotante de WhatsApp (`WhatsAppFloat.astro`, eliminado) por `ChatWidget.astro` — responde FAQ sobre planes/precios/resultados usando `llama-3.3-70b-versatile` de Groq vía `netlify/functions/chat.ts` (proxy server-side; `GROQ_API_KEY` nunca se expone al navegador, ver `.env.example`). El CTA de WhatsApp en `/contacto` (vía `CTAFinal.astro`) **no se tocó**, sigue igual; el chat también recomienda WhatsApp activamente y tiene un botón fijo hacia él. **Pendiente antes de que funcione en producción:** configurar `GROQ_API_KEY` en el dashboard de Netlify del proyecto `juancitoads` (Environment variables, sin prefijo `PUBLIC_`) — sin esa variable en el entorno de Netlify (no solo en el `.env` local), la Function responde `{"error":"server-misconfigured"}`. Sin rate-limiting por diseño (riesgo aceptado conscientemente, ver spec). Ver `docs/errors-learned.md` (entradas del 2026-07-20) sobre el bug de `@types/node`/rolldown y el riesgo de `taskkill /IM node.exe`.
5. **Videos pesados sin resolver** — `public/videos/*.mp4` (53–71MB c/u, ~253MB total) siguen en el repo tal cual. El usuario decidió resolverlo más adelante (Google Drive o compresión). Bloqueó un intento de deploy vía herramienta MCP ad-hoc (ver bitácora) — el deploy nativo de Netlify vía Git sí lo maneja bien, así que no es urgente mientras el deploy sea vía Git-linked continuous deployment. Si se retoma: comprimir con ffmpeg (no instalado localmente al 2026-07-20) o mover a un host de video externo.
6. Fase 2 — SEO técnico (sitemap, robots.txt, schema.org, Open Graph). **Explícitamente pausada por el usuario** hasta resolver el tema de los videos — no iniciar sin que lo pida.
7. Google Analytics (GA4) — pendiente, el usuario va a pasar el código más adelante (mismo patrón que Meta Pixel: nuevo componente env-configurable en `src/components/`).
8. Fase 3 — GitHub Actions (tests en cada push) + previews automáticos de Netlify vía PR. Nota: el usuario ya conectó el repo a Netlify manualmente el 2026-07-20, así que los deploys automáticos a `main` probablemente ya funcionan sin GitHub Actions — falta solo la parte de tests en CI y previews por PR si se quiere ese flujo completo.
9. Esta bitácora y esta instrucción ya están activas desde ahora

## Idioma

Responde siempre en español (heredado de la configuración global del usuario).
