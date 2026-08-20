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

    const transactions = await Transaction.find()
      .populate('categoryId', 'name type')
      .populate('partnerId', 'name profitSharePercentage')
      .populate('personId', 'name')
      .populate('vehicleId', 'name')
      .populate('jobId', 'jobNumber customerName')
      .populate('assetId', 'name')
      .sort({ transactionDate: -1, createdAt: -1 })
      .lean();

    const partners = await Partner.find({ status: 'active' }).lean();

    const metrics = calculateDashboardMetrics(transactions);
    const partnerSummary = calculatePartnerSummary(
      partners.map((p) => ({ _id: p._id.toString(), name: p.name, profitSharePercentage: p.profitSharePercentage })),
      transactions
    );

    const recentTransactions = transactions.slice(0, 10);

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
