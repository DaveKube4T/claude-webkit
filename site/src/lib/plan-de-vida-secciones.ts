export interface SeccionPlanVida {
  key:
    | "proposito_valores"
    | "vision_fases"
    | "familia"
    | "amigos"
    | "donaciones"
    | "empresas"
    | "estilo_vida"
    | "legado";
  numero: number;
  titulo: string;
  guia: string;
}

export const SECCIONES_PLAN_VIDA: SeccionPlanVida[] = [
  {
    key: "proposito_valores",
    numero: 1,
    titulo: "Propósito y valores",
    guia:
      "Ayuda a la persona a descubrir, con sus propias palabras: su propósito con su patrimonio en una frase, sus 5 valores principales en orden de importancia, sus principios no negociables (reglas que ningún asesor puede romper), sus miedos sobre el dinero, y cómo quiere que la recuerden dentro de 100 años. Pregunta una cosa a la vez, da ejemplos simples si la persona se queda en blanco.",
  },
  {
    key: "vision_fases",
    numero: 2,
    titulo: "Visión a futuro",
    guia:
      "Ayuda a la persona a pensar su patrimonio en 5 fases a lo largo del tiempo: 1) Pausa y orden (el primer año, sin gastar ni invertir fuerte), 2) Construir, 3) Consolidar, 4) Transmitir, 5) Perdurar. Para cada fase pregunta qué quiere lograr y qué debe estar resuelto antes de pasar a la siguiente.",
  },
  {
    key: "familia",
    numero: 3,
    titulo: "Familia",
    guia:
      "Ayuda a mapear a la familia cercana (pareja, hijos, padres, hermanos) y qué quiere la persona para cada uno. Pregunta sobre: a qué edad los hijos deberían recibir acceso a dinero, si se pagan estudios completos y hasta qué nivel, cómo se cubre a los padres/mayores, y qué es lo que NO quiere que pase (ej. que los hijos dejen de estudiar o trabajar).",
  },
  {
    key: "amigos",
    numero: 4,
    titulo: "Amigos y círculo cercano",
    guia:
      "Ayuda a definir reglas simples y claras para el círculo cercano: presupuesto para regalos, postura sobre préstamos (sugerir no prestar, o solo por escrito y con límite), cómo filtrar peticiones de dinero, y cuánta discreción quiere mantener sobre su patrimonio.",
  },
  {
    key: "donaciones",
    numero: 5,
    titulo: "Donaciones",
    guia:
      "Ayuda a definir: qué % de rendimientos o patrimonio quiere donar, hasta 3 causas que le importan de verdad (para que el impacto sea real), y quién decide a qué se dona. Recuerda que las donaciones deben ser siempre con recibo y convenio por escrito, nunca en efectivo.",
  },
  {
    key: "empresas",
    numero: 6,
    titulo: "Empresas y emprendimientos",
    guia:
      "Ayuda a pensar qué empresas o proyectos quiere crear, comprar o apoyar la persona, y su rol en cada uno (dueña, socia, inversionista pasiva). Pregunta sobre el tope que estaría dispuesta a arriesgar en emprendimientos (sugerencia para alguien sin experiencia: no más de 10-15% del patrimonio).",
  },
  {
    key: "estilo_vida",
    numero: 7,
    titulo: "Estilo de vida y sueños",
    guia:
      "Ayuda a la persona a describir cómo quiere vivir (un día, una semana, un año ideal) y sus sueños con costo (casa propia, viajar, estudiar, etc.), con cuándo los imagina y si son gastos únicos o recurrentes. Recuerda la idea de que el estilo de vida se paga con los rendimientos, no con el capital.",
  },
  {
    key: "legado",
    numero: 8,
    titulo: "Legado y transmisión",
    guia:
      "Ayuda a pensar qué se transmite a las siguientes generaciones más allá del dinero: valores, conocimiento, historia familiar. Pregunta sobre un protocolo familiar simple (cómo se toman decisiones, cómo se resuelven conflictos) y si quiere dejar una carta a las futuras generaciones.",
  },
];

export function obtenerSeccion(key: string): SeccionPlanVida | undefined {
  return SECCIONES_PLAN_VIDA.find((s) => s.key === key);
}
