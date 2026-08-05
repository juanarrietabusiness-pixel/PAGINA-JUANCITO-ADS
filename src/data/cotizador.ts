/**
 * Motor del cotizador.
 *
 * Todo lo que hay aquí se deriva de `site.ts`: este archivo NO inventa precios,
 * los compone. Si cambia el precio de un plan, de un complemento o del
 * mantenimiento, el cotizador se actualiza solo.
 *
 * Es lógica pura, sin nada del DOM, para que la use tal cual el render de Astro
 * (los pasos y las etiquetas de precio se pintan en el build) y el script del
 * navegador (que importa este mismo módulo). Un cotizador que diga un número
 * distinto al de /servicios destruye justo la confianza que el sitio vende.
 *
 * Diferencia con un cotizador de web a secas: aquí conviven pagos únicos
 * (la página web y sus extras) con mensualidades (gestión de campañas, redes,
 * mantenimiento, chatbot). Por eso todo se lleva en DOS totales separados y
 * nunca se suman entre sí.
 */
import {
  complementos,
  planesCare,
  planesMetaAds,
  planesRedes,
  planesWebNuevos,
  solucionesMedida,
  type Extra,
  type Money,
  type Plan,
  type PlanCare,
  type WebPlan,
} from "./site";

/* ------------------------------------------------------------------ *
 * Dinero
 * ------------------------------------------------------------------ */

export const CERO: Money = { min: 0, max: 0 };

export const esCero = (m: Money): boolean => m.min === 0 && m.max === 0;

export const sumar = (a: Money, b: Money): Money => ({ min: a.min + b.min, max: a.max + b.max });

/** `{min:295,max:295}` → "$295" · `{min:450,max:550}` → "$450 – $550" */
export function formatMoney(m: Money): string {
  const f = (n: number) => `$${n.toLocaleString("en-US")}`;
  return m.min === m.max ? f(m.min) : `${f(m.min)} – ${f(m.max)}`;
}

/** Añade el "Desde" solo cuando la cifra es un piso y no un precio cerrado. */
export function formatPrecio(m: Money, desde = false): string {
  return desde ? `Desde ${formatMoney(m)}` : formatMoney(m);
}

/** "$1,200" → {min:1200,max:1200} · "desde $250" → {min:250,max:250} */
export function parsePrecio(texto: string): Money {
  const nums = texto.replace(/,/g, "").match(/\d+(\.\d+)?/g)?.map(Number) ?? [0];
  return { min: nums[0]!, max: nums[nums.length - 1]! };
}

/**
 * Mensualidad de un plan de campañas.
 *
 * Los planes de redes se publican como rango ("$450" + "hasta $550 / mes"): el
 * mínimo sale de `precio` y el máximo de `precioHasta`. Cotizar solo el mínimo
 * de un plan que se vende como rango sería prometer el piso y facturar el techo.
 */
export function mensualidadPlan(plan: Plan): Money {
  const base = parsePrecio(plan.precio);
  if (!plan.precioHasta) return base;
  return { min: base.min, max: parsePrecio(plan.precioHasta).max };
}

export const precioWeb = (plan: WebPlan): Money => parsePrecio(plan.precio);

/* ------------------------------------------------------------------ *
 * Familias de planes
 * ------------------------------------------------------------------ */

export type Familia = "ads" | "redes" | "web";

/** De menor a mayor dentro de cada familia. El plan que se recomienda es el
 *  mayor que exija alguna respuesta: por debajo se estaría cotizando algo que
 *  no cubre lo que la persona pidió. */
export const ORDEN: Record<Familia, string[]> = {
  ads: planesMetaAds.map((p) => p.slug),
  redes: planesRedes.map((p) => p.slug),
  web: planesWebNuevos.map((p) => p.slug),
};

const rango = (familia: Familia, slug: string) => ORDEN[familia].indexOf(slug);

const extras: Extra[] = [...complementos, ...solucionesMedida];

export const buscarExtra = (id: string): Extra | undefined => extras.find((e) => e.id === id);

/* ------------------------------------------------------------------ *
 * Pasos
 * ------------------------------------------------------------------ */

export interface QuoteOption {
  value: string;
  label: string;
  hint: string;
  /** Plan mínimo (slug, dentro de la familia del paso) que exige esta respuesta. */
  requiresPlan?: string;
}

export interface QuoteStep {
  id: string;
  /** La pregunta, en segunda persona. */
  question: string;
  help: string;
  multiple: boolean;
  /** En pasos de selección múltiple: exige al menos una respuesta para avanzar. */
  required?: boolean;
  /** A qué familia aplican los `requiresPlan` de sus opciones. */
  familia?: Familia;
  /** El paso solo se muestra si las respuestas del paso `step` lo permiten. */
  showIf?: { step: string; anyOf?: string[]; noneOf?: string[] };
  options: QuoteOption[];
}

export const steps: QuoteStep[] = [
  {
    id: "servicio",
    question: "¿Qué necesitas?",
    help: "Puedes marcar más de uno. Si llevas publicidad y web juntas, sale todo en la misma cotización.",
    multiple: true,
    required: true,
    options: [
      {
        value: "ads",
        label: "Campañas de anuncios (Meta Ads)",
        hint: "Publicidad en Instagram y Facebook, creada y optimizada con IA.",
      },
      {
        value: "redes",
        label: "Campañas + gestión de redes",
        hint: "Además de la pauta, tu contenido diario y tus redes manejadas.",
      },
      {
        value: "web",
        label: "Página web",
        hint: "Un sitio propio donde aterrizan los clientes que traen los anuncios.",
      },
    ],
  },
  {
    id: "inversion",
    question: "¿Cuánto piensas invertir en anuncios al mes?",
    help: "El presupuesto de pauta lo pagas tú directo a Meta y lo controlas tú. Esto solo define qué nivel de gestión te toca.",
    multiple: false,
    familia: "ads",
    showIf: { step: "servicio", anyOf: ["ads"], noneOf: ["redes"] },
    options: [
      { value: "inicial", label: "Entre $100 y $250", hint: "Primer paso en Meta, para probar con orden.", requiresPlan: "emprendedor" },
      { value: "media", label: "Entre $300 y $600", hint: "Ya inviertes y quieres sacarle más.", requiresPlan: "negocio" },
      { value: "alta", label: "Entre $700 y $2,000", hint: "Varias campañas activas y retargeting.", requiresPlan: "empresa" },
      { value: "maxima", label: "Más de $2,000", hint: "Inversión alta y varios objetivos a la vez.", requiresPlan: "corporativo" },
    ],
  },
  {
    id: "contenido",
    question: "¿Cuánto contenido necesitas al mes?",
    help: "Todos los planes de redes ya llevan las campañas en Meta incluidas.",
    multiple: false,
    familia: "redes",
    showIf: { step: "servicio", anyOf: ["redes"] },
    options: [
      { value: "una-red", label: "Una red, un post al día", hint: "Instagram al día, sin dejar la cuenta muerta.", requiresPlan: "arranque" },
      { value: "dos-redes", label: "Dos redes, dos posts al día", hint: "Instagram y Facebook, con contenido real además del de IA.", requiresPlan: "crecimiento" },
      { value: "tres-redes", label: "Tres redes, cuatro posts al día", hint: "Suma TikTok, reels con presentador y locuciones.", requiresPlan: "escala" },
    ],
  },
  {
    id: "web_objetivo",
    question: "¿Qué tiene que hacer tu página web?",
    help: "Si dudas entre dos, elige la más pequeña: ampliar después cuesta lo mismo.",
    multiple: false,
    familia: "web",
    showIf: { step: "servicio", anyOf: ["web"] },
    options: [
      { value: "esencial", label: "Existir y recibir mensajes", hint: "Una página con lo esencial, lista en 72 horas.", requiresPlan: "start" },
      { value: "pauta", label: "Convertir la pauta en clientes", hint: "Una página a medida, pensada para recibir anuncios.", requiresPlan: "launch" },
      { value: "empresa", label: "Presentar toda la empresa", hint: "Hasta 10 páginas, con blog y panel para editarla tú.", requiresPlan: "corporate" },
      { value: "tienda", label: "Vender en línea", hint: "Catálogo, carrito, inventario y cobros.", requiresPlan: "commerce" },
    ],
  },
  {
    id: "capacidades",
    question: "¿Qué más tiene que hacer, además de existir?",
    help: "Marca todas las que apliquen. Las que ya vengan en tu plan salen sin coste.",
    multiple: true,
    familia: "web",
    showIf: { step: "servicio", anyOf: ["web"] },
    options: [
      { value: "blog", label: "Salir en Google", hint: "Blog y todo lo que hace falta para posicionar.", requiresPlan: "corporate" },
      { value: "cms", label: "Editarla tú mismo", hint: "Cambiar textos e imágenes sin llamar a nadie.", requiresPlan: "corporate" },
      { value: "chatbot", label: "Atender solo, 24/7", hint: "Un chatbot con IA que contesta lo de siempre." },
      { value: "reservas", label: "Reservas y citas", hint: "Tus clientes reservan solos, sin llamarte." },
      { value: "login", label: "Cuentas de usuario", hint: "Cada persona entra con su clave." },
      { value: "panel", label: "Panel administrativo", hint: "Tus números y tu gestión en una sola pantalla." },
      { value: "portal", label: "Portal de clientes", hint: "Cada cliente consulta lo suyo sin escribirte." },
      { value: "automatizacion", label: "Automatizar por WhatsApp", hint: "Que los mensajes y los seguimientos se hagan solos." },
      { value: "seo", label: "SEO continuo", hint: "Contenido y trabajo técnico mes a mes para subir en Google." },
      { value: "copy", label: "Textos que venden", hint: "Redacción profesional en vez de rellenar como sea." },
      { value: "idioma", label: "Segundo idioma", hint: "El sitio completo también en inglés." },
      { value: "migracion", label: "Mudarla desde WordPress", hint: "Traemos lo que ya tienes, sin perder posicionamiento." },
    ],
  },
  {
    id: "mantenimiento",
    question: "¿Quieres que nos encarguemos del mantenimiento?",
    help: "Hosting, dominio, respaldos y cambios cada mes. Se puede contratar después, no ahora.",
    multiple: false,
    showIf: { step: "servicio", anyOf: ["web"] },
    options: [
      { value: "no", label: "Por ahora no", hint: "El primer año de dominio y hosting ya viene incluido." },
      { value: "base", label: "Care Base", hint: "Monitoreo, respaldos y 1 hora de cambios al mes." },
      { value: "pro", label: "Care Pro", hint: "Todo lo de Base + SEO continuo, reporte y 3 horas de cambios." },
      { value: "business", label: "Care Business", hint: "Soporte prioritario en menos de 4 h y 6–8 horas de cambios." },
    ],
  },
  {
    id: "urgencia",
    question: "¿Para cuándo lo necesitas?",
    help: "Esto no cambia el precio. Cambia cómo ordenamos la cola.",
    multiple: false,
    options: [
      { value: "ya", label: "Ya", hint: "Esta semana, si se puede." },
      { value: "mes", label: "Este mes", hint: "Hay fecha, pero no es hoy." },
      { value: "flexible", label: "Sin prisa", hint: "Quiero saber cuánto cuesta y planificar." },
    ],
  },
];

export type Answers = Record<string, string[]>;

/** Un paso solo entra en juego si sus condiciones se cumplen con las respuestas de ahora. */
export function pasoVisible(step: QuoteStep, answers: Answers): boolean {
  if (!step.showIf) return true;
  const dadas = answers[step.showIf.step] ?? [];
  if (step.showIf.anyOf && !step.showIf.anyOf.some((v) => dadas.includes(v))) return false;
  if (step.showIf.noneOf && step.showIf.noneOf.some((v) => dadas.includes(v))) return false;
  return true;
}

export const pasosVisibles = (answers: Answers): QuoteStep[] => steps.filter((s) => pasoVisible(s, answers));

/* ------------------------------------------------------------------ *
 * Capacidades web → qué las cubre
 * ------------------------------------------------------------------ */

/**
 * Cada capacidad se resuelve de una de dos formas:
 *  - `incluidoDesde`: a partir de ese plan web viene incluida y no suma nada.
 *  - `extraId`: se cobra aparte, con el precio literal de `site.ts`.
 */
export interface ReglaCapacidad {
  incluidoDesde?: string;
  extraId?: string;
}

export const CAPACIDADES: Record<string, ReglaCapacidad> = {
  blog: { incluidoDesde: "corporate" },
  cms: { incluidoDesde: "corporate" },
  chatbot: { extraId: "chatbot" },
  reservas: { extraId: "reservas" },
  login: { extraId: "login" },
  panel: { extraId: "panel" },
  portal: { extraId: "portal" },
  automatizacion: { extraId: "automatizacion" },
  seo: { extraId: "seo" },
  copy: { extraId: "copy" },
  idioma: { extraId: "idioma" },
  migracion: { extraId: "migracion" },
};

/* ------------------------------------------------------------------ *
 * Etiquetas de precio de cada opción
 * ------------------------------------------------------------------ */

const masBarato = (planes: { precio: string }[]): Money =>
  planes.map((p) => parsePrecio(p.precio)).reduce((a, b) => (b.min < a.min ? b : a));

/**
 * Cada opción enseña lo que cuesta ANTES de marcarla.
 *
 * Sin esto el cotizador se comporta como un carrito sin precios: marcar sale
 * gratis, el entusiasmo no encuentra freno y el total aparece de golpe al
 * final. Una cifra de cuatro dígitos sin aviso previo no se lee como
 * presupuesto, se lee como sorpresa — y la sorpresa mata la venta.
 */
export function optionPriceLabel(stepId: string, value: string): string | null {
  if (stepId === "urgencia") return null;

  if (stepId === "servicio") {
    if (value === "ads") return `Desde ${formatMoney(masBarato(planesMetaAds))}/mes`;
    if (value === "redes") return `Desde ${formatMoney(masBarato(planesRedes))}/mes`;
    if (value === "web") return `Desde ${formatMoney(masBarato(planesWebNuevos))}`;
    return null;
  }

  if (stepId === "mantenimiento") {
    const care = planesCare.find((c) => c.slug === value);
    if (!care) return null;
    return `${formatPrecio(care.mensual, care.desde)}/mes`;
  }

  if (stepId === "capacidades") {
    const regla = CAPACIDADES[value];
    if (!regla) return null;
    if (regla.extraId) {
      const extra = buscarExtra(regla.extraId);
      if (!extra) return null;
      const partes: string[] = [];
      if (extra.unico) partes.push(`+${formatMoney(extra.unico)}`);
      if (extra.mensual) partes.push(`+${formatMoney(extra.mensual)}/mes`);
      const etiqueta = partes.join(" y ");
      return extra.desde ? `Desde ${etiqueta}` : etiqueta;
    }
    if (regla.incluidoDesde) {
      const plan = planesWebNuevos.find((p) => p.slug === regla.incluidoDesde);
      return plan ? `Incluido en ${plan.nombre.replace("Juancito ", "")}` : null;
    }
    return null;
  }

  // Pasos que fijan un plan: enseñamos desde cuánto arranca esa elección.
  const step = steps.find((s) => s.id === stepId);
  const opt = step?.options.find((o) => o.value === value);
  if (!step?.familia || !opt?.requiresPlan) return null;

  if (step.familia === "web") {
    const plan = planesWebNuevos.find((p) => p.slug === opt.requiresPlan);
    return plan ? plan.precio : null;
  }
  const lista = step.familia === "ads" ? planesMetaAds : planesRedes;
  const plan = lista.find((p) => p.slug === opt.requiresPlan);
  return plan ? `${formatMoney(mensualidadPlan(plan))}/mes` : null;
}

/* ------------------------------------------------------------------ *
 * Cálculo
 * ------------------------------------------------------------------ */

export interface LineaCotizacion {
  etiqueta: string;
  nota: string;
  /** null = no aplica a ese total (no es lo mismo que $0). */
  unico: Money | null;
  mensual: Money | null;
  /** Viene incluido en el plan y no suma. */
  incluido?: boolean;
  desde?: boolean;
}

export interface Cotizacion {
  lineas: LineaCotizacion[];
  totalUnico: Money;
  totalMensual: Money;
  /** El total es un piso, no una cifra cerrada (alguna línea es "desde"). */
  unicoDesde: boolean;
  mensualDesde: boolean;
  planAds?: Plan;
  planRedes?: Plan;
  planWeb?: WebPlan;
  planCare?: PlanCare;
  /** Qué respuesta obligó a subir de plan web, para poder explicarlo. */
  motivoWeb: string;
  entrega: string;
  urgencia: string;
  /** Hay al menos un servicio elegido: hasta entonces no hay nada que cotizar. */
  vacia: boolean;
}

/** El plan mayor de la familia que exija alguna de las respuestas dadas. */
function planExigido(familia: Familia, answers: Answers): { slug: string; motivo: string } {
  let slug = ORDEN[familia][0]!;
  let motivo = "";
  for (const step of steps) {
    if (step.familia !== familia || !pasoVisible(step, answers)) continue;
    for (const opt of step.options) {
      if (!opt.requiresPlan || !(answers[step.id] ?? []).includes(opt.value)) continue;
      if (rango(familia, opt.requiresPlan) > rango(familia, slug)) {
        slug = opt.requiresPlan;
        motivo = opt.label.toLowerCase();
      }
    }
  }
  return { slug, motivo };
}

export function cotizar(answers: Answers): Cotizacion {
  const servicios = answers.servicio ?? [];
  const lineas: LineaCotizacion[] = [];

  // Los planes de redes ya incluyen las campañas de Meta: cobrar las dos cosas
  // sería facturar dos veces el mismo trabajo.
  const llevaRedes = servicios.includes("redes");
  const llevaAds = servicios.includes("ads") && !llevaRedes;
  const llevaWeb = servicios.includes("web");

  let planAds: Plan | undefined;
  let planRedes: Plan | undefined;
  let planWeb: WebPlan | undefined;
  let planCare: PlanCare | undefined;
  let motivoWeb = "";

  if (llevaAds && (answers.inversion ?? []).length > 0) {
    planAds = planesMetaAds.find((p) => p.slug === planExigido("ads", answers).slug);
    if (planAds) {
      lineas.push({
        etiqueta: `Campañas Meta Ads — plan ${planAds.nombre}`,
        nota: planAds.nota,
        unico: null,
        mensual: mensualidadPlan(planAds),
      });
    }
  }

  if (llevaRedes && (answers.contenido ?? []).length > 0) {
    planRedes = planesRedes.find((p) => p.slug === planExigido("redes", answers).slug);
    if (planRedes) {
      lineas.push({
        etiqueta: `Campañas + redes — plan ${planRedes.nombre}`,
        nota: servicios.includes("ads")
          ? "Las campañas de Meta Ads ya vienen incluidas. Presupuesto de ads aparte."
          : planRedes.nota,
        unico: null,
        mensual: mensualidadPlan(planRedes),
        desde: planRedes.desde,
      });
    }
  }

  if (llevaWeb && (answers.web_objetivo ?? []).length > 0) {
    const exigido = planExigido("web", answers);
    motivoWeb = exigido.motivo;
    planWeb = planesWebNuevos.find((p) => p.slug === exigido.slug);
    if (planWeb) {
      lineas.push({
        etiqueta: planWeb.nombre,
        nota: `Pago único · entrega en ${planWeb.entrega}`,
        unico: precioWeb(planWeb),
        mensual: null,
      });

      for (const cap of answers.capacidades ?? []) {
        const regla = CAPACIDADES[cap];
        const opt = steps.find((s) => s.id === "capacidades")!.options.find((o) => o.value === cap);
        if (!regla || !opt) continue;

        if (regla.incluidoDesde && rango("web", planWeb.slug) >= rango("web", regla.incluidoDesde)) {
          lineas.push({
            etiqueta: opt.label,
            nota: `Incluido en ${planWeb.nombre}`,
            unico: null,
            mensual: null,
            incluido: true,
          });
          continue;
        }
        if (regla.extraId) {
          const extra = buscarExtra(regla.extraId);
          if (extra) {
            lineas.push({
              etiqueta: opt.label,
              nota: opt.hint,
              unico: extra.unico ?? null,
              mensual: extra.mensual ?? null,
              desde: extra.desde,
            });
          }
        }
      }
    }
  }

  const careSlug = (answers.mantenimiento ?? [])[0];
  if (llevaWeb && careSlug && careSlug !== "no") {
    planCare = planesCare.find((c) => c.slug === careSlug);
    if (planCare) {
      lineas.push({
        etiqueta: `Mantenimiento — ${planCare.nombre}`,
        nota: planCare.detalles,
        unico: null,
        mensual: planCare.mensual,
        desde: planCare.desde,
      });
    }
  }

  const totalUnico = lineas.reduce((acc, l) => (l.unico ? sumar(acc, l.unico) : acc), CERO);
  const totalMensual = lineas.reduce((acc, l) => (l.mensual ? sumar(acc, l.mensual) : acc), CERO);

  const urgencia =
    steps.find((s) => s.id === "urgencia")!.options.find((o) => o.value === (answers.urgencia ?? [])[0])?.label ?? "";

  return {
    lineas,
    totalUnico,
    totalMensual,
    unicoDesde: lineas.some((l) => l.desde && l.unico),
    mensualDesde: lineas.some((l) => l.desde && l.mensual),
    planAds,
    planRedes,
    planWeb,
    planCare,
    motivoWeb,
    entrega: planWeb ? planWeb.entrega : "",
    urgencia,
    vacia: lineas.length === 0,
  };
}

/* ------------------------------------------------------------------ *
 * Resumen para WhatsApp
 * ------------------------------------------------------------------ */

export function mensajeWhatsApp(q: Cotizacion, nombre: string, contacto: string, negocio: string): string {
  const lineas = q.lineas.map((l) => {
    if (l.incluido) return `• ${l.etiqueta}: incluido`;
    const partes: string[] = [];
    if (l.unico) partes.push(formatMoney(l.unico));
    if (l.mensual) partes.push(`${formatMoney(l.mensual)}/mes`);
    return `• ${l.etiqueta}: ${l.desde ? "desde " : ""}${partes.join(" + ")}`;
  });

  return [
    "Hola Juancito Ads, usé el cotizador de la web y esto me salió:",
    "",
    ...lineas,
    "",
    !esCero(q.totalUnico) ? `Pago único: ${formatPrecio(q.totalUnico, q.unicoDesde)}` : null,
    !esCero(q.totalMensual) ? `Mensual: ${formatPrecio(q.totalMensual, q.mensualDesde)}` : null,
    q.entrega ? `Entrega de la web: ${q.entrega}` : null,
    q.urgencia ? `Lo necesito: ${q.urgencia}` : null,
    "",
    `Nombre: ${nombre}`,
    negocio ? `Negocio: ${negocio}` : null,
    `Contacto: ${contacto}`,
    "",
    "Quiero la propuesta por escrito.",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}
