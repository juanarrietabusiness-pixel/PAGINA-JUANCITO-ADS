# Rediseño "Tech-Neón Refinado" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar la dirección estética "Tech-Neón Refinado" (elegida por el usuario tras auditoría de diseño del 2026-07-20) para reemplazar la tipografía genérica (Inter), diferenciar las cards que hoy comparten un único diseño repetido en todo el sitio, extender la atmósfera visual del Hero al resto de las secciones, romper la simetría rígida del layout y añadir micro-interacciones más expresivas.

**Architecture:** Sitio estático Astro 5 + Tailwind v4 (config CSS-first vía `@theme` en `src/styles/global.css`). Todos los cambios son de presentación (markup + clases Tailwind + CSS), sin lógica nueva de negocio. No hay suite de tests en este proyecto — el criterio de aceptación de cada tarea es `npm run build` sin errores + verificación visual manual descrita en cada paso.

**Tech Stack:** Astro 5, Tailwind CSS v4 (`@theme`), lucide-astro, Google Fonts (Bricolage Grotesque + Hanken Grotesk).

## Global Constraints

- No usar `git add -A` / `git add .` / `git add --all` — siempre rutas exactas (ver `CLAUDE.md`).
- No modificar `tailwind.config.js/mjs` — toda la configuración de theme va en `src/styles/global.css` vía `@theme`.
- No usar emojis como iconos funcionales — solo `lucide-astro`.
- Criterio mínimo de aceptación de cada tarea: `npm run build` sin errores.
- Cada tarea debe dejar el sitio en un estado visualmente coherente y verificable — no dejar cambios a medias entre tareas.

---

### Task 1: Tokens de diseño — tipografía y atmósfera (fundación)

**Files:**
- Modify: `src/styles/global.css:1-22` (bloque `@theme`), y agregar reglas nuevas al final del archivo
- Modify: `src/layouts/Layout.astro:27-32` (enlaces de Google Fonts)

**Interfaces:**
- Produce: la clase utilitaria `.atmosphere` (usada por las Tasks 2 y 4) y la regla global `h1, h2, h3 { font-family: var(--font-display); }` (afecta a todos los títulos del sitio automáticamente, sin tocar cada componente).

- [ ] **Step 1: Reemplazar el link de Google Fonts en el layout**

En `src/layouts/Layout.astro`, reemplazar (líneas 29-32):

```astro
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
```

por:

```astro
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 2: Actualizar los tokens de fuente en `global.css`**

En `src/styles/global.css`, reemplazar la línea 12:

```css
  --font-sans: "Inter", system-ui, sans-serif;
```

por:

```css
  --font-sans: "Hanken Grotesk", system-ui, sans-serif;
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
```

- [ ] **Step 3: Aplicar la fuente display a todos los títulos globalmente**

En `src/styles/global.css`, después del bloque `body { ... }` (línea 32), agregar:

```css
h1, h2, h3 {
  font-family: var(--font-display);
  letter-spacing: -0.01em;
}
```

- [ ] **Step 4: Agregar la utilidad `.atmosphere` (textura + gradiente de fondo)**

En `src/styles/global.css`, al final del archivo (después de `@keyframes lb-in { ... }`), agregar:

```css
/* ── atmósfera de fondo (secciones fuera del Hero) ─────────────── */
.atmosphere {
  position: relative;
  isolation: isolate;
}
.atmosphere::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    radial-gradient(ellipse 60% 50% at 15% 0%, rgba(30, 144, 255, 0.10), transparent 60%),
    radial-gradient(ellipse 50% 40% at 100% 100%, rgba(245, 166, 35, 0.06), transparent 60%);
}
.atmosphere::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}
```

- [ ] **Step 5: Verificar build y fuentes en el navegador**

Run: `npm run build`
Expected: build sin errores.

Run: `npm run preview`, abrir `http://localhost:4321/` en el navegador.
Verificación visual: los títulos (`<h1>`, `<h2>`, `<h3>`) deben verse con un font geométrico distinto al texto de párrafo (Bricolage Grotesque tiene formas más angulares/condensadas que Hanken Grotesk). Confirmar en DevTools → Elements que un `<h1>` tiene `font-family: "Bricolage Grotesque"` computado.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro
git commit -m "feat: reemplazar Inter por Bricolage Grotesque + Hanken Grotesk y agregar utilidad de atmosfera"
```

---

### Task 2: ProblemaGrid — card diferenciada + atmósfera

**Files:**
- Modify: `src/components/ProblemaGrid.astro:9` (sección), `:21-22` (card)

**Interfaces:**
- Consume: `.atmosphere` de Task 1 (debe estar completada antes de esta tarea).

- [ ] **Step 1: Agregar atmósfera a la sección**

Reemplazar línea 9:

```astro
<section id="problema" class="bg-bg-alt py-16 sm:py-24">
```

por:

```astro
<section id="problema" class="atmosphere bg-bg-alt py-16 sm:py-24">
```

- [ ] **Step 2: Diferenciar la card de "problema" con acento lateral asimétrico**

Reemplazar líneas 21-22:

```astro
          <div class={`reveal reveal-delay-${i + 1} bg-white/5 border border-blue-neon/30 rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all`}>
            <div class={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colorMap[item.color]}`}>
```

por:

```astro
          <div class={`reveal reveal-delay-${i + 1} bg-white/5 border-l-[3px] border-l-orange/70 border-y border-r border-blue-neon/25 rounded-2xl rounded-l-md p-8 hover:-translate-y-1 hover:border-l-orange hover:shadow-glow-blue transition-all`}>
            <div class={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colorMap[item.color]}`}>
```

- [ ] **Step 3: Verificar build y visual**

Run: `npm run build`
Expected: build sin errores.

Verificación visual en `/` (sección "El diagnóstico"): las cards deben tener un borde izquierdo naranja grueso (3px) con la esquina superior izquierda achatada (`rounded-l-md`) mientras el resto del borde es azul tenue — distinto a las cards de "Resultados reales" que están justo debajo. El fondo de la sección debe verse con un leve resplandor azul arriba-izquierda y naranja abajo-derecha (textura sutil, no debe verse como una mancha fuerte).

- [ ] **Step 4: Commit**

```bash
git add src/components/ProblemaGrid.astro
git commit -m "feat: diferenciar card de ProblemaGrid con acento lateral y agregar atmosfera"
```

---

### Task 3: ResultadosGrid — card con tratamiento "prueba social"

**Files:**
- Modify: `src/components/ResultadosGrid.astro:18`

- [ ] **Step 1: Reemplazar el fondo plano por un degradado sutil**

Reemplazar línea 18:

```astro
          <div class={`reveal reveal-delay-${i + 1} relative overflow-hidden bg-white/5 border border-blue-neon/30 rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[3px]`} style="border-top: 3px solid var(--color-blue-neon);">
```

por:

```astro
          <div class={`reveal reveal-delay-${i + 1} relative overflow-hidden rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all`} style="border-top: 3px solid var(--color-blue-neon); border-left: 1px solid rgba(30,144,255,0.2); border-right: 1px solid rgba(30,144,255,0.2); border-bottom: 1px solid rgba(30,144,255,0.2); background: linear-gradient(180deg, rgba(30,144,255,0.06) 0%, rgba(255,255,255,0.03) 100%);">
```

- [ ] **Step 2: Verificar build y visual**

Run: `npm run build`
Expected: build sin errores.

Verificación visual en `/#resultados`: las 3 cards deben verse con un degradado sutil de azul a transparente de arriba hacia abajo (más presencia visual que un fondo plano), distinguibles de las cards de "El diagnóstico" (acento lateral naranja) justo arriba en la misma página.

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultadosGrid.astro
git commit -m "feat: dar tratamiento de degradado a las cards de ResultadosGrid"
```

---

### Task 4: Metodologia y Testimonios — romper la receta de card repetida

**Files:**
- Modify: `src/components/Metodologia.astro:11` (sección), `:23` (card)
- Modify: `src/components/Testimonios.astro:18` (card)

- [ ] **Step 1: Agregar atmósfera a la sección de Metodología**

En `src/components/Metodologia.astro`, reemplazar línea 11:

```astro
<section id="metodologia" class="bg-bg-deep py-16 sm:py-24">
```

por:

```astro
<section id="metodologia" class="atmosphere bg-bg-deep py-16 sm:py-24">
```

- [ ] **Step 2: Dar intensidad progresiva a los 3 pasos de metodología**

En `src/components/Metodologia.astro`, reemplazar línea 23:

```astro
        <div class={`reveal reveal-delay-${i + 1} text-center p-10 rounded-lg bg-white/5 border border-blue-neon/30 hover:-translate-y-1 hover:shadow-glow-blue transition-all`}>
```

por:

```astro
        <div class={`reveal reveal-delay-${i + 1} text-center p-10 rounded-2xl hover:-translate-y-1 hover:shadow-glow-blue transition-all`} style={`background: linear-gradient(160deg, rgba(30,144,255,${0.03 + i * 0.02}) 0%, rgba(255,255,255,0.03) 100%); border: 1px solid rgba(30,144,255,${0.15 + i * 0.05});`}>
```

(Esto hace que el paso 3 "Campaña Estratégica" tenga el borde/fondo más intenso de los tres, reforzando visualmente la progresión hacia el resultado final.)

- [ ] **Step 3: Convertir las cards de Testimonios en bloques editoriales de cita**

En `src/components/Testimonios.astro`, reemplazar línea 18:

```astro
          <div class={`reveal reveal-delay-${i + 1} bg-white/5 border border-blue-neon/30 rounded-lg p-8 hover:-translate-y-1 hover:shadow-glow-blue transition-all`}>
```

por:

```astro
          <div class={`reveal reveal-delay-${i + 1} relative pl-8 py-2 border-l-2 border-blue-neon/40 hover:border-orange transition-colors`}>
```

- [ ] **Step 4: Verificar build y visual**

Run: `npm run build`
Expected: build sin errores.

Verificación visual: en `/` sección "Nuestra Fórmula con IA", los 3 pasos deben verse con intensidad de color creciente de izquierda a derecha (paso 3 más marcado). En `/` sección "Lo que dicen nuestros clientes", las cards ya NO deben tener caja ni fondo — solo una línea vertical azul a la izquierda que se pone naranja al pasar el mouse, dejando la cita tipográfica como protagonista.

- [ ] **Step 5: Commit**

```bash
git add src/components/Metodologia.astro src/components/Testimonios.astro
git commit -m "feat: diferenciar cards de Metodologia (intensidad progresiva) y Testimonios (bloque editorial)"
```

---

### Task 5: Portafolio — layout asimétrico tipo masonry

**Files:**
- Modify: `src/components/Portafolio.astro:28-34`

- [ ] **Step 1: Hacer que la primera imagen ocupe 2 columnas y 2 filas**

Reemplazar líneas 28-34:

```astro
        <div class={`reveal reveal-delay-${i + 1} port-img-card group rounded-lg overflow-hidden cursor-pointer border border-blue-neon/30 hover:-translate-y-1 hover:shadow-glow-blue transition-all`} data-index={i} tabindex="0">
          <div class="relative w-full aspect-[4/3] overflow-hidden bg-bg-alt">
            <img src={img.src} alt={img.alt} loading="lazy" class="w-full h-full object-cover block group-hover:scale-[1.07] transition-transform duration-500" />
            <div class="absolute inset-0 flex items-center justify-center bg-bg-deep/0 group-hover:bg-bg-deep/45 transition-colors">
              <Search class="w-6 h-6 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all" />
            </div>
          </div>
        </div>
```

por:

```astro
        <div class={`reveal reveal-delay-${i + 1} port-img-card group rounded-lg overflow-hidden cursor-pointer border border-blue-neon/30 hover:-translate-y-1 hover:shadow-glow-blue transition-all ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`} data-index={i} tabindex="0">
          <div class={`relative w-full overflow-hidden bg-bg-alt ${i === 0 ? "h-full aspect-[4/3] md:aspect-auto" : "aspect-[4/3]"}`}>
            <img src={img.src} alt={img.alt} loading="lazy" class="w-full h-full object-cover block group-hover:scale-[1.07] transition-transform duration-500" />
            <div class="absolute inset-0 flex items-center justify-center bg-bg-deep/0 group-hover:bg-bg-deep/45 transition-colors">
              <Search class="w-6 h-6 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all" />
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Verificar build y visual**

Run: `npm run build`
Expected: build sin errores.

Verificación visual en `/portafolio`, sección "Contenido Visual": en pantallas ≥768px (md), la primera imagen debe verse como un bloque grande (2 columnas × 2 filas) a la izquierda, con las otras 2 imágenes apiladas verticalmente a la derecha — sin huecos vacíos en el grid. En mobile (<768px), las 3 imágenes deben seguir apiladas verticalmente en una sola columna (comportamiento sin cambios, ya que `md:` no aplica).

- [ ] **Step 3: Commit**

```bash
git add src/components/Portafolio.astro
git commit -m "feat: layout asimetrico tipo masonry para la primera imagen del portafolio"
```

---

### Task 6: Micro-interacciones — WhatsApp flotante, CTA de navbar y formulario

**Files:**
- Modify: `src/components/WhatsAppFloat.astro:7`
- Modify: `src/components/NavBar.astro:30`
- Modify: `src/components/ContactForm.astro:46`

- [ ] **Step 1: Anillo de resplandor al hover en el botón flotante de WhatsApp**

En `src/components/WhatsAppFloat.astro`, reemplazar línea 7:

```astro
  class="fixed bottom-6 right-6 z-[900] w-[58px] h-[58px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_10px_32px_rgba(37,211,102,0.6)] transition-transform"
```

por:

```astro
  class="fixed bottom-6 right-6 z-[900] w-[58px] h-[58px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.5)] hover:scale-110 hover:ring-4 hover:ring-[#25D366]/30 hover:shadow-[0_10px_32px_rgba(37,211,102,0.6)] transition-all"
```

- [ ] **Step 2: Reforzar el hover del CTA principal del navbar**

En `src/components/NavBar.astro`, reemplazar línea 30:

```astro
          class="hidden md:inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-orange text-white font-bold text-sm shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 transition-all"
```

por:

```astro
          class="hidden md:inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-orange text-white font-bold text-sm shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 hover:scale-[1.03] transition-all"
          style="transition-timing-function: var(--ease-brand);"
```

- [ ] **Step 3: Reforzar el hover del botón de envío del formulario de contacto**

En `src/components/ContactForm.astro`, reemplazar línea 46:

```astro
        class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-orange text-white font-bold text-base shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 transition-all"
```

por:

```astro
        class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-orange text-white font-bold text-base shadow-[0_4px_18px_rgba(245,166,35,0.35)] hover:bg-orange-dark hover:shadow-glow-orange hover:-translate-y-0.5 hover:scale-[1.02] transition-all"
```

- [ ] **Step 4: Verificar build y visual**

Run: `npm run build`
Expected: build sin errores.

Verificación visual: pasar el mouse sobre el botón flotante de WhatsApp (visible en cualquier página) — debe aparecer un anillo verde translúcido expandiéndose alrededor del botón. Pasar el mouse sobre "Quiero crecer" (navbar) y "Enviar mensaje" (`/contacto`) — el crecimiento (scale) debe notarse más que antes, sin verse brusco.

- [ ] **Step 5: Commit**

```bash
git add src/components/WhatsAppFloat.astro src/components/NavBar.astro src/components/ContactForm.astro
git commit -m "feat: micro-interacciones de hover mas expresivas en CTAs principales"
```

---

### Task 7: Verificación visual final en las 5 páginas

**Files:** Ninguno (solo verificación, sin cambios de código)

- [ ] **Step 1: Build de producción**

Run: `npm run build`
Expected: build sin errores, sin warnings nuevos respecto al build anterior a este plan.

- [ ] **Step 2: Recorrido visual completo**

Run: `npm run preview`, y abrir cada una de las 5 rutas: `/`, `/servicios`, `/paquetes`, `/portafolio`, `/contacto`.

Verificar en cada una:
- Los títulos usan Bricolage Grotesque (se ve distinto al cuerpo de texto).
- No quedó ninguna card usando la receta genérica original (`bg-white/5 border border-blue-neon/30 rounded-lg ... hover:-translate-y-1 hover:shadow-glow-blue`) sin diferenciar — excepto donde se decidió dejarla igual a propósito (PlanCard, subplanes de PaquetesGrid, ProblemaGrid ya diferenciada en Task 2).
- El scroll-reveal (`.reveal`) sigue funcionando (las secciones aparecen con fade al hacer scroll, no aparecen rotas u ocultas permanentemente).
- No hay errores en la consola del navegador (usar DevTools → Console).

- [ ] **Step 3: Reportar hallazgos**

Si algo no coincide con lo esperado en el Step 2, documentarlo como hallazgo y decidir con el usuario si se corrige antes de dar por cerrado el rediseño (no commitear un "arreglo silencioso" sin decirlo).

---

## Self-Review

**Cobertura del plan de auditoría (2026-07-20):**
1. Tipografía (Inter → Bricolage Grotesque + Hanken Grotesk) → Task 1. ✅
2. Diferenciar cards por tipo (Problema/Resultados/Metodología/Testimonios) → Tasks 2, 3, 4. ✅
3. Extender atmósfera del Hero a otras secciones → Tasks 1 (utilidad), 2, 4 (Problema y Metodología). ✅
4. Romper simetría en 2-3 secciones → Task 5 (Portafolio masonry) + acento lateral asimétrico de Task 2. ✅
5. Micro-interacciones más distintivas → Task 6. ✅

**Fuera de alcance de este plan (decisión consciente, no omisión):** PlanCard/PaquetesGrid no se tocan — ya tienen diferenciación propia (variante `destacado` con degradado) y no comparten la receta genérica cuestionada en la auditoría. Si el usuario quiere reforzarlas también, es una tarea adicional a planear por separado.
