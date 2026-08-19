import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { exportTransactionsToExcel } from '@/lib/excel';

export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find()
      .populate('categoryId', 'name')
      .populate('partnerId', 'name')
      .populate('personId', 'name')
      .populate('vehicleId', 'name')
      .populate('jobId', 'jobNumber')
      .populate('assetId', 'name')
      .sort({ transactionDate: -1 })
      .lean();

    const excelBuffer = exportTransactionsToExcel(transactions as unknown as Record<string, unknown>[]);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="road_buddy_transactions.xlsx"',
      },
    });
  } catch (error: unknown) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export transactions' }, { status: 500 });
  }
}
