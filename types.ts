export enum AntibioticMethod {
  DIFFUSION = 'Difusión (Halo mm)',
  MIC = 'CIM (µg/mL)'
}

export enum ClassificationResult {
  SENSITIVE = 'Sensible (S)',
  INTERMEDIATE = 'Intermedio (I)',
  RESISTANT = 'Resistente (R)',
  UNKNOWN = 'Sin Datos / No Configurado',
  INDETERMINATE = 'NO CONCLUYENTE (Ver CIM)',
  INVALID = 'MÉTODO INVÁLIDO'
}

export enum LogicGroup {
  GROUP_A = "GRUPO A: GENERAL (Enterobacterales/Pseudomonas)",
  GROUP_B = "GRUPO B: STAPHYLOCOCCUS",
  GROUP_C1 = "GRUPO C.1: HAEMOPHILUS INFLUENZAE",
  GROUP_C2 = "GRUPO C.2: MORAXELLA CATARRHALIS",
  GROUP_C3 = "GRUPO C.3: NEISSERIA GONORRHOEAE",
  GROUP_C4 = "GRUPO C.4: NEISSERIA MENINGITIDIS",
  GROUP_D1 = "GRUPO D.1: STREPTOCOCCUS BETA-HEMOLÍTICO (A, B, C, G)",
  GROUP_D2 = "GRUPO D.2: STREPTOCOCCUS VIRIDANS",
  GROUP_D3 = "GRUPO D.3: STREPTOCOCCUS PNEUMONIAE",
  GROUP_E = "GRUPO E: ENTEROCOCCUS SPP.",
  GROUP_F = "GRUPO F: COPROCULTIVO (SALMONELLA / SHIGELLA)",
  GROUP_G1 = "GRUPO G.1: ACINETOBACTER SPP.",
  GROUP_G2 = "GRUPO G.2: STENOTROPHOMONAS MALTOPHILIA",
  UNKNOWN = "GENERAL (Default)"
}

export interface PatientInfo {
  name: string;
  documentId: string;
  orderNumber: string;
  insurance: string;
  age: string;
  condition?: string;
}

// Estructura para definir los puntos de corte
export interface BreakpointRule {
  S: number; // Mayor o igual a esto es Sensible
  R: number; // Menor o igual a esto es Resistente
  note?: string; // Nota importante o regla lógica
  // Lo que queda en medio es Intermedio
}

export interface AnalysisResponse {
  classification: ClassificationResult;
  criterion: string; // Texto explicativo (ej: S >= 20)
  antibioticName?: string;
  reasoning?: string;
  note?: string; // Advertencia clínica para mostrar en el tooltip
  isForced?: boolean; // Indicates if the result was overridden by clinical logic (e.g., MRSA)
  isIntrinsic?: boolean; // Indicates natural resistance
  criticalRule?: string; // Name of the critical rule applied (e.g. "MRSA Cascade")
  logicGroup?: LogicGroup | string; // The logic group used for interpretation
  mechanism?: string; // Inferred mechanism (e.g. "AmpC Inducible", "Natural R")
}

// --- INTERFACES PARA REPORTE WORD ---
export interface ReportResultItem {
  antibiotic: string;
  halo_mm: string | number;
  interpretacion: string;
  advertencia_clinica?: string | null;
  criterio?: string;
  mecanismo?: string;
}

export interface ReporteFinal {
  paciente: {
    nombre: string;
    id_muestra: string; // DNI o ID
    nro_orden: string;
    obra_social: string;
    fecha: string;
    origen_muestra: string;
    edad?: string; // Added optional age field
  };
  analisis_bacteria: {
    nombre: string;
    grupo: string;
  };
  resultados: ReportResultItem[];
  alerta_global?: string | null;
}