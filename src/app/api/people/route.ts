import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Person from '@/models/Person';

export async function GET() {
  try {
    await connectToDatabase();
    const people = await Person.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, people });
  } catch (error: unknown) {
    console.error('Fetch people error:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, phone, role } = await req.json();

    if (!name) return NextResponse.json({ error: 'Person name is required' }, { status: 400 });

    const person = await Person.create({
      name,
      phone: phone || '',
      role: role || '',
      status: 'active',
    });

    return NextResponse.json({ success: true, person }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create person error:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
