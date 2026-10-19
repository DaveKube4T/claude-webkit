export interface SeccionPerfilFinanciero {
  key:
    | "punto_partida"
    | "perfil_riesgo"
    | "bolsillos"
    | "proteccion"
    | "estructuras"
    | "liberacion_progresiva"
    | "presupuesto";
  numero: number;
  titulo: string;
  guia: string;
}

export const SECCIONES_PERFIL_FINANCIERO: SeccionPerfilFinanciero[] = [
  {
    key: "punto_partida",
    numero: 1,
    titulo: "Punto de partida",
    guia:
      "Ayuda a la persona a organizar con total claridad los recursos financieros importantes con los que ya cuenta o que está recibiendo ahora mismo. Pregúntale sobre el origen de estos fondos, qué deudas pendientes le gustaría ordenar primero, y su nivel de experiencia financiera (ninguna, básica, media o alta). Recuérdale que tener los recursos ahora exige una administración impecable y profesional desde el primer día.",
  },
  {
    key: "perfil_riesgo",
    numero: 2,
    titulo: "Perfil de riesgo",
    guia:
      "Ayuda a descubrir su perfil de riesgo con preguntas simples: si sus inversiones bajaran 20% en un año, ¿qué haría? ¿qué le importa más, no perder nada o crecer con calma o crecer mucho aunque haya sustos? ¿cuándo necesitaría usar la mayor parte de este dinero? Al final resume si el perfil parece conservador, moderado o de crecimiento. Después de clasificarlo, explícale en términos generales qué significa eso en la práctica, dándole una idea concreta del tipo de instrumentos y plazos típicos de cada perfil — conservador: mayoría en bonos de alta calidad, depósitos a plazo y fondos de bajo riesgo, pensado para plazos cortos a medios (1-3 años); moderado: mezcla de bonos y acciones diversificadas (fondos indexados o carteras balanceadas), plazos medios (3-7 años); de crecimiento: mayor proporción en acciones diversificadas y, en menor medida, activos alternativos, pensado para plazos largos (7+ años), aceptando más vaivenes en el camino. Aclara que esto es solo para que entienda el lenguaje y llegue preparada a la conversación con su asesor real — nunca menciones un producto o entidad específica ni des una recomendación de inversión concreta.",
  },
  {
    key: "bolsillos",
    numero: 3,
    titulo: "Asignación por bolsillos",
    guia:
      "Explica la idea de dividir el patrimonio en 'bolsillos' separados, cada uno con un solo propósito y su propia lógica de manejo: fondo de emergencia (liquidez alta, bajo riesgo, para imprevistos de los primeros 2-3 años — orientativamente 5-10% del total), estilo de vida (liquidez media, riesgo bajo a moderado, genera renta recurrente para vivir — orientativamente 15-25%), crecimiento generacional (liquidez baja, riesgo moderado a alto porque no se toca por décadas, crece para hijos y nietos — suele ser el bolsillo más grande, 30-40% o más), emprendimiento (riesgo alto, montos que se está dispuesta a arriesgar), donaciones (liquidez según se vaya usando), y familia (educación, apoyo a padres, liquidez media a los plazos en que se necesite). Pregunta qué % le gustaría asignar a cada uno, aclarando que esos rangos son solo orientativos — el asesor real los ajusta según su situación concreta.",
  },
  {
    key: "proteccion",
    numero: 4,
    titulo: "Protección patrimonial",
    guia:
      "Ayuda a pensar qué riesgos le preocupan más: salud grave, demandas, divorcio, fraude, crisis de un país o moneda. Pregunta cuáles de estos le preocupan y qué tipo de protección (seguros, separar bienes, diversificar países/bancos) le gustaría explorar con un asesor. Menciónale que, como criterio general, conviene priorizar bancos con calificación crediticia alta (AA o AAA en adelante, como en jurisdicciones de Suiza, Singapur, Estados Unidos, Reino Unido, Alemania, Liechtenstein, Gibraltar, Portugal, Japón) y considerar instituciones de respaldo global (como los principales bancos custodios mundiales según S&P Global, incluyendo gigantes sistémicos como JPMorgan Chase o grandes bancos internacionales) — siempre a elegir junto con su asesor real, sin recomendar un producto específico. Explícale también, para que entienda qué es cada cosa: la banca privada (atención personalizada para patrimonios altos), el banco custodio (solo guarda y resguarda dinero y activos financieros, no los administra activamente) y la compañía fiduciaria (administra fideicomisos y fundaciones junto con la banca privada) son para el dinero y activos financieros — mientras que para joyas, arte u objetos físicos de valor se usan cajas de seguridad bancarias (para cosas pequeñas) o bóvedas privadas especializadas/freeports (para objetos grandes, con seguro incluido). Son servicios distintos. Recuerda que proteger va antes que invertir.",
  },
  {
    key: "estructuras",
    numero: 5,
    titulo: "Estructuras, sucesión y protección familiar",
    guia:
      "Explica con claridad y rigor corporativo cómo blindar el patrimonio evitando cualquier exposición a título personal: 1) Fideicomisos (Trusts) y Fundaciones Familiares (como en jurisdicciones de máxima protección internacional: Cook Islands, Nevis, Liechtenstein, Panamá): permiten separar los bienes de la persona natural, estableciendo reglas estrictas para herederos (condiciones de edad, hitos académicos o profesionales, protección ante divorcios o embargos). 2) Protección para menores: designación de fiduciarios, tutores y reglas de desembolsos escalonados o en etapas según madurez. 3) Apoyo a terceros o amistades: nunca de forma directa ni personal para evitar exposición o peticiones desmedidas; se canaliza mediante fondos específicos, becas o convenios formales estructurados. Recuérdale que todo debe estructurarse bajo persona jurídica y de manera preventiva.",
  },
  {
    key: "liberacion_progresiva",
    numero: 6,
    titulo: "Liberación progresiva",
    guia:
      "Explica que al contar con recursos importantes ahora mismo, se implementa una prueba inicial y estratégica: dedicar una porción prudente (un primer tramo) para armar de forma confidencial y segura las estructuras legales y financieras necesarias (cuentas en bancos custodios de primer nivel, fundaciones o holdings). Regla clave: una parte muy acotada de este tramo inicial puede destinarse a gastos personales urgentes o necesarios bajo persona natural para ordenar el día a día — pero el núcleo principal de los recursos debe estructurarse bajo persona jurídica y fideicomisos para blindarlos y hacerlos perdurar. Administrar estos recursos con rigor desde el inicio demuestra la capacidad y visión para gestionar y hacer crecer el patrimonio con éxito. Pregúntale qué prioridades de estructuración inmediata tiene y qué dudas o miedos enfrenta al organizar este capital.",
  },
  {
    key: "presupuesto",
    numero: 7,
    titulo: "Presupuesto práctico",
    guia:
      "Ayuda con la parte práctica del día a día: presupuesto mensual aproximado (vivienda, servicios, salud, educación, entretenimiento). Sobre la casa, explícale la diferencia entre comprar de contado (no hay intereses ni deuda, pero inmoviliza una suma grande de una sola vez) y financiada (libera capital para que siga invertido y creciendo, pero suma el costo de los intereses del crédito) — y pregúntale cuál prefiere y para cuándo. Sobre cómo recibir dinero disponible, explícale la diferencia entre un retiro fijo mensual (más previsible para organizarse, parecido a un sueldo) y retirar bajo pedido según necesite (más flexible, pero requiere más disciplina personal para no sobregirarse) — y pregúntale cuál le resulta más cómoda.",
  },
];

export function obtenerSeccionPerfilFinanciero(
  key: string
): SeccionPerfilFinanciero | undefined {
  return SECCIONES_PERFIL_FINANCIERO.find((s) => s.key === key);
}
