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
      "Creación de contenido publicitario con IA",
      "Configuración completa de la campaña",
      "Seguimiento semanal y optimización",
      "Reporte básico mensual",
      "100% remoto",
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
      "Creación de contenido publicitario con IA",
      "Campaña optimizada con segmentación avanzada",
      "Seguimiento cada 2 días y optimización continua",
      "Reporte mensual detallado",
      "100% remoto",
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
      "Creación de contenido publicitario con IA",
      "Múltiples campañas activas + retargeting",
      "Seguimiento diario y optimización constante",
      "Reporte mensual detallado + reunión de resultados",
      "100% remoto",
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
      "Creación de contenido publicitario con IA",
      "Estrategia completa + múltiples campañas + retargeting",
      "Seguimiento diario y optimización avanzada",
      "Reporte mensual premium + reunión estratégica mensual",
      "100% remoto",
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
      "1 red social (Instagram)",
      "1 post diario creado con IA",
      "Campañas publicitarias básicas en Meta",
      "1 visita presencial al mes",
      "100% remoto",
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
      "2 redes sociales (Instagram y Facebook)",
      "2 posts diarios — IA + contenido real",
      "Campañas estratégicas activas en Meta",
      "Conexión con creadores de contenido e influencers",
      "1 visita presencial al mes para producción",
      "Reporte mensual de resultados",
      "100% remoto",
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
      "3 redes sociales (Instagram, Facebook y TikTok)",
      "4 posts diarios — IA + contenido real",
      "Reels promocionales con presentador incluido",
      "Acceso a red de creadores e influencers",
      "Locuciones profesionales para anuncios",
      "Múltiples campañas avanzadas + retargeting",
      "Estrategia mensual personalizada + reporte",
      "2 visitas presenciales al mes",
      "100% remoto",
    ],
    whatsappMensaje: "Hola Juancito Ads, me interesa el plan Escala. Quisiera más información.",
  },
];

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

export interface PortafolioImagen {
  src: string;
  alt: string;
}

export const portafolioImagenes: PortafolioImagen[] = [
  { src: "/images/imagen-feria-01.jpeg", alt: "Portafolio Juancito Ads — contenido creado con IA para feria comercial" },
  { src: "/images/imagen-panales-01.png", alt: "Portafolio Juancito Ads — contenido creado con IA para pañalera" },
  { src: "/images/imagen-tienda-01.jpeg", alt: "Portafolio Juancito Ads — contenido creado con IA para tienda" },
];

export const portafolioVideos: string[] = [
  "/videos/video-01.mp4",
  "/videos/video-02.mp4",
  "/videos/video-03.mp4",
  "/videos/video-04.mp4",
];
