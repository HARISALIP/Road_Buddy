import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { calculateDashboardMetrics } from '@/lib/calculations';
import { generatePdfReport } from '@/lib/pdf';

export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find()
      .populate('categoryId', 'name')
      .populate('partnerId', 'name')
      .sort({ transactionDate: -1 })
      .lean();

    const metrics = calculateDashboardMetrics(transactions as unknown as Array<Partial<import('@/models/Transaction').ITransaction>>);

    const now = new Date();
    const monthYearStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const formattedTx = transactions.slice(0, 30).map((t) => ({
      transactionDate: t.transactionDate ? new Date(t.transactionDate).toISOString() : '',
      transactionType: t.transactionType,
      categoryName: (t.categoryId as { name?: string })?.name,
      partnerName: (t.partnerId as { name?: string })?.name,
      amount: t.amount,
      remarks: t.remarks,
    }));

    const pdfBuffer = generatePdfReport(monthYearStr, metrics, formattedTx);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="road_buddy_report_${now.getMonth() + 1}_${now.getFullYear()}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('PDF report error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF report' }, { status: 500 });
  }
}
