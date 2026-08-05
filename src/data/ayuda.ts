/**
 * Preguntas frecuentes de /ayuda.
 *
 * Viven aquí y no dentro de la página por la misma razón que el resto de datos
 * del proyecto: el contenido se edita en un sitio, el componente solo lo pinta.
 *
 * Regla al escribir una respuesta: **no se estrena ninguna promesa aquí.** Cada
 * respuesta tiene que poder rastrearse a algo que el sitio ya dice en otro lado
 * — la página del plan, `/terminos`, `/privacidad` o el cotizador. Si una
 * respuesta necesita una condición comercial nueva, primero se decide y se
 * escribe en `/terminos`, y luego se refleja aquí. Si no, la página de ayuda
 * termina contradiciendo al contrato, que es el peor sitio donde tener una
 * discrepancia.
 *
 * Los precios NO se escriben a mano: se interpolan desde `site.ts` en la página
 * que consume estos datos cuando hace falta citarlos.
 */

export interface Pregunta {
  /** Ancla estable para poder enlazar a una pregunta concreta (`/ayuda#slug`). */
  slug: string;
  pregunta: string;
  /** HTML simple (`<p>`, `<ul>`, `<strong>`, `<a>`). Se pinta con set:html. */
  respuesta: string;
}

export interface TemaAyuda {
  slug: string;
  titulo: string;
  /** Una línea que dice de qué va el bloque, para orientar antes de abrir nada. */
  resumen: string;
  icono: "compass" | "wallet" | "hammer" | "life-buoy";
  preguntas: Pregunta[];
}

export const temasAyuda: TemaAyuda[] = [
  {
    slug: "antes-de-empezar",
    titulo: "Antes de empezar",
    resumen: "Qué hacemos, para quién sirve y cómo arranca un proyecto.",
    icono: "compass",
    preguntas: [
      {
        slug: "que-hacen",
        pregunta: "¿Qué hace exactamente Juancito Ads?",
        respuesta: `<p>Tres cosas, y se pueden contratar por separado o juntas:</p>
          <ul>
            <li><strong>Campañas de Meta Ads</strong> — publicidad en Instagram y Facebook: estrategia, creación de los anuncios, configuración, seguimiento y reportes.</li>
            <li><strong>Campañas + gestión de redes</strong> — todo lo anterior más el contenido diario de tus perfiles. Este plan ya incluye la pauta de Meta, no hay que sumarlo aparte.</li>
            <li><strong>Páginas web</strong> — sitios a medida, desde una landing hasta una tienda en línea con pagos.</li>
          </ul>
          <p>Si no tienes claro cuál te toca, el <a href="/cotizador">cotizador</a> te lo dice en un minuto sin que tengas que escribirle a nadie.</p>`,
      },
      {
        slug: "tipo-de-negocio",
        pregunta: "¿Sirve para mi tipo de negocio?",
        respuesta: `<p>Trabajamos sobre todo con negocios que venden a consumidor final en Panamá: retail, ópticas, salud, servicios a domicilio, tiendas en línea. También hemos hecho sitios para plataformas y software.</p>
          <p>La pregunta que de verdad importa no es el rubro, es si puedes atender la demanda que llegue. Si las campañas funcionan y no hay quién conteste los mensajes, el dinero se pierde igual. Eso lo hablamos antes de arrancar, no después.</p>`,
      },
      {
        slug: "primer-paso",
        pregunta: "¿Cuál es el primer paso?",
        respuesta: `<p>Una conversación corta por WhatsApp para entender tu negocio, qué has intentado antes y qué quieres lograr. De ahí sale una <strong>propuesta escrita</strong> con el alcance exacto, el cronograma y el precio.</p>
          <p>El trabajo arranca cuando esa propuesta está aceptada. Antes de eso no hay ningún compromiso ni cobro.</p>`,
      },
      {
        slug: "cotizador-exacto",
        pregunta: "¿La cifra del cotizador es el precio final?",
        respuesta: `<p>No: es una <strong>estimación</strong>, y está pensada para que sepas el orden de magnitud antes de hablar con nadie. La cifra firme es siempre la de la propuesta escrita.</p>
          <p>Dicho eso, el cotizador no inventa precios: compone la estimación con los mismos precios publicados en las páginas de cada plan. Si tu caso es estándar, la propuesta se va a parecer mucho.</p>`,
      },
      {
        slug: "requisitos",
        pregunta: "¿Qué necesitan de mí para empezar?",
        respuesta: `<p>Depende del servicio, pero en general:</p>
          <ul>
            <li>Accesos a las cuentas que haga falta (página de Facebook, Instagram, administrador comercial).</li>
            <li>Material de tu negocio: logo, fotos, información de productos o servicios y precios.</li>
            <li>Respuesta a las revisiones en un plazo razonable.</li>
          </ul>
          <p>Los plazos publicados cuentan desde que tenemos todo eso. Si falta algo que depende de tu lado, el plazo se pausa — no corre en contra tuya ni nuestra.</p>`,
      },
      {
        slug: "cuentas-a-mi-nombre",
        pregunta: "¿Las cuentas y perfiles quedan a mi nombre?",
        respuesta: `<p>Siempre. La cuenta publicitaria, la página y los perfiles son tuyos y quedan a tu nombre. Nosotros trabajamos <strong>con acceso, no con propiedad</strong>.</p>
          <p>Si algún día dejamos de trabajar juntos, no tienes que recuperar nada ni pedirnos permiso: ya era tuyo.</p>`,
      },
      {
        slug: "presencial",
        pregunta: "¿Trabajan de forma presencial?",
        respuesta: `<p>La operación del día a día es a distancia, que es lo que permite responder rápido sin cuadrar agendas.</p>
          <p>Los planes de <a href="/servicios/campanas-redes">campañas + redes</a> incluyen visitas presenciales al mes para producción de contenido — una en Arranque y Crecimiento, dos en Escala.</p>`,
      },
    ],
  },
  {
    slug: "precio-y-pagos",
    titulo: "Precio y pagos",
    resumen: "Cuánto cuesta, qué incluye cada precio y cómo se paga.",
    icono: "wallet",
    preguntas: [
      {
        slug: "presupuesto-ads-aparte",
        pregunta: "¿El precio del plan incluye el dinero de la publicidad?",
        respuesta: `<p><strong>No, y es la condición más importante de todas.</strong> El precio del plan cubre nuestro trabajo: estrategia, creación de anuncios, configuración, seguimiento, optimización y reportes.</p>
          <p>El dinero que se invierte en la pauta lo pagas tú directamente a Meta, con tu propio método de pago. Nunca pasa por nosotros.</p>
          <p>Ejemplo: el plan Negocio cuesta $250 al mes y recomendamos entre $300 y $600 de pauta. Ese mes gastarías entre $550 y $850 en total, de los cuales $250 son nuestros y el resto es de Meta.</p>`,
      },
      {
        slug: "cuanto-pauta",
        pregunta: "¿Cuánto debo invertir en pauta?",
        respuesta: `<p>Cada plan trae un rango recomendado, basado en lo que suele hacer falta para que la campaña rinda en ese nivel. <strong>Son recomendaciones, no mínimos obligatorios</strong>: el presupuesto lo decides y lo controlas tú, y lo puedes subir o bajar cuando quieras.</p>
          <p>Lo que sí conviene entender: por debajo del rango sugerido la campaña tarda más en encontrar a tu cliente, porque el algoritmo necesita un volumen mínimo de datos para aprender.</p>`,
      },
      {
        slug: "formas-de-pago",
        pregunta: "¿Cómo se paga?",
        respuesta: `<p>Aceptamos <strong>Yappy, tarjeta y PayPal</strong>.</p>
          <ul>
            <li><strong>Planes mensuales</strong> (campañas, campañas + redes, mantenimiento Care): por adelantado al inicio de cada ciclo mensual.</li>
            <li><strong>Páginas web:</strong> 50 % por adelantado para reservar el cupo y arrancar, y el 50 % restante a la entrega, antes de publicar y de transferirte el repositorio.</li>
          </ul>`,
      },
      {
        slug: "itbms",
        pregunta: "¿Los precios incluyen ITBMS?",
        respuesta: `<p>Los precios de desarrollo web publicados en el sitio <strong>no incluyen ITBMS</strong>. Se suma en la propuesta y en la factura.</p>`,
      },
      {
        slug: "permanencia",
        pregunta: "¿Hay contrato de permanencia?",
        respuesta: `<p>No. Los planes mensuales se renuevan mes a mes y no tienen permanencia.</p>
          <p>Para no renovar basta avisarnos antes de que cierre el ciclo en curso. El ciclo que ya está pagado se completa con normalidad y no se prorratea.</p>`,
      },
      {
        slug: "cambiar-de-plan",
        pregunta: "¿Puedo cambiar de plan más adelante?",
        respuesta: `<p>Sí, y es lo normal. Mucha gente arranca en un plan pequeño para ver cómo responde su negocio y sube cuando la demanda lo pide. El cambio aplica desde el siguiente ciclo mensual.</p>`,
      },
      {
        slug: "que-pasa-si-cancelo-web",
        pregunta: "¿Y si cancelo un proyecto web a mitad?",
        respuesta: `<p>El adelanto del 50 % cubre el trabajo ya realizado y no se reembolsa. Es la contrapartida de que ese adelanto reserva el cupo de producción y el trabajo ya se hizo.</p>
          <p>Si la cancelación ocurre antes de empezar, no hay ningún problema: se devuelve.</p>`,
      },
      {
        slug: "dominio-hosting",
        pregunta: "¿El dominio y el hosting están incluidos?",
        respuesta: `<p>El <strong>primer año</strong> sí: dominio, hosting y certificado SSL vienen incluidos en los planes web, tal como se detalla en cada uno.</p>
          <p>A partir del segundo año son una renovación anual. La puedes pagar tú directamente al proveedor, o dejarla cubierta con un plan <a href="/servicios/paginas-web#care">Juancito Care</a>, que además incluye monitoreo, respaldos y horas de cambios.</p>`,
      },
    ],
  },
  {
    slug: "durante-el-proyecto",
    titulo: "Durante el proyecto",
    resumen: "Plazos, revisiones, cómo se trabaja y cómo nos comunicamos.",
    icono: "hammer",
    preguntas: [
      {
        slug: "cuanto-tarda",
        pregunta: "¿Cuánto tarda mi página web?",
        respuesta: `<p>Depende del plan: desde <strong>72 horas</strong> una página única (Start) hasta <strong>15–20 días</strong> una tienda en línea completa (Commerce). El plazo de cada plan está publicado en <a href="/servicios/paginas-web">su página</a>.</p>
          <p>Ese reloj empieza a correr cuando tenemos todo tu material, no cuando se firma la propuesta. Es la causa número uno de retrasos, y por eso lo repetimos.</p>`,
      },
      {
        slug: "cuando-veo-resultados",
        pregunta: "¿Cuándo empiezo a ver resultados en las campañas?",
        respuesta: `<p>Las primeras señales suelen aparecer en la primera o segunda semana. Los casos de ópticas que mostramos en el <a href="/portafolio">portafolio</a> llenaron agenda en menos de dos semanas.</p>
          <p>Ahora, la parte honesta: <strong>ninguna agencia puede garantizar un número concreto de ventas o mensajes.</strong> El resultado depende también de tu oferta, tus precios y tu capacidad de atender lo que llegue. Lo que sí garantizamos es que vas a ver los números reales, no una versión maquillada.</p>`,
      },
      {
        slug: "revisiones",
        pregunta: "¿Puedo pedir cambios mientras se construye?",
        respuesta: `<p>Sí, las revisiones son parte del proceso y están contempladas en el plazo. Lo que sí mueve la fecha es un cambio de alcance — pasar de una landing a un sitio de diez páginas a mitad de camino, por ejemplo. En ese caso lo hablamos y se ajusta la propuesta antes de seguir.</p>`,
      },
      {
        slug: "comunicacion",
        pregunta: "¿Cómo nos comunicamos durante el proyecto?",
        respuesta: `<p>Por WhatsApp, que es donde la gente de verdad contesta. Sin portales ni tickets que nadie abre.</p>
          <p>En campañas, además, hay reporte mensual escrito; los planes Empresa y Corporativo incluyen reunión de resultados.</p>`,
      },
      {
        slug: "quien-hace-el-contenido",
        pregunta: "¿Quién crea el contenido de los anuncios?",
        respuesta: `<p>Nosotros. Los creativos publicitarios se generan con IA y se ajustan a tu marca — imágenes, variaciones de texto y ángulos distintos para probar cuál rinde mejor.</p>
          <p>En los planes de <a href="/servicios/campanas-redes">campañas + redes</a> se mezcla con contenido real: visitas presenciales para producción, reels con presentador y locuciones profesionales en el plan Escala.</p>`,
      },
      {
        slug: "reportes",
        pregunta: "¿Qué me van a reportar?",
        respuesta: `<p>Un reporte mensual con lo que se invirtió, lo que se obtuvo y qué se cambió en la campaña y por qué. En lenguaje normal, no en jerga de plataforma.</p>
          <p>La frecuencia de <em>seguimiento</em> sí cambia por plan: semanal en Emprendedor, cada dos días en Negocio, diario en Empresa y Corporativo.</p>`,
      },
    ],
  },
  {
    slug: "despues-de-la-entrega",
    titulo: "Después de la entrega",
    resumen: "Soporte, propiedad del código, mantenimiento y qué pasa si te vas.",
    icono: "life-buoy",
    preguntas: [
      {
        slug: "codigo-es-mio",
        pregunta: "¿El código de mi web es mío?",
        respuesta: `<p>Sí. Al finalizar y liquidar el proyecto <strong>transferimos el repositorio a tu cuenta de GitHub</strong>. Sin ataduras y sin licencias que te obliguen a quedarte con nosotros.</p>
          <p>Es la diferencia con las plataformas de alquiler mensual: si un día decides irte, te llevas el sitio entero y cualquier programador puede continuarlo.</p>`,
      },
      {
        slug: "soporte-incluido",
        pregunta: "¿Cuánto soporte incluye mi plan?",
        respuesta: `<p>Cada plan web trae su propia ventana después de la entrega: 15 días en Start, 30 en Launch, 45 en Corporate y 60 en Commerce. Corporate incluye además capacitación en vivo para que manejes tu panel.</p>
          <p>Dentro de esa ventana, cualquier error o ajuste está cubierto sin costo extra.</p>`,
      },
      {
        slug: "despues-del-soporte",
        pregunta: "¿Y cuando se acaba esa ventana de soporte?",
        respuesta: `<p>Dos caminos: contratar un plan <a href="/servicios/paginas-web#care">Juancito Care</a> (desde $35 al mes: hosting, dominio, SSL, monitoreo, respaldos y horas de cambios incluidas), o cotizar los cambios puntuales cuando surjan.</p>
          <p>No es obligatorio. Una web estática y bien hecha puede vivir mucho tiempo sin tocarse — Care es para quien prefiere no ocuparse de eso nunca.</p>`,
      },
      {
        slug: "editar-yo-mismo",
        pregunta: "¿Puedo editar mi web yo mismo?",
        respuesta: `<p>Con los planes <strong>Corporate</strong> y <strong>Commerce</strong>, sí: incluyen panel autogestionable para cambiar textos, imágenes, blog y productos sin depender de un programador, más capacitación en vivo para aprender a usarlo.</p>
          <p>Start y Launch no traen panel: los cambios se piden y los hacemos nosotros. Si sabes desde ya que vas a querer actualizar contenido seguido, conviene ir directo a Corporate.</p>`,
      },
      {
        slug: "si-dejo-campanas",
        pregunta: "Si dejo de trabajar con ustedes, ¿pierdo mis campañas?",
        respuesta: `<p>No. La cuenta publicitaria, los públicos, el píxel y el historial son tuyos y viven en tu propia cuenta. Nosotros solo perdemos el acceso.</p>
          <p>Lo que sí desaparece es la optimización continua: una campaña sin nadie que la revise se degrada con las semanas.</p>`,
      },
      {
        slug: "portafolio-privacidad",
        pregunta: "¿Van a mostrar mi proyecto en su portafolio?",
        respuesta: `<p>Salvo que nos pidas lo contrario por escrito, sí podemos mostrarlo. Es lo que permite que veas los trabajos de otros antes de contratarnos.</p>
          <p>Si prefieres que tu proyecto no aparezca, basta decirlo y no aparece. En los casos de resultados que publicamos, además, omitimos el nombre del cliente por defecto.</p>`,
      },
    ],
  },
];
