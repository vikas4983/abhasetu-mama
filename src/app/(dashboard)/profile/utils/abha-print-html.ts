/**
 * @file        abha-print-html.ts
 * @description Inline print styles and window builder for ABHA card (full page + PVC on A4)
 * @module      profile/utils
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

const PRINT_COLOR_EXACT = `
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
`;

/** @description Minimal overrides — AbhaCardComponent uses inline styles for fidelity */
const PRINT_BASE_RULES = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: 'Inter', 'Roboto', sans-serif;
    ${PRINT_COLOR_EXACT}
  }
  button, [role="button"] { display: none !important; }
  img { max-width: 100%; }
`;

/** @description Full-page print — front + back on one A4 sheet, enlarged */
export const ABHA_FULL_PAGE_PRINT_STYLES = `
  @page { size: A4 portrait; margin: 10mm; }
  ${PRINT_BASE_RULES}
  .print-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8mm;
    align-items: center;
    width: 100%;
    page-break-inside: avoid;
  }
  .printable-abha-card, .pvc-back-card {
    width: 100% !important;
    max-width: 175mm !important;
    min-height: 108mm !important;
    border-radius: 4mm !important;
    overflow: hidden !important;
    page-break-inside: avoid;
  }
`;

/**
 * @description PVC print on A4 — front + back together, enlarged CR-80 ratio (~170mm wide)
 */
export const ABHA_PVC_PRINT_STYLES = `
  @page { size: A4 portrait; margin: 10mm; }
  ${PRINT_BASE_RULES}
  .pvc-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 10mm;
    width: 100%;
    min-height: 100vh;
    padding: 4mm 0;
  }
  .printable-abha-card, .pvc-back-card {
    width: 170mm !important;
    max-width: 170mm !important;
    min-height: 107mm !important;
    height: auto !important;
    border-radius: 4mm !important;
    overflow: hidden !important;
    page-break-inside: avoid;
    flex-shrink: 0;
  }
  .printable-abha-card-header, .setu-abha-card-header {
    background: #264488 !important;
    border-bottom: 2px solid #00d4aa !important;
    color: #ffffff !important;
    ${PRINT_COLOR_EXACT}
  }
  .printable-abha-card-body, .setu-abha-card-body {
    background: radial-gradient(circle, #ffffff 0%, #f1f5f9 100%) !important;
    ${PRINT_COLOR_EXACT}
  }
  .pvc-back-card {
    background: radial-gradient(circle, #ffffff 0%, #f8fafc 100%) !important;
    ${PRINT_COLOR_EXACT}
  }
`;

/**
 * @description Open print window with front + back HTML and inline styles
 */
export function openAbhaPrintWindow(params: {
  title: string;
  styles: string;
  frontHtml: string;
  backHtml: string;
  wrapperClass?: string;
}): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const wrapperClass = params.wrapperClass ?? 'print-wrapper';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <base href="${origin}/" />
        <title>${params.title}</title>
        <style>${params.styles}</style>
      </head>
      <body>
        <div class="${wrapperClass}">
          ${params.frontHtml}
          ${params.backHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
