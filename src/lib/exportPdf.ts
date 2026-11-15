import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  summaryText?: string;
}

export function generatePdfReport(options: PdfReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner
  doc.setFillColor(20, 33, 61); // Navy #14213D
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Orange accent line
  doc.setFillColor(252, 163, 17); // Orange #FCA311
  doc.rect(0, 26, pageWidth, 2, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('StockSense', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(252, 163, 17);
  doc.text('Spare Part Inventory & Stock Management System', 14, 21);

  // Date / timestamp on right
  const now = new Date().toLocaleString();
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${now}`, pageWidth - 14, 17, { align: 'right' });

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 33, 61);
  doc.text(options.title, 14, 38);

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(74, 83, 104);
    doc.text(options.subtitle, 14, 44);
  }

  const startY = options.subtitle ? 48 : 42;

  // Render Table
  autoTable(doc, {
    startY,
    head: [options.headers],
    body: options.rows,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 33, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      textColor: [20, 33, 61],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 247],
    },
    footStyles: {
      fillColor: [252, 163, 17],
      textColor: [20, 33, 61],
      fontStyle: 'bold',
    },
  });

  // Summary footer if given
  if (options.summaryText) {
    const finalY = (doc as any).lastAutoTable?.finalY || 200;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 33, 61);
    doc.text(options.summaryText, 14, finalY + 10);
  }

  // Footer page numbering
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `StockSense Report | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`);
}
