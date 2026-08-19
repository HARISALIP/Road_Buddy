import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Asset from '@/models/Asset';
import { logActivity } from '@/lib/activity';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const partnerId = searchParams.get('partnerId');
    const vehicleId = searchParams.get('vehicleId');
    const personId = searchParams.get('personId');
    const paymentMethod = searchParams.get('paymentMethod');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (type && type !== 'all') filter.transactionType = type;
    if (categoryId) filter.categoryId = categoryId;
    if (partnerId) filter.partnerId = partnerId;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (personId) filter.personId = personId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (dateFrom || dateTo) {
      filter.transactionDate = {};
      if (dateFrom) filter.transactionDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.transactionDate.$lte = to;
      }
    }

    if (search) {
      filter.$or = [
        { remarks: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const transactions = await Transaction.find(filter)
      .populate('categoryId', 'name type')
      .populate('partnerId', 'name profitSharePercentage')
      .populate('personId', 'name')
      .populate('vehicleId', 'name registrationNumber')
      .populate('jobId', 'jobNumber customerName')
      .populate('assetId', 'name')
      .sort({ transactionDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: transactions.length, transactions });
  } catch (error: unknown) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      transactionType,
      transactionDate,
      amount,
      categoryId,
      partnerId,
      personId,
      vehicleId,
      jobId,
      assetId,
      invoiceNumber,
      paymentMethod,
      profitPeriod,
      reason,
      customerName,
      remarks,
      attachmentUrl,
    } = body;

    // Server-side validations
    if (!transactionType) {
      return NextResponse.json({ error: 'Transaction type is required' }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (transactionType === 'investment' && !partnerId) {
      return NextResponse.json({ error: 'Partner is required for Investment' }, { status: 400 });
    }
    if (transactionType === 'withdrawal' && !partnerId) {
      return NextResponse.json({ error: 'Partner is required for Withdrawal' }, { status: 400 });
    }
    if (transactionType === 'dividend' && !partnerId) {
      return NextResponse.json({ error: 'Partner is required for Dividend' }, { status: 400 });
    }
    if (transactionType === 'asset_sale' && !assetId) {
      return NextResponse.json({ error: 'Asset is required for Asset Sale' }, { status: 400 });
    }
    if ((transactionType === 'expense' || transactionType === 'income') && !categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const newTx = await Transaction.create({
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      transactionType,
      amount: parsedAmount,
      categoryId: categoryId || undefined,
      partnerId: partnerId || undefined,
      personId: personId || undefined,
      vehicleId: vehicleId || undefined,
      jobId: jobId || undefined,
      assetId: assetId || undefined,
      invoiceNumber: invoiceNumber || '',
      paymentMethod: paymentMethod || 'Cash',
      profitPeriod: profitPeriod || '',
      reason: reason || '',
      customerName: customerName || '',
      remarks: remarks || '',
      attachmentUrl: attachmentUrl || '',
      status: 'active',
    });

    // If Asset Sale, update the Asset model status to 'sold'
    if (transactionType === 'asset_sale' && assetId) {
      await Asset.findByIdAndUpdate(assetId, {
        status: 'sold',
        saleDate: transactionDate ? new Date(transactionDate) : new Date(),
        saleAmount: parsedAmount,
      });
    }

    await logActivity(
      'CREATE',
      'Transaction',
      `Added ${transactionType} of ${parsedAmount}`,
      newTx._id
    );

    return NextResponse.json({ success: true, transaction: newTx }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to create transaction' }, { status: 500 });
  }
}
