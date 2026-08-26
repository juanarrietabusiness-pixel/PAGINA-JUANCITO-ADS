import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://juancitoads.netlify.app",

  /*
    El cuarto servicio se llamó "Bot multicanal" hasta el 2026-08-26 y vivía en
    /servicios/bot-multicanal. Esa ruta estuvo publicada en el footer y la
    recomendaba el chatbot, así que al renombrarlo a Agente CRM la vieja no se
    borra: queda como redirección. En build estático Astro genera una página de
    refresco con su <link rel="canonical"> al destino, de modo que ni un enlace
    guardado ni Google acaban en un 404.
  */
  redirects: {
    "/servicios/bot-multicanal": "/servicios/agente-crm",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
