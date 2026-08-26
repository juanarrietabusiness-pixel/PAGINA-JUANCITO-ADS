/**
 * Verificador de SEO técnico — se ejecuta sobre `dist/`, no sobre el código.
 *
 *   npm run build && node scripts/verificar-seo.mjs
 *
 * ── Por qué sobre el dist y no sobre los `.astro` ──────────────────
 * Porque lo que Google lee es el HTML servido. Un canonical puede estar
 * perfecto en el layout y salir mal por una ruta con barra final; un precio
 * puede estar bien en `site.ts` y no llegar al marcado. Leer el resultado
 * cierra esa distancia.
 *
 * La comprobación que más vale de todas es la última: **cada precio que el
 * JSON-LD le declara a Google tiene que aparecer también en el texto de la
 * página**. Un dato estructurado que promete $150 en una página donde pone $180
 * no es un error cosmético: es la clase de discrepancia por la que Google deja
 * de fiarse del marcado de todo el dominio.
 */
import { readFileSync, existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const DOMINIO = "https://juancitoads.com";

/** Rutas que existen en dist pero no deben salir en el sitemap, y por qué. */
const FUERA_DEL_SITEMAP = {
  "/smartlink/": "lleva noindex a propósito (enlace de la bio)",
  "/servicios/bot-multicanal/": "es una redirección 301, no una página",
};

const fallos = [];
const avisos = [];
let comprobaciones = 0;

function comprobar(condicion, mensaje) {
  comprobaciones++;
  if (!condicion) fallos.push(mensaje);
}

async function paginasHtml(dir) {
  const encontradas = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) encontradas.push(...(await paginasHtml(ruta)));
    else if (entrada.name === "index.html") {
      const url = `/${relative(DIST, ruta).split(sep).slice(0, -1).join("/")}`;
      encontradas.push({ url: url === "/" ? "/" : `${url}/`, archivo: ruta });
    }
  }
  return encontradas;
}

const capturar = (html, re) => (html.match(re) ?? [])[1];

// ───────────────────────────────────────────────────────────────────
console.log("Verificando SEO sobre dist/\n");

if (!existsSync(DIST)) {
  console.error("No hay dist/. Ejecuta `npm run build` primero.");
  process.exit(1);
}

const paginas = (await paginasHtml(DIST)).sort((a, b) => a.url.localeCompare(b.url));

// ── 1. robots.txt ──────────────────────────────────────────────────
const robots = readFileSync(join(DIST, "robots.txt"), "utf8");
comprobar(/^User-agent: \*/m.test(robots), "robots.txt no declara `User-agent: *`");
comprobar(
  robots.includes(`Sitemap: ${DOMINIO}/sitemap-index.xml`),
  "robots.txt no apunta al sitemap con URL absoluta del dominio real"
);
comprobar(
  !/^Disallow: \/\s*$/m.test(robots),
  "robots.txt bloquea el sitio entero (`Disallow: /`)"
);

// ── 2. Sitemap: ni de más ni de menos ──────────────────────────────
const sitemap = readFileSync(join(DIST, "sitemap-0.xml"), "utf8");
const enSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

for (const url of enSitemap) {
  comprobar(url.startsWith(`${DOMINIO}/`), `El sitemap lista una URL de otro dominio: ${url}`);
}

for (const pagina of paginas) {
  const esperada = `${DOMINIO}${pagina.url}`;
  const motivo = FUERA_DEL_SITEMAP[pagina.url];
  if (motivo) {
    comprobar(!enSitemap.includes(esperada), `${pagina.url} está en el sitemap y no debería: ${motivo}`);
  } else {
    comprobar(enSitemap.includes(esperada), `Falta ${pagina.url} en el sitemap`);
  }
}

// ── 3. Canonical, og:url y noindex, página por página ──────────────
const titulos = new Map();
const descripciones = new Map();

for (const pagina of paginas) {
  const html = readFileSync(pagina.archivo, "utf8");
  const etiqueta = pagina.url;

  // La redirección no es una página: no se le exige nada de esto.
  if (etiqueta === "/servicios/bot-multicanal/") {
    comprobar(
      /refresh/i.test(html) && html.includes("/servicios/agente-crm"),
      "La ruta vieja del bot ya no redirige al Agente CRM"
    );
    continue;
  }

  const canonical = capturar(html, /<link rel="canonical" href="([^"]+)"/);
  const esNoindex = /<meta name="robots" content="noindex/.test(html);

  comprobar(Boolean(canonical), `${etiqueta}: no tiene <link rel="canonical">`);
  comprobar(
    canonical?.startsWith(`${DOMINIO}/`),
    `${etiqueta}: el canonical no apunta al dominio real (${canonical})`
  );
  comprobar(
    canonical === `${DOMINIO}${etiqueta}` || canonical === `${DOMINIO}${etiqueta.replace(/\/$/, "")}`,
    `${etiqueta}: el canonical apunta a otra página (${canonical})`
  );

  const ogUrl = capturar(html, /<meta property="og:url" content="([^"]+)"/);
  comprobar(ogUrl === canonical, `${etiqueta}: og:url (${ogUrl}) no coincide con el canonical`);

  const ogImage = capturar(html, /<meta property="og:image" content="([^"]+)"/);
  comprobar(
    ogImage?.startsWith("https://"),
    `${etiqueta}: og:image tiene que ser una URL absoluta (${ogImage})`
  );

  if (FUERA_DEL_SITEMAP[etiqueta]) {
    comprobar(esNoindex, `${etiqueta}: debería llevar noindex y no lo lleva`);
  } else {
    comprobar(!esNoindex, `${etiqueta}: lleva noindex pero está en el sitemap`);
  }

  // Título y descripción: presentes, únicos y de un largo que no se corte feo.
  const titulo = capturar(html, /<title>([^<]*)<\/title>/);
  const descripcion = capturar(html, /<meta name="description" content="([^"]*)"/);
  comprobar(Boolean(titulo), `${etiqueta}: sin <title>`);
  comprobar(Boolean(descripcion), `${etiqueta}: sin meta description`);
  if (titulo) {
    comprobar(!titulos.has(titulo), `Título repetido en ${etiqueta} y ${titulos.get(titulo)}: "${titulo}"`);
    titulos.set(titulo, etiqueta);
    if (titulo.length > 65) avisos.push(`${etiqueta}: título de ${titulo.length} caracteres, Google corta sobre 60`);
  }
  if (descripcion) {
    comprobar(
      !descripciones.has(descripcion),
      `Descripción repetida en ${etiqueta} y ${descripciones.get(descripcion)}`
    );
    descripciones.set(descripcion, etiqueta);
    if (descripcion.length > 165)
      avisos.push(`${etiqueta}: descripción de ${descripcion.length} caracteres, Google corta sobre 155`);
  }

  // Un solo <h1> por página, y con texto.
  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  comprobar(h1.length === 1, `${etiqueta}: tiene ${h1.length} <h1> (debe haber exactamente 1)`);
  if (h1.length === 1)
    comprobar(h1[0][1].replace(/<[^>]+>/g, "").trim().length > 0, `${etiqueta}: el <h1> está vacío`);
}

// ── 4. JSON-LD: parsea, engancha y no miente ───────────────────────
const tiposEsperados = {
  "/": ["ProfessionalService", "WebSite"],
  "/ayuda/": ["FAQPage"],
  "/servicios/campanas-ads/": ["Service", "BreadcrumbList"],
  "/servicios/campanas-redes/": ["Service", "BreadcrumbList"],
  "/servicios/paginas-web/": ["Service", "BreadcrumbList", "FAQPage"],
  "/servicios/agente-crm/": ["Service", "BreadcrumbList"],
};

/** Todos los `@id` que el grafo define, para poder validar las referencias. */
function recogerIds(nodo, destino) {
  if (Array.isArray(nodo)) return nodo.forEach((n) => recogerIds(n, destino));
  if (nodo && typeof nodo === "object") {
    if (typeof nodo["@id"] === "string" && nodo["@type"]) destino.add(nodo["@id"]);
    Object.values(nodo).forEach((v) => recogerIds(v, destino));
  }
}

/** Referencias `{ "@id": ... }` sin `@type`: apuntan a otro nodo del grafo. */
function recogerReferencias(nodo, destino) {
  if (Array.isArray(nodo)) return nodo.forEach((n) => recogerReferencias(n, destino));
  if (nodo && typeof nodo === "object") {
    const claves = Object.keys(nodo);
    if (claves.length === 1 && claves[0] === "@id") destino.add(nodo["@id"]);
    Object.values(nodo).forEach((v) => recogerReferencias(v, destino));
  }
}

function recogerPrecios(nodo, destino) {
  if (Array.isArray(nodo)) return nodo.forEach((n) => recogerPrecios(n, destino));
  if (nodo && typeof nodo === "object") {
    for (const clave of ["price", "minPrice", "maxPrice"]) {
      if (typeof nodo[clave] === "number") destino.add(nodo[clave]);
    }
    Object.values(nodo).forEach((v) => recogerPrecios(v, destino));
  }
}

for (const pagina of paginas) {
  const etiqueta = pagina.url;
  if (etiqueta === "/servicios/bot-multicanal/") continue;
  const html = readFileSync(pagina.archivo, "utf8");
  const bloques = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

  if (FUERA_DEL_SITEMAP[etiqueta]) {
    comprobar(bloques.length === 0, `${etiqueta}: es noindex y aun así emite datos estructurados`);
    continue;
  }

  comprobar(bloques.length === 1, `${etiqueta}: emite ${bloques.length} bloques JSON-LD (debe ser 1 con @graph)`);
  if (bloques.length !== 1) continue;

  let grafo;
  try {
    grafo = JSON.parse(bloques[0][1]);
  } catch (error) {
    fallos.push(`${etiqueta}: el JSON-LD no parsea — ${error.message}`);
    continue;
  }

  comprobar(grafo["@context"] === "https://schema.org", `${etiqueta}: falta @context de schema.org`);
  const nodos = grafo["@graph"] ?? [];
  const tipos = nodos.map((n) => n["@type"]);

  // Organización y sitio van en toda página indexable.
  comprobar(tipos.includes("ProfessionalService"), `${etiqueta}: el grafo no incluye la organización`);
  comprobar(tipos.includes("WebSite"), `${etiqueta}: el grafo no incluye el WebSite`);

  for (const tipo of tiposEsperados[etiqueta] ?? []) {
    comprobar(tipos.includes(tipo), `${etiqueta}: falta el nodo ${tipo} en el JSON-LD`);
  }

  // Ninguna referencia puede apuntar a un `@id` que el grafo no define.
  const ids = new Set();
  const refs = new Set();
  recogerIds(nodos, ids);
  recogerReferencias(nodos, refs);
  for (const ref of refs) {
    comprobar(ids.has(ref), `${etiqueta}: el JSON-LD referencia "${ref}", que no existe en el grafo`);
  }

  // Toda URL del marcado tiene que ser absoluta y del dominio.
  const urlsSueltas = JSON.stringify(nodos).match(/"(https?:\/\/[^"]+)"/g) ?? [];
  for (const url of urlsSueltas) {
    const limpia = url.slice(1, -1);
    const externaPermitida =
      limpia.startsWith("https://schema.org") ||
      limpia.startsWith("https://instagram.com") ||
      limpia.startsWith("https://wa.me");
    comprobar(
      externaPermitida || limpia.startsWith(`${DOMINIO}/`),
      `${etiqueta}: el JSON-LD apunta a un dominio inesperado (${limpia})`
    );
  }

  // ── La comprobación que de verdad importa ────────────────────────
  // Cada precio declarado a Google tiene que estar escrito en la página.
  const precios = new Set();
  recogerPrecios(nodos, precios);
  const texto = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  for (const precio of precios) {
    const formateado = `$${precio.toLocaleString("en-US")}`;
    comprobar(
      texto.includes(formateado),
      `${etiqueta}: el JSON-LD declara ${formateado} pero ese precio no aparece en la página`
    );
  }
}

// ───────────────────────────────────────────────────────────────────
console.log(`${paginas.length} páginas · ${enSitemap.length} URLs en el sitemap · ${comprobaciones} comprobaciones\n`);

for (const aviso of avisos) console.log(`  aviso   ${aviso}`);
if (avisos.length) console.log("");

if (fallos.length) {
  console.error(`${fallos.length} fallo(s):\n`);
  for (const fallo of fallos) console.error(`  ✗ ${fallo}`);
  process.exit(1);
}

console.log("Todo correcto.");
