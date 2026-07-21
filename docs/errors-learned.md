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

---

## [2026-07-20] — Meta Pixel Helper no detectaba el pixel pese a estar correctamente instalado en producción

**Contexto:** Verificación del Meta Pixel (`src/components/MetaPixel.astro`) tras agregar `PUBLIC_FB_PIXEL_ID=1501740081256808` en el proyecto Netlify real `juancitoads` (cuenta `juanarrietabusiness@gmail.com`) y forzar un redeploy.

**Error:** Tres síntomas sucesivos que parecían indicar que el Pixel no estaba activo:
1. `Ctrl+U` (view-source) en `https://juancitoads.netlify.app` no mostraba el script del Pixel en el `<head>`.
2. Tras un segundo intento, view-source sí mostraba el script, pero la extensión Meta Pixel Helper seguía sin detectar nada en esa pestaña.
3. Repitiendo la prueba en la pestaña real (no view-source) con hard refresh (`Ctrl+Shift+R`), Meta Pixel Helper seguía mostrando "No se han encontrado píxeles en esta página".

**Causa raíz:** Tres causas distintas, cada una descartando la anterior:
1. El primer `view-source` mostraba una copia cacheada por el navegador de una carga anterior al redeploy — Chrome no siempre revalida `view-source:` igual que una navegación normal.
2. Meta Pixel Helper (y cualquier extensión con content scripts) **no puede analizar pestañas `view-source:`** — Chrome no permite inyectar content scripts en ese esquema de URL, así que aunque el script esté presente, la extensión no "ve" nada ahí.
3. La causa real: en la pestaña real, la petición de red a `https://connect.facebook.net/en_US/fbevents.js` devolvía **HTTP 503**, confirmado con la herramienta de lectura de network requests del navegador. Un `curl` directo a esa misma URL desde un entorno sin las mismas protecciones locales devolvió `200 OK`, descartando una caída real del CDN de Facebook. Un 503 real (no un bloqueo silencioso tipo `net::ERR_BLOCKED_BY_CLIENT`) es el comportamiento típico de un antivirus con módulo de "protección web"/anti-tracking (Avast, Kaspersky, Bitdefender, Malwarebytes, etc.) o un DNS con filtrado de anuncios (AdGuard DNS, Pi-hole), que interceptan la conexión HTTPS localmente y devuelven una respuesta sintética en vez de dejar pasar el dominio de tracking.

**Fix aplicado:** Ninguno en el código o el deploy — no había nada que arreglar ahí. Se confirmó que el HTML servido en producción contiene el script correcto (`fbq('init', '1501740081256808')` embebido vía `curl` sin pasar por el navegador del usuario) y se recomendó verificar el Pixel desde un dispositivo/red sin esas protecciones (celular con datos móviles) o directamente desde el Administrador de eventos de Meta (Events Manager → Diagnóstico), que ve los eventos que sí llegan a los servidores de Meta.

**Prevención:** Al depurar por qué un pixel/script de tracking "no aparece" en el navegador del usuario:
1. Nunca diagnosticar sobre una pestaña `view-source:` — las extensiones no pueden inspeccionarla. Usar siempre la pestaña real con hard refresh.
2. Verificar el HTML servido con una herramienta fuera del navegador (`curl`) antes de asumir que el problema es del código/deploy — aísla si el problema es del lado del servidor o del cliente.
3. Si el HTML es correcto pero la extensión no detecta nada, revisar la pestaña **Network** del navegador (o la herramienta de lectura de network requests) buscando el status code real de la petición al dominio de tracking — un 503/403 sintético casi siempre es un antivirus, VPN o DNS filtrando el dominio localmente, no un bug del proyecto.

**Archivos:** `src/components/MetaPixel.astro`, `src/layouts/Layout.astro:33` (sin cambios — solo verificación).

---

## [2026-07-20] — `astro check` reporta error de tipos en Netlify Function por falta de `@types/node`

**Contexto:** Task 2 del plan del chatbot de soporte — creación de `netlify/functions/chat.ts` (proxy a Groq), el primer archivo del repo fuera de `src/` que usa un global de Node (`process.env.GROQ_API_KEY`).

**Error:** `npm run check` (→ `astro check`) reportó `netlify/functions/chat.ts:95:18 - error ts(2580): Cannot find name 'process'. Do you need to install type definitions for node? Try \`npm i --save-dev @types/node\`.` — 1 error total.

**Causa raíz:** El `tsconfig.json` del proyecto incluye `**/*` (`"include": [".astro/types.d.ts", "**/*"]`), por lo que `astro check` sí cubre archivos fuera de `src/`, incluyendo `netlify/functions/`. El proyecto nunca tuvo `@types/node` ni `@netlify/functions` como dependencia porque hasta esta tarea ningún archivo usaba globals de Node. `netlify dev` lo confirma con un aviso propio al cargar la función: "For a better experience with TypeScript functions, consider installing the @netlify/functions package."

**Fix aplicado:** El subagente implementador no lo corrigió (fuera del alcance literal de la tarea: "Create: netlify/functions/chat.ts" era el único archivo previsto). El controlador sí lo corrigió como paso posterior de la misma Task 2, ya que el plan exige explícitamente `npm run check` sin errores para este archivo: se agregó `@types/node` como devDependency, pinneado a `^22` (coincidiendo con la versión real de Node del entorno de desarrollo, `v22.19.0` — no la última versión publicada del paquete, que en el momento era `^26`, muy por delante de la runtime real). Instalar la dependencia disparó el bug conocido de npm con optional dependencies (ver `Cannot find module '@rolldown/binding-win32-x64-msvc'`) — se resolvió con `rm -rf node_modules package-lock.json && npm install`. Tras el fix, `npm run check` reporta 0 errores/0 warnings/0 hints y `npm run build` sigue generando las 5 páginas sin problema.

**Prevención:** Si se agregan más Netlify Functions que usen globals de Node (`process`, `Buffer`, etc.), instalar `@types/node` como devDependency — pero pinneado a la major real de Node del entorno de ejecución (local y de Netlify), no a la última versión publicada del paquete, para evitar que el type-check pase en local con APIs de una versión de Node más nueva que la que corre en producción. Si `npm install` de un paquete nuevo dispara el error de `@rolldown/binding-*`, el fix conocido de este proyecto es `rm -rf node_modules package-lock.json && npm install` (ver también Fase 1, Task 11).

**Archivos:** `netlify/functions/chat.ts:95` (sin cambios de código — hallazgo documentado únicamente).

---

## [2026-07-20] — Detener `netlify dev` en background requirió matar todos los procesos `node.exe`

**Contexto:** Misma Task 2. Se lanzó `npx netlify dev` en background (redirigiendo stdout/stderr a un log) para probarlo con curl y luego debía detenerse.

**Error:** No había forma sencilla de obtener el PID exacto del proceso lanzado (se inició como subshell desacoplado `( ... & )`, sin devolver PID). Se usó `taskkill /F /IM node.exe /T`, que mata TODOS los procesos `node.exe` del sistema, no solo el de `netlify dev` — riesgo de afectar otros procesos Node ajenos a la tarea corriendo en la misma máquina en ese momento.

**Causa raíz:** Lanzar un proceso de larga duración en background sin capturar su PID (ni usar `run_in_background` del tool con seguimiento propio) deja como única vía de terminación un kill por nombre de imagen, que en Windows con Node es indiscriminado.

**Fix aplicado:** Se verificó que el puerto 8888 quedó inalcanzable tras el `taskkill`, confirmando que se detuvo el servidor objetivo. No se detectó daño colateral, pero no se descartó formalmente.

**Prevención:** Al lanzar un servidor de desarrollo en background en Windows, el orden de preferencia real es: (1) usar el parámetro nativo `run_in_background` de la herramienta Bash/PowerShell — es la forma correcta de terminarlo sin matar procesos hermanos; (2) si no está disponible, capturar el PID explícito del proceso lanzado (`$!` en bash, o `Start-Process -PassThru` en PowerShell) y matarlo por PID. Solo como último recurso, si ninguna de las dos opciones anteriores es viable, identificar el proceso por puerto (`netstat -ano | findstr :8888` → `taskkill /F /PID <pid>`) — sigue siendo mejor que matar por nombre de imagen genérico, pero **nunca** usar `taskkill /F /IM node.exe` (o equivalente) salvo que se acepte explícitamente el riesgo de matar procesos Node ajenos a la tarea.

**Archivos:** N/A (operación de terminal, no código del proyecto).

---

## [2026-07-21] — Ajustar solo el `rootMargin` del scroll-reveal no eliminó el parpadeo en blanco con scroll rápido

**Contexto:** Ejecución del ítem 3 del plan de mejoras UX (`docs/superpowers/specs/2026-07-21-mejoras-ux-analisis.md`) — el hallazgo #10 sospechaba que las secciones con `.reveal` (`Layout.astro`) podían mostrarse en blanco/gris un instante si el usuario hacía scroll muy rápido, porque `.reveal` arranca en `opacity: 0` y solo pasa a `opacity: 1` cuando el `IntersectionObserver` detecta la intersección y dispara la transición.

**Error:** El primer fix aplicado (cambiar `rootMargin` de `"0px 0px -4% 0px"` a un valor positivo, `"0px 0px 15% 0px"`, para que el observer disparara antes de que la sección entrara en el viewport) redujo el problema pero no lo eliminó. Verificado con scroll simulado vía `mcp__claude-in-chrome__computer` (scroll de 10 "ticks" + screenshot inmediato): con saltos de scroll grandes (equivalentes a un flick agresivo de trackpad/rueda), la sección de destino aterrizaba directamente dentro del viewport ANTES de que el `IntersectionObserver` llegara a disparar, mostrando la sección completamente en blanco por un instante — el margen de pre-disparo del 15% no alcanzaba a cubrir saltos más grandes que esa fracción del viewport.

**Causa raíz:** El diseño original ocultaba el contenido completamente (`opacity: 0`) hasta que el JS confirmaba la intersección — cualquier ajuste de `rootMargin`/`threshold` solo cambia CUÁNDO se dispara el observer, pero no elimina la ventana de tiempo en la que el contenido puede estar completamente invisible si el salto de scroll es más grande que el margen de pre-disparo. Aumentar el `rootMargin` arbitrariamente (a costa de que las animaciones se disparen muy anticipadamente, incluso fuera de pantalla) tampoco es una solución robusta — solo mueve el punto de falla más lejos, no lo elimina.

**Fix aplicado:** Se cambió el estado inicial de `.reveal` en `global.css` de `opacity: 0` a `opacity: 0.4` (nunca completamente invisible, solo atenuado) y se redujo la duración de la transición (`0.6s` → `0.35s`) y los delays escalonados (`0.08s`–`0.40s` → `0.05s`–`0.25s`) para que, incluso en el peor caso, el contenido nunca se vea "en blanco" — como mucho se ve tenue por una fracción de segundo. Se mantuvo también el `rootMargin` positivo (`35%`) como mitigación adicional. Reverificado con el mismo método de scroll simulado: ya no aparecen secciones en blanco en ningún punto de la página.

**Prevención:** Para cualquier efecto de "reveal on scroll" basado en `IntersectionObserver` + CSS transitions, no depender únicamente de ocultar el contenido con `opacity: 0` — usar un opacity inicial no-cero (o solo animar `transform`, sin animar `opacity`) para que el peor caso (scroll extremadamente rápido, salto de anchor link, etc.) nunca resulte en contenido invisible. Ajustar `rootMargin`/`threshold` ayuda a que la animación se sienta más natural, pero no es sustituto de un estado inicial que ya sea parcialmente visible. Para verificar este tipo de bug, simular scroll rápido con la herramienta de automatización de navegador (`scroll` con `scroll_amount` alto + `screenshot` inmediato) es más representativo que un `scrollTo()` instantáneo vía JS o que confiar solo en inspección de código.

**Archivos:** `src/styles/global.css:41-54`, `src/layouts/Layout.astro:74` (rootMargin del `IntersectionObserver`).
