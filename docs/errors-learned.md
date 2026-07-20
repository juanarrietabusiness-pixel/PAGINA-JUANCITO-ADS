# Bitácora de Errores — Juancito Ads

> Registro de fallas encontradas y su resolución. Se añade al final, nunca se sobreescribe.
> Formato: ver `CLAUDE.md` en la raíz del proyecto.

---

## [2026-07-20] — Commit accidental de archivos legacy pesados por `git add` descuidado

**Contexto:** Migración de `DEMO.html` (landing single-file) a Astro 5 + Tailwind v4 (Fase 1). Un subagente implementador corregía un hallazgo de revisión en la Task 6 (número de WhatsApp hardcodeado en `CTAFinal.astro`).

**Error:** El commit del fix incluyó ~190MB de archivos legacy sin relación con el fix (`DEMO.html`, `imagenes/`, `index.html`, `logo.png`, `videos/` — incluyendo un video de 71MB) que estaban sueltos y sin trackear en la raíz del proyecto, pendientes de migrarse en una tarea posterior (Task 8).

**Causa raíz:** El proyecto tuvo archivos legacy sin trackear conviviendo en el mismo working tree que el código nuevo durante toda la migración (Tasks 1–10). El subagente usó un `git add` amplio (tipo `-A`/`.`) en vez de rutas exactas.

**Fix aplicado:** `git reset --soft` al commit padre + `git restore --staged` de los archivos legacy + recommit solo con los 2 archivos previstos. Como la rama era 100% local y nunca se había pusheado a ningún remoto, el reset no tuvo ningún efecto sobre historial compartido — si ya se hubiera pusheado, habría requerido una reescritura de historial mucho más delicada.

**Prevención:** En cualquier tarea con archivos legacy sin trackear en el mismo working tree que el código nuevo:
1. Prohibir explícitamente `git add -A` / `git add .` / `git add --all` en las instrucciones a implementadores (humanos o subagentes) — exigir siempre rutas exactas.
2. Verificar `git show --stat HEAD` inmediatamente después de cada commit generado por un subagente, antes de continuar a la siguiente tarea.

**Archivos:** `src/components/CTAFinal.astro`, `src/data/site.ts` (commit corregido: `36963c2`)

---

## [2026-07-20] — Texto visible de contacto hardcodeado pese a que el link sí usaba el dato centralizado

**Contexto:** Mismo proceso de migración. `CTAFinal.astro` renderiza el número de WhatsApp como link de contacto.

**Error:** El `href` del link sí derivaba correctamente de `contacto.whatsappNumber` (`src/data/site.ts`), pero el TEXTO VISIBLE ("+507 6596-9428") estaba hardcodeado como string literal en el componente — si el número cambiara en `site.ts`, el texto visible quedaría desincronizado del link real.

**Causa raíz:** Al centralizar el dato de contacto en el plan original, solo se previó el formato usado para construir la URL (`wa.me/507...`), no el formato legible para mostrar en pantalla. El propio código de la Task 6 (escrito en el plan) arrastró el hardcodeo.

**Fix aplicado:** Se agregó el campo `contacto.whatsappDisplay` en `src/data/site.ts` y `CTAFinal.astro` ahora lo consume vía `{contacto.whatsappDisplay}`.

**Prevención:** Al centralizar un dato de contacto (o cualquier dato con múltiples representaciones), enumerar explícitamente TODAS las formas necesarias (URL, texto crudo, texto formateado para mostrar) en el mismo lugar desde el diseño — no asumir que una sola forma cubre todos los usos.

**Archivos:** `src/data/site.ts`, `src/components/CTAFinal.astro` (commit: `36963c2`)

---

## [2026-07-20] — Deploy vía herramienta MCP de Netlify falló repetidamente por tamaño de assets

**Contexto:** Se necesitaba una previsualización rápida en Netlify. Se creó un proyecto Netlify (`juancito-ads`, site id `9b6b1677-4d5b-471c-a8b1-31781ac5eb70`) vía la herramienta MCP `netlify-deploy-services-updater` (operación `deploy-site`), que ejecuta un comando `npx @netlify/mcp` local que empaqueta TODO el directorio del proyecto (excluye `node_modules/`, `.git/`, `.env`, pero **no** excluye `public/videos/` ni `dist/`) en un único ZIP y lo sube en un solo POST multipart al endpoint `/api/v1/sites/{id}/builds` de Netlify para que compile remotamente.

**Error:** Tres fallos distintos en intentos sucesivos:
1. `400 Bad Request` con `dist/` + `public/videos/` incluidos (~500MB en el zip).
2. `404 Not Found` tras borrar `dist/` local y mover los videos fuera temporalmente (payload mucho menor, subida rápida, pero el token de proxy de la sesión anterior ya no era válido).
3. `502 Bad Gateway` de `mcp-proxy.anthropic.com` (infraestructura del proxy MCP sobrecargada) en un tercer intento con token fresco.

**Causa raíz:** El flujo de deploy de esta herramienta MCP hace un único POST HTTP con todo el código fuente comprimido — no usa el protocolo de subida por chunks/content-addressable que sí usa el Netlify CLI oficial o el deploy nativo vía Git. Con ~253MB de videos en `public/videos/`, el payload excede límites razonables para ese endpoint específico, y además la capa de proxy MCP resultó ser inestable en el momento (error de infraestructura ajeno al proyecto).

**Fix aplicado:** Se abandonó el deploy vía MCP. El usuario conectó manualmente el repositorio de GitHub al proyecto Netlify desde el dashboard (Site configuration → Build & deploy → Link repository), lo cual usa el pipeline de build nativo de Netlify (compila desde Git, sin el límite de payload del endpoint de subida ad-hoc) y además deja configurado el deploy continuo automático en cada push a `main`.

**Prevención:** Para proyectos con assets grandes (videos, imágenes de alta resolución), **no usar la herramienta MCP `netlify-deploy-services-updater` / `deploy-site`** para el primer deploy — usar directamente la integración Git nativa de Netlify (dashboard → Link repository) o el Netlify CLI oficial (`netlify deploy`, que sí soporta payloads grandes vía su propio protocolo). La herramienta MCP de deploy ad-hoc solo es confiable para proyectos pequeños sin assets binarios pesados.

**Archivos:** N/A (infraestructura de despliegue, no código del proyecto). Proyecto Netlify huérfano resultante: `juancito-ads` (site id `9b6b1677-4d5b-471c-a8b1-31781ac5eb70`) — nunca tuvo un deploy exitoso, no es el sitio en producción, tiene la variable `PUBLIC_FB_PIXEL_ID` seteada mas no en uso.
