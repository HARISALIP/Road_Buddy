import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET() {
  try {
    await connectToDatabase();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, jobs });
  } catch (error: unknown) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { jobNumber, customerName, description, invoiceNumber } = await req.json();

    if (!jobNumber) return NextResponse.json({ error: 'Job number is required' }, { status: 400 });

    const job = await Job.create({
      jobNumber,
      customerName: customerName || '',
      description: description || '',
      invoiceNumber: invoiceNumber || '',
      status: 'active',
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
