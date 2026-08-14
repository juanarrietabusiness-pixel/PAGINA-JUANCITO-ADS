/**
 * Destinos del navbar y del cajón móvil.
 *
 * Viven aquí y no dentro de los componentes porque los pintan dos sitios
 * distintos (`NavBar.astro` y `MobileDrawer.astro`) y hasta ahora había que
 * acordarse de tocar los dos: era cuestión de tiempo que el menú de escritorio
 * y el del teléfono dejaran de coincidir.
 *
 * **Ojo con el número de enlaces:** el menú de escritorio aparece a partir de
 * `lg` y con seis destinos más el CTA ya va justo. Un séptimo no cabe — habría
 * que quitar uno o mandar el CTA al cajón.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const navLinks: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/portafolio", label: "Portafolio" },
  { href: "/ayuda", label: "Ayuda" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * ¿Este enlace corresponde a la página que se está viendo?
 *
 * Antes el navbar pintaba "Cotizador" de naranja fijo en todas las páginas, y
 * el color de acento se leía como "estás aquí": quien entraba a la portada
 * creía estar en el cotizador. Ahora el resaltado lo decide la ruta.
 *
 * Las dos rutas se normalizan quitando la barra final, porque `/servicios` y
 * `/servicios/` son la misma página y Astro puede generar cualquiera de las dos
 * formas según la configuración de `trailingSlash`.
 *
 * Una ruta hija marca a su padre (`/servicios/campanas-ads` resalta
 * "Servicios"), salvo la portada: `/` es prefijo de todo y si se tratara igual
 * quedaría siempre encendida.
 */
export function esRutaActiva(href: string, pathname: string): boolean {
  const limpia = (r: string) => (r.length > 1 ? r.replace(/\/$/, "") : r);
  const actual = limpia(pathname);
  const destino = limpia(href);

  if (destino === "/") return actual === "/";
  return actual === destino || actual.startsWith(`${destino}/`);
}
