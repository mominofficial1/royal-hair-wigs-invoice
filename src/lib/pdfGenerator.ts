import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadInvoicePdf(elementId: string, invoiceNumber: number | string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Invoice preview element not found. Please refresh and try again.');
  }

  // Save original style properties before capturing
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalBoxShadow = element.style.boxShadow;
  const originalBorder = element.style.border;

  try {
    // Temporarily reset zoom scale and decorations so canvas captures pristine A4 document
    element.style.transform = 'none';
    element.style.transformOrigin = 'top left';
    element.style.boxShadow = 'none';
    element.style.border = 'none';

    // Allow browser a render tick to apply style changes
    await new Promise((resolve) => setTimeout(resolve, 60));

    // Create high-res canvas at 2x resolution (optimal for A4 PDF quality & performance)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Standard A4 dimensions in mm: 210 x 297
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

    // Render first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Handle additional pages if content spans across multiple pages
    while (heightLeft > 5) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const safeNum = String(invoiceNumber).replace(/[^a-zA-Z0-9_-]/g, '');
    pdf.save(`Royal-Hair-Wigs-Invoice-${safeNum}.pdf`);
  } catch (err: any) {
    console.error('Error generating PDF:', err);
    throw new Error(err.message || 'Failed to generate PDF document.');
  } finally {
    // Restore original styles
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.boxShadow = originalBoxShadow;
    element.style.border = originalBorder;
  }
}

export function printInvoice(): void {
  window.print();
}
