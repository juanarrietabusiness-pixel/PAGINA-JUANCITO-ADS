/**
 * Estructura del footer.
 *
 * Vive aquí y no dentro del componente para respetar la regla del proyecto: el
 * contenido se edita en un solo sitio. El componente solo lo pinta.
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Servicios",
    links: [
      { label: "Campañas de Ads", href: "/servicios/campanas-ads" },
      { label: "Campañas + Redes", href: "/servicios/campanas-redes" },
      { label: "Páginas web", href: "/servicios/paginas-web" },
      { label: "Agente CRM", href: "/servicios/agente-crm" },
      { label: "Mantenimiento (Care)", href: "/servicios/paginas-web#care" },
      { label: "Cotizador", href: "/cotizador" },
    ],
  },
  {
    title: "Agencia",
    links: [
      { label: "Qué hacemos", href: "/servicios" },
      { label: "Portafolio", href: "/portafolio" },
      { label: "Ayuda", href: "/ayuda" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Términos del servicio", href: "/terminos" },
    ],
  },
];

/**
 * Certezas del negocio que conviene repetir al pie. Cada una sale de algo que
 * el sitio ya promete en otra página — aquí no se estrena ninguna promesa.
 */
export const footerTrust: string[] = [
  "El presupuesto de anuncios es tuyo y va aparte",
  "Reporte de resultados todos los meses",
  "El código de tu web queda en tu GitHub",
];
