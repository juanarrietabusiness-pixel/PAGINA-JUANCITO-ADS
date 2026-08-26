# SEO y Google Search Console — juancitoads.com

Qué quedó montado en el código, qué hay que hacer a mano en Google, y cómo
comprobar que funciona. Fecha de la puesta a punto: **2026-08-26**.

---

## 1. Lo que ya está hecho (en el código, se despliega solo)

| Pieza | Dónde vive | Qué hace |
|---|---|---|
| Dominio canónico | `astro.config.mjs` → `site` | Todos los `<link rel="canonical">`, las `og:url` y el sitemap apuntan a `https://juancitoads.com`. **Antes apuntaban a `juancitoads.netlify.app`**, que es lo que le decía a Google que la versión buena de cada página vivía en el subdominio de Netlify. |
| `sitemap-index.xml` + `sitemap-0.xml` | `@astrojs/sitemap`, configurado en `astro.config.mjs` | Lista las 12 páginas indexables con su fecha. Deja fuera `/smartlink` (lleva `noindex`) y `/servicios/bot-multicanal` (es una redirección). |
| `robots.txt` | `src/pages/robots.txt.ts` | Permite el rastreo completo y anuncia el sitemap con URL absoluta. Se genera en el build, así que la URL no se queda vieja si el dominio cambia. |
| Datos estructurados | `src/data/schema.ts` + `src/components/SchemaOrg.astro` | JSON-LD en cada página: la agencia (`ProfessionalService`), el sitio, los cuatro servicios con sus precios, las preguntas frecuentes y las migas de pan. Todo sale de `site.ts` — no hay ni un precio escrito a mano. |
| Verificador | `scripts/verificar-seo.mjs` → `npm run verificar:seo` | 662 comprobaciones sobre el `dist/` real. Se ejecuta después de `npm run build`. |

**Regla al tocar precios o servicios:** no hay nada que actualizar aquí. El
marcado se recalcula desde `src/data/site.ts` en cada build. Lo único
obligatorio es pasar `npm run build && npm run verificar:seo` antes de subir:
el verificador falla si un precio del marcado deja de aparecer en su página.

---

## 2. Lo que hay que hacer a mano en Google (una vez)

### 2.1 La propiedad de Search Console — ya está verificada

Comprobado el 2026-08-26 desde el DNS: `juancitoads.com` tiene el registro TXT
`google-site-verification=EPZo-xLK5kGyfOtAWjFDBcA3MoDob6YBmorKQW0lFdw`, que es
la verificación por **propiedad de dominio**. No hay que volver a verificar
nada.

Si algún día se pierde el acceso y hay que rehacerla, la propiedad de dominio
(la que se verifica con un TXT en el DNS de GoDaddy) es la buena: cubre a la vez
`juancitoads.com`, `www.juancitoads.com`, `http://` y `https://`. La alternativa
—"prefijo de URL"— sólo cubre una de esas cuatro formas y obliga a mantener
cuatro propiedades.

### 2.2 Enviar el sitemap ← **esto es lo que falta**

1. Entrar a [Search Console](https://search.google.com/search-console) con la
   cuenta de `juanarrietabusiness@gmail.com`.
2. Elegir la propiedad `juancitoads.com`.
3. Menú lateral → **Sitemaps**.
4. En "Añadir un sitemap nuevo", escribir exactamente:

   ```
   sitemap-index.xml
   ```

5. Enviar. En unos minutos el estado pasa a **Correcto** y aparece
   "12 páginas descubiertas".

Es un fichero índice: apunta a `sitemap-0.xml`, que es donde están las URLs.
Google sigue el enlace solo, no hay que enviar los dos.

### 2.3 Pedir la primera indexación

En la barra de arriba, **Inspección de URLs** → pegar `https://juancitoads.com/`
→ **Solicitar indexación**. Repetirlo con las cuatro páginas de servicio. Es una
cola con cupo diario, así que no hay que hacerlo con las doce: con el sitemap
enviado, el resto entra solo.

---

## 3. Cómo comprobar que funcionó

Una vez Netlify haya desplegado esta rama:

| Comprobación | Cómo | Qué tiene que salir |
|---|---|---|
| robots.txt | Abrir `https://juancitoads.com/robots.txt` | `Allow: /` y `Sitemap: https://juancitoads.com/sitemap-index.xml` |
| sitemap | Abrir `https://juancitoads.com/sitemap-index.xml` | Un XML que apunta a `sitemap-0.xml` |
| canonical | Ver el código fuente de la portada | `<link rel="canonical" href="https://juancitoads.com/">` — **no** `.netlify.app` |
| datos estructurados | [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) con `https://juancitoads.com/servicios/campanas-ads` | Detecta `Service`, `BreadcrumbList` y la organización, sin errores |
| sin contenido duplicado | Abrir `https://juancitoads.netlify.app` | Tiene que **redirigir** a `juancitoads.com`. Lo hace Netlify solo si `juancitoads.com` está marcado como *Primary domain* en Domain management. Si no redirige, hay dos copias del sitio compitiendo entre sí en Google. |
| certificado | Netlify → Domain management → HTTPS | Certificado de Let's Encrypt emitido para `juancitoads.com` y `www` |

> **Aviso sobre las pruebas de Google:** hasta que Netlify despliegue esta rama,
> el Rich Results Test seguirá viendo el sitio anterior (sin marcado y con el
> canonical viejo). Hay que desplegar primero y probar después.

---

## 4. Qué esperar, y en cuánto

Con honestidad, porque aquí es donde se generan las expectativas equivocadas:

- **Indexación:** de unos días a dos o tres semanas desde que se envía el
  sitemap. Que una página esté indexada significa que Google la conoce, no que
  salga arriba.
- **Posiciones:** para "juancito ads" (el nombre de la marca) debería salir el
  primero en poco tiempo, porque no compite con nadie. Para "agencia de
  marketing digital en Panamá" hay competencia establecida y eso no se resuelve
  con marcado técnico: se resuelve con contenido, reseñas y enlaces de otros
  sitios.
- **Lo que este trabajo sí garantiza:** que Google pueda rastrear todo, que
  entienda qué vende el negocio y a qué precio, y que la autoridad se acumule en
  `juancitoads.com` en vez de repartirse entre dos dominios. Es el suelo, no el
  techo.

---

## 5. Lo que queda fuera y valdría más que todo lo anterior

Por orden de impacto para un negocio local en Panamá:

1. **Perfil de Empresa de Google** (Google Business Profile). Para búsquedas del
   tipo "agencia de marketing cerca de mí" o con nombre de ciudad, el mapa sale
   por encima de los resultados normales. Es gratis, se pide en
   [business.google.com](https://business.google.com), y es probablemente la
   acción con mejor retorno de esta lista. Requiere decidir si se publica una
   dirección o se configura como negocio sin local a la vista.
2. **Reseñas reales** en ese perfil.
3. **Contenido propio** — hoy el sitio son páginas de servicio. Un blog o casos
   de estudio con nombre y cifras dan a Google algo por lo que posicionar más
   allá de "agencia de marketing".

> Si algún día se publica una dirección física, tiene que entrar a la vez en
> `src/data/site.ts`, en el marcado (`schema.ts` la declara hoy solo a nivel de
> país, a propósito) y en el Perfil de Empresa. Una dirección que no coincide
> entre las tres fuentes hace más daño que no tener ninguna.

---

## 6. Decisiones tomadas, para que no se deshagan por error

- **`/smartlink` no está en el sitemap y tampoco bloqueada en `robots.txt`.**
  Parece una contradicción y no lo es: `Disallow` impide *rastrear*, no
  *indexar*. Un robot que no puede entrar tampoco puede leer el `noindex`, y
  Google acabaría listando la URL sin descripción y sin forma de quitarla. Para
  sacar algo del índice hay que dejarlo entrar y enseñarle el `noindex`.
- **El catálogo de servicios del marcado no lleva precios.** La organización se
  emite en todas las páginas, así que un catálogo con cifras las metería también
  en `/privacidad` y `/terminos`, donde no aparece ningún precio a la vista.
  Google pide expresamente no marcar contenido que el lector no ve. Los precios
  viven en el `Service` de cada página de servicio, donde sí están escritos.
- **El marcado no dice nada sobre impuestos.** El sitio no declara hoy si los
  precios llevan ITBMS incluido. Marcar `valueAddedTaxIncluded` sería estrenar
  una condición comercial en los datos estructurados en vez de en `/terminos`,
  que es donde se decide.
- **El `<title>` de la portada pasó de "Juancito Ads — Tráfico. Ventas.
  Resultados." a "Agencia de Marketing Digital en Panamá — Juancito Ads".** El
  lema no tenía ni una palabra de las que alguien teclea en Google. El lema no
  se pierde: lo dice el hero en grande. Si se prefiere el anterior, es una línea
  en `src/pages/index.astro`.
