import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Partner from '@/models/Partner';

export async function GET() {
  try {
    await connectToDatabase();
    const partners = await Partner.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, partners });
  } catch (error: unknown) {
    console.error('Fetch partners error:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, email, phone, profitSharePercentage } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Partner name is required' }, { status: 400 });
    }

    const partner = await Partner.create({
      name,
      email: email || '',
      phone: phone || '',
      profitSharePercentage: Number(profitSharePercentage) || 50,
      status: 'active',
    });

    return NextResponse.json({ success: true, partner }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create partner error:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
