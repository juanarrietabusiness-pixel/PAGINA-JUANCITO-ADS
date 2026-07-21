# Análisis de opiniones externas (UX/UI) y plan de próximas mejoras

**Fecha:** 2026-07-21
**Contexto:** El usuario pegó 6 "opiniones de expertos" sobre el sitio (obtenidas externamente, no generadas en esta sesión). Este documento filtra cuáles son creíbles/aplicables al sitio real vs. cuáles no, y define un plan priorizado para la próxima sesión. No se ejecutó ningún cambio de código en esta sesión — es solo análisis + plan.

## Opiniones descartadas (no evalúan este sitio)

1. **Opinión sobre "shows en vivo", "podcasts", "asesoría"** — describe un negocio de entretenimiento, no una agencia de Meta Ads. No aplica.
2. **Opinión que describe "texto plano con Markdown básico", sin menú, "una sola página larga", recomienda usar Framer/Carrd/Dora** — describe un MVP sin diseño real. No coincide con el sitio actual (que tiene navbar con 5 rutas, tema visual consistente, página de precios, portafolio con imágenes/video). No aplica — probablemente evaluó una versión muy vieja/cacheada o directamente otro sitio.

## Afirmaciones puntuales refutadas con evidencia

- **"No hay formulario de contacto, solo WhatsApp"** (aparece en 2 opiniones) → **Falso.** `/contacto` (`src/pages/contacto.astro`) monta `ContactForm.astro`, un formulario funcional vía Netlify Forms, además del CTA de WhatsApp.
- **"Problemas de contraste en el texto secundario"** → **Falso**, según cálculo propio ya hecho en la auditoría de diseño del 2026-07-20: `--color-text-sec: #A0B4CC` sobre `--color-bg-deep: #050D1F` da un ratio de contraste de **9.1:1**, que pasa WCAG AAA incluso para texto pequeño.
- **"Botón flotante de WhatsApp siempre visible" como acierto** → Cierto en el momento en que se escribió esa opinión, pero **desactualizado**: el 2026-07-20 se reemplazó ese botón flotante por `ChatWidget` (ver plan `docs/superpowers/plans/2026-07-20-chatbot-groq.md`). El WhatsApp sigue disponible dentro del chat y en `/contacto`, pero ya no es el botón flotante de todo el sitio.

## Hallazgos confirmados (cruce de opiniones creíbles + verificación directa contra el código)

| # | Hallazgo | Severidad | Cómo se verificó |
|---|---|---|---|
| 1 | Sin Open Graph (`og:image`, `og:title`, `og:description`) en `Layout.astro` | Alta | `grep -ri "og:" src/` → 0 resultados |
| 2 | `ProblemaGrid` se renderiza idéntico en `/` (`index.astro`) y `/servicios` | Media-Alta | `grep -rl "ProblemaGrid" src/pages/` → ambos archivos |
| 3 | Prueba social no verificable ("Cliente verificado", nombres omitidos por confidencialidad) | Media-Alta | Coincide en 4/4 opiniones válidas; texto real confirmado en `ResultadosGrid.astro`/`Testimonios.astro` |
| 4 | "IA" usada como muletilla repetida sin explicar qué hace concretamente (generación de creativos? segmentación? optimización de presupuesto?) | Media | Coincide en 4/4 opiniones válidas; confirmado en `ProblemaGrid`, `Portafolio`, `Metodologia`, `PlanCard` |
| 5 | Navegación mezcla rutas reales (`/servicios`) con anclas de una sola página (`/#resultados`) | Media | Confirmado en `NavBar.astro:20-24` |
| 6 | Sin dominio propio — sigue en `juancitoads.netlify.app` | Media (depende de prioridad de negocio/costo) | Confirmado por contexto de sesión, sin cambios desde el 2026-07-20 |
| 7 | Sin foto de Juancito/equipo en ningún lado del sitio | Media | Confirmado — no hay imágenes personales/de equipo en `public/images/` usadas en el sitio |
| 8 | Hero saturado en mobile: 3 badges ("Agencia de Marketing Digital", "Powered by AI", nombre+logo) + 2 CTAs + logo repetido (ya está en el navbar) | Media | Confirmado en `Hero.astro` |
| 9 | Sin preview de portafolio en el home — Portafolio solo existe como página separada | Baja-Media | Confirmado |
| 10 | El scroll-reveal (`Layout.astro:44-64`, `IntersectionObserver` + fade de 0.6s) puede mostrar contenido en blanco/gris momentáneamente si el usuario hace scroll rápido | Media | Mecanismo técnico verificado por lectura de código — no se hizo prueba manual de scroll rápido esta sesión, pendiente de confirmar visualmente |

## Hallazgos mencionados pero de prioridad más baja / requieren decisión de negocio, no solo de código

- Sin opción de agendar llamada (Calendly/TidyCal) — el formulario y WhatsApp cubren el contacto, pero no hay agenda automática. Es una decisión de producto, no un bug.
- Sin video de presentación de Juancito — requiere producción de contenido, no es una tarea de código.
- SEO técnico (sitemap, robots.txt, schema.org) — **ya está en el roadmap como Fase 2, pausada explícitamente hasta resolver el tema de los videos pesados** (ver `CLAUDE.md`). El hallazgo de Open Graph (#1 arriba) es parte de ese mismo bloque de trabajo, pero es lo suficientemente rápido/aislado como para no esperar a que se resuelva todo lo de los videos.

## Plan propuesto para la próxima sesión (prioridad)

1. **Agregar Open Graph tags** (`og:title`, `og:description`, `og:image`, `twitter:card`) en `Layout.astro` — rápido, aislado, no depende de resolver los videos. Necesita una imagen de preview (1200x630px aprox.) — usar el logo o una pieza del portafolio.
2. **Eliminar la duplicación de `ProblemaGrid`** entre `/` y `/servicios` — decidir cuál de las dos páginas se queda con esa sección, o diferenciar el contenido entre ambas para que no sea la misma sección repetida palabra por palabra.
3. **Revisar y calibrar el scroll-reveal** — probar manualmente con scroll rápido en las 5 páginas; si se confirma el parpadeo/blanco, ajustar el `threshold`/`rootMargin` del `IntersectionObserver` o reducir la duración del fade.
4. **Simplificar el Hero en mobile** — evaluar si los 3 badges necesitan estar todos arriba del fold, o si alguno puede moverse/consolidarse; quitar la redundancia del logo (ya está en el navbar).
5. **Reforzar la explicación de "IA"** en el copy — reemplazar menciones genéricas de "Optimizado con IA"/"Creado con IA" por 1-2 líneas concretas de qué hace (ej. "IA para generar variantes de creativos", "IA para predecir el mejor horario de publicación", lo que sea cierto en la operación real de Juancito Ads — esto requiere que el usuario aclare qué hace la IA en la práctica antes de escribir el copy).
6. **Considerar reforzar la prueba social** — con el usuario: ¿hay alguna forma de mostrar al menos iniciales + rubro + una captura de resultados (ROAS, capturas del Ads Manager) sin comprometer la confidencialidad?
7. Dominio propio, foto de equipo/Juancito, preview de portafolio en home — pendientes de decisión de negocio/contenido, no bloquean código.

Este plan NO se ejecutó en esta sesión — queda para retomar la próxima vez que se abra el proyecto.
