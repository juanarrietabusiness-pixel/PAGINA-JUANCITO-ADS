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
- `src/layouts/Layout.astro` — layout base (navbar, footer, WhatsApp flotante, scroll-reveal)
- `public/` — assets estáticos (imágenes, videos, logo, favicons)

**Despliegue:** Netlify, trabajando principalmente en local. Repositorio: `git@github.com:juanarrietabusiness-pixel/PAGINA-JUANCITO-ADS.git` (colaborador vía cuenta de GitHub de MIPC — el repo es de `juanarrietabusiness@gmail.com`).

**Comandos:**
- `npm run dev` — servidor local
- `npm run build` — build de producción (criterio mínimo de aceptación para cualquier cambio: build sin errores)
- `npm run preview` — sirve el build de producción localmente

## Reglas aprendidas (ver bitácora para el contexto completo)

- **Nunca usar `git add -A` / `git add .` / `git add --all`** en este proyecto — usar siempre rutas exactas. (Motivo: ver entrada del 2026-07-20 en `docs/errors-learned.md`.)
- Al centralizar cualquier dato de contacto/precio en `src/data/site.ts`, enumerar explícitamente todas sus representaciones necesarias (URL, texto crudo, texto de display) — no asumir que una forma cubre todos los usos.

## Fases pendientes del roadmap

1. ~~Fase 1 — Arquitectura Astro~~ ✅ completa (fusionada a `main`)
2. Fase 2 — SEO técnico (sitemap, robots.txt, schema.org, Open Graph) + integración GA4/Meta Pixel
3. Fase 3 — GitHub Actions (tests en cada push) + previews de Netlify
4. Esta bitácora y esta instrucción ya están activas desde ahora

## Idioma

Responde siempre en español (heredado de la configuración global del usuario).
