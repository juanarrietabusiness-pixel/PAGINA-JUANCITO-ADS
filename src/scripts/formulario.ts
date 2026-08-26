/**
 * Envía los formularios del sitio a la Netlify Function `formulario`, que los
 * reparte por correo con Resend.
 *
 * Se engancha a cualquier `<form data-resend="nombre">` de la página, donde el
 * nombre tiene que coincidir con una clave de `FORMULARIOS` en
 * `netlify/functions/formulario.ts`.
 *
 * Red de seguridad, y es la parte importante de este archivo: los formularios
 * conservan su `data-netlify="true"`. Si no hay JavaScript, si la función se cae
 * o si devuelve un 5xx, el navegador manda el formulario por la vía nativa y el
 * dato queda guardado en Netlify Forms igual que antes. Un aviso de error bonito
 * no vale nada si el cliente se pierde por el camino.
 */
const ENDPOINT = "/.netlify/functions/formulario";

const ERROR_GENERICO =
  "No pudimos enviar el mensaje. Revisa los datos e inténtalo otra vez, o escríbenos por WhatsApp.";

function conectarFormulario(form: HTMLFormElement) {
  const nombre = form.dataset.resend;
  if (!nombre) return;

  const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const errorEl = form.querySelector<HTMLElement>("[data-form-error]");
  const exitoEl = form.parentElement?.querySelector<HTMLElement>("[data-form-exito]") ?? null;
  const textoBoton = boton?.textContent ?? "Enviar";
  let enviando = false;

  function mostrarError(mensaje: string) {
    if (!errorEl) return;
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const datos = new FormData(form);
    const campos: Record<string, string> = {};
    for (const [clave, valor] of datos.entries()) {
      // `form-name` y `bot-field` son de Netlify Forms: no son datos del cliente.
      if (typeof valor !== "string" || clave === "form-name" || clave === "bot-field") continue;
      campos[clave] = valor;
    }

    const honeypot = datos.get("bot-field");

    enviando = true;
    if (errorEl) errorEl.hidden = true;
    if (boton) {
      boton.disabled = true;
      boton.textContent = "Enviando…";
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulario: nombre,
          campos,
          "bot-field": typeof honeypot === "string" ? honeypot : "",
        }),
      });

      if (res.ok) {
        form.hidden = true;
        if (exitoEl) {
          exitoEl.hidden = false;
          exitoEl.focus();
        }
        return;
      }

      // 5xx = el problema es nuestro: que lo recoja Netlify Forms antes de perderlo.
      if (res.status >= 500) {
        form.submit();
        return;
      }

      mostrarError(ERROR_GENERICO);
    } catch {
      // Sin respuesta de la función (red caída, función dormida): misma red de seguridad.
      form.submit();
      return;
    } finally {
      enviando = false;
      if (boton) {
        boton.disabled = false;
        boton.textContent = textoBoton;
      }
    }
  });
}

document.querySelectorAll<HTMLFormElement>("form[data-resend]").forEach(conectarFormulario);
