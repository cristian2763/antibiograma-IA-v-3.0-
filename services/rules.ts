
import { AntibioticMethod, BreakpointRule, ClassificationResult, AnalysisResponse, LogicGroup } from "../types";

// --- HELPER: NORMALIZACIÓN DE CLAVES ---
const normalizeKey = (key: string): string => {
    return key.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]/g, ""); // Eliminar todo lo que no sea letra o número
};

// --- 1. BASE DE DATOS DE RESISTENCIA NATURAL (INTRÍNSECA) ---
interface IntrinsicResult {
    isIntrinsic: boolean;
    note?: string;
}

const checkIntrinsicResistance = (microorganism: string, antibioticName: string): IntrinsicResult => {
    const micro = microorganism.toLowerCase();
    const abNorm = normalizeKey(antibioticName);
    const is = (search: string) => abNorm.includes(normalizeKey(search));

    // 1. Citrobacter spp.
    if (micro.includes("citrobacter")) {
        if (micro.includes("freundii")) {
            if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
            if (is("Amoxicilina") && is("Clavul")) return { isIntrinsic: true, note: "R Natural" };
            if (is("Cefazolina") || is("Cefalotina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
            if (is("Cefoxitina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
            if (is("Cefuroxima")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        } else {
            // C. koseri
            if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
        }
    }

    // 2. Enterobacter cloacae complex / aerogenes
    if (micro.includes("enterobacter")) {
        if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Amoxicilina") && is("Clavul")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        if (is("Cefoxitina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        if (is("Cefuroxima")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
    }

    // 3. Hafnia alvei
    if (micro.includes("hafnia")) {
        if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Amoxicilina") && is("Clavul")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefoxitina")) return { isIntrinsic: true, note: "R Natural" };
    }

    // 4. Klebsiella spp.
    if (micro.includes("klebsiella")) {
        if (micro.includes("aerogenes")) {
             if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
             if (is("Amoxicilina") && is("Clavul")) return { isIntrinsic: true, note: "R Natural" };
             if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
             if (is("Cefoxitina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
             if (is("Cefuroxima")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        } else {
             // K. pneumoniae / oxytoca
             if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural (SHV-1)" };
             if (is("Ticarcilina")) return { isIntrinsic: true, note: "R Natural" };
        }
    }

    // 5. Morganella morganii
    if (micro.includes("morganella")) {
        if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Amoxicilina") && is("Clavul")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefuroxima")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Nitrofuranto")) return { isIntrinsic: true, note: "R Natural (Morganella)" };
        if (is("Colistina") || is("Polimixina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Tigeciclina")) return { isIntrinsic: true, note: "R Natural" };
    }

    // 6. Proteus spp.
    if (micro.includes("proteus")) {
        if (is("Nitrofuranto")) return { isIntrinsic: true, note: "R Natural en Proteus" };
        if (is("Tetraciclina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Tigeciclina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Colistina") || is("Polimixina")) return { isIntrinsic: true, note: "R Natural" };

        if (micro.includes("vulgaris") || micro.includes("penneri")) {
            if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural (Cefalosporinasa)" };
            if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
        }
    }

    // 7. Providencia spp.
    if (micro.includes("providencia")) {
        if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Nitrofuranto")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Colistina") || is("Polimixina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Tigeciclina")) return { isIntrinsic: true, note: "R Natural" };
    }

    // 8. Serratia marcescens
    if (micro.includes("serratia")) {
        const ampCNote = "Resistencia natural AmpC.";
        if (is("Ampicilina")) return { isIntrinsic: true, note: ampCNote };
        if (is("Amoxicilina") && is("Clavul")) return { isIntrinsic: true, note: ampCNote };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        if (is("Cefuroxima")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        if (is("Nitrofuranto")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Colistina") || is("Polimixina")) return { isIntrinsic: true, note: "R Natural" };
    }

    // 9. Salmonella / Shigella
    if (micro.includes("salmonella") || micro.includes("shigella")) {
        if (is("Gentamicina") || is("Amikacina") || is("Tobramicina")) return { isIntrinsic: true, note: "Ineficaz clínicamente (SUPRIMIR)" };
        if (is("Cefalotina") || is("Cefazolina") || is("Cefuroxima")) return { isIntrinsic: true, note: "Ineficaz clínicamente (SUPRIMIR)" };
        if (is("Cefoxitina")) return { isIntrinsic: true, note: "Ineficaz clínicamente (SUPRIMIR)" };
        if (is("Nitrofuranto") || is("Fosfomicina")) return { isIntrinsic: true, note: "Solo actúa en orina (SUPRIMIR)" };
    }
    
    // 10. Yersinia enterocolitica
    if (micro.includes("yersinia")) {
         if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
         if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
         if (is("Ticarcilina")) return { isIntrinsic: true, note: "R Natural" };
    }

    // --- GRUPO G: NO FERMENTADORES Y OTROS ---

    // Pseudomonas aeruginosa
    if (micro.includes("pseudomonas")) {
        if (is("Ampicilina") || (is("Amoxicilina") && is("Clavul"))) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefotaxima") || is("Ceftriaxona")) return { isIntrinsic: true, note: "R Natural (AmpC)" };
        if (is("Ertapenem")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Trimethoprim") || is("Cotrimoxazol") || is("TMS")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Tetraciclina") || is("Cloranfenicol")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
    }

    // Stenotrophomonas maltophilia
    if (micro.includes("stenotrophomonas") || micro.includes("maltophilia")) {
        if (is("Imipenem") || is("Meropenem") || is("Ertapenem") || is("Doripenem") || is("Carbapenem")) {
            return { isIntrinsic: true, note: "Resistencia Intrínseca (Enzima L1). Nunca reportar S." };
        }
        if (is("Aminoglucosido") || is("Gentamicina") || is("Amikacina") || is("Tobramicina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefalosporina") || is("Cefepime") || is("Cefotaxima") || is("Cefuroxima")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Ampicilina") || (is("Amoxicilina") && is("Clavul"))) return { isIntrinsic: true, note: "R Natural" };
    }

    // Acinetobacter baumannii
    if (micro.includes("acinetobacter")) {
        if (is("Ampicilina") && !is("Sulbactam")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Amoxicilina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefazolina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cefoxitina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Ertapenem")) return { isIntrinsic: true, note: "R Natural (A diferencia de Enterobacterias)" };
        if (is("Trimetoprima") && !is("Sulfa") && !is("Cotrimoxazol")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cloranfenicol")) return { isIntrinsic: true, note: "R Natural" };
    }

    // --- GRAM POSITIVOS ---

    // Staphylococcus spp.
    if (micro.includes("staphylococcus")) {
        if (is("Aztreonam")) return { isIntrinsic: true, note: "No activo vs Gram Positivos" };
        if (is("Ceftazidima")) return { isIntrinsic: true, note: "No activo vs Gram Positivos" };
    }

    // Enterococcus spp.
    if (micro.includes("enterococcus")) {
        if (is("Cef") || is("Ceph")) return { isIntrinsic: true, note: "R Natural (Cefalosporinas)" };
        if (is("Clindamicina")) return { isIntrinsic: true, note: "R Natural" };
        if (is("Cotrimoxazol") || is("TMS")) return { isIntrinsic: true, note: "R Natural in vivo" };
        if (is("Oxacilina") || is("Nafcilina")) return { isIntrinsic: true, note: "R Natural" };
        if (micro.includes("faecium") && (is("Carbapenem") || is("Imipenem") || is("Meropenem"))) {
             return { isIntrinsic: true, note: "R Natural en E. faecium" };
        }
    }

    // Streptococcus spp.
    if (micro.includes("streptococcus") || micro.includes("pneumoniae")) {
        if (is("Gentamicina") || is("Amikacina") || is("Tobramicina")) return { isIntrinsic: true, note: "R Natural (Bajo nivel en monoterapia)" };
        if (is("Aztreonam")) return { isIntrinsic: true, note: "R Natural" };
        if (micro.includes("pneumoniae") && (is("Ácido Nalidíxico") || is("Nalidixico"))) return { isIntrinsic: true, note: "R Natural" };
    }

    return { isIntrinsic: false };
};


// --- 2. TABLAS DE PUNTOS DE CORTE (BREAKPOINTS) ---

const RULES_GROUP_A: Record<string, BreakpointRule> = {
  "Piperacilina Tazobactam": { R: 17, S: 21, note: "Muy usado en infecciones graves/UCI." },
  "Cefuroxima": { R: 14, S: 18, note: "Valor parenteral (Sodium)." },
  "Ceftazidima": { R: 17, S: 21, note: "Junto con Cefotaxima/Ceftriaxona." },
  "Cefotaxima": { R: 22, S: 26, note: "Alerta: Verificar si el lab usa corte nuevo (igual a Ceftriaxona)." },
  "Cefoxitina": { R: 14, S: 18, note: "Marcador de AmpC. Si es R, sugiere resistencia a cefalosporinas e inhibidores." },
  "Aztreonam": { R: 17, S: 21, note: "Alternativa en alérgicos a penicilina." },
  "Ertapenem": { R: 18, S: 22, note: "No cubre Pseudomonas. Útil para diferenciar." },
  "Imipenem": { R: 19, S: 23, note: "Proteus tiene sensibilidad disminuida intrínseca." },
  "Amikacina": { R: 14, S: 17, note: "Opción potente si hay resistencia a Gentamicina." },
  "Tobramicina": { R: 12, S: 15, note: "Menos activa que Genta para Enterobacterales." },
  "Levofloxacina": { R: 13, S: 17 },
  "Norfloxacina": { R: 12, S: 17, note: "Regla: Solo reportar en muestras de Orina." },
  "Ácido Nalidíxico": { R: 13, S: 19, note: "Marcador de resistencia a quinolonas (Screening)." },
  "Nitrofurantoína": { R: 14, S: 17, note: "Solo Orina. Regla: Proteus, Morganella, Providencia y Serratia son R Intrínsecos." },
  "Fosfomicina": { R: 12, S: 16, note: "Estandarizado principalmente para E. coli urinaria." },
  "Tetraciclina": { R: 11, S: 15, note: "Predice Doxiciclina." },
  "Cloranfenicol": { R: 12, S: 18 },
  "Gentamicina": { R: 12, S: 15 },
  "Ciprofloxacina": { R: 15, S: 21 },
  "TMS (Cotrimoxazol)": { R: 10, S: 16 },
  "Ampicilina": { R: 13, S: 17 },
  "Amoxicilina Clavulánico": { R: 13, S: 17 },
  "Ampicilina Sulbactam": { R: 11, S: 15 },
  "Meropenem": { R: 19, S: 23 },
  "Cefazolina": { R: 19, S: 23, note: "Predice Cefalosporinas Orales." }
};

const RULES_GROUP_B: Record<string, BreakpointRule> = {
  "Penicilina": { R: 28, S: 29, note: "Revisar borde (beta-lactamasa)." },
  "Cefoxitina (Screening)": { R: 21, S: 22, note: "Marcador MRSA." }, 
  "Gentamicina": { R: 12, S: 15 },
  "Ciprofloxacina": { R: 15, S: 21 },
  "Levofloxacina": { R: 15, S: 19, note: "I=16-18" },
  "Eritromicina": { R: 13, S: 23 },
  "Clindamicina": { R: 14, S: 21 },
  "TMS (Cotrimoxazol)": { R: 10, S: 16 },
  "Rifampicina": { R: 16, S: 20 },
  "Nitrofurantoína": { R: 14, S: 17, note: "Solo Orina." },
  "Linezolid": { R: 20, S: 21 },
  "Tetraciclina": { R: 14, S: 19 }
};

const RULES_GROUP_C1: Record<string, BreakpointRule> = {
  "Ampicilina": { R: 18, S: 22 },
  "Amoxicilina Clavulánico": { R: 19, S: 20 },
  "Ampicilina Sulbactam": { R: 19, S: 20 },
  "Cefuroxima": { R: 16, S: 20, note: "Sódica parenteral." },
  "Cefotaxima": { R: -1, S: 26, note: "Si halo < 26: REQUIERE CIM" },
  "Ceftriaxona": { R: -1, S: 26, note: "Si halo < 26: REQUIERE CIM" },
  "Ciprofloxacina": { R: -1, S: 21 },
  "Levofloxacina": { R: -1, S: 26 },
  "Azitromicina": { R: -1, S: 12 },
  "TMS (Cotrimoxazol)": { R: 10, S: 16 },
  "Tetraciclina": { R: 11, S: 15 },
  "Cloranfenicol": { R: 25, S: 29 }
};

const RULES_GROUP_C2: Record<string, BreakpointRule> = {
  "Amoxicilina Clavulánico": { R: 19, S: 20 },
  "Cefuroxima": { R: 16, S: 20 },
  "Cefotaxima": { R: -1, S: 21 },
  "Ceftriaxona": { R: -1, S: 21 },
  "Eritromicina": { R: 18, S: 26 },
  "Azitromicina": { R: -1, S: 26 },
  "Tetraciclina": { R: 14, S: 19 },
  "Ciprofloxacina": { R: 17, S: 21 },
  "TMS (Cotrimoxazol)": { R: 10, S: 16 }
};

const RULES_GROUP_C3: Record<string, BreakpointRule> = {
  "Ceftriaxona": { R: -1, S: 35, note: "Alerta si < 35" },
  "Cefixime": { R: -1, S: 31 },
  "Ciprofloxacina": { R: 27, S: 41 },
  "Tetraciclina": { R: 30, S: 38 },
  "Penicilina": { R: 26, S: 47 }
};

const RULES_GROUP_C4: Record<string, BreakpointRule> = {
  "Ceftriaxona": { R: -1, S: 34 },
  "Azitromicina": { R: -1, S: 20, note: "Solo profilaxis" },
  "Ciprofloxacina": { R: -1, S: 35, note: "Solo profilaxis" },
  "Rifampicina": { R: -1, S: 25 },
  "TMS (Cotrimoxazol)": { R: 25, S: 30 }
};

const RULES_GROUP_D1: Record<string, BreakpointRule> = {
  "Penicilina": { R: 23, S: 24, note: "S < 24: Verificar Identificación" }, 
  "Ampicilina": { R: 23, S: 24, note: "S < 24: Verificar Identificación" },
  "Eritromicina": { R: 15, S: 21 },
  "Clindamicina": { R: 15, S: 19 },
  "Levofloxacina": { R: 13, S: 17 },
  "Vancomicina": { R: -1, S: 17 },
  "Linezolid": { R: -1, S: 21 },
  "Tetraciclina": { R: 18, S: 23 }
};

const RULES_GROUP_D2: Record<string, BreakpointRule> = {
  "Penicilina": { R: 27, S: 28, note: "Screening < 28: Requiere CIM" },
  "Eritromicina": { R: 15, S: 21 },
  "Clindamicina": { R: 15, S: 19 },
  "Vancomicina": { R: -1, S: 17 },
  "Levofloxacina": { R: 13, S: 17 } 
};

const RULES_GROUP_D3: Record<string, BreakpointRule> = {
  "Oxacilina": { R: 19, S: 20, note: "Screening Penicilina" },
  "Eritromicina": { R: 15, S: 21 },
  "Clindamicina": { R: 15, S: 19 },
  "Levofloxacina": { R: 13, S: 17 },
  "TMS (Cotrimoxazol)": { R: 15, S: 19 },
  "Tetraciclina": { R: 18, S: 23 },
  "Vancomicina": { R: -1, S: 17 },
  "Linezolid": { R: -1, S: 21 }
};

const RULES_GROUP_E: Record<string, BreakpointRule> = {
  "Ampicilina": { R: 16, S: 17 },
  "Penicilina": { R: 14, S: 15 },
  "Vancomicina": { R: 14, S: 17, note: "S < 17: Posible VRE" },
  "Teicoplanina": { R: 10, S: 14 },
  "Linezolid": { R: 20, S: 23 },
  "Nitrofurantoína": { R: 14, S: 17, note: "Solo ITU no complicada." },
  "Fosfomicina": { R: 12, S: 16, note: "Solo E. faecalis." },
  "Ciprofloxacina": { R: 15, S: 21 },
  "Levofloxacina": { R: 13, S: 17 },
  "Gentamicina 120": { R: 6, S: 10, note: "Screening Sinergia (Alta Carga)" },
  "Estreptomicina 300": { R: 10, S: 12, note: "Screening Sinergia (Alta Carga)" }
};

const RULES_GROUP_F_SALMONELLA: Record<string, BreakpointRule> = {
  "Ampicilina": { R: 13, S: 17 },
  "Amoxicilina Clavulánico": { R: 13, S: 18, note: "No es 1ra línea." },
  "Ceftriaxona": { R: 19, S: 23 },
  "Cefotaxima": { R: 22, S: 26 },
  "Ciprofloxacina": { R: 20, S: 31, note: "Corte estricto Salmonella (S ≥ 31)" },
  "TMS (Cotrimoxazol)": { R: 10, S: 16 },
  "Azitromicina": { R: 12, S: 13, note: "Solo S. typhi" },
  "Cloranfenicol": { R: 12, S: 18 },
  "Ácido Nalidíxico": { R: 13, S: 19, note: "Screening quinolonas" }
};

const RULES_GROUP_F_SHIGELLA: Record<string, BreakpointRule> = {
  "Ampicilina": { R: 13, S: 17 },
  "Amoxicilina Clavulánico": { R: 13, S: 18 },
  "Ceftriaxona": { R: 19, S: 23 },
  "Cefotaxima": { R: 22, S: 26 },
  "Ciprofloxacina": { R: 15, S: 21 }, 
  "TMS (Cotrimoxazol)": { R: 10, S: 16 },
  "Azitromicina": { R: 15, S: 16, note: "Solo Shigella spp." },
  "Cloranfenicol": { R: 12, S: 18 },
  "Ácido Nalidíxico": { R: 13, S: 19 }
};

const RULES_GROUP_G1: Record<string, BreakpointRule> = {
  "Ampicilina Sulbactam": { R: 11, S: 15, note: "El Sulbactam es el activo." },
  "Imipenem": { R: 18, S: 22 },
  "Meropenem": { R: 14, S: 18 },
  "Ceftazidima": { R: 14, S: 18 },
  "Cefepime": { R: 14, S: 18 },
  "Gentamicina": { R: 12, S: 15 },
  "Amikacina": { R: 14, S: 17 },
  "Ciprofloxacina": { R: 15, S: 21 },
  "Levofloxacina": { R: 13, S: 17 },
  "Minociclina": { R: 12, S: 16 }
};

const RULES_GROUP_G2: Record<string, BreakpointRule> = {
  "TMS (Cotrimoxazol)": { R: 10, S: 16, note: "Droga de Elección." },
  "Levofloxacina": { R: 13, S: 17 },
  "Minociclina": { R: 12, S: 16 },
  "Ceftazidima": { R: 14, S: 18, note: "Disco poco confiable (CLSI)." },
  "Cloranfenicol": { R: 12, S: 18 }
};

// --- CREACIÓN DEL MAPA NORMALIZADO (Pre-computed) ---
const buildNormalizedMap = (rules: Record<string, BreakpointRule>) => {
    const map = new Map<string, { key: string, rule: BreakpointRule }>();
    Object.entries(rules).forEach(([key, rule]) => {
        map.set(normalizeKey(key), { key, rule });
    });
    return map;
};

const NORMALIZED_RULES = {
    [LogicGroup.GROUP_A]: buildNormalizedMap(RULES_GROUP_A),
    [LogicGroup.GROUP_B]: buildNormalizedMap(RULES_GROUP_B),
    [LogicGroup.GROUP_C1]: buildNormalizedMap(RULES_GROUP_C1),
    [LogicGroup.GROUP_C2]: buildNormalizedMap(RULES_GROUP_C2),
    [LogicGroup.GROUP_C3]: buildNormalizedMap(RULES_GROUP_C3),
    [LogicGroup.GROUP_C4]: buildNormalizedMap(RULES_GROUP_C4),
    [LogicGroup.GROUP_D1]: buildNormalizedMap(RULES_GROUP_D1),
    [LogicGroup.GROUP_D2]: buildNormalizedMap(RULES_GROUP_D2),
    [LogicGroup.GROUP_D3]: buildNormalizedMap(RULES_GROUP_D3),
    [LogicGroup.GROUP_E]: buildNormalizedMap(RULES_GROUP_E),
    [LogicGroup.GROUP_G1]: buildNormalizedMap(RULES_GROUP_G1),
    [LogicGroup.GROUP_G2]: buildNormalizedMap(RULES_GROUP_G2),
    "GROUP_F_SALMONELLA": buildNormalizedMap(RULES_GROUP_F_SALMONELLA),
    "GROUP_F_SHIGELLA": buildNormalizedMap(RULES_GROUP_F_SHIGELLA),
};

// --- HELPERS INTERNOS PARA POST-PROCESAMIENTO ---

const findResult = (results: Record<string, AnalysisResponse>, keyPart: string): AnalysisResponse | null => {
    const normKey = normalizeKey(keyPart);
    const foundKey = Object.keys(results).find(k => normalizeKey(k).includes(normKey));
    return foundKey ? results[foundKey] : null;
};

const findInput = (inputs: Record<string, number>, keyPart: string): number | null => {
    const normKey = normalizeKey(keyPart);
    const foundKey = Object.keys(inputs).find(k => normalizeKey(k).includes(normKey));
    return foundKey ? inputs[foundKey] : null;
};

// --- LOGICA EXPERTA POR GRUPOS ---

const handleStaphylococcusRules = (
    results: Record<string, AnalysisResponse>, 
    inputs: Record<string, number>, 
    micro: string
) => {
    const cefoxResult = findResult(results, "cefoxitina");
    let isMRSA = false;

    if (cefoxResult) {
        const val = findInput(inputs, "cefoxitina");
        if (val !== null) {
            const isAureus = micro.includes("aureus") || micro.includes("lugdunensis");
            const cutoff = isAureus ? 21 : 24;
            
            if (val <= cutoff) {
                isMRSA = true;
                cefoxResult.classification = ClassificationResult.RESISTANT;
                cefoxResult.note = isAureus ? "MRSA (S. aureus)" : "MRSA (Coagulasa Negativo)";
                cefoxResult.mechanism = "MecA Positivo";
                cefoxResult.criticalRule = "MARCADOR MRSA";
            }
        }
    }

    if (isMRSA) {
        Object.keys(results).forEach(key => {
            const kNorm = normalizeKey(key);
            const isBetaLactam = kNorm.includes("penicilina") || kNorm.includes("ampicilina") || kNorm.includes("cef") || kNorm.includes("imipenem") || kNorm.includes("meropenem") || kNorm.includes("amox") || kNorm.includes("piperacilina");
            
            if (isBetaLactam && !kNorm.includes("ceftarolina")) {
                results[key].classification = ClassificationResult.RESISTANT;
                results[key].isForced = true;
                results[key].mechanism = "Resistencia Cruzada (MRSA)";
                results[key].note = "Reportado R por predicción de Cefoxitina";
            }
        });
    }
};

const handleEnterococcusRules = (
    results: Record<string, AnalysisResponse>, 
    micro: string
) => {
    const ampResult = findResult(results, "ampicilina");
    if (ampResult) {
        if (micro.includes("faecium") && ampResult.classification === ClassificationResult.SENSITIVE) {
            ampResult.criticalRule = "RESULTADO INUSUAL";
            ampResult.note = "E. faecium suele ser Resistente. Confirmar identificación.";
        }
        if (ampResult.classification === ClassificationResult.SENSITIVE) {
            const imiResult = findResult(results, "imipenem");
            if (imiResult && micro.includes("faecalis")) {
                 imiResult.classification = ClassificationResult.SENSITIVE;
                 imiResult.mechanism = "Inferido de Ampicilina";
                 imiResult.isForced = true;
            }
        }
    }

    const gentaHigh = findResult(results, "gentamicina120");
    const strepHigh = findResult(results, "estreptomicina300");

    if (gentaHigh && gentaHigh.classification === ClassificationResult.RESISTANT) {
        gentaHigh.note = "Pérdida de Sinergia (No usar con B-lactámico).";
        gentaHigh.criticalRule = "SINERGIA NEGATIVA";
    }
    if (strepHigh && strepHigh.classification === ClassificationResult.RESISTANT) {
        strepHigh.note = "Pérdida de Sinergia (No usar con B-lactámico).";
        strepHigh.criticalRule = "SINERGIA NEGATIVA";
    }

    const vancoResult = findResult(results, "vancomicina");
    if (vancoResult) {
        if (vancoResult.classification !== ClassificationResult.SENSITIVE) {
            vancoResult.criticalRule = "CEPA VRE (AISLAMIENTO)";
            vancoResult.note = "Enterococo Resistente a Vancomicina. Activar protocolo de aislamiento.";
        }
    }
};

const handleStreptococcusPneumoniaeRules = (
    results: Record<string, AnalysisResponse>,
    currentGroup: LogicGroup
) => {
    const oxaResult = findResult(results, "oxacilina");
    if (oxaResult) {
        const oxaRes = oxaResult.classification;
        
        if (oxaRes === ClassificationResult.SENSITIVE) {
            results["Penicilina (Inferido)"] = {
                classification: ClassificationResult.SENSITIVE,
                criterion: "Oxacilina ≥ 20 mm",
                antibioticName: "Penicilina (Inferido)",
                mechanism: "Screening Oxacilina Negativo",
                logicGroup: currentGroup
            };
        } else if (oxaRes === ClassificationResult.INTERMEDIATE || oxaRes === ClassificationResult.RESISTANT || oxaRes === ClassificationResult.INDETERMINATE) {
            oxaResult.classification = ClassificationResult.INDETERMINATE;
            oxaResult.note = "SCREENING POSITIVO (Posible Resistencia).";
            oxaResult.criticalRule = "ALERTA S. PNEUMONIAE";

            results["Penicilina (Meningitis)"] = {
                classification: ClassificationResult.INDETERMINATE,
                criterion: "Oxacilina ≤ 19 mm",
                antibioticName: "Penicilina (Meningitis)",
                note: "REQUIERE CIM (E-Test) OBLIGATORIO.",
                criticalRule: "VERIFICAR CIM",
                logicGroup: currentGroup
            };
             results["Penicilina (Oral/No Men)"] = {
                classification: ClassificationResult.INDETERMINATE,
                criterion: "Oxacilina ≤ 19 mm",
                antibioticName: "Penicilina (Oral)",
                note: "REQUIERE CIM.",
                logicGroup: currentGroup
            };
             results["Ceftriaxona"] = {
                classification: ClassificationResult.INDETERMINATE,
                criterion: "Oxacilina ≤ 19 mm",
                antibioticName: "Ceftriaxona",
                note: "Determinar CIM en fallas de screening.",
                logicGroup: currentGroup
            };
        }
    }
};

const handleDTest = (results: Record<string, AnalysisResponse>) => {
    const eryResult = findResult(results, "eritromicina");
    const clindaResult = findResult(results, "clindamicina");

    if (eryResult && clindaResult) {
        const eryRes = eryResult.classification;
        const clindaRes = clindaResult.classification;

        if (eryRes === ClassificationResult.RESISTANT && (clindaRes === ClassificationResult.SENSITIVE || clindaRes === ClassificationResult.INTERMEDIATE)) {
            clindaResult.note = (clindaResult.note || "") + " REALIZAR D-TEST (Descartar iMLSb).";
            clindaResult.criticalRule = "D-TEST REQUERIDO";
        }
    }
};

// --- LOGICA PRINCIPAL DE GRUPO ---

const determineLogicGroup = (micro: string): LogicGroup => {
    if (micro.includes("staphylococcus")) return LogicGroup.GROUP_B;
    if (micro.includes("haemophilus")) return LogicGroup.GROUP_C1;
    if (micro.includes("moraxella")) return LogicGroup.GROUP_C2;
    if (micro.includes("gonorrhoeae")) return LogicGroup.GROUP_C3;
    if (micro.includes("meningitidis")) return LogicGroup.GROUP_C4;
    if (micro.includes("pyogenes") || micro.includes("agalactiae") || micro.includes("beta-hemol")) return LogicGroup.GROUP_D1;
    if (micro.includes("pneumoniae")) return LogicGroup.GROUP_D3;
    if (micro.includes("viridans") || micro.includes("oralis") || micro.includes("mitis") || micro.includes("anginosus")) return LogicGroup.GROUP_D2;
    if (micro.includes("enterococcus") || micro.includes("faecalis") || micro.includes("faecium")) return LogicGroup.GROUP_E;
    if (micro.includes("salmonella") || micro.includes("shigella")) return LogicGroup.GROUP_F;
    if (micro.includes("acinetobacter")) return LogicGroup.GROUP_G1;
    if (micro.includes("stenotrophomonas") || micro.includes("maltophilia")) return LogicGroup.GROUP_G2;
    return LogicGroup.GROUP_A;
};

// --- FUNCIÓN DE EVALUACIÓN UNITARIA (Optimizada) ---

const evaluateAntibiotic = (
    antibiotic: string,
    value: number,
    group: LogicGroup,
    microorganism: string
): AnalysisResponse => {
    let currentMap = NORMALIZED_RULES[LogicGroup.GROUP_A]; 

    if (group === LogicGroup.GROUP_F) {
        currentMap = microorganism.toLowerCase().includes("shigella") 
            ? NORMALIZED_RULES["GROUP_F_SHIGELLA"] 
            : NORMALIZED_RULES["GROUP_F_SALMONELLA"];
    } else if (NORMALIZED_RULES[group]) {
        currentMap = NORMALIZED_RULES[group];
    }

    const searchKey = normalizeKey(antibiotic);
    const entry = currentMap.get(searchKey);

    if (!entry) {
        return {
            classification: ClassificationResult.UNKNOWN,
            criterion: "No definido",
            antibioticName: antibiotic
        };
    }

    const { key: originalName, rule } = entry;
    
    if (rule.R === -1) {
        if (value >= rule.S) {
            return {
                classification: ClassificationResult.SENSITIVE,
                criterion: `S ≥ ${rule.S}`,
                antibioticName: originalName,
                note: rule.note
            };
        } else {
            return {
                classification: ClassificationResult.INDETERMINATE,
                criterion: `Valor < ${rule.S}`,
                antibioticName: originalName,
                note: rule.note || "No sensible por disco. Requiere CIM."
            };
        }
    }

    let result = ClassificationResult.INTERMEDIATE;
    if (value >= rule.S) result = ClassificationResult.SENSITIVE;
    else if (value <= rule.R) result = ClassificationResult.RESISTANT;

    return {
        classification: result,
        criterion: `S ≥ ${rule.S}, R ≤ ${rule.R}`,
        antibioticName: originalName,
        note: rule.note
    };
};

// --- MOTOR PRINCIPAL ---

export const evaluatePanel = (
    inputs: Record<string, number>,
    microorganism: string,
    method: AntibioticMethod,
    betaLactamasePositive: boolean
): Record<string, AnalysisResponse> => {
    
    const results: Record<string, AnalysisResponse> = {};
    const microLower = microorganism.toLowerCase();
    const currentGroup = determineLogicGroup(microLower);
    const inputKeys = Object.keys(inputs);

    // 1. Evaluación Base
    inputKeys.forEach(antibiotic => {
        const val = inputs[antibiotic];
        const abNorm = normalizeKey(antibiotic);
        
        // Reglas de exclusión inmediata
        if (abNorm.includes("colistina") || abNorm.includes("polimixina")) {
             results[antibiotic] = {
                classification: ClassificationResult.INVALID,
                criterion: "Método Inválido",
                antibioticName: antibiotic,
                note: "La Colistina no difunde bien en agar. Se requiere Microdilución.",
                logicGroup: currentGroup
            };
            return;
        }

        if (currentGroup === LogicGroup.GROUP_E) {
             if ((abNorm.includes("gentamicina") && !abNorm.includes("120") && !abNorm.includes("high")) ||
                 (abNorm.includes("estreptomicina") && !abNorm.includes("300") && !abNorm.includes("high"))) {
                 results[antibiotic] = {
                     classification: ClassificationResult.INVALID,
                     criterion: "Disco Incorrecto",
                     antibioticName: antibiotic,
                     note: "Para Enterococcus usar discos de Alta Carga (120/300 µg).",
                     logicGroup: currentGroup
                 };
                 return;
             }
        }

        const intrinsicCheck = checkIntrinsicResistance(microorganism, antibiotic);
        if (intrinsicCheck.isIntrinsic) {
             results[antibiotic] = {
                classification: ClassificationResult.RESISTANT,
                criterion: "Resistencia Natural",
                antibioticName: antibiotic,
                isIntrinsic: true,
                mechanism: intrinsicCheck.note || "Intrínseco",
                logicGroup: currentGroup
            };
            return;
        }

        const response = evaluateAntibiotic(antibiotic, val, currentGroup, microorganism);
        response.logicGroup = currentGroup;
        results[antibiotic] = response;
    });

    // 2. Reglas Expertas (Post-Procesamiento)
    if (currentGroup === LogicGroup.GROUP_B) {
        handleStaphylococcusRules(results, inputs, microLower);
        handleDTest(results);
    }
    
    else if (currentGroup === LogicGroup.GROUP_E) {
        handleEnterococcusRules(results, microLower);
    }

    else if (currentGroup === LogicGroup.GROUP_D1) {
        handleDTest(results);
        // Reglas específicas de alerta para Beta-hemolíticos
        Object.keys(results).forEach(key => {
            const kNorm = normalizeKey(key);
            if ((kNorm.includes("penicilina") || kNorm.includes("ampicilina")) && results[key].classification !== ClassificationResult.SENSITIVE) {
                 results[key].classification = ClassificationResult.INVALID;
                 results[key].criticalRule = "ALERTA MICROBIOLÓGICA";
                 results[key].note = "Resistencia no documentada. Verificar identificación y pureza.";
            }
        });
        if (microLower.includes("agalactiae")) {
            ["clindamicina", "eritromicina"].forEach(ab => {
                const res = findResult(results, ab);
                if (res) res.note = (res.note || "") + " | En alergia a Penicilina, usar para profilaxis.";
            });
        }
    }

    else if (currentGroup === LogicGroup.GROUP_D2) {
        handleDTest(results);
        Object.keys(results).forEach(key => {
             if (normalizeKey(key).includes("penicilina") && results[key].classification !== ClassificationResult.SENSITIVE) {
                 results[key].classification = ClassificationResult.INDETERMINATE;
                 results[key].note = "Posible resistencia. Determinar CIM.";
             }
        });
    }

    else if (currentGroup === LogicGroup.GROUP_D3) {
        handleDTest(results);
        handleStreptococcusPneumoniaeRules(results, currentGroup);
    }

    else if (currentGroup === LogicGroup.GROUP_C2) {
         // Moraxella Beta-Lactamase
         Object.keys(results).forEach(key => {
             const kNorm = normalizeKey(key);
             if (kNorm.includes("ampicilina") || kNorm === "penicilina") {
                 results[key].classification = ClassificationResult.RESISTANT;
                 results[key].isForced = true;
                 results[key].mechanism = "Beta-lactamasa";
             }
         });
    }

    else if (currentGroup === LogicGroup.GROUP_C3) { // Gonorrhoeae
        Object.keys(results).forEach(key => {
            if (normalizeKey(key).includes("azitromicina")) {
                results[key].classification = ClassificationResult.INVALID;
                results[key].note = "Disco no válido. Requiere CIM.";
            }
        });
    }
    
    else if (currentGroup === LogicGroup.GROUP_C4) { // Meningitidis
        Object.keys(results).forEach(key => {
            const kNorm = normalizeKey(key);
            if (kNorm.includes("penicilina") || kNorm.includes("ampicilina")) {
                results[key].classification = ClassificationResult.INVALID;
                results[key].note = "Disco no válido. Requiere CIM (E-test).";
            }
        });
    }

    else if (currentGroup === LogicGroup.GROUP_F) {
        const ciproResult = findResult(results, "ciprofloxacina");
        const nalidixicResult = findResult(results, "nalidixico");

        if (microLower.includes("salmonella") && ciproResult) {
            const ciproVal = findInput(inputs, "ciprofloxacina");
            if (ciproVal !== null && ciproVal >= 21 && ciproVal <= 30) {
                 ciproResult.classification = ClassificationResult.INTERMEDIATE;
                 ciproResult.note = "Corte Estricto: Precaución, posible resistencia bajo nivel.";
                 ciproResult.criticalRule = "ALERTA QUINOLONAS";
            }
        }
        if (ciproResult && nalidixicResult) {
            if (nalidixicResult.classification === ClassificationResult.RESISTANT && ciproResult.classification === ClassificationResult.SENSITIVE) {
                ciproResult.note = "Ác. Nalidíxico Resistent -> Posible falla terapéutica.";
                ciproResult.criticalRule = "ALERTA NALIDÍXICO";
            }
        }
    }

    return results;
};
