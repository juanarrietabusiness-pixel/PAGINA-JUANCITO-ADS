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
    solucion: "Campañas estratégicas con objetivo claro y ROI medible con IA",
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
    solucion: "Reportes mensuales con resultados reales y análisis de IA",
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

export interface Plan {
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

export interface WebSubplan {
  nombre: string;
  precio: string;
  features: string[];
}

export const planWeb = {
  descripcion:
    "Tu negocio necesita una presencia profesional en internet. Creamos tu página web con diseño moderno, optimizada para celular y lista para recibir clientes — potenciada con Inteligencia Artificial.",
  desde: "$149",
  hasta: "hasta $499 pago único",
  whatsappMensaje: "Hola Juancito Ads, me interesa una Página Web para mi negocio. Quisiera más información.",
  subplanes: [
    {
      nombre: "Básica",
      precio: "$149",
      features: ["1 página", "Hosting gratuito", "Botón WhatsApp", "Entrega en 48hrs"],
    },
    {
      nombre: "Profesional",
      precio: "$299",
      features: ["Hasta 3 secciones", "Dominio + Hosting", "Formulario contacto", "Google Maps"],
    },
    {
      nombre: "Premium",
      precio: "$499",
      features: ["Página completa", "Dominio + Hosting", "SEO + Testimonios", "3 meses mantenimiento"],
    },
  ] as WebSubplan[],
};

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
