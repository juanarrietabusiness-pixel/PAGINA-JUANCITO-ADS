# Fase 1 — Arquitectura Astro para Juancito Ads

**Fecha:** 2026-07-20
**Estado:** Aprobado por usuario, pendiente de plan de implementación

## Contexto

`DEMO.html` es un prototipo funcional de una sola página (2547 líneas, HTML+CSS+JS
inline, sin build tool) para Juancito Ads, agencia de marketing digital en Panamá
(Meta Ads + IA). El objetivo de esta fase es migrarlo a una base de ingeniería
profesional que pueda crecer sin romperse cuando distintos desarrolladores trabajen
en ramas distintas.

Este spec cubre **solo la Fase 1 (arquitectura y componentización)**. Las fases de
SEO técnico, analytics (GA4/Meta Pixel), CI/CD (GitHub Actions + previews Netlify)
y la bitácora de auto-mejora se diseñan por separado cuando les toque.

## Decisiones ya tomadas (no reabrir sin razón nueva)

| Decisión | Elegido | Alternativas descartadas |
|---|---|---|
| Repositorio | Repo propio en `git@github.com:juanarrietabusiness-pixel/PAGINA-JUANCITO-ADS.git`, ya inicializado en local. Contenido actual del repo (solo archivos subidos manualmente, sin config) se reemplaza con un commit normal — sin force-push ni reescritura de historial. | Repo aislado nuevo sin remoto / trabajar sin git |
| Stack | Astro 5 + Tailwind CSS | HTML/CSS/JS modular con Vite / Next.js+React |
| Estructura del sitio | Multi-página: `/`, `/servicios`, `/paquetes`, `/portafolio`, `/contacto` | One-pager único / híbrido |
| Idioma | Solo español | Bilingüe es/en |
| Conversión | Botón WhatsApp flotante (como hoy) **+** formulario de contacto nuevo vía Netlify Forms en `/contacto` | Solo WhatsApp |
| Assets | El usuario ya colocó `logo.png`, `imagenes/*` (3 fotos) y `videos/*` (4 videos, aunque el repo remoto solo tenía 1) directamente en la carpeta del proyecto. Se usan como contenido real del sitio aunque algunos se reemplazarán más adelante. | Placeholders |

## Objetivo

Convertir el HTML monolítico en un proyecto Astro componentizado, con datos
centralizados, iconografía SVG nativa (sin emojis) y estructura lista para que
SEO/analytics/CI se enchufen en fases posteriores sin refactor adicional.

## No-objetivos (explícitamente fuera de esta fase)

- Meta tags de SEO avanzados, sitemap.xml, robots.txt, schema.org
- Integración real de GA4 / Meta Pixel (se añaden cuando el usuario dé los IDs)
- GitHub Actions, tests automatizados, previews de Netlify
- `docs/errors-learned.md` y la instrucción de bitácora en `CLAUDE.md` local
- Repositorio del bot (el usuario lo traerá más adelante)

## Arquitectura

### Estructura de carpetas

```
JUANCITO ADS/
├── src/
│   ├── components/
│   │   ├── NavBar.astro
│   │   ├── MobileDrawer.astro
│   │   ├── Hero.astro
│   │   ├── ParticleCanvas.astro      (script de la red de partículas del hero)
│   │   ├── ProblemaGrid.astro
│   │   ├── Metodologia.astro
│   │   ├── ResultadosGrid.astro
│   │   ├── PaquetesGrid.astro        (recibe planes vía prop)
│   │   ├── Testimonios.astro
│   │   ├── Portafolio.astro
│   │   ├── Lightbox.astro
│   │   ├── VideoModal.astro
│   │   ├── CTAFinal.astro
│   │   ├── ContactForm.astro         (nuevo, Netlify Forms)
│   │   ├── Footer.astro
│   │   └── WhatsAppFloat.astro
│   ├── data/
│   │   └── site.ts                   (contacto, planes, testimonios, portafolio)
│   ├── layouts/
│   │   └── Layout.astro              (navbar + footer + WhatsApp flotante + <head> base)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── servicios.astro
│   │   ├── paquetes.astro
│   │   ├── portafolio.astro
│   │   └── contacto.astro
│   └── styles/
│       └── global.css                (design tokens migrados desde :root del DEMO)
├── public/
│   ├── logo.png
│   ├── favicon.ico / apple-touch-icon.png / etc.
│   ├── images/  (ex `imagenes/`, renombrado sin ñ para evitar problemas de URL)
│   └── videos/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

### Mapeo de componentes → secciones del DEMO.html original

| Componente | Líneas de origen en DEMO.html |
|---|---|
| NavBar + MobileDrawer | 1520–1555 |
| Hero + ParticleCanvas | 1558–1609, 2274–2418 |
| ProblemaGrid | 1612–1644 |
| Metodologia | 1647–1689 |
| ResultadosGrid | 1692–1720 |
| PaquetesGrid | 1723–1954 |
| Testimonios | 1957–2002 |
| Portafolio + Lightbox + VideoModal | 2005–2113, 2420–2524 |
| CTAFinal | 2116–2147 |
| Footer | 2150–2171 |
| WhatsAppFloat | 2174–2180 |

### Distribución de contenido por página

- **`/` (Home):** Hero completo + versión resumida de Problema, Metodología,
  Resultados (3 cards) y un CTA hacia `/paquetes`. No repite el grid completo de
  precios ni el portafolio completo — son teasers con link "Ver más".
- **`/servicios`:** Problema + Metodología completos.
- **`/paquetes`:** Los 3 grupos de planes completos (Meta Ads solo, Meta Ads +
  Redes, Páginas Web), tal como están hoy en el DEMO.
- **`/portafolio`:** Grid de imágenes + grid de videos + lightbox/modal.
- **`/contacto`:** ContactForm + CTAFinal + datos de contacto (tel/email/IG).

### Datos centralizados (`src/data/site.ts`)

El número de WhatsApp y sus mensajes prellenados aparecen repetidos 13 veces como
texto plano en el DEMO actual. Se centralizan en un único archivo tipado:

```ts
export const contacto = {
  whatsapp: "50765969428",
  whatsappMsg: (contexto: string) => `Hola Juancito Ads, ${contexto}`,
  email: "juanarrietabusiness@gmail.com",
  instagram: "@juancitoads",
};

export const planes = { metaAds: [...], redes: [...], web: [...] };
export const testimonios = [...];
export const portafolioImagenes = [...];
export const portafolioVideos = [...];
```

Los componentes importan de aquí — nunca hardcodean el número ni los textos.

### Iconografía nativa

Los emojis usados como iconos (💸⏰📊🚀👓📦✦ etc.) se reemplazan por SVGs reales
vía el paquete `lucide-astro`, renderizados como componentes Astro. Esto evita
inconsistencias visuales entre sistemas operativos
(Windows/Mac/Android renderizan emojis distinto) y da control total de color/tamaño
vía CSS, consistente con el resto del design system.

### Favicon

Set completo generado a partir de `logo.png`: `favicon.ico`, `favicon-32x32.png`,
`apple-touch-icon.png`, `site.webmanifest`.

### Manejo de errores / casos borde

- Si una imagen o video de `public/` falta en build time, Astro falla el build
  (mejor que en el DEMO actual, donde una imagen rota se ve silenciosamente rota
  en producción).
- El fallback de logo→texto que existe hoy en JS (`initLogoFallback`) se elimina:
  ya no tiene sentido si el build falla ante un asset faltante.

## Testing (dentro de esta fase)

- Build de Astro (`astro build`) sin errores ni warnings de accesibilidad.
- Revisión visual manual en mobile/tablet/desktop (breakpoints ya definidos en el
  CSS original: 480px, 768px, 900px, 1100px).
- Verificación de que todos los enlaces de WhatsApp usan el dato centralizado.

Tests automatizados (Playwright/CI) quedan para la Fase 3, no aquí.

## Riesgos identificados

- El repo remoto solo tenía `video-01.mp4`; localmente hay 4 videos — se
  usarán los 4 que están en la carpeta local del proyecto.
- El archivo `imagenes/imagen-oañales-01.png` tiene una "ñ" en el nombre — se
  renombra sin caracteres especiales al mover a `public/images/` para evitar
  problemas de encoding de URL entre sistemas.
