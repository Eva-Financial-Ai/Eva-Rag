import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF from a specified HTML element
 * @param element The DOM element to convert to PDF
 * @param filename The name of the PDF file (without extension)
 * @returns A Promise that resolves to a Blob containing the PDF data
 */
export const generatePdf = async (
  element: HTMLElement,
  filename: string = 'document'
): Promise<Blob> => {
  if (!element) {
    console.error('Element is null or undefined');
    throw new Error('Element is null or undefined');
  }

  try {
    const canvas = await html2canvas(element, {
      logging: false,
      useCORS: true,
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Return PDF as blob instead of saving
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 