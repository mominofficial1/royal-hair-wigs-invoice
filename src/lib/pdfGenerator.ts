import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadInvoicePdf(elementId: string, invoiceNumber: number | string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Invoice preview element not found.');
  }

  // Create high-res canvas
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  // Calculate image height proportional to pdfWidth
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Multi-page handling if content exceeds single A4
  while (heightLeft > 5) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  const safeNum = String(invoiceNumber).replace(/[^a-zA-Z0-9_-]/g, '');
  pdf.save(`Royal-Hair-Wigs-Invoice-${safeNum}.pdf`);
}

export function printInvoice(): void {
  window.print();
}
