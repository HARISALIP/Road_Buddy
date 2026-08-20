import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Partner from '@/models/Partner';
import Category from '@/models/Category';
import Person from '@/models/Person';
import Vehicle from '@/models/Vehicle';
import Job from '@/models/Job';
import Asset from '@/models/Asset';
import { calculateDashboardMetrics, calculatePartnerSummary } from '@/lib/calculations';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch only recent 10 transactions fully populated
    const recentTransactions = await Transaction.find()
      .populate('categoryId', 'name type')
      .populate('partnerId', 'name profitSharePercentage')
      .populate('personId', 'name')
      .populate('vehicleId', 'name')
      .populate('jobId', 'jobNumber customerName')
      .populate('assetId', 'name')
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch all transactions but ONLY with fields required for calculations
    const allTransactionsForMetrics = await Transaction.find(
      {},
      'status amount transactionDate transactionType partnerId'
    ).lean();

    const partners = await Partner.find({ status: 'active' }).lean();

    const metrics = calculateDashboardMetrics(allTransactionsForMetrics);
    const partnerSummary = calculatePartnerSummary(
      partners.map((p) => ({ _id: p._id.toString(), name: p.name, profitSharePercentage: p.profitSharePercentage })),
      allTransactionsForMetrics
    );

    return NextResponse.json({
      ...metrics,
      partnerSummary,
      recentTransactions,
    });
  } catch (error: unknown) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
