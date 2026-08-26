import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://juancitoads.netlify.app",

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
