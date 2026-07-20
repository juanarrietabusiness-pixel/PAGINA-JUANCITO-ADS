# Fase 1 — Arquitectura Astro para Juancito Ads — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar `DEMO.html` (single-file, 2547 líneas) a un proyecto Astro 5 + Tailwind CSS v4 componentizado, multi-página, con datos centralizados e iconografía SVG nativa.

**Architecture:** Astro con salida 100% estática (sin SSR — no hay backend). Tailwind v4 vía `@tailwindcss/vite` con configuración CSS-first (`@theme` en `global.css`, sin `tailwind.config.js`). Componentes `.astro` puros (sin framework de UI adicional — no hace falta React/Vue para esta landing). Datos de contenido (planes, testimonios, contacto) centralizados en `src/data/site.ts`, importados por los componentes que los necesiten.

**Tech Stack:** Astro ^5.0, Tailwind CSS ^4.0, `@tailwindcss/vite` ^4.0, `lucide-astro` (iconos SVG), Node.js LTS, npm.

## Global Constraints

- Todo el contenido textual, precios, y estructura de secciones se porta **tal cual** de `DEMO.html` (líneas referenciadas en cada tarea) — no se inventa copy nuevo.
- Sin frameworks de UI adicionales (no React/Vue/Svelte) — Astro puro basta para esta landing estática.
- Sin `tailwind.config.js` — Tailwind v4 usa configuración CSS-first vía `@theme`.
- El número de WhatsApp y sus mensajes SIEMPRE se generan desde `src/data/site.ts` (`waLink()`), nunca hardcodeados en un componente.
- Idioma único: español (`lang="es"` en el `<html>`).
- No se toca el remoto de git (`origin`) en ninguna tarea de este plan — todos los commits son locales. El push se hace en un paso manual posterior, fuera de este plan, con confirmación explícita del usuario.
- Cada tarea termina con `npm run build` sin errores como criterio mínimo de aceptación.

---

### Task 1: Scaffold del proyecto Astro + Tailwind v4 + design tokens

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/styles/global.css`
- Create: `src/env.d.ts`
- Create: `.gitignore`
- Modify: `.gitignore` (repo raíz ya tiene `.git`, pero falta ignorar `node_modules`, `dist`, `.astro`)

**Interfaces:**
- Produces: clases Tailwind disponibles en todo el proyecto: `bg-bg-deep`, `bg-bg-alt`, `text-blue-neon`, `bg-orange`, `text-orange-dark`, `text-text-sec`, `border-blue-neon`, `shadow-glow-blue`, `shadow-glow-orange`, `font-sans` (Inter), `h-nav` (72px), `rounded-lg` (20px, sobreescribe default de Tailwind).

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "juancito-ads",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "lucide-astro": "^0.460.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

Run: `npm install`
Expected: instala sin errores, se genera `package-lock.json`.

- [ ] **Step 3: Crear `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Crear `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Crear `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 6: Crear `src/styles/global.css` con los design tokens migrados del DEMO original (líneas 17–34 de `DEMO.html`)**

```css
@import "tailwindcss";

@theme {
  --color-bg-deep: #050D1F;
  --color-bg-alt: #0A1628;
  --color-blue-dark: #1B3A6B;
  --color-blue-neon: #1E90FF;
  --color-orange: #F5A623;
  --color-orange-dark: #D4901A;
  --color-text-sec: #A0B4CC;

  --font-sans: "Inter", system-ui, sans-serif;

  --shadow-glow-blue: 0 0 20px rgba(30, 144, 255, 0.4);
  --shadow-glow-orange: 0 0 20px rgba(245, 166, 35, 0.5);

  --radius-lg: 20px;

  --spacing-nav: 72px;

  --ease-brand: cubic-bezier(0.16, 1, 0.3, 1);
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-bg-deep);
  overflow-x: clip;
}

/* ── scroll reveal (usado por todas las secciones) ─────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s var(--ease-brand), transform 0.6s var(--ease-brand);
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
.reveal-delay-1 { transition-delay: 0.08s; }
.reveal-delay-2 { transition-delay: 0.16s; }
.reveal-delay-3 { transition-delay: 0.24s; }
.reveal-delay-4 { transition-delay: 0.32s; }
.reveal-delay-5 { transition-delay: 0.40s; }

/* ── keyframes decorativos (hero orbs, pulse dot, wa float, lightbox) ── */
@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(40px, 30px); }
}
@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-30px, -20px); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.65); }
}
@keyframes wa-bounce {
  0%, 100% { transform: scale(1); box-shadow: 0 6px 24px rgba(37, 211, 102, 0.5); }
  50% { transform: scale(1.07); box-shadow: 0 8px 28px rgba(37, 211, 102, 0.6); }
}
@keyframes lb-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 7: Crear `.gitignore`**

```
node_modules/
dist/
.astro/
.env
.DS_Store
```

- [ ] **Step 8: Verificar que el proyecto arranca**

Run: `npm run dev`
Expected: servidor Vite arranca en `http://localhost:4321` sin errores (la página mostrará 404 porque aún no hay rutas — eso es esperado en este punto). Detener con Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts src/styles/global.css .gitignore
git commit -m "chore: scaffold Astro 5 + Tailwind v4 + design tokens"
```

---

### Task 2: Datos centralizados (`src/data/site.ts`)

**Files:**
- Create: `src/data/site.ts`

**Interfaces:**
- Consumes: nada (es la fuente de verdad de datos, no depende de otras tareas)
- Produces: `contacto`, `waLink(mensaje: string): string`, `problemas: ProblemaItem[]`, `resultados: Resultado[]`, `planesMetaAds: Plan[]`, `planesRedes: Plan[]`, `planWeb`, `testimonios: Testimonio[]`, `portafolioImagenes: PortafolioImagen[]`, `portafolioVideos: string[]` — usados por las Tasks 3, 5, 6, 7, 8, 9.

- [ ] **Step 1: Crear `src/data/site.ts` completo**

```ts
export const contacto = {
  whatsappNumber: "50765969428",
  email: "juanarrietabusiness@gmail.com",
  instagram: "@juancitoads",
  instagramUrl: "https://instagram.com/juancitoads",
};

export function waLink(mensaje: string): string {
  return `https://wa.me/${contacto.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
}

export interface ProblemaItem {
  icono: "circle-dollar-sign" | "clock" | "bar-chart-3";
  color: "red" | "amber" | "blue";
  problema: string;
  solucion: string;
}

export const problemas: ProblemaItem[] = [
  {
    icono: "circle-dollar-sign",
    color: "red",
    problema: '"Inviertes en publicidad sin ver resultados"',
    solucion: "Campañas estratégicas con objetivo claro y ROI medible con IA",
  },
  {
    icono: "clock",
    color: "amber",
    problema: '"No tienes tiempo para manejar tus redes"',
    solucion: "Nosotros lo hacemos por ti. Tú te enfocas en tu negocio",
  },
  {
    icono: "bar-chart-3",
    color: "blue",
    problema: '"No sabes si tu publicidad está funcionando"',
    solucion: "Reportes mensuales con resultados reales y análisis de IA",
  },
];

export interface Resultado {
  icono: "store" | "glasses" | "package";
  badge: string;
  titulo: string;
  descripcion: string;
}

export const resultados: Resultado[] = [
  {
    icono: "store",
    badge: "5X en ventas",
    titulo: "Retail y Servicio en Panamá",
    descripcion:
      "Aumento de facturación del 50% al 400% en el primer año con campañas dirigidas e IA aplicada a cada anuncio.",
  },
  {
    icono: "glasses",
    badge: "Resultados inmediatos",
    titulo: "Ópticas en Panamá",
    descripcion:
      "Agenda completamente llena desde el primer mes de publicidad. Mensajes sin parar. Resultados en menos de 2 semanas.",
  },
  {
    icono: "package",
    badge: "Problema resuelto",
    titulo: "Empresa con inventario estancado",
    descripcion:
      "Aumentó ventas y limpió inventario en tiempo récord con campañas de IA dirigidas al cliente correcto.",
  },
];

export interface Plan {
  nombre: string;
  descripcion: string;
  desde?: boolean;
  precio: string;
  precioHasta?: string;
  nota: string;
  features: string[];
  destacado?: boolean;
  whatsappMensaje: string;
}

export const planesMetaAds: Plan[] = [
  {
    nombre: "Emprendedor",
    descripcion: "Para el emprendedor que da su primer paso en Meta",
    precio: "$150",
    nota: "Presupuesto de ads va aparte",
    features: [
      "Presupuesto ads recomendado: $100–$250",
      "Creación de contenido publicitario con IA",
      "Configuración completa de la campaña",
      "Seguimiento semanal y optimización",
      "Reporte básico mensual",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Emprendedor. Quisiera más información.",
  },
  {
    nombre: "Negocio",
    descripcion: "Para negocios que ya invierten y quieren mejores resultados",
    precio: "$250",
    nota: "Presupuesto de ads va aparte",
    destacado: true,
    features: [
      "Presupuesto ads recomendado: $300–$600",
      "Creación de contenido publicitario con IA",
      "Campaña optimizada con segmentación avanzada",
      "Seguimiento cada 2 días y optimización continua",
      "Reporte mensual detallado",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Negocio. Quisiera más información.",
  },
  {
    nombre: "Empresa",
    descripcion: "Para empresas que invierten en serio y quieren escalar",
    precio: "$400",
    nota: "Presupuesto de ads va aparte",
    features: [
      "Presupuesto ads recomendado: $700–$2,000",
      "Creación de contenido publicitario con IA",
      "Múltiples campañas activas + retargeting",
      "Seguimiento diario y optimización constante",
      "Reporte mensual detallado + reunión de resultados",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Empresa. Quisiera más información.",
  },
  {
    nombre: "Corporativo",
    descripcion: "Para empresas con inversión publicitaria alta y múltiples objetivos",
    precio: "$600",
    nota: "Presupuesto de ads va aparte",
    features: [
      "Presupuesto ads recomendado: $2,000–$5,000+",
      "Creación de contenido publicitario con IA",
      "Estrategia completa + múltiples campañas + retargeting",
      "Seguimiento diario y optimización avanzada",
      "Reporte mensual premium + reunión estratégica mensual",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Corporativo. Quisiera más información.",
  },
];

export const planesRedes: Plan[] = [
  {
    nombre: "Arranque",
    descripcion: "Para negocios que quieren empezar a construir su presencia digital",
    desde: true,
    precio: "$450",
    precioHasta: "hasta $550 / mes",
    nota: "Presupuesto de ads va aparte",
    features: [
      "1 red social (Instagram)",
      "1 post diario creado con IA",
      "Campañas publicitarias básicas en Meta",
      "1 visita presencial al mes",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Arranque. Quisiera más información.",
  },
  {
    nombre: "Crecimiento",
    descripcion: "Para negocios listos para crecer con contenido y publicidad",
    desde: true,
    precio: "$600",
    precioHasta: "hasta $800 / mes",
    nota: "Presupuesto de ads va aparte",
    destacado: true,
    features: [
      "2 redes sociales (Instagram y Facebook)",
      "2 posts diarios — IA + contenido real",
      "Campañas estratégicas activas en Meta",
      "Conexión con creadores de contenido e influencers",
      "1 visita presencial al mes para producción",
      "Reporte mensual de resultados",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Crecimiento. Quisiera más información.",
  },
  {
    nombre: "Escala",
    descripcion: "Para negocios establecidos que quieren dominar su mercado",
    desde: true,
    precio: "$900",
    precioHasta: "hasta $1,200 / mes",
    nota: "Presupuesto de ads va aparte",
    features: [
      "3 redes sociales (Instagram, Facebook y TikTok)",
      "4 posts diarios — IA + contenido real",
      "Reels promocionales con presentador incluido",
      "Acceso a red de creadores e influencers",
      "Locuciones profesionales para anuncios",
      "Múltiples campañas avanzadas + retargeting",
      "Estrategia mensual personalizada + reporte",
      "2 visitas presenciales al mes",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Escala. Quisiera más información.",
  },
];

export interface WebSubplan {
  nombre: string;
  precio: string;
  features: string[];
}

export const planWeb = {
  descripcion:
    "Tu negocio necesita una presencia profesional en internet. Creamos tu página web con diseño moderno, optimizada para celular y lista para recibir clientes — potenciada con Inteligencia Artificial.",
  desde: "$149",
  hasta: "hasta $499 pago único",
  whatsappMensaje: "Hola Juancito Ads, me interesa una Página Web para mi negocio. Quisiera más información.",
  subplanes: [
    {
      nombre: "Básica",
      precio: "$149",
      features: ["1 página", "Hosting gratuito", "Botón WhatsApp", "Entrega en 48hrs"],
    },
    {
      nombre: "Profesional",
      precio: "$299",
      features: ["Hasta 3 secciones", "Dominio + Hosting", "Formulario contacto", "Google Maps"],
    },
    {
      nombre: "Premium",
      precio: "$499",
      features: ["Página completa", "Dominio + Hosting", "SEO + Testimonios", "3 meses mantenimiento"],
    },
  ] as WebSubplan[],
};

export interface Testimonio {
  texto: string;
  autor: string;
  contexto: string;
  icono: "glasses" | "calendar-check" | "package";
}

export const testimonios: Testimonio[] = [
  {
    texto:
      "Desde que empezamos a trabajar con Juancito Ads, los mensajes no paran. Nuestra agenda de citas está completamente llena y seguimos recibiendo consultas todos los días.",
    autor: "Cliente verificado",
    contexto: "Óptica — Ciudad de Panamá",
    icono: "glasses",
  },
  {
    texto:
      "En las primeras dos semanas de publicidad ya teníamos la agenda llena. No esperábamos resultados tan rápido. Fue una sorpresa muy grata.",
    autor: "Cliente verificado",
    contexto: "Óptica — Panamá",
    icono: "calendar-check",
  },
  {
    texto:
      "Teníamos mercancía estancada que no lograba moverse. Después de arrancar las campañas, las ventas aumentaron y pudimos limpiar el inventario más rápido de lo esperado.",
    autor: "Cliente verificado",
    contexto: "Pañalera — Panamá",
    icono: "package",
  },
];

export interface PortafolioImagen {
  src: string;
  alt: string;
}

export const portafolioImagenes: PortafolioImagen[] = [
  { src: "/images/imagen-feria-01.jpeg", alt: "Portafolio Juancito Ads — contenido creado con IA para feria comercial" },
  { src: "/images/imagen-panales-01.png", alt: "Portafolio Juancito Ads — contenido creado con IA para pañalera" },
  { src: "/images/imagen-tienda-01.jpeg", alt: "Portafolio Juancito Ads — contenido creado con IA para tienda" },
];

export const portafolioVideos: string[] = [
  "/videos/video-01.mp4",
  "/videos/video-02.mp4",
  "/videos/video-03.mp4",
  "/videos/video-04.mp4",
];
```

- [ ] **Step 2: Verificar tipos**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/data/site.ts
git commit -m "feat: centralizar datos de contacto, planes, testimonios y portafolio"
```

---

### Task 3: Componentes de chrome compartido (NavBar, MobileDrawer, Footer, WhatsAppFloat)

**Files:**
- Create: `src/components/NavBar.astro`
- Create: `src/components/MobileDrawer.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/WhatsAppFloat.astro`

**Interfaces:**
- Consumes: `contacto`, `waLink` de `src/data/site.ts` (Task 2)
- Produces: `<NavBar />`, `<Footer />`, `<WhatsAppFloat />` — usados por `Layout.astro` (Task 4)

- [ ] **Step 1: Crear `src/components/MobileDrawer.astro`** (origen: `DEMO.html:1546–1555`)

```astro
---
import { waLink } from "../data/site";
---

<div
  id="navDrawer"
  class="hidden fixed inset-x-0 top-nav bg-bg-deep border-b border-blue-neon/25 px-6 pt-6 pb-8 z-[999] flex-col"
  role="dialog"
  aria-label="Menú móvil"
>
  <a href="/servicios" class="py-3.5 text-base font-semibold text-text-sec border-b border-white/[0.07]">Servicios</a>
  <a href="/#resultados" class="py-3.5 text-base font-semibold text-text-sec border-b border-white/[0.07]">Resultados</a>
  <a href="/paquetes" class="py-3.5 text-base font-semibold text-text-sec border-b border-white/[0.07]">Paquetes</a>
  <a href="/portafolio" class="py-3.5 text-base font-semibold text-text-sec border-b border-white/[0.07]">Portafolio</a>
  <a href="/contacto" class="py-3.5 text-base font-semibold text-text-sec border-b border-white/[0.07]">Contacto</a>
  <a
    href={waLink("Hola Juancito Ads, quiero hacer crecer mi negocio. ¿Podemos hablar?")}
    class="mt-5 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-orange text-white font-bold text-sm"
    target="_blank" rel="noopener"
  >
    Quiero crecer
  </a>
</div>
```

- [ ] **Step 2: Crear `src/components/NavBar.astro`** (origen: `DEMO.html:1520–1544`, `2211–2240`)

```astro
---
import { Menu, X } from "lucide-astro";
import MobileDrawer from "./MobileDrawer.astro";
import { waLink } from "../data/site";
---

<nav
  id="navbar"
  class="fixed inset-x-0 top-0 z-[1000] h-nav flex items-center bg-bg-deep/60 backdrop-blur-md border-b border-transparent transition-colors duration-300"
  role="navigation"
  aria-label="Navegación principal"
>
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="flex items-center justify-between w-full">
      <a href="/" class="flex items-center gap-2 shrink-0" aria-label="Juancito Ads inicio">
        <img src="/logo.png" alt="Juancito Ads" class="h-11 w-auto block" height="44" />
      </a>

      <ul class="hidden md:flex items-center gap-8" role="list">
        <li><a href="/servicios" class="text-sm font-medium text-text-sec hover:text-white transition-colors">Servicios</a></li>
        <li><a href="/#resultados" class="text-sm font-medium text-text-sec hover:text-white transition-colors">Resultados</a></li>
        <li><a href="/paquetes" class="text-sm font-medium text-text-sec hover:text-white transition-colors">Paquetes</a></li>
        <li><a href="/portafolio" class="text-sm font-medium text-text-sec hover:text-white transition-colors">Portafolio</a></li>
        <li><a href="/contacto" class="text-sm font-medium text-text-sec hover:text-white transition-colors">Contacto</a></li>
      </ul>

      <div class="flex items-center gap-3">
        <a
          href={waLink("Hola Juancito Ads, quiero hacer crecer mi negocio. ¿Podemos hablar?")}
          class="hidden md:inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-orange text-white font-bold text-sm shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 transition-all"
          target="_blank" rel="noopener"
        >
          Quiero crecer
        </a>
        <button id="navToggle" class="md:hidden p-1 bg-transparent border-0" aria-label="Abrir menú" aria-expanded="false">
          <Menu id="navIconOpen" class="w-6 h-6 text-white" />
          <X id="navIconClose" class="hidden w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  </div>
</nav>

<MobileDrawer />

<script>
  const navbar = document.getElementById("navbar");
  function onScroll() {
    if (!navbar) return;
    const scrolled = window.scrollY > 20;
    navbar.classList.toggle("bg-bg-deep/95", scrolled);
    navbar.classList.toggle("border-blue-neon/25", scrolled);
    navbar.classList.toggle("shadow-[0_2px_30px_rgba(30,144,255,0.1)]", scrolled);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  const iconOpen = document.getElementById("navIconOpen");
  const iconClose = document.getElementById("navIconClose");
  let open = false;

  function setOpen(value: boolean) {
    open = value;
    drawer?.classList.toggle("flex", open);
    drawer?.classList.toggle("hidden", !open);
    toggle?.setAttribute("aria-expanded", String(open));
    iconOpen?.classList.toggle("hidden", open);
    iconClose?.classList.toggle("hidden", !open);
  }

  toggle?.addEventListener("click", () => setOpen(!open));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", (e) => {
    if (open && drawer && toggle && !drawer.contains(e.target as Node) && !toggle.contains(e.target as Node)) {
      setOpen(false);
    }
  });
</script>
```

- [ ] **Step 3: Crear `src/components/WhatsAppFloat.astro`** (origen: `DEMO.html:2173–2180`)

```astro
---
import { waLink } from "../data/site";
---

<a
  href={waLink("Hola Juancito Ads, quiero más información sobre sus servicios.")}
  class="fixed bottom-6 right-6 z-[900] w-[58px] h-[58px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_10px_32px_rgba(37,211,102,0.6)] transition-transform"
  style="animation: wa-bounce 3s ease-in-out infinite 2s;"
  target="_blank" rel="noopener" aria-label="Contactar por WhatsApp"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" fill="none" aria-hidden="true">
    <path fill="#fff" d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7C17.2 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4z"/>
    <path fill="#25D366" d="M24 6C14.1 6 6 14.1 6 24c0 3.4.9 6.6 2.6 9.4L6.2 41.8l8.6-2.3C17.5 41.1 20.7 42 24 42c9.9 0 18-8.1 18-18S33.9 6 24 6z"/>
    <path fill="#fff" d="M33.5 28.4c-.5-.2-2.9-1.4-3.3-1.6-.4-.2-.7-.2-1 .2-.3.4-1.2 1.6-1.5 1.9-.3.3-.5.4-1 .1-.5-.2-2-.7-3.8-2.3-1.4-1.2-2.3-2.7-2.6-3.2-.3-.5 0-.7.2-1 .2-.2.5-.6.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1-2.5-1.4-3.4-.4-.9-.7-.8-1-.8h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.8s1.6 4.4 1.9 4.7c.3.3 3.2 4.8 7.7 6.7 1.1.5 1.9.7 2.6.9 1.1.3 2.1.3 2.9.2.9-.1 2.9-1.2 3.3-2.3.4-1.1.4-2.1.3-2.3-.1-.2-.4-.3-.9-.5z"/>
  </svg>
</a>
```

- [ ] **Step 4: Crear `src/components/Footer.astro`** (origen: `DEMO.html:2149–2171`)

```astro
---
import { MessageCircle, Instagram, Mail } from "lucide-astro";
import { contacto } from "../data/site";
---

<footer id="footer" class="bg-[#020913] py-10 border-t border-blue-neon/15" role="contentinfo">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="flex flex-wrap items-center justify-between gap-6">
      <div class="text-lg font-black text-white">
        Juancito<span class="text-orange">Ads</span>
        <small class="block text-[0.68rem] font-normal text-blue-neon/70 tracking-wide mt-0.5">
          Campañas potenciadas con Inteligencia Artificial
        </small>
      </div>
      <nav class="flex flex-wrap gap-x-6 gap-y-1" aria-label="Navegación footer">
        <a href="/servicios" class="text-sm text-text-sec hover:text-white transition-colors">Servicios</a>
        <a href="/#resultados" class="text-sm text-text-sec hover:text-white transition-colors">Resultados</a>
        <a href="/paquetes" class="text-sm text-text-sec hover:text-white transition-colors">Paquetes</a>
        <a href="/contacto" class="text-sm text-text-sec hover:text-white transition-colors">Contacto</a>
      </nav>
      <div class="flex gap-3 items-center" aria-label="Redes sociales">
        <a href={`https://wa.me/${contacto.whatsappNumber}`} target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp"
           class="w-9 h-9 rounded-lg bg-blue-neon/[0.08] border border-blue-neon/20 flex items-center justify-center text-text-sec hover:bg-blue-neon/15 hover:text-white hover:shadow-glow-blue transition-all"><MessageCircle class="w-4 h-4" /></a>
        <a href={contacto.instagramUrl} target="_blank" rel="noopener" aria-label="Instagram" title="Instagram"
           class="w-9 h-9 rounded-lg bg-blue-neon/[0.08] border border-blue-neon/20 flex items-center justify-center text-text-sec hover:bg-blue-neon/15 hover:text-white hover:shadow-glow-blue transition-all"><Instagram class="w-4 h-4" /></a>
        <a href={`mailto:${contacto.email}`} aria-label="Email" title="Email"
           class="w-9 h-9 rounded-lg bg-blue-neon/[0.08] border border-blue-neon/20 flex items-center justify-center text-text-sec hover:bg-blue-neon/15 hover:text-white hover:shadow-glow-blue transition-all"><Mail class="w-4 h-4" /></a>
      </div>
    </div>
    <p class="w-full text-center text-xs text-text-sec/35 pt-6 border-t border-white/5 mt-4">
      © 2026 Juancito Ads. Todos los derechos reservados. · Panamá
    </p>
  </div>
</footer>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/NavBar.astro src/components/MobileDrawer.astro src/components/Footer.astro src/components/WhatsAppFloat.astro
git commit -m "feat: componentes de chrome compartido (NavBar, MobileDrawer, Footer, WhatsAppFloat)"
```

---

### Task 4: `Layout.astro`

**Files:**
- Create: `src/layouts/Layout.astro`

**Interfaces:**
- Consumes: `NavBar`, `Footer`, `WhatsAppFloat` (Task 3)
- Props: `title: string`, `description: string`
- Produces: `<Layout title="..." description="...">` — usado por todas las páginas (Task 10)

- [ ] **Step 1: Crear `src/layouts/Layout.astro`**

```astro
---
import "../styles/global.css";
import NavBar from "../components/NavBar.astro";
import Footer from "../components/Footer.astro";
import WhatsAppFloat from "../components/WhatsAppFloat.astro";

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="font-sans text-white leading-relaxed">
    <NavBar />
    <main class="pt-nav">
      <slot />
    </main>
    <Footer />
    <WhatsAppFloat />

    <script>
      function initReveals() {
        const els = document.querySelectorAll(".reveal");
        if (!els.length) return;
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("is-visible");
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.05, rootMargin: "0px 0px -4% 0px" }
        );
        els.forEach((el) => io.observe(el));
        setTimeout(() => {
          document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
          });
        }, 5000);
      }

      function initSmoothScroll() {
        document.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          const a = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
          if (!a) return;
          const id = a.getAttribute("href");
          if (!id || id === "#") return;
          const el = document.querySelector(id);
          if (!el) return;
          e.preventDefault();
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
        });
      }

      initReveals();
      initSmoothScroll();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Verificar tipos**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: Layout.astro base con navbar, footer, whatsapp flotante y scroll reveal"
```

---

### Task 5: Hero + ParticleCanvas

**Files:**
- Create: `src/components/ParticleCanvas.astro`
- Create: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `waLink` de `src/data/site.ts`
- Produces: `<Hero />` — usado en `index.astro` (Task 10)

- [ ] **Step 1: Crear `src/components/ParticleCanvas.astro`** (origen: `DEMO.html:2273–2418`, lógica portada casi literal)

```astro
<canvas id="hero-canvas" class="absolute inset-0 z-0 opacity-55" aria-hidden="true"></canvas>

<script>
  function initParticles() {
    const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; star: boolean }[] = [];
    const mouse = { x: -9999, y: -9999 };

    const PARTICLE_COUNT = window.innerWidth < 600 ? 40 : 70;
    const CONNECTION_DIST = 130;
    const MOUSE_DIST = 180;

    function resize() {
      const hero = document.getElementById("hero");
      W = canvas!.width = hero ? hero.offsetWidth : window.innerWidth;
      H = canvas!.height = hero ? hero.offsetHeight : window.innerHeight;
    }

    function mkParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1,
        star: Math.random() < 0.15,
      };
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(mkParticle());
    }

    function drawStar(x: number, y: number, r: number, color: string) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const xi = Math.cos(ang) * r;
        const yi = Math.sin(ang) * r;
        if (i === 0) ctx!.moveTo(xi, yi);
        else ctx!.lineTo(xi, yi);
      }
      ctx!.closePath();
      ctx!.fillStyle = color;
      ctx!.fill();
      ctx!.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p = particles[i], q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * 0.45;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(30,144,255,${alpha})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_DIST) {
          const alpha = (1 - d / MOUSE_DIST) * 0.6;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.strokeStyle = `rgba(245,166,35,${alpha})`;
          ctx!.lineWidth = 0.9;
          ctx!.stroke();
        }
      }

      for (const p of particles) {
        if (p.star) {
          drawStar(p.x, p.y, p.r + 2, "rgba(245,166,35,0.85)");
        } else {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fillStyle = "rgba(30,144,255,0.75)";
          ctx!.fill();
        }
      }
    }

    function update() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
    }

    let raf: number;
    const heroEl = document.getElementById("hero");

    function loop() {
      update();
      draw();
      raf = requestAnimationFrame(loop);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) raf = requestAnimationFrame(loop);
        else if (raf) cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );
    if (heroEl) obs.observe(heroEl);

    window.addEventListener(
      "resize",
      () => {
        resize();
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      },
      { passive: true }
    );

    if (heroEl) {
      heroEl.addEventListener(
        "mousemove",
        (e) => {
          const rect = heroEl.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        },
        { passive: true }
      );
      heroEl.addEventListener(
        "mouseleave",
        () => {
          mouse.x = -9999;
          mouse.y = -9999;
        },
        { passive: true }
      );
    }

    init();
  }

  initParticles();
</script>
```

- [ ] **Step 2: Crear `src/components/Hero.astro`** (origen: `DEMO.html:1557–1609`)

```astro
---
import { Zap } from "lucide-astro";
import ParticleCanvas from "./ParticleCanvas.astro";
import { waLink } from "../data/site";
---

<section id="hero" class="relative min-h-svh flex items-center overflow-hidden bg-bg-deep -mt-nav pt-nav" aria-label="Bienvenida">
  <ParticleCanvas />

  <div
    class="absolute rounded-full pointer-events-none blur-[90px] w-[520px] h-[520px] bg-blue-neon/[0.18] -top-[120px] -left-20"
    style="animation: orb-float-1 12s ease-in-out infinite;"
    aria-hidden="true"
  ></div>
  <div
    class="absolute rounded-full pointer-events-none blur-[90px] w-[380px] h-[380px] bg-orange/[0.08] -bottom-[60px] right-[5%]"
    style="animation: orb-float-2 15s ease-in-out infinite 2s;"
    aria-hidden="true"
  ></div>

  <div class="relative z-[2] w-full max-w-[1160px] mx-auto px-5 sm:px-10 py-16 sm:py-24">
    <div class="reveal inline-flex items-center gap-2 bg-blue-neon/10 border border-blue-neon/40 text-blue-neon text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 shadow-[0_0_16px_rgba(30,144,255,0.15)]">
      <span class="w-[7px] h-[7px] rounded-full bg-blue-neon shrink-0" style="animation: pulse-dot 2s infinite;"></span>
      Agencia de Marketing Digital · Panamá
    </div>

    <h1 class="reveal reveal-delay-1 text-4xl sm:text-5xl md:text-6xl font-black leading-tight max-w-[18ch] text-balance mb-2">
      Tu negocio puede vender más.
    </h1>
    <p class="reveal reveal-delay-2 text-2xl sm:text-3xl font-extrabold text-blue-neon leading-snug mb-4" style="text-shadow: 0 0 24px rgba(30,144,255,0.5);">
      Lo hacemos con Meta Ads e IA.
    </p>

    <div class="reveal reveal-delay-3 inline-flex items-center gap-2 bg-blue-neon/10 border border-blue-neon/[0.35] text-text-sec text-xs font-semibold px-4 py-2 rounded-full mb-7">
      <Zap class="w-3.5 h-3.5 text-blue-neon" /> <span class="text-blue-neon font-bold">Powered by Artificial Intelligence</span>
    </div>

    <div class="reveal reveal-delay-3 flex items-center gap-3 mb-8">
      <img src="/logo.png" alt="Juancito Ads" class="h-[38px] w-auto" />
      <span class="text-sm text-text-sec"><strong class="text-white font-bold">Juancito Ads</strong> — Traffic Manager</span>
    </div>

    <div class="reveal reveal-delay-4 flex flex-wrap gap-4 mb-12">
      <a
        href={waLink("Hola Juancito Ads, quiero mi propuesta gratis. ¿Podemos hablar?")}
        class="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-orange text-white font-bold text-base shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 transition-all"
        target="_blank" rel="noopener"
      >
        Quiero mi propuesta gratis
      </a>
      <a
        href="#resultados"
        class="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border-2 border-blue-neon text-blue-neon font-bold text-base shadow-[0_0_12px_rgba(30,144,255,0.2)] hover:bg-blue-neon/[0.12] hover:shadow-glow-blue hover:-translate-y-0.5 transition-all"
      >
        Ver resultados
      </a>
    </div>

    <div class="reveal reveal-delay-5 flex flex-wrap gap-px bg-blue-neon/20 border border-blue-neon/20 rounded-lg overflow-hidden w-fit max-w-full">
      <div class="bg-bg-deep/80 px-6 py-4 flex flex-col gap-1 min-w-[130px]">
        <span class="text-base font-extrabold text-orange leading-none">$35,000+</span>
        <span class="text-xs text-text-sec leading-snug">en Meta Ads gestionados</span>
      </div>
      <div class="bg-bg-deep/80 px-6 py-4 flex flex-col gap-1 min-w-[130px]">
        <span class="text-base font-extrabold text-orange leading-none">IA</span>
        <span class="text-xs text-text-sec leading-snug">en cada campaña</span>
      </div>
      <div class="bg-bg-deep/80 px-6 py-4 flex flex-col gap-1 min-w-[130px]">
        <span class="text-base font-extrabold text-orange leading-none">2 semanas</span>
        <span class="text-xs text-text-sec leading-snug">para ver resultados</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ParticleCanvas.astro src/components/Hero.astro
git commit -m "feat: Hero con red de particulas neuronal (ParticleCanvas)"
```

---

### Task 6: Secciones de contenido estático (ProblemaGrid, Metodologia, ResultadosGrid, Testimonios, CTAFinal)

**Files:**
- Create: `src/components/ProblemaGrid.astro`
- Create: `src/components/Metodologia.astro`
- Create: `src/components/ResultadosGrid.astro`
- Create: `src/components/Testimonios.astro`
- Create: `src/components/CTAFinal.astro`

**Interfaces:**
- Consumes: `problemas`, `resultados`, `testimonios`, `waLink`, `contacto` de `src/data/site.ts`
- Produces: los 5 componentes, usados en `index.astro`, `servicios.astro`, `contacto.astro` (Task 10)

- [ ] **Step 1: Crear `src/components/ProblemaGrid.astro`** (origen: `DEMO.html:1611–1644`)

```astro
---
import { CircleDollarSign, Clock, BarChart3, Sparkles } from "lucide-astro";
import { problemas } from "../data/site";

const iconMap = { "circle-dollar-sign": CircleDollarSign, clock: Clock, "bar-chart-3": BarChart3 };
const colorMap = { red: "bg-red-500/[0.12] text-red-400", amber: "bg-orange/[0.12] text-orange", blue: "bg-blue-neon/[0.12] text-blue-neon" };
---

<section id="problema" class="bg-bg-alt py-16 sm:py-24">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-12">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">El diagnóstico</span>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-balance" id="problema-title">
        ¿Tu negocio tiene lo que se necesita para vender en digital?
      </h2>
    </div>
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      {problemas.map((item, i) => {
        const Icon = iconMap[item.icono];
        return (
          <div class={`reveal reveal-delay-${i + 1} bg-white/5 border border-blue-neon/30 rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all`}>
            <div class={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colorMap[item.color]}`}>
              <Icon class="w-6 h-6" />
            </div>
            <p class="text-[0.68rem] font-bold tracking-widest uppercase text-text-sec/60 mb-1.5">El problema</p>
            <p class="text-base font-semibold mb-4 leading-snug">{item.problema}</p>
            <div class="h-0.5 rounded bg-gradient-to-r from-orange to-transparent mb-4"></div>
            <p class="text-sm text-text-sec leading-relaxed flex items-start gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-blue-neon shrink-0 mt-0.5" />
              {item.solucion}
            </p>
          </div>
        );
      })}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Crear `src/components/Metodologia.astro`** (origen: `DEMO.html:1646–1689`)

```astro
---
import { Target, Flame, Rocket, Zap } from "lucide-astro";

const pasos = [
  { icon: Target, num: 1, titulo: "Oferta Clara", texto: "Definimos qué comunicar, a quién y cuándo para que cada publicación tenga un propósito real y medible." },
  { icon: Flame, num: 2, titulo: "Contenido Constante", texto: "Publicaciones diarias que generan confianza y mantienen tu marca activa frente a tu cliente ideal." },
  { icon: Rocket, num: 3, titulo: "Campaña Estratégica", texto: "Anuncios en Meta Ads dirigidos al cliente ideal que convierten en ventas reales y medibles desde la primera semana." },
];
---

<section id="metodologia" class="bg-bg-deep py-16 sm:py-24">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-14">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Cómo trabajamos</span>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">Nuestra Fórmula con IA</h2>
      <p class="reveal reveal-delay-2 text-text-sec max-w-[52ch] mx-auto">
        Tres pilares potenciados con inteligencia artificial que convierten seguidores en clientes reales.
      </p>
    </div>

    <div class="grid gap-8 mb-14" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
      {pasos.map((p, i) => (
        <div class={`reveal reveal-delay-${i + 1} text-center p-10 rounded-lg bg-white/5 border border-blue-neon/30 hover:-translate-y-1 hover:shadow-glow-blue transition-all`}>
          <div class="inline-flex items-center justify-center w-13 h-13 rounded-full text-white text-xl font-black mb-5 shadow-glow-blue" style="background: linear-gradient(135deg, var(--color-blue-dark), var(--color-blue-neon));">
            {p.num}
          </div>
          <p.icon class="w-7 h-7 mx-auto mb-3 text-blue-neon" />
          <h3 class="text-xl font-extrabold mb-2.5">{p.titulo}</h3>
          <p class="text-sm text-text-sec leading-relaxed mb-4">{p.texto}</p>
          <span class="inline-flex items-center gap-1.5 bg-blue-neon/[0.12] border border-blue-neon/30 text-blue-neon text-[0.7rem] font-bold tracking-wide px-3 py-1 rounded-full">
            <Zap class="w-3 h-3" /> Optimizado con IA
          </span>
        </div>
      ))}
    </div>

    <div class="reveal flex flex-wrap items-center justify-center gap-3 sm:gap-4 rounded-lg px-10 py-8 text-center shadow-glow-blue border border-blue-neon/[0.35]" style="background: linear-gradient(135deg, rgba(27,58,107,0.6), rgba(30,144,255,0.15));">
      <span class="text-xl sm:text-2xl font-extrabold">Oferta</span>
      <span class="text-xl sm:text-2xl font-light text-text-sec">+</span>
      <span class="text-xl sm:text-2xl font-extrabold text-blue-neon" style="text-shadow: 0 0 12px rgba(30,144,255,0.5);">IA</span>
      <span class="text-xl sm:text-2xl font-light text-text-sec">+</span>
      <span class="text-xl sm:text-2xl font-extrabold">Contenido</span>
      <span class="text-xl sm:text-2xl font-light text-text-sec">+</span>
      <span class="text-xl sm:text-2xl font-extrabold">Campaña</span>
      <span class="text-xl sm:text-2xl font-light text-text-sec">=</span>
      <span class="text-xl sm:text-2xl font-black text-orange" style="text-shadow: 0 0 12px rgba(245,166,35,0.4);">Ventas 🚀</span>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Crear `src/components/ResultadosGrid.astro`** (origen: `DEMO.html:1691–1720`)

```astro
---
import { Store, Glasses, Package } from "lucide-astro";
import { resultados } from "../data/site";

const iconMap = { store: Store, glasses: Glasses, package: Package };
---

<section id="resultados" class="bg-bg-alt py-16 sm:py-24">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-12">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Casos reales</span>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-extrabold">Resultados reales en Panamá</h2>
    </div>
    <div class="grid gap-6 mb-6" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      {resultados.map((r, i) => {
        const Icon = iconMap[r.icono];
        return (
          <div class={`reveal reveal-delay-${i + 1} relative overflow-hidden bg-white/5 border border-blue-neon/30 rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[3px]`} style="border-top: 3px solid var(--color-blue-neon);">
            <div class="w-[50px] h-[50px] rounded-xl bg-blue-neon/10 border border-blue-neon/20 flex items-center justify-center mb-5">
              <Icon class="w-6 h-6 text-blue-neon" />
            </div>
            <div class="inline-block bg-orange text-white text-[0.7rem] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full mb-4">{r.badge}</div>
            <h3 class="text-base font-bold mb-3">{r.titulo}</h3>
            <p class="text-sm text-text-sec leading-relaxed">{r.descripcion}</p>
          </div>
        );
      })}
    </div>
    <p class="reveal text-center text-xs text-text-sec/50 italic">Clientes reales en Panamá. Nombres omitidos por confidencialidad.</p>
  </div>
</section>
```

- [ ] **Step 4: Crear `src/components/Testimonios.astro`** (origen: `DEMO.html:1956–2002`)

```astro
---
import { Glasses, CalendarCheck, Package } from "lucide-astro";
import { testimonios } from "../data/site";

const iconMap = { glasses: Glasses, "calendar-check": CalendarCheck, package: Package };
---

<section id="testimonios" class="bg-bg-alt py-16 sm:py-24">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-12">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Testimonios</span>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-extrabold">Lo que dicen nuestros clientes</h2>
    </div>
    <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      {testimonios.map((t, i) => {
        const Icon = iconMap[t.icono];
        return (
          <div class={`reveal reveal-delay-${i + 1} bg-white/5 border border-blue-neon/30 rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all`}>
            <div class="text-orange text-sm mb-2">★★★★★</div>
            <div class="text-orange text-5xl leading-[0.85] font-black mb-3" style="font-family: Georgia, serif;">"</div>
            <p class="text-sm text-text-sec leading-loose italic mb-6">{t.texto}</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-neon/[0.12] border border-blue-neon/25 flex items-center justify-center shrink-0">
                <Icon class="w-5 h-5 text-blue-neon" />
              </div>
              <div>
                <strong class="block text-sm font-bold text-white">{t.autor}</strong>
                <span class="text-xs text-text-sec">{t.contexto}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Crear `src/components/CTAFinal.astro`** (origen: `DEMO.html:2115–2147`)

```astro
---
import { Phone, Mail, Instagram } from "lucide-astro";
import { contacto, waLink } from "../data/site";
---

<section id="cta-final" class="relative overflow-hidden py-20 sm:py-28" style="background: linear-gradient(160deg, #050D1F 0%, #0A1628 50%, #050D1F 100%);">
  <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle 500px at 80% 50%, rgba(30,144,255,0.15) 0%, transparent 60%), radial-gradient(circle 350px at 10% 80%, rgba(245,166,35,0.06) 0%, transparent 60%);"></div>

  <div class="relative z-[1] w-full max-w-[1160px] mx-auto px-5 sm:px-10 text-center">
    <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Hablemos</span>
    <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-black max-w-[22ch] mx-auto mb-4 text-balance">
      ¿Listo para que tu negocio venda más?
    </h2>
    <p class="reveal reveal-delay-2 text-text-sec max-w-[42ch] mx-auto mb-10">
      Cuéntanos tu situación y te preparamos una propuesta sin costo. Campañas potenciadas con Inteligencia Artificial.
    </p>
    <div class="reveal reveal-delay-3 mb-12">
      <a
        href={waLink("Hola Juancito Ads, quiero hacer crecer mi negocio. Me gustaría una propuesta sin costo.")}
        class="inline-flex items-center gap-2.5 bg-orange text-white px-10 py-4 rounded-xl text-lg font-extrabold shadow-[0_6px_28px_rgba(245,166,35,0.4)] hover:bg-orange-dark hover:-translate-y-1 hover:shadow-glow-orange transition-all"
        target="_blank" rel="noopener"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="22" height="22" fill="none" aria-hidden="true">
          <path fill="#fff" d="M24 4C13 4 4 13 4 24c0 3.6 1 7 2.7 9.9L4 44l10.4-2.7C17.2 43 20.5 44 24 44c11 0 20-9 20-20S35 4 24 4z"/>
          <path fill="rgba(255,255,255,0.2)" d="M24 6C14.1 6 6 14.1 6 24c0 3.4.9 6.6 2.6 9.4L6.2 41.8l8.6-2.3C17.5 41.1 20.7 42 24 42c9.9 0 18-8.1 18-18S33.9 6 24 6z"/>
          <path fill="#fff" d="M33.5 28.4c-.5-.2-2.9-1.4-3.3-1.6-.4-.2-.7-.2-1 .2-.3.4-1.2 1.6-1.5 1.9-.3.3-.5.4-1 .1-.5-.2-2-.7-3.8-2.3-1.4-1.2-2.3-2.7-2.6-3.2-.3-.5 0-.7.2-1 .2-.2.5-.6.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1-2.5-1.4-3.4-.4-.9-.7-.8-1-.8h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.8s1.6 4.4 1.9 4.7c.3.3 3.2 4.8 7.7 6.7 1.1.5 1.9.7 2.6.9 1.1.3 2.1.3 2.9.2.9-.1 2.9-1.2 3.3-2.3.4-1.1.4-2.1.3-2.3-.1-.2-.4-.3-.9-.5z"/>
        </svg>
        Escríbenos por WhatsApp
      </a>
    </div>
    <div class="reveal reveal-delay-4 flex flex-wrap justify-center gap-x-12 gap-y-6">
      <a href={`https://wa.me/${contacto.whatsappNumber}`} class="flex items-center gap-2 text-text-sec text-sm hover:text-white transition-colors" target="_blank" rel="noopener">
        <Phone class="w-4 h-4" /> +507 6596-9428
      </a>
      <a href={`mailto:${contacto.email}`} class="flex items-center gap-2 text-text-sec text-sm hover:text-white transition-colors">
        <Mail class="w-4 h-4" /> {contacto.email}
      </a>
      <a href={contacto.instagramUrl} class="flex items-center gap-2 text-text-sec text-sm hover:text-white transition-colors" target="_blank" rel="noopener">
        <Instagram class="w-4 h-4" /> {contacto.instagram}
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Verificar tipos**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 7: Commit**

```bash
git add src/components/ProblemaGrid.astro src/components/Metodologia.astro src/components/ResultadosGrid.astro src/components/Testimonios.astro src/components/CTAFinal.astro
git commit -m "feat: secciones de contenido estatico (Problema, Metodologia, Resultados, Testimonios, CTAFinal)"
```

---

### Task 7: PaquetesGrid

**Files:**
- Create: `src/components/PaquetesGrid.astro`

**Interfaces:**
- Consumes: `planesMetaAds`, `planesRedes`, `planWeb`, `waLink` de `src/data/site.ts` (`PaquetesGrid.astro`); `Plan` (tipo), `waLink` (`PlanCard.astro`)
- Produces: `<PaquetesGrid />` — usado en `paquetes.astro` (Task 10)

- [ ] **Step 1: Crear `src/components/PaquetesGrid.astro`** (origen: `DEMO.html:1722–1954`)

```astro
---
import { Sparkles } from "lucide-astro";
import PlanCard from "./PlanCard.astro";
import { planesMetaAds, planesRedes, planWeb, waLink } from "../data/site";
---

<section id="paquetes" class="bg-bg-deep py-16 sm:py-24">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-2">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Planes</span>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl md:text-5xl font-extrabold">Elige tu plan</h2>
    </div>
    <p class="reveal text-center text-sm text-text-sec mb-12">
      El presupuesto de anuncios va siempre aparte. Tú controlas cuánto inviertes en ads.
    </p>

    <div class="reveal mb-6 pb-4 border-b border-blue-neon/20">
      <h3 class="text-xl sm:text-2xl font-extrabold mb-1">Solo Campañas Meta Ads</h3>
      <p class="text-sm text-text-sec">Para quien quiere invertir en publicidad sin gestión de redes</p>
    </div>
    <div class="grid gap-5 items-start" style="grid-template-columns: repeat(4, 1fr);">
      {planesMetaAds.map((plan, i) => <PlanCard plan={plan} delay={i + 1} />)}
    </div>

    <div class="reveal mt-14 mb-6 pb-4 border-b border-blue-neon/20">
      <h3 class="text-xl sm:text-2xl font-extrabold mb-1">Campañas + Redes Sociales</h3>
      <p class="text-sm text-text-sec">Para quien quiere su marketing digital completamente manejado</p>
    </div>
    <div class="grid gap-5 items-start" style="grid-template-columns: repeat(3, 1fr);">
      {planesRedes.map((plan, i) => <PlanCard plan={plan} delay={i + 1} />)}
    </div>

    <div class="mt-8">
      <div class="reveal bg-white/5 border rounded-lg p-7 relative" style="border-color: rgba(245,166,35,0.4);">
        <div class="inline-flex items-center gap-1.5 bg-orange/[0.12] border border-orange/[0.35] text-orange text-xs font-extrabold px-3 py-1 rounded-full mb-3">
          <Sparkles class="w-3.5 h-3.5" /> Creadas con IA
        </div>
        <p class="text-xs font-bold tracking-widest uppercase text-blue-neon mb-1">Servicio adicional</p>
        <p class="text-2xl font-black mb-3">Páginas Web</p>
        <p class="text-sm text-text-sec leading-relaxed mb-6 max-w-[56ch]">{planWeb.descripcion}</p>
        <div class="bg-blue-neon/[0.07] border border-blue-neon/[0.18] rounded-lg px-4 py-3.5 mb-6 inline-block">
          <p class="text-xs text-text-sec mb-0.5">Desde</p>
          <p class="text-3xl font-black text-orange leading-none mb-0.5">{planWeb.desde}</p>
          <p class="text-xs text-text-sec">{planWeb.hasta}</p>
        </div>
        <div class="grid gap-4 mb-6" style="grid-template-columns: repeat(3, 1fr);">
          {planWeb.subplanes.map((sp) => (
            <div class="bg-bg-deep/60 border border-blue-neon/20 rounded-lg p-5 text-center hover:border-blue-neon hover:shadow-glow-blue transition-all">
              <p class="text-xs font-bold tracking-widest uppercase text-blue-neon mb-2">{sp.nombre}</p>
              <p class="text-2xl font-black text-orange leading-none mb-3">{sp.precio}</p>
              <ul class="flex flex-col gap-1.5 text-left">
                {sp.features.map((f) => <li class="text-xs text-text-sec flex gap-1.5"><span class="text-blue-neon font-black">·</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <a
          href={waLink(planWeb.whatsappMensaje)}
          class="block text-center px-4 py-3 rounded-lg font-bold text-sm border hover:bg-orange/10 hover:shadow-glow-orange transition-all"
          style="border-color: var(--color-orange); color: var(--color-orange);"
          target="_blank" rel="noopener"
        >
          Consultar precio
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Crear `src/components/PlanCard.astro`** (extraído como componente propio — Astro no permite definir un componente hijo inline dentro del mismo archivo `.astro`)

```astro
---
import { Check } from "lucide-astro";
import { waLink, type Plan } from "../data/site";

interface Props {
  plan: Plan;
  delay: number;
}

const { plan, delay } = Astro.props;
---

<div class={`reveal reveal-delay-${delay} relative bg-white/5 border rounded-lg p-7 pt-7 pb-8 transition-all hover:-translate-y-1 ${plan.destacado ? "scale-[1.02] shadow-glow-blue" : "hover:border-blue-neon hover:shadow-glow-blue"}`}
     style={plan.destacado ? "border-color: var(--color-blue-neon); background: linear-gradient(160deg, rgba(27,58,107,0.7) 0%, rgba(30,144,255,0.1) 100%);" : "border-color: rgba(30,144,255,0.3);"}>
  {plan.destacado && (
    <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange text-white text-xs font-extrabold tracking-wide uppercase px-4 py-1.5 rounded-full whitespace-nowrap shadow-glow-orange">
      MÁS POPULAR
    </div>
  )}
  <p class="text-xs font-bold tracking-widest uppercase text-blue-neon mb-1">Plan</p>
  <p class="text-xl font-black mb-3">{plan.nombre}</p>
  <p class="text-sm text-text-sec italic leading-snug mb-4">{plan.descripcion}</p>
  <div class="bg-blue-neon/[0.07] border border-blue-neon/[0.18] rounded-lg px-4 py-3.5 mb-5">
    {plan.desde && <p class="text-xs text-text-sec mb-0.5">Desde</p>}
    <p class="text-3xl font-black text-orange leading-none mb-0.5">
      {plan.precio}<span class="text-base font-semibold text-text-sec">/mes</span>
    </p>
    {plan.precioHasta && <p class="text-xs text-text-sec">{plan.precioHasta}</p>}
    <p class="text-[0.65rem] text-text-sec/55 italic mt-1.5">{plan.nota}</p>
  </div>
  <ul class="flex flex-col gap-2 mb-6">
    {plan.features.map((f) => (
      <li class="flex items-start gap-2 text-sm text-text-sec leading-snug">
        <Check class="w-4 h-4 text-blue-neon shrink-0 mt-0.5" />
        {f}
      </li>
    ))}
  </ul>
  <a
    href={waLink(plan.whatsappMensaje)}
    class={`block text-center px-4 py-3 rounded-lg font-bold text-sm transition-all hover:-translate-y-0.5 ${
      plan.destacado
        ? "bg-orange border border-orange text-white shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange"
        : "border border-blue-neon text-blue-neon hover:bg-blue-neon/[0.12] hover:shadow-glow-blue"
    }`}
    target="_blank" rel="noopener"
  >
    Consultar
  </a>
</div>
```

- [ ] **Step 3: Verificar tipos y build**

Run: `npx astro check && npm run build`
Expected: `0 errors`, build genera `dist/` sin fallos.

- [ ] **Step 4: Commit**

```bash
git add src/components/PaquetesGrid.astro src/components/PlanCard.astro
git commit -m "feat: PaquetesGrid con PlanCard reutilizable para los 3 grupos de planes"
```

---

### Task 8: Migración de assets + Portafolio + Lightbox + VideoModal

**Files:**
- Move: `imagenes/imagen-feria-01.jpeg` → `public/images/imagen-feria-01.jpeg`
- Move: `imagenes/imagen-oañales-01.png` → `public/images/imagen-panales-01.png` (renombrado, sin `ñ`)
- Move: `imagenes/imagen-tienda-01.jpeg` → `public/images/imagen-tienda-01.jpeg`
- Move: `videos/video-01.mp4` … `video-04.mp4` → `public/videos/`
- Move: `logo.png` → `public/logo.png`
- Delete: carpetas `imagenes/`, `videos/` y archivo `logo.png` originales (ya movidos)
- Create: `src/components/Portafolio.astro`
- Create: `src/components/Lightbox.astro`
- Create: `src/components/VideoModal.astro`

**Interfaces:**
- Consumes: `portafolioImagenes`, `portafolioVideos` de `src/data/site.ts`
- Produces: `<Portafolio />` — usado en `portafolio.astro` (Task 10). Rutas públicas `/images/*.jpeg|png`, `/videos/*.mp4`, `/logo.png` — consumidas por `NavBar.astro` y `Hero.astro` (ya escritos en Tasks 3 y 5, referencian `/logo.png`).

- [ ] **Step 1: Mover assets a `public/`**

Run (desde la raíz del proyecto):
```bash
mkdir -p public/images public/videos
mv logo.png public/logo.png
mv "imagenes/imagen-feria-01.jpeg" public/images/imagen-feria-01.jpeg
mv "imagenes/imagen-oañales-01.png" public/images/imagen-panales-01.png
mv "imagenes/imagen-tienda-01.jpeg" public/images/imagen-tienda-01.jpeg
mv videos/video-01.mp4 public/videos/video-01.mp4
mv videos/video-02.mp4 public/videos/video-02.mp4
mv videos/video-03.mp4 public/videos/video-03.mp4
mv videos/video-04.mp4 public/videos/video-04.mp4
rm -rf imagenes videos
rm -f "imagenes/.DS_Store" "videos/.DS_Store" public/images/.DS_Store public/videos/.DS_Store
```
Expected: `public/logo.png`, `public/images/*.{jpeg,png}` (3 archivos), `public/videos/video-0{1..4}.mp4` existen; carpetas `imagenes/` y `videos/` en la raíz ya no existen.

- [ ] **Step 2: Crear `src/components/Lightbox.astro`** (origen: `DEMO.html:2094–2104`, `2420–2478`)

```astro
---
import { X, ChevronLeft, ChevronRight } from "lucide-astro";
---

<div id="portLightbox" class="fixed inset-0 z-[2000] hidden items-center justify-center" role="dialog" aria-label="Vista ampliada" aria-modal="true">
  <div class="absolute inset-0 bg-[#020612]/92 backdrop-blur-md" id="portLbBackdrop"></div>
  <button id="portLbClose" class="fixed top-5 right-6 z-[2] bg-blue-neon/15 border border-blue-neon/40 text-white w-[42px] h-[42px] rounded-full flex items-center justify-center hover:bg-blue-neon/30 hover:shadow-glow-blue transition-all" aria-label="Cerrar">
    <X class="w-5 h-5" />
  </button>
  <button id="portLbPrev" class="fixed top-1/2 -translate-y-1/2 left-5 z-[2] bg-blue-neon/15 border border-blue-neon/40 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-neon/30 hover:shadow-glow-blue transition-all" aria-label="Anterior">
    <ChevronLeft class="w-6 h-6" />
  </button>
  <button id="portLbNext" class="fixed top-1/2 -translate-y-1/2 right-5 z-[2] bg-blue-neon/15 border border-blue-neon/40 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-neon/30 hover:shadow-glow-blue transition-all" aria-label="Siguiente">
    <ChevronRight class="w-6 h-6" />
  </button>
  <div class="relative z-[1] max-w-[90vw] lg:max-w-[1100px] max-h-[88vh] flex items-center justify-center">
    <img id="portLbImg" src="" alt="Vista ampliada" class="max-w-full max-h-[88vh] rounded-lg object-contain shadow-[0_24px_80px_rgba(0,0,0,0.7)]" style="animation: lb-in 0.28s var(--ease-brand);" />
  </div>
  <p id="portLbCounter" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[2] text-sm text-text-sec bg-bg-deep/70 px-4 py-1.5 rounded-full"></p>
</div>
```

- [ ] **Step 3: Crear `src/components/VideoModal.astro`** (origen: `DEMO.html:2106–2113`, `2480–2524`)

```astro
---
import { X } from "lucide-astro";
---

<div id="portVidModal" class="fixed inset-0 z-[2000] hidden items-center justify-center" role="dialog" aria-label="Reproducir video" aria-modal="true">
  <div class="absolute inset-0 bg-[#020612]/94 backdrop-blur-md" id="portVidBackdrop"></div>
  <button id="portVidClose" class="fixed top-5 right-6 z-[2] bg-blue-neon/15 border border-blue-neon/40 text-white w-[42px] h-[42px] rounded-full flex items-center justify-center hover:bg-blue-neon/30 hover:shadow-glow-blue transition-all" aria-label="Cerrar">
    <X class="w-5 h-5" />
  </button>
  <div class="relative z-[1] w-[92vw] max-w-[960px]" style="animation: lb-in 0.28s var(--ease-brand);">
    <video id="portModalVideo" controls playsinline class="max-w-full max-h-[80vh] rounded-lg mx-auto block"></video>
  </div>
</div>
```

- [ ] **Step 4: Crear `src/components/Portafolio.astro`** (origen: `DEMO.html:2004–2113`, lógica JS de `2420–2524`)

```astro
---
import { Search, Play, Zap } from "lucide-astro";
import Lightbox from "./Lightbox.astro";
import VideoModal from "./VideoModal.astro";
import { portafolioImagenes, portafolioVideos } from "../data/site";
---

<section id="portafolio" class="bg-bg-deep py-16 sm:py-24">
  <div class="w-full max-w-[1160px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-12">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Portafolio</span>
      <div class="reveal reveal-delay-1 inline-flex items-center gap-2 bg-blue-neon/10 border border-blue-neon/[0.35] text-blue-neon text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-neon" style="animation: pulse-dot 2s infinite;"></span>
        <Zap class="w-3.5 h-3.5" /> Creado con IA
      </div>
      <h2 class="reveal reveal-delay-2 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">Nuestro Portafolio</h2>
      <p class="reveal reveal-delay-3 text-text-sec max-w-[52ch] mx-auto">
        Contenido real creado con Inteligencia Artificial para negocios en Panamá
      </p>
    </div>

    <div class="reveal flex items-center gap-4 mb-6">
      <h3 class="text-lg font-bold whitespace-nowrap">Contenido Visual</h3>
      <div class="flex-1 h-px bg-gradient-to-r from-blue-neon/40 to-transparent"></div>
    </div>
    <div class="grid gap-5" style="grid-template-columns: repeat(3, 1fr);" id="portImgGrid">
      {portafolioImagenes.map((img, i) => (
        <div class={`reveal reveal-delay-${i + 1} port-img-card group rounded-lg overflow-hidden cursor-pointer border border-blue-neon/30 hover:-translate-y-1 hover:shadow-glow-blue transition-all`} data-index={i} tabindex="0">
          <div class="relative w-full aspect-[4/3] overflow-hidden bg-bg-alt">
            <img src={img.src} alt={img.alt} loading="lazy" class="w-full h-full object-cover block group-hover:scale-[1.07] transition-transform duration-500" />
            <div class="absolute inset-0 flex items-center justify-center bg-bg-deep/0 group-hover:bg-bg-deep/45 transition-colors">
              <Search class="w-6 h-6 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div class="reveal flex items-center gap-4 mb-6 mt-14">
      <h3 class="text-lg font-bold whitespace-nowrap">Contenido en Video</h3>
      <div class="flex-1 h-px bg-gradient-to-r from-blue-neon/40 to-transparent"></div>
    </div>
    <div class="grid gap-5" style="grid-template-columns: repeat(2, 1fr);">
      {portafolioVideos.map((src, i) => (
        <div class={`reveal reveal-delay-${i + 1} port-vid-card group rounded-lg overflow-hidden cursor-pointer border border-blue-neon/30 hover:-translate-y-1 hover:shadow-glow-blue transition-all`} data-src={src} tabindex="0">
          <div class="relative w-full aspect-video overflow-hidden bg-bg-alt">
            <video src={src} preload="metadata" muted playsinline class="w-full h-full object-cover block pointer-events-none group-hover:scale-105 transition-transform duration-500"></video>
            <div class="absolute inset-0 flex items-center justify-center bg-bg-deep/35 group-hover:bg-bg-deep/55 transition-colors">
              <Play class="w-16 h-16 text-blue-neon drop-shadow-[0_4px_16px_rgba(30,144,255,0.5)] group-hover:scale-110 transition-transform fill-blue-neon/85" aria-label={`Reproducir video ${i + 1}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<Lightbox />
<VideoModal />

<script>
  function initPortfolioLightbox() {
    const lb = document.getElementById("portLightbox");
    const lbImg = document.getElementById("portLbImg") as HTMLImageElement | null;
    const lbCtr = document.getElementById("portLbCounter");
    const btnClose = document.getElementById("portLbClose");
    const btnPrev = document.getElementById("portLbPrev");
    const btnNext = document.getElementById("portLbNext");
    const backdrop = document.getElementById("portLbBackdrop");
    if (!lb || !lbImg) return;

    const cards = Array.from(document.querySelectorAll(".port-img-card"));
    const images = cards.map((c) => {
      const img = c.querySelector("img");
      return { src: img?.getAttribute("src") ?? "", alt: img?.getAttribute("alt") ?? "" };
    });
    let current = 0;

    function show(index: number) {
      current = (index + images.length) % images.length;
      lbImg!.src = images[current].src;
      lbImg!.alt = images[current].alt;
      if (lbCtr) lbCtr.textContent = `${current + 1} / ${images.length}`;
    }

    function open(index: number) {
      show(index);
      lb!.classList.remove("hidden");
      lb!.classList.add("flex");
      document.body.style.overflow = "hidden";
    }

    function close() {
      lb!.classList.add("hidden");
      lb!.classList.remove("flex");
      document.body.style.overflow = "";
      lbImg!.src = "";
    }

    cards.forEach((card, i) => {
      card.addEventListener("click", () => open(i));
      card.addEventListener("keydown", (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") {
          e.preventDefault();
          open(i);
        }
      });
    });

    btnClose?.addEventListener("click", close);
    backdrop?.addEventListener("click", close);
    btnPrev?.addEventListener("click", () => show(current - 1));
    btnNext?.addEventListener("click", () => show(current + 1));

    document.addEventListener("keydown", (e) => {
      if (lb!.classList.contains("hidden")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  function initPortfolioVideos() {
    const modal = document.getElementById("portVidModal");
    const modalVid = document.getElementById("portModalVideo") as HTMLVideoElement | null;
    const btnClose = document.getElementById("portVidClose");
    const backdrop = document.getElementById("portVidBackdrop");
    if (!modal || !modalVid) return;

    function open(src: string) {
      modalVid!.src = src;
      modal!.classList.remove("hidden");
      modal!.classList.add("flex");
      document.body.style.overflow = "hidden";
      modalVid!.play().catch(() => {});
    }

    function close() {
      modalVid!.pause();
      modalVid!.src = "";
      modal!.classList.add("hidden");
      modal!.classList.remove("flex");
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".port-vid-card").forEach((card) => {
      card.addEventListener("click", () => {
        const src = card.getAttribute("data-src");
        if (src) open(src);
      });
      card.addEventListener("keydown", (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Enter" || ke.key === " ") {
          e.preventDefault();
          const src = card.getAttribute("data-src");
          if (src) open(src);
        }
      });
    });

    btnClose?.addEventListener("click", close);
    backdrop?.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (!modal!.classList.contains("hidden") && e.key === "Escape") close();
    });
  }

  initPortfolioLightbox();
  initPortfolioVideos();
</script>
```

- [ ] **Step 5: Verificar tipos y build**

Run: `npx astro check && npm run build`
Expected: `0 errors`. Confirmar en el output de build que `dist/images/` y `dist/videos/` (copiados desde `public/`) contienen los archivos esperados.

- [ ] **Step 6: Commit**

```bash
git add public/ src/components/Portafolio.astro src/components/Lightbox.astro src/components/VideoModal.astro
git commit -m "feat: migrar assets a public/ y construir Portafolio con Lightbox y VideoModal"
```

Nota: `imagenes/`, `videos/` y el `logo.png` original de la raíz nunca estuvieron trackeados por git (son archivos previos a `git init` en Task 1), así que no hace falta `git rm --cached` — simplemente ya no existen en el working tree tras el `mv`/`rm` del Step 1.

---

### Task 9: ContactForm (Netlify Forms)

**Files:**
- Create: `src/components/ContactForm.astro`

**Interfaces:**
- Consumes: nada de `site.ts` (formulario autocontenido)
- Produces: `<ContactForm />` — usado en `contacto.astro` (Task 10)

- [ ] **Step 1: Crear `src/components/ContactForm.astro`**

```astro
---
---

<section id="contacto-form" class="bg-bg-alt py-16 sm:py-24">
  <div class="w-full max-w-[640px] mx-auto px-5 sm:px-10">
    <div class="text-center mb-10">
      <span class="reveal inline-block text-xs font-bold tracking-widest uppercase text-blue-neon mb-3">Escríbenos</span>
      <h2 class="reveal reveal-delay-1 text-3xl sm:text-4xl font-extrabold mb-3">Cuéntanos sobre tu negocio</h2>
      <p class="reveal reveal-delay-2 text-text-sec">Te respondemos en menos de 24 horas hábiles.</p>
    </div>

    <form
      name="contacto"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      class="reveal reveal-delay-3 flex flex-col gap-5 bg-white/5 border border-blue-neon/30 rounded-lg p-8"
    >
      <input type="hidden" name="form-name" value="contacto" />
      <p class="hidden">
        <label>No llenar si eres humano: <input name="bot-field" /></label>
      </p>

      <div class="flex flex-col gap-2">
        <label for="nombre" class="text-sm font-semibold text-text-sec">Nombre</label>
        <input id="nombre" name="nombre" type="text" required class="bg-bg-deep border border-blue-neon/30 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-neon focus:outline-none focus:shadow-glow-blue transition-all" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="negocio" class="text-sm font-semibold text-text-sec">Nombre de tu negocio</label>
        <input id="negocio" name="negocio" type="text" required class="bg-bg-deep border border-blue-neon/30 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-neon focus:outline-none focus:shadow-glow-blue transition-all" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="whatsapp" class="text-sm font-semibold text-text-sec">WhatsApp</label>
        <input id="whatsapp" name="whatsapp" type="tel" required placeholder="+507 6000-0000" class="bg-bg-deep border border-blue-neon/30 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-neon focus:outline-none focus:shadow-glow-blue transition-all" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="mensaje" class="text-sm font-semibold text-text-sec">Cuéntanos tu situación</label>
        <textarea id="mensaje" name="mensaje" rows="4" required class="bg-bg-deep border border-blue-neon/30 rounded-lg px-4 py-3 text-white text-sm focus:border-blue-neon focus:outline-none focus:shadow-glow-blue transition-all resize-none"></textarea>
      </div>

      <button
        type="submit"
        class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-orange text-white font-bold text-base shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 transition-all"
      >
        Enviar mensaje
      </button>
    </form>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ContactForm.astro
git commit -m "feat: ContactForm con Netlify Forms (honeypot anti-spam)"
```

---

### Task 10: Ensamblar páginas (index, servicios, paquetes, portafolio, contacto)

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/pages/servicios.astro`
- Create: `src/pages/paquetes.astro`
- Create: `src/pages/portafolio.astro`
- Create: `src/pages/contacto.astro`

**Interfaces:**
- Consumes: `Layout`, `Hero`, `ProblemaGrid`, `Metodologia`, `ResultadosGrid`, `PaquetesGrid`, `Testimonios`, `Portafolio`, `CTAFinal`, `ContactForm` (Tasks 3–9)

- [ ] **Step 1: Crear `src/pages/index.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import Hero from "../components/Hero.astro";
import ProblemaGrid from "../components/ProblemaGrid.astro";
import ResultadosGrid from "../components/ResultadosGrid.astro";
import CTAFinal from "../components/CTAFinal.astro";
---

<Layout
  title="Juancito Ads — Tráfico. Ventas. Resultados."
  description="Juancito Ads — Agencia de marketing digital en Panamá especializada en Meta Ads e Inteligencia Artificial. Tráfico. Ventas. Resultados."
>
  <Hero />
  <ProblemaGrid />
  <ResultadosGrid />
  <CTAFinal />
</Layout>
```

- [ ] **Step 2: Crear `src/pages/servicios.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import ProblemaGrid from "../components/ProblemaGrid.astro";
import Metodologia from "../components/Metodologia.astro";
import CTAFinal from "../components/CTAFinal.astro";
---

<Layout
  title="Servicios — Juancito Ads"
  description="Metodología de Juancito Ads: diagnóstico, oferta clara, contenido constante y campañas estratégicas en Meta Ads potenciadas con IA."
>
  <ProblemaGrid />
  <Metodologia />
  <CTAFinal />
</Layout>
```

- [ ] **Step 3: Crear `src/pages/paquetes.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import PaquetesGrid from "../components/PaquetesGrid.astro";
import Testimonios from "../components/Testimonios.astro";
import CTAFinal from "../components/CTAFinal.astro";
---

<Layout
  title="Paquetes y Precios — Juancito Ads"
  description="Planes de Meta Ads, redes sociales y páginas web para negocios en Panamá. El presupuesto de anuncios va siempre aparte."
>
  <PaquetesGrid />
  <Testimonios />
  <CTAFinal />
</Layout>
```

- [ ] **Step 4: Crear `src/pages/portafolio.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import Portafolio from "../components/Portafolio.astro";
import CTAFinal from "../components/CTAFinal.astro";
---

<Layout
  title="Portafolio — Juancito Ads"
  description="Contenido visual y video creado con Inteligencia Artificial para negocios reales en Panamá."
>
  <Portafolio />
  <CTAFinal />
</Layout>
```

- [ ] **Step 5: Crear `src/pages/contacto.astro`**

```astro
---
import Layout from "../layouts/Layout.astro";
import ContactForm from "../components/ContactForm.astro";
import CTAFinal from "../components/CTAFinal.astro";
---

<Layout
  title="Contacto — Juancito Ads"
  description="Escríbenos por WhatsApp o completa el formulario. Te respondemos en menos de 24 horas hábiles."
>
  <ContactForm />
  <CTAFinal />
</Layout>
```

- [ ] **Step 6: Build y verificación visual**

Run: `npm run build && npm run preview`
Expected: build sin errores; abrir `http://localhost:4321` y navegar manualmente las 5 rutas (`/`, `/servicios`, `/paquetes`, `/portafolio`, `/contacto`) verificando:
- Navbar y footer presentes en todas
- Botones de WhatsApp abren con el mensaje correcto (revisar el `href` generado)
- Portafolio: lightbox de imágenes y modal de video abren/cierran correctamente
- Formulario de contacto visualmente correcto (el envío real requiere estar desplegado en Netlify, no funciona en local)
- Responsive en mobile (DevTools, 375px), tablet (768px) y desktop

- [ ] **Step 7: Commit**

```bash
git add src/pages/
git commit -m "feat: ensamblar paginas index, servicios, paquetes, portafolio y contacto"
```

---

### Task 11: Favicon + limpieza final + verificación de build completo

**Files:**
- Create: `scripts/generate-favicons.mjs`
- Create: `public/favicon-32x32.png`, `public/favicon-192x192.png`, `public/apple-touch-icon.png`
- Create: `public/site.webmanifest`
- Modify: `src/layouts/Layout.astro` (agregar `<link>` de favicon en `<head>`)
- Delete: `DEMO.html`, `index.html` (raíz del proyecto, ya migrados a componentes Astro)

**Interfaces:**
- Consumes: `public/logo.png` (Task 8)

- [ ] **Step 1: Instalar `sharp` como devDependency**

Run: `npm install -D sharp`

- [ ] **Step 2: Crear `scripts/generate-favicons.mjs`**

```js
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });

const sizes = [
  { file: "public/favicon-32x32.png", size: 32 },
  { file: "public/favicon-192x192.png", size: 192 },
  { file: "public/apple-touch-icon.png", size: 180 },
];

for (const { file, size } of sizes) {
  await sharp("public/logo.png")
    .resize(size, size, { fit: "contain", background: { r: 5, g: 13, b: 31, alpha: 1 } })
    .png()
    .toFile(file);
  console.log(`✓ ${file}`);
}
```

- [ ] **Step 3: Ejecutar el script**

Run: `node scripts/generate-favicons.mjs`
Expected: imprime 3 líneas `✓ public/...`, y los 3 archivos existen en `public/`.

- [ ] **Step 4: Crear `public/site.webmanifest`**

```json
{
  "name": "Juancito Ads",
  "short_name": "Juancito Ads",
  "icons": [
    { "src": "/favicon-192x192.png", "sizes": "192x192", "type": "image/png" }
  ],
  "theme_color": "#050D1F",
  "background_color": "#050D1F",
  "display": "standalone"
}
```

- [ ] **Step 5: Agregar los `<link>` de favicon en `src/layouts/Layout.astro`**

En el `<head>`, después del `<title>{title}</title>`, agregar:

```astro
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#050D1F" />
```

- [ ] **Step 6: Eliminar los HTML legacy de la raíz (ya migrados)**

Run:
```bash
rm "DEMO.html" "index.html"
```
Expected: ambos archivos ya no existen en la raíz del proyecto (su contenido vive ahora en `src/components/` y `src/pages/`).

- [ ] **Step 7: Build final completo**

Run: `npx astro check && npm run build`
Expected: `0 errors`, `dist/` contiene las 5 páginas (`index.html`, `servicios/index.html`, `paquetes/index.html`, `portafolio/index.html`, `contacto/index.html`), más `dist/images/`, `dist/videos/`, `dist/logo.png`, `dist/favicon-*.png`.

- [ ] **Step 8: Commit final de la fase**

```bash
git add package.json package-lock.json scripts/generate-favicons.mjs public/favicon-32x32.png public/favicon-192x192.png public/apple-touch-icon.png public/site.webmanifest src/layouts/Layout.astro
git commit -m "feat: favicon nativo generado desde logo.png y limpieza de HTML legacy"
git log --oneline
```

Nota: `DEMO.html` e `index.html` nunca estuvieron trackeados por git (eran archivos previos al `git init` de Task 1), así que no requieren `git rm` — el `rm` del Step 6 ya los eliminó del working tree.

Expected: historial local limpio con ~10 commits, working tree sin cambios pendientes (`git status` → "nothing to commit, working tree clean").

---

## Después de este plan (no incluido aquí)

- Push al remoto `origin` (`git@github.com:juanarrietabusiness-pixel/PAGINA-JUANCITO-ADS.git`) — requiere confirmación explícita del usuario antes de ejecutarse, ya que reemplaza el contenido actual del repo.
- Fase 2: SEO técnico (sitemap, robots.txt, schema.org, Open Graph) + integración GA4/Meta Pixel.
- Fase 3: GitHub Actions + previews de Netlify.
- Fase 4: bitácora de errores (`docs/errors-learned.md`) + instrucción en `CLAUDE.md` local.
