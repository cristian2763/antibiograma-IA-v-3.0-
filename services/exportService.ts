import { ReporteFinal } from "../types";

// Función principal para exportar a Word con estilos
export const imprimirReporteWord = (data: ReporteFinal) => {
  // Paleta de colores (Medical Green) coincidente con la App
  const colors = {
    primary: "#166534", // green-800
    secondary: "#166534", // green-700
    light: "#f0fdf4", // green-50
    border: "#bbf7d0", // green-200
    text: "#1c1917", // stone-900
    redText: "#dc2626", // red-600
    redBg: "#fef2f2",
    orangeText: "#166534", // amber-600
    greenText: "#166534", // green-700
    grayText: "#57534e"
  };

  // Construcción de las filas de la tabla
  const filasTabla = data.resultados.map((item, index) => {
    const interpretacion = item.interpretacion ? item.interpretacion.toUpperCase() : "";
    let colorTexto = "#000000";
    let fontWeight = "normal";
    let bgColor = index % 2 === 0 ? "#ffffff" : "#f7fee7"; // Alternar blanco y verde muy suave

    // Lógica de colores clínicos
    if (interpretacion.includes("R") || interpretacion.includes("RESISTENTE")) {
      colorTexto = colors.redText; 
      bgColor = colors.redBg; 
      fontWeight = "bold";
    } else if (interpretacion.includes("I") || interpretacion.includes("INTERMEDIO")) {
      colorTexto = colors.orangeText;
      fontWeight = "bold";
    } else if (interpretacion.includes("S") || interpretacion.includes("SENSIBLE")) {
      colorTexto = colors.greenText;
      fontWeight = "bold";
    } else if (interpretacion.includes("INVALIDO") || interpretacion.includes("INVÁLIDO") || interpretacion.includes("NO CONCLUYENTE")) {
        colorTexto = colors.grayText;
        fontWeight = "bold";
    }

    // Estilos inline explícitos para celdas
    return `
      <tr style="background-color: ${bgColor};">
        <td style="border-bottom: 1px solid ${colors.border}; padding: 8px; font-family: Arial, sans-serif; font-size: 10pt; color: #333333; font-weight: bold;">
          ${item.antibiotic}
        </td>
        <td style="border-bottom: 1px solid ${colors.border}; padding: 8px; font-family: Arial, sans-serif; font-size: 10pt; text-align: center;">
          ${item.halo_mm}
        </td>
        <td style="border-bottom: 1px solid ${colors.border}; padding: 8px; font-family: Arial, sans-serif; font-size: 10pt; text-align: center; font-weight: ${fontWeight}; color: ${colorTexto};">
          ${item.interpretacion}
        </td>
        <td style="border-bottom: 1px solid ${colors.border}; padding: 8px; font-family: Arial, sans-serif; font-size: 9pt; color: #555555;">
          ${item.mecanismo ? `<span style="color: #7e22ce; font-weight: bold; font-style: italic;">Mec: ${item.mecanismo}</span><br/>` : ''}
          ${item.advertencia_clinica ? `<span>Nota: ${item.advertencia_clinica}</span>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  // Construcción del HTML completo optimizado para Word
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="ProgId" content="Word.Document">
      <title>Informe Microbiológico</title>
      <style>
        /* Estilos CSS Base compatibles con Word */
        @page WordSection1 {
            size: 595.3pt 841.9pt; /* A4 */
            margin: 70.85pt 70.85pt 70.85pt 70.85pt;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #1c1917; margin: 0; padding: 0; }
        table { border-collapse: collapse; width: 100%; mso-yfti-tbllook: 1184; }
        td, th { vertical-align: top; }
        .label { font-weight: bold; color: ${colors.primary}; width: 160px; font-size: 10pt; text-transform: uppercase; }
        .data { font-weight: bold; color: #000000; font-size: 11pt; }
      </style>
    </head>
    <body lang=ES-AR style='tab-interval:35.4pt'>
      <div class=WordSection1>
        
        <!-- ENCABEZADO VERDE -->
        <table style="width: 100%; background-color: ${colors.primary}; margin-bottom: 30px;">
            <tr>
                <td style="padding: 30px; text-align: center;">
                    <p style="font-family: Arial, sans-serif; font-size: 24pt; font-weight: bold; color: white; text-transform: uppercase; margin: 0;">INFORME MICROBIOLÓGICO</p>
                    <p style="font-family: Arial, sans-serif; font-size: 12pt; color: #f0fdf4; margin-top: 5px; margin-bottom: 0;">Validación de Antibiograma Manual</p>
                    <p style="font-family: Arial, sans-serif; color: #bbf7d0; font-size: 10pt; margin-top: 10px; margin-bottom: 0;">Fecha de Emisión: ${data.paciente.fecha}</p>
                </td>
            </tr>
        </table>

        <!-- SECCIÓN: DATOS DEL PACIENTE -->
        <div style="border-bottom: 2px solid ${colors.primary}; margin-bottom: 15px;">
            <span style="font-family: Arial, sans-serif; font-size: 14pt; font-weight: bold; color: ${colors.primary}; text-transform: uppercase;">Datos del Paciente</span>
        </div>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px;" class="label">PACIENTE:</td>
            <td style="padding: 5px;" class="data">${data.paciente.nombre || "NO REGISTRADO"}</td>
            <td style="padding: 5px;" class="label">EDAD:</td>
            <td style="padding: 5px;" class="data">${data.paciente.edad || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 5px;" class="label">DOCUMENTO:</td>
            <td style="padding: 5px;" class="data">${data.paciente.id_muestra || "-"}</td>
            <td style="padding: 5px;" class="label">OBRA SOCIAL:</td>
            <td style="padding: 5px;" class="data">${data.paciente.obra_social || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 5px;" class="label">NRO ORDEN:</td>
            <td style="padding: 5px;" class="data">${data.paciente.nro_orden || "-"}</td>
            <td></td><td></td>
          </tr>
        </table>

        <!-- SECCIÓN: ANÁLISIS -->
        <div style="border-bottom: 2px solid ${colors.primary}; margin-bottom: 15px; margin-top: 30px;">
            <span style="font-family: Arial, sans-serif; font-size: 14pt; font-weight: bold; color: ${colors.primary}; text-transform: uppercase;">Análisis de Muestra</span>
        </div>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; margin-bottom: 20px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px; width: 160px; font-family: Arial, sans-serif; font-weight: bold; color: ${colors.secondary};">TIPO MUESTRA:</td>
              <td style="padding: 5px; font-family: Arial, sans-serif; text-transform: uppercase; font-weight: bold;">${data.paciente.origen_muestra}</td>
            </tr>
            <tr>
              <td style="padding: 5px; width: 160px; font-family: Arial, sans-serif; font-weight: bold; color: ${colors.secondary};">MICROORGANISMO:</td>
              <td style="padding: 5px; font-family: Arial, sans-serif; font-style: italic; font-weight: bold; font-size: 12pt;">${data.analisis_bacteria.nombre}</td>
            </tr>
            <tr>
              <td style="padding: 5px; width: 160px; font-family: Arial, sans-serif; font-weight: bold; color: ${colors.secondary};">PANEL:</td>
              <td style="padding: 5px; font-family: Arial, sans-serif; color: #555;">${data.analisis_bacteria.grupo}</td>
            </tr>
          </table>
        </div>

        <!-- SECCIÓN: ALERTA GLOBAL (Si existe) -->
        ${data.alerta_global ? `
          <div style="border: 2px solid #dc2626; background-color: #fef2f2; padding: 15px; text-align: center; margin-bottom: 20px;">
            <p style="font-family: Arial, sans-serif; color: #dc2626; font-weight: bold; margin: 0; font-size: 12pt;">⚠️ ALERTA CLÍNICA IMPORTANTE</p>
            <p style="font-family: Arial, sans-serif; color: #b91c1c; margin: 5px 0 0 0;">${data.alerta_global}</p>
          </div>
        ` : ''}

        <!-- SECCIÓN: ANTIBIOGRAMA -->
        <div style="border-bottom: 2px solid ${colors.primary}; margin-bottom: 15px; margin-top: 30px;">
            <span style="font-family: Arial, sans-serif; font-size: 14pt; font-weight: bold; color: ${colors.primary}; text-transform: uppercase;">Antibiograma</span>
        </div>
        <table style="width: 100%; border: 1px solid ${colors.primary};">
          <thead>
            <tr style="background-color: ${colors.primary}; color: white;">
              <th style="padding: 10px; text-align: left; width: 35%; font-family: Arial, sans-serif; font-weight: bold;">Antibiótico</th>
              <th style="padding: 10px; text-align: center; width: 15%; font-family: Arial, sans-serif; font-weight: bold;">Halo (mm)</th>
              <th style="padding: 10px; text-align: center; width: 20%; font-family: Arial, sans-serif; font-weight: bold;">Interpretación</th>
              <th style="padding: 10px; text-align: left; width: 30%; font-family: Arial, sans-serif; font-weight: bold;">Notas / Mecanismo</th>
            </tr>
          </thead>
          <tbody>
            ${filasTabla}
          </tbody>
        </table>

        <!-- PIE DE PÁGINA -->
        <div style="margin-top: 50px; border-top: 1px solid #bbf7d0; padding-top: 10px; text-align: center; font-size: 9pt; color: #78716c;">
          <p style="margin: 0; font-family: Arial, sans-serif;">Este informe ha sido generado electrónicamente.</p>
          <p style="margin: 0; font-family: Arial, sans-serif;">Interpretación basada en puntos de corte (CLSI / EUCAST).</p>
        </div>

      </div>
    </body>
    </html>
  `;

  // 3. // Crear Blob HTML y descargar
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const safeName = (data.paciente.nombre || "Paciente").replace(/[^a-zA-Z0-9]/g, "_");
  link.href = url;
  link.download = `Reporte_${safeName}_${new Date().toISOString().split('T')[0]}.html`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
