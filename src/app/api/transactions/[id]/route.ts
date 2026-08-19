import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const transaction = await Transaction.findById(params.id)
      .populate('categoryId')
      .populate('partnerId')
      .populate('personId')
      .populate('vehicleId')
      .populate('jobId')
      .populate('assetId');

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: unknown) {
    console.error('Fetch transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (body.amount !== undefined) {
      const parsedAmount = Number(body.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
      }
      body.amount = parsedAmount;
    }

    if (body.transactionDate) {
      body.transactionDate = new Date(body.transactionDate);
    }

    const updated = await Transaction.findByIdAndUpdate(params.id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error: unknown) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    // Void instead of permanent delete for financial audit preservation
    const voided = await Transaction.findByIdAndUpdate(params.id, { status: 'void' }, { new: true });
    if (!voided) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, transaction: voided });
  } catch (error: unknown) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Failed to void transaction' }, { status: 500 });
  }
}
