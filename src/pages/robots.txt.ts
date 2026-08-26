import type { APIRoute } from "astro";

/**
 * robots.txt generado en el build, no escrito a mano en `public/`.
 *
 * El motivo es la última línea: la URL del sitemap tiene que ser absoluta, así
 * que un fichero estático obligaría a escribir el dominio a mano y a acordarse
 * de cambiarlo el día que el dominio cambie. Aquí sale de `Astro.site`
 * (`astro.config.mjs`), que ya es la fuente única del dominio para los
 * canonicals, las `og:url` y el propio sitemap.
 *
 * ── Por qué no hay ningún `Disallow` ───────────────────────────────
 * La única página que no debe salir en Google es `/smartlink`, y ya lleva
 * `<meta name="robots" content="noindex, nofollow">`. Bloquearla además aquí
 * sería contraproducente: `Disallow` impide **rastrear**, no indexar, y un
 * robot que no puede entrar tampoco puede leer el `noindex` — Google la
 * listaría igualmente, sin descripción y sin forma de quitarla. Para sacar una
 * página del índice, se deja entrar y se le enseña el `noindex`.
 *
 * El fichero se sirve en `/robots.txt` porque el nombre de la ruta incluye la
 * extensión (`robots.txt.ts` → `/robots.txt`).
 */
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error(
      "Falta `site` en astro.config.mjs: sin dominio no se puede escribir la URL absoluta del sitemap en robots.txt."
    );
  }

  // `@astrojs/sitemap` genera un índice que apunta a los ficheros reales
  // (`sitemap-0.xml`, ...). Se anuncia el índice, no las partes.
  const sitemapURL = new URL("sitemap-index.xml", site);

  const cuerpo = [
    "# Juancito Ads — https://juancitoads.com",
    "# Este fichero lo genera el build desde src/pages/robots.txt.ts",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemapURL.href}`,
    "",
  ].join("\n");

  return new Response(cuerpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
