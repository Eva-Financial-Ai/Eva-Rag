import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Transaction } from '../pages/TransactionSummary';
import { performanceMonitor } from '../services/performanceMonitoring';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToCSV = (data: Transaction[], filename: string = 'transactions') => {
  const startTime = Date.now();

  try {
    // Define CSV headers
    const headers = [
      'Transaction ID',
      'Borrower Name',
      'Type',
      'Amount',
      'Status',
      'Stage',
      'Priority',
      'Progress %',
      'Days in Stage',
      'Created Date',
      'Updated Date',
      'Loan Officer',
      'Underwriter',
      'Processor',
      'Next Action',
      'Risk Score',
      'Est. Close Date',
    ];

    // Convert transactions to CSV rows
    const rows = data.map(t => [
      t.id,
      t.borrowerName,
      t.type,
      t.amount,
      t.status,
      t.stage,
      t.priority,
      t.completionPercentage,
      t.daysInStage,
      t.createdAt,
      t.updatedAt,
      t.loanOfficer || '',
      t.underwriter || '',
      t.processor || '',
      t.nextAction,
      t.riskScore || '',
      t.estimatedCloseDate || '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track performance
    const duration = Date.now() - startTime;
    performanceMonitor.trackExport('csv', blob.size, duration, true);
  } catch (error) {
    console.error('CSV export failed:', error);
    const duration = Date.now() - startTime;
    performanceMonitor.trackExport('csv', 0, duration, false);
    throw error;
  }
};

export const exportToPDF = (data: Transaction[], title: string = 'Transaction Report') => {
  const startTime = Date.now();

  try {
    const doc = new jsPDF('landscape');

    // Add title
    doc.setFontSize(20);
    doc.text(title, 14, 22);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare table data
    const tableHeaders = [
      'ID',
      'Borrower',
      'Type',
      'Amount',
      'Status',
      'Priority',
      'Progress',
      'Days',
      'Officer',
      'Next Action',
    ];

    const tableData = data.map(t => [
      t.id,
      t.borrowerName,
      t.type,
      `$${t.amount.toLocaleString()}`,
      t.status,
      t.priority,
      `${t.completionPercentage}%`,
      t.daysInStage.toString(),
      t.loanOfficer || '-',
      t.nextAction.substring(0, 30) + (t.nextAction.length > 30 ? '...' : ''),
    ]);

    // Add table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 40 }, // Borrower
        2: { cellWidth: 30 }, // Type
        3: { cellWidth: 25 }, // Amount
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 20 }, // Priority
        6: { cellWidth: 20 }, // Progress
        7: { cellWidth: 15 }, // Days
        8: { cellWidth: 30 }, // Officer
        9: { cellWidth: 'auto' }, // Next Action
      },
    });

    // Add summary statistics
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.text('Summary Statistics', 14, finalY + 10);

    doc.setFontSize(10);
    const totalAmount = data.reduce((sum, t) => sum + t.amount, 0);
    const avgProgress = Math.round(
      data.reduce((sum, t) => sum + t.completionPercentage, 0) / data.length
    );

    doc.text(`Total Transactions: ${data.length}`, 14, finalY + 18);
    doc.text(`Total Pipeline Value: $${totalAmount.toLocaleString()}`, 14, finalY + 24);
    doc.text(`Average Progress: ${avgProgress}%`, 14, finalY + 30);

    // Group by status
    const statusCounts = data.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    let yPos = finalY + 38;
    doc.text('Status Distribution:', 14, yPos);
    Object.entries(statusCounts).forEach(([status, count]) => {
      yPos += 6;
      doc.text(`  ${status}: ${count} transactions`, 14, yPos);
    });

    // Save the PDF
    const pdfOutput = doc.output('blob');
    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    // Track performance
    const duration = Date.now() - startTime;
    performanceMonitor.trackExport('pdf', pdfOutput.size, duration, true);
  } catch (error) {
    console.error('PDF export failed:', error);
    const duration = Date.now() - startTime;
    performanceMonitor.trackExport('pdf', 0, duration, false);
    throw error;
  }
};

export const exportToJSON = (data: Transaction[], filename: string = 'transactions') => {
  const startTime = Date.now();

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Track performance
    const duration = Date.now() - startTime;
    performanceMonitor.trackExport('json', blob.size, duration, true);
  } catch (error) {
    console.error('JSON export failed:', error);
    const duration = Date.now() - startTime;
    performanceMonitor.trackExport('json', 0, duration, false);
    throw error;
  }
};
