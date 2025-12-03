import React, { useState, useEffect } from 'react';
import { evaluatePanel } from './services/rules';
import { imprimirReporteWord } from './services/exportService';
import { AntibioticMethod, AnalysisResponse, ClassificationResult, PatientInfo, ReporteFinal, ReportResultItem } from './types';

// --- TEXTO LEGAL (LEGISLACIÓN ARGENTINA) ---
const TERMINOS_Y_CONDICIONES = `
TÉRMINOS Y CONDICIONES DE USO Y EXENCIÓN DE RESPONSABILIDAD
"ANTIBIOGRAMA MANUAL" - REPÚBLICA ARGENTINA
El uso de esta herramienta auxiliar implica la aceptación de los siguientes términos.

1. ACEPTACIÓN Y REQUISITO DE USO
El acceso y utilización de esta aplicación informática implica la aceptación plena y sin reservas de los presentes términos y condiciones.

Requisito Excluyente: El usuario declara bajo juramento ser un Profesional de la Salud matriculado y habilitado para ejercer. Quien no cumpla con este requisito debe abstenerse de utilizar la aplicación para la toma de decisiones clínicas.

2. NATURALEZA Y LIMITACIÓN DE LA HERRAMIENTA (OBLIGACIÓN DE MEDIOS)
Esta aplicación es exclusivamente una herramienta auxiliar de cálculo y consulta. Su función es agilizar la comparación de valores de halos de inhibición con tablas estandarizadas (CLSI/EUCAST).

Sin Garantía de Resultado: El desarrollador pone a disposición esta herramienta como una "obligación de medios" y no garantiza una "obligación de resultados". El software puede contener errores técnicos (bugs), fallas involuntarias o desactualizaciones respecto a las guías internacionales vigentes.

3. RESPONSABILIDAD MÉDICA EXCLUSIVA DEL USUARIO
a. Irremplazabilidad del Juicio Clínico: La herramienta NO SUSTITUYE el juicio clínico, el criterio médico profesional ni la validación bacteriológica. b. Responsabilidad Civil Profesional: Conforme a las normas de responsabilidad profesional vigentes en la República Argentina, el Profesional de la Salud usuario es el ÚNICO y EXCLUSIVO responsable por la validación, la interpretación final y la aplicación terapéutica de los resultados. c. Definición de Mal Uso: Se considera "Mal Uso" la carga de datos erróneos, la interpretación de resultados por personas no idóneas, o la omisión de pruebas confirmatorias obligatorias (ej. CIM, D-Test), siendo esto responsabilidad exclusiva del usuario.

4. LIMITACIÓN DE RESPONSABILIDAD DEL DESARROLLADOR
El desarrollador no será responsable, contractual ni extracontractualmente, por ningún daño directo o indirecto, daño emergente, lucro cesante o pérdida de oportunidad (pérdida de chance) derivada del uso, mal uso, o imposibilidad de uso de esta herramienta.

5. PROTECCIÓN DE DATOS PERSONALES (LEY 25.326)
a. Arquitectura Local (Client-Side): La aplicación funciona bajo arquitectura "Client-Side" (Local). Los datos se procesan en la memoria temporal del dispositivo del usuario. b. Confidencialidad: No se almacenan, registran ni transmiten datos sensibles, datos de salud o datos filiatorios de pacientes a servidores externos del desarrollador. c. Deber de Custodia: El usuario es el único responsable de custodiar la pantalla y los reportes generados para preservar el secreto médico y la confidencialidad del paciente, en estricto cumplimiento de la Ley 25.326 (Habeas Data).

6. PROPIEDAD INTELECTUAL Y LICENCIA DE USO
El uso de esta herramienta es gratuito para fines asistenciales, académicos y de investigación. Queda terminantemente prohibida su venta, alquiler, distribución comercial, modificación o ingeniería inversa.

7. LEY APLICABLE Y JURISDICCIÓN
Los presentes Términos y Condiciones se rigen e interpretan conforme a las leyes de la República Argentina. Toda controversia, reclamo o conflicto derivado de la utilización de esta herramienta o de la interpretación de este acuerdo será sometida a la jurisdicción de los Tribunales Ordinarios con asiento en la Ciudad Autónoma de Buenos Aires, República Argentina, con expresa renuncia a cualquier otro fuero o jurisdicción que pudiera corresponder.

AL UTILIZAR ESTA HERRAMIENTA, USTED DECLARA BAJO JURAMENTO SER UN PROFESIONAL DE LA SALUD HABILITADO Y ACEPTAR ESTOS TÉRMINOS.
`;

// --- TEXTO ACERCA DE / DONACIONES ---
const TEXTO_ACERCA_DE = `
APOYÁ EL DESARROLLO DE "ANTIBIOGRAMA MANUAL"

Esta aplicación es gratuita y de libre acceso. Su desarrollo, mantenimiento y actualización constante requieren tiempo, esfuerzo y recursos técnicos. Mi objetivo es que siga siendo una herramienta útil y libre de publicidad invasiva para todos los colegas bioquímicos y profesionales de la salud.

Si esta herramienta te resulta útil en tu práctica diaria y deseas colaborar con su continuidad, podés realizar un aporte voluntario.

🔽 DATOS PARA TRANSFERENCIA BANCARIA

CBU: [Tu Número de CBU]
Alias: [Tu Alias]
Titular: [Tu Nombre Completo]
Banco: [Nombre del Banco]
CUIT/CUIL: [Tu Número]

⚠️ AVISO LEGAL Y FISCAL (TRANSPARENCIA):
Este aporte es una contribución voluntaria entre particulares destinada al sostenimiento del proyecto de software. Al no ser el desarrollador una entidad exenta (Fundación/Asociación Civil), este aporte NO constituye una donación deducible del Impuesto a las Ganancias para quien lo realiza, ni otorga beneficios fiscales. Se emite únicamente como apoyo personal.
`;

// --- COMPONENTES AUXILIARES ---

const InfoTooltip = ({ text }: { text: string }) => {
  return (
    <div className="group relative inline-flex items-center justify-center ml-2 align-middle z-10">
      <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-serif italic font-bold cursor-help border border-blue-200">
        i
      </div>
      <div className="absolute bottom-full right-0 mb-2 w-48 md:w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left pointer-events-none">
        {text}
        <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

// --- CONFIGURACIÓN ---

// Map keywords in microorganism names to specific panels
const MICRO_PANEL_MAP = [
  { keywords: ["escherichia", "klebsiella", "proteus", "enterobacter", "serratia", "citrobacter", "morganella", "providencia", "hafnia", "pantoea"], panel: "Enterobacterias" },
  { keywords: ["salmonella", "shigella", "yersinia"], panel: "Coprocultivo (Salmonella/Shigella)" },
  { keywords: ["staphylococcus"], panel: "Staphylococcus" },
  { keywords: ["pseudomonas"], panel: "Pseudomonas aeruginosa" },
  { keywords: ["acinetobacter"], panel: "Acinetobacter spp." },
  { keywords: ["stenotrophomonas"], panel: "Stenotrophomonas maltophilia" },
  { keywords: ["enterococcus"], panel: "Enterococcus spp." },
  { keywords: ["haemophilus"], panel: "Haemophilus spp." },
  { keywords: ["moraxella"], panel: "Moraxella catarrhalis" },
  { keywords: ["gonorrhoeae"], panel: "Neisseria gonorrhoeae" },
  { keywords: ["meningitidis"], panel: "Neisseria meningitidis" },
  { keywords: ["pyogenes", "agalactiae", "beta-hemol"], panel: "Streptococcus Beta-Hemolítico" },
  { keywords: ["pneumoniae"], panel: "Streptococcus pneumoniae" },
  { keywords: ["viridans", "anginosus", "oralis", "mitis"], panel: "Streptococcus Viridans" },
];

const PANEL_DEFINITIONS: Record<string, string[]> = {
  "Enterobacterias": [
    "Ampicilina",
    "Ampicilina Sulbactam",
    "Amoxicilina Clavulánico",
    "Cefazolina",
    "Gentamicina",
    "Ciprofloxacina",
    "TMS (Cotrimoxazol)",
    "Cefotaxima",
    "Cefuroxima",
    "Nitrofurantoína",
    "Imipenem",
    "Meropenem",
    "Piperacilina Tazobactam",
    "Amikacina",
    "Fosfomicina",
    "Norfloxacina",
    "Ácido Nalidíxico"
  ],
  "Staphylococcus": [
    "Cefoxitina (Screening)",
    "Eritromicina",
    "Clindamicina",
    "Gentamicina",
    "Ciprofloxacina",
    "Levofloxacina",
    "TMS (Cotrimoxazol)",
    "Tetraciclina",
    "Rifampicina",
    "Nitrofurantoína",
    "Linezolid"
  ],
  "Enterococcus spp.": [
    "Ampicilina",
    "Vancomicina",
    "Teicoplanina",
    "Linezolid",
    "Nitrofurantoína",
    "Fosfomicina",
    "Ciprofloxacina",
    "Levofloxacina",
    "Gentamicina 120 µg",
    "Estreptomicina 300 µg"
  ],
  "Haemophilus spp.": [
    "Ampicilina",
    "Amoxicilina Clavulánico",
    "Ampicilina Sulbactam",
    "Cefuroxima",
    "Cefotaxima",
    "Ceftriaxona",
    "Azitromicina",
    "Ciprofloxacina",
    "Levofloxacina",
    "TMS (Cotrimoxazol)",
    "Cloranfenicol",
    "Tetraciclina"
  ],
  "Moraxella catarrhalis": [
    "Amoxicilina Clavulánico",
    "Eritromicina",
    "Azitromicina",
    "TMS (Cotrimoxazol)"
  ],
  "Neisseria gonorrhoeae": [
    "Ceftriaxona",
    "Cefixime",
    "Ciprofloxacina",
    "Tetraciclina",
    "Penicilina"
  ],
  "Neisseria meningitidis": [
    "Ceftriaxona",
    "Azitromicina",
    "Ciprofloxacina",
    "Rifampicina",
    "TMS (Cotrimoxazol)",
    "Penicilina"
  ],
  "Streptococcus Beta-Hemolítico": [
    "Penicilina",
    "Ampicilina",
    "Eritromicina",
    "Clindamicina",
    "Levofloxacina",
    "Vancomicina",
    "Linezolid",
    "Tetraciclina"
  ],
  "Streptococcus Viridans": [
    "Penicilina",
    "Eritromicina",
    "Clindamicina",
    "Vancomicina",
    "Levofloxacina"
  ],
  "Streptococcus pneumoniae": [
    "Oxacilina",
    "Eritromicina",
    "Clindamicina",
    "Levofloxacina",
    "TMS (Cotrimoxazol)",
    "Tetraciclina",
    "Vancomicina",
    "Linezolid"
  ],
  "Acinetobacter spp.": [
    "Ampicilina Sulbactam",
    "Imipenem",
    "Meropenem",
    "Ceftazidima",
    "Cefepime",
    "Gentamicina",
    "Amikacina",
    "Ciprofloxacina",
    "Levofloxacina",
    "Minociclina"
  ],
  "Stenotrophomonas maltophilia": [
    "TMS (Cotrimoxazol)",
    "Levofloxacina",
    "Minociclina"
  ],
  "Coprocultivo (Salmonella/Shigella)": [
    "Ampicilina",
    "Amoxicilina Clavulánico",
    "Ceftriaxona",
    "Cefotaxima",
    "Ciprofloxacina",
    "TMS (Cotrimoxazol)",
    "Ácido Nalidíxico",
    "Azitromicina",
    "Cloranfenicol"
  ]
};

const SAMPLE_TYPES = [
  "Urocultivo",
  "Hemocultivo",
  "Muestra Respiratoria (Esputo/LBA)",
  "Líquido Cefalorraquídeo (LCR)",
  "Hisopado Herida/Piel",
  "Hisopado Faringeo",
  "Coprocultivo",
  "Exudado Vaginal/Uretral",
  "Biopsia/Tejido",
  "Otro"
];

const MICROORGANISM_OPTIONS = [
  {
    label: "Enterobacterias",
    options: [
      "Escherichia coli",
      "Klebsiella pneumoniae",
      "Klebsiella oxytoca",
      "Klebsiella aerogenes",
      "Proteus mirabilis",
      "Proteus vulgaris",
      "Enterobacter cloacae complex",
      "Serratia marcescens",
      "Citrobacter freundii",
      "Citrobacter koseri",
      "Morganella morganii",
      "Providencia stuartii",
      "Providencia rettgeri",
      "Hafnia alvei",
      "Pantoea agglomerans"
    ]
  },
  {
    label: "Coprocultivo / Entéricos",
    options: [
      "Salmonella enterica",
      "Salmonella Typhi",
      "Shigella sonnei",
      "Shigella flexneri",
      "Yersinia enterocolitica"
    ]
  },
  {
    label: "No Fermentadores",
    options: [
      "Pseudomonas aeruginosa",
      "Acinetobacter baumannii",
      "Stenotrophomonas maltophilia"
    ]
  },
  {
    label: "Cocos Gram Positivos (Staphylococcus)",
    options: [
      "Staphylococcus aureus",
      "Staphylococcus epidermidis",
      "Staphylococcus saprophyticus",
      "Staphylococcus lugdunensis"
    ]
  },
  {
    label: "Cocos Gram Positivos (Streptococcus/Enterococcus)",
    options: [
      "Streptococcus pyogenes (Grupo A)",
      "Streptococcus agalactiae (Grupo B)",
      "Streptococcus pneumoniae",
      "Streptococcus anginosus",
      "Streptococcus Viridans Group",
      "Enterococcus faecalis",
      "Enterococcus faecium"
    ]
  },
  {
    label: "Fastidiosos / Otros",
    options: [
      "Haemophilus influenzae",
      "Moraxella catarrhalis",
      "Neisseria meningitidis",
      "Neisseria gonorrhoeae",
      "Bacteroides fragilis"
    ]
  }
];

// --- COMPONENTE PRINCIPAL ---

const App: React.FC = () => {
  // Estados del Paciente y Muestra
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    documentId: '',
    orderNumber: '',
    insurance: '',
    age: '',
    condition: ''
  });
  const [microorganism, setMicroorganism] = useState<string>('');
  const [sampleType, setSampleType] = useState<string>('Urocultivo');
  
  // Estados del Panel
  const [currentPanelName, setCurrentPanelName] = useState<string>('Enterobacterias');
  const [panelInputs, setPanelInputs] = useState<Record<string, string>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResponse> | null>(null);

  // --- LÓGICA DE CAMBIO AUTOMÁTICO DE PANEL ---
  useEffect(() => {
    if (!microorganism) return;

    const microLower = microorganism.toLowerCase();
    // Default fallback
    let targetPanel = "Enterobacterias"; 

    // Find matching panel in configuration
    const match = MICRO_PANEL_MAP.find(entry => 
      entry.keywords.some(k => microLower.includes(k))
    );

    if (match) {
      targetPanel = match.panel;
    }

    setCurrentPanelName(targetPanel);
    setPanelInputs({});
    setAnalysisResults(null);
  }, [microorganism]);

  // --- MANEJADORES ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePanelInput = (antibiotic: string, value: string) => {
    setPanelInputs(prev => ({
      ...prev,
      [antibiotic]: value
    }));
  };

  const handlePanelSubmit = () => {
    if (!microorganism) {
      alert("Por favor seleccione un microorganismo.");
      return;
    }

    // Convert inputs string to numbers
    const numericInputs: Record<string, number> = {};
    Object.entries(panelInputs).forEach(([key, val]) => {
      if (val && !isNaN(Number(val))) {
        numericInputs[key] = Number(val);
      }
    });

    if (Object.keys(numericInputs).length === 0) {
      alert("Ingrese al menos un valor de halo.");
      return;
    }

    const results = evaluatePanel(numericInputs, microorganism, AntibioticMethod.DIFFUSION, false);
    setAnalysisResults(results);
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Reseteo completo
    setPatientInfo({
      name: '',
      documentId: '',
      orderNumber: '',
      insurance: '',
      age: '',
      condition: ''
    });
    setMicroorganism('');
    setSampleType('Urocultivo');
    setPanelInputs({});
    setAnalysisResults(null);
    setCurrentPanelName('Enterobacterias');
    
    // Scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const handleDownloadWord = () => {
    // 1. Validación previa
    if (!analysisResults || !microorganism) {
      alert("No hay resultados para exportar. Realice un análisis primero.");
      return;
    }

    // 2. Mapeo de resultados para el formato de reporte
    const resultadosMapeados: ReportResultItem[] = Object.values(analysisResults).map(res => ({
      antibiotic: res.antibioticName || "Desconocido",
      halo_mm: panelInputs[res.antibioticName!] || "-",
      interpretacion: res.classification,
      advertencia_clinica: res.note,
      criterio: res.criterion,
      mecanismo: res.mechanism
    }));

    // 3. Detección de Alerta Global (ej. MRSA, VRE)
    let globalAlert: string | null = null;
    const criticalResult = Object.values(analysisResults).find(r => r.criticalRule || r.mechanism === "MecA Positivo" || r.mechanism === "Cepa VRE");
    
    if (criticalResult) {
      if (criticalResult.criticalRule) globalAlert = criticalResult.criticalRule;
      else if (criticalResult.mechanism) globalAlert = criticalResult.mechanism;
    }

    // 4. Construcción del Objeto Final
    const reporte: ReporteFinal = {
      paciente: {
        nombre: patientInfo.name,
        id_muestra: patientInfo.documentId,
        nro_orden: patientInfo.orderNumber,
        obra_social: patientInfo.insurance,
        fecha: new Date().toLocaleDateString(),
        origen_muestra: sampleType,
        edad: patientInfo.age
      },
      analisis_bacteria: {
        nombre: microorganism,
        grupo: currentPanelName
      },
      resultados: resultadosMapeados,
      alerta_global: globalAlert
    };

    // 5. Llamada al servicio que genera el .doc
    imprimirReporteWord(reporte);
  };

  const handleOpenTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    const blob = new Blob([TERMINOS_Y_CONDICIONES], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleOpenAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const blob = new Blob([TEXTO_ACERCA_DE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Helper para Badges de resultados
  const getResultBadge = (result: AnalysisResponse) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (result.classification === ClassificationResult.SENSITIVE) colorClass = "bg-medical-100 text-medical-800 border border-medical-200";
    else if (result.classification === ClassificationResult.INTERMEDIATE) colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-200";
    else if (result.classification === ClassificationResult.RESISTANT) colorClass = "bg-red-100 text-red-800 border border-red-200";
    else if (result.classification === ClassificationResult.INDETERMINATE) colorClass = "bg-orange-100 text-orange-800 border border-orange-200";
    else if (result.classification === ClassificationResult.INVALID) colorClass = "bg-stone-800 text-white border border-stone-600";

    return (
      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${colorClass}`}>
        {result.classification.replace(/\(.\)/g, '')}
        {result.isForced && <span className="ml-1 text-[10px] bg-white/30 px-1 rounded" title="Interpretación forzada por regla experta">⚠️</span>}
        {result.isIntrinsic && <span className="ml-1 text-[10px] bg-white/30 px-1 rounded" title="Resistencia Intrínseca">NAT</span>}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20 font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-medical-800 text-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              {/* Icono Placa de Petri */}
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <circle cx="12" cy="12" r="10" />
                 {/* Discos de Antibióticos en disposición triangular/simétrica */}
                 <circle cx="12" cy="6" r="2" fill="currentColor" className="opacity-90" />
                 <circle cx="16.5" cy="15" r="2" fill="currentColor" className="opacity-90" />
                 <circle cx="7.5" cy="15" r="2" fill="currentColor" className="opacity-90" />
                 {/* Halo de inhibición sutil */}
                 <path d="M12 4a8 8 0 0 1 8 8" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-50" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Antibiograma Manual</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <span>🗑️</span> Limpiar Datos
            </button>
            <button type="button" onClick={handleDownloadWord} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
              <span>📄</span> Descargar Word (.doc)
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-5xl flex-grow">
        
        {/* FORMULARIO PACIENTE (PANTALLA) */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-medical-800 mb-4 flex items-center gap-2 border-b pb-2">
            <span>👤</span> Datos del Paciente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input type="text" name="name" autoComplete="off" placeholder="Nombre y Apellido" value={patientInfo.name} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 w-full text-base focus:ring-2 focus:ring-medical-500 outline-none bg-white" />
             <input type="text" name="documentId" autoComplete="off" placeholder="DNI / ID" value={patientInfo.documentId} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 w-full text-base focus:ring-2 focus:ring-medical-500 outline-none bg-white" />
             <input type="text" name="orderNumber" autoComplete="off" placeholder="Nro de Orden" value={patientInfo.orderNumber} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 w-full text-base focus:ring-2 focus:ring-medical-500 outline-none bg-white" />
             <input type="text" name="insurance" autoComplete="off" placeholder="Obra Social / Seguro" value={patientInfo.insurance} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 w-full text-base focus:ring-2 focus:ring-medical-500 outline-none bg-white" />
             <input type="text" name="age" autoComplete="off" placeholder="Edad" value={patientInfo.age} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 w-full text-base focus:ring-2 focus:ring-medical-500 outline-none bg-white" />
             <input type="text" name="condition" autoComplete="off" placeholder="Enfermedad de base (Opcional)" value={patientInfo.condition} onChange={handleInputChange} className="border border-gray-300 rounded px-3 py-2 w-full text-base focus:ring-2 focus:ring-medical-500 outline-none bg-white" />
          </div>
        </section>

        {/* BARRA DE CONFIGURACIÓN */}
        <section className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-medical-800 mb-4 flex items-center gap-2 border-b pb-2">
            <span>🔬</span> Configuración del Análisis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MICROORGANISMO */}
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">Microorganismo Identificado</label>
              <select 
                value={microorganism} 
                onChange={(e) => setMicroorganism(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-base focus:ring-2 focus:ring-medical-500 outline-none shadow-sm"
              >
                <option value="">-- Seleccionar --</option>
                {MICROORGANISM_OPTIONS.map((group, idx) => (
                  <optgroup key={idx} label={group.label}>
                    {group.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {currentPanelName && microorganism && (
                <p className="text-xs text-medical-600 mt-1 font-medium bg-medical-50 inline-block px-2 py-1 rounded">
                  Panel Activo: {currentPanelName}
                </p>
              )}
            </div>

            {/* TIPO DE MUESTRA */}
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">Tipo de Muestra</label>
              <select 
                value={sampleType} 
                onChange={(e) => setSampleType(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-base focus:ring-2 focus:ring-medical-500 outline-none shadow-sm"
              >
                {SAMPLE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* TABLA DE CARGA DE DATOS (PANEL) */}
        {microorganism && (
          <section className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-8">
            <div className="bg-medical-50 px-6 py-4 border-b border-medical-100 flex justify-between items-center">
               <div>
                  <h2 className="text-lg font-bold text-medical-900">Resultados de Difusión</h2>
                  <p className="text-sm text-medical-700">Ingrese los halos medidos en mm</p>
               </div>
               <div className="text-sm font-mono bg-white px-3 py-1 rounded border border-medical-200 text-medical-800">
                  Método: Difusión (Halo mm)
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-100 text-stone-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 md:px-6 py-3 font-bold border-b">Antibiótico</th>
                    <th className="px-4 md:px-6 py-3 font-bold border-b w-32 md:w-40 text-center">Halo (mm)</th>
                    <th className="px-4 md:px-6 py-3 font-bold border-b">Interpretación Preliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {PANEL_DEFINITIONS[currentPanelName]?.map((antibiotic, index) => {
                     const inputValue = panelInputs[antibiotic] || '';
                     const result = analysisResults?.[antibiotic];
                     
                     return (
                      <tr key={index} className="hover:bg-medical-50/30 transition-colors">
                        <td className="px-4 md:px-6 py-3 text-sm font-medium text-stone-800">
                          {antibiotic}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            autoComplete="off"
                            value={inputValue}
                            onChange={(e) => handlePanelInput(antibiotic, e.target.value)}
                            className="w-20 md:w-24 border border-stone-300 rounded px-2 py-1 text-center font-mono text-base bg-white focus:ring-2 focus:ring-medical-500 outline-none shadow-inner"
                            placeholder="mm"
                          />
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          {result ? (
                             <div className="flex items-center gap-2">
                                {getResultBadge(result)}
                                {result.note && <InfoTooltip text={result.note} />}
                             </div>
                          ) : (
                            <span className="text-stone-300 text-xs italic">-</span>
                          )}
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button 
                type="button"
                onClick={handlePanelSubmit}
                className="bg-medical-600 hover:bg-medical-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              >
                <span>🚀</span> Analizar Panel Completo
              </button>
            </div>
          </section>
        )}

        {/* RESULTADOS FINALES (IMPRESIÓN) */}
        {analysisResults && (
          <section className="bg-white rounded-none md:rounded-xl shadow-none md:shadow-lg border-none md:border border-stone-200 overflow-hidden mb-8">
            <div className="bg-stone-800 text-white px-6 py-3">
              <h3 className="font-bold text-lg uppercase">Antibiograma - Resultados Validados</h3>
            </div>
            
            <div className="p-0 md:p-6">
               <table className="w-full text-left border-collapse border border-stone-200">
                 <thead className="bg-stone-100 text-stone-800 text-xs uppercase">
                   <tr>
                     <th className="px-3 py-2 border border-stone-200">Antibiótico</th>
                     <th className="px-3 py-2 border border-stone-200 text-center w-24">Halo (mm)</th>
                     <th className="px-3 py-2 border border-stone-200 w-32">Interp.</th>
                     <th className="px-3 py-2 border border-stone-200">Criterio / Notas</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                    {Object.values(analysisResults).map((res, idx) => (
                      <tr key={idx} className="border-b border-stone-100">
                        <td className="px-3 py-2 border-r border-stone-200 font-medium">{res.antibioticName}</td>
                        <td className="px-3 py-2 border-r border-stone-200 text-center font-mono">
                          {panelInputs[res.antibioticName!] || '-'}
                        </td>
                        <td className="px-3 py-2 border-r border-stone-200 font-bold">
                           {res.classification.includes("Resistente") ? (
                             <span className="text-red-700">R</span>
                           ) : res.classification.includes("Sensible") ? (
                             <span className="text-green-700">S</span>
                           ) : res.classification.includes("Intermedio") ? (
                             <span className="text-yellow-600">I</span>
                           ) : (
                             <span className="text-stone-500">?</span>
                           )}
                           {res.isForced && <span className="text-[10px] align-top ml-1">*</span>}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <div className="font-mono text-stone-500">{res.criterion}</div>
                          {res.mechanism && (
                            <div className="text-purple-700 font-bold italic block mt-1">
                               Mec: {res.mechanism}
                            </div>
                          )}
                          {res.note && (
                            <div className="text-stone-600 italic mt-1">
                               Nota: {res.note}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
               
               <div className="mt-4 text-xs text-stone-500 border-t pt-2">
                  <p>* Resultados basado en reglas CLSI/EUCAST.</p>
                  <p>Interpretación: S=Sensible, I=Intermedio, R=Resistente.</p>
               </div>
            </div>
          </section>
        )}

      </main>

      {/* FOOTER LEGAL */}
      <footer className="w-full py-6 mt-8 bg-stone-100 border-t border-stone-200 text-center text-sm text-stone-600">
        <p className="mb-2">
          Al usar esta herramienta usted acepta los{' '}
          <button 
            type="button"
            onClick={handleOpenTerms} 
            className="text-medical-700 font-bold hover:underline focus:outline-none"
          >
            términos y condiciones de uso
          </button>.
        </p>
        <div className="mb-2">
          <button 
            type="button"
            onClick={handleOpenAbout} 
            className="text-medical-600 font-medium hover:text-medical-800 focus:outline-none border border-medical-200 px-3 py-1 rounded-full text-xs transition-colors bg-white shadow-sm hover:shadow"
          >
            ☕ Acerca de / Colaborar
          </button>
        </div>
        <p className="text-xs text-stone-400">© 2025 Antibiograma Manual - Uso exclusivo profesional.</p>
      </footer>
    </div>
  );
};

export default App;
