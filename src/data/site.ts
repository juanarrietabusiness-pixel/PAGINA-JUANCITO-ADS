export const site = {
  nombre: "Juancito Ads",
  tagline: "Campañas potenciadas con Inteligencia Artificial",
  pitch:
    "Campañas de Meta Ads que traen clientes, redes que no se quedan quietas y sitios web listos para vender.",
  ubicacion: "Panamá",
  anio: 2026,
} as const;

/**
 * Cifras del negocio. Van aquí porque salen en el hero, en el footer y en el
 * conocimiento del chatbot: si el número cambia, cambia en los tres a la vez.
 * Solo entran datos reales y verificables — una métrica inflada es lo primero
 * que un cliente comprueba.
 */
export const metricas = {
  inversionGestionada: "+$40,000",
  inversionGestionadaDetalle: "en pauta publicitaria gestionada para negocios en Panamá",
} as const;

export const contacto = {
  whatsappNumber: "50765969428",
  whatsappDisplay: "+507 6596-9428",
  email: "juanarrietabusiness@gmail.com",
  instagram: "@juancitoads",
  instagramUrl: "https://instagram.com/juancitoads",
};

export function waLink(mensaje: string): string {
  return `https://wa.me/${contacto.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
}

export interface ProblemaItem {
  icono: "circle-dollar-sign" | "clock" | "bar-chart-3";
  color: "red" | "amber" | "blue";
  problema: string;
  solucion: string;
}

export const problemas: ProblemaItem[] = [
  {
    icono: "circle-dollar-sign",
    color: "red",
    problema: '"Inviertes en publicidad sin ver resultados"',
    solucion: "Campañas con objetivo claro, donde la IA ajusta segmentación y presupuesto para maximizar tu ROI",
  },
  {
    icono: "clock",
    color: "amber",
    problema: '"No tienes tiempo para manejar tus redes"',
    solucion: "Nosotros lo hacemos por ti. Tú te enfocas en tu negocio",
  },
  {
    icono: "bar-chart-3",
    color: "blue",
    problema: '"No sabes si tu publicidad está funcionando"',
    solucion: "Reportes mensuales claros, con IA optimizando la campaña en tiempo real según los resultados",
  },
];

export interface Resultado {
  icono: "store" | "glasses" | "package";
  badge: string;
  titulo: string;
  descripcion: string;
}

export const resultados: Resultado[] = [
  {
    icono: "store",
    badge: "5X en ventas",
    titulo: "Retail y Servicio en Panamá",
    descripcion:
      "Aumento de facturación del 50% al 400% en el primer año con campañas dirigidas e IA aplicada a cada anuncio.",
  },
  {
    icono: "glasses",
    badge: "Resultados inmediatos",
    titulo: "Ópticas en Panamá",
    descripcion:
      "Agenda completamente llena desde el primer mes de publicidad. Mensajes sin parar. Resultados en menos de 2 semanas.",
  },
  {
    icono: "package",
    badge: "Problema resuelto",
    titulo: "Empresa con inventario estancado",
    descripcion:
      "Aumentó ventas y limpió inventario en tiempo récord con campañas de IA dirigidas al cliente correcto.",
  },
];

/** Rango de precio en dólares. `min === max` cuando el precio es exacto. */
export interface Money {
  min: number;
  max: number;
}

export interface Plan {
  /** Identificador estable — el cotizador referencia los planes por aquí, nunca por nombre. */
  slug: string;
  nombre: string;
  descripcion: string;
  desde?: boolean;
  precio: string;
  precioHasta?: string;
  nota: string;
  features: string[];
  destacado?: boolean;
  whatsappMensaje: string;
}

export const planesMetaAds: Plan[] = [
  {
    slug: "emprendedor",
    nombre: "Emprendedor",
    descripcion: "Para el emprendedor que da su primer paso en Meta",
    precio: "$150",
    nota: "Presupuesto de ads va aparte",
    features: [
      "Presupuesto ads recomendado: $100–$250",
      "Estrategia centrada en ventas",
      "Creación de contenido publicitario con IA",
      "Configuración completa de la campaña",
      "Seguimiento semanal y optimización",
      "Reporte básico mensual",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Emprendedor. Quisiera más información.",
  },
  {
    slug: "negocio",
    nombre: "Negocio",
    descripcion: "Para negocios que ya invierten y quieren mejores resultados",
    precio: "$250",
    nota: "Presupuesto de ads va aparte",
    destacado: true,
    features: [
      "Presupuesto ads recomendado: $300–$600",
      "Estrategia centrada en ventas",
      "Creación de contenido publicitario con IA",
      "Multicampaña optimizada con segmentación avanzada",
      "Seguimiento cada 2 días y optimización continua",
      "Reporte mensual detallado",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Negocio. Quisiera más información.",
  },
  {
    slug: "empresa",
    nombre: "Empresa",
    descripcion: "Para empresas que invierten en serio y quieren escalar",
    precio: "$400",
    nota: "Presupuesto de ads va aparte",
    features: [
      "Presupuesto ads recomendado: $700–$2,000",
      "Estrategia avanzada centrada en ventas",
      "Creación de contenido publicitario con IA",
      "Creación de Reels estratégicos",
      "Múltiples campañas activas + retargeting",
      "Seguimiento diario y optimización constante",
      "Reporte mensual detallado + reunión de resultados",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Empresa. Quisiera más información.",
  },
  {
    slug: "corporativo",
    nombre: "Corporativo",
    descripcion: "Para empresas con inversión publicitaria alta y múltiples objetivos",
    precio: "$600",
    nota: "Presupuesto de ads va aparte",
    features: [
      "Presupuesto ads recomendado: $2,000–$5,000+",
      "Estrategia avanzada centrada en ventas",
      "Creación de contenido publicitario con IA",
      "Reels estratégicos + múltiples campañas + retargeting",
      "Seguimiento diario y optimización avanzada",
      "Reporte mensual premium + reunión estratégica mensual",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Corporativo. Quisiera más información.",
  },
];

export const planesRedes: Plan[] = [
  {
    slug: "arranque",
    nombre: "Arranque",
    descripcion: "Para negocios que quieren empezar a construir su presencia digital",
    desde: true,
    precio: "$450",
    precioHasta: "hasta $550 / mes",
    nota: "Presupuesto de ads va aparte",
    features: [
      "2 redes sociales (Instagram y Facebook)",
      "Plan de calendario completo — 1 post diario de lunes a domingo",
      "Post, Reels y carruseles creados con IA",
      "Campañas publicitarias básicas en Meta",
      "1 jornada de producción/grabación al mes",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Arranque. Quisiera más información.",
  },
  {
    slug: "crecimiento",
    nombre: "Crecimiento",
    descripcion: "Para negocios listos para crecer con contenido y publicidad",
    desde: true,
    precio: "$600",
    precioHasta: "hasta $800 / mes",
    nota: "Presupuesto de ads va aparte",
    destacado: true,
    features: [
      "3 redes sociales (Instagram, Facebook y TikTok básico)",
      "Plan de calendario completo — 2 posts diarios de lunes a domingo",
      "Post, Reels y carruseles — IA + contenido real",
      "Campañas estratégicas activas en Meta",
      "Conexión con creadores de contenido e influencers",
      "2 jornadas de producción/grabación al mes",
      "Reporte mensual de resultados",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Crecimiento. Quisiera más información.",
  },
  {
    slug: "escala",
    nombre: "Escala",
    descripcion: "Para negocios establecidos que quieren dominar su mercado",
    desde: true,
    precio: "$900",
    precioHasta: "hasta $1,200 / mes",
    nota: "Presupuesto de ads va aparte",
    features: [
      "3 redes sociales (Instagram, Facebook y TikTok avanzado)",
      "Calendario robusto centrado en ventas — 4 posts diarios de lunes a domingo",
      "Post, Reels y carruseles — IA + contenido real",
      "Reels promocionales con presentador incluido",
      "Estrategia avanzada de TikTok viral",
      "Acceso a red de creadores e influencers",
      "Locuciones profesionales para anuncios",
      "Múltiples campañas avanzadas + retargeting",
      "Estrategia mensual personalizada + reporte",
      "4 jornadas de producción/grabación al mes",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Escala. Quisiera más información.",
  },
];

/**
 * Precio de entrada de una familia de planes, ya formateado.
 *
 * Existe para que la etiqueta "Desde $X" de `/servicios` y de la portada salga
 * del mismo array que pinta las tarjetas de precio, y no de un número escrito a
 * mano que se queda viejo en cuanto cambia el plan más barato. Se calcula sobre
 * el precio, no sobre el orden del array: reordenar los planes no lo altera.
 */
export function precioDesde(planes: readonly Plan[]): string {
  const minimo = Math.min(...planes.map((p) => Number(p.precio.replace(/[^0-9.]/g, ""))));
  return `$${minimo.toLocaleString("en-US")}`;
}

export interface WebPlan {
  /** Identificador estable — el cotizador referencia los planes por aquí, nunca por nombre. */
  slug: string;
  nombre: string;
  precio: string;
  paraQuien: string;
  features: string[];
  entrega: string;
  destacado?: boolean;
}

export const planesWebNuevos: WebPlan[] = [
  {
    slug: "start",
    nombre: "Juancito Start",
    precio: "$295",
    paraQuien: "Ideal para arrancar.",
    features: [
      "Página única profesional (4–5 secciones)",
      "100 % responsive (se ve perfecto en celular)",
      "SEO básico para aparecer en Google",
      "Formulario de contacto → WhatsApp",
      "Google Analytics",
      "Dominio + hosting + SSL el primer año"
    ],
    entrega: "72 horas"
  },
  {
    slug: "launch",
    nombre: "Juancito Launch",
    precio: "$450",
    paraQuien: "El más pedido para captar clientes.",
    features: [
      "Página única premium con diseño 100 % a medida (7 secciones)",
      "Todo lo de Start +",
      "SEO on-page completo",
      "Optimización de velocidad (PageSpeed 90+)",
      "Video-tutorial de tu sitio",
      "30 días de soporte"
    ],
    entrega: "4–5 días"
  },
  {
    slug: "corporate",
    nombre: "Juancito Corporate",
    precio: "$850",
    paraQuien: "Para empresas que quieren gestionar su propio contenido.",
    destacado: true,
    features: [
      "Hasta 10 páginas, diseño a medida",
      "Panel autogestionable: edita tus textos, imágenes y blog sin depender de un programador",
      "Blog integrado",
      "SEO técnico completo",
      "Google Maps + integraciones",
      "3 correos corporativos",
      "Dominio + hosting + SSL el primer año",
      "Capacitación en vivo + 45 días de soporte"
    ],
    entrega: "8–12 días"
  },
  {
    slug: "commerce",
    nombre: "Juancito Commerce",
    precio: "$1,200",
    paraQuien: "Tu tienda en línea, lista para vender.",
    features: [
      "Todo lo de Corporate +",
      "Catálogo con control de inventario",
      "Carrito de compras",
      "Pagos con Yappy, tarjeta y PayPal",
      "Panel de pedidos",
      "Cuentas de cliente",
      "Carga de hasta 50 productos",
      "60 días de soporte"
    ],
    entrega: "15–20 días"
  }
];

/**
 * Mantenimiento mensual (Juancito Care).
 *
 * `mensual` es el mismo número de `precio`, pero ya en formato calculable: lo
 * consume el cotizador para sumar. Si cambia el precio, cambian los dos campos
 * a la vez — están uno al lado del otro justamente para que no se desincronicen.
 */
export interface PlanCare {
  slug: string;
  nombre: string;
  precio: string;
  mensual: Money;
  desde?: boolean;
  detalles: string;
}

export const planesCare: PlanCare[] = [
  {
    slug: "base",
    nombre: "Care Base",
    precio: "$35",
    mensual: { min: 35, max: 35 },
    detalles: "hosting, dominio, SSL, monitoreo, respaldos y 1 hora de cambios al mes.",
  },
  {
    slug: "pro",
    nombre: "Care Pro",
    precio: "$75",
    mensual: { min: 75, max: 75 },
    detalles: "todo lo de Base + SEO continuo + reporte mensual + respuesta en menos de 24 h + 3 horas de cambios.",
  },
  {
    slug: "business",
    nombre: "Care Business",
    precio: "desde $150",
    mensual: { min: 150, max: 150 },
    desde: true,
    detalles: "todo lo de Pro + soporte prioritario (respuesta en menos de 4 h) + gestión avanzada + 6–8 horas de cambios.",
  },
];

/**
 * Servicios que se suman a un plan web: complementos y desarrollos a medida.
 *
 * `precio` es el texto que se muestra en `/servicios/paginas-web`; `unico` y
 * `mensual` son ese mismo precio en números para que el cotizador pueda sumarlo.
 * Un extra puede tener las dos cosas (el chatbot: una implementación y una
 * mensualidad). `desde` marca los que son un piso, no una cifra cerrada.
 */
export interface Extra {
  id: string;
  item: string;
  precio: string;
  unico?: Money;
  mensual?: Money;
  desde?: boolean;
}

export const complementos: Extra[] = [
  { id: "copy", item: "Redacción de textos que venden", precio: "desde $60/página", unico: { min: 60, max: 60 }, desde: true },
  { id: "idioma", item: "Segundo idioma", precio: "desde $180", unico: { min: 180, max: 180 }, desde: true },
  {
    id: "chatbot",
    item: "Chatbot con IA (atención automática 24/7)",
    precio: "desde $350 + $25/mes",
    unico: { min: 350, max: 350 },
    mensual: { min: 25, max: 25 },
    desde: true,
  },
  { id: "seo", item: "SEO técnico + contenido continuo", precio: "desde $120/mes", mensual: { min: 120, max: 120 }, desde: true },
  { id: "migracion", item: "Migración desde WordPress", precio: "desde $250", unico: { min: 250, max: 250 }, desde: true },
  { id: "pasarela", item: "Pasarela de pago adicional", precio: "$150", unico: { min: 150, max: 150 } },
];

export const solucionesMedida: Extra[] = [
  { id: "login", item: "Inicio de sesión y usuarios", precio: "desde $450", unico: { min: 450, max: 450 }, desde: true },
  { id: "panel", item: "Panel administrativo / dashboard", precio: "desde $650", unico: { min: 650, max: 650 }, desde: true },
  { id: "reservas", item: "Sistema de reservas o citas", precio: "desde $600", unico: { min: 600, max: 600 }, desde: true },
  { id: "portal", item: "Portal de clientes", precio: "desde $750", unico: { min: 750, max: 750 }, desde: true },
  { id: "automatizacion", item: "Automatización con IA / WhatsApp", precio: "desde $250", unico: { min: 250, max: 250 }, desde: true },
];

/**
 * Agente CRM — el asistente que contesta por ti, con panel de clientes.
 *
 * Es el único servicio del catálogo que no es ni publicidad ni una web, y por
 * eso va aparte de `planesMetaAds`, `planesRedes` y `planesWebNuevos`:
 * no se cobra por mes como las campañas ni se entrega en días de diseño como
 * un sitio. Meterlo en cualquiera de los tres arrays obligaría a poner
 * asteriscos en todos los demás planes.
 *
 * ── El nombre ──────────────────────────────────────────────────────
 * Se llamó "Bot multicanal" hasta el 2026-08-26. El nombre describía el canal
 * y no el trabajo: lo que se entrega no es solo un contestador, es también el
 * panel donde queda apuntado cada cliente nuevo con lo que preguntó. La ruta
 * vieja (`/servicios/bot-multicanal`) sigue viva como redirección en
 * `astro.config.mjs`, porque estuvo publicada en el footer y en el chat.
 *
 * ── Los costes de terceros van publicados, no en letra chica ───────
 * El cliente paga aparte el alojamiento del agente y la llave de la IA que lo
 * mueve. Son gastos suyos, a nombre suyo, y no los cobra Juancito Ads. Se
 * publican con el mismo peso que el precio porque a $899 la primera pregunta
 * de cualquiera es "¿dónde está la trampa?", y un coste que aparece después de
 * firmar siempre se resuelve en contra de quien lo calló.
 *
 * Si cambia el precio o el plazo, se cambia **aquí**: lo consumen la página de
 * servicios, el footer y el conocimiento del chatbot.
 */
export const agenteCrm = {
  slug: "agente-crm",
  nombre: "Agente CRM",
  precio: "$899",
  nota: "Pago único",
  entrega: "5–7 días",
  /** Periodo de ajustes tras la entrega, incluido en el precio. */
  ajustes: "14 días",
  /** Tope de contenido que se le carga de entrada, para que el alcance sea medible. */
  topePreguntas: 30,
  resumen:
    "Un asistente que contesta por WhatsApp, Instagram, Messenger y Telegram a cualquier hora, con un panel donde ves cada conversación y cada cliente nuevo.",
  canales: ["WhatsApp", "Instagram", "Messenger", "Telegram"],
  incluye: [
    "Contesta a cualquier hora, también domingos y de madrugada",
    "Responde con tus precios, horarios y políticas — no con lo que se imagina",
    "Entiende las notas de voz que te mandan",
    "Te pasa la conversación cuando el cliente pide una persona",
    "Apunta a cada quien pregunta, con su canal y lo que buscaba",
    "Se calla en cuanto respondes tú, y no te pisa",
    "Panel propio para ver todas las conversaciones en un solo sitio",
  ],
  /**
   * Lo que NO cubre el precio. Va publicado a propósito.
   *
   * Dos formas del mismo dato, y las dos escritas a mano: la larga para
   * explicarlo y la corta para enumerarla dentro de una frase. La corta existe
   * porque derivarla de la larga con `.toLowerCase()` convertía "la llave de la
   * IA" en "la llave de la ia" — una sigla no sobrevive a una transformación
   * automática de mayúsculas. Es la misma regla que ya estaba anotada para los
   * datos de contacto: si un dato necesita varias representaciones, se escriben
   * todas, no se calculan.
   */
  costesAparte: [
    "El alojamiento del agente, que se paga a su proveedor y queda a tu nombre",
    "La llave de la IA que lo mueve, también a tu nombre y con tu consumo",
  ],
  costesAparteCorto: ["el alojamiento del agente", "la llave de la IA"],
  whatsappMensaje:
    "Hola Juancito Ads, me interesa el Agente CRM de $899. ¿Me cuentas cómo funciona?",
} as const;

export interface Testimonio {
  texto: string;
  autor: string;
  contexto: string;
  icono: "glasses" | "calendar-check" | "package";
}

export const testimonios: Testimonio[] = [
  {
    texto:
      "Desde que empezamos a trabajar con Juancito Ads, los mensajes no paran. Nuestra agenda de citas está completamente llena y seguimos recibiendo consultas todos los días.",
    autor: "Cliente verificado",
    contexto: "Óptica — Ciudad de Panamá",
    icono: "glasses",
  },
  {
    texto:
      "En las primeras dos semanas de publicidad ya teníamos la agenda llena. No esperábamos resultados tan rápido. Fue una sorpresa muy grata.",
    autor: "Cliente verificado",
    contexto: "Óptica — Panamá",
    icono: "calendar-check",
  },
  {
    texto:
      "Teníamos mercancía estancada que no lograba moverse. Después de arrancar las campañas, las ventas aumentaron y pudimos limpiar el inventario más rápido de lo esperado.",
    autor: "Cliente verificado",
    contexto: "Pañalera — Panamá",
    icono: "package",
  },
];

/**
 * Sitios web reales construidos por Juancito Ads.
 *
 * Son proyectos en producción y la URL es pública: cualquiera puede abrirla y
 * comprobar que existe. Por eso no hay métricas inventadas aquí — el enlace ES
 * la prueba. `rubro` agrupa la tarjeta por tipo de negocio y `stack` dice qué
 * se construyó, que es lo que un cliente que mira el portafolio quiere saber.
 *
 * Las capturas viven en `public/portafolio/webs/` y son de la portada real del
 * sitio. Si un cliente rediseña su web, se reemplaza la captura aquí y ya.
 */
export interface SitioWeb {
  slug: string;
  nombre: string;
  url: string;
  /** Dominio limpio para mostrar, sin protocolo ni barra final. */
  dominio: string;
  rubro: string;
  descripcion: string;
  stack: string[];
  imagen: string;
  alt: string;
}

export const sitiosWeb: SitioWeb[] = [
  {
    slug: "stemflow",
    nombre: "StemFlow",
    url: "https://play.bukoflow.com/",
    dominio: "play.bukoflow.com",
    rubro: "Plataforma / SaaS",
    descripcion:
      "Plataforma de streaming de stems espaciales: el oyente mueve cada instrumento en un escenario 3D en tiempo real.",
    stack: ["App web", "Audio en 3D", "Suscripciones"],
    imagen: "/portafolio/webs/stemflow.webp",
    alt: "Portada de StemFlow, plataforma de música en tres dimensiones construida por Juancito Ads",
  },
  {
    slug: "livesync-pro",
    nombre: "LiveSync Pro",
    url: "https://livesyncpro.com/",
    dominio: "livesyncpro.com",
    rubro: "Software técnico",
    descripcion:
      "Suite de ingeniería en la nube para cálculo de física avanzada, drift térmico y gestión de equipos de trabajo.",
    stack: ["Sitio corporativo", "Licencias", "Portal de empresas"],
    imagen: "/portafolio/webs/livesync-pro.webp",
    alt: "Portada de LiveSync Pro, suite de ingeniería en la nube construida por Juancito Ads",
  },
  {
    slug: "acustica-superior",
    nombre: "Acústica Superior",
    url: "https://acusticasuperior.com/",
    dominio: "acusticasuperior.com",
    rubro: "Servicios · Panamá",
    descripcion:
      "Sitio de una empresa de acústica arquitectónica en Panamá, con catálogo de proyectos y cotización directa por WhatsApp.",
    stack: ["Sitio corporativo", "Galería de proyectos", "Cotización"],
    imagen: "/portafolio/webs/acustica-superior.webp",
    alt: "Portada de Acústica Superior, empresa panameña de tratamiento acústico, construida por Juancito Ads",
  },
  {
    slug: "bukoflow-store",
    nombre: "BukoFlow Store",
    url: "https://tienda.bukoflow.com/",
    dominio: "tienda.bukoflow.com",
    rubro: "Tienda en línea",
    descripcion:
      "Tienda de beats con licencias inmediatas: catálogo con reproductor, carrito y entrega automática tras la compra.",
    stack: ["E-commerce", "Catálogo con reproductor", "Pagos en línea"],
    imagen: "/portafolio/webs/bukoflow-store.webp",
    alt: "Portada de BukoFlow Store, tienda de beats en línea construida por Juancito Ads",
  },
  {
    slug: "baby-caleb",
    nombre: "Baby Caleb",
    url: "https://babycaleb.netlify.app/",
    dominio: "babycaleb.netlify.app",
    rubro: "Retail · Panamá",
    descripcion:
      "Catálogo de pañales y wipes hipoalergénicos con pedido directo por WhatsApp, pensado para convertir desde el celular.",
    stack: ["Catálogo", "Pedido por WhatsApp", "Landing de producto"],
    imagen: "/portafolio/webs/baby-caleb.webp",
    alt: "Portada de Baby Caleb, catálogo de productos para bebé construido por Juancito Ads",
  },
  {
    slug: "feria-del-lente",
    nombre: "Feria del Lente",
    url: "https://feriadellente.netlify.app/",
    dominio: "feriadellente.netlify.app",
    rubro: "Salud visual · Panamá",
    descripcion:
      "Óptica con más de 28 años en Panamá: agendamiento de cita en línea y una sección aparte para convenios de empresa.",
    stack: ["Agenda de citas", "Portal de empresas", "Landing de campaña"],
    imagen: "/portafolio/webs/feria-del-lente.webp",
    alt: "Portada de Feria del Lente, óptica en Panamá, construida por Juancito Ads",
  },
];

/*
  Las tres gráficas que vivían aquí (`portafolioImagenes`) salieron del
  portafolio a pedido del cliente. No se borraron del sitio: siguen en
  `public/portafolio/creativos/` y ahora se usan de una en una, grandes y junto
  al texto que explican, vía `SeccionMedia.astro` — `tienda-01` en la portada,
  `feria-01` en campañas de Ads y `panales-01` en campañas + redes. Como cada
  una lleva ahí su propio alt escrito para su contexto, no tiene sentido
  mantener además una lista genérica.
*/

/**
 * Videos de campaña.
 *
 * `orientacion` es un dato del archivo, medido en la cabecera del MP4, no una
 * suposición: `video-01` es 1080×1920 (un reel vertical) y los otros tres son
 * 1920×1080. La parrilla anterior los metía a los cuatro en la misma caja 16:9
 * con `object-cover`, así que del reel vertical solo se veía la banda central
 * —sin principio ni final del encuadre— y la sección entera parecía cuatro
 * recortes iguales. Cada uno se pinta ahora con su proporción real.
 *
 * **Al añadir un video hay que mirar sus dimensiones reales** y poner la
 * orientación que le toca; si se pone la que no es, vuelve el recorte.
 */
export interface PortafolioVideo {
  src: string;
  orientacion: "vertical" | "horizontal";
  /** Formato tal como se etiqueta en la tarjeta. */
  formato: string;
}

export const portafolioVideos: PortafolioVideo[] = [
  { src: "/videos/video-01.mp4", orientacion: "vertical", formato: "Reel" },
  { src: "/videos/video-02.mp4", orientacion: "horizontal", formato: "Video" },
  { src: "/videos/video-03.mp4", orientacion: "horizontal", formato: "Video" },
  { src: "/videos/video-04.mp4", orientacion: "horizontal", formato: "Video" },
];
