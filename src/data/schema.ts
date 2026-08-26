/**
 * Datos estructurados (schema.org / JSON-LD).
 *
 * Esto es lo que hace que Google entienda que el sitio es una agencia de
 * Panamá, que vende cuatro servicios, a qué precio empieza cada uno y qué
 * preguntas responde — en vez de tener que adivinarlo del texto.
 *
 * ── La regla de siempre, aquí más que en ningún sitio ──────────────
 * **No se escribe ni un precio, ni un nombre, ni un teléfono a mano.** Todo
 * sale de `site.ts` y de `ayuda.ts`. Un dato estructurado que contradice a la
 * página no es un detalle cosmético: Google compara los dos, y cuando no
 * cuadran deja de fiarse del marcado de todo el dominio. Si mañana el plan
 * Emprendedor pasa de $150 a $180, esto cambia solo.
 *
 * ── Cómo se enganchan los nodos ────────────────────────────────────
 * Cada página emite un `@graph` con varios nodos. La organización y el sitio
 * llevan un `@id` estable (`.../#organizacion`, `.../#sitio`) y el resto los
 * referencia con `{ "@id": ... }` en vez de repetir el bloque entero: así
 * Google sabe que el Service de `/servicios/campanas-ads` lo presta la misma
 * empresa que firma la portada, y no dos entidades con el mismo nombre.
 */
import {
  site,
  contacto,
  agenteCrm,
  planesMetaAds,
  planesRedes,
  planesWebNuevos,
  type Plan,
  type WebPlan,
} from "./site";
import { temasAyuda } from "./ayuda";

/** Un nodo JSON-LD. Sin tipar al detalle a propósito: el vocabulario es enorme y cambia. */
export type NodoSchema = Record<string, unknown>;

/**
 * "$1,200" → 1200. El mismo parseo que ya usa `precioDesde()` en `site.ts`:
 * se queda con dígitos y punto decimal, así que se traga el símbolo de dólar,
 * los separadores de miles y textos como "hasta $550 / mes".
 */
function aNumero(precio: string): number {
  return Number(precio.replace(/[^0-9.]/g, ""));
}

function urlAbsoluta(ruta: string, base: URL | string): string {
  return new URL(ruta, base).href;
}

/** `https://juancitoads.com/#organizacion` — el ancla de la empresa. */
export function idOrganizacion(base: URL | string): string {
  return `${urlAbsoluta("/", base)}#organizacion`;
}

/** `https://juancitoads.com/#sitio` — el ancla del sitio web como obra. */
export function idSitio(base: URL | string): string {
  return `${urlAbsoluta("/", base)}#sitio`;
}

/**
 * Rango de precios del catálogo, calculado.
 *
 * Sale del plan más barato y del más caro de los cuatro servicios, no de una
 * cifra escrita a mano que envejecería en cuanto entrara un plan nuevo.
 */
function rangoDePrecios(): string {
  const cifras = [
    ...planesMetaAds.map((p) => aNumero(p.precio)),
    ...planesRedes.map((p) => aNumero(p.precioHasta ?? p.precio)),
    ...planesRedes.map((p) => aNumero(p.precio)),
    ...planesWebNuevos.map((p) => aNumero(p.precio)),
    aNumero(agenteCrm.precio),
  ];
  const min = Math.min(...cifras);
  const max = Math.max(...cifras);
  return `$${min.toLocaleString("en-US")}–$${max.toLocaleString("en-US")}`;
}

/**
 * La empresa.
 *
 * `ProfessionalService` es un subtipo de `LocalBusiness`, que es lo que busca
 * Google para "agencia de marketing digital en Panamá".
 *
 * **La dirección va sin calle a propósito.** No hay oficina publicada en el
 * sitio, y una dirección inventada en el marcado es exactamente el tipo de
 * dato que Google contrasta con Maps y con el resto de la web. Se declara el
 * país (que es cierto y verificable) y el área que se atiende. Si algún día se
 * publica una dirección real, va aquí y en `site.ts` a la vez.
 */
export function organizacion(base: URL | string): NodoSchema {
  const inicio = urlAbsoluta("/", base);
  return {
    "@type": "ProfessionalService",
    "@id": idOrganizacion(base),
    name: site.nombre,
    url: inicio,
    description: site.pitch,
    slogan: site.tagline,
    logo: {
      "@type": "ImageObject",
      url: urlAbsoluta("/logo.png", base),
      caption: site.nombre,
    },
    image: urlAbsoluta("/logo.png", base),
    email: contacto.email,
    // E.164: el mismo número de WhatsApp de `site.ts`, con el `+` delante.
    telephone: `+${contacto.whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "PA",
    },
    areaServed: {
      "@type": "Country",
      name: site.ubicacion,
    },
    sameAs: [contacto.instagramUrl, `https://wa.me/${contacto.whatsappNumber}`],
    priceRange: rangoDePrecios(),
    currenciesAccepted: "USD",
    knowsLanguage: ["es"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+${contacto.whatsappNumber}`,
      email: contacto.email,
      availableLanguage: ["Spanish"],
      areaServed: "PA",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Servicios de ${site.nombre}`,
      itemListElement: catalogo(base),
    },
  };
}

/**
 * Las cuatro puertas de entrada del negocio.
 *
 * ── Por qué el catálogo va sin precios ─────────────────────────────
 * La organización se emite en **todas** las páginas indexables, así que todo lo
 * que se meta aquí viaja también a `/privacidad`, a `/terminos` y al
 * portafolio. Google pide expresamente no marcar contenido que el lector no ve
 * en esa página, y un catálogo con "$150, $450, $295, $899" en la política de
 * privacidad es exactamente eso.
 *
 * Los precios no se pierden: viven en el `Service` de cada página de servicio,
 * donde están escritos en las tarjetas de plan a la vista de cualquiera. Aquí
 * queda lo que sí es cierto en toda página del dominio — qué vende esta empresa
 * y dónde está cada cosa. `scripts/verificar-seo.mjs` comprueba justo esto:
 * cada precio del marcado tiene que aparecer en el texto de su página.
 */
function catalogo(base: URL | string): NodoSchema[] {
  const entradas: Array<{ nombre: string; ruta: string }> = [
    { nombre: "Campañas de anuncios en Meta Ads", ruta: "/servicios/campanas-ads" },
    { nombre: "Campañas + gestión de redes sociales", ruta: "/servicios/campanas-redes" },
    { nombre: "Diseño y desarrollo de páginas web", ruta: "/servicios/paginas-web" },
    { nombre: agenteCrm.nombre, ruta: "/servicios/agente-crm" },
  ];

  return entradas.map((entrada) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: entrada.nombre,
      url: urlAbsoluta(entrada.ruta, base),
      provider: { "@id": idOrganizacion(base) },
    },
    url: urlAbsoluta(entrada.ruta, base),
  }));
}

/** El sitio como obra, para que la organización figure como su editora. */
export function sitioWeb(base: URL | string): NodoSchema {
  return {
    "@type": "WebSite",
    "@id": idSitio(base),
    url: urlAbsoluta("/", base),
    name: site.nombre,
    description: site.pitch,
    inLanguage: "es-PA",
    publisher: { "@id": idOrganizacion(base) },
  };
}

/**
 * Una oferta a partir de un plan.
 *
 * Los planes de campañas y de redes se cobran **por mes** y los de web son
 * **pago único**, así que no pueden marcarse igual: para los mensuales se usa
 * `UnitPriceSpecification` con `unitCode: "MON"` (el código UN/CEFACT de "mes"),
 * que es la forma de decir "$450 al mes" en vez de "$450".
 *
 * Los planes con rango ("desde $450 hasta $550") declaran `minPrice`/`maxPrice`
 * en lugar de un precio cerrado — publicar solo el mínimo como si fuera el
 * precio final es la clase de discrepancia que Search Console marca.
 */
function oferta(
  plan: Plan | WebPlan,
  opciones: { url: string; recurrencia: "mensual" | "unico"; base: URL | string }
): NodoSchema {
  const esPlanDeCampania = "nota" in plan;
  const min = aNumero(plan.precio);
  const max = esPlanDeCampania && plan.precioHasta ? aNumero(plan.precioHasta) : undefined;

  const esRango = Boolean(max && max !== min);

  const especificacion: NodoSchema = {
    "@type": opciones.recurrencia === "mensual" ? "UnitPriceSpecification" : "PriceSpecification",
    priceCurrency: "USD",
    ...(esRango ? { minPrice: min, maxPrice: max } : { price: min }),
    // "MON" es el código UN/CEFACT de mes; `unitText` es lo mismo para un humano.
    ...(opciones.recurrencia === "mensual" ? { unitCode: "MON", unitText: "mes" } : {}),
  };

  return {
    "@type": "Offer",
    name: plan.nombre,
    description: esPlanDeCampania ? plan.descripcion : plan.paraQuien,
    url: opciones.url,
    priceCurrency: "USD",
    /*
      El `price` plano solo se pone cuando el precio es cerrado. En un plan con
      rango ("desde $450 hasta $550") sería una segunda cifra que contradice a
      la especificación, y quien leyera solo el `price` publicaría $450 como si
      fuera el precio final. En esos casos manda `priceSpecification`.

      Tampoco se declara nada sobre impuestos: el sitio no dice hoy si los
      precios llevan ITBMS incluido, y el marcado no es sitio para estrenar una
      condición comercial que no está escrita en `/terminos`.
    */
    ...(esRango ? {} : { price: min }),
    priceSpecification: especificacion,
    availability: "https://schema.org/InStock",
    seller: { "@id": idOrganizacion(opciones.base) },
  };
}

/**
 * Un servicio del catálogo, con todos sus planes como ofertas.
 *
 * `serviceType` es el texto que Google usa para clasificar el servicio; se
 * escribe en castellano porque el sitio y su público lo están.
 */
export function servicio(
  opciones: {
    nombre: string;
    descripcion: string;
    serviceType: string;
    ruta: string;
    planes: readonly (Plan | WebPlan)[];
    recurrencia: "mensual" | "unico";
  },
  base: URL | string
): NodoSchema {
  const url = urlAbsoluta(opciones.ruta, base);
  return {
    "@type": "Service",
    "@id": `${url}#servicio`,
    name: opciones.nombre,
    description: opciones.descripcion,
    serviceType: opciones.serviceType,
    url,
    provider: { "@id": idOrganizacion(base) },
    areaServed: { "@type": "Country", name: site.ubicacion },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: url,
      servicePhone: `+${contacto.whatsappNumber}`,
    },
    offers: opciones.planes.map((plan) => oferta(plan, { url, recurrencia: opciones.recurrencia, base })),
  };
}

/** El Agente CRM: un solo precio cerrado, así que no pasa por `oferta()`. */
export function servicioAgenteCrm(base: URL | string): NodoSchema {
  const url = urlAbsoluta("/servicios/agente-crm", base);
  return {
    "@type": "Service",
    "@id": `${url}#servicio`,
    name: agenteCrm.nombre,
    description: agenteCrm.resumen,
    serviceType: "Asistente conversacional con IA y CRM",
    url,
    provider: { "@id": idOrganizacion(base) },
    areaServed: { "@type": "Country", name: site.ubicacion },
    offers: {
      "@type": "Offer",
      name: agenteCrm.nombre,
      url,
      price: aNumero(agenteCrm.precio),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: { "@id": idOrganizacion(base) },
    },
  };
}

/**
 * Las migas de pan de una ruta hija.
 *
 * No las pinta ninguna página (el navbar ya dice dónde estás): existen para que
 * Google enseñe "juancitoads.com › Servicios › Campañas de anuncios" bajo el
 * título del resultado, en vez de la URL cruda.
 */
export function migasDePan(
  ruta: Array<{ nombre: string; ruta: string }>,
  base: URL | string
): NodoSchema {
  return {
    "@type": "BreadcrumbList",
    itemListElement: ruta.map((paso, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: paso.nombre,
      item: urlAbsoluta(paso.ruta, base),
    })),
  };
}

/**
 * Un bloque de preguntas frecuentes.
 *
 * Sirve para las dos páginas que las tienen: `/ayuda` (los cuatro temas de
 * `ayuda.ts`) y `/servicios/paginas-web` (las seis de su propia sección).
 *
 * Las respuestas de `/ayuda` guardan HTML sencillo con enlaces relativos
 * (`/cotizador`), que Google acepta en `acceptedAnswer.text` — pero un enlace
 * relativo dentro de un dato estructurado no tiene página desde la que
 * resolverse, así que se absolutizan antes de emitirlos.
 *
 * **Qué esperar de esto, sin adornos:** desde 2023 Google reserva el resultado
 * enriquecido de FAQ (el acordeón bajo el resultado) para sitios de gobierno y
 * salud, así que aquí no va a dibujar nada. Se marca igualmente porque sigue
 * siendo la forma de decirle qué pregunta responde cada trozo de la página —
 * que es lo que usa para elegir fragmentos— y porque Bing sí lo dibuja.
 */
export function preguntasFrecuentes(
  opciones: {
    ruta: string;
    preguntas: ReadonlyArray<{ pregunta: string; respuesta: string; slug?: string }>;
  },
  base: URL | string
): NodoSchema {
  const url = urlAbsoluta(opciones.ruta, base);
  const inicio = urlAbsoluta("/", base).replace(/\/$/, "");
  const absolutizar = (html: string) => html.replace(/href="\/(?!\/)/g, `href="${inicio}/`);

  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: "es-PA",
    isPartOf: { "@id": idSitio(base) },
    mainEntity: opciones.preguntas.map((item) => ({
      "@type": "Question",
      ...(item.slug ? { "@id": `${url}#${item.slug}` } : {}),
      name: item.pregunta,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: absolutizar(item.respuesta),
        ...(item.slug ? { url: `${url}#${item.slug}` } : { url }),
      },
    })),
  };
}

/** Las 27 preguntas de `/ayuda`, aplanadas desde sus cuatro temas. */
export function paginaFaq(base: URL | string): NodoSchema {
  return preguntasFrecuentes(
    {
      ruta: "/ayuda",
      preguntas: temasAyuda.flatMap((tema) => tema.preguntas),
    },
    base
  );
}
