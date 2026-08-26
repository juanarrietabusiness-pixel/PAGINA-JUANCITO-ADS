import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

/*
  ── El dominio ─────────────────────────────────────────────────────
  `site` no es decoración: de aquí salen el `<link rel="canonical">`, las
  `og:url` y todas las URLs del sitemap. Estuvo en `juancitoads.netlify.app`
  hasta el 2026-08-26, que es lo que le decía a Google "la versión buena de esta
  página vive en netlify.app" — con el dominio comprado y ya apuntando a
  Netlify, eso era regalarle la autoridad al subdominio de la plataforma.

  Comprobado antes de cambiarlo (no leído del roadmap, que iba atrasado):
  `juancitoads.com` resuelve a 75.2.60.5 (balanceador de Netlify) y
  `www.juancitoads.com` es un CNAME a `juancitoads.netlify.app`.

  Si algún día el dominio cambia, se cambia **aquí y solo aquí**: robots.txt,
  sitemap, canonicals y los datos estructurados lo leen de `Astro.site`.
*/
export default defineConfig({
  site: "https://juancitoads.com",

  integrations: [
    sitemap({
      /*
        Dos rutas se quedan fuera del sitemap, y por motivos distintos:

        - `/smartlink` es el enlace de la bio de Instagram y TikTok. Lleva
          `noindex` a propósito (ver punto 14 del roadmap) y anunciarla en el
          sitemap sería pedirle a Google justo lo contrario de lo que dice la
          etiqueta. Ojo: **no** se bloquea en robots.txt — si se bloqueara el
          rastreo, Google no podría leer el `noindex` y la URL podría acabar
          listada igualmente.
        - `/servicios/bot-multicanal` no es una página, es la redirección 301 al
          Agente CRM. Un sitemap con URLs que redirigen es una advertencia en
          Search Console.
      */
      filter: (page) =>
        !page.includes("/smartlink") && !page.includes("/servicios/bot-multicanal"),

      /*
        `changefreq` y `priority` son pistas, no órdenes: Google dice
        abiertamente que las ignora. Se declaran igual porque otros buscadores
        (Bing entre ellos) sí las miran, y no cuestan nada. `lastmod` sí lo usa
        todo el mundo, y ahí va la fecha del build: en un sitio estático es la
        última vez que la página pudo cambiar de verdad.
      */
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // La portada y el cotizador son las dos puertas de entrada del negocio.
        if (item.url === "https://juancitoads.com/") item.priority = 1.0;
        else if (item.url.includes("/cotizador")) item.priority = 0.9;
        else if (item.url.includes("/servicios")) item.priority = 0.8;
        // Legales: existen y se indexan, pero no compiten por nada.
        else if (item.url.includes("/privacidad") || item.url.includes("/terminos")) {
          item.priority = 0.3;
          item.changefreq = "yearly";
        }
        return item;
      },
    }),
  ],

  /*
    El cuarto servicio se llamó "Bot multicanal" hasta el 2026-08-26 y vivía en
    /servicios/bot-multicanal. Esa ruta estuvo publicada en el footer y la
    recomendaba el chatbot, así que al renombrarlo a Agente CRM la vieja no se
    borra: queda como redirección.

    Esta es solo una de las dos capas, y la de menos peso. En build estático
    Astro genera aquí un fichero con un meta-refresh: sirve para que la ruta
    siga viva en `npm run dev` y `npm run preview` —y para que el verificador de
    Playwright pueda comprobarla—, pero para Google un refresco HTML no es lo
    mismo que un 301.

    El 301 de verdad está en `public/_redirects`, que solo entiende Netlify. Va
    con `!` (forzado) porque en Netlify un fichero existente gana a una regla de
    redirección, y este bloque genera justo ese fichero. **Las dos van juntas:
    si se quita una, se quita la otra.**
  */
  redirects: {
    "/servicios/bot-multicanal": "/servicios/agente-crm",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
