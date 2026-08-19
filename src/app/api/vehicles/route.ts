import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';

export async function GET() {
  try {
    await connectToDatabase();
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, vehicles });
  } catch (error: unknown) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, registrationNumber } = await req.json();

    if (!name) return NextResponse.json({ error: 'Vehicle name is required' }, { status: 400 });

    const vehicle = await Vehicle.create({
      name,
      registrationNumber: registrationNumber || '',
      status: 'active',
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
