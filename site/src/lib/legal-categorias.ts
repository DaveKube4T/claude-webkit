export interface CategoriaLegal {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  ejemplos: string[];
}

export interface Jurisdiccion {
  codigo: string;
  nombre: string;
  bandera: string;
}

export const JURISDICCIONES_DISPONIBLES: Jurisdiccion[] = [
  { codigo: "GLOBAL", nombre: "Internacional / General", bandera: "🌐" },
  { codigo: "ES", nombre: "España / Unión Europea", bandera: "🇪🇸" },
  { codigo: "US", nombre: "Estados Unidos", bandera: "🇺🇸" },
  { codigo: "AR", nombre: "Argentina", bandera: "🇦🇷" },
  { codigo: "MX", nombre: "México", bandera: "🇲🇽" },
  { codigo: "CO", nombre: "Colombia", bandera: "🇨🇴" },
  { codigo: "CL", nombre: "Chile", bandera: "🇨🇱" },
  { codigo: "UY", nombre: "Uruguay", bandera: "🇺🇾" },
  { codigo: "OFFSHORE", nombre: "Offshore / Fideicomisos Int.", bandera: "🛡️" },
];

export const CATEGORIAS_LEGALES: CategoriaLegal[] = [
  {
    id: "patrimonio_sucesiones",
    titulo: "Planificación Patrimonial y Sucesiones",
    descripcion: "Fideicomisos (Trusts), herencias, pactos sucesorios y protección del proyecto de vida.",
    icono: "🏛️",
    ejemplos: [
      "¿Cómo estructurar un fideicomiso para proteger a mis hijos sin desmotivarlos?",
      "¿Qué diferencia hay entre testamento, donación en vida y pacto sucesorio?",
      "¿Cómo evitar disputas entre herederos mediante acuerdos preventivos?",
    ],
  },
  {
    id: "fiscal_internacional",
    titulo: "Fiscalidad e Impuestos Internacionales",
    descripcion: "Doble imposición, residencia fiscal, optimización y tributación patrimonial.",
    icono: "📊",
    ejemplos: [
      "¿Cómo evitar la doble imposición si opero en varios países?",
      "¿Qué requisitos determinan la residencia fiscal?",
      "¿Cómo tributan los rendimientos de un patrimonio familiar?",
    ],
  },
  {
    id: "mercantil_corporativo",
    titulo: "Corporativo, Sociedades y Contratos",
    descripcion: "Constitución de empresas, holdings, LLCs, pactos de socios y gobierno.",
    icono: "💼",
    ejemplos: [
      "¿Conviene una LLC o una sociedad local para proyectos internacionales?",
      "¿Qué cláusulas no deben faltar en un pacto de socios?",
      "¿Cómo funciona una estructura de holding para agrupar proyectos?",
    ],
  },
  {
    id: "inmobiliario_arrendamientos",
    titulo: "Inmobiliario y Arrendamientos",
    descripcion: "Compraventas, contratos de alquiler, activos inmobiliarios y garantías.",
    icono: "🏢",
    ejemplos: [
      "¿Qué precauciones legales tomar antes de firmar una compraventa inmobiliaria?",
      "¿Cómo blindar un contrato de arrendamiento o alquiler comercial?",
      "¿Es conveniente poner inmuebles a nombre de una sociedad o persona física?",
    ],
  },
  {
    id: "cripto_smart_contracts",
    titulo: "Criptoactivos, Smart Contracts y MiCA",
    descripcion: "Regulación europea MiCA, custodia, contratos inteligentes y fiscalidad cripto.",
    icono: "⚡",
    ejemplos: [
      "¿Cómo afecta el reglamento MiCA a la tenencia de criptoactivos?",
      "¿Tienen validez legal probatoria los contratos inteligentes (smart contracts)?",
      "¿Cómo se declara fiscalmente la conversión de criptoactivos a moneda fiduciaria?",
    ],
  },
  {
    id: "laboral_directivos",
    titulo: "Laboral y Contratos de Alta Dirección",
    descripcion: "Contratación de ejecutivos, desvinculaciones, confidencialidad y no competencia.",
    icono: "👥",
    ejemplos: [
      "¿Cómo redactar un acuerdo de confidencialidad (NDA) blindado?",
      "¿Qué cláusulas aplicar para contratos de Project Managers o directores?",
      "¿Qué implicaciones legales tienen las cláusulas de no competencia?",
    ],
  },
  {
    id: "propiedad_intelectual",
    titulo: "Propiedad Intelectual y Marcas",
    descripcion: "Registro de marcas, patentes, derechos de autor y licencias de software/marca.",
    icono: "💡",
    ejemplos: [
      "¿Cómo registrar y proteger una marca internacionalmente?",
      "¿A quién pertenecen los derechos de un desarrollo creado por un colaborador?",
      "¿Cómo redactar un contrato de licencia de uso de marca?",
    ],
  },
  {
    id: "penal_ciberseguridad",
    titulo: "Prevención Penal y Ciberseguridad",
    descripcion: "Prevención de estafas digitales, cumplimiento normativo y delitos informáticos.",
    icono: "🔒",
    ejemplos: [
      "¿Cómo actuar legalmente ante una suplantación de identidad o estafa digital?",
      "¿Qué es el compliance penal para una organización o proyecto?",
      "¿Qué deber de custodia legal existe sobre los datos sensibles de usuarios?",
    ],
  },
];
