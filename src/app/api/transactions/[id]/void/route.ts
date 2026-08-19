import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const voided = await Transaction.findByIdAndUpdate(params.id, { status: 'void' }, { new: true });
    if (!voided) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, transaction: voided });
  } catch (error: unknown) {
    console.error('Void transaction error:', error);
    return NextResponse.json({ error: 'Failed to void transaction' }, { status: 500 });
  }
}
