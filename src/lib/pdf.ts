import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardMetrics } from './calculations';

export function generatePdfReport(
  monthYearStr: string,
  metrics: DashboardMetrics,
  transactions: Array<{
    transactionDate: string;
    transactionType: string;
    categoryName?: string;
    amount: number;
    remarks?: string;
    partnerName?: string;
  }>
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Brand Blue
  doc.text('ROAD BUDDY FINANCE', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Monthly Financial Report - ${monthYearStr}`, 14, 28);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

  // Divider
  doc.setDrawColor(220, 224, 230);
  doc.line(14, 38, 196, 38);

  // Financial Summary Cards Box
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Financial Summary', 14, 46);

  const summaryData = [
    ['Current Balance', `₹${metrics.currentBalance.toLocaleString()}`],
    ['Total Investment', `₹${metrics.totalInvestment.toLocaleString()}`],
    ['Total Operational Income', `₹${metrics.totalIncome.toLocaleString()}`],
    ['Total Operational Expenses', `₹${metrics.totalExpenses.toLocaleString()}`],
    ['Net Operating Profit', `₹${metrics.operatingProfit.toLocaleString()}`],
    ['Total Withdrawals', `₹${metrics.totalWithdrawals.toLocaleString()}`],
    ['Total Dividends', `₹${metrics.totalDividends.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 3 },
  });

  // Recent Transactions Table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 120;
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Transaction Details', 14, finalY);

  const tableRows = transactions.map((t) => [
    new Date(t.transactionDate).toLocaleDateString(),
    t.transactionType.toUpperCase(),
    t.categoryName || t.partnerName || '-',
    `₹${t.amount.toLocaleString()}`,
    t.remarks || '',
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Date', 'Type', 'Category / Partner', 'Amount', 'Remarks']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 2.5 },
  });

  return doc.output('arraybuffer');
}
