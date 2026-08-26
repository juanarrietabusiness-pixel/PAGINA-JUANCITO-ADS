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

---

## [2026-07-21] — Grillas con `grid-template-columns: repeat(N, 1fr)` fijo rompían el layout en mobile (usuario sentía necesidad de hacer zoom)

**Contexto:** El usuario reportó que en el celular sentía la necesidad de hacer pinch-zoom para leer el sitio, y sospechaba que el viewport tenía el zoom bloqueado. Se verificó que `Layout.astro:27` NO bloquea el zoom (`<meta name="viewport" content="width=device-width, initial-scale=1.0">`, sin `user-scalable=no`) — el síntoma real era que algo forzaba al usuario a acercarse para leer.

**Error:** `PaquetesGrid.astro` (líneas 21, 29, 46) y `Portafolio.astro` (líneas 26, 43) usaban `style="grid-template-columns: repeat(4, 1fr)"` / `repeat(3, 1fr)` / `repeat(2, 1fr)` como atributo `style` inline, sin ninguna variante responsive. En `/paquetes` (la página de precios, la de mayor peso para conversión) esto forzaba **4 tarjetas de planes en una sola fila sin importar el ancho de pantalla** — en un celular de ~390px, cada tarjeta quedaba en ~85px de ancho, con el texto y los precios totalmente aplastados/ilegibles.

**Causa raíz:** Esas grillas se escribieron con CSS Grid puro vía atributo `style` (probablemente para tener control fino sobre el número exacto de columnas) en vez de usar las clases responsive de Tailwind (`grid-cols-N` + prefijos `sm:`/`lg:`) que sí generan media queries. Un atributo `style` inline no tiene forma de expresar "N columnas en desktop, 1 en mobile" sin JS o `@media` a mano — quedó fijo al valor de desktop en todos los tamaños de pantalla. Nótese que otras grillas del sitio (`ProblemaGrid`, `ResultadosGrid`, `Testimonios`, `Metodologia`) sí usaban `repeat(auto-fit, minmax(280px, 1fr))`, que SÍ es responsive por naturaleza (el `auto-fit` colapsa solo a 1 columna cuando no entra el mínimo) — el bug estaba específicamente en las grillas con un número fijo de columnas.

**Fix aplicado:** Se reemplazó el `style="grid-template-columns: repeat(N, 1fr)"` por clases de Tailwind responsive en el propio `class`: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (planes Meta Ads), `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (planes Redes), `grid-cols-1 sm:grid-cols-3` (subplanes de Páginas Web), `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` (grilla de imágenes del Portafolio, preservando el `md:col-span-2 md:row-span-2` existente en la primera imagen para el layout masonry) y `grid-cols-1 sm:grid-cols-2` (grilla de videos). Verificado en el CSS compilado (`dist/_astro/*.css`) que Tailwind generó las reglas `grid-template-columns:repeat(4,minmax(0,1fr))` etc. dentro de sus media queries correspondientes.

**Nota sobre verificación visual:** No se pudo confirmar visualmente en viewport móvil real en esta sesión — la herramienta `mcp__claude-in-chrome__resize_window` no tuvo ningún efecto en este entorno (se confirmó vía `window.innerWidth` que seguía reportando el ancho de escritorio, 1920px, después de pedir un resize a 393px). El bug se identificó y corrigió por lectura directa del CSS generado (`grid-template-columns` fijo sin media query es, por definición, no-responsive a cualquier ancho — no hace falta verlo renderizado para confirmarlo), no por inspección visual.

**Prevención:** Al escribir grillas CSS Grid con un número fijo de columnas en Astro/Tailwind, usar siempre las clases `grid-cols-N` con prefijos responsive (`sm:`, `md:`, `lg:`) en vez de un atributo `style` con `grid-template-columns` a mano — un atributo `style` inline no puede expresar comportamiento responsive sin JS. Reservar `style="grid-template-columns: repeat(auto-fit, minmax(...))"` solo para los casos donde ese patrón (que sí es responsive por sí mismo) sea intencional. Para auditar mobile en este entorno, si `resize_window` no afecta `window.innerWidth`, no insistir — confiar en lectura de código (grep de `grid-template-columns`, `w-[Npx]` sin `max-w`, tap targets `p-1`/`p-0.5` en botones interactivos) en vez de perder tiempo reintentando la emulación de viewport.

**Archivos:** `src/components/PaquetesGrid.astro:21,29,46`, `src/components/Portafolio.astro:26,43`, `src/components/NavBar.astro:36` (tap target del botón de menú, `p-1` → `p-2.5`, hallazgo relacionado de la misma auditoría).

---

## [2026-07-21] — Bloquear el pinch-zoom (`user-scalable=no`) rompió el sitio en Chrome mobile, no en Safari mobile

**Contexto:** El usuario pidió explícitamente que el sitio "se sintiera como una app nativa" y no se pudiera hacer zoom. Se le advirtió de antemano que era un anti-patrón de accesibilidad (WCAG 1.4.4) y que iOS Safari ignora `user-scalable=no` desde hace años — el usuario aceptó el trade-off y se implementó igual.

**Error:** Se cambió `Layout.astro:27` de `content="width=device-width, initial-scale=1.0"` a `content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"`. Tras el deploy, el usuario reportó que el sitio "se rompió" en el navegador Chrome de un celular Android, mientras que en Safari mobile (mismo u otro dispositivo) se veía bien.

**Causa raíz:** No se llegó a diagnosticar con precisión — se priorizó revertir de inmediato porque Chrome es el navegador mayoritario en Android y el sitio estaba roto en producción para una porción grande de usuarios mobile en ese momento. Es un área conocida de comportamiento inconsistente entre motores de renderizado: a diferencia de Safari (que directamente ignora la restricción y sigue funcionando normal), Chrome en Android sí aplica `user-scalable=no`/`maximum-scale`, y hay reportes conocidos de que esa combinación puede interactuar mal con el cálculo del viewport en ciertas versiones/dispositivos (zoom inicial incorrecto, contenido cortado, etc.) — pero no se confirmó cuál era el síntoma exacto ni la causa técnica precisa en este caso.

**Fix aplicado:** Revertir el `<meta name="viewport">` a su valor original (`width=device-width, initial-scale=1.0`, sin `maximum-scale`/`user-scalable`). El pinch-zoom volvió a estar habilitado en todos los navegadores.

**Prevención:** No bloquear el pinch-zoom (`user-scalable=no`/`maximum-scale`) sin antes probarlo en un Chrome Android real o emulado — no alcanza con probarlo solo en Safari/iOS o en Chrome desktop, el comportamiento del viewport en Chrome mobile puede ser distinto. Si se vuelve a pedir esto, reproducir el problema primero (DevTools con emulación de Chrome Android, o un dispositivo real) antes de shippear, en vez de deployar directo a producción como se hizo esta vez.

**Archivos:** `src/layouts/Layout.astro:27`.

---

## [2026-08-05] — La clase `hidden` de Tailwind pierde contra `inline-flex` en el mismo elemento

**Contexto:** Construcción del cotizador (`src/pages/cotizador.astro`). Los pasos, el botón "Atrás", las cajas de total y el mensaje de error se muestran u ocultan según el avance del formulario. Se implementó igual que en el resto del proyecto: alternando la clase `hidden` de Tailwind con `classList.toggle("hidden", ...)`.

**Error:** El botón "Atrás" aparecía en el primer paso pese a tener la clase `hidden` puesta desde el servidor (`class={... ${i === 0 ? "hidden" : ""}}`). Detectado en una captura de pantalla, no en el código: leyendo el markup todo parecía correcto.

**Causa raíz:** `hidden` y `inline-flex` son ambas utilidades de `display` y tienen la misma especificidad, así que gana la que Tailwind escriba **después** en el CSS generado. Verificado midiendo posiciones en el bundle (`dist/_astro/*.css`): `.block` (10364) → `.flex` (10385) → `.grid` (10404) → `.hidden` (10423) → `.inline-flex` (10502). O sea, `hidden` gana contra `block`, `flex` y `grid` —por eso el patrón funciona en `MobileDrawer.astro` y en el resto del sitio— pero **pierde contra `inline-flex`**. El botón "Atrás" era el único elemento del proyecto que combinaba `inline-flex` con un toggle de `hidden`.

**Fix aplicado:** Se dejó de usar la clase y se pasó al **atributo** HTML `hidden` en todo el cotizador (`hidden={i === 0}` en el markup de Astro, `el.hidden = true/false` en el script). El preflight de Tailwind v4 emite `[hidden]:where(:not([hidden=until-found])){display:none!important}` — con `!important`, así que es inmune al orden de las utilidades y a cualquier clase de `display` que tenga el elemento.

**Prevención:** Para mostrar/ocultar por JavaScript, usar el atributo `hidden` (`el.hidden = bool`) en vez de la clase `hidden` de Tailwind siempre que el elemento tenga además otra clase de `display` — en particular `inline-flex`, `inline-block` o `inline`, que Tailwind escribe después de `hidden`. La clase solo es fiable en elementos sin otra utilidad de display, o combinada con `block`/`flex`/`grid`. Si hay dudas, comprobar el orden real en el CSS compilado en vez de asumirlo: `grep -bo '\.hidden{' dist/_astro/*.css` contra la otra utilidad.

**Archivos:** `src/pages/cotizador.astro` (markup y script), `src/components/MobileDrawer.astro` (no se tocó — su patrón `flex`/`hidden` sí funciona).

---

## [2026-08-05] — `text-2xs` se usaba en 4 archivos sin estar definida: Tailwind la descartaba en silencio

**Contexto:** Al revisar el CSS compilado para confirmar que las clases generadas por JavaScript (las filas del resultado del cotizador, creadas con `innerHTML`) sí llegaban al bundle, se aprovechó para verificar el resto de clases usadas en la página.

**Error:** `text-2xs` aparecía 11 veces en `src/` (`servicios.astro`, `servicios/paginas-web.astro`, `Portafolio.astro` y el cotizador nuevo) pero **0 veces en el CSS compilado**. Los badges y etiquetas marcados con esa clase no tenían ningún `font-size` propio: heredaban el del `body` (16px), cuando la intención evidente era un escalón por debajo de `text-xs` (12px).

**Causa raíz:** Tailwind v4 se configura desde CSS (`@theme` en `src/styles/global.css`) y `2xs` no es un tamaño que Tailwind traiga de fábrica — solo existen de `xs` en adelante. Sin `--text-2xs` declarado en `@theme`, `text-2xs` no es una utilidad válida y Tailwind simplemente no genera nada. No hay error ni aviso en el build: la clase queda en el HTML sin efecto, así que el bug solo se ve mirando el render (o el CSS), nunca leyendo el código fuente.

**Fix aplicado:** Se declaró `--text-2xs: 0.68rem` (con su `--text-2xs--line-height`) en el bloque `@theme` de `global.css`. El valor coincide con el `text-[0.68rem]` literal que ya usaba `Footer.astro`, que era el tamaño "diminuto" de facto del sitio. Con eso las 11 apariciones pasan a renderizar como se había diseñado — **incluye badges de páginas que ya estaban en producción**, así que esos elementos se ven más pequeños que antes del cambio.

**Prevención:** Una clase de Tailwind inválida no rompe el build ni deja rastro: falla en silencio. Al introducir cualquier utilidad con un nombre de escala inventado (`text-2xs`, `text-3.5xl`, `shadow-glow-*`, etc.), confirmar que el token existe en `@theme` de `global.css`, o verificar con un `grep` en `dist/_astro/*.css` después del build que la clase generó CSS. Ojo: `text-3.5xl` (usado en `paginas-web.astro`) está en la misma situación y **sigue sin definirse** — no se tocó por no cambiar la apariencia de más páginas de golpe.

**Archivos:** `src/styles/global.css:12-16` (declaración nueva), usos en `src/pages/servicios.astro`, `src/pages/servicios/paginas-web.astro`, `src/components/Portafolio.astro`, `src/pages/cotizador.astro`.

---

## [2026-08-05] — `ParticleCanvas` solo dibujaba dentro de `#hero`: en cualquier otra página quedaba en blanco sin avisar

**Contexto:** Creación de `/smartlink` (el enlace único para la bio de redes, portado del `/smark` de PanaClaw). La página reutiliza `ParticleCanvas.astro` como fondo, igual que hace el hero de la portada.

**Error:** El fondo se veía completamente plano. Ni error de consola, ni fallo de build, ni aviso de tipos: el `<canvas>` estaba en el DOM, con su tamaño correcto, simplemente sin un solo píxel pintado. Confirmado leyendo el propio lienzo con `getImageData()`: 0 píxeles con alfa mayor que cero en `/smartlink`, frente a ~12.800 en la portada.

**Causa raíz:** El script del componente buscaba su contenedor con `document.getElementById("hero")` en tres sitios distintos: para medir (`resize()`), para arrancar el bucle de dibujo (`IntersectionObserver` sobre `heroEl`) y para seguir el ratón. Fuera de la portada no existe ningún `#hero`, así que `heroEl` era `null`, el observer nunca se enganchaba y `loop()` —y por tanto `draw()`— no llegaba a ejecutarse nunca. `init()` sí corría, así que el lienzo se dimensionaba pero se quedaba vacío. Un componente que se anuncia como reutilizable pero que en realidad depende de un `id` que solo existe en una página, y que además falla en silencio.

**Fix aplicado:** El componente se mide y se observa a sí mismo: se sustituyeron las tres búsquedas por `canvas.parentElement`. En la portada el padre del lienzo ES `<section id="hero">`, así que el comportamiento allí es idéntico (verificado: sigue pintando ~12.800 píxeles), y ahora funciona dentro de cualquier sección posicionada que lo envuelva.

**Prevención:** Un componente reutilizable nunca debe localizar su contexto por un `id` global de otra página — que se apoye en su propio `parentElement` (o reciba el selector por props). Y ojo con el modo de fallo: un `<canvas>` sin pintar no lanza ningún error, así que este tipo de acoplamiento no lo detectan ni `astro check` ni el build. Para verificar que un lienzo dibuja de verdad, contar píxeles con alfa mayor que cero vía `getImageData()` es más fiable que mirar una captura de pantalla, donde un fondo oscuro y vacío parece intencionado.

**Archivos:** `src/components/ParticleCanvas.astro:18-22,113-114` (antes `document.getElementById("hero")`), usado por `src/components/Hero.astro` y `src/pages/smartlink.astro`.

---

## [2026-08-05] — Marcas inventadas presentadas como clientes reales en el portafolio

**Contexto:** Rediseño del portafolio. El usuario aportó seis capturas de sitios web reales construidos por la agencia y pidió reorganizar la página, que "se veía desorganizada y poco profesional".

**Error:** `Portafolio.astro` tenía una sección titulada **"Marcas que Confían en Nosotros"** con seis nombres —"Ópticas Panamá", "Pañalera El Bebé", "Inversiones Ruiz", "Estética Velvet", "Panamá Retail", "Clínica Dental Express"— pintados como logotipos de clientes. El propio código lo declaraba en un comentario: `// Marcas/Clientes ficticios representativos para Juancito Ads`. Es decir: nombres inventados publicados en producción como si fueran cartera real.

**Causa raíz:** Se escribieron como *placeholder* durante la migración desde `DEMO.html` y nunca se sustituyeron por datos reales. El comentario que avisaba de que eran ficticios estaba en el componente, no en el roadmap ni en la bitácora, así que el aviso solo era visible para quien abriera ese archivo concreto — y no salió en ninguna de las revisiones posteriores.

**Fix aplicado:** La sección se eliminó por completo en vez de rellenarla con nombres a medias. El portafolio ahora se apoya en `sitiosWeb` (`src/data/site.ts`): seis proyectos con **URL pública verificable**, donde la prueba es el enlace y no una etiqueta con un nombre. Los casos de resultados siguen anonimizados a propósito ("Cliente verificado — Óptica, Panamá"), que es distinto: omitir un nombre real por confidencialidad es legítimo; inventar uno no.

**Prevención:** Un dato de marketing marcado como ficticio en un comentario **no puede llegar a producción**. Si hace falta un placeholder visual, que sea evidentemente falso a la vista (cajas grises, "Logo 1") y que quede anotado en el roadmap de `CLAUDE.md` como pendiente bloqueante, no solo en un comentario del componente. La regla que ya existía para las métricas —"solo entran datos reales y verificables", `site.ts:13`— aplica igual a nombres de clientes, testimonios y logotipos.

**Archivos:** `src/components/Portafolio.astro` (array `marcas`, eliminado), `src/data/site.ts` (`sitiosWeb`, nuevo).

---

## [2026-08-05] — Las capturas `fullPage` de Playwright dan falso negativo con `loading="lazy"`

**Contexto:** Verificación visual del portafolio nuevo, que carga catorce imágenes (seis capturas de sitios, tres gráficas y cuatro fondos ambientales), todas con `loading="lazy"`.

**Error:** La primera tanda de capturas mostraba **todas las imágenes en blanco**: las tarjetas de sitios web salían como rectángulos oscuros con su barra de navegador y su texto, pero sin captura dentro. Parecía que las rutas movidas a `public/portafolio/webs/` estaban rotas. La comprobación programática que corría en el mismo script tampoco lo detectaba: filtraba por `img.complete && img.naturalWidth === 0`, y una imagen `lazy` que nunca entró en el viewport tiene `complete === false`, así que quedaba fuera del filtro sin contarse como fallo.

**Causa raíz:** `page.screenshot({ fullPage: true })` extiende el lienzo a la altura del documento, pero **no desplaza el viewport**, así que el navegador nunca considera que las imágenes de más abajo hayan entrado en pantalla y `loading="lazy"` no las pide nunca. La captura sale correcta según el navegador: esas imágenes, sencillamente, no se habían descargado. Dos errores encadenados, uno de captura y otro de comprobación, apuntando ambos a un bug que no existía.

**Fix aplicado:** Antes de capturar, recorrer la página entera en saltos de medio viewport con una pausa corta, volver arriba y esperar. Esto dispara tanto `loading="lazy"` como el `IntersectionObserver` de `.reveal`. Y la comprobación pasó a exigir el positivo (`i.complete && i.naturalWidth > 0`) en vez de buscar el negativo, de forma que una imagen sin cargar cuenta como fallo en lugar de escaparse. Con eso: 14/14 imágenes cargadas en escritorio y en móvil.

**Prevención:** Al verificar cualquier página de este proyecto con capturas, dar por hecho que `fullPage` **no** carga las imágenes diferidas — el portafolio, la portada y las páginas de servicio usan `loading="lazy"` en casi todas. Recorrer la página antes de capturar. Y al escribir una aserción sobre recursos, comprobar la condición de éxito, no la de fallo: `naturalWidth > 0` distingue los tres estados (cargada, rota, sin pedir), mientras que `naturalWidth === 0` confunde "rota" con "todavía no pedida". Mismo espíritu que la entrada del 2026-08-05 sobre `ParticleCanvas`: un fallo visual silencioso solo se caza midiendo píxeles reales, no mirando la captura.

**Archivos:** N/A (metodología de verificación). Componentes implicados: `src/components/PortafolioWebs.astro`, `src/components/PortafolioCreativos.astro`, `src/components/Fondo.astro`.

---

## [2026-08-05] — Fondos ambientales invisibles: bajar la opacidad sobre un fondo negro borra la imagen en vez de atenuarla

**Contexto:** El usuario subió cuatro imágenes para usarlas de fondo difuminado en varias secciones, pidiendo expresamente que fueran "nada invasivas". Se creó `Fondo.astro` con opacidades de 5–8 % y desenfoque.

**Error:** El usuario reportó que **no veía las imágenes por ningún lado**. Medido en el navegador, las cuatro estaban ahí: cargadas (`naturalWidth > 0`), con su caja correcta (hasta 1656×2220) y su `opacity` y `filter` aplicados. No era un fallo de rutas ni de carga — sencillamente no aportaban un solo píxel perceptible.

**Causa raíz:** Reducir la opacidad **interpola hacia el color de debajo**, y debajo estaba `--color-bg-deep` (#050D1F), prácticamente negro. Al 6 % sobre negro, incluso un píxel blanco puro queda en torno a #15181F: indistinguible del fondo. En una interfaz oscura, opacidad baja no atenúa una imagen, la borra. El razonamiento de partida ("menos opacidad = menos invasivo") es correcto sobre fondo claro y falso sobre fondo oscuro.

**Fix aplicado:** Se cambió a `mix-blend-mode: screen` con opacidad 0.26–0.42. Con `screen` el resultado es `1-(1-a)(1-b)`: las zonas oscuras de la imagen aportan cero y solo las claras suman luz, así que se percibe profundidad y color sin que nada tape el contenido. Es no invasivo **por construcción** y no por ir atenuado — lo que podría estorbar es justo lo que el modo de fusión descarta. Verificado midiendo el contraste real sobre la captura compuesta (píxel más claro de la zona de cada titular, fórmula WCAG): mínimo 9,2:1 contra texto blanco y 4,3:1 contra `--color-text-sec`, frente al 4,5:1 y 3:1 exigidos.

**Segundo hallazgo, en la misma revisión:** al hacerse visibles, tres de las cuatro imágenes resultaron llevar contenido que no puede leerse. `red-datos` es un panel generado con **cifras inventadas** ("54,321,789 impresiones", "12,500+ anunciantes", "3.4 % de conversión") que quedaban legibles justo detrás de la sección de resultados reales; `laptop-dashboard` muestra la **marca de un tercero** ajeno al proyecto; `redes-movil` tiene texto en la pantalla del teléfono. Se subió su desenfoque a 20–26 px hasta dejarlas como pura textura. Solo `formas-3d` (formas abstractas, sin texto) admite desenfoque bajo.

**Prevención:**
1. Sobre fondo oscuro, para una imagen ambiental usar `mix-blend-mode: screen` con opacidad 0.25–0.55, no opacidad baja a secas. Si hace falta un fondo sobre superficie clara, `screen` no sirve y hay que volver a `normal` con opacidad baja — por eso el componente expone la prop `mezcla`.
2. Un cambio visual "sutil" no se da por hecho: hay que **verlo renderizado**. Que el elemento esté en el DOM con los estilos correctos no prueba que se perciba.
3. **Mirar toda imagen decorativa a tamaño completo antes de usarla de fondo.** Una imagen generada puede traer cifras falsas, marcas de terceros o texto; si va a estar detrás de contenido serio, el desenfoque tiene que hacerla ilegible, y eso se comprueba en la captura, no en el valor del `blur`.

**Archivos:** `src/components/Fondo.astro`, y sus doce llamadas en `Portafolio.astro`, `PortafolioWebs.astro`, `PortafolioCasos.astro`, `PortafolioCreativos.astro`, `TrabajosPreview.astro`, `ayuda.astro`, `contacto.astro`, `servicios.astro` y las tres páginas de `servicios/`.

---

## [2026-08-14] — El "fondo morado" no era el fondo: era una imagen de burbujas moradas fundida en `screen`

**Contexto:** El cliente y su jefe reportaron, en cuatro páginas distintas (`/servicios`, `/cotizador`, `/ayuda`, `/portafolio`), que el sitio tenía "un color morado horrible". El propio cliente matizó el diagnóstico: "no es que el fondo sea morado, es que hay un difuminado".

**Error:** Secciones enteras teñidas de violeta, sin que ninguna variable de color del tema tuviera nada morado — la paleta de `@theme` es azul (`#050D1F`, `#0A1628`, `#1E90FF`) y naranja (`#F5A623`).

**Causa raíz:** `Fondo.astro` pintaba imágenes de `public/fondos/` como fondo de sección con `mix-blend-mode: screen` y opacidad 0,26–0,42. Una de esas imágenes, `formas-3d.webp`, es literalmente un render de burbujas moradas y rosas, y era la que se usaba en `/servicios`, `/ayuda` y la portada del portafolio. Con `screen` el resultado es `1-(1-a)(1-b)`: las zonas claras de la imagen **suman luz** al fondo, así que lo que esa imagen aportaba era exactamente su morado, repartido por toda la sección. El tinte no venía del tema ni de un degradado: venía del contenido de una imagen concreta.

Esto es la contrapartida de la entrada del 2026-08-05 ("Fondos ambientales invisibles"), que introdujo `screen` para que las imágenes se vieran sobre fondo oscuro. Aquel cambio resolvió bien el problema que atacaba —se veían— pero no consideró que hacer visible una imagen implica hacer visible **su color dominante** sobre todo lo que tenga debajo.

**Fix aplicado:** Se eliminó `Fondo.astro` y sus doce llamadas. En su lugar entra `SeccionMedia.astro`, que coloca la imagen **opaca, nítida y en su propia columna** junto al texto (patrón tomado de PanaClaw, a petición del cliente). Al dejar de haber fusión ni desenfoque, ninguna imagen puede volver a teñir una sección: si una imagen no encaja, se ve que no encaja y se cambia.

Efecto colateral del cambio: al verse nítidas, lo que una imagen tenga escrito **se lee**. Eso descartó tres de las cuatro imágenes de `public/fondos/` para el nuevo componente: `red-datos` lleva cifras inventadas ("54.321.789 impresiones", "12.500+ anunciantes", "3,4 %") bajo el rótulo "JUANCITO ADS", `laptop-dashboard` muestra la marca de un tercero ("Ekomercio") y `redes-movil` tiene texto ilegible en la pantalla del teléfono. Las cuatro quedaron sin uso. En su lugar se usan creativos reales de clientes reales (`public/portafolio/creativos/`) y capturas de sitios en producción.

**Prevención:**
1. **Mirar la imagen a tamaño completo antes de decidir cómo se integra**, no solo antes de bajarle el desenfoque. Aquí el problema no era el ajuste, era la imagen: ninguna combinación de opacidad y blur iba a quitarle el morado a un render de burbujas moradas.
2. Un modo de fusión que "hace visible" una imagen decorativa **la hace visible entera, color incluido**. Si la sección tiene una paleta que respetar, la imagen tiene que estar dentro de esa paleta desde el principio.
3. Cuando el cliente describe un síntoma de color, comprobar primero si hay alguna imagen en juego antes de revisar las variables del tema: aquí el `grep` por morado en el CSS no habría devuelto nada.

**Archivos:** `src/components/Fondo.astro` (eliminado), `src/components/SeccionMedia.astro` (nuevo), y las doce llamadas retiradas de `Portafolio.astro`, `PortafolioWebs.astro`, `PortafolioCasos.astro`, `PortafolioCreativos.astro`, `TrabajosPreview.astro`, `servicios.astro`, `ayuda.astro`, `contacto.astro` y las tres páginas de `servicios/`.

---

## [2026-08-14] — Tres imágenes se quedaron sin convertir a WebP y pesaban 6,3 MB entre las tres

**Contexto:** Al reutilizar los creativos de campaña (`public/portafolio/creativos/`) como pieza principal de `SeccionMedia` en la portada y en las dos páginas de campañas, la verificación con Playwright reportó "2/5 imágenes cargadas" en la portada.

**Error:** `feria-01.jpeg` (2,32 MB), `panales-01.png` (1,88 MB) y `tienda-01.jpeg` (2,15 MB) — frente a las capturas de sitios web de la carpeta vecina, que van de 19 a 45 KB.

**Causa raíz:** La conversión masiva a WebP del 2026-08-05 (punto 15 del roadmap, "4,6 MB → 380 KB") tocó `public/portafolio/webs/` y `public/fondos/`, pero **no** `public/portafolio/creativos/`, seguramente porque esas tres se mostraban en miniatura dentro de un mosaico y el peso no se notaba. Al ascender a pieza grande y visible, sí importa.

**Fix aplicado:** Convertidas con `sharp` a WebP calidad 82 y tope de 1600 px de ancho: 6,35 MB → 481 KB. Los originales `.jpeg`/`.png` se eliminaron y las tres referencias se actualizaron.

**Nota sobre el falso positivo:** el "2/5" **no** era culpa del peso. Al depurar imagen por imagen, las cinco cargaban (`naturalWidth > 0`); lo que fallaba era el script de verificación, que esperaba 350 ms tras el recorrido de scroll y medía antes de que las `loading="lazy"` terminaran. Subir la espera a 700 ms lo resolvió. El peso era un problema real, pero distinto del que el script señalaba — conviene no dar por buena la primera correlación.

**Prevención:** Al convertir assets a WebP, recorrer **todas** las subcarpetas de `public/`, no solo las de la tarea en curso; y al promover una imagen de miniatura a pieza principal, comprobar su peso antes. Un `ls -la` por carpeta comparando órdenes de magnitud caza esto en un vistazo.

**Archivos:** `public/portafolio/creativos/*.webp`, `src/pages/index.astro`, `src/pages/servicios/campanas-ads.astro`, `src/pages/servicios/campanas-redes.astro`.

---

## [2026-08-14] — Ni ffmpeg ni Chromium del entorno pueden abrir los videos: son QuickTime con H.264

**Contexto:** Rediseño de la parrilla de videos del portafolio. Las tarjetas salían en negro en las capturas y se quiso generar un `poster` real por video para que dejaran de depender de que el navegador pintara un fotograma solo.

**Error:** Dos intentos, dos fallos distintos:
1. `ffmpeg -ss 1.5 -i video-01.mp4 -frames:v 1` → `Invalid data found when processing input`, en los cuatro archivos.
2. Extraerlo con Chromium (cargar el video, hacer `seek`, volcarlo a un `<canvas>` y exportar a WebP) → el evento `error` del `<video>` disparaba antes que `loadeddata`.

**Causa raíz:** Los archivos **no estaban corruptos**. Recorriendo sus átomos, la estructura cuadra al byte (`ftyp` 20 + `wide` 8 + `mdat` 66.641.724 + `moov` 27.106 = 66.668.858, el tamaño exacto del archivo). Dos causas independientes:
1. El único ffmpeg del entorno es el que Playwright trae para grabar sus propios videos (`/opt/pw-browsers/ffmpeg-1011/`), compilado con `--disable-everything` y solo `vp8`/`webm`/`mjpeg`/`image2`: no lleva demuxer de mov/mp4 ni decoder H.264.
2. El Chromium de Playwright es la compilación open-source, que no incluye códecs propietarios (H.264 entre ellos). Chrome sí los trae; Chromium a secas, no.

Hallazgo aparte, y este sí es del proyecto: los cuatro archivos tienen extensión `.mp4` pero su cabecera dice `ftyp qt  ` — son **QuickTime**, no MP4. Se reproducen en los navegadores habituales, pero es una discrepancia a corregir cuando se aborde la compresión (punto 6 del roadmap).

**Fix aplicado:** Ninguno sobre los archivos — en este entorno no hay herramienta capaz de decodificarlos. Se atacó la consecuencia en vez de la causa: las tarjetas de video se rediseñaron para **no depender del fotograma** (degradado propio, etiqueta de formato y botón de play enmarcado), de modo que sin fotograma se ven como una tarjeta intencionada y no como un hueco roto. Se añadió además el fragmento `#t=0.1` al `src` de la miniatura, que empuja a los navegadores con códecs a pintar ese instante; la URL del modal va sin fragmento para que la reproducción arranque en cero.

**Prevención:**
1. **Una captura en negro de un `<video>` en este entorno no prueba nada**: hay que descartar primero que el navegador de pruebas pueda decodificar el códec. Se comprueba rápido con `videoWidth > 0` tras `loadeddata`, o mirando si el evento `error` dispara.
2. Antes de dar por corrupto un archivo multimedia, recorrer sus átomos y comparar la suma de tamaños contra el tamaño real del archivo — separa "archivo roto" de "herramienta sin códec", que es lo que pasaba aquí.
3. El `poster` de los videos **sigue pendiente** y es el arreglo de verdad. Hacerlo en la misma pasada que la compresión con ffmpeg, en una máquina con un ffmpeg completo.

**Archivos:** `src/components/PortafolioCreativos.astro`, `src/data/site.ts` (`portafolioVideos` pasa de `string[]` a objetos con `orientacion` y `formato`), `public/videos/*.mp4` (sin tocar).

---

## [2026-08-14] — El "morado" que quedaba no era morado: era el azul marino de la propia base del tema

**Contexto:** Tras eliminar `Fondo.astro` (ver la entrada anterior de este mismo día), el cliente volvió a reportar que "el color morado no se fue del todo, por ejemplo, en secciones como el footer", y adjuntó capturas de PanaClaw como referencia de contraste.

**Error:** Tinte percibido como violáceo en secciones sin ninguna imagen de fondo — el footer entre ellas, que es CSS puro (`#020913` más un naranja al 7 %).

**Causa raíz:** Ninguna, en el sentido literal. Se midió el matiz real de los píxeles renderizados (script con Playwright + `sharp`, convirtiendo RGB a HSL y contando por bandas): **el 91 % caía en 210-240°, que es azul de libro, y solo el 0,2 % en la banda violeta (255-335°)**. No había morado en el CSS ni en las imágenes.

Lo que había era `--color-bg-deep: #050D1F`, un azul marino con **26 puntos de diferencia entre el canal rojo y el azul**. Un azul marino oscuro, puesto al lado del naranja de marca y comparado con un negro de verdad, se percibe como frío y violáceo: el ojo juzga un color contra los que tiene alrededor, no contra su valor hexadecimal. El cliente estaba describiendo bien lo que veía; lo que fallaba era suponer que "morado" tenía que corresponder a un morado en el código.

**Fix aplicado:** La base baja a negro con un rastro mínimo de azul — `--color-bg-deep` de `#050D1F` a `#05070C` y `--color-bg-alt` de `#0A1628` a `#0A0D14` (de 26 puntos de diferencia R-B a 6). El footer pasa de `#020913` a `#030408`, y los radiales de `.atmosphere` bajan de 0,10/0,06 a 0,055/0,04. El azul no sale del sitio: deja de ser el suelo y queda como acento, junto al naranja.

Medido después con el mismo script, el footer pasó de **22.413 píxeles con color perceptible a 821**: el fondo dejó de aportar tinte y los únicos colores de la página son ya los acentos.

**Trampa de la medición, que costó una iteración:** el primer contraste tras el cambio dijo que el violeta había *subido* del 0,2 % al 6,3 %. Era un artefacto del propio script: sobre un fondo casi negro, una diferencia de 1-2 puntos entre canales produce una saturación relativa alta y un matiz cualquiera, aunque sea invisible. Al añadir el filtro `max(r,g,b) - min(r,g,b) >= 12` —diferencia absoluta perceptible— la cifra cayó al 0,4 %. **Al medir color sobre fondos oscuros hay que filtrar por diferencia absoluta entre canales, no solo por saturación relativa.**

**Prevención:**
1. Cuando alguien reporta un color que no aparece en el código, medir los píxeles renderizados antes de concluir que se lo imagina — y considerar que el problema puede ser **de contraste con lo que hay al lado**, no del color en sí.
2. El techo para el fondo de este sitio son ~10 puntos de diferencia entre R y B. Por encima vuelve la lectura violácea.

**Archivos:** `src/styles/global.css:4-5`, `src/components/Footer.astro:14-15`.

---

## [2026-08-14] — `SeccionMedia` no replicaba el patrón de la referencia: era una tarjeta al lado del texto, no una escena

**Contexto:** El cliente pidió el patrón "texto a un lado, imagen al otro" tomando PanaClaw como referencia. La primera versión de `SeccionMedia.astro` se dio por buena sin haber leído cómo lo hace PanaClaw de verdad.

**Error:** "No me hiciste caso de poner ciertas imágenes en la izquierda o en la derecha y que se previsualicen, así como la página de PanaClaw."

**Causa raíz:** Se implementó una retícula de dos columnas con la imagen dentro de una tarjeta —borde blanco, esquinas redondeadas, proporción fija— al lado del texto. PanaClaw hace algo distinto: su `SceneBg` pone la imagen **a sangre completa** como fondo de una sección de `min-height: 88vh`, atenuada sobre negro y bajo un doble velo (uno horizontal que abre un carril de lectura del lado del texto, otro vertical que funde con las secciones vecinas). El resultado es una escena; lo implementado era una fila con una foto adjunta, y de ahí que no se pareciera pese a cumplir "texto a un lado, imagen al otro" al pie de la letra.

**Fix aplicado:** `SeccionMedia.astro` reescrito siguiendo las cuatro decisiones de la referencia: sección de `88vh` con 120px de relleno, imagen a sangre sin marco, `opacity` sobre negro (nunca `blur` ni `mix-blend-mode`) y velo doble con carril de lectura. `lado` pasa a significar **dónde va el texto** —la imagen se lee en el lado contrario— y se estrena `foco`, que coloca el motivo de la imagen en el lado libre.

**Ojo con las imágenes verticales:** con `object-fit: cover` en un marco apaisado, una imagen vertical se escala por el ancho y **`object-position` en X no tiene ningún efecto**; solo la Y mueve algo. Le pasa a `feria-01.webp` (1792×2400): el primer intento la dejó con el letrero "TODO EL MES DE JULIO" justo detrás del titular, y no había forma de arreglarlo moviendo la X. Se resolvió bajando la Y al 54 %, donde la franja visible es la modelo y los estantes, sin tipografía que compita.

**Prevención:** Antes de replicar un patrón de un repo de referencia, **leer el componente que lo implementa**, no solo mirar el resultado. La diferencia entre "tarjeta al lado del texto" y "escena a sangre con carril de lectura" no se ve en una descripción en prosa, y las dos encajan con la frase "texto a un lado, imagen al otro".

**Archivos:** `src/components/SeccionMedia.astro`, y los tres usos en `src/pages/index.astro`, `src/pages/servicios/campanas-ads.astro` y `src/pages/servicios/campanas-redes.astro`. Referencia: `PanaClaw/src/components/SceneBg.astro` y `PanaClaw/src/pages/servicios.astro` (`.service-scene`).

---

## [2026-08-14] — El azul no había que quitarlo: había que moverlo de matiz

**Contexto:** Tras bajar la base del tema a negro casi puro para eliminar la lectura violácea, el cliente pidió recuperar el azul — el negro "no hacía match" con el resto y el azul es de la marca (el logo es azul).

**Error:** Dos correcciones seguidas que se contradecían: azul marino → se ve morado; negro → se ve desconectado de la marca.

**Causa raíz:** Las dos primeras vueltas trataron el problema como una cuestión de **cantidad** de azul (bajar la diferencia entre el canal rojo y el azul de 26 puntos a 6). El problema real era el **matiz**: `#050D1F` está en 221°, que es la frontera del índigo — el tono que el ojo lee como violáceo cuando tiene naranja al lado. Cualquier azul de esa familia iba a verse morado por oscuro que fuera, y cualquier no-azul iba a verse desconectado.

**Fix aplicado:** `--color-bg-deep` pasa a `#050F1A` y `--color-bg-alt` a `#08182A`, ambos en **211°**: el mismo azul marino de profundidad, desplazado hacia el cian. Se percibe frío y limpio, sigue siendo azul de marca y no tiene la deriva violácea. El pie va a `#030A12`, un punto más oscuro que el cuerpo pero del mismo matiz, y su halo superior pasa de naranja a azul (`rgba(30,144,255,0.07)`): un naranja extendido sobre una superficie grande deja de leerse como acento y se convierte en color de fondo sucio.

**Prevención:**
1. **Al corregir un color percibido, mirar el matiz antes que la claridad o la saturación.** Aclarar u oscurecer no saca a un color de la familia que causa el problema; cambiar el matiz sí.
2. Para este sitio, el fondo se mantiene **por debajo de ~215°**. Por encima empieza el índigo.
3. Un color de acento cálido extendido sobre una superficie grande deja de ser acento. El naranja se reserva para botones y viñetas.

**Archivos:** `src/styles/global.css:4-30`, `src/components/Footer.astro:13-25`, `src/layouts/Layout.astro:39` (`theme-color`), `src/components/CTAFinal.astro`.

---

## [2026-08-14] — Dos colores de la paleta vieja escritos a mano sobrevivieron al cambio de tema

**Contexto:** Cambio de la base del tema. `CTAFinal.astro` es la sección de cierre y sale al pie de casi todas las páginas.

**Error:** Tras cambiar las variables del tema, esa sección seguía pintándose con el azul violáceo anterior mientras el resto del sitio ya era otro color — una banda de tono distinto al final de cada página.

**Causa raíz:** Su degradado tenía los valores literales `#050D1F` y `#0A1628` en el atributo `style`, no las variables. Un `grep` por los hexadecimales viejos los encontró en tres sitios: ese degradado y la etiqueta `<meta name="theme-color">` del layout, que es la que pinta la barra del navegador en el móvil.

**Fix aplicado:** El degradado pasa a `var(--color-bg-deep)` / `var(--color-bg-alt)` y el `theme-color` al valor nuevo.

**Prevención:** Al cambiar cualquier valor de `@theme`, **buscar los hexadecimales viejos por todo `src/` antes de dar el cambio por hecho** (`grep -rn "050D1F\|0A1628" src/`). Los atributos `style` en línea no participan del sistema de variables y son invisibles para un cambio de tema. Ojo especialmente con `theme-color`, que no se ve en ninguna captura de la página.

---

## [2026-08-14] — `.toLowerCase()` sobre un texto con siglas: "la llave de la IA" → "la llave de la ia"

**Contexto:** La sección del Bot multicanal enumera dentro de una frase los costes que el cliente paga aparte. Para reutilizar las mismas cadenas que la lista larga, se derivaba la forma corta con `c.split(",")[0].toLowerCase()`.

**Error:** El texto publicado decía "el alojamiento del bot y la llave de la ia que lo mueve".

**Causa raíz:** `toLowerCase()` no distingue una sigla de una palabra. Es el mismo error de fondo que ya estaba anotado para los datos de contacto en `CLAUDE.md` —"enumerar explícitamente todas las representaciones necesarias, no asumir que una forma cubre todos los usos"—, aplicado aquí a mayúsculas en vez de a formatos de teléfono.

**Fix aplicado:** Se añade `costesAparteCorto` a `botMulticanal` con las dos frases ya escritas en su forma corta. Dos campos, dos usos, ninguna transformación automática.

**Prevención:** No derivar texto visible con transformaciones de mayúsculas cuando el original puede contener siglas, nombres propios o marcas. Si hace falta otra forma del mismo dato, se escribe.

**Archivos:** `src/data/site.ts` (`botMulticanal.costesAparteCorto`), `src/pages/servicios.astro`.

---

## [2026-08-14] — Un fondo `absolute` tapando el texto de /cotizador, y una prueba que no lo detectaba

**Contexto:** Se añadió `FondoEscena.astro` a seis secciones para que dejaran de estar planas sobre color liso.

**Error:** En `/cotizador` la página entera se veía lavada — "Tu precio en un minuto" y todo el texto apagados, como si tuvieran algo encima. Lo reportó el cliente desde el preview; había llegado a producción.

**Causa raíz:** Tenía algo encima, literalmente. `FondoEscena` se posiciona con `absolute`, y **en CSS un elemento posicionado se pinta siempre por encima de uno que no lo está**, aunque lleve `z-0` y vaya antes en el HTML. Las otras cinco secciones ya traían su contenido en un `<div class="relative z-[1]">` heredado de antes; el contenedor del cotizador no, y nadie lo comprobó. El componente lo documentaba en su cabecera, pero documentar un requisito no impide olvidarlo.

**Fix aplicado:** `relative z-[1]` en el contenedor del cotizador, con un comentario en el sitio del uso explicando por qué esa línea no es decorativa.

**Lo importante: la verificación tampoco lo veía.** El build pasa, `astro check` pasa, no hay error de consola y en una captura parece una decisión de diseño. Se añadió una prueba al script de verificación, y el primer intento **era inútil**: usaba `document.elementFromPoint()` sobre el centro de cada titular, y ese método **ignora los elementos con `pointer-events: none`** — que es exactamente lo que lleva el velo. Daba verde con el bug puesto.

La versión que sí funciona mide **el píxel renderizado**: recorta cada `h1`/`h2` de la captura y comprueba que su punto más claro pase de 170/255. Validada a propósito reintroduciendo el bug en el navegador: **255 con el arreglo, 49 sin él**.

Segunda trampa, ya dentro de esa prueba: hay que **desplazarse hasta el titular antes de medirlo**. `.reveal` arranca en `opacity: .4`, así que un titular sano fuera del viewport mide 255 × 0,4 ≈ 102 y se marca como apagado. La primera pasada dio 14 falsos positivos por esto.

**Prevención:**
1. Cualquier sección que use `FondoEscena` necesita su contenido en `relative z-[1]`. **No basta con documentarlo: hay una prueba que lo comprueba en todas las rutas.**
2. **Una prueba nueva no vale hasta que se la ve fallar.** Reintroducir el defecto a mano y confirmar que salta, antes de confiar en un verde. `elementFromPoint` no sirve para detectar solapamientos visuales — para eso hay que mirar píxeles.
3. Al medir brillo o color de elementos con animación de entrada, activarla primero.

**Archivos:** `src/pages/cotizador.astro:24-33`, `src/components/FondoEscena.astro`.

## [2026-08-26] — Dar por rota la instalación de GTM leyendo el roadmap en vez de comprobar Netlify

**Contexto:** El cliente pidió "instala el Tag Manager" y adjuntó la pantalla de instrucciones de GTM con el contenedor `GTM-WFWTVSKT`. El punto 8 del roadmap decía, desde el 2026-07-21: *"Pendiente antes de que funcione en producción (ambos): configurar `PUBLIC_GTM_ID` y `PUBLIC_GA_ID` en el dashboard de Netlify"*.

**Error:** Se diagnosticó de inmediato que GTM llevaba un mes sin medir nada porque la variable nunca se había configurado, y se escribió una entrada de bitácora entera explicando ese fallo silencioso. **El diagnóstico era falso.** Consultado el proyecto real vía el MCP de Netlify, las cuatro variables estaban puestas desde el 2026-07-21, en todos los ámbitos y contextos: `PUBLIC_GTM_ID=GTM-WFWTVSKT`, `PUBLIC_GA_ID`, `PUBLIC_FB_PIXEL_ID` y `GROQ_API_KEY`. El usuario las había configurado el mismo día; lo que quedó desactualizado fue la nota del roadmap.

**Causa raíz:** Dos suposiciones encadenadas. La primera, tratar el roadmap como estado en vez de como registro: `CLAUDE.md` describe lo que se sabía al escribirlo, y un "pendiente" solo significa que nadie volvió a editar esa línea — no que la tarea siga sin hacer. La segunda, dar por buena otra nota igual de vieja: `CLAUDE.md` afirmaba que *"esta integración MCP de Netlify no tiene acceso a esa cuenta"*, así que ni se intentó consultar. Sí tiene acceso — `get-projects` devuelve `juancitoads` con su ID de proyecto, y `manage-env-vars` lista las variables. La comprobación que habría desmontado el diagnóstico en un minuto se descartó por una frase escrita cinco semanas antes.

**Fix aplicado:** Se reescribió esta entrada y se corrigió el punto 8 del roadmap. El cambio de código —dar valor por defecto al ID de contenedor en `GoogleTagManager.astro`— **se conserva, pero no arregla nada roto**: es redundancia deliberada, porque un ID de GTM es público (viaja en el HTML de cada visita) y no gana nada dependiendo de que alguien configure una variable. La variable sigue mandando cuando existe, y hoy existe con el mismo valor.

**Lo que sigue sin verificar, y hay que decirlo:** desde este entorno no se puede alcanzar el sitio en vivo (el proxy de salida devuelve 403 tanto a `curl` como a `WebFetch`), así que **no se ha confirmado que GTM cargue en producción**. Solo se ha confirmado sobre el `dist/` local: el script queda como primer elemento del `<head>` y el `<noscript><iframe>` justo después de `<body>`.

**Hipótesis de por qué el cliente lo ve como no instalado:** probablemente lo estaba probando contra `juancitoads.com`, que **no apunta a Netlify** — su registro A sigue en el creador de webs de GoDaddy (resuelve a 13.248.243.5 / 76.223.105.230, IPs de GoDaddy/AWS, no la 75.2.60.5 de Netlify). En ese dominio no hay GTM porque no hay sitio nuestro. La comprobación válida es contra `juancitoads.netlify.app`.

**Prevención:**
1. **El roadmap y la bitácora no son el estado del sistema.** Antes de diagnosticar a partir de un "pendiente" escrito hace semanas, comprobar el sistema real. Para las variables de Netlify eso es una llamada.
2. Lo mismo vale para las notas sobre qué herramientas hay disponibles: **una limitación anotada en el pasado se reintenta antes de darla por vigente**, porque el entorno cambia y la nota no se entera.
3. Cuando alguien reporta que algo "no está puesto", confirmar **contra qué URL** lo está mirando antes de buscar el fallo en el código.

**Archivos:** `src/components/GoogleTagManager.astro`, `.env.example`, `CLAUDE.md` (punto 8, corregido).

---

## [2026-08-26] — Renombrar la línea grande del hero rompió el encaje medido del móvil estrecho

**Contexto:** El cliente pidió que las tres pastillas del hero se llamaran como los servicios: "Campañas publicitarias", "Campañas + Redes" y "Páginas webs". Antes la línea grande era el beneficio en una palabra ("Clientes", "Redes", "Web").

**Error:** No hay mensaje: el cambio es de una cadena de texto y el build pasa. Medido con Playwright, a 360×640 la tercera pastilla pasó de sobrar **~16px** por debajo del borde a sobrar **42px**, es decir, de "asoma parcialmente" a "no se ve".

**Causa raíz:** "Campañas publicitarias" no cabe en un renglón por debajo de ~380px de ancho. Parte en dos, la pastilla crece unos 20px y arrastra a las de abajo. El hero tiene cinco bloques apilados y una consulta `@media (max-height: 740px)` que los ajusta al milímetro — el aviso estaba escrito en el propio componente ("si se vuelve a tocar el copy del hero, comprobar que las tres pastillas siguen entrando enteras"), pero ese ajuste va por **altura**, y este problema es de **anchura**: ninguna regla existente podía absorberlo.

**Fix aplicado:** Una consulta nueva `@media (max-width: 380px)` que baja la etiqueta a 0.9375rem para que vuelva a caber en un renglón, y recorta la separación de la línea de apoyo. Con eso la sobra queda en **12px**, algo mejor que los ~16px de antes del cambio. En escritorio las tres etiquetas reservan el alto de dos renglones (`sm:min-h-[2.65rem]`) para que los precios queden alineados aunque solo una parta en dos.

Esto es una excepción consciente a la regla que había en `global.css` de no tocar nunca la tipografía de las opciones ("encogerlas para que quepan sería ganar el hueco perdiendo el clic"). El compromiso se invierte cuando el problema es la anchura: ahí el renglón partido es justo lo que se lleva por delante la opción entera, así que 15px en una línea vale más que 16px en dos.

**Prevención:** Un cambio de copy en el hero **es un cambio de layout** y se mide, no se mira. Las medidas útiles son cuántos renglones ocupa cada etiqueta y si la última pastilla queda dentro del viewport, en 390×844, 375×667 y 360×640. Y al alargar un texto, comprobar si el ajuste que lo protege va por altura o por anchura antes de suponer que ya está cubierto.

**Archivos:** `src/components/Hero.astro`, `src/styles/global.css` (`@media (max-width: 380px)`).

---

## [2026-08-26] — El barrido de scroll no basta para las imágenes `loading="lazy"`: hay que quedarse quieto

**Contexto:** Verificación con Playwright de las once rutas tras renombrar el cuarto servicio. El script recorría la página en saltos de medio viewport —la técnica que resolvió el falso negativo del 2026-08-05— antes de comprobar que todas las imágenes hubieran cargado.

**Error:** Entre tres y cinco imágenes reportadas como "sin cargar" en cada pasada, y **cambiando de una ejecución a otra**: `red-esferas.webp` en unas rutas, `laptop-pregunta.webp` en otras, dos capturas del portafolio solo en móvil.

**Causa raíz:** Ninguna estaba rota. Servidas por el `preview` daban `200` con su tamaño correcto, y aisladas en el navegador cargaban perfectamente (`naturalWidth: 2000`). Lo que fallaba era el recorrido: pasa por cada posición con una pausa de ~120ms y **vuelve arriba inmediatamente**. Eso basta para que el `IntersectionObserver` de `.reveal` dispare, pero no para que una imagen diferida termine de descargarse — y las que quedaban a medias aparecían con `complete: false` y `naturalWidth: 0`, indistinguibles de una ruta rota. El síntoma variaba entre ejecuciones porque dependía de cómo cayera el tiempo de red, que es la firma de una carrera, no de un fallo.

La espera que debía cubrirlo (`waitForFunction` sobre `img.complete`) tampoco servía: una imagen `lazy` que el navegador **nunca llegó a pedir** también tiene `complete === false`, así que la espera agotaba sus 15 segundos y seguía siendo `false`. Esperar no arregla lo que no se ha pedido.

**Fix aplicado:** Tras el barrido, se centra explícitamente cada imagen que siga pendiente (`scrollIntoView({ block: "center" })`) y se espera a su evento `load` o `error`, con tope de 8s. Con eso: 0 fallos en las once rutas por los dos viewports, de forma estable.

**Prevención:** Es la contrapartida de la entrada del 2026-08-05 — aquella enseñó que hay que **recorrer** la página; esta añade que recorrerla no es suficiente, hay que **quedarse** donde está la imagen hasta que responda. Y la regla general: cuando un fallo de verificación cambia entre ejecuciones sobre el mismo build, es una carrera del script, no un defecto del sitio. Antes de tocar el código, comprobar el recurso por su cuenta (`curl` al servidor, `naturalWidth` con el elemento centrado); las tres veces que ha pasado en este proyecto, el bug estaba en el verificador.

**Archivos:** N/A (metodología de verificación). Componentes implicados: `src/components/FondoEscena.astro`, `src/components/SeccionMedia.astro`.

---

## [2026-08-26] — Playwright no encuentra Chromium en el entorno remoto (versión de build distinta)

**Contexto:** Verificación en navegador del envío de los formularios a Resend, en una sesión de Claude Code remota (contenedor efímero, no la máquina del usuario).

**Error:**

```
browserType.launch: Executable doesn't exist at
/opt/pw-browsers/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║     npx playwright install                                 ║
╚════════════════════════════════════════════════════════════╝
```

**Causa raíz:** El entorno trae Chromium preinstalado en `/opt/pw-browsers` (con `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, así que `npx playwright install` no descarga nada), pero **la versión de build no coincide**: el `playwright` instalado en la sesión esperaba la build `1234` y el entorno tiene la `1194`. Playwright localiza el navegador por número de build, no por "el Chromium que haya".

**Fix aplicado:** Lanzar con la ruta explícita en vez de dejar que Playwright la resuelva:

```js
chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" })
```

La ruta exacta se saca con `ls /opt/pw-browsers` + `find /opt/pw-browsers/chromium-<build> -name chrome`. No sirve `/opt/pw-browsers/chromium` a secas: ahí no está el binario.

**Prevención:** En sesiones remotas, antes de escribir el script de verificación, comprobar qué build hay (`ls /opt/pw-browsers`) y pasar `executablePath` desde el principio. Y **nunca** ejecutar `npx playwright install` para "arreglarlo": con la descarga desactivada no hace nada, y el mensaje de error lo sugiere igual.

**Archivos:** scripts de verificación (fuera del repositorio, en el directorio temporal de la sesión)

---

## [2026-08-26] — Los errores de consola del entorno remoto no son errores del sitio

**Contexto:** La misma verificación con Playwright. La comprobación "0 errores de JS" fallaba en las 5 rutas revisadas, incluidas páginas que no se habían tocado.

**Error:** `Failed to load resource: net::ERR_TUNNEL_CONNECTION_FAILED` y `net::ERR_CONNECTION_RESET` en cada página.

**Causa raíz:** El proxy de salida del entorno remoto bloquea Google Fonts, que `Layout.astro` carga desde `fonts.googleapis.com`. El navegador lo reporta como error de consola, pero **no es un error de la página**: el mismo sitio en un navegador real carga la fuente sin problema. Se sumaba a esto el 400 que una de las pruebas provoca a propósito para comprobar el aviso de error del formulario.

**Fix aplicado:** Separar las dos señales en el verificador. `pageerror` (excepción de JavaScript) cuenta siempre; de `console` con tipo `error` se descartan los mensajes que empiezan por `Failed to load resource`, que son fallos de red de recursos, no del código.

**Prevención:** Una comprobación de "0 errores de JS" que mezcla excepciones con fallos de carga de recursos externos da falsos positivos en cualquier entorno con red restringida — y peor: enseña a ignorar el resultado de la prueba. Filtrar por tipo desde el principio. Si algún día se quiere vigilar de verdad que los recursos externos cargan, esa es **otra** comprobación, con su propia lista de hosts esperados.

**Archivos:** scripts de verificación (fuera del repositorio, en el directorio temporal de la sesión)

---

## [2026-08-26] — Los canonical llevaban un mes regalándole el sitio a `netlify.app`, con el dominio real ya funcionando

**Contexto:** Puesta a punto de SEO técnico y Google Search Console para `juancitoads.com`, a petición del usuario.

**Error:** Ningún síntoma visible. Todas las páginas servían `<link rel="canonical" href="https://juancitoads.netlify.app/...">` y `og:url` al mismo subdominio, porque `site` en `astro.config.mjs` seguía en `https://juancitoads.netlify.app`.

**Causa raíz:** El canonical es la etiqueta con la que una página le dice a Google *"la versión buena de esto vive aquí"*. Mientras el dominio propio no existía, apuntar a `netlify.app` era correcto. Cuando el dominio se compró y se conectó (punto 21 del roadmap), se cambió el lado de Netlify y el DNS, pero no esta línea — que es la única que decide qué URL acumula la autoridad. Con las dos formas del sitio respondiendo, el canonical le estaba pidiendo a Google que indexara el subdominio de la plataforma y tratara el dominio de la marca como la copia.

**Fix aplicado:** `site: "https://juancitoads.com"` en `astro.config.mjs`. De ahí salen ya los canonical, las `og:url`, las URLs del sitemap, el `Sitemap:` del robots.txt y todas las URLs de los datos estructurados: es el único sitio donde se escribe el dominio.

**Prevención:** El dominio de un sitio Astro vive en **una** línea, y hay tres cosas que se mueven juntas al conectar un dominio nuevo: el DNS del registrador, el dominio principal en el hosting y `site` en la configuración. Las dos primeras se ven al abrir el navegador; la tercera es invisible y no rompe nada, así que es la que se queda atrás. Al conectar un dominio, tocar las tres en el mismo cambio. `scripts/verificar-seo.mjs` ahora falla si un canonical apunta fuera del dominio real.

**Archivos:** `astro.config.mjs:20`, `src/pages/robots.txt.ts`, `src/data/schema.ts`

---

## [2026-08-26] — El catálogo de servicios metía los precios en la política de privacidad

**Contexto:** Datos estructurados nuevos (`src/data/schema.ts`). El nodo de la organización (`ProfessionalService`) llevaba un `hasOfferCatalog` con los cuatro servicios y **el precio de entrada de cada uno**, y ese nodo se emite en todas las páginas indexables.

**Error:** Detectado por el verificador recién escrito, antes de subir nada: 32 fallos del tipo `/privacidad/: el JSON-LD declara $150 pero ese precio no aparece en la página`, en `/terminos`, `/portafolio`, `/contacto`, `/cotizador` y `/ayuda`.

**Causa raíz:** Confundir *dato de la empresa* con *dato de la página*. El catálogo describe a la agencia, así que parecía natural que viajara con ella a todas partes. Pero el marcado no describe a la empresa en abstracto: describe **esta página**, y Google lo dice explícitamente ("no marques contenido que el usuario no puede ver"). Una política de privacidad que le declara cuatro precios a Google sin escribir ninguno en pantalla es exactamente el caso que esa regla prohíbe, y las discrepancias entre marcado y contenido son motivo de acción manual sobre el dominio entero, no sobre la página.

**Fix aplicado:** El catálogo se queda con lo que es cierto en cualquier página del dominio (qué servicios hay y en qué URL está cada uno) y pierde las cifras. Los precios viven en el `Service` de cada página de servicio, donde están escritos en las tarjetas de plan. Además se quitaron dos cosas del mismo tipo: el `price` plano en planes con rango (decía "$450" junto a un `minPrice/maxPrice` de 450–550 — dos cifras contradictorias para el mismo plan) y `valueAddedTaxIncluded: false`, que estrenaba en el marcado una condición sobre el ITBMS que el sitio no dice en ninguna parte y que `/terminos` no ha decidido.

**Prevención:** Antes de meter un dato en el JSON-LD, la pregunta no es "¿es verdad?" sino "**¿está escrito en esta página concreta?**". Si el nodo se emite en todas, solo puede llevar lo que sea visible en todas. Es la misma regla que ya rige `ayuda.ts` ("no se estrena ninguna promesa aquí") aplicada al marcado. La comprobación está automatizada: `verificar-seo.mjs` extrae todo `price`/`minPrice`/`maxPrice` del JSON-LD y exige encontrar esa cifra formateada en el texto de la página.

**Archivos:** `src/data/schema.ts` (`catalogo()`, `oferta()`), `scripts/verificar-seo.mjs`

---

## [2026-08-26] — Un filtro de ruido en el verificador se tragó todos los errores y dio "todo correcto"

**Contexto:** Verificación en navegador de las 13 rutas. El proxy del entorno bloquea Google Fonts, así que cada página reportaba 2 errores de consola ajenos al sitio y había que filtrarlos para no enmascarar los de verdad.

**Error:** El filtro se aplicó con un heredoc de bash **sin comillas** (`<<PYEOF` en vez de `<<'PYEOF'`), así que bash expandió `${m.text()}` y `${origen}` como variables suyas —vacías— antes de que Python escribiera el fichero. La línea quedó en `errores.push();`. Un `push()` sin argumentos no añade nada, así que `errores.length` fue siempre 0 y el verificador anunció **"Navegador: todo correcto"** sobre 26 combinaciones de ruta y viewport sin haber comprobado un solo error.

**Causa raíz:** Dos fallos encadenados. El de bash es conocido: un heredoc sin comillas expande `$` dentro del cuerpo, y el `bad substitution` que bash imprimió se perdió entre la salida del script. El de fondo es de método: **el resultado del cambio fue un verde**, y un verde no invita a mirar. Si el filtro hubiera roto el script, se habría visto al instante; al silenciar una comprobación, mejoró la salida.

**Fix aplicado:** Heredoc citado (`<<'PYEOF'`) y la ruta pasada por variable de entorno. Después, la comprobación que faltaba: inyectar `<script>noExisteEstaFuncion()</script>` en una página del `dist` y confirmar que el verificador la caza (`✗ /contacto/: ReferenceError: noExisteEstaFuncion is not defined`). Con el filtro ya de fiar, apareció además que el proxy también bloquea `googletagmanager.com` — ruido de entorno, pero prueba de paso de que GTM sí se inyecta en el build de producción.

**Prevención:** Dos reglas. (1) Para escribir código dentro de un heredoc, **siempre `<<'EOF'` con comillas**; sin ellas, cualquier `${...}` del código es una variable de bash. (2) Ampliación de la lección del 2026-08-14 ("una prueba nueva no vale hasta verla fallar"): **también hay que verla fallar después de tocar un filtro**. Silenciar ruido y desactivar la prueba producen exactamente la misma salida — un verde — y solo se distinguen rompiendo algo a propósito.

**Archivos:** N/A (verificador temporal de sesión). Método aplicable a `scripts/verificar-seo.mjs`.

---

## [2026-08-26] — Segunda vez en el mismo día: el roadmap decía que el DNS no apuntaba a Netlify, y sí apuntaba

**Contexto:** Arranque de la sesión de SEO. El punto 21 del `CLAUDE.md`, escrito horas antes, decía que `juancitoads.com` seguía resolviendo a las IPs de GoDaddy (`13.248.243.5`) y que el registro A todavía apuntaba al creador de webs.

**Error:** El plan inicial daba por hecho que había que advertir al usuario de que nada de esto funcionaría hasta arreglar el DNS, y que poner el canonical en `juancitoads.com` era arriesgado porque el dominio serviría otro contenido.

**Causa raíz:** Leer el estado del sistema en la documentación. El usuario hizo el cambio en GoDaddy después de que se escribiera ese punto: medido con `dns.resolve4`, `juancitoads.com` → `75.2.60.5` (balanceador de Netlify) y `www` → CNAME a `juancitoads.netlify.app`. Además el dominio ya tenía el TXT `google-site-verification=...`, o sea que la propiedad de Search Console estaba creada — otro paso que el roadmap no recogía.

**Fix aplicado:** Comprobar antes de planificar. Con el DNS ya correcto, el cambio de dominio dejó de tener riesgo y se pudo hacer en la misma sesión en vez de dejarlo condicionado.

**Prevención:** Es **la misma lección registrada esta misma mañana** con GTM ("el roadmap no es el estado del sistema"), y aun así estuvo a punto de repetirse. Lo que la hace reincidente es que el roadmap de este proyecto está escrito con tanto detalle que se lee como una medición. No lo es: es una foto del momento en que se escribió, y los pasos manuales del usuario ocurren entre sesiones. Regla operativa: **cualquier punto del roadmap que describa infraestructura fuera del repositorio (DNS, variables de Netlify, propiedades de Google) se vuelve a medir al empezar, antes de construir el plan encima.** Medir cuesta un comando; diagnosticar sobre un dato viejo cuesta la sesión entera.

**Archivos:** `CLAUDE.md` (punto 21, corregido en esta sesión)

---

## [2026-08-26] — Dos ramas en paralelo chocaron en la bitácora y en la numeración del roadmap

**Contexto:** La rama de SEO técnico (`claude/google-search-console-setup-y3bp0c`) se abrió sobre `8dbac48`. Mientras estaba en curso, se fusionó a `main` el PR #5 de Resend. Al pedir el merge, GitHub reportó conflictos.

**Error:** `CONFLICT (content)` en `CLAUDE.md` y en `docs/errors-learned.md`. `src/pages/servicios/paginas-web.astro` lo tocaron las dos ramas pero se auto-fusionó sin conflicto (cada una en una zona distinta del frontmatter).

**Causa raíz:** Ninguno de los dos conflictos era una contradicción de lógica: eran **dos ramas añadiendo al final del mismo fichero acumulativo**. Git no puede saber en qué orden van dos bloques nuevos pegados al mismo punto de anclaje, así que los marca aunque no se pisen. Los dos ficheros que más se tocan en este proyecto son justamente los dos que crecen por el final.

El del roadmap sí tenía además una decisión de fondo: **las dos ramas escribieron un "punto 22" distinto** (Resend por un lado, Search Console por el otro) y, encima, la de SEO había reescrito el punto 21 para corregir el estado del dominio. Quedarse con el lado equivocado no habría dado ningún error de compilación — habría dejado escrito en el sitio donde se consulta el estado del proyecto que el DNS sigue apuntando a GoDaddy, que es falso desde esa misma mañana.

**Fix aplicado:** `git merge origin/main` en la rama y resolución a mano, con un criterio por fichero:
- **Bitácora:** se conservan las dos series completas, las de `main` primero por ser las que llegaron antes a la rama principal. La regla del proyecto ("se añade al final, nunca se sobreescribe") ya dictaba la respuesta.
- **Roadmap:** el punto 21 se queda con la versión corregida —no por ser la de la rama, sino porque el DNS **está medido** (`75.2.60.5`)—; Resend conserva el número 22 por haber entrado antes a `main`; la tanda de SEO se renumera al 23, y la referencia cruzada del punto 7 se actualiza al número nuevo.

Después, verificación de que el merge no rompió ninguno de los dos lados: `npm run build` (13 páginas), `npm run check` (0 errores en 53 ficheros), `npm run verificar:seo` (662 comprobaciones) y navegador en 13 rutas × 2 viewports, con dos comprobaciones nuevas para lo que el merge sí podía haber roto en silencio — que los dos formularios conserven sus campos y su `data-netlify="true"` (la caída a Netlify Forms). Ambas se probaron viéndolas fallar antes de darlas por buenas.

**Prevención:** Con ramas largas en paralelo, `CLAUDE.md` y `docs/errors-learned.md` van a chocar **siempre**; no es un síntoma de nada, es la forma de los ficheros. Dos cosas ayudan: (1) traer `main` a la rama **antes** de escribir la documentación, no después, que es cuando el conflicto sale gratis; y (2) al resolver el roadmap, comprobar la numeración y las referencias cruzadas (`grep -o "punto 2[0-9]"`) en vez de dar por bueno el orden que deje git — un número duplicado no rompe ningún build y sobrevive indefinidamente. Y el criterio de fondo: en un conflicto sobre un dato de infraestructura, **gana el lado que lo midió**, no el más reciente ni el de la rama principal.

**Archivos:** `CLAUDE.md` (puntos 7, 21, 22, 23), `docs/errors-learned.md`

## [2026-08-26] — El chat llevaba diez días mudo: Groq apagó el modelo el 16 de agosto y nada en el sitio lo dijo

**Contexto:** El cliente reenvió un correo de Groq —que le había llegado a su bandeja, no al proyecto— avisando de que `llama-3.3-70b-versatile` se retiraba el **16 de agosto de 2026** y recomendando migrar a `openai/gpt-oss-120b` o `qwen/qwen3.6-27b`. Ese es el modelo que mueve el chat de soporte desde el 2026-07-20 (punto 4 del roadmap).

**Error:** Ningún mensaje de error en ninguna parte. `npm run build` pasa, `astro check` pasa, el botón del chat sigue latiendo, la ventana se abre igual y el visitante escribe su pregunta — y recibe el mensaje de error genérico del widget, el mismo que saldría si se le hubiera caído el wifi. Diez días así, desde el 16 hasta el 26 de agosto, sin forma de saber cuántas conversaciones se perdieron.

**Causa raíz:** El identificador del modelo estaba escrito como una constante suelta (`const MODEL = "llama-3.3-70b-versatile"`), es decir, tratado como un valor estable. No lo es: un modelo alojado por un tercero es un servicio **con fecha de caducidad**, y Groq las anuncia con meses de antelación por correo. El repositorio no tenía forma de enterarse de ese correo, y tampoco tenía nada que amortiguara el golpe cuando llegara la fecha.

Lo que convirtió una caída en una caída **invisible** fueron dos decisiones de la versión original, ambas razonables por separado:
1. Todos los fallos de la Function colapsan en el mismo `{"error":"groq-error"}` y el widget los pinta con el mismo texto. Bien pensado de cara al visitante (no se le enseñan tripas), pero deja al operador sin distinguir "no hay red" de "el modelo que pediste ya no existe".
2. **No había un solo `console.error`.** Los logs de Netlify llevaban diez días registrando la ejecución de la función sin una línea que dijera que Groq devolvía 400 a cada llamada. El dato estaba, pero nadie lo escribía.

**Fix aplicado:** El modelo deja de ser una constante y pasa a ser una **lista ordenada** (`MODELOS`), con los dos reemplazos que la propia Groq recomienda. Si el primero falla por algo que pueda depender del modelo —no existe, lo retiraron, está saturado— se prueba el siguiente **dentro de la misma petición del visitante**, así que la próxima retirada degradará el chat en vez de apagarlo. Cuatro detalles que no son decorativos:

- **El tope de 8 segundos es de la respuesta entera, no de cada intento.** Un solo `AbortController` para todos, y una guarda que no empieza un intento nuevo si el presupuesto ya se gastó. El visitante espera lo mismo que antes.
- **Un 401/403 corta la cadena.** Ese fallo es de la llave, no del modelo: reintentar con otro daría el mismo error y solo gastaría tiempo.
- **Una respuesta vacía cuenta como fallo.** Los dos modelos nuevos razonan antes de contestar y esos tokens salen del mismo presupuesto que la respuesta; pueden devolver `content: ""` con el razonamiento aparte. Una cadena vacía pasaba el `typeof reply !== "string"` de antes y habría pintado **una burbuja en blanco**, que el visitante lee como que el sitio está roto. Por lo mismo, `max_tokens` sube de 400 a 1024: el largo lo marca el prompt ("2-4 oraciones"), no el tope.
- **Ahora hay `console.error` con el modelo y el código de estado.** Es la única señal que habría convertido estos diez días en una tarde.

Además, `GROQ_MODEL` (opcional, documentada en `.env.example`) permite cambiar de modelo desde Netlify sin tocar código, y se antepone a la lista sin eliminarla. Aplica la distinción del punto 20: un identificador de modelo **no es un secreto** y puede tener valor por defecto; `GROQ_API_KEY` no puede tenerlo nunca.

**Lo que no se pudo verificar, y hay que decirlo:** no se ha hablado con la API real de Groq ni una vez. En este entorno no hay `.env` con llave y el proxy de salida bloquea `console.groq.com`, así que los dos identificadores nuevos se confirmaron contra las páginas de la documentación de Groq, no contra una respuesta 200. **La primera petición real del chat en producción es la prueba que falta.** El respaldo cubre el caso de que el primero esté mal escrito; si lo estuvieran los dos, el chat sigue mudo.

**La prueba que daba verde estando el bug puesto:** el arnés (19 casos, con un doble de `fetch`) se corrió también contra la versión anterior, exigiendo que los casos nuevos **fallaran**. Doce fallaron como debían. Uno no: "un 401 no gasta un segundo intento" pasaba también sobre la versión rota, porque ahí no hay nunca una segunda llamada que gastar — el verde no venía del corte por autenticación, venía de que no existía cadena alguna. Se reescribió para comparar las dos ramas en la misma prueba (un 429 debe encadenar, un 401 no), y entonces sí falló donde tenía que fallar.

**Prevención:**
1. **Un modelo de IA alojado por un tercero no es una constante, es una dependencia con fecha de caducidad.** Va en una lista con respaldo, nunca en un solo valor del que dependa que el servicio funcione.
2. **Toda llamada a una API externa deja rastro en el log cuando falla**, con el detalle que distinga un fallo de red de un fallo de contrato (modelo retirado, campo cambiado, permiso caducado). Al visitante se le sigue enseñando el mensaje genérico; el log es para quien mantiene el sitio.
3. **Un aviso de retirada llega por correo a una persona, no al repositorio.** Este es el segundo servicio de terceros del proyecto (con Netlify/GoDaddy) donde el estado real vive fuera del código. Cuando llegue un correo así, la fecha se anota aquí el mismo día, aunque el cambio se haga después.
4. Y la de siempre, que esta vez pagó: **una prueba nueva no vale hasta verla fallar.** Correrla contra la versión defectuosa no es una formalidad — aquí destapó un caso que medía otra cosa distinta de la que decía medir.

**Archivos:** `netlify/functions/chat.ts` (`MODELOS`, `MAX_TOKENS`, `modelosAProbar()`, `pedirRespuesta()`), `.env.example` (`GROQ_MODEL`), `CLAUDE.md` (puntos 4 y 24).

---
