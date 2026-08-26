# Resend — configuración paso a paso

> Qué consigue esto: que cada formulario enviado desde el sitio llegue como **correo a la
> bandeja del negocio en el momento**, en vez de quedarse esperando en el panel de Netlify
> Forms a que alguien entre a mirarlo.
>
> El código ya está hecho y desplegado con el sitio (`netlify/functions/formulario.ts`).
> Lo único que falta es lo que no se puede hacer desde el repositorio: crear la llave en
> Resend y pegarla en Netlify. Son los pasos 1 a 5.

---

## Cómo encajan las tres piezas

```
Visitante rellena el formulario
        │
        ▼
JavaScript del sitio  ──POST──►  Netlify Function `formulario`
(src/scripts/formulario.ts)      (netlify/functions/formulario.ts)
        │                                │
        │                                └──► API de Resend ──► correo a la bandeja
        │
        └── si falla lo anterior ──► Netlify Forms (red de seguridad, sigue activa)
```

**GitHub → Netlify** ya está conectado desde el 2026-07-20: cada `push` a `main` dispara un
deploy, y ese deploy publica también la función. No hay que subir nada a mano.

**Netlify → Resend** es lo que se configura aquí: la función necesita una llave de API para
poder pedirle a Resend que envíe el correo.

---

## Paso 1 — Comprobar que el dominio está verificado en Resend

1. Entra en <https://resend.com/domains>.
2. Busca `juancitoads.com` en la lista y mira la etiqueta de estado:
   - **Verified** (verde) → listo, sigue al paso 2.
   - **Pending** / **Not started** → faltan los registros DNS. Resend muestra una tabla con
     3 o 4 registros (uno `MX`, uno `TXT` de SPF, uno `TXT` de DKIM y opcionalmente el de
     DMARC). Hay que copiarlos a GoDaddy, que es donde vive el DNS de este dominio:
     <https://dcc.godaddy.com> → dominio `juancitoads.com` → **DNS** → **Agregar registro**.
     - En GoDaddy el campo **Nombre** va **sin el dominio**: si Resend pide
       `resend._domainkey.juancitoads.com`, en GoDaddy se escribe solo `resend._domainkey`.
       Si pide el registro para el dominio raíz, se escribe `@`.
     - Después vuelve a Resend y pulsa **Verify DNS Records**. Suele tardar entre 5 minutos
       y una hora.

> **Esto no tiene nada que ver con el punto pendiente del dominio.** El registro `A` de
> `juancitoads.com` sigue apuntando a GoDaddy en vez de a Netlify (ver el punto 21 del
> roadmap en `CLAUDE.md`), y da igual: Resend solo mira los registros `MX`/`TXT`, así que el
> correo funciona aunque la web todavía se sirva desde `juancitoads.netlify.app`. Son dos
> cosas independientes y se pueden resolver en cualquier orden.

**Apunta qué dominio verificaste exactamente**, porque decide el paso 4:

| Lo que verificaste en Resend | Remitente que hay que usar |
| --- | --- |
| `juancitoads.com` | `formularios@juancitoads.com` ← el que ya trae el código por defecto |
| `send.juancitoads.com` (u otro subdominio) | `formularios@send.juancitoads.com` ← hay que declararlo en `RESEND_FROM` |

La dirección de remitente **no tiene que existir como buzón**. Nadie va a leer el correo que
llegue ahí; solo tiene que pertenecer al dominio verificado.

---

## Paso 2 — Crear la llave de API en Resend

1. Entra en <https://resend.com/api-keys>.
2. Pulsa **Create API Key**.
3. Rellena:
   - **Name:** `netlify-juancitoads` (es solo una etiqueta para reconocerla después).
   - **Permission:** **Sending access** — *no* uses "Full access". La función solo envía
     correos; con permiso de envío basta, y si alguna vez se filtra, no sirve para tocar
     dominios ni para leer nada.
   - **Domain:** `juancitoads.com` (si el desplegable lo permite, restringe la llave a ese
     dominio).
4. Pulsa **Add**. Aparece una cadena que empieza por `re_`.
5. **Cópiala ahora.** Resend la enseña una sola vez; si cierras el diálogo sin copiarla, hay
   que borrar la llave y crear otra (no pasa nada, es gratis).

---

## Paso 3 — Pegar la llave en Netlify

1. Entra en <https://app.netlify.com/projects/juancitoads>.
2. Menú lateral: **Site configuration** → **Environment variables**.
3. Pulsa **Add a variable** → **Add a single variable** y rellena:

   | Campo | Valor |
   | --- | --- |
   | **Key** | `RESEND_API_KEY` |
   | **Values** | la cadena `re_...` del paso 2 |
   | **Scopes** | *All scopes* (déjalo como viene) |
   | **Deploy contexts** | *Same value for all deploy contexts* |

   Si Netlify ofrece la casilla **Contains secret values**, márcala: oculta el valor en el
   panel y en los logs.
4. Pulsa **Create variable**.

> **La clave se escribe tal cual: `RESEND_API_KEY`.** Sin prefijo `PUBLIC_`. Ese prefijo es
> lo que hace que Astro meta una variable dentro del JavaScript que descarga el navegador —
> una llave de API ahí queda a la vista de cualquiera que abra el inspector. Es la misma
> regla que ya sigue `GROQ_API_KEY` para el chatbot.

---

## Paso 4 — Las dos variables opcionales

Se añaden igual que en el paso 3. **Las dos son opcionales**: si no las creas, el código usa
un valor por defecto. No son secretos, así que no hace falta marcarlas como tales.

| Key | Para qué sirve | Si no la creas |
| --- | --- | --- |
| `RESEND_FROM` | Remitente del correo. Formato: `Juancito Ads <formularios@juancitoads.com>` — con el nombre fuera y la dirección entre `< >`. | Se usa `Juancito Ads <formularios@juancitoads.com>` |
| `RESEND_TO` | Bandeja que recibe los avisos. | Se usa el correo de `src/data/site.ts`, hoy `juanarrietabusiness@gmail.com` |

**Crea `RESEND_FROM` sí o sí si en Resend verificaste un subdominio** (`send.juancitoads.com`
y parecidos). Si no, Resend rechazará cada envío con un 403 y el correo no saldrá nunca.

**Crea `RESEND_TO`** si quieres que los avisos lleguen a otra bandeja (por ejemplo
`hola@juancitoads.com`) sin tocar el código. También acepta que se cambie más adelante sin
volver a desplegar nada del repositorio.

---

## Paso 5 — Volver a desplegar

Las variables de entorno se inyectan **en el momento del deploy**: si no vuelves a desplegar,
la función sigue ejecutándose sin ver la llave nueva.

1. En Netlify: **Deploys** → botón **Trigger deploy** → **Deploy site**.
2. Espera a que el deploy quede en verde (**Published**), un par de minutos.

---

## Paso 6 — Comprobar que funciona

1. Abre <https://juancitoads.netlify.app/contacto> (o `juancitoads.com` cuando el DNS apunte
   a Netlify).
2. Rellena el formulario con datos reales tuyos y envíalo.
3. Tres sitios donde mirar, en este orden:
   - **La bandeja de destino.** El correo llega en segundos, con asunto
     `Nuevo contacto: <nombre> — <negocio>` y un botón naranja para responder por WhatsApp.
     Si no aparece, mira **spam** la primera vez.
   - **<https://resend.com/emails>** — el registro de todo lo que Resend ha enviado, con su
     estado (`Delivered`, `Bounced`…). Si aquí aparece el envío, el problema es de la bandeja,
     no del sitio.
   - **Netlify → Logs → Functions → `formulario`** — si aquí no hay ninguna línea, el
     formulario ni siquiera llamó a la función.

### Si algo falla

La función nunca le enseña el detalle del error al visitante (diría cosas como qué dominio no
está verificado). El detalle va al log de Netlify, con el prefijo `[formulario]`.

| Lo que ves | Qué significa | Cómo se arregla |
| --- | --- | --- |
| En el log: `Falta RESEND_API_KEY` | La variable no está, está mal escrita, o no se volvió a desplegar | Repasa los pasos 3 y 5 |
| En el log: `Resend respondió 403` | El remitente no pertenece a un dominio verificado | Paso 4: crea `RESEND_FROM` con el dominio correcto |
| En el log: `Resend respondió 422` | El formato del remitente o del `reply_to` es inválido | El formato tiene que ser `Nombre <correo@dominio>` |
| El navegador se va a una página de "Gracias" genérica de Netlify | La función devolvió un 5xx y saltó la red de seguridad | El dato **no se perdió**: está en Netlify → **Forms**. Mira el log para ver por qué falló |
| No llega nada y el log está vacío | El visitante no tenía JavaScript, o falló la red | El dato está en Netlify → **Forms** |

---

## Probarlo en local antes de tocar producción (opcional)

`npm run dev` **no** ejecuta las funciones. Para eso:

1. Copia la llave en el `.env` local (ese archivo no se sube al repositorio):

   ```bash
   RESEND_API_KEY=re_tu_llave
   RESEND_TO=tu_correo_personal@gmail.com   # para no llenar la bandeja real de pruebas
   ```

2. Levanta Astro y las funciones juntos:

   ```bash
   npx netlify dev
   ```

3. Abre <http://localhost:8888/contacto> y envía el formulario.

> Mientras el dominio no esté verificado, Resend deja enviar desde `onboarding@resend.dev`,
> pero **solo al correo con el que abriste la cuenta**. Sirve para probar el circuito:
> `RESEND_FROM=Juancito Ads <onboarding@resend.dev>` y `RESEND_TO=<tu correo de Resend>`.

---

## Qué se toca cuando cambie algo

| Si cambia… | Se edita… |
| --- | --- |
| La bandeja que recibe los avisos | `RESEND_TO` en Netlify (o `contacto.email` en `src/data/site.ts` si es el correo público del sitio) |
| El remitente | `RESEND_FROM` en Netlify |
| Los campos de un formulario | El `.astro` **y** la lista blanca `FORMULARIOS` de `netlify/functions/formulario.ts` — un campo que no esté en esa lista no viaja en el correo |
| Aparece un formulario nuevo | Añádele `data-resend="nombre"`, un `<p data-form-error hidden>` dentro y un `<div data-form-exito hidden>` al lado, y da de alta ese `nombre` en `FORMULARIOS` |

Y una nota para `/privacidad`: Resend es un tercero nuevo que trata datos de contacto. Ya está
añadido a la lista de terceros de esa página; si mañana entra otro, se actualiza ahí en el
mismo commit (regla del punto 13 del roadmap).
