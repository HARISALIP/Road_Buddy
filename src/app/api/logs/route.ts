import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // Fetch logs, sorted by newest first, limited to last 100 for performance
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    console.error('Fetch activity logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}
